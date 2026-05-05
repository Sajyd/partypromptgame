"use client";

import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const user = useApp((s) => s.user);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/onboarding");
    }
  }, [hydrated, user, router]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="size-10 rounded-full border-4 border-white/10 border-t-[var(--primary)] animate-spin" />
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}
