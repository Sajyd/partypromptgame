"use client";

import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthGateMode = "app" | "onboarding";

export function AuthGate({
  children,
  mode = "app",
}: {
  children: React.ReactNode;
  mode?: AuthGateMode;
}) {
  const setUser = useApp((s) => s.setUser);
  const signOut = useApp((s) => s.signOut);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = (await res.json()) as {
          user: import("@/lib/types").User | null;
        };
        if (cancelled) return;

        if (!data.user) {
          signOut();
          router.replace("/login");
          setReady(true);
          return;
        }

        setUser(data.user);

        if (mode === "app" && !data.user.onboardingCompleted) {
          router.replace("/onboarding");
          setReady(true);
          return;
        }

        if (mode === "onboarding" && data.user.onboardingCompleted) {
          router.replace("/home");
          setReady(true);
          return;
        }

        setReady(true);
      } catch {
        if (!cancelled) {
          signOut();
          router.replace("/login");
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, mode, router, setUser, signOut]);

  if (!hydrated || !ready) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="size-10 rounded-full border-4 border-white/10 border-t-[var(--primary)] animate-spin" />
      </div>
    );
  }

  const user = useApp.getState().user;
  if (!user) return null;
  if (mode === "app" && !user.onboardingCompleted) return null;
  if (mode === "onboarding" && user.onboardingCompleted) return null;

  return <>{children}</>;
}
