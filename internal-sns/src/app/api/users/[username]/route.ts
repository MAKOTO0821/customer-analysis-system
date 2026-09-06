import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewProfile, getRelationship } from "@/lib/relationship";

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
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      isPrivate: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const rel = await getRelationship(session.user.id, user.id);

  const [followerCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id, status: "ACCEPTED" } }),
    prisma.follow.count({ where: { followerId: user.id, status: "ACCEPTED" } }),
  ]);

  const canView = canViewProfile(user, rel);
  const tweetCount = canView
    ? await prisma.tweet.count({ where: { authorId: user.id } })
    : 0;

  // 非公開アカウントの非フォロワーやブロック関係にある相手には、
  // プロフィールカードとして最低限必要な情報（名前・アイコン等）のみを返し、
  // 自己紹介文や登録日時といった詳細情報は canView が true の場合のみ返す。
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      bio: canView ? user.bio : "",
      createdAt: canView ? user.createdAt.toISOString() : null,
    },
    relationship: rel,
    canView,
    stats: { followerCount, followingCount, tweetCount },
  });
}
