import { db } from "@better-t-app/db";
import { article, course, philosopher, userBookmark } from "@better-t-app/db";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

export const bookmarksRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;

    const rows = await db
      .select()
      .from(userBookmark)
      .where(eq(userBookmark.userId, userId))
      .all();

    // 各ブックマークの対象情報を取得
    const bookmarks = await Promise.all(
      rows.map(async (r) => {
        let targetSlug = "";
        let targetTitle = "";

        if (r.targetType === "article") {
          const row = await db
            .select({ slug: article.slug, title: article.title })
            .from(article)
            .where(eq(article.id, r.targetId))
            .get();
          targetSlug = row?.slug ?? "";
          targetTitle = row?.title ?? "";
        } else if (r.targetType === "philosopher") {
          const row = await db
            .select({ slug: philosopher.slug, name: philosopher.name })
            .from(philosopher)
            .where(eq(philosopher.id, r.targetId))
            .get();
          targetSlug = row?.slug ?? "";
          targetTitle = row?.name ?? "";
        } else if (r.targetType === "course") {
          const row = await db
            .select({ slug: course.slug, title: course.title })
            .from(course)
            .where(eq(course.id, r.targetId))
            .get();
          targetSlug = row?.slug ?? "";
          targetTitle = row?.title ?? "";
        }

        return {
          id: r.id,
          type: r.targetType,
          targetId: r.targetId,
          targetSlug,
          targetTitle,
          createdAt: r.createdAt as Date,
        };
      }),
    );

    return { bookmarks };
  }),

  add: protectedProcedure
    .input(
      z.object({
        type: z.enum(["article", "philosopher", "course"]),
        targetId: z.string(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const existing = await db
        .select()
        .from(userBookmark)
        .where(
          and(
            eq(userBookmark.userId, userId),
            eq(userBookmark.targetType, input.type),
            eq(userBookmark.targetId, input.targetId),
          ),
        )
        .get();

      if (existing) {
        return { success: true, bookmarkId: existing.id };
      }

      const id = crypto.randomUUID();
      await db.insert(userBookmark).values({
        id,
        userId,
        targetType: input.type,
        targetId: input.targetId,
        createdAt: new Date(),
      });

      return { success: true, bookmarkId: id };
    }),

  remove: protectedProcedure
    .input(z.object({ bookmarkId: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const existing = await db
        .select()
        .from(userBookmark)
        .where(
          and(eq(userBookmark.id, input.bookmarkId), eq(userBookmark.userId, userId)),
        )
        .get();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "ブックマークが見つかりません" });
      }

      await db
        .delete(userBookmark)
        .where(eq(userBookmark.id, input.bookmarkId));

      return { success: true };
    }),
};
