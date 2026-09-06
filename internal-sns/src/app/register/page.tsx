"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, displayName }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "登録に失敗しました");
      return;
    }

    const signInRes = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-3xl font-bold text-accent">Connect</h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">アカウント作成</h2>
          {error && <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="表示名"
            required
            className="rounded border border-border bg-transparent px-3 py-3 text-foreground placeholder:text-muted"
          />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名（英数字・_、3〜20文字）"
            required
            pattern="[a-zA-Z0-9_]{3,20}"
            className="rounded border border-border bg-transparent px-3 py-3 text-foreground placeholder:text-muted"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
            className="rounded border border-border bg-transparent px-3 py-3 text-foreground placeholder:text-muted"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード（8文字以上）"
            required
            minLength={8}
            className="rounded border border-border bg-transparent px-3 py-3 text-foreground placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent py-3 font-bold text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            登録する
          </button>
        </form>
        <p className="mt-6 text-center text-muted">
          既にアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-accent hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
