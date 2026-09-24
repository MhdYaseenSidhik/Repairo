# syntax=docker/dockerfile:1

# Repairo is a documentation repository — there is no application to build
# (see README.md). Its sole quality gate is Markdown lint (markdownlint-cli2),
# run in CI on Node 20 via .github/workflows/lint.yml:
#     npx --yes markdownlint-cli2 "**/*.md"
#
# This image reproduces that exact gate in a container (dev/prod parity), then
# serves the linted docs over HTTP. It builds from a clean checkout with no
# host state — the sibling .dockerignore keeps .git, node_modules and .env out
# of the build context.
#
# The base is pinned BY DIGEST so the build is byte-reproducible regardless of
# host or when it runs. Human-readable tag: node:20.17.0-bookworm-slim.
# Bump the digest and the comment together when moving Node versions.
ARG NODE_IMAGE=node:20.17.0-bookworm-slim@sha256:2394e403d45a644e41ac2a15b6f843a7d4a99ad24be48c27982c5fdc61a1ef17

# ---------------------------------------------------------------------------
# Stage 1 — lint: run the repository's real CI gate at build time. If the
# Markdown does not lint, the image fails to build, so a broken doc never
# ships. This matches .github/workflows/lint.yml command-for-command.
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS lint

WORKDIR /app

# Copy only the lint inputs first (config + all Markdown). npx caches the
# linter in this layer, so it is not re-downloaded when only prose changes.
COPY .markdownlint-cli2.jsonc ./
COPY . .

RUN npx --yes markdownlint-cli2 "**/*.md"

# ---------------------------------------------------------------------------
# Stage 2 — runtime: serve the validated docs as static files over HTTP.
# Only the content that passed the lint stage is carried in, and the server
# is a zero-dependency Node script (base image only) — no build tooling and
# nothing installed from a registry ships in the final image.
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
