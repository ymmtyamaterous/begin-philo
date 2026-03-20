import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/articles/$slug")({
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery(
    orpc.articles.get.queryOptions({ input: { slug } }),
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 rounded" style={{ backgroundColor: "var(--aged)" }} />
          <div className="h-10 w-3/4 rounded" style={{ backgroundColor: "var(--aged)" }} />
          <div className="h-64 rounded" style={{ backgroundColor: "var(--aged)" }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p style={{ color: "var(--philo-muted)" }}>記事が見つかりませんでした。</p>
        <Link to="/articles" className="text-sm mt-4 block" style={{ color: "var(--accent)" }}>
          ← 記事一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-[1fr_280px] gap-12">
        {/* メインコンテンツ */}
        <article>
          {/* パンくず */}
          <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: "var(--light-muted)" }}>
            <Link to="/" style={{ color: "var(--philo-muted)" }}>
              ホーム
            </Link>
            <span>/</span>
            <Link to="/articles" style={{ color: "var(--philo-muted)" }}>
              記事
            </Link>
            <span>/</span>
            <span style={{ color: "var(--ink)" }}>{data.title}</span>
          </nav>

          <span
            className="text-xs uppercase tracking-widest mb-3 block"
            style={{ color: "var(--accent)" }}
          >
            {data.tag}
          </span>
          <h1
            className="text-3xl md:text-4xl font-bold leading-tight mb-4"
            style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
          >
            {data.title}
          </h1>

          <div className="flex items-center gap-4 mb-8 text-sm" style={{ color: "var(--philo-muted)" }}>
            <span>
              {data.publishedAt
                ? new Date(data.publishedAt).toLocaleDateString("ja-JP")
                : ""}
            </span>
            <span>·</span>
            <span>{data.readingTime}分で読める</span>
            {data.philosopher && (
              <>
                <span>·</span>
                <Link
                  to="/philosophers/$slug"
                  params={{ slug: data.philosopher.slug }}
                  style={{ color: "var(--accent)" }}
                >
                  {data.philosopher.name}
                </Link>
              </>
            )}
          </div>

          <div
            className="w-16 h-0.5 mb-8"
            style={{ backgroundColor: "var(--accent)" }}
          />

          <div className="prose-philo">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {data.content}
            </ReactMarkdown>
          </div>

          {/* 関連記事 */}
          {data.relatedArticles.length > 0 && (
            <div className="mt-16">
              <h2
                className="text-xl font-semibold mb-6"
                style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
              >
                関連記事
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.relatedArticles.map((a) => (
                  <Link
                    key={a.id}
                    to="/articles/$slug"
                    params={{ slug: a.slug }}
                    className="p-4 rounded-lg transition-colors hover:bg-[var(--aged)]"
                    style={{ border: "1px solid rgba(139,69,19,0.1)" }}
                  >
                    <span className="text-xs block mb-1" style={{ color: "var(--accent)" }}>
                      {a.tag}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                    >
                      {a.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* サイドバー */}
        <aside className="hidden md:block">
          {/* テーマ */}
          {data.themes.length > 0 && (
            <div
              className="mb-8 p-5 rounded-xl"
              style={{ backgroundColor: "var(--aged)", border: "1px solid rgba(139,69,19,0.1)" }}
            >
              <h3
                className="text-xs uppercase tracking-widest mb-3"
                style={{ color: "var(--accent)" }}
              >
                テーマ
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.themes.map((t) => (
                  <Link
                    key={t.id}
                    to="/themes/$slug"
                    params={{ slug: t.slug }}
                    className="text-xs px-2 py-1 rounded-full transition-colors"
                    style={{
                      backgroundColor: "rgba(139,69,19,0.08)",
                      color: "var(--accent)",
                      border: "1px solid rgba(139,69,19,0.15)",
                    }}
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 関連哲学者 */}
          {data.philosopher && (
            <div
              className="p-5 rounded-xl"
              style={{ backgroundColor: "var(--aged)", border: "1px solid rgba(139,69,19,0.1)" }}
            >
              <h3
                className="text-xs uppercase tracking-widest mb-3"
                style={{ color: "var(--accent)" }}
              >
                関連哲学者
              </h3>
              <Link
                to="/philosophers/$slug"
                params={{ slug: data.philosopher.slug }}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                  style={{
                    backgroundColor: "rgba(139,69,19,0.12)",
                    color: "var(--accent)",
                    fontFamily: '"Cormorant Garamond", serif',
                  }}
                >
                  {data.philosopher.name[0]}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                >
                  {data.philosopher.name}
                </span>
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
