# ---------- Stage 1: Build ----------
FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

COPY package.json bun.lock* prisma.config.ts ./
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

RUN bun run build


# ---------- Stage 2: Production ----------
FROM oven/bun:1.3-alpine AS runner

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3001

CMD ["sh", "-c", "bunx prisma db push && bun run start:prod"]
