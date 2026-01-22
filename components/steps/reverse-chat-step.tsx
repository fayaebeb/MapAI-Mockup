"use client"

import { useMemo, useRef, useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

type ChatTurn = { id: string; role: "ai" | "user"; content: string }

const questions = [
  {
    key: "goal",
    ai: "First, what outcome are we optimizing for today?",
    chips: [
      { label: "Congestion reduction", value: "congestion-reduction" as const },
      { label: "Stay / spend promotion", value: "stay-spend-promotion" as const }
    ]
  },
  {
    key: "areas",
    ai: "Which areas matter most for this decision? Pick one or more.",
    chips: [
      { label: "Downtown", value: "Downtown" },
      { label: "Odori", value: "Odori" },
      { label: "Susukino", value: "Susukino" },
      { label: "Sapporo Station", value: "Station" },
      { label: "Ring (absorption)", value: "Ring" }
    ]
  },
  {
    key: "timeRange",
    ai: "What time range should analysis focus on?",
    chips: [
      { label: "Today", value: "today" as const },
      { label: "Evening (16:00–22:00)", value: "evening" as const },
      { label: "Weekend", value: "weekend" as const },
      { label: "Weekday", value: "weekday" as const },
      { label: "All-day baseline", value: "all-day" as const }
    ]
  },
  {
    key: "unacceptableThreshold",
    ai: "Define an unacceptable threshold so we know what “better” means.",
    chips: [
      { label: "Peak intensity > 0.75", value: "peak>0.75" as const },
      { label: "Peak intensity > 0.65", value: "peak>0.65" as const },
      { label: "Queueing > 10 min", value: "queue>10m" as const },
      { label: "Dwell time +8 min", value: "dwell>+8m" as const }
    ]
  }
] as const

export function ReverseChatStep() {
  const framing = useAppStore((s) => s.framing)
  const setFraming = useAppStore((s) => s.setFraming)
  const goTo = useAppStore((s) => s.goTo)
  const log = useAppStore((s) => s.log)

  const turnSeq = useRef(0)
  function uid(prefix: string) {
    turnSeq.current += 1
    return `${prefix}-${turnSeq.current}`
  }

  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: uid("t"),
      role: "ai",
      content:
        "I’ll help you frame the problem before we enter analysis mode. I won’t run analysis or simulation until you explicitly confirm."
    },
    { id: uid("t"), role: "ai", content: questions[0].ai }
  ])
  const [qIndex, setQIndex] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const current = questions[qIndex]

  const canProceed = Boolean(framing.goal && framing.areas.length > 0 && framing.timeRange && framing.unacceptableThreshold)

  const chips = useMemo(() => {
    if (!current) return []
    return current.chips
  }, [current])

  function advance() {
    const nextIndex = qIndex + 1
    if (nextIndex < questions.length) {
      setQIndex(nextIndex)
      setTurns((t) => [...t, { id: uid("t"), role: "ai", content: questions[nextIndex].ai }])
      return
    }
    setTurns((t) => [
      ...t,
      {
        id: uid("t"),
        role: "ai",
        content:
          "Great. When you’re ready, you can proceed to analysis mode. I’ll lock the framing summary and render the map overlays."
      }
    ])
  }

  function answerSingle(label: string, value: unknown) {
    setTurns((t) => [...t, { id: uid("t"), role: "user", content: label }])

    if (current.key === "goal") setFraming({ goal: value as typeof framing.goal })
    if (current.key === "timeRange") setFraming({ timeRange: value as typeof framing.timeRange })
    if (current.key === "unacceptableThreshold") setFraming({ unacceptableThreshold: value as typeof framing.unacceptableThreshold })

    advance()
  }

  function toggleArea(areaLabel: string) {
    const next = framing.areas.includes(areaLabel) ? framing.areas.filter((x) => x !== areaLabel) : [...framing.areas, areaLabel]
    setFraming({ areas: next })
  }

  function onChipClick(label: string, value: unknown) {
    if (!current) return
    if (current.key === "areas") {
      toggleArea(String(value))
      return
    }
    answerSingle(label, value)
  }

  function commitAreasAndContinue() {
    if (!current || current.key !== "areas") return
    if (framing.areas.length === 0) return
    setTurns((t) => [...t, { id: uid("t"), role: "user", content: `Areas: ${framing.areas.join(", ")}` }])
    advance()
  }

  return (
    <div className="mx-auto grid h-full min-h-0 w-full max-w-6xl gap-4 px-5 py-6 md:grid-cols-[1.2fr_0.8fr]">
      <Card className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-sky-300" />
            Reverse Chat — Problem framing
          </div>
          <Badge variant="info">AI-led</Badge>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-3 p-5">
            {turns.map((t) => (
              <div key={t.id} className={t.role === "ai" ? "flex justify-start" : "flex justify-end"}>
                <div
                  className={
                    t.role === "ai"
                      ? "max-w-[78%] rounded-2xl rounded-tl-md border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      : "max-w-[78%] rounded-2xl rounded-tr-md bg-sky-500/15 px-4 py-3 text-sm text-sky-100 ring-1 ring-sky-400/20"
                  }
                >
                  {t.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-white/10 bg-white/5 p-5">
          <div className="text-xs text-muted-foreground">Quick-select</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((c) => {
              const active =
                current?.key === "goal"
                  ? framing.goal === c.value
                  : current?.key === "timeRange"
                    ? framing.timeRange === c.value
                    : current?.key === "unacceptableThreshold"
                      ? framing.unacceptableThreshold === c.value
                      : framing.areas.includes(String(c.value))
              return (
                <Chip
                  key={c.label}
                  active={active}
                  onClick={() => onChipClick(c.label, c.value)}
                  disabled={!current}
                  type="button"
                >
                  {c.label}
                </Chip>
              )
            })}
          </div>

          {current?.key === "areas" && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {framing.areas.length === 0 ? "Select at least one area to continue." : `${framing.areas.length} selected.`}
              </div>
              <Button variant="secondary" onClick={commitAreasAndContinue} disabled={framing.areas.length === 0}>
                Continue
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="flex min-h-0 flex-col gap-4">
        <Card className="p-5">
          <div className="text-sm font-semibold">Framing summary</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Goal</span>
              <span className="text-right">
                {framing.goal === "congestion-reduction"
                  ? "Congestion reduction"
                  : framing.goal === "stay-spend-promotion"
                    ? "Stay / spend promotion"
                    : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Areas</span>
              <span className="text-right">{framing.areas.length ? framing.areas.join(", ") : "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Time range</span>
              <span className="text-right">{framing.timeRange ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Unacceptable threshold</span>
              <span className="text-right">{framing.unacceptableThreshold ?? "—"}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-muted-foreground">Notes (optional)</div>
            <Textarea
              value={framing.notes}
              onChange={(e) => setFraming({ notes: e.target.value })}
              placeholder="Add any constraints (e.g., avoid resident disruption, keep station throughput stable)..."
              className="mt-2"
            />
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium">Responsibility boundary</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Analysis mode renders the map overlays and drivers. Simulation runs only after you choose a policy and press Run.
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => goTo("brief")}>
              Back to brief
            </Button>
            <Button size="lg" disabled={!canProceed} onClick={() => setConfirmOpen(true)}>
              Proceed to analysis <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter analysis mode?</DialogTitle>
            <DialogDescription>
              This will render the map and analysis overlays using your framing summary. No simulation will run yet.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Goal</span>
              <span>{framing.goal === "congestion-reduction" ? "Congestion reduction" : "Stay / spend promotion"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Areas</span>
              <span className="text-right">{framing.areas.join(", ")}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Time range</span>
              <span>{framing.timeRange}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Threshold</span>
              <span>{framing.unacceptableThreshold}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                log("Entered analysis mode", "Declared responsibility boundary: analysis only", { framing })
                goTo("analysis")
                setConfirmOpen(false)
              }}
            >
              Enter analysis mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
