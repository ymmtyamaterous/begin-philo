# syntax=docker/dockerfile:1

# ── Stage 1: Pruner ──────────────────────────────────────────────────────────
# Turborepo の prune で server / web に必要なファイルのみを抽出する
FROM oven/bun:1 AS pruner
WORKDIR /app
COPY . .
# turbo はルート devDependencies に含まれているため bunx で実行可能
RUN bun install --frozen-lockfile && \
    bunx turbo prune server web --docker

# ── Stage 2: Installer ───────────────────────────────────────────────────────
# package.json / lockfile のみコピー → bun install をキャッシュレイヤーとして分離
# (依存関係が変わらない限りこのレイヤーは再利用される)
FROM oven/bun:1 AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile

# ── Stage 3: Builder ─────────────────────────────────────────────────────────
# node_modules はインストールレイヤーから、ソースは pruner から取得してビルド
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
RUN bun run build

# ── Stage 4: Runner ──────────────────────────────────────────────────────────
FROM gcr.io/distroless/cc-debian12
WORKDIR /app
# Bun ランタイム
COPY --from=builder /usr/local/bin/bun /usr/local/bin/bun
# フロントエンド (SPA 静的ファイル)
COPY --from=builder /app/apps/web/dist ./web
# バックエンド (バンドル済みサーバー)
COPY --from=builder /app/apps/server/dist ./server
# 外部依存ライブラリ (hono / better-auth / libsql 等)
COPY --from=builder /app/node_modules ./node_modules

CMD ["/usr/local/bin/bun", "server/index.mjs"]
