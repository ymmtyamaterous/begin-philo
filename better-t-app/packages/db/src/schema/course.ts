import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const course = sqliteTable("course", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  number: integer("number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const lesson = sqliteTable(
  "lesson",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    estimatedMinutes: integer("estimated_minutes").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("lesson_course_id_idx").on(table.courseId)],
);

export const courseRelations = relations(course, ({ many }) => ({
  lessons: many(lesson),
}));

export const lessonRelations = relations(lesson, ({ one }) => ({
  course: one(course, {
    fields: [lesson.courseId],
    references: [course.id],
  }),
}));
