"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useAppStore } from "@/lib/store"
import { PulseStep } from "@/components/steps/pulse-step"
import { BriefStep } from "@/components/steps/brief-step"
import { ReverseChatStep } from "@/components/steps/reverse-chat-step"
import { AnalysisStep } from "@/components/steps/analysis-step"
import { SimulationStep } from "@/components/steps/simulation-step"
import { DecisionTraceStep } from "@/components/steps/decision-trace-step"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

const stepLabels = {
  pulse: "Pulse",
  brief: "Brief",
  chat: "Reverse Chat",
  analysis: "Analysis Mode",
  simulation: "Simulation",
  trace: "Decision Trace"
} as const

export function AppShell() {
  const step = useAppStore((s) => s.step)
  const reset = useAppStore((s) => s.resetApp)

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-24 bg-gradient-to-b from-black/30 to-transparent" />
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-400/25 to-blue-600/25 ring-1 ring-white/10 shadow-glow" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">MAPAI Tourism</div>
            <div className="text-xs text-muted-foreground">City Simulation OS — By PCKK</div>
          </div>
          <Badge className="ml-2 hidden md:inline-flex" variant="info">
            {stepLabels[step]}
          </Badge>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <Badge className="md:hidden" variant="info">
            {stepLabels[step]}
          </Badge>
          <Button variant="ghost" size="icon" onClick={reset} aria-label="Reset demo">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }}
          >
            {step === "pulse" && <PulseStep />}
            {step === "brief" && <BriefStep />}
            {step === "chat" && <ReverseChatStep />}
            {step === "analysis" && <AnalysisStep />}
            {step === "simulation" && <SimulationStep />}
            {step === "trace" && <DecisionTraceStep />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

