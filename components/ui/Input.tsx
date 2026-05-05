"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const baseClass =
  "w-full bg-surface-2/70 border border-border-soft rounded-2xl px-4 py-3 text-text placeholder:text-text-muted focus:border-[var(--primary)] focus:bg-surface-2 transition";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(baseClass, className)} {...rest} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(baseClass, "resize-none leading-relaxed", className)}
      {...rest}
    />
  );
});

export function FormLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block text-sm text-text-soft mb-2 font-medium", className)}>
      {children}
    </label>
  );
}
