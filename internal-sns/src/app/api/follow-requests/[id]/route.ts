import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action;
  if (action !== "accept" && action !== "reject") {
    return NextResponse.json({ error: "action は accept か reject を指定してください" }, { status: 400 });
  }

  const followRequest = await prisma.follow.findUnique({ where: { id } });
  if (!followRequest || followRequest.followingId !== session.user.id) {
    return NextResponse.json({ error: "リクエストが見つかりません" }, { status: 404 });
  }

  if (action === "accept") {
    await prisma.follow.update({ where: { id }, data: { status: "ACCEPTED" } });
  } else {
    await prisma.follow.delete({ where: { id } });
  }

  return NextResponse.json({ ok: true });
}
