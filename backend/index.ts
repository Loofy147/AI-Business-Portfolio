import { createHash, randomUUID } from 'node:crypto';
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
type WorkspaceRecord = {
    ownerPartition: string;
    state: WorkspaceState;
    updatedAt: string;
    workspaceVersion: string;
    bootstrapStatus: 'complete';
    schemaVersion: 2;
};

const COLLECTIONS: CollectionName[] = ['ventures', 'tasks', 'integrations', 'capabilities', 'activity'];
// Static table names are required by the AppDeploy database table-catalog contract.
const WORKSPACES_TABLE = 'abp_workspaces';
const MAX_ITEMS_PER_COLLECTION = 100;
const MAX_REQUEST_BYTES = 850 * 1024;
// Leave room below the database's 256 KiB per-record ceiling for the database envelope.
const MAX_WORKSPACE_BYTES = 220 * 1024;

class InputValidationError extends Error {}
class WorkspaceConflictError extends Error {}
class WorkspaceStorageError extends Error {}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};
}

function userPartition(userId: string): string {
    return createHash('sha256').update(userId, 'utf8').digest('hex').slice(0, 32);
}

function workspaceId(userId: string): string {
    return 'u_' + userPartition(userId);
}

function emptyWorkspace(): WorkspaceState {
    return { ventures: [], tasks: [], integrations: [], capabilities: [], activity: [] };
}

function requireSourceId(value: unknown, collection: string): string {
    if (typeof value !== 'string' || !/^[A-Za-z0-9-]{1,120}$/.test(value)) {
        throw new InputValidationError(collection + ' contains a missing or invalid record ID.');
    }
    return value;
}

function validateWorkspace(value: unknown): WorkspaceState {
    let serialized = '';
    try {
        serialized = JSON.stringify(value ?? {});
    } catch {
        throw new InputValidationError('Workspace payload is not valid JSON data.');
    }
    if (Buffer.byteLength(serialized, 'utf8') > MAX_REQUEST_BYTES) {
        throw new InputValidationError('Workspace update is too large.');
    }

    const root = asRecord(value);
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
            const normalized: Record<string, unknown> = { ...record, id: sourceId };
            // Transport metadata is not user data; never persist a client-supplied version.
            delete normalized._version;
            rows.push(normalized);
        }
        result[collection] = rows;
    }
    return result as WorkspaceState;
}

function stableValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(stableValue);
    if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        return Object.fromEntries(
            Object.keys(record).sort().map(key => [key, stableValue(record[key])])
        );
    }
    return value;
}

function sameState(a: WorkspaceState, b: WorkspaceState): boolean {
    return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b));
}

function databaseRecordSize(id: string, record: WorkspaceRecord): number {
    return Buffer.byteLength(JSON.stringify({ id, ...record }), 'utf8');
}

function enforceRecordSize(id: string, record: WorkspaceRecord): void {
    if (databaseRecordSize(id, record) > MAX_WORKSPACE_BYTES) {
        throw new InputValidationError(
            'This workspace exceeds the current 220 KiB server-storage limit. Export it and reduce the stored records before retrying.'
        );
    }
}

function responseFor(record: WorkspaceRecord): Record<string, unknown> {
    const state = {} as WorkspaceState;
    const versions: Record<string, Record<string, string>> = {};
    for (const collection of COLLECTIONS) {
        state[collection] = record.state[collection].map(item => ({
            ...item,
            _version: record.workspaceVersion
        }));
        versions[collection] = Object.fromEntries(
            state[collection].map(item => [String(item.id), record.workspaceVersion])
        );
    }
    return {
        state,
        bootstrapStatus: record.bootstrapStatus,
        workspaceVersion: record.workspaceVersion,
        versions
    };
}

function emptyResponse(): Record<string, unknown> {
    const versions: Record<string, Record<string, string>> = {};
    for (const collection of COLLECTIONS) versions[collection] = {};
    return {
        state: emptyWorkspace(),
        bootstrapStatus: 'none',
        workspaceVersion: null,
        versions
    };
}

