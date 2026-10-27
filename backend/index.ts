import { createHash } from 'node:crypto';
import {
    router,
    json,
    error,
    requireAuth,
    db,
    isAppDatabaseError
} from '@appdeploy/sdk';

type CollectionName = 'ventures' | 'tasks' | 'integrations' | 'capabilities' | 'activity';
type WorkspaceState = Record<CollectionName, Array<Record<string, unknown>>>;
type StoredRecord = {
    sourceId: string;
    payload: Record<string, unknown>;
    updatedAt: string;
};
type BootstrapRecord = {
    status: 'in_progress' | 'complete';
    startedAt: string;
    completedAt?: string;
};

const COLLECTIONS: CollectionName[] = ['ventures', 'tasks', 'integrations', 'capabilities', 'activity'];
const MAX_ITEMS_PER_COLLECTION = 100;
const BATCH_SIZE = 40;
const MAX_ROW_BYTES = 220 * 1024;
const MAX_REQUEST_BYTES = 850 * 1024;

class InputValidationError extends Error {}
class WorkspaceConflictError extends Error {}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};
}

function userPartition(userId: string): string {
    return createHash('sha256').update(userId, 'utf8').digest('hex').slice(0, 32);
}

function tableFor(collection: CollectionName, partition: string): string {
    return 'abp_' + collection + '_' + partition;
}

function metaTableFor(partition: string): string {
    return 'abp_meta_' + partition;
}

function requireSourceId(value: unknown, collection: string): string {
    if (typeof value !== 'string' || !/^[A-Za-z0-9-]{1,120}$/.test(value)) {
        throw new InputValidationError(collection + ' contains a missing or invalid record ID.');
    }
    return value;
}

function validateWorkspace(value: unknown): WorkspaceState {
    const root = asRecord(value);
    if (Buffer.byteLength(JSON.stringify(value ?? {}), 'utf8') > MAX_REQUEST_BYTES) {
        throw new InputValidationError('Workspace update is too large.');
    }

    const result: Partial<WorkspaceState> = {};
    for (const collection of COLLECTIONS) {
        const raw = root[collection];
        if (!Array.isArray(raw)) {
            throw new InputValidationError('Workspace payload must contain a ' + collection + ' array.');
        }
        if (raw.length > MAX_ITEMS_PER_COLLECTION) {
            throw new InputValidationError(
                collection + ' exceeds the current per-collection limit of ' + MAX_ITEMS_PER_COLLECTION + ' records.'
            );
        }
        const seen = new Set<string>();
        const rows: Array<Record<string, unknown>> = [];
        for (const item of raw) {
            const record = asRecord(item);
            const sourceId = requireSourceId(record.id, collection);
            if (seen.has(sourceId)) {
                throw new InputValidationError(collection + ' contains duplicate record IDs.');
            }
            seen.add(sourceId);
            const normalized = { ...record, id: sourceId };
            const payload = Object.fromEntries(Object.entries(normalized).filter(([key]) => key !== 'id'));
            const bytes = Buffer.byteLength(JSON.stringify({
                sourceId,
                payload,
                updatedAt: new Date().toISOString()
            }), 'utf8');
            if (bytes > MAX_ROW_BYTES) {
                throw new InputValidationError(collection + ' record ' + sourceId + ' is too large.');
            }
            rows.push(normalized);
        }
        result[collection] = rows;
    }
    return result as WorkspaceState;
}

function payloadOf(source: Record<string, unknown>): Record<string, unknown> {
    const payload = { ...source };
    delete payload.id;
    return payload;
}

function physicalId(sourceId: string): string {
    return 'r-' + sourceId;
}

