import { db } from "@better-t-app/db";
import { glossaryTerm, philosopher, theme } from "@better-t-app/db";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export const glossaryRouter = {
  list: publicProcedure
    .input(
      z.object({
        initial: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const rows = await db
        .select({
          id: glossaryTerm.id,
          term: glossaryTerm.term,
          reading: glossaryTerm.reading,
          definition: glossaryTerm.definition,
          philosopherId: glossaryTerm.philosopherId,
          philosopherName: philosopher.name,
          philosopherSlug: philosopher.slug,
          themeId: glossaryTerm.themeId,
          themeName: theme.name,
          themeSlug: theme.slug,
        })
        .from(glossaryTerm)
        .leftJoin(philosopher, eq(glossaryTerm.philosopherId, philosopher.id))
        .leftJoin(theme, eq(glossaryTerm.themeId, theme.id))
        .orderBy(asc(glossaryTerm.reading))
        .all();

      const filtered = input.initial
        ? rows.filter((r) => r.reading.startsWith(input.initial!))
        : rows;

      return {
        terms: filtered.map((r) => ({
          id: r.id,
          term: r.term,
          reading: r.reading,
          definition: r.definition,
          philosopher:
            r.philosopherId && r.philosopherName && r.philosopherSlug
              ? { id: r.philosopherId, name: r.philosopherName, slug: r.philosopherSlug }
              : null,
          theme:
            r.themeId && r.themeName && r.themeSlug
              ? { id: r.themeId, name: r.themeName, slug: r.themeSlug }
              : null,
        })),
      };
    }),
};
