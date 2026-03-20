import { relations, sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { philosopher } from "./philosopher";
import { theme } from "./theme";

export const article = sqliteTable(
  "article",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    tag: text("tag").notNull(),
    readingTime: integer("reading_time").notNull(),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    philosopherId: text("philosopher_id").references(() => philosopher.id),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("article_philosopher_idx").on(table.philosopherId),
    index("article_published_at_idx").on(table.publishedAt),
    index("article_featured_idx").on(table.featured),
  ],
);

export const articleTheme = sqliteTable(
  "article_theme",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => article.id, { onDelete: "cascade" }),
    themeId: text("theme_id")
      .notNull()
      .references(() => theme.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.themeId] })],
);

export const articleRelations = relations(article, ({ one, many }) => ({
  philosopher: one(philosopher, {
    fields: [article.philosopherId],
    references: [philosopher.id],
  }),
  articleThemes: many(articleTheme),
}));

export const articleThemeRelations = relations(articleTheme, ({ one }) => ({
  article: one(article, {
    fields: [articleTheme.articleId],
    references: [article.id],
  }),
  theme: one(theme, {
    fields: [articleTheme.themeId],
    references: [theme.id],
  }),
}));
