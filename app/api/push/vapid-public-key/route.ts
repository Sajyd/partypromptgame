import { isWebPushConfigured, getVapidPublicKey } from "@/lib/push/config";

export async function GET() {
  if (!isWebPushConfigured()) {
    return Response.json({ error: "Push is not configured" }, { status: 503 });
  }
  const publicKey = getVapidPublicKey();
  return Response.json({ publicKey });
}
