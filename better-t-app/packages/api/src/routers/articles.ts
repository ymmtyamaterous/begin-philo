import { db } from "@better-t-app/db";
import {
  article,
  articleTheme,
  philosopher,
  theme,
} from "@better-t-app/db";
import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, inArray, lte, ne, sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export const articlesRouter = {
  list: publicProcedure
    .input(
      z.object({
        themeSlug: z.string().optional(),
        philosopherSlug: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        featured: z.boolean().optional(),
        maxReadingTime: z.number().positive().optional(),
        minReadingTime: z.number().positive().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const conditions = [];

      if (input.featured !== undefined) {
        conditions.push(eq(article.featured, input.featured));
      }

      if (input.maxReadingTime !== undefined) {
        conditions.push(lte(article.readingTime, input.maxReadingTime));
      }

      if (input.minReadingTime !== undefined) {
        conditions.push(sql`${article.readingTime} >= ${input.minReadingTime}`);
      }

      if (input.philosopherSlug) {
        const philo = await db
          .select({ id: philosopher.id })
          .from(philosopher)
          .where(eq(philosopher.slug, input.philosopherSlug))
          .get();
        if (philo) {
          conditions.push(eq(article.philosopherId, philo.id));
        }
      }

      const articlesRaw = await db
        .select({
          id: article.id,
          slug: article.slug,
          title: article.title,
          description: article.description,
          tag: article.tag,
          readingTime: article.readingTime,
          publishedAt: article.publishedAt,
          featured: article.featured,
          philosopherId: article.philosopherId,
          philosopherName: philosopher.name,
          philosopherSlug: philosopher.slug,
        })
        .from(article)
        .leftJoin(philosopher, eq(article.philosopherId, philosopher.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(article.publishedAt))
        .limit(input.limit)
        .offset(input.offset)
        .all();

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(article)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .get();

      // テーマ別フィルタが必要な場合は追加フィルタリング
      let filtered = articlesRaw;
      if (input.themeSlug) {
        const themeRow = await db
          .select({ id: theme.id })
          .from(theme)
          .where(eq(theme.slug, input.themeSlug))
          .get();
        if (themeRow) {
          const articleIds = await db
            .select({ articleId: articleTheme.articleId })
            .from(articleTheme)
            .where(eq(articleTheme.themeId, themeRow.id))
            .all();
          const idSet = new Set(articleIds.map((r) => r.articleId));
          filtered = articlesRaw.filter((a) => idSet.has(a.id));
        }
      }

      // 各記事のテーマを取得
      const articlesWithThemes = await Promise.all(
        filtered.map(async (a) => {
          const themes = await db
            .select({
              id: theme.id,
              name: theme.name,
              slug: theme.slug,
            })
            .from(theme)
            .innerJoin(articleTheme, eq(articleTheme.themeId, theme.id))
            .where(eq(articleTheme.articleId, a.id))
            .all();

          return {
            id: a.id,
            slug: a.slug,
            title: a.title,
            description: a.description,
            tag: a.tag,
            readingTime: a.readingTime,
            publishedAt: a.publishedAt,
            featured: a.featured,
            themes,
            philosopher:
              a.philosopherId && a.philosopherName && a.philosopherSlug
                ? { id: a.philosopherId, name: a.philosopherName, slug: a.philosopherSlug }
                : null,
          };
        }),
      );

      return { articles: articlesWithThemes, total: total?.count ?? 0 };
    }),

  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const row = await db
        .select({
          id: article.id,
          slug: article.slug,
          title: article.title,
          description: article.description,
          content: article.content,
          tag: article.tag,
          readingTime: article.readingTime,
          publishedAt: article.publishedAt,
          featured: article.featured,
          philosopherId: article.philosopherId,
          philosopherName: philosopher.name,
          philosopherSlug: philosopher.slug,
        })
        .from(article)
        .leftJoin(philosopher, eq(article.philosopherId, philosopher.id))
        .where(eq(article.slug, input.slug))
        .get();

      if (!row) {
        throw new ORPCError("NOT_FOUND", { message: "記事が見つかりません" });
      }

      const themes = await db
        .select({ id: theme.id, name: theme.name, slug: theme.slug })
        .from(theme)
        .innerJoin(articleTheme, eq(articleTheme.themeId, theme.id))
        .where(eq(articleTheme.articleId, row.id))
        .all();

      // 関連記事（全テーマ対応・重複除外・最大4件）
      const themeIds = themes.map((t) => t.id);
      const relatedArticles =
        themeIds.length > 0
          ? await db
              .select({
                id: article.id,
                slug: article.slug,
                title: article.title,
                tag: article.tag,
                readingTime: article.readingTime,
              })
              .from(article)
              .innerJoin(articleTheme, eq(articleTheme.articleId, article.id))
              .where(
                and(
                  ne(article.id, row.id),
                  inArray(articleTheme.themeId, themeIds),
                ),
              )
              .groupBy(article.id)
              .orderBy(desc(article.publishedAt))
              .limit(4)
              .all()
          : [];

      // 関連哲学者（同じ地域の哲学者、記事の哲学者は除く）
      const relatedPhilosophers =
        row.philosopherId
          ? await db
              .select({
                id: philosopher.id,
                slug: philosopher.slug,
                name: philosopher.name,
                initial: philosopher.initial,
                shortBio: philosopher.shortBio,
              })
              .from(philosopher)
              .where(
                and(
                  ne(philosopher.id, row.philosopherId),
                  sql`${philosopher.id} IN (
                    SELECT p.id FROM philosopher p
                    WHERE p.region = (
                      SELECT region FROM philosopher WHERE id = ${row.philosopherId}
                    )
                    AND p.id != ${row.philosopherId}
                    ORDER BY p.birth_year ASC
                    LIMIT 2
                  )`,
                ),
              )
              .all()
          : await db
              .select({
                id: philosopher.id,
                slug: philosopher.slug,
                name: philosopher.name,
                initial: philosopher.initial,
                shortBio: philosopher.shortBio,
              })
              .from(philosopher)
              .innerJoin(article, eq(article.philosopherId, philosopher.id))
              .innerJoin(articleTheme, eq(articleTheme.articleId, article.id))
              .where(
                themeIds.length > 0
                  ? inArray(articleTheme.themeId, themeIds)
                  : sql`1=0`,
              )
              .groupBy(philosopher.id)
              .orderBy(asc(philosopher.birthYear))
              .limit(2)
              .all();

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        content: row.content,
        tag: row.tag,
        readingTime: row.readingTime,
        publishedAt: row.publishedAt,
        featured: row.featured,
        themes,
        philosopher:
          row.philosopherId && row.philosopherName && row.philosopherSlug
            ? { id: row.philosopherId, name: row.philosopherName, slug: row.philosopherSlug }
            : null,
        relatedArticles,
        relatedPhilosophers,
      };
    }),
};
