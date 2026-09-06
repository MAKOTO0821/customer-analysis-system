import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewProfile, getRelationship } from "@/lib/relationship";
import { serializeTweets, tweetWithRelations } from "@/lib/tweets";
import Avatar from "@/components/Avatar";
import FollowButton from "@/components/FollowButton";
import BlockButton from "@/components/BlockButton";
import TweetCard from "@/components/TweetCard";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });
  if (!user) notFound();

  const rel = await getRelationship(session?.user?.id, user.id);
  const canView = canViewProfile(user, rel);

  const [followerCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id, status: "ACCEPTED" } }),
    prisma.follow.count({ where: { followerId: user.id, status: "ACCEPTED" } }),
  ]);

  const tweets = canView
    ? await serializeTweets(
        await prisma.tweet.findMany({
          where: { authorId: user.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          ...tweetWithRelations,
        }),
        session?.user?.id
      )
    : [];

  const status: "ACCEPTED" | "PENDING" | "NONE" = rel.isFollowing
    ? "ACCEPTED"
    : rel.isPending
      ? "PENDING"
      : "NONE";

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <Link href="/" className="rounded-full p-2 hover:bg-surface">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold">{user.displayName}</h1>
          <p className="text-sm text-muted">{tweets.length}件の投稿</p>
        </div>
      </div>

      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between">
          <Avatar username={user.username} avatarUrl={user.avatarUrl} size={80} />
          {rel.isSelf ? (
            <Link
              href="/settings/profile"
              className="rounded-full border border-border px-4 py-1.5 font-bold transition hover:bg-surface"
            >
              プロフィールを編集
            </Link>
          ) : rel.blockedByThem ? null : (
            <div className="flex items-center gap-2">
              <BlockButton username={user.username} initialBlocked={rel.iBlocked} />
              {!rel.iBlocked && <FollowButton username={user.username} initialStatus={status} />}
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1">
            <h2 className="text-xl font-bold">{user.displayName}</h2>
            {user.isPrivate && (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <p className="text-muted">@{user.username}</p>
        </div>

        {(rel.isSelf || canView) && user.bio && <p className="mt-3 whitespace-pre-wrap">{user.bio}</p>}

        <div className="mt-3 flex gap-4 text-sm">
          <span>
            <span className="font-bold text-foreground">{followingCount}</span>{" "}
            <span className="text-muted">フォロー中</span>
          </span>
          <span>
            <span className="font-bold text-foreground">{followerCount}</span>{" "}
            <span className="text-muted">フォロワー</span>
          </span>
        </div>
      </div>

      {rel.blockedByThem ? (
        <p className="px-4 py-10 text-center text-muted">このユーザーはあなたをブロックしています。</p>
      ) : rel.iBlocked ? (
        <p className="px-4 py-10 text-center text-muted">このユーザーをブロックしています。</p>
      ) : !canView ? (
        <div className="flex flex-col items-center gap-2 px-4 py-16 text-center text-muted">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
          </svg>
          <p className="font-bold text-foreground">このアカウントは非公開です</p>
          <p>フォローが承認されると投稿が表示されます。</p>
        </div>
      ) : tweets.length === 0 ? (
        <p className="px-4 py-10 text-center text-muted">まだ投稿がありません。</p>
      ) : (
        tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} currentUsername={session?.user?.username} />
        ))
      )}
    </div>
  );
}
