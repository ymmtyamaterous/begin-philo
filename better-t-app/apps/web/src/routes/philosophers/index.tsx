import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { RevealWrapper } from "@/components/reveal-wrapper";
import { SectionHeader } from "@/components/section-header";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/philosophers/")({
  component: PhilosophersPage,
});

function PhilosophersPage() {
  const [region, setRegion] = useState<"western" | "eastern" | undefined>();

  const { data, isLoading } = useQuery(
    orpc.philosophers.list.queryOptions({ input: { limit: 100, region } }),
  );
  const philosophers = data?.philosophers ?? [];

  return (
    <div className="py-16 px-6" style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <RevealWrapper>
          <SectionHeader
            label="Philosophers"
            title="巨人たちの思想"
            description="時代を超えて問い続けた哲学者たちの生涯と思想を探索しましょう。"
          />
        </RevealWrapper>

        {/* フィルター */}
        <div className="flex gap-3">
          {[
            { label: "すべて", value: undefined },
            { label: "西洋哲学", value: "western" as const },
            { label: "東洋哲学", value: "eastern" as const },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setRegion(item.value)}
              className="text-sm px-4 py-1.5 rounded-full transition-all"
              style={{
                backgroundColor:
                  region === item.value ? "var(--accent)" : "rgba(139,69,19,0.08)",
                color: region === item.value ? "var(--paper)" : "var(--accent)",
                border: "1px solid rgba(139,69,19,0.15)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-xl animate-pulse"
                style={{ backgroundColor: "var(--aged)" }}
              />
            ))}
          </div>
        ) : (
          <RevealWrapper stagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
        )}
      </div>
    </div>
  );
}
