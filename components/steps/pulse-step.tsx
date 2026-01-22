"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"

const blobPaths = [
  "M461,301.5Q441,353,399,387Q357,421,301,442Q245,463,193.5,435Q142,407,104.5,366Q67,325,57.5,267Q48,209,83,160.5Q118,112,172.5,82Q227,52,287.5,55Q348,58,397,94Q446,130,463,190Q480,250,461,301.5Z",
  "M445,303Q444,356,399.5,387Q355,418,301.5,444.5Q248,471,192.5,450Q137,429,96.5,386Q56,343,56.5,284Q57,225,79,170Q101,115,160.5,85Q220,55,282,57Q344,59,392,96.5Q440,134,443.5,192Q447,250,445,303Z",
  "M466,305.5Q450,361,404.5,396.5Q359,432,303,446.5Q247,461,195,434Q143,407,111,364.5Q79,322,64,269Q49,216,80,163Q111,110,169,77Q227,44,290.5,52Q354,60,402,101.5Q450,143,467,196.5Q484,250,466,305.5Z"
]

export function PulseStep() {
  const goTo = useAppStore((s) => s.goTo)
  const log = useAppStore((s) => s.log)

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center px-5">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[42%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute left-[20%] top-[30%] h-[380px] w-[380px] rounded-full bg-blue-600/12 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
          City Pulse — Sapporo Today
        </div>

        <div className="mt-10 flex items-center justify-center">
          <motion.svg width="420" height="420" viewBox="0 0 500 500" className="drop-shadow-[0_40px_120px_rgba(37,99,235,0.25)]">
            <defs>
              <radialGradient id="g" cx="30%" cy="25%">
                <stop offset="0%" stopColor="rgba(56,189,248,0.90)" />
                <stop offset="55%" stopColor="rgba(59,130,246,0.40)" />
                <stop offset="100%" stopColor="rgba(30,64,175,0.18)" />
              </radialGradient>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="10" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <motion.path
              d={blobPaths[0]}
              animate={{ d: blobPaths, rotate: [0, 8, -6, 0], scale: [1, 1.02, 0.99, 1] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
              fill="url(#g)"
              filter="url(#softGlow)"
            />
          </motion.svg>
        </div>

        <div className="mt-8 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Today’s stability is holding — but pressure is accumulating downtown.
        </div>
        <div className="mt-3 text-sm text-muted-foreground md:text-base">
          MAPAI surfaces signals, asks you the right questions, and runs policy simulations only when you explicitly choose to.
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => {
              log("Viewed city pulse", "Opened MAPAI Tourism — Sapporo Today")
              goTo("brief")
            }}
          >
            View today’s briefing
          </Button>
        </div>
      </div>
    </div>
  )
}
