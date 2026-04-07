import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { RevealWrapper } from "@/components/reveal-wrapper";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/compare")({
  validateSearch: z.object({
    a: z.string().optional(),
    b: z.string().optional(),
  }),
  component: ComparePage,
});

function ComparePage() {
  const { a: slugA, b: slugB } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: philoListData } = useQuery(
    orpc.philosophers.list.queryOptions({ input: { limit: 100 } }),
  );
  const philosophers = philoListData?.philosophers ?? [];

  const { data: dataA, isLoading: loadingA } = useQuery({
    ...orpc.philosophers.get.queryOptions({ input: { slug: slugA ?? "" } }),
    enabled: !!slugA,
  });

  const { data: dataB, isLoading: loadingB } = useQuery({
    ...orpc.philosophers.get.queryOptions({ input: { slug: slugB ?? "" } }),
    enabled: !!slugB,
  });

  const handleSelect = (side: "a" | "b", slug: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [side]: slug || undefined,
      }),
    });
  };

  const isLoading = loadingA || loadingB;

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
            <span style={{ color: "var(--ink)" }}>比較</span>
          </nav>
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "var(--accent)" }}>
            Compare
          </p>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
          >
            哲学者を比べてみよう
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--philo-muted)" }}>
            2人の哲学者を選んで、思想・時代・著作を並べて比較する。
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* 哲学者セレクト */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-12">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              哲学者 A
            </label>
            <select
              value={slugA ?? ""}
              onChange={(e) => handleSelect("a", e.target.value)}
              className="text-sm px-3 py-2.5 rounded-lg outline-none"
              style={{
                border: "1px solid rgba(139,69,19,0.25)",
                backgroundColor: "var(--paper)",
                color: "var(--ink)",
                fontFamily: '"Noto Serif JP", serif',
              }}
            >
              <option value="">-- 哲学者を選ぶ --</option>
              {philosophers.map((p) => (
                <option key={p.id} value={p.slug} disabled={p.slug === slugB}>
                  {p.name}（{p.era}）
                </option>
              ))}
            </select>
          </div>

          <div
            className="text-2xl font-bold text-center select-none"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: "var(--accent)" }}
          >
            VS
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              哲学者 B
            </label>
            <select
              value={slugB ?? ""}
              onChange={(e) => handleSelect("b", e.target.value)}
              className="text-sm px-3 py-2.5 rounded-lg outline-none"
              style={{
                border: "1px solid rgba(139,69,19,0.25)",
                backgroundColor: "var(--paper)",
                color: "var(--ink)",
                fontFamily: '"Noto Serif JP", serif',
              }}
            >
              <option value="">-- 哲学者を選ぶ --</option>
              {philosophers.map((p) => (
                <option key={p.id} value={p.slug} disabled={p.slug === slugA}>
                  {p.name}（{p.era}）
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 比較エリア */}
        {!slugA && !slugB ? (
          <div className="text-center py-24">
            <p
              className="text-6xl mb-6 select-none"
              style={{ fontFamily: '"Cormorant Garamond", serif', color: "rgba(139,69,19,0.2)" }}
            >
              φ
            </p>
            <p style={{ color: "var(--philo-muted)" }}>上のセレクトボックスから哲学者を2人選んでください。</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="h-32 rounded-xl" style={{ backgroundColor: "var(--aged)" }} />
                <div className="h-4 w-2/3 rounded" style={{ backgroundColor: "var(--aged)" }} />
                <div className="h-4 w-1/2 rounded" style={{ backgroundColor: "var(--aged)" }} />
              </div>
            ))}
          </div>
        ) : (
          <RevealWrapper>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: "40rem" }}>
                <thead>
                  <tr>
                    <th
                      className="py-3 px-4 text-left text-xs uppercase tracking-widest w-1/4"
                      style={{ color: "var(--accent)", borderBottom: "2px solid rgba(139,69,19,0.2)" }}
                    />
                    {[dataA, dataB].map((d, i) => (
                      <th
                        key={i}
                        className="py-3 px-4 text-center"
                        style={{ borderBottom: "2px solid rgba(139,69,19,0.2)" }}
                      >
                        {d ? (
                          <Link
                            to="/philosophers/$slug"
                            params={{ slug: d.slug }}
                            className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto"
                              style={{
                                backgroundColor: "rgba(139,69,19,0.1)",
                                color: "var(--accent)",
                                fontFamily: '"Cormorant Garamond", serif',
                              }}
                            >
                              {d.initial}
                            </div>
                            <span
                              className="text-lg font-bold"
                              style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                            >
                              {d.name}
                            </span>
                            <span className="text-xs" style={{ color: "var(--philo-muted)" }}>
                              {d.nameEn}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-sm" style={{ color: "var(--light-muted)" }}>
                            未選択
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 時代 */}
                  <CompareRow label="時代">
                    <CompareCell value={dataA?.era} />
                    <CompareCell value={dataB?.era} />
                  </CompareRow>

                  {/* 地域 */}
                  <CompareRow label="地域">
                    <CompareCell value={dataA?.region} />
                    <CompareCell value={dataB?.region} />
                  </CompareRow>

                  {/* 主要思想 */}
                  <CompareRow label="主要思想">
                    <td className="py-4 px-4" style={{ borderBottom: "1px solid rgba(139,69,19,0.08)" }}>
                      {dataA ? (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {dataA.keyIdeas.map((idea) => (
                            <span
                              key={idea}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "var(--aged)", color: "var(--philo-muted)", border: "1px solid rgba(139,69,19,0.1)" }}
                            >
                              {idea}
                            </span>
                          ))}
                        </div>
                      ) : <EmptyCell />}
                    </td>
                    <td className="py-4 px-4" style={{ borderBottom: "1px solid rgba(139,69,19,0.08)" }}>
                      {dataB ? (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {dataB.keyIdeas.map((idea) => (
                            <span
                              key={idea}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "var(--aged)", color: "var(--philo-muted)", border: "1px solid rgba(139,69,19,0.1)" }}
                            >
                              {idea}
                            </span>
                          ))}
                        </div>
                      ) : <EmptyCell />}
                    </td>
                  </CompareRow>

                  {/* 主要著作 */}
                  <CompareRow label="主要著作">
                    <td className="py-4 px-4" style={{ borderBottom: "1px solid rgba(139,69,19,0.08)" }}>
                      {dataA ? (
                        <ul className="flex flex-col gap-1 text-center">
                          {dataA.majorWorks.map((w) => (
                            <li key={w} className="text-sm" style={{ color: "var(--philo-muted)" }}>{w}</li>
                          ))}
                        </ul>
                      ) : <EmptyCell />}
                    </td>
                    <td className="py-4 px-4" style={{ borderBottom: "1px solid rgba(139,69,19,0.08)" }}>
                      {dataB ? (
                        <ul className="flex flex-col gap-1 text-center">
                          {dataB.majorWorks.map((w) => (
                            <li key={w} className="text-sm" style={{ color: "var(--philo-muted)" }}>{w}</li>
                          ))}
                        </ul>
                      ) : <EmptyCell />}
                    </td>
                  </CompareRow>

                  {/* 関連テーマ */}
                  <CompareRow label="関連テーマ">
                    <td className="py-4 px-4" style={{ borderBottom: "1px solid rgba(139,69,19,0.08)" }}>
                      {dataA ? (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {dataA.themes.map((t) => (
                            <Link
                              key={t.id}
                              to="/themes/$slug"
                              params={{ slug: t.slug }}
                              className="text-xs px-2 py-0.5 rounded-full transition-opacity hover:opacity-70"
                              style={{ backgroundColor: "rgba(139,69,19,0.08)", color: "var(--accent)", border: "1px solid rgba(139,69,19,0.15)" }}
                            >
                              {t.name}
                            </Link>
                          ))}
                        </div>
                      ) : <EmptyCell />}
                    </td>
                    <td className="py-4 px-4" style={{ borderBottom: "1px solid rgba(139,69,19,0.08)" }}>
                      {dataB ? (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {dataB.themes.map((t) => (
                            <Link
                              key={t.id}
                              to="/themes/$slug"
                              params={{ slug: t.slug }}
                              className="text-xs px-2 py-0.5 rounded-full transition-opacity hover:opacity-70"
                              style={{ backgroundColor: "rgba(139,69,19,0.08)", color: "var(--accent)", border: "1px solid rgba(139,69,19,0.15)" }}
                            >
                              {t.name}
                            </Link>
                          ))}
                        </div>
                      ) : <EmptyCell />}
                    </td>
                  </CompareRow>

                  {/* 名言 */}
                  <CompareRow label="名言">
                    <td className="py-4 px-4" style={{ borderBottom: "1px solid rgba(139,69,19,0.08)" }}>
                      {dataA?.quotes?.[0] ? (
                        <blockquote
                          className="text-sm italic text-center leading-relaxed"
                          style={{ fontFamily: '"Cormorant Garamond", serif', color: "var(--philo-muted)", fontSize: "0.95rem" }}
                        >
                          {dataA.quotes[0].text}
                        </blockquote>
                      ) : <EmptyCell />}
                    </td>
                    <td className="py-4 px-4" style={{ borderBottom: "1px solid rgba(139,69,19,0.08)" }}>
                      {dataB?.quotes?.[0] ? (
                        <blockquote
                          className="text-sm italic text-center leading-relaxed"
                          style={{ fontFamily: '"Cormorant Garamond", serif', color: "var(--philo-muted)", fontSize: "0.95rem" }}
                        >
                          {dataB.quotes[0].text}
                        </blockquote>
                      ) : <EmptyCell />}
                    </td>
                  </CompareRow>
                </tbody>
              </table>
            </div>
          </RevealWrapper>
        )}
      </div>
    </div>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td
        className="py-4 px-4 text-xs font-semibold uppercase tracking-wider align-top"
        style={{ color: "var(--accent)", borderBottom: "1px solid rgba(139,69,19,0.08)", whiteSpace: "nowrap" }}
      >
        {label}
      </td>
      {children}
    </tr>
  );
}

function CompareCell({ value }: { value?: string | null }) {
  if (!value) return <EmptyCell />;
  return (
    <td
      className="py-4 px-4 text-sm text-center align-middle"
      style={{ color: "var(--philo-muted)", borderBottom: "1px solid rgba(139,69,19,0.08)" }}
    >
      {value}
    </td>
  );
}

function EmptyCell() {
  return (
    <td
      className="py-4 px-4 text-center text-xs align-middle"
      style={{ color: "var(--light-muted)", borderBottom: "1px solid rgba(139,69,19,0.08)" }}
    >
      —
    </td>
  );
}
