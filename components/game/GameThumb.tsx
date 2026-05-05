"use client";

import { cn } from "@/lib/utils";
import { GENRE_GRADIENTS } from "@/lib/mock-data";
import type { GeneratedGame } from "@/lib/types";

export function GameThumb({
  game,
  size = "md",
  className,
}: {
  game: Pick<GeneratedGame, "thumbnail" | "category" | "title" | "hue">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-20 text-3xl",
    md: "h-28 text-5xl",
    lg: "h-40 text-6xl",
  };
  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden flex items-center justify-center",
        "border border-white/10",
        sizes[size],
        className,
      )}
      style={{ background: GENRE_GRADIENTS[game.category] }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-4 -left-4 w-20 h-20 rounded-full opacity-50 blur-xl"
        style={{ background: `hsla(${(game.hue + 60) % 360}, 90%, 60%, 0.6)` }}
      />
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-50 blur-xl"
        style={{ background: `hsla(${(game.hue + 200) % 360}, 90%, 60%, 0.6)` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle,rgba(255,255,255,0.5)_1px,transparent_1.5px)] [background-size:14px_14px]" />
      <span className="relative drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)]">
        {game.thumbnail}
      </span>
    </div>
  );
}
