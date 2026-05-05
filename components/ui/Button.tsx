"use client";

import { cn } from "@/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "soft";
type Size = "sm" | "md" | "lg" | "xl" | "icon";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "text-black bg-[var(--grad-warm,linear-gradient(135deg,#ff4da8,#ffd14d))] [background:var(--grad-hero)] hover:brightness-110 active:brightness-95 shadow-[0_10px_30px_-10px_rgba(255,77,168,0.55)]",
  secondary:
    "text-white bg-surface-2 border border-border hover:bg-surface-3",
  ghost: "text-text-soft hover:bg-white/5",
  outline:
    "text-white border border-border hover:bg-white/5 bg-transparent",
  danger: "text-white bg-[var(--danger)] hover:brightness-110",
  soft: "text-text bg-white/8 hover:bg-white/12 border border-white/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-11 px-4 text-sm rounded-2xl",
  lg: "h-12 px-5 text-base rounded-2xl",
  xl: "h-14 px-6 text-base rounded-2xl",
  icon: "h-11 w-11 rounded-2xl text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, full, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-semibold transition-all select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        full && "w-full",
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  );
});
