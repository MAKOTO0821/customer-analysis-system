import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewProfile, getRelationship } from "@/lib/relationship";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await params;
  const tweet = await prisma.tweet.findUnique({
    where: { id },
    select: { id: true, author: { select: { id: true, isPrivate: true } } },
  });
  if (!tweet) {
    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
  }

  const rel = await getRelationship(session.user.id, tweet.author.id);
  if (rel.iBlocked || rel.blockedByThem || !canViewProfile(tweet.author, rel)) {
    return NextResponse.json({ error: "この投稿を閲覧できません" }, { status: 403 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_tweetId: { userId: session.user.id, tweetId: id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const likeCount = await prisma.like.count({ where: { tweetId: id } });
    return NextResponse.json({ liked: false, likeCount });
  }

  await prisma.like.create({ data: { userId: session.user.id, tweetId: id } });
  const likeCount = await prisma.like.count({ where: { tweetId: id } });
  return NextResponse.json({ liked: true, likeCount });
}
