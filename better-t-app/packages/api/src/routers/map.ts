import { db } from "@better-t-app/db";
import { article, articleTheme, philosopher, theme } from "@better-t-app/db";

import { publicProcedure } from "../index";

export const mapRouter = {
  getData: publicProcedure.handler(async () => {
    // テーマ一覧
    const themes = await db
      .select({ id: theme.id, name: theme.name, slug: theme.slug })
      .from(theme)
      .all();

    // 哲学者一覧
    const philosophers = await db
      .select({
        id: philosopher.id,
        name: philosopher.name,
        slug: philosopher.slug,
        era: philosopher.era,
      })
      .from(philosopher)
      .all();

    // 記事一覧（軽量）
    const articles = await db
      .select({
        id: article.id,
        title: article.title,
        slug: article.slug,
        philosopherId: article.philosopherId,
      })
      .from(article)
      .all();

    // 記事-テーマ関係
    const articleThemeRows = await db
      .select({ articleId: articleTheme.articleId, themeId: articleTheme.themeId })
      .from(articleTheme)
      .all();

    // ノード構築
    const nodes = [
      ...themes.map((t) => ({
        id: `theme-${t.id}`,
        type: "theme" as const,
        label: t.name,
        slug: t.slug,
      })),
      ...philosophers.map((p) => ({
        id: `philo-${p.id}`,
        type: "philosopher" as const,
        label: p.name,
        slug: p.slug,
        era: p.era,
      })),
      ...articles.map((a) => ({
        id: `article-${a.id}`,
        type: "article" as const,
        label: a.title,
        slug: a.slug,
      })),
    ];

    // エッジ構築
    const edges = [
      // 記事 → テーマ
      ...articleThemeRows.map((at) => ({
        id: `at-${at.articleId}-${at.themeId}`,
        source: `article-${at.articleId}`,
        target: `theme-${at.themeId}`,
        edgeType: "article-theme" as const,
      })),
      // 記事 → 哲学者
      ...articles
        .filter((a) => a.philosopherId)
        .map((a) => ({
          id: `ap-${a.id}-${a.philosopherId}`,
          source: `article-${a.id}`,
          target: `philo-${a.philosopherId}`,
          edgeType: "article-philosopher" as const,
        })),
    ];

    return { nodes, edges };
  }),
};
