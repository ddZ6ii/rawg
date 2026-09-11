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
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
WORKDIR /app/backend
EXPOSE 3000

ARG VERSION=unknown
ARG REVISION=unknown
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.revision="${REVISION}"

CMD ["node", "dist/index.js"]
