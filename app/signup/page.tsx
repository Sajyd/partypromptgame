"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FormLabel } from "@/components/ui/Input";
import { useApp } from "@/lib/store";
import { APP_NAME } from "@/lib/brand";

export default function SignupPage() {
  const router = useRouter();
  const setUser = useApp((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not sign up");
        setLoading(false);
        return;
      }
      setUser(data.user);
      router.replace("/onboarding");
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh">
      <div className="blob -top-32 -left-20 w-72 h-72 bg-[var(--primary)]" />
      <div className="blob -top-10 right-0 w-72 h-72 bg-[var(--violet)]" />

      <div className="mx-auto w-full max-w-[480px] px-5 pt-6 pb-10 relative">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="inline-flex items-center gap-2 font-display font-bold text-lg">
            <span className="grid place-items-center w-9 h-9 rounded-2xl [background:var(--grad-hero)] text-black">
              <Sparkles className="size-5" />
            </span>
            <span>{APP_NAME}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10"
        >
          <h1 className="font-display text-3xl font-bold">Create account</h1>
          <p className="mt-2 text-text-soft">
            Pick a display name and secure password. You will customize your profile next.
          </p>
        </motion.div>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <FormLabel>Display name</FormLabel>
            <Input
              autoComplete="nickname"
              maxLength={18}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How friends see you"
              className="h-14"
              required
            />
          </div>
          <div>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-14"
              required
            />
          </div>
          <div>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-14"
              minLength={8}
              required
            />
          </div>
          {error ? (
            <div className="rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}
          <Button type="submit" full size="xl" loading={loading}>
            Continue <ArrowRight className="size-5" />
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
