import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const requests = await prisma.follow.findMany({
    where: { followingId: session.user.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      follower: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json({
    requests: requests.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      user: r.follower,
    })),
  });
}
