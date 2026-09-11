FROM node:24-alpine3.22 AS base
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY packages/shared ./packages/shared
COPY backend/vitest.config.ts ./backend
COPY backend/tsconfig.json backend/tsconfig.app.json backend/tsconfig.node.json ./backend/
COPY backend/src ./backend/src
RUN pnpm --filter @rawg/shared run build
RUN npx tsc -b backend

FROM node:24-alpine3.22 AS prod

# Upgrade all Alpine packages to their latest patched versions to fix OS-level CVEs
RUN apk upgrade --no-cache

WORKDIR /app

RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --prod --frozen-lockfile \
    # corepack downloads a full pnpm install (with its OWN vendored
    # dependencies — tar, pacote, sigstore, etc.) into its cache dir to
    # satisfy the packageManager pin; node_modules already has real
    # copies of everything it needs via hard links, not symlinks back
    # into these caches, so removing them post-install is safe. Without
    # this, Trivy flags every CVE in pnpm's own dependency tree even
    # though pnpm is never invoked at runtime — only during this build.
    && rm -rf /root/.cache/node/corepack /root/.cache/pnpm /root/.local/share/pnpm \
    # The base node:24-alpine image ships npm pre-installed, which bundles
    # its OWN vendored dependencies (tar, pacote, sigstore, undici,
    # ip-address, brace-expansion) — present even on a completely
    # untouched base image. This app only ever uses pnpm to install and
    # plain `node` to run; npm/npx are never invoked, so their CVEs are
    # pure dead weight.
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
WORKDIR /app/backend
EXPOSE 3000

ARG VERSION=unknown
ARG REVISION=unknown
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.revision="${REVISION}"

CMD ["node", "dist/index.js"]
