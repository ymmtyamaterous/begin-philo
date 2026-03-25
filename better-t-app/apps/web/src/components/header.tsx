import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import UserMenu from "./user-menu";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const navLinks = [
    { to: "/courses", label: "学習コース" },
    { to: "/philosophers", label: "哲学者" },
    { to: "/themes", label: "テーマ" },
    { to: "/articles", label: "読む" },
    { to: "/quotes", label: "名言" },
    { to: "/philosophers/timeline", label: "タイムライン" },
    { to: "/compare", label: "比較" },
  ] as const;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate({ to: "/search", search: { q: searchQuery.trim() } });
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between"
      style={{
        backgroundColor: "rgba(245, 240, 232, 0.88)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(139,69,19,0.12)",
      }}
    >
      {/* ロゴ */}
      <Link
        to="/"
        className="text-xl font-bold shrink-0"
        style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
      >
        哲学の<span style={{ color: "var(--accent)" }}>庭</span>
      </Link>

      {/* ナビゲーション */}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="text-sm relative group transition-colors"
            style={{ color: "var(--philo-muted)", fontFamily: '"Noto Serif JP", serif' }}
            activeProps={{ style: { color: "var(--accent)" } }}
          >
            {label}
            <span
              className="absolute -bottom-0.5 left-0 w-0 h-[1px] group-hover:w-full transition-all duration-300"
              style={{ backgroundColor: "var(--accent)" }}
            />
          </Link>
        ))}
      </nav>

      {/* 右サイド */}
      <div className="flex items-center gap-3">
        {/* 無料バッジ */}
        <span
          className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: "rgba(45,74,45,0.12)",
            color: "var(--green-dark)",
            border: "1px solid rgba(45,74,45,0.2)",
          }}
        >
          完全無料
        </span>

        {/* 検索ボタン */}
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          className="p-1.5 rounded-md transition-colors hover:bg-[rgba(139,69,19,0.08)]"
          style={{ color: "var(--philo-muted)" }}
          aria-label="検索"
        >
          <Search size={18} />
        </button>

        <UserMenu />
      </div>

      {/* 検索バー（展開時） */}
      {searchOpen && (
        <div
          className="absolute top-full left-0 right-0 px-6 py-3"
          style={{
            backgroundColor: "rgba(245,240,232,0.96)",
            borderBottom: "1px solid rgba(139,69,19,0.12)",
          }}
        >
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="哲学者、テーマ、記事を検索..."
              className="flex-1 px-4 py-2 text-sm rounded-md outline-none"
              style={{
                border: "1px solid rgba(139,69,19,0.25)",
                backgroundColor: "rgba(255,255,255,0.6)",
                color: "var(--ink)",
                fontFamily: '"Noto Serif JP", serif',
              }}
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-md transition-colors"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--paper)",
                fontFamily: '"Noto Serif JP", serif',
              }}
            >
              検索
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

