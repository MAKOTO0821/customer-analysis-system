import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRelationship } from "@/lib/relationship";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [{ username: { contains: q } }, { displayName: { contains: q } }],
      NOT: { id: session.user.id },
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isPrivate: true,
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  const results = await Promise.all(
    users.map(async (u) => {
      const rel = await getRelationship(session.user.id, u.id);
      if (rel.iBlocked || rel.blockedByThem) return null;
      const status = rel.isFollowing ? "ACCEPTED" : rel.isPending ? "PENDING" : "NONE";
      return { ...u, followStatus: status };
    })
  );

  return NextResponse.json({ users: results.filter((u) => u !== null) });
}
