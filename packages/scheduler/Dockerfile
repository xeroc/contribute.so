FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/scheduler/package.json ./packages/scheduler/package.json
COPY packages/lib/package.json ./packages/lib/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

FROM base AS build
COPY --from=deps /app /app
COPY packages/lib /app/packages/lib
COPY packages/scheduler /app/packages/scheduler

WORKDIR /app/packages/scheduler
RUN pnpm run build
CMD [ "pnpm", "start" ]
