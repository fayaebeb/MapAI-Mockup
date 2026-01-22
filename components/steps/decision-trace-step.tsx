"use client"

import { useMemo, useState } from "react"
import { ALWAYS_THREE_INSIGHTS, useAppStore, type TraceEvent } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Download, Copy, Check } from "lucide-react"

function formatTraceAsText(events: TraceEvent[]) {
  const lines: string[] = []
  lines.push("MAPAI Tourism — Decision Trace (Sapporo Edition)")
  lines.push(`Exported: ${new Date().toISOString()}`)
  lines.push("")
  for (const e of events) {
    const t = new Date(e.atISO).toLocaleString()
    lines.push(`[${t}] ${e.title}${e.detail ? ` — ${e.detail}` : ""}`)
  }
  return lines.join("\n")
}

export function DecisionTraceStep() {
  const trace = useAppStore((s) => s.trace)
  const framing = useAppStore((s) => s.framing)
  const simulation = useAppStore((s) => s.simulation)
  const policies = useAppStore((s) => s.policyOptions)
  const reset = useAppStore((s) => s.resetApp)

  const [copied, setCopied] = useState(false)

  const chosen = useMemo(() => policies.find((p) => p.id === simulation.selectedPolicyId), [policies, simulation.selectedPolicyId])

  const exportPayload = useMemo(
    () => ({
      product: "MAPAI Tourism (Sapporo Edition)",
      exportedAtISO: new Date().toISOString(),
      briefInsights: ALWAYS_THREE_INSIGHTS,
      framing,
      selectedPolicy: chosen ?? null,
      simulation: simulation.ran ? { meshDeltas: simulation.meshDeltas } : null,
      trace
    }),
    [trace, framing, simulation, chosen]
  )

  async function copyText() {
    const text = formatTraceAsText(trace)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mapai-tourism-sapporo-trace-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 pb-10 pt-8 md:grid-cols-[1fr_420px]">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-4">
          <div>
            <div className="text-xs text-muted-foreground">Decision Trace</div>
            <div className="text-lg font-semibold">Audit-ready timeline</div>
          </div>
          <Badge variant="success">Exportable</Badge>
        </div>
        <ScrollArea className="h-[min(70vh,680px)]">
          <div className="space-y-3 p-5">
            {trace.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-muted-foreground">
                No events yet — run through the flow to generate an audit trail.
              </div>
            ) : (
              trace.map((e, idx) => (
                <div key={e.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{e.title}</div>
                    <Badge variant={idx === trace.length - 1 ? "info" : "default"}>
                      {new Date(e.atISO).toLocaleTimeString()}
                    </Badge>
                  </div>
                  {e.detail && <div className="mt-2 text-sm text-muted-foreground">{e.detail}</div>}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="text-sm font-semibold">Export</div>
          <div className="mt-1 text-sm text-muted-foreground">Share with stakeholders, archive decisions, or attach to policy memos.</div>
          <div className="mt-4 grid gap-2">
            <Button onClick={copyText} variant="secondary">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy as text
            </Button>
            <Button onClick={downloadJSON}>
              <Download className="h-4 w-4" /> Download JSON
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Final decision summary</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Goal</span>
              <span>{framing.goal === "congestion-reduction" ? "Congestion reduction" : framing.goal ? "Stay / spend promotion" : "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Areas</span>
              <span className="text-right">{framing.areas.length ? framing.areas.join(", ") : "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Selected policy</span>
              <span className="text-right">{chosen?.title ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Simulation</span>
              <span>{simulation.ran ? "Executed" : "Not executed"}</span>
            </div>
          </div>
          <div className="mt-5">
            <Button variant="outline" onClick={reset} className="w-full">
              Restart demo
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
