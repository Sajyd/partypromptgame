import type { User as PrismaUser } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/auth/app-url";
import {
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserInfo,
} from "@/lib/auth/google-oauth";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { AVATARS, COLORS } from "@/lib/mock-data";
import { randomCodeSecure } from "@/lib/server/random-code";

const STATE_COOKIE = "google_oauth_state";

function hashPick(str: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

function displayNameFromGoogle(name: string | undefined, email: string): string {
  const fromEmail = email.split("@")[0] ?? "Player";
  const raw = (name?.trim() || fromEmail).slice(0, 18);
  return raw.length >= 2 ? raw : fromEmail.slice(0, 18);
}

function loginRedirect(origin: string, oauth: string) {
  const u = new URL("/login", origin);
  u.searchParams.set("oauth", oauth);
  return NextResponse.redirect(u);
}

export async function GET(req: Request) {
  const origin = getRequestOrigin(req);

  const jar = await cookies();
  const savedState = jar.get(STATE_COOKIE)?.value;
  jar.set(STATE_COOKIE, "", { maxAge: 0, path: "/" });

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError || !code || !state || !savedState || state !== savedState) {
    return loginRedirect(origin, "invalid");
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  let accessToken: string;
  try {
    accessToken = await exchangeGoogleAuthorizationCode(code, redirectUri);
  } catch (e: unknown) {
    console.error("[google/oauth/callback] token exchange failed:", e);
    return loginRedirect(origin, "token");
  }

  let googleUser: Awaited<ReturnType<typeof fetchGoogleUserInfo>>;
  try {
    googleUser = await fetchGoogleUserInfo(accessToken);
  } catch (e: unknown) {
    console.error("[google/oauth/callback] userinfo failed:", e);
    return loginRedirect(origin, "profile");
  }

  const sub = googleUser.sub;
  const email = googleUser.email?.toLowerCase().trim();
  if (!email || googleUser.email_verified === false) {
    return loginRedirect(origin, "email");
  }

  if (!process.env.AUTH_SECRET?.trim()) {
    console.error("[google/oauth/callback] AUTH_SECRET is not set");
    return loginRedirect(origin, "server");
  }

  let userRow: PrismaUser | undefined;

  try {
    const byGoogle = await prisma.user.findFirst({
      where: { googleId: sub },
    });
    userRow = byGoogle ?? undefined;

    if (!userRow) {
      const byEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (byEmail) {
        if (byEmail.googleId && byEmail.googleId !== sub) {
          return loginRedirect(origin, "account_conflict");
        }
        userRow = await prisma.user.update({
          where: { id: byEmail.id },
          data: { googleId: sub },
        });
      }
    }

    if (!userRow) {
      const friendCode = randomCodeSecure(8);
      const av = AVATARS[hashPick(sub, AVATARS.length)]!;
      const col = COLORS[hashPick(sub + "c", COLORS.length)]!;
      userRow = await prisma.user.create({
        data: {
          email,
          googleId: sub,
          passwordHash: null,
          displayName: displayNameFromGoogle(googleUser.name, email),
          age: 18,
          avatar: av,
          color: col,
          playStyle: "creative",
          skill: "casual",
          genres: [],
          friendCode,
          stats: {
            gamesCreated: 0,
            gamesPlayed: 0,
            contributions: 0,
            likes: 0,
          },
          onboardingCompleted: false,
        },
      });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    console.error("[google/oauth/callback] database error:", e);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return loginRedirect(origin, "duplicate");
    }
    return loginRedirect(origin, "server");
  }

  if (!userRow) {
    return loginRedirect(origin, "server");
  }

  try {
    const token = await createSessionToken(userRow.id);
    await setSessionCookie(token);
  } catch (e: unknown) {
    console.error("[google/oauth/callback] session cookie / JWT:", e);
    return loginRedirect(origin, "server");
  }

  if (userRow.onboardingCompleted) {
    return NextResponse.redirect(new URL("/home", origin));
  }
  return NextResponse.redirect(new URL("/onboarding", origin));
}
