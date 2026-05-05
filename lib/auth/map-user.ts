import type { PlayStyle, SkillLevel, User } from "@/lib/types";
import type { users } from "@/lib/db/schema";

type UserRow = typeof users.$inferSelect;

export function rowToClientUser(row: UserRow): User {
  return {
    id: row.id,
    displayName: row.displayName,
    age: row.age,
    avatar: row.avatar,
    color: row.color,
    playStyle: row.playStyle as PlayStyle,
    skill: row.skill as SkillLevel,
    genres: row.genres,
    bio: row.bio ?? undefined,
    joinedAt: row.createdAt.getTime(),
    friendCode: row.friendCode,
    stats: row.stats,
    onboardingCompleted: row.onboardingCompleted,
    email: row.email,
  };
}
