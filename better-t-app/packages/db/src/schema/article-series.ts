import { relations, sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { article } from "./article";

export const articleSeries = sqliteTable("article_series", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const articleSeriesItem = sqliteTable(
  "article_series_item",
  {
    seriesId: text("series_id")
      .notNull()
      .references(() => articleSeries.id, { onDelete: "cascade" }),
    articleId: text("article_id")
      .notNull()
      .references(() => article.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.seriesId, table.articleId] }),
    index("article_series_item_series_id_idx").on(table.seriesId),
  ],
);

export const articleSeriesRelations = relations(articleSeries, ({ many }) => ({
  items: many(articleSeriesItem),
}));

export const articleSeriesItemRelations = relations(articleSeriesItem, ({ one }) => ({
  series: one(articleSeries, {
    fields: [articleSeriesItem.seriesId],
    references: [articleSeries.id],
  }),
  article: one(article, {
    fields: [articleSeriesItem.articleId],
    references: [article.id],
  }),
}));
