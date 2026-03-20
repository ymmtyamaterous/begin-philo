import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { philosopher } from "./philosopher";
import { theme } from "./theme";

export const glossaryTerm = sqliteTable("glossary_term", {
  id: text("id").primaryKey(),
  term: text("term").notNull().unique(),
  reading: text("reading").notNull(),
  definition: text("definition").notNull(),
  detail: text("detail"),
  philosopherId: text("philosopher_id").references(() => philosopher.id),
  themeId: text("theme_id").references(() => theme.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const glossaryTermRelations = relations(glossaryTerm, ({ one }) => ({
  philosopher: one(philosopher, {
    fields: [glossaryTerm.philosopherId],
    references: [philosopher.id],
  }),
  theme: one(theme, {
    fields: [glossaryTerm.themeId],
    references: [theme.id],
  }),
}));
