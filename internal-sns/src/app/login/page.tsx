"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("ユーザー名またはパスワードが正しくありません");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-3xl font-bold text-accent">Connect</h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">ログイン</h2>
          {error && <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
            required
            className="rounded border border-border bg-transparent px-3 py-3 text-foreground placeholder:text-muted"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            required
            className="rounded border border-border bg-transparent px-3 py-3 text-foreground placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent py-3 font-bold text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            ログイン
          </button>
        </form>
        <p className="mt-6 text-center text-muted">
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="text-accent hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
