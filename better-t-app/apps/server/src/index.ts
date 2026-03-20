import { runMigrations } from "@better-t-app/db";
import { createContext } from "@better-t-app/api/context";
import { appRouter } from "@better-t-app/api/routers/index";
import { auth } from "@better-t-app/auth";
import { env } from "@better-t-app/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { dirname, join } from "node:path";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

if (env.NODE_ENV === "production") {
  // import.meta.url はバンドル後も実行時のファイルパスを指す
  // (例: /app/server/index.mjs) → ../web = /app/web
  // CWD に依存しないため working_dir が違っても確実に解決できる
  const webRoot = join(dirname(new URL(import.meta.url).pathname), "../web");

  app.use("/*", async (c, _next) => {
    const urlPath = new URL(c.req.url).pathname;
    // ディレクトリトラバーサル防止
    const safePath = urlPath.replace(/\.\./g, "").replace(/\/+/g, "/");
    const file = Bun.file(join(webRoot, safePath));
    if (await file.exists()) {
      return new Response(file);
    }
    // SPA フォールバック: クライアントルーティング用に index.html を返す
    return new Response(Bun.file(join(webRoot, "index.html")));
  });
} else {
  app.get("/", (c) => {
    return c.text("OK");
  });
}

// 未適用マイグレーションをアプリ起動前に実行する
// 失敗してもサーバーは起動させる（DB 未作成など初回以外のエラーを防ぐ）
try {
  await runMigrations();
} catch (e) {
  console.error("[db] migration failed:", e);
}
await runMigrations();

export default app;
