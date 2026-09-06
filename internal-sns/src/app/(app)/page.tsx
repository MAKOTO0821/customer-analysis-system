import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeTweets, tweetWithRelations } from "@/lib/tweets";
import TweetComposer from "@/components/TweetComposer";
import TweetCard from "@/components/TweetCard";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const following = await prisma.follow.findMany({
    where: { followerId: userId, status: "ACCEPTED" },
    select: { followingId: true },
  });
  const authorIds = [userId, ...following.map((f) => f.followingId)];

  const tweets = await prisma.tweet.findMany({
    where: { authorId: { in: authorIds } },
    orderBy: { createdAt: "desc" },
    take: 50,
    ...tweetWithRelations,
  });
  const tweetDtos = await serializeTweets(tweets, userId);

  return (
    <div>
      <h1 className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 text-xl font-bold backdrop-blur">
        ホーム
      </h1>
      <TweetComposer username={session.user.username} />
      {tweetDtos.length === 0 ? (
        <p className="px-4 py-10 text-center text-muted">
          まだ投稿がありません。ユーザーをフォローするとここにタイムラインが表示されます。
        </p>
      ) : (
        tweetDtos.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} currentUsername={session.user.username} />
        ))
      )}
    </div>
  );
}
