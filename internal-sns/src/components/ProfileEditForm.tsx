"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileEditForm({
  initial,
}: {
  initial: { displayName: string; bio: string; avatarUrl: string; isPrivate: boolean; username: string };
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [isPrivate, setIsPrivate] = useState(initial.isPrivate);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, avatarUrl, isPrivate }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "更新に失敗しました");
      return;
    }
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-4 py-4">
      {error && <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {saved && <p className="rounded bg-accent/10 px-3 py-2 text-sm text-accent">保存しました</p>}

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">表示名</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          required
          className="rounded border border-border bg-transparent px-3 py-2 text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">自己紹介</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          rows={3}
          className="resize-none rounded border border-border bg-transparent px-3 py-2 text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">アイコン画像URL</span>
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="rounded border border-border bg-transparent px-3 py-2 text-foreground placeholder:text-muted"
        />
      </label>

      <label className="flex items-center justify-between rounded border border-border px-3 py-3">
        <span>
          <span className="block font-bold">鍵アカウント（非公開）</span>
          <span className="block text-sm text-muted">
            オンにすると、承認したフォロワーだけが投稿を閲覧できます
          </span>
        </span>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="h-5 w-5 accent-accent"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-full bg-accent px-5 py-2 font-bold text-white transition hover:bg-accent-hover disabled:opacity-50"
      >
        保存
      </button>
    </form>
  );
}
