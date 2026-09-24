# Repairo

Design and cost artifacts for a **minimalistic modern family home** — a repository owned by
**Repairo Constructions** ("Setting benchmarks for modern architecture").

## The project

A modern, minimalistic house for a family of 5, set on 5 acres of village land in Kerala,
designed to frame and celebrate the surrounding nature. Target build budget: **₹/$100k**.

See [`docs/brief.md`](docs/brief.md) for the full brief and [`docs/budget.md`](docs/budget.md)
for the cost plan.

## Repository layout

| Path | What lives here |
|------|-----------------|
| `docs/` | The brief, budget, and written decisions |
| `designs/` | Drawings, floor plans, diagrams, renders |
| `test/` | Acceptance-criteria test suite (checks the design meets the brief) |
| `.github/workflows/` | CI — lints the Markdown and runs the test suite |

## Working with this repo

This is a **documentation repository** — there is no application to build. Two automated checks
run on every push and pull request: Markdown linting, and a test suite that verifies the design
deliverables meet the brief's acceptance criteria.

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (for the linter and the test suite)

### Lint the docs locally

```bash
# one-off, no install needed
npx markdownlint-cli2 "**/*.md"
```

### Run the tests locally

```bash
npm test
```

That runs `node --test test/` — no install needed, it uses Node's built-in test runner. The
suite checks the [`docs/BRIEF.md`](docs/BRIEF.md) §6 acceptance criteria as data: the USD
100,000 budget cap, ≥3 bedrooms for a family of five, monsoon roof/plinth/drainage,
cross-ventilation and shading, daylight, indoor–outdoor flow, local materials, and that the
floorplan diagram exists and parses. See [`test/README.md`](test/README.md) for the full list.

Both commands run in CI on every push and pull request (see
[`.github/workflows/lint.yml`](.github/workflows/lint.yml)).

### Configuration

There is no runtime configuration. Linter rules live in
[`.markdownlint-cli2.jsonc`](.markdownlint-cli2.jsonc). If any future tooling needs secrets,
copy [`.env.example`](.env.example) to `.env` and fill it in — `.env` is git-ignored.

## Contributing

1. Put drawings and diagrams under `designs/`.
2. Put written docs (brief, budget, decisions) under `docs/`.
3. Keep Markdown lint-clean (`npx markdownlint-cli2 "**/*.md"`).
4. Keep the test suite green (`npm test`).
