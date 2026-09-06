import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const tweetWithRelations = Prisma.validator<Prisma.TweetDefaultArgs>()({
  include: {
    author: {
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isPrivate: true,
      },
    },
    parent: {
      select: {
        id: true,
        author: { select: { username: true } },
      },
    },
    _count: { select: { replies: true, likes: true } },
  },
});

export type TweetWithRelations = Prisma.TweetGetPayload<typeof tweetWithRelations>;

export type TweetDTO = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    isPrivate: boolean;
  };
  replyCount: number;
  likeCount: number;
  likedByMe: boolean;
  replyToUsername: string | null;
};

export async function serializeTweet(
  tweet: TweetWithRelations,
  viewerId: string | null | undefined
): Promise<TweetDTO> {
  let likedByMe = false;
  if (viewerId) {
    const like = await prisma.like.findUnique({
      where: { userId_tweetId: { userId: viewerId, tweetId: tweet.id } },
    });
    likedByMe = !!like;
  }

  return {
    id: tweet.id,
    content: tweet.content,
    createdAt: tweet.createdAt.toISOString(),
    author: tweet.author,
    replyCount: tweet._count.replies,
    likeCount: tweet._count.likes,
    likedByMe,
    replyToUsername: tweet.parent?.author.username ?? null,
  };
}

export async function serializeTweets(
  tweets: TweetWithRelations[],
  viewerId: string | null | undefined
): Promise<TweetDTO[]> {
  if (!viewerId) {
    return tweets.map((t) => ({
      id: t.id,
      content: t.content,
      createdAt: t.createdAt.toISOString(),
      author: t.author,
      replyCount: t._count.replies,
      likeCount: t._count.likes,
      likedByMe: false,
      replyToUsername: t.parent?.author.username ?? null,
    }));
  }

  const likes = await prisma.like.findMany({
    where: { userId: viewerId, tweetId: { in: tweets.map((t) => t.id) } },
    select: { tweetId: true },
  });
  const likedSet = new Set(likes.map((l) => l.tweetId));

  return tweets.map((t) => ({
    id: t.id,
    content: t.content,
    createdAt: t.createdAt.toISOString(),
    author: t.author,
    replyCount: t._count.replies,
    likeCount: t._count.likes,
    likedByMe: likedSet.has(t.id),
    replyToUsername: t.parent?.author.username ?? null,
  }));
}
