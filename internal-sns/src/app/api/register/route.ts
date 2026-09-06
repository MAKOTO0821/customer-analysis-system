import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容が正しくありません" },
      { status: 400 }
    );
  }

  const { username, email, password, displayName } = parsed.data;
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: normalizedUsername }, { email: normalizedEmail }] },
  });
  if (existing) {
    const field = existing.username === normalizedUsername ? "ユーザー名" : "メールアドレス";
    return NextResponse.json({ error: `この${field}は既に使用されています` }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      displayName,
    },
    select: { id: true, username: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
