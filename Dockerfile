# Stage 1: base
FROM node:24-alpine3.22 AS base

WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: dev (see docker-compose.yml for bind mounts)
FROM base AS dev
EXPOSE 5173
CMD ["pnpm", "run", "dev"]

# Stage 3: build
FROM base AS builder

COPY vite.config.ts ./
COPY components.json ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public public
COPY index.html ./
COPY src src
# Outputs to /app/dist
RUN pnpm run build:docker

# Stage 4: serve (production)
FROM nginx:1.28.3-alpine-slim AS prod

# Upgrade all Alpine packages, then fix nginx specifically: the official
# image pins an exact nginx=<version> in /etc/apk/world, so a plain
# `apk upgrade` silently skips nginx itself even when a patched version is
# available in Alpine's repos. Base is already pinned to a patched nginx
# release (1.28.3), but this keeps future patch-level CVEs (within 1.28.3-rX
# Alpine package revisions) covered without waiting on the next base-image
# bump. `-alpine-slim` excludes 5 unused dynamic modules (acme/geoip/
# image-filter/njs/xslt — none referenced in nginx.conf) that would
# otherwise also need purging before nginx could be force-upgraded cleanly.
# Reinstalling the nginx package overwrites Alpine's stock nginx.conf,
# which is what carries the `include /etc/nginx/conf.d/*.conf;` directive
# our own conf.d/default.conf (copied in below) depends on to ever get
# loaded — back it up and restore it around the fix.
RUN cp /etc/nginx/nginx.conf /tmp/nginx.conf.orig \
    && apk upgrade --no-cache \
    && apk add --no-cache --upgrade nginx \
    && cp /tmp/nginx.conf.orig /etc/nginx/nginx.conf \
    && rm /tmp/nginx.conf.orig

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

ARG VERSION=unknown
ARG REVISION=unknown
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.revision="${REVISION}"
