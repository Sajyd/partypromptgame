import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
  bottomBarSpace = false,
}: {
  children: React.ReactNode;
  className?: string;
  bottomBarSpace?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[480px] px-4 sm:px-5",
        bottomBarSpace && "pb-bottom-nav",
        className,
      )}
    >
      {children}
    </div>
  );
}
