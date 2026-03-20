import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { RevealWrapper } from "@/components/reveal-wrapper";
import { SectionHeader } from "@/components/section-header";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/glossary")({
  component: GlossaryPage,
});

// かな行のリスト (あいうえお順)
const KANA_ROWS = [
  { label: "あ行", values: ["あ", "い", "う", "え", "お"] },
  { label: "か行", values: ["か", "き", "く", "け", "こ"] },
  { label: "さ行", values: ["さ", "し", "す", "せ", "そ"] },
  { label: "た行", values: ["た", "ち", "つ", "て", "と"] },
  { label: "な行", values: ["な", "に", "ぬ", "ね", "の"] },
  { label: "は行", values: ["は", "ひ", "ふ", "へ", "ほ"] },
  { label: "ま行", values: ["ま", "み", "む", "め", "も"] },
  { label: "や行", values: ["や", "ゆ", "よ"] },
  { label: "ら行", values: ["ら", "り", "る", "れ", "ろ"] },
  { label: "わ行", values: ["わ", "を", "ん"] },
];

// 行ラベル用
const ROW_LABELS = KANA_ROWS.map((r) => r.label);

function GlossaryPage() {
  const [selectedRow, setSelectedRow] = useState<string | undefined>(undefined);

  // 選択した行の最初の文字を initial として渡す
  const initial = selectedRow
    ? KANA_ROWS.find((r) => r.label === selectedRow)?.values[0]
    : undefined;

  const { data, isLoading } = useQuery(
    orpc.glossary.list.queryOptions({
      input: initial ? { initial } : {},
    }),
  );

  return (
    <div style={{ backgroundColor: "var(--paper)" }}>
      {/* ページヘッダー */}
      <div
        className="py-20 px-6"
        style={{
          backgroundColor: "var(--ink)",
          backgroundImage:
            "radial-gradient(ellipse at 70% 30%, rgba(139,69,19,0.15) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            label="GLOSSARY"
            title="用語集"
            description="哲学の重要概念・用語をわかりやすく解説します。"
            light
            center
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* かな行フィルター */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            type="button"
            onClick={() => setSelectedRow(undefined)}
            className="px-3 py-1.5 rounded-full text-sm transition-all"
            style={
              selectedRow === undefined
                ? { backgroundColor: "var(--accent)", color: "var(--paper)" }
                : {
                    backgroundColor: "var(--aged)",
                    color: "var(--philo-muted)",
                    border: "1px solid rgba(139,69,19,0.15)",
                  }
            }
          >
            すべて
          </button>
          {ROW_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSelectedRow(label)}
              className="px-3 py-1.5 rounded-full text-sm transition-all"
              style={
                selectedRow === label
                  ? { backgroundColor: "var(--accent)", color: "var(--paper)" }
                  : {
                      backgroundColor: "var(--aged)",
                      color: "var(--philo-muted)",
                      border: "1px solid rgba(139,69,19,0.15)",
                    }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl"
                style={{ backgroundColor: "var(--aged)" }}
              />
            ))}
          </div>
        ) : (data?.terms ?? []).length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: "var(--philo-muted)" }}>用語が見つかりませんでした。</p>
          </div>
        ) : (
          <RevealWrapper stagger className="flex flex-col gap-4">
            {(data?.terms ?? []).map((term) => (
              <div
                key={term.id}
                className="p-5 rounded-xl"
                style={{
                  backgroundColor: "var(--aged)",
                  border: "1px solid rgba(139,69,19,0.1)",
                }}
              >
                <div className="flex items-baseline gap-3 mb-2">
                  <h3
                    className="text-lg font-semibold"
                    style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                  >
                    {term.term}
                  </h3>
                  {term.reading && (
                    <span className="text-sm" style={{ color: "var(--light-muted)" }}>
                      {term.reading}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--philo-muted)" }}>
                  {term.definition}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {term.philosopher && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(139,69,19,0.08)",
                        color: "var(--accent)",
                        border: "1px solid rgba(139,69,19,0.12)",
                      }}
                    >
                      {term.philosopher.name}
                    </span>
                  )}
                  {term.theme && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(201,168,76,0.1)",
                        color: "var(--gold)",
                        border: "1px solid rgba(201,168,76,0.2)",
                      }}
                    >
                      {term.theme.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </RevealWrapper>
        )}
      </div>
    </div>
  );
}
