import { db } from "@better-t-app/db";
import { course, lesson } from "@better-t-app/db";
import { ORPCError } from "@orpc/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export const coursesRouter = {
  list: publicProcedure
    .input(
      z.object({
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const conditions = input.difficulty ? [eq(course.difficulty, input.difficulty)] : [];

      const courses = await db
        .select({
          id: course.id,
          slug: course.slug,
          number: course.number,
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          estimatedMinutes: course.estimatedMinutes,
        })
        .from(course)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(course.number))
        .all();

      // 各コースのレッスン数を取得
      const coursesWithLessons = await Promise.all(
        courses.map(async (c) => {
          const countRow = await db
            .select({ count: sql<number>`count(*)` })
            .from(lesson)
            .where(eq(lesson.courseId, c.id))
            .get();
          const lessonCount = countRow?.count ?? 0;

          const difficultyLabel =
            c.difficulty === "beginner"
              ? "入門"
              : c.difficulty === "intermediate"
                ? "中級"
                : "応用";

          return {
            ...c,
            lessonCount,
            tag: `${difficultyLabel} · ${c.estimatedMinutes}分`,
          };
        }),
      );

      return { courses: coursesWithLessons };
    }),

  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const row = await db
        .select()
        .from(course)
        .where(eq(course.slug, input.slug))
        .get();

      if (!row) {
        throw new ORPCError("NOT_FOUND", { message: "コースが見つかりません" });
      }

      const lessons = await db
        .select({
          id: lesson.id,
          slug: lesson.slug,
          number: lesson.number,
          title: lesson.title,
          description: lesson.description,
          estimatedMinutes: lesson.estimatedMinutes,
        })
        .from(lesson)
        .where(eq(lesson.courseId, row.id))
        .orderBy(asc(lesson.number))
        .all();

      return {
        id: row.id,
        slug: row.slug,
        number: row.number,
        title: row.title,
        description: row.description,
        difficulty: row.difficulty,
        estimatedMinutes: row.estimatedMinutes,
        lessons,
      };
    }),

  getLesson: publicProcedure
    .input(
      z.object({
        courseSlug: z.string(),
        lessonSlug: z.string(),
      }),
    )
    .handler(async ({ input }) => {
      const courseRow = await db
        .select()
        .from(course)
        .where(eq(course.slug, input.courseSlug))
        .get();

      if (!courseRow) {
        throw new ORPCError("NOT_FOUND", { message: "コースが見つかりません" });
      }

      const lessonRow = await db
        .select()
        .from(lesson)
        .where(and(eq(lesson.slug, input.lessonSlug), eq(lesson.courseId, courseRow.id)))
        .get();

      if (!lessonRow) {
        throw new ORPCError("NOT_FOUND", { message: "レッスンが見つかりません" });
      }

      const allLessons = await db
        .select({ id: lesson.id, slug: lesson.slug, title: lesson.title, number: lesson.number })
        .from(lesson)
        .where(eq(lesson.courseId, courseRow.id))
        .orderBy(asc(lesson.number))
        .all();

      const currentIdx = allLessons.findIndex((l) => l.id === lessonRow.id);
      const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
      const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

      return {
        id: lessonRow.id,
        slug: lessonRow.slug,
        number: lessonRow.number,
        title: lessonRow.title,
        content: lessonRow.content,
        estimatedMinutes: lessonRow.estimatedMinutes,
        prevLesson: prevLesson ? { slug: prevLesson.slug, title: prevLesson.title } : null,
        nextLesson: nextLesson ? { slug: nextLesson.slug, title: nextLesson.title } : null,
        course: { id: courseRow.id, slug: courseRow.slug, title: courseRow.title },
      };
    }),
};
