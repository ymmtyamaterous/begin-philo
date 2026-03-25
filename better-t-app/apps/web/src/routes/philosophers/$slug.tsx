import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { GlossaryPopover } from "@/components/glossary-popover";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/philosophers/$slug")({
  component: PhilosopherDetailPage,
});

function PhilosopherDetailPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery(
    orpc.philosophers.get.queryOptions({ input: { slug } }),
  );

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="flex gap-8">
            <div
              className="w-32 h-32 rounded-full shrink-0"
              style={{ backgroundColor: "var(--aged)" }}
            />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 rounded" style={{ backgroundColor: "var(--aged)" }} />
              <div className="h-4 w-32 rounded" style={{ backgroundColor: "var(--aged)" }} />
            </div>
          </div>
          <div className="h-64 rounded" style={{ backgroundColor: "var(--aged)" }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <p style={{ color: "var(--philo-muted)" }}>哲学者が見つかりませんでした。</p>
        <Link to="/philosophers" className="text-sm mt-4 block" style={{ color: "var(--accent)" }}>
          ← 哲学者一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      {/* ヘッダーカード */}
      <div className="py-16 px-6" style={{ backgroundColor: "var(--aged)" }}>
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: "var(--light-muted)" }}>
            <Link to="/" style={{ color: "var(--philo-muted)" }}>
              ホーム
            </Link>
            <span>/</span>
            <Link to="/philosophers" style={{ color: "var(--philo-muted)" }}>
              哲学者
            </Link>
            <span>/</span>
            <span style={{ color: "var(--ink)" }}>{data.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* アバター */}
            <div
              className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold shrink-0"
              style={{
                backgroundColor: "rgba(139,69,19,0.12)",
                color: "var(--accent)",
                fontFamily: '"Cormorant Garamond", serif',
                border: "3px solid rgba(139,69,19,0.2)",
              }}
            >
              {data.initial}
            </div>

            {/* 基本情報 */}
            <div className="flex flex-col gap-2">
              <h1
                className="text-3xl md:text-4xl font-bold"
                style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
              >
                {data.name}
              </h1>
              <p
                className="text-lg italic"
                style={{ fontFamily: '"Cormorant Garamond", serif', color: "var(--philo-muted)" }}
              >
                {data.nameEn}
              </p>
              <p className="text-sm" style={{ color: "var(--philo-muted)" }}>
                {data.era} · {data.region}
              </p>
              {data.themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
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
              )}
              <div className="mt-4">
                <Link
                  to="/compare"
                  search={{ a: data.slug }}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: "var(--ink)",
                    color: "var(--paper)",
                    border: "1px solid var(--ink)",
                  }}
                >
                  <span>⇌</span>
                  <span>他の哲学者と比較する</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細コンテンツ */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-[1fr_260px] gap-12">
        <div>
          {/* 主要思想 */}
          {data.keyIdeas.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-lg font-semibold mb-3"
                style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
              >
                主要思想
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.keyIdeas.map((idea) => (
                  <span
                    key={idea}
                    className="text-sm px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: "var(--aged)",
                      color: "var(--philo-muted)",
                      border: "1px solid rgba(139,69,19,0.1)",
                    }}
                  >
                    {idea}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 主要著作 */}
          {data.majorWorks.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-lg font-semibold mb-3"
                style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
              >
                主要著作
              </h2>
              <ul className="flex flex-col gap-1">
                {data.majorWorks.map((work) => (
                  <li
                    key={work}
                    className="text-sm flex items-center gap-2"
                    style={{ color: "var(--philo-muted)" }}
                  >
                    <span style={{ color: "var(--accent)" }}>—</span>
                    {work}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className="w-16 h-0.5 mb-8"
            style={{ backgroundColor: "var(--accent)" }}
          />

          {/* 詳細解説 */}
          <div className="prose-philo">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                a: ({ href, children }) => {
                  if (href?.startsWith("/glossary#")) {
                    const term = decodeURIComponent(href.replace("/glossary#", ""));
                    return <GlossaryPopover term={term}>{children}</GlossaryPopover>;
                  }
                  return (
                    <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
                      {children}
                    </a>
                  );
                },
              }}
            >
              {data.biography}
            </ReactMarkdown>
          </div>

          {/* 関連記事 */}
          {data.articles.length > 0 && (
            <div className="mt-12">
              <h2
                className="text-xl font-semibold mb-6"
                style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
              >
                関連記事
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.articles.map((a) => (
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

          {/* 関連哲学者 */}
          {data.relatedPhilosophers.length > 0 && (
            <div className="mt-12">
              <h2
                className="text-xl font-semibold mb-6"
                style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
              >
                同じ時代の哲学者
              </h2>
              <div className="flex flex-col gap-3">
                {data.relatedPhilosophers.map((p) => (
                  <Link
                    key={p.id}
                    to="/philosophers/$slug"
                    params={{ slug: p.slug }}
                    className="flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-[var(--aged)]"
                    style={{ border: "1px solid rgba(139,69,19,0.1)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                      style={{
                        backgroundColor: "rgba(139,69,19,0.08)",
                        color: "var(--accent)",
                        fontFamily: '"Cormorant Garamond", serif',
                      }}
                    >
                      {p.initial}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-sm font-semibold"
                        style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                      >
                        {p.name}
                      </span>
                      <span className="text-xs" style={{ color: "var(--philo-muted)" }}>
                        {p.era} · {p.region}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 名言サイドバー */}
        {data.quotes.length > 0 && (
          <aside className="hidden md:block">
            <div
              className="p-5 rounded-xl sticky top-20"
              style={{ backgroundColor: "var(--aged)", border: "1px solid rgba(139,69,19,0.1)" }}
            >
              <h3
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--accent)" }}
              >
                名言
              </h3>
              <div className="flex flex-col gap-4">
                {data.quotes.slice(0, 4).map((q) => (
                  <blockquote
                    key={q.id}
                    className="text-sm italic leading-relaxed pl-3"
                    style={{
                      borderLeft: "2px solid var(--accent)",
                      fontFamily: '"Cormorant Garamond", serif',
                      color: "var(--philo-muted)",
                      fontSize: "0.95rem",
                    }}
                  >
                    {q.text}
                  </blockquote>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
