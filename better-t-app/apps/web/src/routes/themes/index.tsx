import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { RevealWrapper } from "@/components/reveal-wrapper";
import { SectionHeader } from "@/components/section-header";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/themes/")({
  component: ThemesPage,
});

function ThemesPage() {
  const { data, isLoading } = useQuery(orpc.themes.list.queryOptions());

  return (
    <div style={{ backgroundColor: "var(--paper)" }}>
      {/* ページヘッダー */}
      <div
        className="py-20 px-6"
        style={{
          backgroundColor: "var(--ink)",
          backgroundImage:
            "radial-gradient(ellipse at 60% 40%, rgba(139,69,19,0.15) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            label="THEMES"
            title="哲学のテーマ"
            description="時代を超えて問われ続けてきた普遍的なテーマを、体系的に学びましょう。"
            light
            center
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl"
                style={{ backgroundColor: "var(--aged)" }}
              />
            ))}
          </div>
        ) : (
          <RevealWrapper stagger className="flex flex-col gap-4">
            {(data?.themes ?? []).map((theme, idx) => (
              <Link
                key={theme.id}
                to="/themes/$slug"
                params={{ slug: theme.slug }}
                className="group flex items-center gap-6 p-6 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  backgroundColor: "var(--aged)",
                  border: "1px solid rgba(139,69,19,0.1)",
                  boxShadow: "0 1px 4px rgba(26,18,9,0.04)",
                }}
              >
                {/* テーマ番号 */}
                <span
                  className="text-3xl font-bold shrink-0 w-14 text-center"
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    color: "var(--light-muted)",
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div
                  className="w-px self-stretch"
                  style={{ backgroundColor: "rgba(139,69,19,0.15)" }}
                />

                {/* テーマ情報 */}
                <div className="flex-1">
                  <h2
                    className="text-xl font-semibold mb-1 transition-colors group-hover:text-[var(--accent)]"
                    style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                  >
                    {theme.name}
                  </h2>
                  <p className="text-sm line-clamp-2" style={{ color: "var(--philo-muted)" }}>
                    {theme.description}
                  </p>
                </div>

                {/* 記事数バッジ */}
                <div className="shrink-0 text-right">
                  <span
                    className="text-2xl font-bold block"
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      color: "var(--accent)",
                    }}
                  >
                    {theme.articleCount}
                  </span>
                  <span className="text-xs" style={{ color: "var(--light-muted)" }}>
                    記事
                  </span>
                </div>

                <span
                  className="text-xl transition-transform group-hover:translate-x-1"
                  style={{ color: "var(--light-muted)" }}
                >
                  →
                </span>
              </Link>
            ))}
          </RevealWrapper>
        )}
      </div>
    </div>
  );
}
