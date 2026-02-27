# Stage 1: base
FROM node:24-alpine3.22 AS base

WORKDIR /app
# RUN apk add curl
# RUN curl -L https://unpkg.com/@pnpm/self-installer | node
# Enable corepack to use pnpm without installing it manually
# RUN npm install --global corepack@latest
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: dev
FROM base AS dev

COPY vite.config.ts ./
COPY components.json ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public public
COPY index.html ./
COPY src src
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
RUN pnpm run build

# Stage 4: serve (production)
FROM nginx:1.28.2-alpine AS prod

# Upgrade all Alpine packages to their latest patched versions to fix OS-level CVEs.
RUN apk upgrade --no-cache

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
