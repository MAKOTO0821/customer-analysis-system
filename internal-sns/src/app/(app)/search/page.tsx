"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import FollowButton from "@/components/FollowButton";

type SearchUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isPrivate: boolean;
  followStatus: "ACCEPTED" | "PENDING" | "NONE";
};

export default function SearchPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(async () => {
      if (!q) {
        setUsers([]);
        return;
      }
      setLoading(true);
      const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ユーザー名や表示名で検索"
          className="w-full rounded-full border border-border bg-surface px-4 py-2 text-foreground placeholder:text-muted"
          autoFocus
        />
      </div>
      {loading && <p className="px-4 py-6 text-center text-muted">検索中...</p>}
      {!loading && query.trim() && users.length === 0 && (
        <p className="px-4 py-6 text-center text-muted">該当するユーザーが見つかりません。</p>
      )}
      {users.map((u) => (
        <div key={u.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <Link href={`/${u.username}`} className="flex min-w-0 items-center gap-3">
            <Avatar username={u.username} avatarUrl={u.avatarUrl} />
            <div className="min-w-0">
              <p className="truncate font-bold">{u.displayName}</p>
              <p className="truncate text-muted">@{u.username}</p>
            </div>
          </Link>
          {session?.user && session.user.username !== u.username && (
            <FollowButton username={u.username} initialStatus={u.followStatus} />
          )}
        </div>
      ))}
    </div>
  );
}
