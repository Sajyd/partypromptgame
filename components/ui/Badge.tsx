import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  color?: string;
  variant?: "solid" | "soft" | "outline";
}

export function Badge({ children, className, color, variant = "soft" }: Props) {
  const style = color
    ? variant === "soft"
      ? { background: `${color}22`, color, border: `1px solid ${color}33` }
      : variant === "solid"
        ? { background: color, color: "#0b0716" }
        : { borderColor: `${color}66`, color }
    : undefined;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        !color && variant === "soft" && "bg-white/5 text-text-soft border border-white/10",
        !color && variant === "solid" && "bg-white/10 text-text",
        !color && variant === "outline" && "border border-white/15 text-text-soft",
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}
