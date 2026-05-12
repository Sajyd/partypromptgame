"use client";

import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = globalThis.atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    out[i] = rawData.charCodeAt(i);
  }
  return out;
}

type PushState = "idle" | "unsupported" | "off" | "prompting" | "subscribed" | "denied" | "unconfigured";

export function NotificationPushButton() {
  const [state, setState] = useState<PushState>("idle");
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (cancelled) return;
        if (sub) {
          setState("subscribed");
          return;
        }
        setState("off");
      } catch {
        if (!cancelled) setState("off");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(async () => {
    setHint(null);
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    setState("prompting");
    try {
      await navigator.serviceWorker.register("/sw.js");
      const reg = await navigator.serviceWorker.ready;
      const keyRes = await fetch("/api/push/vapid-public-key");
      if (!keyRes.ok) {
        setState("unconfigured");
        setHint("Push is not set up on the server yet.");
        return;
      }
      const { publicKey } = (await keyRes.json()) as { publicKey?: string };
      if (!publicKey) {
        setState("unconfigured");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState("denied");
        setHint("Notifications are blocked. You can enable them in browser settings.");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setState("off");
        setHint("Could not read subscription keys.");
        return;
      }
      const save = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        }),
      });
      if (!save.ok) {
        setState("off");
        setHint("Could not save subscription.");
        return;
      }
      setState("subscribed");
    } catch {
      setState("off");
      setHint("Something went wrong. Try again.");
    }
  }, []);

  const busy = state === "prompting";
  const subscribed = state === "subscribed";
  const disabled = state === "unsupported" || state === "unconfigured";

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || busy || subscribed}
        onClick={() => void enable()}
        className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center relative disabled:opacity-50 disabled:pointer-events-none"
        aria-label={
          subscribed
            ? "Notifications enabled"
            : disabled
              ? "Notifications unavailable"
              : "Enable notifications"
        }
        title={
          subscribed
            ? "Browser notifications are on"
            : hint ?? "Get notified when something needs your attention"
        }
      >
        <Bell className="size-5" />
        {!subscribed ? (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-[var(--primary)]" />
        ) : null}
      </button>
      {hint && !subscribed ? (
        <span className="absolute right-0 top-full mt-1 z-10 max-w-[220px] rounded-xl border border-white/10 bg-[#0b0716]/95 px-2 py-1.5 text-[10px] text-text-soft text-left shadow-lg">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
