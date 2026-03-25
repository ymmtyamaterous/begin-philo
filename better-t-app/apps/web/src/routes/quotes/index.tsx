import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { RevealWrapper } from "@/components/reveal-wrapper";
import { SectionHeader } from "@/components/section-header";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/quotes/")({
  component: QuotesPage,
});

function QuotesPage() {
  const [philosopherSlug, setPhilosopherSlug] = useState<string | undefined>();

  const { data, isLoading } = useQuery(
    orpc.quotes.list.queryOptions({
      input: { limit: 50, philosopherSlug },
    }),
  );

  const { data: philoData } = useQuery(
    orpc.philosophers.list.queryOptions({ input: { limit: 100 } }),
  );

  const quotes = data?.quotes ?? [];
  const philosophers = philoData?.philosophers ?? [];

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      {/* ページヘッダー */}
      <div
        className="py-20 px-6"
        style={{
          backgroundColor: "var(--ink)",
          backgroundImage:
            "radial-gradient(ellipse at 30% 60%, rgba(201,168,76,0.12) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <RevealWrapper>
            <SectionHeader
              label="Quotes"
              title="巨人たちの言葉"
              description="時代を超えて語り継がれる哲学者たちの名言・金言。"
              light
            />
          </RevealWrapper>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* 哲学者フィルター */}
        <div className="mb-10 flex flex-wrap gap-2 items-center">
          <span
            className="text-xs uppercase tracking-widest mr-2"
            style={{ color: "var(--accent)", fontFamily: '"Noto Serif JP", serif' }}
          >
            哲学者:
          </span>
          <button
            type="button"
            onClick={() => setPhilosopherSlug(undefined)}
            className="text-xs px-3 py-1.5 rounded-full transition-all"
            style={
              !philosopherSlug
                ? { backgroundColor: "var(--accent)", color: "var(--paper)", border: "1px solid var(--accent)" }
                : { backgroundColor: "transparent", color: "var(--philo-muted)", border: "1px solid rgba(139,69,19,0.2)" }
            }
          >
            すべて
          </button>
          {philosophers.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPhilosopherSlug(p.slug)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={
                philosopherSlug === p.slug
                  ? { backgroundColor: "var(--accent)", color: "var(--paper)", border: "1px solid var(--accent)" }
                  : { backgroundColor: "transparent", color: "var(--philo-muted)", border: "1px solid rgba(139,69,19,0.2)" }
              }
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* 名言一覧 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl animate-pulse"
                style={{ backgroundColor: "var(--aged)" }}
              />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <p className="text-center py-20" style={{ color: "var(--philo-muted)" }}>
            該当する名言が見つかりませんでした。
          </p>
        ) : (
          <RevealWrapper stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="flex flex-col gap-4 p-6 rounded-2xl"
                style={{
                  backgroundColor: "var(--aged)",
                  border: "1px solid rgba(139,69,19,0.1)",
                }}
              >
                {/* 装飾的な引用符 */}
                <div
                  className="text-5xl leading-none select-none"
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    color: "rgba(139,69,19,0.2)",
                    lineHeight: 1,
                  }}
                >
                  "
                </div>

                {/* 名言テキスト */}
                <blockquote
                  className="text-base italic leading-relaxed flex-1 -mt-6"
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    color: "var(--ink)",
                    fontSize: "1.1rem",
                  }}
                >
                  {q.text}
                </blockquote>

                {/* 出典 */}
                {q.source && (
                  <p className="text-xs italic" style={{ color: "var(--light-muted)" }}>
                    — {q.source}
                  </p>
                )}

                {/* 哲学者 */}
                <div className="pt-2" style={{ borderTop: "1px solid rgba(139,69,19,0.12)" }}>
                  <Link
                    to="/philosophers/$slug"
                    params={{ slug: q.philosopher.slug }}
                    className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        backgroundColor: "rgba(139,69,19,0.12)",
                        color: "var(--accent)",
                        fontFamily: '"Cormorant Garamond", serif',
                      }}
                    >
                      {q.philosopher.name[0]}
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                    >
                      {q.philosopher.name}
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </RevealWrapper>
        )}

        {/* 全件読み込みリンク */}
        {!isLoading && quotes.length >= 50 && (
          <div className="text-center mt-10">
            <button
              type="button"
              className="text-sm"
              style={{ color: "var(--accent)" }}
              onClick={() => {/* TODO: load more */}}
            >
              さらに読み込む →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
