"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Status = "ACCEPTED" | "PENDING" | "NONE";

export default function FollowButton({
  username,
  initialStatus,
}: {
  username: string;
  initialStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [hover, setHover] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const follow = () => {
    startTransition(async () => {
      const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        router.refresh();
      }
    });
  };

  const unfollow = () => {
    startTransition(async () => {
      const res = await fetch(`/api/users/${username}/follow`, { method: "DELETE" });
      if (res.ok) {
        setStatus("NONE");
        router.refresh();
      }
    });
  };

  if (status === "ACCEPTED") {
    return (
      <button
        onClick={unfollow}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={isPending}
        className={`w-32 rounded-full border px-4 py-1.5 font-bold transition disabled:opacity-50 ${
          hover
            ? "border-danger text-danger hover:bg-danger/10"
            : "border-border text-foreground hover:bg-surface"
        }`}
      >
        {hover ? "フォロー解除" : "フォロー中"}
      </button>
    );
  }

  if (status === "PENDING") {
    return (
      <button
        onClick={unfollow}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={isPending}
        className={`w-36 rounded-full border px-4 py-1.5 font-bold transition disabled:opacity-50 ${
          hover ? "border-danger text-danger hover:bg-danger/10" : "border-border text-foreground"
        }`}
      >
        {hover ? "リクエスト取消" : "リクエスト済み"}
      </button>
    );
  }

  return (
    <button
      onClick={follow}
      disabled={isPending}
      className="rounded-full bg-foreground px-4 py-1.5 font-bold text-background transition hover:opacity-90 disabled:opacity-50"
    >
      フォローする
    </button>
  );
}
