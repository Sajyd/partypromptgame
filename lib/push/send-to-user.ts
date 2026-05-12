import webpush from "web-push";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { configureWebPushForSend, isWebPushConfigured } from "@/lib/push/config";

export type PushPayload = { title: string; body: string };

/** Send a web push to every registered device for this user. No-op if VAPID is not configured. */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!isWebPushConfigured()) return;
  configureWebPushForSend();
  const subs = await getDb()
    .select()
    .from(schema.pushSubscriptions)
    .where(eq(schema.pushSubscriptions.userId, userId));

  const data = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          data,
        );
      } catch (e: unknown) {
        const status =
          e && typeof e === "object" && "statusCode" in e
            ? (e as { statusCode?: number }).statusCode
            : undefined;
        if (status === 410 || status === 404) {
          await getDb()
            .delete(schema.pushSubscriptions)
            .where(eq(schema.pushSubscriptions.endpoint, s.endpoint));
        }
      }
    }),
  );
}
