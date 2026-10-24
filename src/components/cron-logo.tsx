import { cn } from "@/lib/utils";

export function CronLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-foreground" />
      <circle cx="16" cy="16" r="9" className="stroke-background" strokeWidth="2" />
      <path d="M16 10v6l4 2" className="stroke-background" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
