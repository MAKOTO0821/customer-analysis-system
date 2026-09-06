import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { tweetSchema } from "@/lib/validation";
import { serializeTweets, tweetWithRelations } from "@/lib/tweets";
import { canViewProfile, getRelationship } from "@/lib/relationship";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id, status: "ACCEPTED" },
    select: { followingId: true },
  });
  const authorIds = [session.user.id, ...following.map((f) => f.followingId)];

  const tweets = await prisma.tweet.findMany({
    where: { authorId: { in: authorIds } },
    orderBy: { createdAt: "desc" },
    take: 50,
    ...tweetWithRelations,
  });

  return NextResponse.json({ tweets: await serializeTweets(tweets, session.user.id) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = tweetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容が正しくありません" },
      { status: 400 }
    );
  }

  const { content, parentId } = parsed.data;

  if (parentId) {
    const parent = await prisma.tweet.findUnique({
      where: { id: parentId },
      select: { id: true, author: { select: { id: true, isPrivate: true } } },
    });
    if (!parent) {
      return NextResponse.json({ error: "返信先の投稿が見つかりません" }, { status: 404 });
    }
    const rel = await getRelationship(session.user.id, parent.author.id);
    if (rel.iBlocked || rel.blockedByThem) {
      return NextResponse.json({ error: "この投稿に返信できません" }, { status: 403 });
    }
    if (!canViewProfile(parent.author, rel)) {
      return NextResponse.json({ error: "この投稿に返信できません" }, { status: 403 });
    }
  }

  const tweet = await prisma.tweet.create({
    data: { content, authorId: session.user.id, parentId: parentId ?? null },
    ...tweetWithRelations,
  });

  return NextResponse.json({ tweet: await serializeTweets([tweet], session.user.id).then((t) => t[0]) }, { status: 201 });
}
