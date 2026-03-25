import { db } from "@better-t-app/db";
import {
  article,
  articleTheme,
  philosopher,
  quote,
  theme,
} from "@better-t-app/db";
import { ORPCError } from "@orpc/server";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export const philosophersRouter = {
  list: publicProcedure
    .input(
      z.object({
        region: z.enum(["western", "eastern"]).optional(),
        era: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .handler(async ({ input }) => {
      const conditions = [];

      if (input.region === "western") {
        conditions.push(sql`${philosopher.region} NOT IN ('中国', '日本', 'インド', '東洋')`);
      } else if (input.region === "eastern") {
        conditions.push(sql`${philosopher.region} IN ('中国', '日本', 'インド', '東洋')`);
      }

      if (input.era) {
        conditions.push(sql`${philosopher.era} LIKE ${"%" + input.era + "%"}`);
      }

      const rows = await db
        .select({
          id: philosopher.id,
          slug: philosopher.slug,
          name: philosopher.name,
          nameEn: philosopher.nameEn,
          initial: philosopher.initial,
          era: philosopher.era,
          birthYear: philosopher.birthYear,
          region: philosopher.region,
          shortBio: philosopher.shortBio,
        })
        .from(philosopher)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(philosopher.birthYear))
        .limit(input.limit)
        .offset(input.offset)
        .all();

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(philosopher)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .get();

      return { philosophers: rows, total: total?.count ?? 0 };
    }),

  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const row = await db
        .select()
        .from(philosopher)
        .where(eq(philosopher.slug, input.slug))
        .get();

      if (!row) {
        throw new ORPCError("NOT_FOUND", { message: "哲学者が見つかりません" });
      }

      // 関連テーマ
      const themes = await db
        .select({ id: theme.id, name: theme.name, slug: theme.slug })
        .from(theme)
        .innerJoin(articleTheme, eq(articleTheme.themeId, theme.id))
        .innerJoin(article, eq(article.id, articleTheme.articleId))
        .where(eq(article.philosopherId, row.id))
        .groupBy(theme.id)
        .all();

      // 関連記事
      const articles = await db
        .select({ id: article.id, slug: article.slug, title: article.title, tag: article.tag })
        .from(article)
        .where(eq(article.philosopherId, row.id))
        .limit(6)
        .all();

      // 名言
      const quotes = await db
        .select({ id: quote.id, text: quote.text })
        .from(quote)
        .where(eq(quote.philosopherId, row.id))
        .all();

      // 関連哲学者（同じ地域・除く自分）
      const relatedPhilosophers = await db
        .select({
          id: philosopher.id,
          slug: philosopher.slug,
          name: philosopher.name,
          initial: philosopher.initial,
          era: philosopher.era,
          region: philosopher.region,
          shortBio: philosopher.shortBio,
        })
        .from(philosopher)
        .where(
          and(
            ne(philosopher.id, row.id),
            eq(philosopher.region, row.region),
          ),
        )
        .orderBy(asc(philosopher.birthYear))
        .limit(3)
        .all();

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        nameEn: row.nameEn,
        initial: row.initial,
        era: row.era,
        birthYear: row.birthYear,
        deathYear: row.deathYear,
        region: row.region,
        biography: row.biography,
        keyIdeas: JSON.parse(row.keyIdeas) as string[],
        majorWorks: JSON.parse(row.majorWorks) as string[],
        themes,
        articles,
        quotes,
        relatedPhilosophers,
      };
    }),
};
