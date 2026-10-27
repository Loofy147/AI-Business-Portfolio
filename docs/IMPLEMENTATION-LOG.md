# Implementation Log

## 2026-10-27 — Initial repository foundation and browser prototype

### Repository

- Repository: https://github.com/Loofy147/AI-Business-Portfolio
- Default branch: `main`
- Initial state observed: empty repository, no source files.
- Initial UI commit: `e2e19aeb0daab88bac83ea9770263d4a11d3301a` — interactive self-contained portfolio console.
- Documentation and validation files were added under `docs/`, `scripts/`, and `.github/workflows/`.
- CI surfaced an over-escaped regular expression in the integration evidence form; this was fixed in commit `24ef0f04f3efc1722506028f92e0da43b2639a40`.

### Repeatable validation evidence

- Workflow: Validate AI Business Portfolio.
- Result: **completed successfully**.
- Run: https://github.com/Loofy147/AI-Business-Portfolio/actions/runs/40494345607
- Checked: required repository files, required application markers, static HTML ID uniqueness, no external stylesheet/script dependency, and embedded JavaScript syntax using Node.js.
- Limit: this repository validator is a structural/syntax check, not a full browser, functional, authorization, or security test.

### Deployment and smoke test

- AppDeploy app ID: `ai-business-portfolio-0yfidw`.
- Source snapshot: `1793099576436`.
- Deployment URL: https://ai-business-portfolio-0yfidw.v2.appdeploy.ai/
- Deployment status observed: **ready**.
- AppDeploy status response reported no frontend or backend errors.
- Read-only browser smoke test: https://agent.tinyfish.ai/runs/ab6e834b-5722-49b3-8696-5b704fd967ec
- Observed: dashboard rendered; portfolio navigation and initial records were visible; integration catalog showed 8 candidates and 0 verified integrations; no obvious layout, network, or frontend error was observed.
- Smoke test did not create data, test form submission, test browser persistence, prove exported file contents, or call third-party integrations.

### Current user-visible functionality

- Business/product records: add, edit, change lifecycle status, region and next step, source/deployment URL references.
- Build board: add/edit tasks, set priority/state, show progress from task state.
- Integration registry: candidate/configured/tested/verified record labels, official docs links, evidence notes, and region/operational notes.
- Shared capability catalog.
- Local activity notes and portable JSON export.
- Responsive navigation and layout.

### Known open constraints

1. Data is saved to browser localStorage, not a shared or authenticated database.
2. Client-edited status labels are not server-enforced security or machine verification.
3. External providers are candidates only; no provider credentials or live adapter are configured in the portfolio prototype.
4. The current CI validates structure and syntax; full browser interaction and accessibility tests remain open.
5. AppDeploy is a separate hosted source snapshot, not a continuous GitHub deployment pipeline. Keep repository and deployed snapshots reconciled on future source changes.
6. Production requirements include identity/authorization, tenant isolation, durable storage, secret handling, execution policy, idempotency/recovery, observability/cost metering, automated integration tests, backup/restore, and rollback.


## 2026-10-27 — Reversible archiving

### Change
- Repository commit: `d8bb4aee068a8014d3b17ca53734540140c71738`.
- Added an Archive action for business/product records.
- Requires the exact confirmation phrase `ARCHIVE`; a failed confirmation leaves the record unchanged.
- Archived records remain in the portfolio, retain related tasks and history, and can be restored through Change state. This is a reversible local state change, not a server-enforced authorization boundary.
- Added validator markers and acceptance documentation for the feature.

### Deployment
- AppDeploy snapshot: `1793099985288`.
- Status: **ready**.
- URL: https://ai-business-portfolio-0yfidw.v2.appdeploy.ai/
- AppDeploy reported no frontend/network errors.

### Functional test evidence
- Browser test run: https://agent.tinyfish.ai/runs/f85062f0-cd16-4c0b-bca4-6876cead626c
- Observed: creating a disposable record worked; submitting Archive without the exact phrase showed `Type ARCHIVE exactly to confirm this action.` and left the record Planned; entering `ARCHIVE` changed it to Archived; the record remained visible and the Archive action disappeared.
- No external links or provider integrations were called.
- The test was performed in a browser-local test context; its data is not a server-side portfolio record.

### Remaining scope
- Archive state and event recording are client-local and can be edited by the browser owner. Production requires server-side authorization, durable storage, and tamper-resistant audit events.

## 2026-10-27 — Authenticated workspace persistence increment

### Implemented in repository

- Frontend now imports the AppDeploy client SDK for sign-in, session restoration, protected API calls, and sign-out.
- Added an authentication gate to the main workspace. Portfolio sections are not rendered while the session/workspace is loading or signed out.
- Added a per-account local cache key and a one-time legacy-browser import path for an account whose server workspace has not completed bootstrap.
- Added `backend/index.ts` with:
  - `GET /api/workspace` protected by `requireAuth()`.
  - `POST /api/workspace/bootstrap` protected by `requireAuth()` and guarded by a resumable bootstrap marker.
  - `PUT /api/workspace` protected by `requireAuth()`.
  - `GET /api/health` public and limited to health metadata.
