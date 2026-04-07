import { Link } from "@tanstack/react-router";

import { getTodayQuestion } from "@/data/daily-questions";

export function DailyQuestion() {
  const q = getTodayQuestion();

  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: "var(--ink)" }}
    >
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        {/* ラベル */}
        <p
          className="text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--gold)", fontFamily: '"Noto Serif JP", serif' }}
        >
          Today's Question — 今日の問い
        </p>

        {/* 区切り線 */}
        <div className="w-12 h-px" style={{ backgroundColor: "rgba(201,168,76,0.4)" }} />

        {/* 問い */}
        <h2
          className="text-2xl md:text-3xl font-bold leading-relaxed"
          style={{
            fontFamily: '"Shippori Mincho", serif',
            color: "var(--paper)",
          }}
        >
          「{q.question}」
        </h2>

        {/* サブテキスト */}
        <p
          className="text-sm italic"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            color: "var(--light-muted)",
            fontSize: "1rem",
          }}
        >
          {q.subtitle}
        </p>

        {/* CTAリンク */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {q.themeSlug && (
            <Link
              to="/themes/$slug"
              params={{ slug: q.themeSlug }}
              className="text-sm px-5 py-2 rounded-full transition-all hover:opacity-80"
              style={{
                backgroundColor: "rgba(201,168,76,0.15)",
                color: "var(--gold)",
                border: "1px solid rgba(201,168,76,0.4)",
                fontFamily: '"Noto Serif JP", serif',
              }}
            >
              このテーマを探索する →
            </Link>
          )}
          {q.philosopherSlug && (
            <Link
              to="/philosophers/$slug"
              params={{ slug: q.philosopherSlug }}
              className="text-sm transition-all hover:opacity-70"
              style={{
                color: "var(--light-muted)",
                fontFamily: '"Noto Serif JP", serif',
              }}
            >
              関連する哲学者を見る
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
