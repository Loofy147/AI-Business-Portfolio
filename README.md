# AI Business Portfolio

A build-first operating workspace for creating, launching, and running multiple AI-enabled businesses globally.

This repository is the source of truth for the product specification, implementation, integration contracts, validation, and release evidence. It is not a market-opportunity report or a directory wrapper.

## Product objective

Build reusable capabilities once, then assemble them into independent businesses and products. Each business can have its own customers, workflows, integrations, economics, operating rules, deployments, and release history while reusing shared infrastructure safely.

## Initial product surface

The first slice is a portfolio command center with:

- **Portfolio register** — business/product records, lifecycle state, owner, region coverage, operating status, and next execution step.
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
├── index.html                  # Initial interactive, self-contained portfolio workspace
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

The first UI is a dependency-free browser prototype. Its local browser storage is suitable for UI exploration only; it is **not** multi-user persistence, a secure system of record, or production authorization. The next implementation stage adds server-enforced identity, persistent storage, tenant isolation, integration execution, observability, and automated acceptance tests.

## Run locally

Open `index.html` in a modern browser. No package installation or external network requests are required.

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
