import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { user } from "./auth";
import { lesson } from "./course";

export const quiz = sqliteTable(
  "quiz",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    explanation: text("explanation"),
    order: integer("order").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("quiz_lesson_id_idx").on(table.lessonId)],
);

export const quizOption = sqliteTable(
  "quiz_option",
  {
    id: text("id").primaryKey(),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull().default(false),
    order: integer("order").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("quiz_option_quiz_id_idx").on(table.quizId)],
);

export const userQuizResult = sqliteTable(
  "user_quiz_result",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    selectedOptionId: text("selected_option_id")
      .notNull()
      .references(() => quizOption.id),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
    answeredAt: integer("answered_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("user_quiz_result_user_id_idx").on(table.userId),
    uniqueIndex("user_quiz_result_unique_idx").on(table.userId, table.quizId),
  ],
);

export const quizRelations = relations(quiz, ({ one, many }) => ({
  lesson: one(lesson, {
    fields: [quiz.lessonId],
    references: [lesson.id],
  }),
  options: many(quizOption),
  results: many(userQuizResult),
}));

export const quizOptionRelations = relations(quizOption, ({ one }) => ({
  quiz: one(quiz, {
    fields: [quizOption.quizId],
    references: [quiz.id],
  }),
}));

export const userQuizResultRelations = relations(userQuizResult, ({ one }) => ({
  user: one(user, {
    fields: [userQuizResult.userId],
    references: [user.id],
  }),
  quiz: one(quiz, {
    fields: [userQuizResult.quizId],
    references: [quiz.id],
  }),
  selectedOption: one(quizOption, {
    fields: [userQuizResult.selectedOptionId],
    references: [quizOption.id],
  }),
}));
