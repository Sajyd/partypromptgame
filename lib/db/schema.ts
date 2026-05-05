import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { Genre } from "@/lib/types";

export type UserStatsRow = {
  gamesCreated: number;
  gamesPlayed: number;
  contributions: number;
  likes: number;
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 18 }).notNull(),
  age: integer("age").notNull(),
  avatar: varchar("avatar", { length: 8 }).notNull(),
  color: varchar("color", { length: 16 }).notNull(),
  playStyle: varchar("play_style", { length: 32 }).notNull(),
  skill: varchar("skill", { length: 32 }).notNull(),
  genres: jsonb("genres").$type<Genre[]>().notNull(),
  friendCode: varchar("friend_code", { length: 16 }).notNull(),
  stats: jsonb("stats").$type<UserStatsRow>().notNull(),
  bio: varchar("bio", { length: 280 }),
  onboardingCompleted: boolean("onboarding_completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
