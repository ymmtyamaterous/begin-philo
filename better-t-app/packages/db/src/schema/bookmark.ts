import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const userBookmark = sqliteTable(
  "user_bookmark",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: text("target_type", { enum: ["article", "philosopher", "course"] }).notNull(),
    targetId: text("target_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("user_bookmark_user_id_idx").on(table.userId),
    unique("user_bookmark_unique").on(table.userId, table.targetType, table.targetId),
  ],
);

export const userBookmarkRelations = relations(userBookmark, ({ one }) => ({
  user: one(user, {
    fields: [userBookmark.userId],
    references: [user.id],
  }),
}));