function samePayload(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

function isRetryableConflict(err: unknown): boolean {
    if (!isAppDatabaseError(err)) return false;
    return err.code === 'AppDatabaseConflict'
        || err.code === 'AppDatabaseConditionFailed'
        || err.code === 'AppDatabaseDuplicateId';
}

async function upsertBatch(
    table: string,
    records: Array<Record<string, unknown>>,
    requireVersions: boolean
): Promise<void> {
    const ids = records.map(item => physicalId(String(item.id)));
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const existing = await db.get<StoredRecord>(table, ids, { consistent: true });
        const operations: Array<ReturnType<typeof db.tx.add> | ReturnType<typeof db.tx.update>> = [];

        records.forEach((source, index) => {
            const sourceId = String(source.id);
            const payload = payloadOf(source);
            const prior = existing[index];
            if (prior && prior.sourceId !== sourceId) {
                throw new Error('A record ID collision was detected; no overwrite was attempted.');
            }
            if (prior && samePayload(prior.payload, payload)) return;
            if (prior && requireVersions && source._version !== prior.updatedAt) {
                throw new WorkspaceConflictError('This record changed on the server. Keep the local conflict snapshot and reload before retrying.');
            }

            const value = {
                sourceId,
                payload,
                updatedAt: new Date().toISOString()
            };
            if (prior) {
                operations.push(db.tx.update(table, [{
                    id: ids[index],
                    record: value,
                    if: { sourceId, updatedAt: prior.updatedAt }
                }], { patch: true }));
            } else {
                operations.push(db.tx.add(table, [{
                    id: ids[index],
                    ...value
                }]));
            }
        });

        if (operations.length === 0) return;
        try {
            const outcomes = await db.transact(operations);
            for (const outcome of outcomes as unknown[]) {
                if (Array.isArray(outcome) && outcome.some(item => item === null || item === false)) {
                    throw new Error('The database reported an unsettled workspace write.');
                }
            }
            return;
        } catch (err: unknown) {
            if (isRetryableConflict(err) && attempt < 2) continue;
            if (isAppDatabaseError(err) && err.code === 'AppDatabaseUnknownOutcome') {
                const after = await db.get<StoredRecord>(table, ids, { consistent: true });
                const reconciled = records.every((source, index) => {
                    const current = after[index];
                    return Boolean(current)
                        && current!.sourceId === String(source.id)
                        && samePayload(current!.payload, payloadOf(source));
                });
                if (reconciled) return;
                throw new Error('A database write outcome is unknown and could not be reconciled. Manual review is required.');
            }
            throw err;
        }
    }
    throw new Error('Workspace changed concurrently. Refresh and retry the save.');
}

async function writeWorkspace(userId: string, state: WorkspaceState, requireVersions: boolean): Promise<void> {
    const partition = userPartition(userId);
    for (const collection of COLLECTIONS) {
        const records = state[collection];
        const table = tableFor(collection, partition);
        for (let offset = 0; offset < records.length; offset += BATCH_SIZE) {
            await upsertBatch(table, records.slice(offset, offset + BATCH_SIZE), requireVersions);
        }
    }
}

async function readCollection(collection: CollectionName, partition: string) {
    const response = await db.list<StoredRecord>(tableFor(collection, partition), {
        limit: MAX_ITEMS_PER_COLLECTION
    });
    const items = response.items.map(item => ({
        ...asRecord(item.payload),
        id: item.sourceId || item.id,
        _version: item.updatedAt
    }));
    return { items, hasMore: Boolean(response.nextToken) };
}

async function readBootstrapMarker(partition: string): Promise<BootstrapRecord | null> {
    const [marker] = await db.get<BootstrapRecord>(metaTableFor(partition), ['bootstrap'], {
        consistent: true
    });
    return marker;
}

async function getWorkspaceFor(userId: string) {
    const partition = userPartition(userId);
    const [ventures, tasks, integrations, capabilities, activity, marker] = await Promise.all([
        readCollection('ventures', partition),
        readCollection('tasks', partition),
        readCollection('integrations', partition),
        readCollection('capabilities', partition),
        readCollection('activity', partition),
        readBootstrapMarker(partition)
    ]);
    const collections = { ventures, tasks, integrations, capabilities, activity };
    const truncated = COLLECTIONS.filter(collection => collections[collection].hasMore);
    return {
        state: {
            ventures: ventures.items,
            tasks: tasks.items,
            integrations: integrations.items,
            capabilities: capabilities.items,
            activity: activity.items
        },
        bootstrapStatus: marker?.status || 'none',
        truncated
    };
}