async function readWorkspaceRecord(userId: string): Promise<WorkspaceRecord | null> {
    const partition = userPartition(userId);
    const [record] = await db.get<WorkspaceRecord>(
        WORKSPACES_TABLE,
        [workspaceId(userId)],
        { consistent: true }
    );
    if (!record) return null;
    if (record.ownerPartition !== partition) {
        throw new WorkspaceStorageError('The workspace ownership check failed. No data was returned.');
    }
    if (record.schemaVersion !== 2 || record.bootstrapStatus !== 'complete' || !record.state) {
        throw new WorkspaceStorageError('The stored workspace schema is incompatible. No automatic migration was attempted.');
    }
    return record;
}

function createWorkspaceRecord(userId: string, state: WorkspaceState): WorkspaceRecord {
    return {
        ownerPartition: userPartition(userId),
        state,
        updatedAt: new Date().toISOString(),
        workspaceVersion: randomUUID(),
        bootstrapStatus: 'complete',
        schemaVersion: 2
    };
}

async function bootstrapWorkspace(userId: string, raw: unknown): Promise<Record<string, unknown>> {
    const state = validateWorkspace(raw);
    const id = workspaceId(userId);
    const existing = await readWorkspaceRecord(userId);
    if (existing) {
        if (sameState(existing.state, state)) return responseFor(existing);
        throw new WorkspaceConflictError(
            'This account already has a server workspace. The server copy is authoritative; reload before continuing.'
        );
    }

    const candidate = createWorkspaceRecord(userId, state);
    enforceRecordSize(id, candidate);
    try {
        const [createdId] = await db.tx.add(WORKSPACES_TABLE, [{ id, ...candidate }]);
        if (createdId) return responseFor(candidate);

        const after = await readWorkspaceRecord(userId);
        if (after && sameState(after.state, state)) return responseFor(after);
        if (after) {
            throw new WorkspaceConflictError(
                'Another initialization created this account workspace. Reload to use the server copy.'
            );
        }
        throw new WorkspaceStorageError(
            'Workspace initialization could not be confirmed. Reload before retrying.'
        );
    } catch (err: unknown) {
        if (err instanceof WorkspaceConflictError || err instanceof InputValidationError || err instanceof WorkspaceStorageError) {
            throw err;
        }
        if (isAppDatabaseError(err) && err.code === 'AppDatabaseUnknownOutcome') {
            try {
                const after = await readWorkspaceRecord(userId);
                if (after && sameState(after.state, state)) return responseFor(after);
                if (after) {
                    throw new WorkspaceConflictError(
                        'Another initialization created this account workspace. Reload to use the server copy.'
                    );
                }
            } catch (reconcileError: unknown) {
                if (reconcileError instanceof WorkspaceConflictError) throw reconcileError;
            }
            throw new WorkspaceStorageError(
                'The initialization result is unknown. Reload the workspace before retrying; no blind retry was attempted.'
            );
        }
        throw err;
    }
}

async function updateWorkspace(userId: string, raw: unknown): Promise<Record<string, unknown>> {
    const root = asRecord(raw);
    const requestedVersion = root.workspaceVersion;
    const state = validateWorkspace(raw);
    const current = await readWorkspaceRecord(userId);
    if (!current) {
        throw new WorkspaceConflictError('Workspace initialization is required. Reload and sign in again.');
    }
    if (typeof requestedVersion !== 'string' || !requestedVersion) {
        throw new WorkspaceConflictError('The workspace version is missing. Refresh before saving.');
    }
    if (current.workspaceVersion !== requestedVersion) {
        if (sameState(current.state, state)) return responseFor(current);
        throw new WorkspaceConflictError(
            'A newer server workspace exists. Your local snapshot was retained; refresh before making further changes.'
        );
    }

    const id = workspaceId(userId);
    const candidate = createWorkspaceRecord(userId, state);
    enforceRecordSize(id, candidate);
    try {
        const [updated] = await db.tx.update(WORKSPACES_TABLE, [{
            id,
            record: candidate as unknown as Record<string, unknown>,
            if: {
                ownerPartition: userPartition(userId),
                workspaceVersion: current.workspaceVersion
            }
        }], { patch: true });

        if (updated) return responseFor(candidate);

        const after = await readWorkspaceRecord(userId);
        if (after && sameState(after.state, state)) return responseFor(after);
        throw new WorkspaceConflictError(
            'The workspace changed while saving. Your local snapshot was retained; refresh before retrying.'
        );
    } catch (err: unknown) {
        if (err instanceof WorkspaceConflictError || err instanceof InputValidationError || err instanceof WorkspaceStorageError) {
            throw err;
        }
        if (isAppDatabaseError(err) && err.code === 'AppDatabaseUnknownOutcome') {
            try {
                const after = await readWorkspaceRecord(userId);
                if (after && sameState(after.state, state)) return responseFor(after);
            } catch {
                // Preserve the unresolved outcome; do not retry a possibly committed write.
            }
            throw new WorkspaceStorageError(
                'The save outcome is unknown. Refresh before retrying; the server did not blindly repeat the write.'
            );
        }
        throw err;
    }
}

