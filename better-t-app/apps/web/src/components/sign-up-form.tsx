import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("アカウントを作成しました");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(2, "お名前は2文字以上で入力してください"),
          email: z.email("有効なメールアドレスを入力してください"),
          password: z.string().min(8, "パスワードは8文字以上で入力してください"),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "パスワードが一致しません",
          path: ["confirmPassword"],
        }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-10">
      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <p
          className="text-xs tracking-widest mb-2"
          style={{ color: "var(--philo-muted)", fontFamily: '"Noto Serif JP", serif' }}
        >
          SIGN UP
        </p>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
        >
          はじめての方へ
        </h1>
        <div className="mt-3 mx-auto w-12 h-px" style={{ backgroundColor: "var(--accent)" }} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor={field.name}
                  className="text-xs tracking-wide"
                  style={{ color: "var(--philo-muted)", fontFamily: '"Noto Serif JP", serif' }}
                >
                  お名前
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="山田 太郎"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  style={{ backgroundColor: "rgba(245,240,232,0.6)", borderColor: "rgba(139,69,19,0.25)" }}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-xs" style={{ color: "var(--red)" }}>
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor={field.name}
                  className="text-xs tracking-wide"
                  style={{ color: "var(--philo-muted)", fontFamily: '"Noto Serif JP", serif' }}
                >
                  メールアドレス
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  style={{ backgroundColor: "rgba(245,240,232,0.6)", borderColor: "rgba(139,69,19,0.25)" }}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-xs" style={{ color: "var(--red)" }}>
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor={field.name}
                  className="text-xs tracking-wide"
                  style={{ color: "var(--philo-muted)", fontFamily: '"Noto Serif JP", serif' }}
                >
                  パスワード
                </Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pr-10"
                    style={{ backgroundColor: "rgba(245,240,232,0.6)", borderColor: "rgba(139,69,19,0.25)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                    style={{ color: "var(--philo-muted)" }}
                    tabIndex={-1}
                    aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示する"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-xs" style={{ color: "var(--red)" }}>
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="confirmPassword">
            {(field) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor={field.name}
                  className="text-xs tracking-wide"
                  style={{ color: "var(--philo-muted)", fontFamily: '"Noto Serif JP", serif' }}
                >
                  パスワード（確認）
                </Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pr-10"
                    style={{ backgroundColor: "rgba(245,240,232,0.6)", borderColor: "rgba(139,69,19,0.25)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                    style={{ color: "var(--philo-muted)" }}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "確認用パスワードを隠す" : "確認用パスワードを表示する"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-xs" style={{ color: "var(--red)" }}>
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full py-2.5 text-sm tracking-widest font-medium transition-opacity disabled:opacity-40"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--paper)",
                fontFamily: '"Noto Serif JP", serif',
                border: "none",
              }}
            >
              {isSubmitting ? "登録中..." : "アカウントを作成"}
            </button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-xs tracking-wide transition-colors"
          style={{ color: "var(--philo-muted)", fontFamily: '"Noto Serif JP", serif' }}
        >
          すでにアカウントをお持ちの方は{" "}
          <span
            className="underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            ログイン
          </span>
        </button>
      </div>
    </div>
  );
}
