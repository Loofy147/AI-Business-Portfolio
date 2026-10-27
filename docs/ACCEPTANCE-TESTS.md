# Acceptance Tests and Verification Matrix

## Current self-contained prototype

Run:

```bash
python3 scripts/validate.py
```

The repository check validates required source files, required interface anchors, static HTML ID uniqueness, absence of remote script/styles dependencies, and embedded JavaScript syntax when Node.js is installed. GitHub Actions runs the same check.

This is a static/structural check. It does not simulate a real browser or prove behavior of persistence, security, external providers, or deployment.

## Manual UI acceptance tests for prototype

1. Open `index.html` on desktop and narrow/mobile viewport; verify navigation and layout remain usable.
2. Create a business/product with required fields. Edit it and change its status. Refresh and verify the record remains in the same browser.
3. Search by name and outcome, then filter by lifecycle state.
4. Add a task with acceptance criteria; change its state and verify build progress changes.
5. Add an integration and record candidate/configured/tested/verified state. Confirm the UI explains evidence is operator-entered, not independently run.
6. Export JSON and parse it with a JSON parser; verify ventures, tasks, integrations, capabilities, and activity are included.
7. Enter invalid/malformed URLs in optional source/deployment fields. Confirm they are not stored as active links unless they are valid HTTPS URLs.
8. Open each section from navigation and check that no dead-end control or uncaught exception occurs.
9. Verify no external script, CSS, or API request is required for the core UI to load.
10. Verify prototype disclaimer remains visible and does not imply shared persistence or secured authorization.

## Required tests before production

### Identity and authorization
- Unauthenticated requests fail closed.
- User A cannot enumerate or access User B's records by changing IDs, filters, workspace IDs, or export parameters.
- Role and action scopes reject unauthorized state changes.
- Authorization is re-evaluated before executing delayed jobs.

### Persistence and concurrency
- Create/read/update/delete survives a new browser session.
- Concurrent edits cannot silently overwrite important changes.
- Duplicate requests use stable idempotency receipts.
- Missing, incomplete, or stale reads are not interpreted as proof of absence.
- Migrations and schema rollback are rehearsed using recoverable data.

### Workflow engine
- Valid path succeeds with a trace and external execution ID.
- Invalid transition rejects server-side.
- Duplicate trigger does not repeat external side effects.
- Timeout after a possible commit moves to reconciliation when outcome is unknown.
- Retry limits and cancellation are honored.
- Provider partial failure is not reported as total success.
- Human approval binds to the correct action/version/target and cannot be replayed for a different payload.

### Integrations
- Unauthorized, malformed, quota-limited, timed-out, and unavailable-provider cases are exercised.
- Secrets are redacted from logs and errors.
- Every adapter contract is versioned and tested against the documented provider contract.
- At least one provider success result is rechecked from actual provider output.
- Cost/usage data is reconciled against provider records or marked unavailable.

### Deployment and operations
- Build and CI pass on the exact commit to be released.
- Staging test and smoke test run against the candidate version.
- Alerts and dashboards show error, latency, usage, and cost baselines.
- Backup restoration and rollback are completed in a controlled rehearsal.
- The live deployment reports a terminal ready state and browser smoke test confirms expected behavior.

## Evidence for every result

Record test ID, commit SHA, app/version, environment, start time, exact steps/setup, expected outcome, actual outcome, log/artifact URL, and known limitations. A planned test is not a passed test; a passed test in a prototype is not proof of production security.
