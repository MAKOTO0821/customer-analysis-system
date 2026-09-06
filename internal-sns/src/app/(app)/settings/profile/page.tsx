import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileEditForm from "@/components/ProfileEditForm";

export default async function SettingsProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <div>
      <h1 className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 text-xl font-bold backdrop-blur">
        プロフィール編集
      </h1>
      <ProfileEditForm
        initial={{
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          isPrivate: user.isPrivate,
          username: user.username,
        }}
      />
    </div>
  );
}
