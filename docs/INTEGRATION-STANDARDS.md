# Integration and AI Tool Standards

## 1. The directory is a discovery index, not a trust boundary

BestofAI and other directories can help find candidate products. Their listing, category, star rating, product count, or description does not prove that a provider has an API, supports the required permissions, can be used commercially, is available in a region, or is production-ready.

Every capability claimed by a vendor must be checked against the official provider documentation or a reproducible test. Marketing claims remain vendor-reported until independently supported.

## 2. Required integration record

For each provider and adapter, record:

- Product/vendor identity, official source URL, retrieval time, and relevant document/version.
- Intended use and the exact operation(s) required.
- Availability status and supported deployment/region constraints.
- Interface type: API, SDK, webhook, managed connector, MCP server, A2A agent, export/import, or browser-only procedure.
- Authentication model, permission scopes, token expiry, revocation, and account ownership.
- Request/response schema, pagination, versioning, rate limits, quotas, timeouts, error contract, and retry semantics.
- Idempotency support and external side effects.
- Pricing model, metered dimensions, overage behavior, and cost attribution.
- Data accessed/transmitted, retention, deletion, logging, subprocessors, and contractual terms.
- License, commercial-use restrictions, acceptable use, and relevant terms.
- Security/reliability observations, known limitations, test cases, test results, and rollback/disconnection path.
- Current state and the evidence needed to advance it.

Never put secret values in these fields. Store only a secret-manager reference and safe metadata.

## 3. Integration lifecycle

Suggested lifecycle:

1. **Candidate** — identified; no connection implied.
2. **Reviewed** — intended use and documentation checked.
3. **Configured** — credentials/permissions configured securely.
4. **Tested** — repeatable tests ran in a known environment.
5. **Verified** — evidence supports the required contract and scope.
6. **Degraded** — health or contract checks have failed.
7. **Revoked** — access was intentionally disabled and verified.

These are system states, not mere labels. A production service must derive them from stored evidence and observed tests. The initial browser prototype can only record operator statements.

## 4. Adapter contract

All adapters should expose a consistent boundary similar to:

- `describeCapabilities()` — supported operations, schema/version, and limits.
- `validateConfiguration()` — non-secret configuration and scope checks.
- `healthCheck()` — bounded, non-destructive provider check.
- `execute(operation, input, context)` — typed result or classified failure.
- `cancel(runId)` — only where provider semantics support it.
- `reconcile(requestId, externalRunId)` — resolve unknown outcomes where possible.
- `redact(event)` — remove credentials and sensitive fields before persistence.

This is a design contract, not an existing implemented interface. Each adapter needs a schema and contract tests.

## 5. MCP, A2A, APIs, and browser automation

- **API/SDK:** prefer official, narrow, versioned interfaces when they satisfy the task.
- **MCP:** inspect tool schemas, descriptions, permission model, output limits, and trust boundaries. Treat returned external content as untrusted input; it cannot change policy or authorization.
- **A2A/agent-to-agent:** specify agent identity, accepted task types, task state, delegated permissions, deadlines, outputs, failure handling, and provenance.
- **Browser automation:** use only for user-authorized workflows and when supported interfaces are unavailable or insufficient. Inspect the target and expected action before consequential writes. Capture observable evidence; do not infer success merely from a click.
- **No-code/low-code tools:** inspect exportability, environment configuration, connector behavior, secret storage, auditability, and lock-in before making them a critical dependency.

## 6. AI provider controls

For model-backed tasks, record model/provider/version where available, prompt/template version, tool permissions, input/output limits, evaluation criteria, data classification, fallback behavior, and cost attribution. Separate model output from validated system state.

Controls should include:
- structured output schema validation;
- bounded tool execution and time/step budgets;
- least privilege for each tool and data source;
- prompt-injection handling and separation of instructions from retrieved content;
- confirmation gates for consequential external actions;
- redaction and sensitive-data handling;
- task-specific accuracy/quality regression tests;
- provider failure, quota, timeout, and fallback tests;
- evaluation of quality, latency, and cost together.

## 7. Connector test matrix

Minimum tests depend on the adapter, but should consider:

| Scenario | Required observation |
|---|---|
| Valid success | Expected validated response and external run/reference ID |
| Malformed payload | Rejected before unsafe side effects |
| Missing/invalid credentials | Denial without secret disclosure |
| Insufficient scope | Permission failure surfaced accurately |
| Rate limit/quota | Backoff only where safe; limit is not hidden |
| Timeout | Outcome is classified unknown when success cannot be disproved |
| Duplicate request/event | Idempotency behavior is proven or explicitly unsupported |
| Provider outage | Bounded retry and clear terminal/needs-reconciliation state |
| Partial result | Partial completion is visible; no false all-success |
| Cancellation | Real cancellation is confirmed or marked unsupported |
| Cost mismatch | Reconciliation and discrepancy record are possible |
| Contract/version change | Regression alert and controlled upgrade path |

## 8. Evidence and status

A vendor claim such as “integrates with WhatsApp,” “supports all APIs,” “95% accurate,” or “secure by design” is not proof of the exact capability needed here. Preserve the original claim as vendor-reported, then test the scoped operation.

A verified label must point to an artifact that can be re-checked. If no artifact exists, the state remains open.