- Storage uses per-user tables named from a SHA-256 hash of the authenticated AppDeploy user ID. Client-supplied user IDs do not select the workspace namespace.
- Each resource row has a stable server ID derived from the record ID, a source ID, payload, and server version.
- Payload validation checks collection arrays, record IDs, duplicate IDs, collection counts, request size, and row size.
- Writes use bounded batches, conditional patches, a bounded retry path for known database conflicts, and a consistent-read reconciliation attempt for unknown database outcomes.
- Optimistic version checks prevent a stale browser tab from silently overwriting a changed record. The frontend preserves a local conflict snapshot and surfaces a sync warning.
- Test suite includes five AppDeploy E2E cases, including a two-account isolation scenario. The existence of the tests does not mean they have passed.

### Open verification gates

- AppDeploy deployment and TypeScript/backend validation.
- Sign-in and initial bootstrap of an empty account.
- Read/write persistence after reload using actual server records.
- Two distinct authenticated test accounts proving cross-account record isolation.
- Bootstrap partial-failure recovery.
- Concurrent edit behavior and user-facing conflict resolution.
- Account deletion, retention, backup/restore, and security audit service.
- Third-party workflow execution remains disabled.

## 2026-10-27 — Authenticated storage deployment and anonymous denial check

### Deployment evidence

- AppDeploy app: `ai-business-portfolio-0yfidw`.
- Latest observed deployment snapshot: `1793101457044`.
- URL: https://ai-business-portfolio-0yfidw.v2.appdeploy.ai/
- Status: **ready**.
- AppDeploy reported no build/runtime frontend or network errors. Its runtime diagnostics recorded the unsigned `GET /api/workspace` request as HTTP 401 `Unauthorized`, which is the expected denial for the protected route.
- Read-only TinyFish browser check: https://agent.tinyfish.ai/runs/4ebb9b95-9cac-4a88-9bc3-da2e6bee131c
- Observed UI: authenticated gate, sign-in buttons, “Account-scoped storage — Sign-in required,” and “Provider connections — Not verified.”

### CI evidence

- GitHub Actions validation: https://github.com/Loofy147/AI-Business-Portfolio/actions/runs/40498331538
- Observed status: **successful**, 9 seconds.
- Associated commit: `25c88193c35210930fa0cbfe22fcf28a33b2038e`.
- Scope: repository source checks and JavaScript syntax/guard markers. This is not an authenticated database integration test.

### Still open

- No signed-in authenticated write/read/reload test has been performed in this pass.
- Cross-account isolation and concurrent-session conflict handling remain implementation requirements awaiting two-actor E2E verification.
- Direct browser navigation to API URLs returned the app shell and did not expose raw responses; the relevant 401 evidence came from AppDeploy backend runtime diagnostics.
- Database bootstrap, storage catalog behavior, partial bootstrap recovery, database quotas, and restore/retention behavior remain to be verified with an authenticated account.
- External provider integrations and workflow execution remain disabled.


## 2026-10-27 — Fixed-table atomic workspace storage repair

### Change prepared in repository

- Replaced dynamically generated per-user database table names with the single fixed logical table abp_workspaces. Each account row key is derived from the authenticated AppDeploy user ID; client-supplied identifiers do not choose the account partition.
- Replaced multi-table bootstrap with one chosen-ID insert for the complete account workspace. A concurrent bootstrap cannot overwrite a workspace that already won the insert.
- Added a server-issued workspaceVersion and conditional update. Stale clients receive HTTP 409; uncertain outcomes are reconciled with consistent reads instead of blind retries.
- Full-state replacement makes removed records remain removed after reload. The backend strips client _version metadata before persistence.
- Added a public fixed-ID database-catalog health probe that does not return account content.
- Enforced a 220 KiB serialized workspace-row ceiling and 100 records per collection. Exceeding the ceiling returns a visible validation error rather than attempting an oversized database write.
- Updated the frontend to send/retain workspaceVersion and updated regression checks, acceptance tests, architecture, security, roadmap, and README.
- This is a schema transition from the earlier dynamically named collection design. No authenticated server write/read test has been demonstrated for the previous implementation; legacy server-data migration is not verified.

### Verification gates (mark only from actual results)

- [ ] GitHub Actions validator passes on the new commit.
- [ ] AppDeploy backend compilation and deployment are ready.
- [ ] GET /api/health confirms that abp_workspaces is provisioned and readable.
- [ ] An authenticated account bootstraps, creates/edits records, reloads, and retains data.
- [ ] A stale-version write is rejected without losing the newer server state.
- [ ] Two separate authenticated accounts demonstrate isolation.

The current implementation does not add provider execution, backup/restore, account deletion/retention, or a tamper-resistant audit service.
