"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function FollowRequestActions({ requestId }: { requestId: string }) {
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const act = (action: "accept" | "reject") => {
    startTransition(async () => {
      const res = await fetch(`/api/follow-requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    });
  };

  if (done) return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("accept")}
        disabled={isPending}
        className="rounded-full bg-accent px-4 py-1.5 font-bold text-white transition hover:bg-accent-hover disabled:opacity-50"
      >
        承認
      </button>
      <button
        onClick={() => act("reject")}
        disabled={isPending}
        className="rounded-full border border-border px-4 py-1.5 font-bold transition hover:bg-surface disabled:opacity-50"
      >
        拒否
      </button>
    </div>
  );
}
