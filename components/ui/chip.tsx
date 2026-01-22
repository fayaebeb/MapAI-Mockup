import { cn } from "@/lib/utils"
import * as React from "react"

export function Chip({
  active,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-sky-400/40 bg-sky-500/15 text-sky-100"
          : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
