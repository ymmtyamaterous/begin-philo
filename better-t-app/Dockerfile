# syntax=docker/dockerfile:1

FROM oven/bun:1 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

# FROM gcr.io/distroless/base-debian12
FROM gcr.io/distroless/cc-debian12
# 上記が機能しなかった場合
# FROM oven/bun:1-slim
WORKDIR /app
# ランタイム
COPY --from=builder /usr/local/bin/bun /usr/local/bin/bun
# フロントエンド
COPY --from=builder /app/apps/web/dist ./web
# バックエンド
COPY --from=builder /app/apps/server/dist ./server
COPY --from=builder /app/node_modules ./node_modules

CMD ["/usr/local/bin/bun", "server/index.mjs"]
