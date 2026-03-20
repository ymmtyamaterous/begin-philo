import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { RevealWrapper } from "@/components/reveal-wrapper";
import { SectionHeader } from "@/components/section-header";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/courses/")({
  component: CoursesPage,
});

type Difficulty = "beginner" | "intermediate" | "advanced" | undefined;

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "rgba(45,74,45,0.12)",
  intermediate: "rgba(139,69,19,0.12)",
  advanced: "rgba(139,32,32,0.12)",
};

const DIFFICULTY_TEXT_COLORS: Record<string, string> = {
  beginner: "var(--green-dark)",
  intermediate: "var(--accent)",
  advanced: "var(--red)",
};

function CoursesPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>(undefined);

  const { data, isLoading } = useQuery(
    orpc.courses.list.queryOptions({
      input: difficulty ? { difficulty } : {},
    }),
  );

  const filters: { label: string; value: Difficulty }[] = [
    { label: "すべて", value: undefined },
    { label: "初級", value: "beginner" },
    { label: "中級", value: "intermediate" },
    { label: "上級", value: "advanced" },
  ];

  return (
    <div style={{ backgroundColor: "var(--paper)" }}>
      {/* ページヘッダー */}
      <div
        className="py-20 px-6"
        style={{
          backgroundColor: "var(--ink)",
          backgroundImage:
            "radial-gradient(ellipse at 30% 60%, rgba(139,69,19,0.15) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            label="COURSES"
            title="学習コース"
            description="段階的にステップアップできる体系的なコースで、哲学を深く学びましょう。"
            light
            center
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* フィルター */}
        <div className="flex gap-2 flex-wrap mb-8">
          {filters.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setDifficulty(f.value)}
              className="px-4 py-1.5 rounded-full text-sm transition-all duration-200"
              style={
                difficulty === f.value
                  ? {
                      backgroundColor: "var(--accent)",
                      color: "var(--paper)",
                    }
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl"
                style={{ backgroundColor: "var(--aged)" }}
              />
            ))}
          </div>
        ) : (data?.courses ?? []).length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: "var(--philo-muted)" }}>コースが見つかりません。</p>
          </div>
        ) : (
          <RevealWrapper stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data?.courses ?? []).map((course) => (
              <Link
                key={course.id}
                to="/courses/$slug"
                params={{ slug: course.slug }}
                className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: "var(--aged)",
                  border: "1px solid rgba(139,69,19,0.1)",
                  boxShadow: "0 2px 8px rgba(26,18,9,0.06)",
                }}
              >
                {/* コース番号バー */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ backgroundColor: "rgba(139,69,19,0.06)" }}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      color: "var(--light-muted)",
                    }}
                  >
                    {String(course.number).padStart(2, "0")}
                  </span>
                  {course.difficulty && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: DIFFICULTY_COLORS[course.difficulty] ?? "var(--aged)",
                        color: DIFFICULTY_TEXT_COLORS[course.difficulty] ?? "var(--philo-muted)",
                      }}
                    >
                      {DIFFICULTY_LABELS[course.difficulty] ?? course.difficulty}
                    </span>
                  )}
                </div>

                {/* コース情報 */}
                <div className="flex-1 p-5 flex flex-col">
                  <h3
                    className="text-base font-semibold mb-2 leading-snug transition-colors group-hover:text-[var(--accent)]"
                    style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                  >
                    {course.title}
                  </h3>
                  <p
                    className="text-xs flex-1 line-clamp-3 mb-4"
                    style={{ color: "var(--philo-muted)" }}
                  >
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--light-muted)" }}>
                    <span>{course.lessonCount} レッスン</span>
                    {course.estimatedMinutes && (
                      <span>約 {Math.round(course.estimatedMinutes / 60)} 時間</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </RevealWrapper>
        )}
      </div>
    </div>
  );
}
