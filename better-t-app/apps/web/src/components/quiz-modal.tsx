import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { orpc } from "@/utils/orpc";

interface QuizModalProps {
  lessonId: string;
  onClose: () => void;
  onComplete: () => void;
}

type AnswerState = {
  quizId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  explanation: string | null;
  correctOptionId: string | null;
};

export function QuizModal({ lessonId, onClose, onComplete }: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery(
    orpc.quiz.getByLesson.queryOptions({ input: { lessonId } }),
  );

  const submit = useMutation(orpc.quiz.submit.mutationOptions({}));

  const quizzes = data?.quizzes ?? [];
  const current = quizzes[currentIndex];

  // Escape キーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = async () => {
    if (!current || !selectedOption || showResult) return;

    const result = await submit.mutateAsync({
      quizId: current.id,
      selectedOptionId: selectedOption,
    });

    setAnswers((prev) => ({
      ...prev,
      [current.id]: {
        quizId: current.id,
        selectedOptionId: selectedOption,
        isCorrect: result.isCorrect,
        explanation: result.explanation,
        correctOptionId: result.correctOptionId,
      },
    }));
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setAllDone(true);
    }
  };

  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const currentAnswer = current ? answers[current.id] : null;

  return (
    // オーバーレイ
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--paper)", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
        role="dialog"
        aria-modal="true"
        aria-label="クイズ"
      >
        {/* ヘッダー */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: "var(--aged)", borderBottom: "1px solid rgba(139,69,19,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              Quiz
            </span>
            {!allDone && quizzes.length > 0 && (
              <span className="text-xs" style={{ color: "var(--philo-muted)" }}>
                {currentIndex + 1} / {quizzes.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none transition-opacity hover:opacity-60"
            style={{ color: "var(--philo-muted)" }}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* プログレスバー */}
        {!allDone && quizzes.length > 0 && (
          <div className="h-1" style={{ backgroundColor: "rgba(139,69,19,0.1)" }}>
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${((currentIndex + (showResult ? 1 : 0)) / quizzes.length) * 100}%`,
                backgroundColor: "var(--accent)",
              }}
            />
          </div>
        )}

        {/* コンテンツ */}
        <div className="px-6 py-8">
          {isLoading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="h-6 w-3/4 rounded" style={{ backgroundColor: "var(--aged)" }} />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl" style={{ backgroundColor: "var(--aged)" }} />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <p style={{ color: "var(--philo-muted)" }}>クイズが見つかりませんでした。</p>
          ) : allDone ? (
            // 全問完了画面
            <div className="text-center py-4">
              <div
                className="text-5xl mb-4 select-none"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                {correctCount === quizzes.length ? "🎉" : "✓"}
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
              >
                クイズ完了！
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--philo-muted)" }}>
                {quizzes.length}問中{" "}
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>{correctCount}問</span>{" "}
                正解しました。
              </p>
              <button
                type="button"
                onClick={onComplete}
                className="px-8 py-3 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: "var(--accent)", color: "var(--paper)" }}
              >
                レッスン完了へ →
              </button>
            </div>
          ) : (
            current && (
              <div className="flex flex-col gap-5">
                {/* 問題文 */}
                <p
                  className="text-base font-semibold leading-relaxed"
                  style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                >
                  {current.question}
                </p>

                {/* 選択肢 */}
                <div className="flex flex-col gap-2">
                  {current.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isCorrectOpt = currentAnswer?.correctOptionId === opt.id;
                    const isWrongSelected = showResult && isSelected && !currentAnswer?.isCorrect;

                    let bgColor = "var(--aged)";
                    let borderColor = "rgba(139,69,19,0.12)";
                    let textColor = "var(--philo-muted)";

                    if (!showResult && isSelected) {
                      bgColor = "rgba(139,69,19,0.1)";
                      borderColor = "var(--accent)";
                      textColor = "var(--ink)";
                    } else if (showResult && isCorrectOpt) {
                      bgColor = "rgba(34,139,34,0.08)";
                      borderColor = "rgba(34,139,34,0.4)";
                      textColor = "rgba(34,100,34,1)";
                    } else if (isWrongSelected) {
                      bgColor = "rgba(180,40,40,0.06)";
                      borderColor = "rgba(180,40,40,0.4)";
                      textColor = "rgba(160,40,40,1)";
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelect(opt.id)}
                        disabled={showResult}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-sm transition-all duration-150"
                        style={{
                          backgroundColor: bgColor,
                          border: `1.5px solid ${borderColor}`,
                          color: textColor,
                          cursor: showResult ? "default" : "pointer",
                        }}
                      >
                        <span
                          className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold"
                          style={{
                            borderColor: borderColor,
                            color: textColor,
                          }}
                        >
                          {String.fromCharCode(65 + opt.order - 1)}
                        </span>
                        <span>{opt.text}</span>
                        {showResult && isCorrectOpt && (
                          <span className="ml-auto text-base">✓</span>
                        )}
                        {isWrongSelected && (
                          <span className="ml-auto text-base">✗</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 解説 */}
                {showResult && currentAnswer?.explanation && (
                  <div
                    className="p-4 rounded-xl text-sm leading-relaxed"
                    style={{
                      backgroundColor: "rgba(139,69,19,0.05)",
                      border: "1px solid rgba(139,69,19,0.12)",
                      color: "var(--philo-muted)",
                    }}
                  >
                    <span
                      className="font-semibold block mb-1 text-xs uppercase tracking-wider"
                      style={{ color: "var(--accent)" }}
                    >
                      解説
                    </span>
                    {currentAnswer.explanation}
                  </div>
                )}

                {/* 操作ボタン */}
                <div className="flex justify-end gap-3 pt-2">
                  {!showResult ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!selectedOption || submit.isPending}
                      className="px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedOption ? "var(--accent)" : "var(--aged)",
                        color: selectedOption ? "var(--paper)" : "var(--light-muted)",
                        cursor: selectedOption ? "pointer" : "not-allowed",
                      }}
                    >
                      {submit.isPending ? "送信中..." : "回答する"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5"
                      style={{ backgroundColor: "var(--ink)", color: "var(--paper)" }}
                    >
                      {currentIndex < quizzes.length - 1 ? "次の問題 →" : "結果を見る →"}
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
