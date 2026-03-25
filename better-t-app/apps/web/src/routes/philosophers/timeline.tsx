import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { RevealWrapper } from "@/components/reveal-wrapper";
import { SectionHeader } from "@/components/section-header";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/philosophers/timeline")({
  component: PhilosophersTimelinePage,
});

type RegionFilter = "all" | "western" | "eastern";

const REGION_OPTIONS: { label: string; value: RegionFilter }[] = [
  { label: "すべて", value: "all" },
  { label: "西洋哲学", value: "western" },
  { label: "東洋哲学", value: "eastern" },
];

const EASTERN_REGIONS = new Set(["中国", "日本", "インド", "東洋", "インド（古代）"]);

function isEastern(region: string) {
  return EASTERN_REGIONS.has(region) || region.includes("中国") || region.includes("インド");
}

/** 生年を元に「時代グループ」のラベルを返す */
function getEraLabel(birthYear: number | null): string {
  if (birthYear === null) return "年代不詳";
  if (birthYear < -500) return "紀元前6世紀以前";
  if (birthYear < -400) return "紀元前5世紀";
  if (birthYear < -300) return "紀元前4世紀";
  if (birthYear < -200) return "紀元前3世紀";
  if (birthYear < -100) return "紀元前2世紀";
  if (birthYear < 0) return "紀元前1世紀";
  if (birthYear < 100) return "1世紀";
  if (birthYear < 200) return "2世紀";
  if (birthYear < 300) return "3世紀";
  if (birthYear < 400) return "4世紀";
  if (birthYear < 500) return "5世紀";
  if (birthYear < 600) return "6世紀";
  if (birthYear < 700) return "7世紀";
  if (birthYear < 800) return "8世紀";
  if (birthYear < 900) return "9世紀";
  if (birthYear < 1000) return "10世紀";
  if (birthYear < 1100) return "11世紀";
  if (birthYear < 1200) return "12世紀";
  if (birthYear < 1300) return "13世紀";
  if (birthYear < 1400) return "14世紀";
  if (birthYear < 1500) return "15世紀";
  if (birthYear < 1600) return "16世紀";
  if (birthYear < 1700) return "17世紀";
  if (birthYear < 1800) return "18世紀";
  if (birthYear < 1900) return "19世紀";
  return "20世紀以降";
}

function getEraOrder(label: string): number {
  const map: Record<string, number> = {
    "紀元前6世紀以前": -6,
    "紀元前5世紀": -5,
    "紀元前4世紀": -4,
    "紀元前3世紀": -3,
    "紀元前2世紀": -2,
    "紀元前1世紀": -1,
    "1世紀": 1,
    "2世紀": 2,
    "3世紀": 3,
    "4世紀": 4,
    "5世紀": 5,
    "6世紀": 6,
    "7世紀": 7,
    "8世紀": 8,
    "9世紀": 9,
    "10世紀": 10,
    "11世紀": 11,
    "12世紀": 12,
    "13世紀": 13,
    "14世紀": 14,
    "15世紀": 15,
    "16世紀": 16,
    "17世紀": 17,
    "18世紀": 18,
    "19世紀": 19,
    "20世紀以降": 20,
    年代不詳: 99,
  };
  return map[label] ?? 99;
}

