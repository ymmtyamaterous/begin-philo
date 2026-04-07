import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div
      className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--paper)" }}
    >
      <div
        className="w-full max-w-md rounded-sm shadow-md"
        style={{
          backgroundColor: "rgba(255,252,246,0.85)",
          border: "1px solid rgba(139,69,19,0.15)",
          backdropFilter: "blur(4px)",
        }}
      >
        {showSignIn ? (
          <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
        )}
      </div>
    </div>
  );
}
