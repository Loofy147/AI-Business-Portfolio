# Portfolio Operating Model

## Objective

Coordinate construction, launch, and continuous improvement of multiple businesses and products while reusing proven engineering capabilities safely. The portfolio is not a speculative list: each record should help an operator take the next concrete action.

## 1. Registers

The production implementation should maintain linked registers for:
- Businesses/products.
- Repositories, apps, deployments, environments, and releases.
- Build tasks, dependencies, and acceptance criteria.
- Architecture decisions and contracts.
- Integrations, plugins, MCP servers, A2A agents, and external services.
- Shared capabilities and their consumers.
- Evidence, tests, claims, incidents, and exceptions.
- Usage, cost, operational performance, and customer outcomes.

Every record needs provenance, status, owner, last-change time, and relationship links where appropriate.

## 2. Lifecycle states

### Business/product
- **Planned:** scope and intended outcome recorded; no implementation claim.
- **Building:** code/design/workflow is actively under implementation.
- **Validating:** acceptance and operational checks are being executed.
- **Launched:** released and the launch criteria are evidenced.
- **Paused:** explicitly suspended, with owner and restart condition.
- **Blocked:** progress is stopped by a recorded dependency, failure, or unresolved decision.

### Task
- **Planned**
- **Building**
- **Done** — only when acceptance criteria and evidence are recorded.
- **Blocked** — blocker, owner, and unblock condition must be explicit.

### Integration
Follow the lifecycle in [Integration Standards](INTEGRATION-STANDARDS.md). Do not count credentials saved as a successful test.

## 3. Evidence statuses

Use the following labels consistently:
- `FACT` / established: verified from the authoritative source or artifact in the stated scope.
- `EXPERIMENTALLY_SUPPORTED`: reproducible test with setup, version, and result.
- `USER_REPORTED`: explicitly reported by the operator; not independently checked.
- `INFERENCE`: supported interpretation, with premises and uncertainty stated.
- `HYPOTHESIS`: testable proposition not yet tested.
- `CONTRADICTED`: credible evidence conflicts with the claim.
- `UNKNOWN / OPEN`: insufficient evidence or unobserved state.

Repeating a claim does not upgrade its status. Keep validity scope and timestamps visible. Preserve contradictions until resolved; do not silently overwrite them.

## 4. Execution cycle

1. **Observe:** read repository, CI, deployment, logs, and current records.
2. **Identify:** name the specific gap, desired outcome, and affected boundaries.
3. **Collect evidence:** distinguish authoritative source, user report, vendor claim, and experiment.
4. **Interpret:** state facts, assumptions, uncertainty, and constraints.
5. **Decide:** choose a scoped change with explicit rollback.
6. **Implement:** use version-controlled, reviewable changes.
7. **Verify:** run unit, integration, failure, authorization, and/or deployment checks relevant to the change.
8. **Record:** write result, commit, test run, deployment, status, and residual risk.
9. **Revalidate:** check the live effect and monitor for regressions.

## 5. Completion gates

For any material change, capture:
- Requested outcome and scope.
- Files/components or external systems changed.
- Preconditions, permissions, and approval state.
- Commit/version and environment.
- Test names, setup, raw result or link, and limitations.
- Deployment state and observed live behavior.
- Risks, rollback method, and unresolved items.

Avoid claiming that a feature is tested from the existence of a test file alone. Avoid claiming deployment success from a URL that has not reached a ready state.

## 6. Prioritization

Do not optimize for the number of ideas, vendors, integrations, or business cards. Prioritize work by:
- Required dependency for shipping a real product.
- Security/safety significance.
- Reuse across multiple implementations.
- Severity of failure or blocked delivery.
- Strength and scope of evidence.
- Cost to implement and maintain.
- Ability to verify and roll back.

High-impact uncertainty must be investigated before expanding the affected path. A strong, reproduced failure should block release until resolved or explicitly accepted under an appropriate policy.

## 7. Global operations

Region, language, currency, time zone, data residency, provider availability, payment options, tax, retention, and legal requirements are configuration dimensions. Do not assume a single global service policy satisfies every jurisdiction. Keep the common engineering architecture reusable while applying region/customer-specific controls through explicit configuration and review.

## 8. Product-level operational KPIs

Use measurements that can be tied to observed outcomes:
- build lead time and acceptance pass rate;
- deployment frequency and failed release rate;
- workflow success, failure, retry, escalation, and reconciliation rates;
- latency and cost per successful task;
- provider uptime and quota-related failures;
- support burden and incident recurrence;
- actual revenue, delivery cost, and contribution margin when those business records exist.

Mark unmeasured metrics as unavailable rather than displaying guessed values. Do not treat vanity totals as value delivered.
