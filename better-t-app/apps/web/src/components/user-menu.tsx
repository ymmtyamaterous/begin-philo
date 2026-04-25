import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@better-t-app/ui/components/dropdown-menu";
import { Skeleton } from "@better-t-app/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-8 w-20 rounded-full" style={{ backgroundColor: "rgba(139,69,19,0.12)" }} />;
  }

  if (!session) {
    return (
      <Link
        to="/login"
        className="text-sm px-3 py-1.5 rounded-full transition-colors"
        style={{
          fontFamily: '"Noto Serif JP", serif',
          color: "var(--accent)",
          border: "1px solid rgba(139,69,19,0.35)",
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(139,69,19,0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
        }}
      >
        ログイン
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full transition-colors cursor-pointer outline-none"
        style={{
          fontFamily: '"Noto Serif JP", serif',
          color: "var(--ink)",
          border: "1px solid rgba(139,69,19,0.25)",
          backgroundColor: "rgba(139,69,19,0.05)",
        }}
      >
        <span className="max-w-[7rem] truncate">{session.user.name}</span>
        <ChevronDown size={13} style={{ color: "var(--philo-muted)", flexShrink: 0 }} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-44 rounded-none"
        style={{
          backgroundColor: "var(--paper)",
          border: "1px solid rgba(139,69,19,0.18)",
          fontFamily: '"Noto Serif JP", serif',
          boxShadow: "0 4px 16px rgba(26,18,9,0.1)",
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel
            style={{
              color: "var(--philo-muted)",
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
            }}
          >
            アカウント
          </DropdownMenuLabel>
          <DropdownMenuSeparator style={{ backgroundColor: "rgba(139,69,19,0.12)" }} />
          <DropdownMenuItem
            style={{ color: "var(--philo-muted)", fontSize: "0.8rem", cursor: "default" }}
          >
            {session.user.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator style={{ backgroundColor: "rgba(139,69,19,0.12)" }} />
          <DropdownMenuItem asChild style={{ fontFamily: '"Noto Serif JP", serif', fontSize: "0.875rem" }}>
            <Link to="/dashboard">マイページ</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator style={{ backgroundColor: "rgba(139,69,19,0.12)" }} />
          <DropdownMenuItem
            variant="destructive"
            style={{ fontFamily: '"Noto Serif JP", serif', fontSize: "0.875rem" }}
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({ to: "/" });
                  },
                },
              });
            }}
          >
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