function PhilosophersTimelinePage() {
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");

  const { data, isLoading } = useQuery(
    orpc.philosophers.list.queryOptions({ input: { limit: 100 } }),
  );

  const philosophers = data?.philosophers ?? [];

  // フィルタリング
  const filtered = philosophers.filter((p) => {
    if (regionFilter === "western") return !isEastern(p.region);
    if (regionFilter === "eastern") return isEastern(p.region);
    return true;
  });

  // 時代グループにまとめる
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, p) => {
    const label = getEraLabel(p.birthYear ?? null);
    if (!acc[label]) acc[label] = [];
    acc[label].push(p);
    return acc;
  }, {});

  const sortedEras = Object.keys(grouped).sort(
    (a, b) => getEraOrder(a) - getEraOrder(b),
  );

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      {/* ページヘッダー */}
      <div className="py-16 px-6" style={{ backgroundColor: "var(--aged)" }}>
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: "var(--light-muted)" }}>
            <Link to="/" style={{ color: "var(--philo-muted)" }}>ホーム</Link>
            <span>/</span>
            <Link to="/philosophers" style={{ color: "var(--philo-muted)" }}>哲学者</Link>
            <span>/</span>
            <span style={{ color: "var(--ink)" }}>タイムライン</span>
          </nav>

          <RevealWrapper>
            <SectionHeader
              label="Timeline"
              title="哲学の流れを辿る"
              description="古代から現代まで、哲学者を時代順に一望する。"
            />
          </RevealWrapper>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* フィルター */}
        <div className="flex items-center gap-3 mb-12 flex-wrap">
          {REGION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRegionFilter(opt.value)}
              className="text-sm px-4 py-2 rounded-full transition-all"
              style={
                regionFilter === opt.value
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
          <span className="text-xs ml-auto" style={{ color: "var(--light-muted)" }}>
            {filtered.length} 人
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-24 rounded mb-4" style={{ backgroundColor: "var(--aged)" }} />
                <div className="flex flex-wrap gap-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-20 w-36 rounded-lg" style={{ backgroundColor: "var(--aged)" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* タイムライン縦線 */}
            <div
              className="absolute left-[7.5rem] top-0 bottom-0 w-px hidden md:block"
              style={{ backgroundColor: "rgba(139,69,19,0.15)" }}
            />

            <div className="flex flex-col gap-12">
              {sortedEras.map((era) => (
                <RevealWrapper key={era}>
                  <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                    {/* 時代ラベル */}
                    <div className="md:w-[7rem] shrink-0 flex md:flex-col md:items-end md:pt-1">
                      <span
                        className="text-xs font-semibold tracking-wider whitespace-nowrap"
                        style={{
                          color: "var(--accent)",
                          fontFamily: '"Cormorant Garamond", serif',
                          fontSize: "0.85rem",
                        }}
                      >
                        {era}
                      </span>
                    </div>

                    {/* タイムラインドット（デスクトップ） */}
                    <div
                      className="hidden md:flex w-4 h-4 rounded-full shrink-0 mt-1 border-2"
                      style={{
                        backgroundColor: "var(--paper)",
                        borderColor: "var(--accent)",
                      }}
                    />

                    {/* 哲学者カード群 */}
                    <div className="flex flex-wrap gap-3 flex-1">
                      {grouped[era].map((p) => (
                        <Link
                          key={p.id}
                          to="/philosophers/$slug"
                          params={{ slug: p.slug }}
                          className="group flex flex-col gap-2 p-4 rounded-xl transition-all duration-300 hover:-translate-y-1"
                          style={{
                            backgroundColor: "var(--aged)",
                            border: "1px solid rgba(139,69,19,0.12)",
                            minWidth: "10rem",
                            maxWidth: "14rem",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                              style={{
                                backgroundColor: "rgba(139,69,19,0.1)",
                                color: "var(--accent)",
                                fontFamily: '"Cormorant Garamond", serif',
                              }}
                            >
                              {p.initial}
                            </div>
                            <div>
                              <p
                                className="text-sm font-semibold leading-tight"
                                style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                              >
                                {p.name}
                              </p>
                              <p className="text-xs" style={{ color: "var(--philo-muted)" }}>
                                {p.region}
                              </p>
                            </div>
                          </div>
                          <p
                            className="text-xs leading-snug line-clamp-2"
                            style={{ color: "var(--philo-muted)" }}
                          >
                            {p.era}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </RevealWrapper>
              ))}
            </div>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center py-20" style={{ color: "var(--philo-muted)" }}>
            該当する哲学者が見つかりませんでした。
          </p>
        )}
      </div>
    </div>
  );
}
