import webpush from "web-push";

function vapidSubject(): string {
  return process.env.VAPID_SUBJECT ?? "mailto:notify@localhost";
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY?.trim() || null;
}

export function isWebPushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY?.trim() && process.env.VAPID_PRIVATE_KEY?.trim());
}

/** Call before sendNotification; safe to call multiple times. */
export function configureWebPushForSend(): void {
  const pub = process.env.VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!pub || !priv) {
    throw new Error("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set to send push");
  }
  webpush.setVapidDetails(vapidSubject(), pub, priv);
}
