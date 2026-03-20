import { db } from "@better-t-app/db";
import { article, glossaryTerm, philosopher, theme } from "@better-t-app/db";
import { like, or } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export const searchRouter = {
  query: publicProcedure
    .input(
      z.object({
        q: z.string().min(2),
        type: z.enum(["article", "philosopher", "theme", "glossary"]).optional(),
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .handler(async ({ input }) => {
      const pattern = `%${input.q}%`;

      const articles =
        !input.type || input.type === "article"
          ? await db
              .select({
                id: article.id,
                slug: article.slug,
                title: article.title,
                description: article.description,
                tag: article.tag,
              })
              .from(article)
              .where(
                or(
                  like(article.title, pattern),
                  like(article.description, pattern),
                ),
              )
              .limit(input.limit)
              .all()
          : [];

      const philosophers =
        !input.type || input.type === "philosopher"
          ? await db
              .select({
                id: philosopher.id,
                slug: philosopher.slug,
                name: philosopher.name,
                era: philosopher.era,
                region: philosopher.region,
              })
              .from(philosopher)
              .where(
                or(
                  like(philosopher.name, pattern),
                  like(philosopher.nameEn, pattern),
                  like(philosopher.shortBio, pattern),
                ),
              )
              .limit(input.limit)
              .all()
          : [];

      const themes =
        !input.type || input.type === "theme"
          ? await db
              .select({
                id: theme.id,
                slug: theme.slug,
                name: theme.name,
              })
              .from(theme)
              .where(
                or(like(theme.name, pattern), like(theme.description, pattern)),
              )
              .limit(input.limit)
              .all()
          : [];

      const glossaryTerms =
        !input.type || input.type === "glossary"
          ? await db
              .select({
                id: glossaryTerm.id,
                term: glossaryTerm.term,
                definition: glossaryTerm.definition,
              })
              .from(glossaryTerm)
              .where(
                or(
                  like(glossaryTerm.term, pattern),
                  like(glossaryTerm.definition, pattern),
                ),
              )
              .limit(input.limit)
              .all()
          : [];

      const total =
        articles.length + philosophers.length + themes.length + glossaryTerms.length;

      return { articles, philosophers, themes, glossaryTerms, total };
    }),
};
