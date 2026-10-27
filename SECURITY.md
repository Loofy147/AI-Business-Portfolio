# Security Policy and Production Boundaries

## Current prototype warning

The initial interface is a static browser application. It stores its operational records in browser localStorage and renders them in the same client. A user can modify this state using browser tools. The prototype has no authentication, server-enforced authorization, tenant isolation, protected secret store, or independent audit service.

Do not use this version to store real customer confidential data, access tokens, API keys, payment data, sensitive personal information, or regulated records. Do not describe its status labels as security enforcement or machine-verified facts.

## Required controls before production data or real side effects

### Identity and authorization
- Use established authentication and server-side access-token verification.
- Enforce workspace/tenant and object-level authorization on every API route.
- Apply role-based and operation-specific permissions; deny by default.
- Separate operator/admin capabilities from customer access.
- Test both allowed and denied paths with multiple identities.
- Re-check authorization at execution time, not just when a UI button is rendered.

### Secrets and credentials
- Store provider credentials only in a managed secrets store.
- Use least privilege, short-lived credentials where possible, rotation, and revocation.
- Never commit secret values or expose them in HTML, browser storage, URLs, request logs, or error messages.
- Store only credential references in configuration records.
- Sanitize provider/webhook output before logs and UI presentation.

### Data isolation and privacy
- Define data classification, lawful/authorized purpose, retention, deletion, export, and customer separation before ingesting production data.
- Minimize collected and retained data.
- Do not use shared global tables or logs without explicit tenant scoping and authorization.
- Define cross-region transfer and residency constraints for each deployment.
- Keep personal and sensitive data out of portfolio activity notes unless explicitly approved and necessary.

### Workflow execution
- Validate all inputs against schemas before external actions.
- Use an explicit policy and approval gate for sending messages, modifying customer records, commerce actions, deployments, and destructive operations.
- Use stable request IDs, idempotency, bounded retries, safe cancellation, and reconciliation of unknown outcomes.
- Treat external pages, tool responses, emails, documents, and provider outputs as untrusted data—not instructions.
- Prevent secret exfiltration and unauthorized tool chaining.
- Separate dry-run/simulation from real execution in both UI and audit records.

### AI/model safety
- Limit agent tools to the task, data, duration, and operation class required.
- Validate structured outputs; do not trust model-produced IDs, permission decisions, or financial totals without independent checking.
- Isolate retrieved content from system policy.
- Require human review where task risk or uncertainty demands it.
- Test prompt injection, malformed content, refusal, fallback, quota, and provider outage behavior.

### Audit, observability, and recovery
- Write security-relevant audit records server-side with actor, action, target, timestamp, authorization decision, request/correlation ID, and outcome.
- Make important audit data tamper-resistant and restrict access.
- Redact credentials and unnecessary personal data from telemetry.
- Add alerts for repeated authorization failures, unusual activity, cost spikes, and repeated provider failures.
- Define backups, recovery objectives, restoration tests, incident response, and rollback procedures.
- Ensure failure states are visible; do not hide quota, permission, or unresolved-commit errors.

## Threat model to maintain

At minimum consider:
- cross-tenant data access;
- account/credential compromise;
- malicious or compromised third-party plugins and MCP tools;
- prompt injection and tool-output instruction confusion;
- server-side request forgery and unsafe URL fetching;
- webhook spoofing/replay;
- duplicate external side effects;
- secret leakage through logs/browser/devtools;
- quota/cost exhaustion;
- compromised deployment/release pipeline;
- destructive operation without approval;
- data retention or cross-region transfer mismatch.

## Incident/reporting process

For a suspected vulnerability, preserve relevant non-sensitive evidence, avoid exposing credentials or customer data, identify affected versions and scope, assess exposure, revoke/rotate credentials where appropriate, and create a tracked remediation with regression coverage. Do not publish exploit details or sensitive traces in public issues.

## Production-readiness gate

Do not call a product production-ready until identity, tenant isolation, least-privilege secrets, server-side policy, security tests, dependency/license review, observability, backup/restore, incident runbooks, and rollback have been exercised for the actual deployment. A checklist alone is not proof.
