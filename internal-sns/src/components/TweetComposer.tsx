"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Avatar from "@/components/Avatar";

const MAX_LEN = 280;

export default function TweetComposer({
  username,
  avatarUrl,
  parentId,
  placeholder = "いまどうしてる？",
  autoFocus = false,
}: {
  username: string;
  avatarUrl?: string;
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    if (!content.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });
      if (res.ok) {
        setContent("");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "投稿に失敗しました");
      }
    });
  };

  const remaining = MAX_LEN - content.length;

  return (
    <div className="flex gap-3 border-b border-border px-4 py-3">
      <Avatar username={username} avatarUrl={avatarUrl} />
      <div className="min-w-0 flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={parentId ? 2 : 3}
          className="w-full resize-none bg-transparent text-lg text-foreground placeholder:text-muted"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className={`text-sm ${remaining < 0 ? "text-danger" : "text-muted"}`}>{remaining}</span>
          <button
            onClick={submit}
            disabled={isPending || !content.trim() || remaining < 0}
            className="rounded-full bg-accent px-4 py-1.5 font-bold text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {parentId ? "返信" : "投稿"}
          </button>
        </div>
      </div>
    </div>
  );
}
