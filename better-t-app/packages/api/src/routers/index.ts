import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { articlesRouter } from "./articles";
import { bookmarksRouter } from "./bookmarks";
import { coursesRouter } from "./courses";
import { glossaryRouter } from "./glossary";
import { philosophersRouter } from "./philosophers";
import { progressRouter } from "./progress";
import { quotesRouter } from "./quotes";
import { searchRouter } from "./search";
import { themesRouter } from "./themes";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  articles: articlesRouter,
  philosophers: philosophersRouter,
  courses: coursesRouter,
  themes: themesRouter,
  glossary: glossaryRouter,
  quotes: quotesRouter,
  search: searchRouter,
  progress: progressRouter,
  bookmarks: bookmarksRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;

