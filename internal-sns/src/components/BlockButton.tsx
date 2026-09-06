"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function BlockButton({
  username,
  initialBlocked,
}: {
  username: string;
  initialBlocked: boolean;
}) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    if (!blocked && !confirm(`@${username} をブロックしますか？`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/users/${username}/block`, {
        method: blocked ? "DELETE" : "POST",
      });
      if (res.ok) {
        setBlocked(!blocked);
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`rounded-full border px-4 py-1.5 font-bold transition disabled:opacity-50 ${
        blocked
          ? "border-danger text-danger hover:bg-danger/10"
          : "border-border text-foreground hover:bg-surface"
      }`}
    >
      {blocked ? "ブロック中" : "ブロック"}
    </button>
  );
}
