import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Layers, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { DailyQuestion } from "@/components/daily-question";
import { RevealWrapper } from "@/components/reveal-wrapper";
import { SectionHeader } from "@/components/section-header";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const STAT_ITEMS = [
  { value: "120+", label: "哲学者" },
  { value: "60+", label: "テーマ別コース" },
  { value: "300+", label: "解説記事" },
  { value: "∞", label: "問いの数" },
];

function HeroQuote({
  quotes,
}: {
  quotes: Array<{ id: string; text: string; philosopherName: string; philosopherSlug: string }>;
}) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (quotes.length === 0) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % quotes.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  if (quotes.length === 0) return null;
  const q = quotes[idx];

  return (
    <div
      className="relative rounded-2xl p-8 max-w-sm shadow-lg"
      style={{ backgroundColor: "rgba(26,18,9,0.06)", border: "1px solid rgba(139,69,19,0.15)" }}
    >
      <div
        className="absolute -top-6 left-6 text-6xl leading-none select-none"
        style={{ fontFamily: '"Cormorant Garamond", serif', color: "var(--accent)", opacity: 0.5 }}
      >
        φ
      </div>
      <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
        <p
          className="text-base italic leading-relaxed mb-4"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            color: "var(--ink)",
            fontSize: "1.05rem",
          }}
        >
          {q.text}
        </p>
        <p className="text-xs text-right" style={{ color: "var(--philo-muted)" }}>
          — {q.philosopherName}
        </p>
      </div>
    </div>
  );
}

