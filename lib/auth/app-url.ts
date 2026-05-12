/** Origin for OAuth redirect_uri and absolute URLs. Prefer NEXT_PUBLIC_APP_URL in production. */
export function getRequestOrigin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  return new URL(req.url).origin;
}
