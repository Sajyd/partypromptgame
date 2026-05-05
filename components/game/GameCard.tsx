"use client";

import Link from "next/link";
import { Star, Play, Users, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratedGame } from "@/lib/types";
import { GameThumb } from "./GameThumb";
import { Badge } from "@/components/ui/Badge";
import { AvatarStack } from "@/components/ui/Avatar";
import { useApp } from "@/lib/store";

export function GameCard({
  game,
  variant = "list",
}: {
  game: GeneratedGame;
  variant?: "list" | "grid" | "wide" | "compact";
}) {
  const favorites = useApp((s) => s.favorites);
  const toggleFav = useApp((s) => s.toggleFavorite);
  const isFav = favorites.includes(game.id);

  if (variant === "compact") {
    return (
      <Link
        href={`/game/${game.id}`}
        className="flex items-center gap-3 p-3 rounded-2xl bg-surface/60 border border-border-soft hover:bg-surface-2 transition"
      >
        <div className="w-14 h-14 shrink-0">
          <GameThumb game={game} size="sm" className="h-full" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{game.title}</div>
          <div className="text-xs text-text-muted truncate">
            {game.category} · {game.creators.length} creators
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-soft">
          <Star className="size-3.5 fill-[var(--gold)] text-[var(--gold)]" />
          {game.rating.toFixed(1)}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/game/${game.id}`}
      className={cn(
        "block rounded-3xl bg-surface/60 border border-border-soft overflow-hidden",
        "hover:border-white/20 transition group",
      )}
    >
      <div className="relative">
        <GameThumb
          game={game}
          size={variant === "wide" ? "lg" : "md"}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleFav(game.id);
          }}
          className={cn(
            "absolute top-2 right-2 h-9 w-9 rounded-full grid place-items-center backdrop-blur-md transition",
            isFav ? "bg-white/20 text-[var(--primary)]" : "bg-black/30 text-white/80 hover:text-white",
          )}
          aria-label={isFav ? "Unfavorite" : "Favorite"}
        >
          <Heart className={cn("size-4", isFav && "fill-current")} />
        </button>
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <Badge variant="solid">{game.category}</Badge>
        </div>
      </div>
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-display text-base font-semibold truncate group-hover:text-[var(--primary-2)] transition">
              {game.title}
            </div>
            <div className="text-xs text-text-muted line-clamp-1">
              {game.description}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <AvatarStack
            items={game.creators.map((c) => ({
              emoji: c.avatar,
              color: c.color,
              label: c.name,
            }))}
            size={22}
          />
          <div className="flex items-center gap-3 text-xs text-text-soft">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-[var(--gold)] text-[var(--gold)]" />
              {game.rating.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Play className="size-3.5" />
              {formatNumber(game.plays)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {game.players}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatNumber(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}
