import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import FollowRequestActions from "@/components/FollowRequestActions";

export default async function FollowRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const requests = await prisma.follow.findMany({
    where: { followingId: session.user.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      follower: { select: { username: true, displayName: true, avatarUrl: true } },
    },
  });

  return (
    <div>
      <h1 className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 text-xl font-bold backdrop-blur">
        フォローリクエスト
      </h1>
      {requests.length === 0 ? (
        <p className="px-4 py-10 text-center text-muted">保留中のフォローリクエストはありません。</p>
      ) : (
        requests.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <Link href={`/${r.follower.username}`} className="flex min-w-0 items-center gap-3">
              <Avatar username={r.follower.username} avatarUrl={r.follower.avatarUrl} />
              <div className="min-w-0">
                <p className="truncate font-bold">{r.follower.displayName}</p>
                <p className="truncate text-muted">@{r.follower.username}</p>
              </div>
            </Link>
            <FollowRequestActions requestId={r.id} />
          </div>
        ))
      )}
    </div>
  );
}
