import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { philosopher } from "./philosopher";

export const quote = sqliteTable(
  "quote",
  {
    id: text("id").primaryKey(),
    text: text("text").notNull(),
    source: text("source"),
    philosopherId: text("philosopher_id")
      .notNull()
      .references(() => philosopher.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("quote_philosopher_id_idx").on(table.philosopherId)],
);

export const quoteRelations = relations(quote, ({ one }) => ({
  philosopher: one(philosopher, {
    fields: [quote.philosopherId],
    references: [philosopher.id],
  }),
}));
