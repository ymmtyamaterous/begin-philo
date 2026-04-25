import { db } from "@better-t-app/db";
import { course, lesson, userLessonProgress } from "@better-t-app/db";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

export const progressRouter = {
  get: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;

    const progressRows = await db
      .select({
        id: userLessonProgress.id,
        lessonId: userLessonProgress.lessonId,
        completedAt: userLessonProgress.completedAt,
        lessonSlug: lesson.slug,
        courseId: lesson.courseId,
      })
      .from(userLessonProgress)
      .innerJoin(lesson, eq(userLessonProgress.lessonId, lesson.id))
      .where(eq(userLessonProgress.userId, userId))
      .all();

    // コース別に完了済みレッスン数をカウントして完了コースを判定
    const courseMap = new Map<string, { courseId: string; completedLessons: number }>();
    for (const row of progressRows) {
      const existing = courseMap.get(row.courseId);
      if (existing) {
        existing.completedLessons++;
      } else {
        courseMap.set(row.courseId, { courseId: row.courseId, completedLessons: 1 });
      }
    }

    const completedCourses: Array<{
      courseId: string;
      courseSlug: string;
      courseTitle: string;
      completedAt: Date;
    }> = [];

    for (const [courseId, info] of courseMap) {
      const courseRow = await db
        .select({ id: course.id, slug: course.slug, title: course.title })
        .from(course)
        .where(eq(course.id, courseId))
        .get();

      const totalLessons = await db
        .select({ count: lesson.id })
        .from(lesson)
        .where(eq(lesson.courseId, courseId))
        .all();

      if (courseRow && info.completedLessons >= totalLessons.length && totalLessons.length > 0) {
        const lastCompleted = progressRows
          .filter((r) => r.courseId === courseId)
          .sort((a, b) => {
            const aTime = a.completedAt instanceof Date ? a.completedAt.getTime() : Number(a.completedAt);
            const bTime = b.completedAt instanceof Date ? b.completedAt.getTime() : Number(b.completedAt);
            return bTime - aTime;
          })
          .at(0);

        if (!lastCompleted) continue;

        completedCourses.push({
          courseId: courseRow.id,
          courseSlug: courseRow.slug,
          courseTitle: courseRow.title,
          completedAt: lastCompleted.completedAt as Date,
        });
      }
    }

    // courseSlug を取得するため lesson から course へ join
    const completedLessons = await Promise.all(
      progressRows.map(async (r) => {
        const courseRow = await db
          .select({ slug: course.slug })
          .from(course)
          .where(eq(course.id, r.courseId))
          .get();
        return {
          lessonId: r.lessonId,
          lessonSlug: r.lessonSlug,
          courseSlug: courseRow?.slug ?? "",
          completedAt: r.completedAt as Date,
        };
      }),
    );

    return {
      completedLessons,
      completedCourses,
      totalCompletedLessons: completedLessons.length,
      totalCompletedCourses: completedCourses.length,
    };
  }),

  completeLesson: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const lessonRow = await db
        .select()
        .from(lesson)
        .where(eq(lesson.id, input.lessonId))
        .get();

      if (!lessonRow) {
        throw new ORPCError("NOT_FOUND", { message: "レッスンが見つかりません" });
      }

      // 既に完了済みかチェック
      const existing = await db
        .select()
        .from(userLessonProgress)
        .where(
          and(
            eq(userLessonProgress.userId, userId),
            eq(userLessonProgress.lessonId, input.lessonId),
          ),
        )
        .get();

      if (!existing) {
        await db.insert(userLessonProgress).values({
          id: crypto.randomUUID(),
          userId,
          lessonId: input.lessonId,
          completedAt: new Date(),
        });
      }

      // コース完了チェック
      const allLessons = await db
        .select({ id: lesson.id })
        .from(lesson)
        .where(eq(lesson.courseId, lessonRow.courseId))
        .all();

      const allCompletedRows = await db
        .select({ lessonId: userLessonProgress.lessonId })
        .from(userLessonProgress)
        .innerJoin(lesson, eq(userLessonProgress.lessonId, lesson.id))
        .where(
          and(
            eq(userLessonProgress.userId, userId),
            eq(lesson.courseId, lessonRow.courseId),
          ),
        )
        .all();

      const courseCompleted = allCompletedRows.length >= allLessons.length;

      return { success: true, courseCompleted };
    }),

  uncompleteLesson: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      await db
        .delete(userLessonProgress)
        .where(
          and(
            eq(userLessonProgress.userId, userId),
            eq(userLessonProgress.lessonId, input.lessonId),
          ),
        );

      return { success: true };
    }),
};
