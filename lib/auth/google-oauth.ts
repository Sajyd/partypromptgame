const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://openidconnect.googleapis.com/v1/userinfo";

export function getGoogleClientCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  }
  return { clientId, clientSecret };
}

export function buildGoogleAuthorizeUrl(opts: { redirectUri: string; state: string }): string {
  const { clientId } = getGoogleClientCredentials();
  const u = new URL(GOOGLE_AUTH);
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", opts.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "openid email profile");
  u.searchParams.set("state", opts.state);
  u.searchParams.set("prompt", "select_account");
  return u.toString();
}

export async function exchangeGoogleAuthorizationCode(
  code: string,
  redirectUri: string,
): Promise<string> {
  const { clientId, clientSecret } = getGoogleClientCredentials();
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Google token exchange failed", res.status, text);
    throw new Error("google_token_failed");
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("google_token_missing");
  return data.access_token;
}

export type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Google userinfo failed", res.status, text);
    throw new Error("google_userinfo_failed");
  }
  return (await res.json()) as GoogleUserInfo;
}
