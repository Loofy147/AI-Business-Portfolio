# Build Roadmap

The roadmap tracks software and business delivery, not market-research completion. No stage should be marked complete without observable acceptance evidence.

## Stage 0 — Repository and prototype

### Scope
- [x] Establish this repository as the product source of truth.
- [x] Add a self-contained portfolio UI.
- [x] Add local business/product, task, integration, capability, and activity records.
- [x] Add JSON export and local browser persistence.
- [x] Record the local-only prototype boundary.
- [x] Add and run repository validation in GitHub Actions (latest pass: https://github.com/Loofy147/AI-Business-Portfolio/actions/runs/40494345607).
- [ ] Run the same validator in an independent local checkout.
- [x] Inspect deployed rendering on desktop/mobile with a read-only TinyFish smoke test (UI renders; no obvious frontend/network errors).

### Exit criteria
- Required files and UI sections exist.
- Script syntax and HTML structural checks pass.
- Every mutable record can be exported as JSON.
- UI visibly distinguishes candidate integrations from tested external connections.
- No claim that localStorage is secure shared persistence.

## Stage 1 — Durable identity and persistence (P0)

### Scope
- [ ] Select the production hosting and database boundary using official docs and actual account availability.
- [ ] Add authentication and logout.
- [ ] Define workspace membership and role model.
- [ ] Move records from browser storage to server-backed persistence.
- [ ] Add schema validation and versioned migrations.
- [ ] Enforce authorization on every list, read, create, update, delete, export, and administrative operation.
- [ ] Add durable server-side activity and evidence records.
- [ ] Provide data export and account/workspace deletion policy.

### Acceptance gate
- Two test identities cannot read, mutate, or infer each other's private records.
- Authorization tests cover unauthenticated and unauthorized paths.
- Records survive a new browser and session.
- Migration and rollback/recovery have a repeatable test.
- No secret appears in browser storage, logs, or responses.

## Stage 2 — Workflow execution foundation (P0)

### Scope
- [ ] Define a versioned workflow-job API and state machine.
- [ ] Implement stable request IDs and idempotency receipts.
- [ ] Implement policy evaluation and human approval states.
- [ ] Add bounded retries by classified failure type.
- [ ] Add timeouts, cancellation rules, checkpoints, and recovery.
- [ ] Preserve run IDs, correlation IDs, sanitized outputs, and error classifications.
- [ ] Handle unknown outcomes by reconciliation; never blindly repeat non-idempotent side effects.
- [ ] Add a dead-letter/reconciliation queue for unresolved failures.

### Acceptance gate
- Duplicate submission does not duplicate side effects in the supported adapter.
- Concurrent state changes reject safely.
- Timeout after an external side effect can be reconciled.
- Retries stop at configured limits.
- A user can identify which result is confirmed, failed, or unresolved.

## Stage 3 — First live adapter (P0)

Start with one integration and a controlled test environment. n8n is a candidate, not an assumed requirement; it must pass the same gates as any other provider.

### Scope
- [ ] Validate official API/connector contract and licensing.
- [ ] Define typed inputs, outputs, error mapping, and versioning.
- [ ] Use credential references and least privilege.
- [ ] Add payload validation, signature/authentication checks, and safe secret redaction.
- [ ] Add sandbox workflow fixtures.
- [ ] Test success, malformed input, unauthorized call, rate limit, timeout, provider outage, duplicate event, and partial result.
- [ ] Record provider execution IDs and trace correlation.

### Acceptance gate
- One repeatable authorized end-to-end test succeeds.
- Negative and failure tests prove safeguards work.
- Every real external action is distinguishable from a simulated run.
- Costs and provider rate/usage limits are visible or explicitly marked unmetered.

## Stage 4 — Shared operating capabilities

- [ ] Connector registry and health checks.
- [ ] Audit and evidence service.
- [ ] Model/provider abstraction with explicit capability differences.
- [ ] Evaluation datasets and regression runs.
- [ ] Usage, cost, latency, and reliability metrics.
- [ ] Notifications and human escalations.
- [ ] Backup/restore, incident response, and deployment rollback.
- [ ] Shared templates/versioning with per-business configuration.

### Acceptance gate
A new business can reuse a capability through a documented contract without bypassing identity, policy, telemetry, or release controls.

## Stage 5 — Independent business/product delivery

Use the portfolio register to track each implementation independently. Each business needs:
- a concrete deliverable and owner;
- a working repository/deployment reference;
- integration contracts and configuration;
- test/acceptance evidence;
- unit economics and actual delivery cost records when available;
- customer/data permissions appropriate to the implementation;
- release, support, maintenance, and rollback instructions.

A planned service does not become a launched business because its card exists. The state requires the relevant implementation and operational evidence.

## Definition of done

A significant feature is complete only when:
1. requirements and scope are recorded;
2. the implementation is present in version control;
3. tests cover expected, invalid, unauthorized, and relevant failure behavior;
4. actual test results and environment are recorded;
5. staging or production deployment status is checked;
6. observable behavior agrees with the intended result;
7. residual limitations and rollback path are documented.

## Continuous improvement loop

Observe → classify evidence → reproduce → interpret → decide → implement → verify → record → revalidate. New reports do not automatically overwrite earlier evidence; preserve contradictions and resolve them explicitly.
