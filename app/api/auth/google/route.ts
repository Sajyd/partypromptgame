import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRequestOrigin } from "@/lib/auth/app-url";
import { buildGoogleAuthorizeUrl, getGoogleClientCredentials } from "@/lib/auth/google-oauth";
import { randomCodeSecure } from "@/lib/server/random-code";

const STATE_COOKIE = "google_oauth_state";

export async function GET(req: Request) {
  try {
    getGoogleClientCredentials();
  } catch {
    redirect("/login?oauth=missing_config");
  }

  const origin = getRequestOrigin(req);
  const state = randomCodeSecure(32);
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const redirectUri = `${origin}/api/auth/google/callback`;
  const url = buildGoogleAuthorizeUrl({ redirectUri, state });
  redirect(url);
}
