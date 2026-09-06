import Link from "next/link";
import type { TweetDTO } from "@/lib/tweets";
import { formatRelativeTime } from "@/lib/format";
import Avatar from "@/components/Avatar";
import LikeButton from "@/components/LikeButton";
import DeleteTweetButton from "@/components/DeleteTweetButton";

export default function TweetCard({
  tweet,
  currentUsername,
}: {
  tweet: TweetDTO;
  currentUsername?: string;
}) {
  return (
    <div className="relative border-b border-border transition hover:bg-surface/50">
      <Link
        href={`/tweet/${tweet.id}`}
        className="absolute inset-0 z-0"
        aria-label={`${tweet.author.displayName}の投稿を開く`}
      />
      <div className="relative z-10 flex gap-3 px-4 py-3">
        <Link href={`/${tweet.author.username}`} className="pointer-events-auto shrink-0">
          <Avatar username={tweet.author.username} avatarUrl={tweet.author.avatarUrl} />
        </Link>
        <div className="pointer-events-none min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1 text-sm">
            <Link
              href={`/${tweet.author.username}`}
              className="pointer-events-auto font-bold text-foreground hover:underline"
            >
              {tweet.author.displayName}
            </Link>
            <span className="text-muted">@{tweet.author.username}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">{formatRelativeTime(tweet.createdAt)}</span>
          </div>
          {tweet.replyToUsername && (
            <p className="text-sm text-muted">
              返信先: <span className="text-accent">@{tweet.replyToUsername}</span>
            </p>
          )}
          <p className="mt-0.5 whitespace-pre-wrap break-words text-foreground">{tweet.content}</p>
          <div className="pointer-events-auto mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{tweet.replyCount}</span>
            </div>
            <LikeButton tweetId={tweet.id} initialLiked={tweet.likedByMe} initialCount={tweet.likeCount} />
            {currentUsername === tweet.author.username && <DeleteTweetButton tweetId={tweet.id} />}
          </div>
        </div>
      </div>
    </div>
  );
}
