import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewProfile, getRelationship } from "@/lib/relationship";
import { serializeTweets, tweetWithRelations } from "@/lib/tweets";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, isPrivate: true },
  });
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const rel = await getRelationship(session.user.id, user.id);
  if (!canViewProfile(user, rel)) {
    return NextResponse.json({ error: "このユーザーの投稿を閲覧できません" }, { status: 403 });
  }

  const tweets = await prisma.tweet.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    ...tweetWithRelations,
  });

  return NextResponse.json({ tweets: await serializeTweets(tweets, session.user.id) });
}
