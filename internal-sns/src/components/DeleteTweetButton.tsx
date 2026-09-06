"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function DeleteTweetButton({ tweetId }: { tweetId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onDelete = () => {
    if (!confirm("この投稿を削除しますか？")) return;
    startTransition(async () => {
      const res = await fetch(`/api/tweets/${tweetId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete();
      }}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted transition hover:bg-danger/10 hover:text-danger"
      title="削除"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18" strokeLinecap="round" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
