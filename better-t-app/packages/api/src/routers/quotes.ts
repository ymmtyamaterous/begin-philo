import { db } from "@better-t-app/db";
import { philosopher, quote } from "@better-t-app/db";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export const quotesRouter = {
  getRandom: publicProcedure
    .input(
      z.object({
        count: z.number().min(1).max(20).default(1),
      }),
    )
    .handler(async ({ input }) => {
      const quotes = await db
        .select({
          id: quote.id,
          text: quote.text,
          philosopherName: philosopher.name,
          philosopherSlug: philosopher.slug,
        })
        .from(quote)
        .innerJoin(philosopher, eq(quote.philosopherId, philosopher.id))
        .orderBy(sql`RANDOM()`)
        .limit(input.count)
        .all();

      return { quotes };
    }),

  list: publicProcedure
    .input(
      z.object({
        philosopherSlug: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .handler(async ({ input }) => {
      const conditions = [];

      if (input.philosopherSlug) {
        const philo = await db
          .select({ id: philosopher.id })
          .from(philosopher)
          .where(eq(philosopher.slug, input.philosopherSlug))
          .get();
        if (philo) {
          conditions.push(eq(quote.philosopherId, philo.id));
        }
      }

      const rows = await db
        .select({
          id: quote.id,
          text: quote.text,
          source: quote.source,
          philosopherId: philosopher.id,
          philosopherName: philosopher.name,
          philosopherSlug: philosopher.slug,
        })
        .from(quote)
        .innerJoin(philosopher, eq(quote.philosopherId, philosopher.id))
        .where(conditions.length > 0 ? conditions[0] : undefined)
        .orderBy(asc(philosopher.name))
        .limit(input.limit)
        .offset(input.offset)
        .all();

      const totalRow = await db
        .select({ count: sql<number>`count(*)` })
        .from(quote)
        .where(conditions.length > 0 ? conditions[0] : undefined)
        .get();

      return {
        quotes: rows.map((r) => ({
          id: r.id,
          text: r.text,
          source: r.source,
          philosopher: {
            id: r.philosopherId,
            name: r.philosopherName,
            slug: r.philosopherSlug,
          },
        })),
        total: totalRow?.count ?? 0,
      };
    }),
};