function clientError(err: unknown): string {
    if (err instanceof InputValidationError || err instanceof WorkspaceConflictError) return err.message;
    return 'The workspace request could not be completed.';
}

async function bootstrapWorkspace(
    userId: string,
    raw: unknown
): Promise<{ status: number; body: Record<string, unknown> }> {
    let state: WorkspaceState;
    try {
        state = validateWorkspace(raw);
    } catch (err) {
        if (err instanceof InputValidationError) return { status: 400, body: { error: err.message } };
        throw err;
    }

    const partition = userPartition(userId);
    const meta = metaTableFor(partition);
    let marker = await readBootstrapMarker(partition);
    if (marker?.status === 'complete') {
        return { status: 409, body: { error: 'This account workspace is already initialized; the server copy is authoritative.' } };
    }
    if (!marker) {
        await db.tx.add(meta, [{
            id: 'bootstrap',
            status: 'in_progress',
            startedAt: new Date().toISOString()
        }]);
        marker = await readBootstrapMarker(partition);
    }
    if (marker?.status === 'complete') {
        return { status: 409, body: { error: 'This account workspace is already initialized; the server copy is authoritative.' } };
    }
    if (marker?.status !== 'in_progress') {
        return { status: 409, body: { error: 'Workspace bootstrap state is invalid. Inspect the workspace before retrying.' } };
    }

    await writeWorkspace(userId, state, false);
    const [completed] = await db.tx.update(meta, [{
        id: 'bootstrap',
        record: {
            status: 'complete',
            completedAt: new Date().toISOString()
        },
        if: { status: 'in_progress' }
    }], { patch: true });
    if (!completed) {
        const finalMarker = await readBootstrapMarker(partition);
        if (finalMarker?.status !== 'complete') {
            throw new Error('Initialization could not be confirmed after writing records.');
        }
    }
    return { status: 200, body: { ok: true, bootstrapStatus: 'complete' } };
}

export const handler = router({
    'GET /api/health': [
        async () => json({
            ok: true,
            service: 'ai-business-portfolio-api',
            authRequiredForWorkspace: true
        })
    ],
    'GET /api/workspace': [
        requireAuth(),
        async (ctx) => {
            try {
                return json(await getWorkspaceFor(ctx.user!.userId));
            } catch (err: unknown) {
                console.error('workspace_read_failed', err);
                return error('Could not read the authenticated workspace. No success is assumed.', 500);
            }
        }
    ],
    'POST /api/workspace/bootstrap': [
        requireAuth(),
        async (ctx) => {
            try {
                const result = await bootstrapWorkspace(ctx.user!.userId, ctx.body);
                if (result.status >= 400) {
                    return error(String(result.body.error || 'Workspace initialization failed.'), result.status);
                }
                return json(result.body);
            } catch (err: unknown) {
                console.error('workspace_bootstrap_failed', err);
                return error(clientError(err), err instanceof InputValidationError ? 400 : err instanceof WorkspaceConflictError ? 409 : 500);
            }
        }
    ],
    'PUT /api/workspace': [
        requireAuth(),
        async (ctx) => {
            try {
                const partition = userPartition(ctx.user!.userId);
                const marker = await readBootstrapMarker(partition);
                if (marker?.status !== 'complete') {
                    return error('Workspace bootstrap is not complete. Reload the workspace before saving.', 409);
                }
                const state = validateWorkspace(ctx.body);
                await writeWorkspace(ctx.user!.userId, state, true);
                const persisted = await getWorkspaceFor(ctx.user!.userId);
                const versions: Record<string, Record<string, string>> = {};
                for (const collection of COLLECTIONS) {
                    versions[collection] = {};
                    for (const item of persisted.state[collection]) {
                        if (typeof item.id === 'string' && typeof item._version === 'string') {
                            versions[collection][item.id] = item._version;
                        }
                    }
                }
                return json({ ok: true, syncedAt: new Date().toISOString(), versions });
            } catch (err: unknown) {
                console.error('workspace_sync_failed', err);
                return error(clientError(err), err instanceof InputValidationError ? 400 : err instanceof WorkspaceConflictError ? 409 : 500);
            }
        }
    ]
});