import { env } from "@better-t-app/env/server";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import * as schema from "./schema";

const client = createClient({
  url: env.DATABASE_URL,
});

export const db = drizzle({ client, schema });

/**
 * アプリ起動時に一度だけ呼び出す。
 * ./migrations フォルダ内の未適用 SQL を順番に実行する。
 */
export async function runMigrations() {
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("[db] migrations applied");
}

export * from "./schema";
