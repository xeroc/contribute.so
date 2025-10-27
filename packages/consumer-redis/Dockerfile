FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/consumer-redis/package.json ./packages/consumer-redis/package.json
COPY packages/lib/package.json ./packages/lib/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

FROM base AS build
COPY --from=deps /app /app
COPY packages/lib /app/packages/lib
COPY packages/consumer-redis /app/packages/consumer-redis

WORKDIR /app/packages/consumer-redis
RUN pnpm run build
CMD [ "pnpm", "start" ]
