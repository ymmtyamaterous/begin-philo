import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./dist",
  clean: true,
  // libsql のみ external として残す（Rust native binary .node ファイルを持つため bundle 不可）
  // better-auth / hono / drizzle-orm / @orpc/* 等の純粋 JS 依存はすべてバンドルに取り込む
  noExternal: [/^(?!libsql(\/|$))/],
});
