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
| `.github/workflows/` | CI — lints the Markdown and build-verifies the container |

## Working with this repo

This is a **documentation repository** — there is no application to build. The only automated
check is Markdown linting.

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (for the linter)
- [Docker](https://docs.docker.com/get-docker/) with Compose v2 (to run the preview)

### Lint the docs locally

```bash
# one-off, no install needed
npx markdownlint-cli2 "**/*.md"
```

The same command runs in CI on every push and pull request (see
[`.github/workflows/lint.yml`](.github/workflows/lint.yml)).

### Run the whole stack (one command)

The repository ships a Docker Compose file that lints the docs at build time and then serves
them over HTTP. Bring the full stack up with a single command:

```bash
docker compose up --build
```

Then open the preview at **<http://localhost:3000>**. Set `PORT` (e.g. in a `.env` file) to
serve on a different port. Compose waits for the service's container `HEALTHCHECK` to report
healthy before considering the stack up. Stop it with `docker compose down`.

> There is a single service — `docs` — because that is the only runnable surface this
> documentation repository has. No database, cache or queue is stood up, since nothing in the
> repository connects to one.

CI build-verifies the image and validates the compose schema on every pull request (see
[`.github/workflows/container.yml`](.github/workflows/container.yml)), so what you run locally
is what CI runs.

### Configuration

Runtime configuration is limited to `PORT` (the preview server's listen port; default `3000`).
Linter rules live in [`.markdownlint-cli2.jsonc`](.markdownlint-cli2.jsonc). If any future
tooling needs secrets, copy [`.env.example`](.env.example) to `.env` and fill it in — `.env`
is git-ignored.

## Contributing

1. Put drawings and diagrams under `designs/`.
2. Put written docs (brief, budget, decisions) under `docs/`.
3. Keep Markdown lint-clean (`npx markdownlint-cli2 "**/*.md"`).
