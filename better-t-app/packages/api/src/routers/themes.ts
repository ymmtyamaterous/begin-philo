import { db } from "@better-t-app/db";
import { article, articleTheme, theme } from "@better-t-app/db";
import { ORPCError } from "@orpc/server";
import { asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export const themesRouter = {
  list: publicProcedure.handler(async () => {
    const themes = await db
      .select({
        id: theme.id,
        slug: theme.slug,
        number: theme.number,
        name: theme.name,
        description: theme.description,
      })
      .from(theme)
      .orderBy(asc(theme.number))
      .all();

    const themesWithCount = await Promise.all(
      themes.map(async (t) => {
        const countRow = await db
          .select({ count: sql<number>`count(*)` })
          .from(articleTheme)
          .where(eq(articleTheme.themeId, t.id))
          .get();
        return { ...t, articleCount: countRow?.count ?? 0 };
      }),
    );

    return { themes: themesWithCount };
  }),

  get: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .handler(async ({ input }) => {
      const row = await db
        .select()
        .from(theme)
        .where(eq(theme.slug, input.slug))
        .get();

      if (!row) {
        throw new ORPCError("NOT_FOUND", { message: "テーマが見つかりません" });
      }

      const articles = await db
        .select({
          id: article.id,
          slug: article.slug,
          title: article.title,
          description: article.description,
          readingTime: article.readingTime,
          publishedAt: article.publishedAt,
        })
        .from(article)
        .innerJoin(articleTheme, eq(articleTheme.articleId, article.id))
        .where(eq(articleTheme.themeId, row.id))
        .orderBy(desc(article.publishedAt))
        .limit(input.limit)
        .offset(input.offset)
        .all();

      const totalRow = await db
        .select({ count: sql<number>`count(*)` })
        .from(articleTheme)
        .where(eq(articleTheme.themeId, row.id))
        .get();

      return {
        id: row.id,
        slug: row.slug,
        number: row.number,
        name: row.name,
        description: row.description,
        articles,
        total: totalRow?.count ?? 0,
      };
    }),
};
