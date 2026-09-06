import { prisma } from "@/lib/prisma";

export type Relationship = {
  isSelf: boolean;
  isFollowing: boolean; // viewer -> target, accepted
  isPending: boolean; // viewer -> target, pending request
  isFollowedBy: boolean; // target -> viewer, accepted
  iBlocked: boolean; // viewer blocked target
  blockedByThem: boolean; // target blocked viewer
};

export async function getRelationship(
  viewerId: string | null | undefined,
  targetUserId: string
): Promise<Relationship> {
  if (!viewerId) {
    return {
      isSelf: false,
      isFollowing: false,
      isPending: false,
      isFollowedBy: false,
      iBlocked: false,
      blockedByThem: false,
    };
  }

  if (viewerId === targetUserId) {
    return {
      isSelf: true,
      isFollowing: false,
      isPending: false,
      isFollowedBy: false,
      iBlocked: false,
      blockedByThem: false,
    };
  }

  const [followingRow, followedByRow, iBlockedRow, blockedByThemRow] =
    await Promise.all([
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewerId, followingId: targetUserId } },
      }),
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: targetUserId, followingId: viewerId } },
      }),
      prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: viewerId, blockedId: targetUserId } },
      }),
      prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: targetUserId, blockedId: viewerId } },
      }),
    ]);

  return {
    isSelf: false,
    isFollowing: followingRow?.status === "ACCEPTED",
    isPending: followingRow?.status === "PENDING",
    isFollowedBy: followedByRow?.status === "ACCEPTED",
    iBlocked: !!iBlockedRow,
    blockedByThem: !!blockedByThemRow,
  };
}

export function canViewProfile(
  target: { isPrivate: boolean },
  rel: Relationship
): boolean {
  if (rel.isSelf) return true;
  if (rel.iBlocked || rel.blockedByThem) return false;
  if (!target.isPrivate) return true;
  return rel.isFollowing;
}
