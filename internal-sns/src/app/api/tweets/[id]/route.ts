import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewProfile, getRelationship } from "@/lib/relationship";
import { serializeTweet, serializeTweets, tweetWithRelations } from "@/lib/tweets";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await params;

  const tweet = await prisma.tweet.findUnique({ where: { id }, ...tweetWithRelations });
  if (!tweet) {
    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
  }

  const rel = await getRelationship(session.user.id, tweet.author.id);
  if (rel.iBlocked || rel.blockedByThem || !canViewProfile(tweet.author, rel)) {
    return NextResponse.json({ error: "この投稿を閲覧できません" }, { status: 403 });
  }

  const replies = await prisma.tweet.findMany({
    where: { parentId: id },
    orderBy: { createdAt: "asc" },
    ...tweetWithRelations,
  });

  return NextResponse.json({
    tweet: await serializeTweet(tweet, session.user.id),
    replies: await serializeTweets(replies, session.user.id),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await params;
  const tweet = await prisma.tweet.findUnique({ where: { id }, select: { authorId: true } });
  if (!tweet) {
    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
  }
  if (tweet.authorId !== session.user.id) {
    return NextResponse.json({ error: "この投稿を削除する権限がありません" }, { status: 403 });
  }

  await prisma.tweet.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
