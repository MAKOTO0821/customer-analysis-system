import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

const navItemClass =
  "flex items-center gap-4 rounded-full px-4 py-3 text-lg transition hover:bg-surface";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.64 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.64a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.36 9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.06Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function Sidebar({ username }: { username: string }) {
  const pendingCount = await prisma.follow.count({
    where: { following: { username }, status: "PENDING" },
  });

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col justify-between py-2 xl:w-64">
      <div>
        <Link
          href="/"
          className="mb-2 flex items-center justify-center rounded-full p-3 text-2xl font-bold text-accent hover:bg-surface xl:justify-start"
        >
          <span className="xl:hidden">C</span>
          <span className="hidden xl:inline">Connect</span>
        </Link>
        <nav className="flex flex-col gap-1">
          <Link href="/" className={navItemClass}>
            <HomeIcon />
            <span className="hidden xl:inline">ホーム</span>
          </Link>
          <Link href="/search" className={navItemClass}>
            <SearchIcon />
            <span className="hidden xl:inline">検索</span>
          </Link>
          <Link href="/follow-requests" className={`${navItemClass} relative`}>
            <BellIcon />
            <span className="hidden xl:inline">フォローリクエスト</span>
            {pendingCount > 0 && (
              <span className="absolute left-7 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-white xl:static xl:ml-auto">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link href={`/${username}`} className={navItemClass}>
            <UserIcon />
            <span className="hidden xl:inline">プロフィール</span>
          </Link>
          <Link href="/settings/profile" className={navItemClass}>
            <SettingsIcon />
            <span className="hidden xl:inline">設定</span>
          </Link>
        </nav>
      </div>
      <LogoutButton />
    </aside>
  );
}
