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
 * MIGRATIONS_FOLDER 環境変数 > import.meta.dirname の順で解決する。
 * bun build / tsdown (rolldown) はバンドラーによって import.meta.dirname の
 * 解決タイミング（ビルド時 or ランタイム）が異なるため、環境変数で明示指定する。
 */
export async function runMigrations() {
  const migrationsFolder =
    process.env.MIGRATIONS_FOLDER ?? `${import.meta.dirname}/migrations`;
  await migrate(db, { migrationsFolder });
  console.log("[db] migrations applied");
}

export * from "./schema";
