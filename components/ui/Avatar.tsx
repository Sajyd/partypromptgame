import { cn } from "@/lib/utils";

interface Props {
  emoji: string;
  color?: string;
  size?: number;
  ring?: boolean;
  className?: string;
  label?: string;
}

export function Avatar({ emoji, color = "#9b5cff", size = 40, ring, className, label }: Props) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full text-xl shrink-0",
        ring && "ring-2 ring-offset-2 ring-offset-bg",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${color}55, ${color}11 70%)`,
        boxShadow: `inset 0 0 0 1.5px ${color}88`,
        // @ts-expect-error css var
        "--tw-ring-color": color,
        fontSize: size * 0.55,
      }}
      aria-label={label}
    >
      <span>{emoji}</span>
    </div>
  );
}

export function AvatarStack({
  items,
  size = 28,
  max = 4,
}: {
  items: { emoji: string; color: string; label?: string }[];
  size?: number;
  max?: number;
}) {
  const visible = items.slice(0, max);
  const rest = items.length - visible.length;
  return (
    <div className="flex items-center -space-x-2">
      {visible.map((it, i) => (
        <Avatar
          key={i}
          emoji={it.emoji}
          color={it.color}
          size={size}
          label={it.label}
          className="border-2 border-bg"
        />
      ))}
      {rest > 0 ? (
        <div
          className="rounded-full bg-surface-3 text-text-soft text-xs font-semibold flex items-center justify-center border-2 border-bg"
          style={{ width: size, height: size }}
        >
          +{rest}
        </div>
      ) : null}
    </div>
  );
}
