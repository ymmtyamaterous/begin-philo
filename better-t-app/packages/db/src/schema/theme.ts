import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { articleTheme } from "./article";
import { glossaryTerm } from "./glossary";

export const theme = sqliteTable("theme", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  number: integer("number").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const themeRelations = relations(theme, ({ many }) => ({
  articleThemes: many(articleTheme),
  glossaryTerms: many(glossaryTerm),
}));
