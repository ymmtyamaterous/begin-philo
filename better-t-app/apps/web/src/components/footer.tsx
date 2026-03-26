import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer
      className="py-16 px-6"
      style={{ backgroundColor: "var(--ink)", color: "var(--paper)" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
        {/* ブランドエリア */}
        <div className="flex flex-col gap-4">
          <div
            className="text-2xl font-bold"
            style={{ fontFamily: '"Shippori Mincho", serif' }}
          >
            哲学の庭
            <span style={{ color: "var(--accent)" }}>。</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--light-muted)" }}>
            入門者のための哲学学習プラットフォーム。
            <br />
            難しい言葉は後回しでいい。
            <br />
            まず、一緒に考えよう。
          </p>
          <p className="text-xs mt-4" style={{ color: "var(--light-muted)" }}>
            © 2026 bphilo. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "var(--light-muted)", lineHeight: "1.6" }}>
            ⚠️ 本サイトのコンテンツ（記事・解説・用語集等）は
            <br />
            生成AIによって作成されています。
            <br />
            内容の正確性については十分ご確認ください。
          </p>
        </div>

        {/* コンテンツ */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gold)" }}>
            コンテンツ
          </h4>
          {[
            { to: "/articles", label: "記事を読む" },
            { to: "/philosophers", label: "哲学者" },
            { to: "/themes", label: "テーマ" },
            { to: "/courses", label: "学習コース" },
            { to: "/quotes", label: "名言集" },
          ].map((link) => (
            <FooterLink key={link.to} to={link.to} label={link.label} />
          ))}
        </div>

        {/* 東洋哲学 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gold)" }}>
            探索
          </h4>
          {[
            { to: "/glossary", label: "用語集" },
            { to: "/map", label: "学習マップ" },
            { to: "/search", label: "検索" },
            { to: "/dashboard", label: "ダッシュボード" },
          ].map((link) => (
            <FooterLink key={link.to} to={link.to} label={link.label} />
          ))}
        </div>

        {/* サイトについて */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gold)" }}>
            アカウント
          </h4>
          {[
            { to: "/login", label: "ログイン" },
            { to: "/signup", label: "会員登録（無料）" },
          ].map((link) => (
            <FooterLink key={link.to} to={link.to} label={link.label} />
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-sm transition-colors hover:text-[var(--gold)]"
      style={{ color: "var(--light-muted)" }}
    >
      {label}
    </Link>
  );
}
