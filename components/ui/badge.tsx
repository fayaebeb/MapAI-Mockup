import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import * as React from "react"

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-white/5 text-foreground border-white/10",
      info: "bg-sky-500/10 text-sky-200 border-sky-400/20",
      success: "bg-emerald-500/10 text-emerald-200 border-emerald-400/20",
      warning: "bg-amber-500/10 text-amber-200 border-amber-400/20"
    }
  },
  defaultVariants: { variant: "default" }
})

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
