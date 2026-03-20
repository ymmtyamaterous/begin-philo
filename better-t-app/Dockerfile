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
# Vite ビルド時に静的埋め込みされる値。--build-arg で渡す
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
RUN bun run build && \
    # libsql は JS ラッパー + プラットフォーム固有 native binary の2パッケージ構成
    # tsdown が pure-JS 依存をすべてバンドルするため、runtime で必要なのはこの2パッケージのみ
    # .bun/ 配下の正規パス (libsql@x.y.z/node_modules/libsql) から直接コピー
    LIBSQL_SRC=$(find /app/node_modules/.bun -maxdepth 3 -type d -name "libsql" -path "*/libsql@*/node_modules/libsql" | head -1) && \
    [ -n "$LIBSQL_SRC" ] && cp -r "$LIBSQL_SRC" /app/node_modules/libsql || true && \
    GNU_SRC=$(find /app/node_modules/.bun -maxdepth 4 -type d -name "linux-x64-gnu" | head -1) && \
    mkdir -p /app/node_modules/@libsql && \
    [ -n "$GNU_SRC" ] && cp -r "$GNU_SRC" /app/node_modules/@libsql/linux-x64-gnu || true

# ── Stage 4: Runner ──────────────────────────────────────────────────────────
FROM gcr.io/distroless/cc-debian12
# FROM oven/bun:1-slim
WORKDIR /app
# Bun ランタイム
COPY --from=builder /usr/local/bin/bun /usr/local/bin/bun
# フロントエンド (SPA 静的ファイル)
COPY --from=builder /app/apps/web/dist ./web
# バックエンド (バンドル済みサーバー - better-auth/hono/@orpc/drizzle-orm 等は全てインライン済み)
COPY --from=builder /app/apps/server/dist ./server
# マイグレーション SQL ファイル
COPY --from=builder /app/packages/db/src/migrations ./migrations
# libsql JS ラッパー + linux-x64-gnu native binary（その他の依存は tsdown バンドルに包含済み）
COPY --from=builder /app/node_modules/libsql ./node_modules/libsql
COPY --from=builder /app/node_modules/@libsql/linux-x64-gnu ./node_modules/@libsql/linux-x64-gnu

CMD ["/usr/local/bin/bun", "server/index.mjs"]
# CMD ["bun", "server/index.mjs"]
