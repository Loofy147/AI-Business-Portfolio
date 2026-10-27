# Architecture

## 1. Purpose

The AI Business Portfolio is an operating control surface for building and running independent AI-enabled businesses. It coordinates implementation and shared capabilities; it does not decide whether to build based on a market-opportunity score.

## 2. Architecture principles

1. **Build-first:** every active record has an implementation outcome, a next concrete step, and acceptance criteria.
2. **Evidence-aware:** user statements, source claims, inferences, hypotheses, experiments, and verified outcomes remain distinguishable.
3. **Global by default, region-specific where required:** do not hard-code Algeria, a single currency, a single language, a single payment rail, or one data region as universal assumptions.
4. **Shared capabilities, isolated business data:** reuse code and infrastructure without unintentionally sharing customer records, credentials, policies, billing, or logs.
5. **Server-side authority:** the browser may display state but cannot authorize consequential actions in a production version.
6. **Adapters over vendor-specific coupling:** external systems sit behind versioned contracts and can be replaced.
7. **Observable completion:** a status is not proof; define acceptance checks, capture results, and preserve deployment/commit references.
8. **Recoverability:** workflows need stable operation identifiers, idempotency, bounded retries, checkpoints, and explicit unknown-outcome recovery.
9. **No secrets in source:** credentials belong in a secrets manager with least-privilege access and rotation.
10. **Independent deployability:** each business/product may ship and operate separately while consuming stable shared capabilities.

## 3. Current implementation boundary

The initial `index.html` is a self-contained browser prototype. Its data model and interactive screens are useful for shaping the product, but its localStorage persistence is per-browser and editable by the browser owner. It is not suitable for multi-user production data or security authorization.

The prototype currently supports:

- Portfolio records for businesses/products.
- Lifecycle status and next implementation step.
- Build tasks with priorities, states, and acceptance criteria.
- Integration records with candidate/configured/tested/verified labels and evidence notes.
- Shared-capability records.
- Local activity notes and JSON export.

The prototype does **not** authenticate users, enforce access policies, connect external integrations, run workflows, meter provider usage, or independently verify a deployment. A user-entered “verified” state must not be described as machine-verified.

## 4. Target logical architecture

```text
Portfolio UI / Business product UIs
                |
        Authenticated API
                |
    Identity + Policy enforcement
                |
  Portfolio / Task / Capability service
                |
     Persistent tenant-aware database
                |
    Workflow job/control-plane service
                |
  Adapter contracts / connector registry
      |          |           |
     AI       Commerce    Communication
   providers   providers     providers
                |
      Event / cost / audit ledger
                |
   Metrics, alerting, evaluation, release
```

The first production rollout should not implement all boxes at once. The next slice should establish identity and persistence, then one controlled workflow adapter and its execution record.

## 5. Core entities

All production entities require immutable internal IDs, creation/update timestamps, schema version, and ownership or workspace scope where relevant.

### Business / product
- `id`, `name`, `kind`, `outcome`
- `lifecycle_state`: planned, building, validating, launched, paused, blocked
- `owner_id`, `workspace_id`, `regions`
- `source_repository`, `deployment_refs`
- `next_step`, `acceptance_criteria`
- `evidence_refs[]`, `created_at`, `updated_at`

### Build task
- `id`, `business_id`, `title`, `details`
- `state`, `priority`, `owner_id`, `dependencies[]`
- `acceptance_criteria[]`, `test_refs[]`, `evidence_refs[]`
- `blocked_reason`, `created_at`, `updated_at`

### Integration
- `id`, `provider`, `capability`, `official_docs_url`
- `adapter_version`, `contract_version`, `credential_ref` (never credential value)
- `state`: candidate, configured, tested, verified, degraded, revoked
- `required_scopes[]`, `data_classes[]`, `regions[]`, `rate_limits`, `cost_model_ref`
- `health_observations[]`, `evidence_refs[]`, `last_tested_at`

### Workflow job
- `id`, `business_id`, `workflow_version`, `request_id`, `idempotency_key`
- `state`: queued, awaiting_approval, running, succeeded, failed, cancelled, needs_reconciliation
- `input_ref`, `output_ref`, `approval_ref`, `adapter_runs[]`
- `started_at`, `finished_at`, `retry_count`, `error_class`
- `cost_records[]`, `trace_ref`

### Evidence item
- `id`, `subject_type`, `subject_id`, `claim`, `claim_status`
- `source_uri`, `source_version_or_hash`, `observed_at`, `scope`
- `method`, `test_run_ref`, `result`, `limitations`, `recorded_by`

Do not store credentials, full payment data, or sensitive raw customer content in generic evidence records.

## 6. State transitions

Business lifecycle and workflow-job lifecycle are separate state machines. A business being “launched” does not mean every workflow is active; a workflow marked “active” does not prove an external job ran successfully.

Workflow activation must require a valid configuration, authorization policy, and recorded approvals appropriate to its risk class. State changes must be checked on the server against the current persisted state; client-side visibility is not a guard.

Each consequential operation needs:
- stable request/job ID retained across transport retries;
- idempotency receipt tied atomically to the effect where supported;
- bounded retry policy with retryable error classes;
- safe cancellation rules and checkpoints;
- reconciliation for timeouts/unknown commit outcomes;
- structured, redacted execution events.

## 7. Global configuration

Use explicit configuration rather than country-specific branching spread across code. A deployment/business should declare supported regions, languages/locales, currencies, time zones, provider availability, data residency needs, tax/payment integrations, legal requirements, retention policy, and support coverage. Unknown values remain unknown; do not infer legal compliance from vendor presence.

## 8. Recommended implementation order

1. Repository validation and product contract.
2. Authentication and workspace/tenant model.
3. Durable CRUD for portfolio, task, integration, and evidence records.
4. Server-enforced authorization, audit events, and record versioning.
5. One workflow job with idempotency and failure reconciliation.
6. One provider adapter in a sandbox.
7. Evaluation, metering, health and recovery.
8. Add business-specific products on the stable contracts.

## 9. Architecture decision record requirement

For consequential changes, record context, alternatives considered, selected decision, trade-offs, security impact, migration/recovery plan, owner, and evidence that would cause the decision to be revisited. Do not elevate a decision to universal standard solely because it worked in one small test.
