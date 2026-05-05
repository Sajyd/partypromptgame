import { z } from "zod";
import { GENRES } from "@/lib/mock-data";
import type { Genre } from "@/lib/types";

const genreEnum = z.enum(GENRES as unknown as [Genre, ...Genre[]]);

export const signupSchema = z.object({
  email: z.string().email().max(255).trim(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(18).trim(),
});

export const loginSchema = z.object({
  email: z.string().email().max(255).trim(),
  password: z.string().min(1).max(128),
});

export const onboardingProfileSchema = z.object({
  displayName: z.string().min(2).max(18).trim(),
  age: z.number().int().min(6).max(99),
  avatar: z.string().min(1).max(8),
  color: z.string().min(1).max(16),
  playStyle: z.enum(["creative", "chaotic", "strategic", "social"]),
  skill: z.enum(["casual", "regular", "competitive"]),
  genres: z.array(genreEnum).min(1).max(GENRES.length),
  onboardingCompleted: z.literal(true),
});

export const patchProfileSchema = z.object({
  displayName: z.string().min(2).max(18).trim().optional(),
  bio: z.string().max(280).optional(),
  avatar: z.string().min(1).max(8).optional(),
  color: z.string().min(1).max(16).optional(),
  genres: z.array(genreEnum).min(1).max(GENRES.length).optional(),
});
