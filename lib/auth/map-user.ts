import type { User as PrismaUser } from "@prisma/client";
import type { Genre, PlayStyle, SkillLevel, User } from "@/lib/types";

export function rowToClientUser(row: PrismaUser): User {
  return {
    id: row.id,
    displayName: row.displayName,
    age: row.age,
    avatar: row.avatar,
    color: row.color,
    playStyle: row.playStyle as PlayStyle,
    skill: row.skill as SkillLevel,
    genres: row.genres as Genre[],
    bio: row.bio ?? undefined,
    joinedAt: row.createdAt.getTime(),
    friendCode: row.friendCode,
    stats: row.stats as User["stats"],
    onboardingCompleted: row.onboardingCompleted,
    email: row.email,
  };
}
