import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function loadTarget(username: string) {
  return prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
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
    return NextResponse.json({ error: "自分自身をブロックすることはできません" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: session.user.id, blockedId: target.id } },
      create: { blockerId: session.user.id, blockedId: target.id },
      update: {},
    }),
    prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: session.user.id, followingId: target.id },
          { followerId: target.id, followingId: session.user.id },
        ],
      },
    }),
  ]);

  return NextResponse.json({ blocked: true });
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

  await prisma.block.deleteMany({
    where: { blockerId: session.user.id, blockedId: target.id },
  });

  return NextResponse.json({ blocked: false });
}
