# Repairo

Design and cost artifacts for a **minimalistic modern family home** — a repository owned by
**Repairo Constructions** ("Setting benchmarks for modern architecture").

## The project

A modern, minimalistic house for a family of 5, set on 5 acres of village land in Kerala,
designed to frame and celebrate the surrounding nature. Target build budget: **₹/$100k**.

See [`docs/BRIEF.md`](docs/BRIEF.md) for the full design brief and requirements,
[`docs/budget.md`](docs/budget.md) for the cost plan, and [`docs/brief.md`](docs/brief.md) for
the original intake note.

## Repository layout

| Path | What lives here |
|------|-----------------|
| `docs/` | The brief, budget, and written decisions |
| `designs/` | Drawings, floor plans, diagrams, renders |
| `.github/workflows/` | CI — lints the Markdown so docs stay clean |

## Working with this repo

This is a **documentation repository** — there is no application to build. The only automated
check is Markdown linting.

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (for the linter)

### Lint the docs locally

```bash
# one-off, no install needed
npx markdownlint-cli2 "**/*.md"
```

The same command runs in CI on every push and pull request (see
[`.github/workflows/lint.yml`](.github/workflows/lint.yml)).

### Configuration

There is no runtime configuration. Linter rules live in
[`.markdownlint-cli2.jsonc`](.markdownlint-cli2.jsonc). If any future tooling needs secrets,
copy [`.env.example`](.env.example) to `.env` and fill it in — `.env` is git-ignored.

## Contributing

1. Put drawings and diagrams under `designs/`.
2. Put written docs (brief, budget, decisions) under `docs/`.
3. Keep Markdown lint-clean (`npx markdownlint-cli2 "**/*.md"`).
