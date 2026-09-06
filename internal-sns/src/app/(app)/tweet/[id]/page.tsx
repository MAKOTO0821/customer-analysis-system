import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewProfile, getRelationship } from "@/lib/relationship";
import { serializeTweet, serializeTweets, tweetWithRelations } from "@/lib/tweets";
import { formatRelativeTime } from "@/lib/format";
import Avatar from "@/components/Avatar";
import LikeButton from "@/components/LikeButton";
import DeleteTweetButton from "@/components/DeleteTweetButton";
import TweetComposer from "@/components/TweetComposer";
import TweetCard from "@/components/TweetCard";

export default async function TweetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const tweet = await prisma.tweet.findUnique({ where: { id }, ...tweetWithRelations });
  if (!tweet) notFound();

  const rel = await getRelationship(session?.user?.id, tweet.author.id);
  const blocked = rel.iBlocked || rel.blockedByThem;
  const canView = !blocked && canViewProfile(tweet.author, rel);

  const dto = await serializeTweet(tweet, session?.user?.id);

  const replies = canView
    ? await serializeTweets(
        await prisma.tweet.findMany({
          where: { parentId: id },
          orderBy: { createdAt: "asc" },
          ...tweetWithRelations,
        }),
        session?.user?.id
      )
    : [];

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <Link href="/" className="rounded-full p-2 hover:bg-surface">
          ←
        </Link>
        <h1 className="text-xl font-bold">投稿</h1>
      </div>

      {!canView ? (
        <p className="px-4 py-10 text-center text-muted">この投稿を閲覧できません。</p>
      ) : (
        <>
          <div className="border-b border-border px-4 py-3">
            {dto.replyToUsername && (
              <p className="mb-1 text-sm text-muted">
                返信先: <span className="text-accent">@{dto.replyToUsername}</span>
              </p>
            )}
            <div className="flex items-center gap-3">
              <Link href={`/${dto.author.username}`}>
                <Avatar username={dto.author.username} avatarUrl={dto.author.avatarUrl} size={48} />
              </Link>
              <div>
                <Link href={`/${dto.author.username}`} className="block font-bold hover:underline">
                  {dto.author.displayName}
                </Link>
                <span className="text-muted">@{dto.author.username}</span>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-xl">{dto.content}</p>
            <p className="mt-3 text-sm text-muted">{formatRelativeTime(dto.createdAt)}</p>
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <div className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{dto.replyCount}</span>
              </div>
              <LikeButton tweetId={dto.id} initialLiked={dto.likedByMe} initialCount={dto.likeCount} />
              {session?.user?.username === dto.author.username && <DeleteTweetButton tweetId={dto.id} />}
            </div>
          </div>

          {session?.user && (
            <TweetComposer
              username={session.user.username}
              parentId={dto.id}
              placeholder={`@${dto.author.username} に返信`}
            />
          )}

          {replies.map((reply) => (
            <TweetCard key={reply.id} tweet={reply} currentUsername={session?.user?.username} />
          ))}
        </>
      )}
    </div>
  );
}
