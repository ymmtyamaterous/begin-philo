import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { orpc } from "@/utils/orpc";

interface GlossaryPopoverProps {
  term: string;
  children: React.ReactNode;
}

export function GlossaryPopover({ term, children }: GlossaryPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // open になったときだけフェッチ
  const { data, isLoading } = useQuery({
    ...orpc.glossary.get.queryOptions({ input: { term } }),
    enabled: open,
  });

  // 外部クリックで閉じる
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Escape キーで閉じる
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <span ref={containerRef} style={{ position: "relative", display: "inline" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer underline decoration-dotted underline-offset-2"
        style={{
          color: "var(--accent)",
          backgroundColor: "transparent",
          border: "none",
          padding: 0,
          font: "inherit",
          textAlign: "left",
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {children}
      </button>

      {open && (
        <span
          role="dialog"
          aria-label={`${term}の説明`}
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            minWidth: "240px",
            maxWidth: "320px",
            backgroundColor: "var(--paper)",
            border: "1px solid rgba(139,69,19,0.2)",
            borderRadius: "10px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* 吹き出し三角 */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-7px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "12px",
              height: "12px",
              backgroundColor: "var(--paper)",
              border: "1px solid rgba(139,69,19,0.2)",
              borderTop: "none",
              borderLeft: "none",
            }}
          />

          {isLoading && (
            <span style={{ color: "var(--philo-muted)", fontSize: "0.8rem" }}>読み込み中…</span>
          )}

          {data && (
            <>
              <span style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span
                  style={{
                    fontFamily: '"Shippori Mincho", serif',
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--ink)",
                  }}
                >
                  {data.term}
                </span>
                {data.reading && (
                  <span style={{ fontSize: "0.72rem", color: "var(--philo-muted)" }}>
                    ({data.reading})
                  </span>
                )}
              </span>

              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--philo-muted)",
                  lineHeight: 1.65,
                }}
              >
                {data.definition}
              </span>

              <Link
                to="/glossary"
                style={{
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  textDecoration: "none",
                  marginTop: "2px",
                }}
                onClick={() => setOpen(false)}
              >
                用語集で詳しく見る →
              </Link>
            </>
          )}
        </span>
      )}
    </span>
  );
}
