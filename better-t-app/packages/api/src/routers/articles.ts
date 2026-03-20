import { db } from "@better-t-app/db";
import {
  article,
  articleTheme,
  philosopher,
  theme,
} from "@better-t-app/db";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
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
      }),
    )
    .handler(async ({ input }) => {
      const conditions = [];

      if (input.featured !== undefined) {
        conditions.push(eq(article.featured, input.featured));
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

      // 関連記事（同じテーマ）
      const firstTheme = themes.at(0);
      const relatedArticles = firstTheme
          ? await db
              .select({
                id: article.id,
                slug: article.slug,
                title: article.title,
                tag: article.tag,
              })
              .from(article)
              .innerJoin(articleTheme, eq(articleTheme.articleId, article.id))
              .where(
                and(
                  eq(articleTheme.themeId, firstTheme.id),
                  sql`${article.id} != ${row.id}`,
                ),
              )
              .limit(4)
              .all()
          : [];

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
      };
    }),
};
