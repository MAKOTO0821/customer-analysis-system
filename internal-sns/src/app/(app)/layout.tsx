import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/Sidebar";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-6xl justify-center">
      <Sidebar username={session.user.username} />
      <main className="min-h-screen w-full max-w-2xl border-x border-border">{children}</main>
      <div className="hidden w-80 shrink-0 lg:block" />
    </div>
  );
}
