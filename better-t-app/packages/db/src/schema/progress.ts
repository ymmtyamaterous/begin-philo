import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { lesson } from "./course";
import { user } from "./auth";

export const userLessonProgress = sqliteTable(
  "user_lesson_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("user_lesson_progress_user_id_idx").on(table.userId),
    unique("user_lesson_progress_unique").on(table.userId, table.lessonId),
  ],
);

export const userLessonProgressRelations = relations(userLessonProgress, ({ one }) => ({
  user: one(user, {
    fields: [userLessonProgress.userId],
    references: [user.id],
  }),
  lesson: one(lesson, {
    fields: [userLessonProgress.lessonId],
    references: [lesson.id],
  }),
}));
