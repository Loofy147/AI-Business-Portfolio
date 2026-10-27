# AI Business Portfolio

A build-first operating workspace for creating, launching, and running multiple AI-enabled businesses globally.

This repository is the source of truth for the product specification, implementation, integration contracts, validation, and release evidence. It is not a market-opportunity report or a directory wrapper.

## Live preview

**[Open the AI Business Portfolio workspace](https://ai-business-portfolio-0yfidw.v2.appdeploy.ai/)**

The deployed app has an AppDeploy sign-in gate and an account-scoped server workspace. Browser storage is a per-account cache and one-time bootstrap source, not the system of record. Authenticated persistence and two-account isolation still require end-to-end proof; use synthetic, non-sensitive data until those gates pass. No external provider is connected, and operator-entered integration statuses are not independently verified. Never store credentials in this portfolio.

- Source: [GitHub repository](https://github.com/Loofy147/AI-Business-Portfolio)
- Latest passing validation run: [GitHub Actions run #3](https://github.com/Loofy147/AI-Business-Portfolio/actions/runs/40494345607)

## Product objective

Build reusable capabilities once, then assemble them into independent businesses and products. Each business can have its own customers, workflows, integrations, economics, operating rules, deployments, and release history while reusing shared infrastructure safely.

## Initial product surface

The first slice is a portfolio command center with:

- **Portfolio register** — business/product records, lifecycle state, owner, region coverage, operating status, next execution step, and reversible archiving.
- **Build board** — scoped implementation work, priorities, dependencies, acceptance criteria, and evidence states.
- **Integration registry** — provider candidates, official documentation, credential/configuration state, test evidence, costs, and known constraints. A listing never implies a working connection.
- **Reusable capability catalog** — shared identity, workflow, communication, data, billing, analytics, AI, and deployment components.
- **Operational controls** — explicit authorization and approval states, state transitions, audit events, failure handling, and release gates.
- **Delivery measurement** — implementation progress and operational KPIs tied to observed outcomes rather than vanity counts.

## Global by default

The system is not limited to Algeria. Region-specific configuration belongs at the business, customer, deployment, and integration boundaries. Do not assume every vendor, payment method, language, legal regime, hosting region, or channel is available everywhere.

## Evidence policy

Important records must distinguish:

- `FACT` — verified from a primary source or repeatable artifact.
- `EXPERIMENTALLY_SUPPORTED` — reproduced by a documented test.
- `USER_REPORTED` — explicitly reported by the operator.
- `INFERENCE` — conclusion drawn from evidence, with assumptions visible.
- `HYPOTHESIS` — not yet tested.
- `CONTRADICTED` — evidence conflicts with the claim.
- `UNKNOWN / OPEN` — not verified or insufficient evidence.

Conversation text and vendor marketing do not, by themselves, prove implementation. A shipped feature is not considered verified until its tests, deployment state, and observable result have been checked.

## Repository structure

```text
.
├── index.html                  # Portfolio interface shell and styles
├── src/
│   └── main.ts                 # UI, AppDeploy auth, and remote workspace sync
├── backend/
│   └── index.ts                # Authenticated fixed-table workspace API
├── tests/
│   └── tests.json              # AppDeploy end-to-end acceptance tests
├── README.md
├── SECURITY.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── BUILD-ROADMAP.md
│   ├── INTEGRATION-STANDARDS.md
│   └── OPERATING-MODEL.md
├── scripts/
│   └── validate.py
└── .github/
    └── workflows/
        └── validate.yml
```

The UI uses the AppDeploy authentication/API client. The backend stores one atomic workspace document per authenticated account in the fixed logical table abp_workspaces; the row key is derived from the authenticated AppDeploy user ID, and client-supplied identifiers do not select the account partition. A successful sync replaces the full state, so removed records remain removed after reload. Optimistic workspace-version checks reject stale writes rather than silently overwriting newer state. The current storage ceiling is 220 KiB per account workspace and 100 records per collection. First sign-in can import a legacy browser workspace. External providers remain candidates and no workflow runs against them yet. Authenticated persistence, database-catalog readiness, two-account isolation, recovery, backup/restore, and operational hardening remain open verification gates.

## Run locally

The application bundle needs AppDeploy's injected `@appdeploy/client` and backend SDK. The supported deployment target is AppDeploy; opening `index.html` directly as a file will not resolve the bundled SDK import. Repository checks run through GitHub Actions and can be invoked with:

Run the repository checks:

```bash
python3 scripts/validate.py
```

## Delivery stages

1. **Portfolio shell** — usable interactive portfolio UI, editable records, filtering, build checklist, integration registry, and export.
2. **Durable foundation** — authenticated access, server-side authorization, tenant/workspace boundaries, persistent database, schema validation, and audit events.
3. **Execution layer** — safe workflow jobs, adapter contracts, approvals, idempotency, bounded retries, cancellation, and recovery.
4. **Business products** — ship independent services and applications using reusable capabilities.
5. **Production hardening** — observability, cost controls, backups/restore, security tests, load/failure tests, deployment rollback, and incident runbooks.

See [the build roadmap](docs/BUILD-ROADMAP.md) for acceptance gates and [security boundaries](SECURITY.md) for non-negotiable controls.

## Contribution and change discipline

Changes should state the outcome, affected records/components, risks, evidence, tests, and rollback path. Prefer small reviewable increments. Do not place access tokens, API keys, customer data, or provider secrets in source control, browser storage, screenshots, logs, or issue descriptions.
