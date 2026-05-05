"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil, Copy, Check, LogOut, Heart, Trophy, Sparkles, Settings,
  ShieldCheck, Bell, Volume2, ChevronRight, Compass, Gamepad2,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { AppHeader } from "@/components/ui/AppHeader";
import { BottomNav } from "@/components/ui/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/lib/store";
import { GameCard } from "@/components/game/GameCard";
import { AVATARS, COLORS, GENRES } from "@/lib/mock-data";
import type { Genre } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  return (
    <AuthGate>
      <Inner />
    </AuthGate>
  );
}

function Inner() {
  const router = useRouter();
  const user = useApp((s) => s.user)!;
  const games = useApp((s) => s.games);
  const favorites = useApp((s) => s.favorites);
  const patchUser = useApp((s) => s.patchUser);
  const signOut = useApp((s) => s.signOut);

  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const myFavs = games.filter((g) => favorites.includes(g.id));
  // For prototype: pretend you're a creator on games where any creator name matches yours
  const myMaybeGames = games.filter((g) =>
    g.creators.some((c) => c.id === "self" || c.name.toLowerCase() === user.displayName.toLowerCase()),
  );

  const onCopy = () => {
    navigator.clipboard?.writeText(user.friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const onLogout = () => {
    if (confirm("Sign out and clear local data?")) {
      signOut();
      router.replace("/");
    }
  };

  return (
    <main className="min-h-dvh">
      <AppHeader title="Profile" right={
        <button
          onClick={() => setEditing((v) => !v)}
          className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10"
          aria-label="Edit"
        >
          <Pencil className="size-4" />
        </button>
      }/>

      <div className="mx-auto w-full max-w-[480px] px-5 py-4 pb-bottom-nav space-y-5">
        {/* Identity */}
        <div className="rounded-3xl p-5 border border-white/10 [background:var(--grad-cool)] text-black relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/30 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <Avatar emoji={user.avatar} color={user.color} size={72} ring />
            <div className="min-w-0 flex-1">
              <div className="font-display text-2xl font-bold leading-tight truncate">
                {user.displayName}
              </div>
              <div className="text-sm opacity-80">
                {user.playStyle} · {user.skill} · {user.age} years old
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.genres.slice(0, 3).map((g) => (
                  <span key={g} className="text-[11px] font-bold uppercase tracking-wide bg-black/15 rounded-full px-2 py-0.5">
                    {g}
                  </span>
                ))}
                {user.genres.length > 3 ? (
                  <span className="text-[11px] font-bold uppercase tracking-wide bg-black/15 rounded-full px-2 py-0.5">
                    +{user.genres.length - 3}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Friend code */}
        <button
          onClick={onCopy}
          className="w-full rounded-2xl border border-border-soft bg-surface/60 p-4 flex items-center gap-3"
        >
          <div className="size-10 rounded-2xl bg-white/5 border border-white/10 grid place-items-center">
            <Sparkles className="size-5 text-[var(--cyan)]" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs text-text-muted">Friend code</div>
            <div className="font-mono font-bold tracking-[0.3em]">{user.friendCode}</div>
          </div>
          {copied ? <Check className="size-5 text-[var(--lime)]" /> : <Copy className="size-5 text-text-muted" />}
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatTile icon={<Sparkles className="size-4 text-[var(--primary)]" />} label="Games" value={user.stats.gamesCreated.toString()} />
          <StatTile icon={<Trophy className="size-4 text-[var(--gold)]" />} label="Plays" value={user.stats.gamesPlayed.toString()} />
          <StatTile icon={<Heart className="size-4 text-[var(--cyan)]" />} label="Likes" value={user.stats.likes.toString()} />
        </div>

        {editing ? (
          <EditPanel
            onClose={() => setEditing(false)}
            user={user}
            onSave={(p) => {
              patchUser(p);
              setEditing(false);
            }}
          />
        ) : null}

        {/* Created games */}
        {myMaybeGames.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-semibold">Made by you</h2>
              <Badge color="#9b5cff">{myMaybeGames.length}</Badge>
            </div>
            <div className="space-y-2">
              {myMaybeGames.slice(0, 3).map((g) => (
                <GameCard key={g.id} game={g} variant="compact" />
              ))}
            </div>
          </section>
        ) : null}

        {/* Favorites */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold">Favorites</h2>
            <Badge color="#ff4da8">{myFavs.length}</Badge>
          </div>
          {myFavs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-text-muted">
              <Heart className="mx-auto size-5 text-[var(--primary)]" />
              <div className="mt-2">Tap the heart on any game to save it.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {myFavs.slice(0, 4).map((g) => (
                <GameCard key={g.id} game={g} variant="compact" />
              ))}
            </div>
          )}
        </section>

        {/* Settings */}
        <section className="rounded-3xl border border-border-soft bg-surface/60 p-3">
          <SettingRow icon={<Bell className="size-4 text-[var(--violet)]" />} label="Notifications" hint="Lobby pings, ratings, friends" />
          <SettingRow icon={<Volume2 className="size-4 text-[var(--cyan)]" />} label="Voice & audio" hint="Mic, deafen, reverb" />
          <SettingRow icon={<ShieldCheck className="size-4 text-[var(--lime)]" />} label="Safety" hint="Content filter, age, blocks" />
          <SettingRow icon={<Compass className="size-4 text-[var(--gold)]" />} label="Matchmaking" hint="Region, age range, language" />
          <SettingRow icon={<Gamepad2 className="size-4 text-[var(--primary)]" />} label="Controls" hint="Touch + keyboard" />
          <SettingRow icon={<Settings className="size-4 text-text-muted" />} label="App settings" hint="Theme, performance" last />
        </section>

        <button
          onClick={onLogout}
          className="w-full rounded-2xl border border-border-soft bg-surface/40 p-4 text-[var(--danger)] inline-flex items-center justify-center gap-2"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>

      <BottomNav />
    </main>
  );
}

function EditPanel({
  user,
  onClose,
  onSave,
}: {
  user: ReturnType<typeof useApp.getState>["user"];
  onClose: () => void;
  onSave: (p: Partial<NonNullable<ReturnType<typeof useApp.getState>["user"]>>) => void;
}) {
  const u = user!;
  const [name, setName] = useState(u.displayName);
  const [bio, setBio] = useState(u.bio ?? "");
  const [avatar, setAvatar] = useState(u.avatar);
  const [color, setColor] = useState(u.color);
  const [genres, setGenres] = useState<Genre[]>(u.genres);

  return (
    <div className="rounded-3xl border border-border-soft bg-surface/60 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-display font-semibold">Edit profile</div>
        <button onClick={onClose} className="text-sm text-text-muted">Cancel</button>
      </div>
      <div className="flex items-center gap-3">
        <Avatar emoji={avatar} color={color} size={56} ring />
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio (optional)" />
      <div>
        <div className="text-xs text-text-muted mb-2">Avatar</div>
        <div className="grid grid-cols-8 gap-1.5">
          {AVATARS.slice(0, 16).map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={cn(
                "h-10 rounded-xl text-xl bg-surface-2 border border-border-soft",
                avatar === a && "border-[var(--primary)] bg-[var(--primary)]/15",
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-text-muted mb-2">Color</div>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "h-9 w-9 rounded-full border-2",
                color === c ? "border-white scale-110" : "border-white/10",
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-text-muted mb-2">Favorite genres</div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const active = genres.includes(g);
            return (
              <button
                key={g}
                onClick={() =>
                  setGenres((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]))
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold border",
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)]/15 text-white"
                    : "border-border-soft bg-surface/50 text-text-soft",
                )}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
      <Button full size="lg" onClick={() => onSave({ displayName: name.trim() || u.displayName, bio, avatar, color, genres })}>
        Save changes
      </Button>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface/60 p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-xs text-text-muted">
        {icon} {label}
      </div>
      <div className="font-bold mt-0.5">{value}</div>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  hint,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-full p-3 flex items-center gap-3 text-left",
        !last && "border-b border-border-soft",
      )}
    >
      <div className="size-10 rounded-2xl bg-white/5 border border-white/10 grid place-items-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-text-muted truncate">{hint}</div>
      </div>
      <ChevronRight className="size-4 text-text-muted" />
    </button>
  );
}
