import { db } from "@better-t-app/db";
import { quiz, quizOption, userQuizResult } from "@better-t-app/db";
import { ORPCError } from "@orpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";

export const quizRouter = {
  getByLesson: publicProcedure
    .input(z.object({ lessonId: z.string() }))
    .handler(async ({ input }) => {
      const quizzes = await db
        .select({
          id: quiz.id,
          question: quiz.question,
          order: quiz.order,
        })
        .from(quiz)
        .where(eq(quiz.lessonId, input.lessonId))
        .orderBy(asc(quiz.order))
        .all();

      const quizzesWithOptions = await Promise.all(
        quizzes.map(async (q) => {
          const options = await db
            .select({
              id: quizOption.id,
              text: quizOption.text,
              order: quizOption.order,
            })
            .from(quizOption)
            .where(eq(quizOption.quizId, q.id))
            .orderBy(asc(quizOption.order))
            .all();

          return { ...q, options };
        }),
      );

      return { quizzes: quizzesWithOptions };
    }),

  submit: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        selectedOptionId: z.string(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      // 選択肢が存在し正解かどうかを確認
      const optionRow = await db
        .select({ id: quizOption.id, isCorrect: quizOption.isCorrect, quizId: quizOption.quizId })
        .from(quizOption)
        .where(and(eq(quizOption.id, input.selectedOptionId), eq(quizOption.quizId, input.quizId)))
        .get();

      if (!optionRow) {
        throw new ORPCError("NOT_FOUND", { message: "選択肢が見つかりません" });
      }

      const quizRow = await db
        .select({ explanation: quiz.explanation })
        .from(quiz)
        .where(eq(quiz.id, input.quizId))
        .get();

      if (!quizRow) {
        throw new ORPCError("NOT_FOUND", { message: "クイズが見つかりません" });
      }

      // 正解の選択肢 ID を取得
      const correctOption = await db
        .select({ id: quizOption.id })
        .from(quizOption)
        .where(and(eq(quizOption.quizId, input.quizId), eq(quizOption.isCorrect, true)))
        .get();

      const isCorrect = optionRow.isCorrect;

      // 結果を upsert（既に回答済みの場合は更新）
      const existingResult = await db
        .select({ id: userQuizResult.id })
        .from(userQuizResult)
        .where(
          and(eq(userQuizResult.userId, userId), eq(userQuizResult.quizId, input.quizId)),
        )
        .get();

      if (existingResult) {
        await db
          .update(userQuizResult)
          .set({
            selectedOptionId: input.selectedOptionId,
            isCorrect,
            answeredAt: new Date(),
          })
          .where(eq(userQuizResult.id, existingResult.id));
      } else {
        await db.insert(userQuizResult).values({
          id: crypto.randomUUID(),
          userId,
          quizId: input.quizId,
          selectedOptionId: input.selectedOptionId,
          isCorrect,
          answeredAt: new Date(),
        });
      }

      return {
        isCorrect,
        explanation: quizRow.explanation ?? null,
        correctOptionId: correctOption?.id ?? null,
      };
    }),
};
