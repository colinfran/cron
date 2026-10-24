FROM node:20-alpine AS base

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# --- Build ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Collect pg and its dependencies for the migration script
RUN mkdir -p /pg-deps && \
  for pkg in pg pg-cloudflare pg-connection-string pg-pool pg-protocol pg-types pgpass pg-int8 postgres-array postgres-bytea postgres-date postgres-interval split2 xtend; do \
    if [ -d "node_modules/$pkg" ]; then cp -r "node_modules/$pkg" "/pg-deps/$pkg"; fi; \
  done

# --- Production ---
FROM base AS runner
LABEL org.opencontainers.image.title="Cron"
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/LICENSE /app/NOTICE.md ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy migration files, migrate script, and pg driver
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/db/migrations ./src/lib/db/migrations
COPY --from=builder --chown=nextjs:nodejs /app/migrate.mjs ./migrate.mjs
COPY --from=builder --chown=nextjs:nodejs /pg-deps/ ./node_modules/
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
