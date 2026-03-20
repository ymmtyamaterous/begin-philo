import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({
    q: z.string().optional().default(""),
  }),
  component: SearchPage,
});

type ResultType = "article" | "philosopher" | "theme" | "glossary" | undefined;

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [inputValue, setInputValue] = useState(q);
  const [typeFilter, setTypeFilter] = useState<ResultType>(undefined);

  const { data, isLoading } = useQuery({
    ...orpc.search.query.queryOptions({ input: { q, type: typeFilter } }),
    enabled: q.length >= 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { q: inputValue } });
  };

  const typeFilters: { label: string; value: ResultType }[] = [
    { label: "すべて", value: undefined },
    { label: "記事", value: "article" },
    { label: "哲学者", value: "philosopher" },
    { label: "テーマ", value: "theme" },
    { label: "用語集", value: "glossary" },
  ];

  const articles = data?.articles ?? [];
  const philosophers = data?.philosophers ?? [];
  const themes = data?.themes ?? [];
  const glossary = data?.glossaryTerms ?? [];
  const totalCount = articles.length + philosophers.length + themes.length + glossary.length;

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      {/* 検索バー */}
      <div
        className="py-12 px-6"
        style={{ backgroundColor: "var(--aged)", borderBottom: "1px solid rgba(139,69,19,0.1)" }}
      >
        <div className="max-w-2xl mx-auto">
          <h1
            className="text-2xl font-bold mb-6 text-center"
            style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
          >
            検索
          </h1>
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="哲学者・概念・記事タイトルを検索..."
              className="w-full px-5 py-3 pr-14 rounded-xl text-sm outline-none transition-shadow"
              style={{
                backgroundColor: "var(--paper)",
                color: "var(--ink)",
                border: "1px solid rgba(139,69,19,0.2)",
                fontFamily: '"Noto Serif JP", serif',
              }}
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
              style={{ color: "var(--philo-muted)" }}
            >
              ⌕
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {q.length < 2 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4" style={{ opacity: 0.3 }}>⌕</p>
            <p style={{ color: "var(--philo-muted)" }}>2文字以上入力して検索してください。</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl"
                style={{ backgroundColor: "var(--aged)" }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* 件数 + タイプフィルター */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <p className="text-sm" style={{ color: "var(--philo-muted)" }}>
                「{q}」の検索結果: {totalCount} 件
              </p>
              <div className="flex gap-2 flex-wrap">
                {typeFilters.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => setTypeFilter(f.value)}
                    className="px-3 py-1 rounded-full text-xs transition-all"
                    style={
                      typeFilter === f.value
                        ? { backgroundColor: "var(--accent)", color: "var(--paper)" }
                        : {
                            backgroundColor: "var(--aged)",
                            color: "var(--philo-muted)",
                            border: "1px solid rgba(139,69,19,0.15)",
                          }
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {totalCount === 0 && (
              <div className="text-center py-12">
                <p style={{ color: "var(--philo-muted)" }}>結果が見つかりませんでした。</p>
              </div>
            )}

            {/* 記事 */}
            {articles.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
                  記事
                </h2>
                <div className="flex flex-col gap-2">
                  {articles.map((a) => (
                    <Link
                      key={a.id}
                      to="/articles/$slug"
                      params={{ slug: a.slug }}
                      className="group flex flex-col p-4 rounded-xl transition-all hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "var(--aged)",
                        border: "1px solid rgba(139,69,19,0.08)",
                      }}
                    >
                      <span
                        className="text-sm font-medium transition-colors group-hover:text-[var(--accent)]"
                        style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                      >
                        {a.title}
                      </span>
                      <span className="text-xs mt-1" style={{ color: "var(--light-muted)" }}>
                        {a.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 哲学者 */}
            {philosophers.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
                  哲学者
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {philosophers.map((p) => (
                    <Link
                      key={p.id}
                      to="/philosophers/$slug"
                      params={{ slug: p.slug }}
                      className="group flex items-center gap-3 p-3 rounded-xl transition-all hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "var(--aged)",
                        border: "1px solid rgba(139,69,19,0.08)",
                      }}
                    >
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          backgroundColor: "rgba(139,69,19,0.1)",
                          color: "var(--accent)",
                          fontFamily: '"Cormorant Garamond", serif',
                        }}
                      >
                        {p.name.charAt(0)}
                      </span>
                      <div>
                        <span
                          className="text-sm font-medium block transition-colors group-hover:text-[var(--accent)]"
                          style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                        >
                          {p.name}
                        </span>
                        <span className="text-xs" style={{ color: "var(--light-muted)" }}>
                          {p.era}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* テーマ */}
            {themes.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
                  テーマ
                </h2>
                <div className="flex flex-col gap-2">
                  {themes.map((t) => (
                    <Link
                      key={t.id}
                      to="/themes/$slug"
                      params={{ slug: t.slug }}
                      className="group flex items-center gap-4 p-4 rounded-xl transition-all hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "var(--aged)",
                        border: "1px solid rgba(139,69,19,0.08)",
                      }}
                    >
                      <span
                        className="text-sm font-medium transition-colors group-hover:text-[var(--accent)]"
                        style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                      >
                        {t.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 用語集 */}
            {glossary.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
                  用語集
                </h2>
                <div className="flex flex-col gap-2">
                  {glossary.map((g) => (
                    <Link
                      key={g.id}
                      to="/glossary"
                      search={{}}
                      className="group flex flex-col p-4 rounded-xl transition-all hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "var(--aged)",
                        border: "1px solid rgba(139,69,19,0.08)",
                      }}
                    >
                      <span
                        className="text-sm font-medium transition-colors group-hover:text-[var(--accent)]"
                        style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                      >
                        {g.term}
                      </span>
                      <span className="text-xs mt-1 line-clamp-1" style={{ color: "var(--philo-muted)" }}>
                        {g.definition}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
