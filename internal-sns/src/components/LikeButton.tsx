"use client";

import { useState, useTransition } from "react";

export default function LikeButton({
  tweetId,
  initialLiked,
  initialCount,
}: {
  tweetId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const res = await fetch(`/api/tweets/${tweetId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.likeCount);
      } else {
        setLiked(!nextLiked);
        setCount((c) => c - (nextLiked ? 1 : -1));
      }
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition hover:bg-danger/10 ${
        liked ? "text-danger" : "text-muted hover:text-danger"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2 5 5.5 5c2 0 3.5 1.2 4.5 2.7C11 6.2 12.5 5 14.5 5 18 5 19.6 8.6 22 11.7 19.5 16.3 12 21 12 21Z"
          strokeLinejoin="round"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
