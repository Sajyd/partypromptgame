import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRequestOrigin } from "@/lib/auth/app-url";
import {
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserInfo,
} from "@/lib/auth/google-oauth";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
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

export async function GET(req: Request) {
  const jar = await cookies();
  const savedState = jar.get(STATE_COOKIE)?.value;
  jar.set(STATE_COOKIE, "", { maxAge: 0, path: "/" });

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError || !code || !state || !savedState || state !== savedState) {
    redirect("/login?oauth=invalid");
  }

  const origin = getRequestOrigin(req);
  const redirectUri = `${origin}/api/auth/google/callback`;

  let accessToken: string;
  try {
    accessToken = await exchangeGoogleAuthorizationCode(code, redirectUri);
  } catch {
    redirect("/login?oauth=token");
  }

  let googleUser: Awaited<ReturnType<typeof fetchGoogleUserInfo>>;
  try {
    googleUser = await fetchGoogleUserInfo(accessToken);
  } catch {
    redirect("/login?oauth=profile");
  }

  const sub = googleUser.sub;
  const email = googleUser.email?.toLowerCase().trim();
  if (!email || googleUser.email_verified === false) {
    redirect("/login?oauth=email");
  }

  const db = getDb();

  const [byGoogle] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.googleId, sub))
    .limit(1);

  let userRow = byGoogle;

  if (!userRow) {
    const [byEmail] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (byEmail) {
      if (byEmail.googleId && byEmail.googleId !== sub) {
        redirect("/login?oauth=account_conflict");
      }
      const [linked] = await db
        .update(schema.users)
        .set({ googleId: sub, updatedAt: new Date() })
        .where(eq(schema.users.id, byEmail.id))
        .returning();
      userRow = linked;
    }
  }

  if (!userRow) {
    const friendCode = randomCodeSecure(8);
    const av = AVATARS[hashPick(sub, AVATARS.length)]!;
    const col = COLORS[hashPick(sub + "c", COLORS.length)]!;
    try {
      const [inserted] = await db
        .insert(schema.users)
        .values({
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
        })
        .returning();
      userRow = inserted;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("unique") || msg.includes("duplicate")) {
        redirect("/login?oauth=duplicate");
      }
      console.error(e);
      redirect("/login?oauth=server");
    }
  }

  if (!userRow) {
    redirect("/login?oauth=server");
  }

  const token = await createSessionToken(userRow.id);
  await setSessionCookie(token);

  if (userRow.onboardingCompleted) {
    redirect("/home");
  }
  redirect("/onboarding");
}
