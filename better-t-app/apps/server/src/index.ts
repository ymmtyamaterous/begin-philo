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

// ファイル拡張子 → Content-Type マップ
// Bun.file().type は絶対パスでは空になる場合があるため明示的に指定する
const MIME: Record<string, string> = {
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  html: "text/html; charset=utf-8",
  json: "application/json; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  webp: "image/webp",
};

if (env.NODE_ENV === "production") {
  // import.meta.url = file:///app/server/index.mjs → ../web = /app/web
  // CWD に依存しないため compose.yml の working_dir が違っても安全
  const webRoot = new URL("../web", import.meta.url).pathname;

  app.use("/*", async (c) => {
    const reqPath = new URL(c.req.url).pathname;
    const ext = reqPath.split(".").pop() ?? "";
    const filePath = `${webRoot}${reqPath}`;
    const file = Bun.file(filePath);

    if (await file.exists()) {
      // 拡張子から Content-Type を決定（MIME マップにない場合は Bun の検出値を使用）
      const contentType = MIME[ext] ?? file.type ?? "application/octet-stream";
      return new Response(file, { headers: { "Content-Type": contentType } });
    }

    // SPA フォールバック: クライアントルーティング用に index.html を返す
    return new Response(Bun.file(`${webRoot}/index.html`), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
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

export default app;
