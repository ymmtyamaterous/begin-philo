import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { RevealWrapper } from "@/components/reveal-wrapper";
import { SectionHeader } from "@/components/section-header";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/articles/")({
  component: ArticlesPage,
});

type ReadingTimeFilter = "all" | "short" | "medium" | "long";

const READING_TIME_OPTIONS: { label: string; value: ReadingTimeFilter }[] = [
  { label: "すべて", value: "all" },
  { label: "5分以内", value: "short" },
  { label: "10分以内", value: "medium" },
  { label: "10分以上", value: "long" },
];

function readingTimeToParams(filter: ReadingTimeFilter) {
  if (filter === "short") return { maxReadingTime: 5 };
  if (filter === "medium") return { maxReadingTime: 10 };
  if (filter === "long") return { minReadingTime: 10 };
  return {};
}

function ArticlesPage() {
  const [themeSlug, setThemeSlug] = useState<string | undefined>();
  const [philosopherSlug, setPhilosopherSlug] = useState<string | undefined>();
  const [readingTimeFilter, setReadingTimeFilter] = useState<ReadingTimeFilter>("all");

  const { data, isLoading } = useQuery(
    orpc.articles.list.queryOptions({
      input: { limit: 20, themeSlug, philosopherSlug, ...readingTimeToParams(readingTimeFilter) },
    }),
  );
  const { data: themesData } = useQuery(orpc.themes.list.queryOptions());
  const { data: philoData } = useQuery(
    orpc.philosophers.list.queryOptions({ input: { limit: 100 } }),
  );

  const articles = data?.articles ?? [];
  const themes = themesData?.themes ?? [];
  const philosophers = philoData?.philosophers ?? [];

  return (
    <div className="py-16 px-6" style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <RevealWrapper>
          <SectionHeader
            label="Articles"
            title="読んで、考えよう"
            description="哲学のトピックをわかりやすく解説した読み物コンテンツ。"
          />
        </RevealWrapper>

        {/* フィルターバー */}
        <div className="flex flex-col gap-3">
          {/* テーマ・哲学者セレクト */}
          <div className="flex flex-wrap gap-4">
            <select
              value={themeSlug ?? ""}
              onChange={(e) => setThemeSlug(e.target.value || undefined)}
              className="text-sm px-3 py-2 rounded-md outline-none"
              style={{
                border: "1px solid rgba(139,69,19,0.2)",
                backgroundColor: "var(--paper)",
                color: "var(--ink)",
                fontFamily: '"Noto Serif JP", serif',
              }}
            >
              <option value="">テーマ: すべて</option>
              {themes.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              value={philosopherSlug ?? ""}
              onChange={(e) => setPhilosopherSlug(e.target.value || undefined)}
              className="text-sm px-3 py-2 rounded-md outline-none"
              style={{
                border: "1px solid rgba(139,69,19,0.2)",
                backgroundColor: "var(--paper)",
                color: "var(--ink)",
                fontFamily: '"Noto Serif JP", serif',
              }}
            >
              <option value="">哲学者: すべて</option>
              {philosophers.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 読了時間フィルター */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: "var(--philo-muted)", fontFamily: '"Noto Serif JP", serif' }}>
              読了時間:
            </span>
            {READING_TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setReadingTimeFilter(opt.value)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={
                  readingTimeFilter === opt.value
                    ? {
                        backgroundColor: "var(--accent)",
                        color: "var(--paper)",
                        border: "1px solid var(--accent)",
                        fontFamily: '"Noto Serif JP", serif',
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "var(--philo-muted)",
                        border: "1px solid rgba(139,69,19,0.2)",
                        fontFamily: '"Noto Serif JP", serif',
                      }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl animate-pulse"
                style={{ backgroundColor: "var(--aged)" }}
              />
            ))}
          </div>
        ) : (
          <RevealWrapper stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link
                key={a.id}
                to="/articles/$slug"
                params={{ slug: a.slug }}
                className="group flex flex-col gap-3 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                style={{
                  backgroundColor: "var(--aged)",
                  border: "1px solid rgba(139,69,19,0.1)",
                }}
              >
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "var(--accent)" }}
                >
                  {a.tag}
                </span>
                {a.seriesTitle && (
                  <span
                    className="self-start text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "rgba(139,69,19,0.12)",
                      color: "var(--accent)",
                      fontFamily: '"Noto Serif JP", serif',
                      border: "1px solid rgba(139,69,19,0.25)",
                    }}
                  >
                    📚 {a.seriesTitle}
                  </span>
                )}
                <h3
                  className="text-base font-semibold leading-snug"
                  style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                >
                  {a.title}
                </h3>
                <p className="text-sm line-clamp-2 flex-1" style={{ color: "var(--philo-muted)" }}>
                  {a.description}
                </p>
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--light-muted)" }}>
                  <span>{a.readingTime}分</span>
                  {a.philosopher && (
                    <span style={{ color: "var(--philo-muted)" }}>{a.philosopher.name}</span>
                  )}
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "var(--accent)" }}
                />
              </Link>
            ))}
          </RevealWrapper>
        )}

        {articles.length === 0 && !isLoading && (
          <p className="text-center py-20" style={{ color: "var(--philo-muted)" }}>
            該当する記事が見つかりませんでした。
          </p>
        )}
      </div>
    </div>
  );
}
