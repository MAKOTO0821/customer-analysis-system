import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRelationship } from "@/lib/relationship";

async function loadTarget(username: string) {
  return prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, isPrivate: true },
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { username } = await params;
  const target = await loadTarget(username);
  if (!target) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }
  if (target.id === session.user.id) {
    return NextResponse.json({ error: "自分自身をフォローすることはできません" }, { status: 400 });
  }

  const rel = await getRelationship(session.user.id, target.id);
  if (rel.iBlocked || rel.blockedByThem) {
    return NextResponse.json({ error: "ブロック関係のためフォローできません" }, { status: 403 });
  }
  if (rel.isFollowing || rel.isPending) {
    return NextResponse.json({ status: rel.isPending ? "PENDING" : "ACCEPTED" });
  }

  const status = target.isPrivate ? "PENDING" : "ACCEPTED";
  await prisma.follow.create({
    data: { followerId: session.user.id, followingId: target.id, status },
  });

  return NextResponse.json({ status });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { username } = await params;
  const target = await loadTarget(username);
  if (!target) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  await prisma.follow.deleteMany({
    where: { followerId: session.user.id, followingId: target.id },
  });

  return NextResponse.json({ status: "NONE" });
}