function LandingPage() {
  const { data: quotesData } = useQuery(
    orpc.quotes.getRandom.queryOptions({ input: { count: 6 } }),
  );
  const { data: coursesData } = useQuery(orpc.courses.list.queryOptions({ input: {} }));
  const { data: philosophersData } = useQuery(
    orpc.philosophers.list.queryOptions({ input: { limit: 8 } }),
  );
  const { data: themesData } = useQuery(orpc.themes.list.queryOptions());
  const { data: articlesData } = useQuery(
    orpc.articles.list.queryOptions({ input: { limit: 6, featured: true } }),
  );

  const quotes = quotesData?.quotes ?? [];
  const courses = coursesData?.courses ?? [];
  const philosophers = philosophersData?.philosophers ?? [];
  const themes = themesData?.themes ?? [];
  const articles = articlesData?.articles ?? [];

  return (
    <div style={{ backgroundColor: "var(--paper)" }}>
      {/* ヒーローセクション */}
      <section className="min-h-screen flex items-center px-6 py-20">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <RevealWrapper>
            <div className="flex flex-col gap-6">
              <span
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--accent)", fontFamily: '"Noto Serif JP", serif' }}
              >
                入門者のための哲学入門
              </span>
              <h1
                className="leading-tight"
                style={{
                  fontFamily: '"Shippori Mincho", serif',
                  fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                  fontWeight: 800,
                  color: "var(--ink)",
                }}
              >
                考えることは、
                <br />
                <span style={{ color: "var(--accent)" }}>生きること</span>だ。
              </h1>
              <p
                className="text-base leading-relaxed max-w-md"
                style={{ color: "var(--philo-muted)" }}
              >
                ソクラテスからニーチェまで、東洋から西洋まで。
                哲学の世界へ、一緒に踏み出しましょう。
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
                  if (q.trim().length >= 2)
                    window.location.href = `/search?q=${encodeURIComponent(q)}`;
                }}
                className="flex gap-2 max-w-md"
              >
                <input
                  name="q"
                  type="text"
                  placeholder="哲学者、テーマ、概念を検索..."
                  className="flex-1 px-4 py-2.5 text-sm rounded-lg outline-none"
                  style={{
                    border: "1px solid rgba(139,69,19,0.25)",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    color: "var(--ink)",
                    fontFamily: '"Noto Serif JP", serif',
                  }}
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm rounded-lg font-medium hover:opacity-90"
                  style={{ backgroundColor: "var(--accent)", color: "var(--paper)" }}
                >
                  検索
                </button>
              </form>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 text-sm font-medium w-fit"
                style={{ color: "var(--accent)" }}
              >
                学習を始める →
              </Link>
            </div>
          </RevealWrapper>
          <RevealWrapper className="hidden md:flex justify-center">
            <HeroQuote quotes={quotes} />
          </RevealWrapper>
        </div>
      </section>

      {/* 統計バー */}
      <section style={{ backgroundColor: "var(--ink)" }} className="py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STAT_ITEMS.map((item) => (
            <RevealWrapper key={item.label} className="text-center">
              <p
                className="text-4xl font-semibold italic mb-1"
                style={{ fontFamily: '"Cormorant Garamond", serif', color: "var(--gold)" }}
              >
                {item.value}
              </p>
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: "var(--light-muted)" }}
              >
                {item.label}
              </p>
            </RevealWrapper>
          ))}
        </div>
      </section>

      {/* 今日の問い */}
      <RevealWrapper>
        <DailyQuestion />
      </RevealWrapper>

      {/* 学習コースセクション */}
      <section id="path" className="py-20 px-6" style={{ backgroundColor: "var(--aged)" }}>
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <RevealWrapper>
            <SectionHeader
              label="Learning Path"
              title="体系的に学ぶ、哲学の道"
              description="入門から応用まで、段階的に哲学を学べる構造化されたコース。"
            />
          </RevealWrapper>
          <RevealWrapper stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to="/courses/$slug"
                params={{ slug: c.slug }}
                className="group p-6 rounded-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: "var(--paper)",
                  border: "1px solid rgba(139,69,19,0.12)",
                  boxShadow: "0 2px 8px rgba(26,18,9,0.06)",
                }}
              >
                <p
                  className="text-5xl font-semibold italic mb-4"
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    color: "rgba(139,69,19,0.2)",
                  }}
                >
                  {String(c.number).padStart(2, "0")}
                </p>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                >
                  {c.title}
                </h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--philo-muted)" }}>
                  {c.description}
                </p>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(139,69,19,0.08)",
                    color: "var(--accent)",
                    border: "1px solid rgba(139,69,19,0.15)",
                  }}
                >
                  {c.tag}
                </span>
              </Link>
            ))}
          </RevealWrapper>
          <div className="text-center">
            <Link to="/courses" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              すべてのコースを見る →
            </Link>
          </div>
        </div>
      </section>

      {/* 哲学者セクション */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--paper)" }}>
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <RevealWrapper>
            <SectionHeader
              label="Philosophers"
              title="巨人たちの思想"
              description="時代を超えて問い続けた哲学者たちの生涯と思想。"
            />
          </RevealWrapper>
          <RevealWrapper stagger className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {philosophers.map((p) => (
              <Link
                key={p.id}
                to="/philosophers/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:-translate-y-1"
                style={{ border: "1px solid rgba(139,69,19,0.1)" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-colors duration-300 group-hover:bg-[var(--ink)]"
                  style={{
                    backgroundColor: "rgba(139,69,19,0.08)",
                    color: "var(--accent)",
                    fontFamily: '"Cormorant Garamond", serif',
                  }}
                >
                  <span className="group-hover:text-[var(--gold)] transition-colors">
                    {p.initial}
                  </span>
                </div>
                <div className="text-center">
                  <p
                    className="text-sm font-medium"
                    style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                  >
                    {p.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--philo-muted)" }}>
                    {p.era}
                  </p>
                  <p className="text-xs" style={{ color: "var(--light-muted)" }}>
                    {p.region}
                  </p>
                </div>
              </Link>
            ))}
          </RevealWrapper>
          <div className="text-center">
            <Link
              to="/philosophers"
              className="text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              すべての哲学者を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* テーマセクション */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--ink)" }}>
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <RevealWrapper>
            <SectionHeader label="Themes" title="問いのテーマから探す" light />
          </RevealWrapper>
          <RevealWrapper stagger className="flex flex-col">
            {themes.map((t) => (
              <Link
                key={t.id}
                to="/themes/$slug"
                params={{ slug: t.slug }}
                className="group flex items-center gap-6 py-4 transition-all duration-200 hover:translate-x-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span
                  className="text-sm italic shrink-0 w-8"
                  style={{ fontFamily: '"Cormorant Garamond", serif', color: "var(--gold)" }}
                >
                  {String(t.number).padStart(2, "0")}
                </span>
                <span
                  className="flex-1 text-base font-medium"
                  style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--paper)" }}
                >
                  {t.name}
                </span>
                <span className="text-xs" style={{ color: "var(--light-muted)" }}>
                  {t.articleCount} 記事
                </span>
              </Link>
            ))}
          </RevealWrapper>
          <div className="text-center">
            <Link to="/themes" className="text-sm font-medium" style={{ color: "var(--gold)" }}>
              すべてのテーマを見る →
            </Link>
          </div>
        </div>
      </section>

      {/* 記事セクション */}
      {articles.length > 0 && (
        <section className="py-20 px-6" style={{ backgroundColor: "var(--aged)" }}>
          <div className="max-w-6xl mx-auto flex flex-col gap-12">
            <RevealWrapper>
              <SectionHeader
                label="Articles"
                title="読んで、考えよう"
                description="哲学のトピックをわかりやすく解説した読み物コンテンツ。"
              />
            </RevealWrapper>
            <RevealWrapper stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="group flex flex-col gap-3 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                  style={{
                    backgroundColor: "var(--paper)",
                    border: "1px solid rgba(139,69,19,0.12)",
                  }}
                >
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ color: "var(--accent)" }}
                  >
                    {a.tag}
                  </span>
                  <h3
                    className="text-base font-semibold leading-snug"
                    style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                  >
                    {a.title}
                  </h3>
                  <p
                    className="text-sm line-clamp-2 flex-1"
                    style={{ color: "var(--philo-muted)" }}
                  >
                    {a.description}
                  </p>
                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "var(--light-muted)" }}
                  >
                    <span>{a.readingTime}分で読める</span>
                  </div>
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                </Link>
              ))}
            </RevealWrapper>
            <div className="text-center">
              <Link
                to="/articles"
                className="text-sm font-medium"
                style={{ color: "var(--accent)" }}
              >
                すべての記事を見る →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
