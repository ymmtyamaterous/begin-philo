import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useRef, useState } from "react";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

// ノード種別フィルター
type NodeFilter = "theme" | "philosopher" | "article";

// ノードの色定義
const NODE_STYLES = {
  theme: {
    bg: "rgba(212, 175, 55, 0.15)",
    border: "#d4af37",
    color: "#7a5c00",
    label: "テーマ",
    emoji: "🏛️",
  },
  philosopher: {
    bg: "rgba(139, 69, 19, 0.12)",
    border: "#8b4513",
    color: "#5a2d0c",
    label: "哲学者",
    emoji: "🧠",
  },
  article: {
    bg: "rgba(245, 240, 230, 0.9)",
    border: "rgba(139,69,19,0.3)",
    color: "#3a2a1a",
    label: "記事",
    emoji: "📄",
  },
} as const;

// 位置計算：横並びの3行レイアウト
// rawNodes の id はすでに "theme-xxx"/"philo-xxx"/"article-xxx" 形式なので直接使用
function computePositions(nodes: { id: string; type: string }[]) {
  const themes = nodes.filter((n) => n.type === "theme");
  const philosophers = nodes.filter((n) => n.type === "philosopher");
  const articles = nodes.filter((n) => n.type === "article");

  const positions: Record<string, { x: number; y: number }> = {};
  const hGap = 210;

  themes.forEach((t, i) => {
    positions[t.id] = {
      x: (i - (themes.length - 1) / 2) * hGap,
      y: 0,
    };
  });

  philosophers.forEach((p, i) => {
    positions[p.id] = {
      x: (i - (philosophers.length - 1) / 2) * hGap,
      y: 260,
    };
  });

  articles.forEach((a, i) => {
    positions[a.id] = {
      x: (i - (articles.length - 1) / 2) * hGap,
      y: 520,
    };
  });

  return positions;
}

function MapPage() {
  const navigate = useNavigate();
  const fitViewRef = useRef<(() => void) | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<NodeFilter>>(
    new Set(["theme", "philosopher", "article"]),
  );

  const { data, isLoading } = useQuery(orpc.map.getData.queryOptions());

  const rawNodes = useMemo(() => data?.nodes ?? [], [data]);
  const rawEdges = useMemo(() => data?.edges ?? [], [data]);

  // 全rawNodesの位置を一括計算（フィルター変更の影響を受けない）
  const positions = useMemo(() => computePositions(rawNodes), [rawNodes]);

  // フィルター適用済みノード
  const flowNodes: Node[] = useMemo(() => {
    return rawNodes
      .filter((n) => activeFilters.has(n.type as NodeFilter))
      .map((n) => {
        const style = NODE_STYLES[n.type as NodeFilter];
        return {
          id: n.id,
          type: "default",
          position: positions[n.id] ?? { x: 0, y: 0 },
          data: {
            label: (
              <div className="flex flex-col items-start gap-0.5 text-left">
                <span className="text-[10px] opacity-60">{style.emoji} {style.label}</span>
                <span className="text-xs font-semibold leading-tight">{n.label}</span>
              </div>
            ),
          },
          style: {
            background: style.bg,
            border: `1.5px solid ${style.border}`,
            color: style.color,
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px",
            fontFamily: '"Noto Serif JP", serif',
            cursor: "pointer",
            minWidth: "130px",
            maxWidth: "160px",
          },
        };
      });
  }, [rawNodes, positions, activeFilters]);

  // フィルター適用済みエッジ
  const flowEdges: Edge[] = useMemo(() => {
    const visibleIds = new Set(flowNodes.map((n) => n.id));
    return rawEdges
      .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "default",
        style: {
          stroke:
            e.edgeType === "article-theme"
              ? "rgba(212,175,55,0.5)"
              : "rgba(139,69,19,0.4)",
          strokeWidth: 1.5,
        },
      }));
  }, [rawEdges, flowNodes]);

  // ノードクリック → 詳細ページへ遷移
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const raw = rawNodes.find((n) => n.id === node.id);
      if (!raw) return;
      if (raw.type === "theme") {
        navigate({ to: "/themes/$slug", params: { slug: raw.slug } });
      } else if (raw.type === "philosopher") {
        navigate({ to: "/philosophers/$slug", params: { slug: raw.slug } });
      } else if (raw.type === "article") {
        navigate({ to: "/articles/$slug", params: { slug: raw.slug } });
      }
    },
    [rawNodes, navigate],
  );

  const toggleFilter = (filter: NodeFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        if (next.size > 1) next.delete(filter); // 最低1つ残す
      } else {
        next.add(filter);
      }
      return next;
    });
    // フィルター変更後にビューを再フィット
    setTimeout(() => fitViewRef.current?.(), 50);
  };

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 64px)", backgroundColor: "var(--paper)" }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(139,69,19,0.15)" }}
      >
        <div>
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
          >
            学習マップ
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--philo-muted)" }}>
            ノードをクリックすると詳細ページへ移動します
          </p>
        </div>

        {/* フィルタートグル */}
        <div className="flex items-center gap-2">
          {(Object.entries(NODE_STYLES) as [NodeFilter, (typeof NODE_STYLES)[NodeFilter]][]).map(
            ([key, style]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleFilter(key)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
                style={
                  activeFilters.has(key)
                    ? {
                        backgroundColor: style.bg,
                        border: `1.5px solid ${style.border}`,
                        color: style.color,
                        fontFamily: '"Noto Serif JP", serif',
                      }
                    : {
                        backgroundColor: "transparent",
                        border: "1.5px solid rgba(139,69,19,0.15)",
                        color: "var(--philo-muted)",
                        fontFamily: '"Noto Serif JP", serif',
                        opacity: 0.5,
                      }
                }
              >
                <span>{style.emoji}</span>
                <span>{style.label}</span>
              </button>
            ),
          )}
        </div>
      </div>

      {/* ReactFlow */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
              />
              <p className="text-sm" style={{ color: "var(--philo-muted)" }}>
                マップを読み込んでいます…
              </p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodeClick={onNodeClick}
            onInit={(instance) => {
              fitViewRef.current = () => instance.fitView({ padding: 0.2 });
            }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            minZoom={0.3}
            maxZoom={2}
            style={{ background: "transparent" }}
          >
            <Background color="rgba(139,69,19,0.08)" gap={24} size={1} />
            <Controls
              style={{
                backgroundColor: "var(--paper)",
                border: "1px solid rgba(139,69,19,0.2)",
                borderRadius: "8px",
              }}
            />
          </ReactFlow>
        )}
      </div>

      {/* 凡例 */}
      <div
        className="px-6 py-3 border-t flex items-center gap-6 flex-wrap"
        style={{ borderColor: "rgba(139,69,19,0.15)" }}
      >
        <span className="text-xs" style={{ color: "var(--philo-muted)" }}>
          凡例:
        </span>
        {(Object.entries(NODE_STYLES) as [NodeFilter, (typeof NODE_STYLES)[NodeFilter]][]).map(
          ([key, style]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
              />
              <span className="text-xs" style={{ color: "var(--philo-muted)" }}>
                {style.emoji} {style.label}
              </span>
            </div>
          ),
        )}
        <span className="text-xs ml-auto" style={{ color: "var(--light-muted)" }}>
          ドラッグでパン / スクロールでズーム
        </span>
      </div>
    </div>
  );
}