function errorStatus(err: unknown): number {
    if (err instanceof InputValidationError) return 400;
    if (err instanceof WorkspaceConflictError) return 409;
    if (err instanceof WorkspaceStorageError) return 503;
    if (isAppDatabaseError(err)) {
        if (err.code === 'AppDatabaseQuotaExceeded') return 429;
        if (
            err.code === 'AppDatabaseGatewayUnavailable' ||
            err.code === 'AppDatabaseReadIncomplete' ||
            err.code === 'AppDatabaseUnknownOutcome' ||
            err.code === 'AppDatabaseCapabilityInvalid'
        ) return 503;
        if (
            err.code === 'AppDatabaseConflict' ||
            err.code === 'AppDatabaseConditionFailed' ||
            err.code === 'AppDatabaseDuplicateId'
        ) return 409;
    }
    return 500;
}

function clientError(err: unknown): string {
    if (
        err instanceof InputValidationError ||
        err instanceof WorkspaceConflictError ||
        err instanceof WorkspaceStorageError
    ) return err.message;
    if (isAppDatabaseError(err) && err.code === 'AppDatabaseQuotaExceeded') {
        return 'Workspace storage quota exceeded. No save success is assumed.';
    }
    if (isAppDatabaseError(err) && err.code === 'AppDatabaseCapabilityInvalid') {
        return 'Workspace storage is not provisioned for this release. No save success is assumed.';
    }
    if (
        isAppDatabaseError(err) &&
        ['AppDatabaseGatewayUnavailable', 'AppDatabaseReadIncomplete', 'AppDatabaseUnknownOutcome'].includes(err.code)
    ) return 'Workspace storage is temporarily unavailable or the result is unresolved. Refresh before retrying.';
    return 'The workspace request could not be completed.';
}

export const handler = router({
    'GET /api/health': [
        async () => {
            try {
                // This fixed-ID read checks the table catalog without exposing workspace records.
                await db.get<WorkspaceRecord>(WORKSPACES_TABLE, ['health-probe'], { consistent: true });
                return json({
                    ok: true,
                    service: 'ai-business-portfolio-api',
                    databaseCatalogReady: true,
                    authRequiredForWorkspace: true
                });
            } catch (err: unknown) {
                console.error('workspace_database_healthcheck_failed', err);
                return error('Workspace storage is not ready.', errorStatus(err));
            }
        }
    ],
    'GET /api/workspace': [
        requireAuth(),
        async (ctx) => {
            try {
                const record = await readWorkspaceRecord(ctx.user!.userId);
                return json(record ? responseFor(record) : emptyResponse());
            } catch (err: unknown) {
                console.error('workspace_read_failed', err);
                return error(clientError(err), errorStatus(err));
            }
        }
    ],
    'POST /api/workspace/bootstrap': [
        requireAuth(),
        async (ctx) => {
            try {
                return json(await bootstrapWorkspace(ctx.user!.userId, ctx.body));
            } catch (err: unknown) {
                console.error('workspace_bootstrap_failed', err);
                return error(clientError(err), errorStatus(err));
            }
        }
    ],
    'PUT /api/workspace': [
        requireAuth(),
        async (ctx) => {
            try {
                return json(await updateWorkspace(ctx.user!.userId, ctx.body));
            } catch (err: unknown) {
                console.error('workspace_sync_failed', err);
                return error(clientError(err), errorStatus(err));
            }
        }
    ]
});
