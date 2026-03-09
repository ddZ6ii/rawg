# Stage 1: base
FROM node:24-alpine3.22 AS base

WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
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
RUN pnpm run build

# Stage 4: serve (production)
FROM nginx:1.28.2-alpine AS prod

# Upgrade all Alpine packages to their latest patched versions to fix OS-level CVEs
RUN apk upgrade --no-cache

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

ARG VERSION=unknown
ARG REVISION=unknown
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.revision="${REVISION}"
