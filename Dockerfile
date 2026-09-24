# syntax=docker/dockerfile:1

# Repairo is a documentation repository — there is no application to build
# (see README.md). Its sole quality gate is Markdown lint (markdownlint-cli2),
# run in CI on Node 20 via .github/workflows/lint.yml. This image reproduces
# that exact gate in a container (dev/prod parity) and then serves the
# validated designs/ HTML preview over HTTP. It builds from a clean checkout
# with no host state — the sibling .dockerignore keeps .git, node_modules and
# .env out of the build context.
#
# The base is pinned BY DIGEST so the build is byte-reproducible regardless of
# host or when it runs. Human-readable tag: node:20.17.0-bookworm-slim.
# Bump the digest and this comment together when moving Node versions.
ARG NODE_IMAGE=node:20.17.0-bookworm-slim@sha256:2394e403d45a644e41ac2a15b6f843a7d4a99ad24be48c27982c5fdc61a1ef17

# ---------------------------------------------------------------------------
# Stage 1 — deps: install the lint toolchain in its OWN layer. Only the
# package manifest and lockfile are copied first, so this layer is cached and
# is NOT rebuilt when a doc or design file changes — a prose edit does not
# reinstall markdownlint-cli2.
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS deps

WORKDIR /app

# Only the manifest is copied before dependencies are installed, so this layer
# is keyed on package.json alone and is reused on any doc/design change. The
# single dependency (markdownlint-cli2) is pinned to an exact version there, so
# the install is reproducible without committing a lockfile.
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# ---------------------------------------------------------------------------
# Stage 2 — lint: run the repository's real CI gate at build time against the
# cached toolchain. If the Markdown does not lint, the image fails to build,
# so a broken doc never ships. This matches .github/workflows/lint.yml.
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS lint

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json .markdownlint-cli2.jsonc ./
COPY . .

RUN npm run lint

# ---------------------------------------------------------------------------
# Stage 3 — runtime: serve the validated docs and designs/ preview as static
# files over HTTP. Only the content that passed the lint stage is carried in,
# and the server is a zero-dependency Node script (base image only) — no lint
# tooling and nothing installed from a registry ships in the final image.
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS runtime

WORKDIR /home/node/site

# The tiny static server. Kept in the image, owned by the non-root user.
COPY --chown=node:node docker/serve.js /home/node/serve.js

# Only the validated repository content, owned by the non-root user.
COPY --from=lint --chown=node:node /app /home/node/site

# node:*-slim ships an unprivileged "node" user (uid 1000) — drop to it.
USER node

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/',r=>process.exit(r.statusCode<400?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "/home/node/serve.js"]
