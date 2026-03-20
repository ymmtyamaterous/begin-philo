import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { article } from "./article";
import { glossaryTerm } from "./glossary";
import { quote } from "./quote";

export const philosopher = sqliteTable("philosopher", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  initial: text("initial").notNull(),
  era: text("era").notNull(),
  birthYear: integer("birth_year"),
  deathYear: integer("death_year"),
  region: text("region").notNull(),
  shortBio: text("short_bio").notNull(),
  biography: text("biography").notNull(),
  keyIdeas: text("key_ideas").notNull(), // JSON配列
  majorWorks: text("major_works").notNull(), // JSON配列
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const philosopherRelations = relations(philosopher, ({ many }) => ({
  articles: many(article),
  quotes: many(quote),
  glossaryTerms: many(glossaryTerm),
}));
