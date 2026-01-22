"use client"

import { CityMap } from "@/components/map/city-map"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppStore } from "@/lib/store"
import { ArrowRight } from "lucide-react"

export function AnalysisStep() {
  const baseline = useAppStore((s) => s.baselinePoints)
  const framing = useAppStore((s) => s.framing)
  const goTo = useAppStore((s) => s.goTo)
  const log = useAppStore((s) => s.log)

  return (
    <div className="mx-auto grid h-full min-h-0 w-full max-w-7xl gap-4 px-5 py-6 lg:grid-cols-[1fr_420px]">
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Analysis mode</div>
            <div className="text-2xl font-semibold tracking-tight md:text-3xl">Congestion intensity map</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Heatmap overlay is deterministic dummy data, scoped by your framing summary.
            </div>
          </div>
          <Badge variant="info" className="hidden md:inline-flex">
            MapLibre • overlays
          </Badge>
        </div>

        <div className="min-h-0 flex-1">
          <CityMap baseline={baseline} />
        </div>

        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center">
          <div>
            <div className="text-sm font-medium">Next: generate policy options</div>
            <div className="mt-1 text-sm text-muted-foreground">
              This step does not run simulation. It prepares policy cards tailored to your framing constraints.
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => {
              log("Generated policy options", "Prepared policy cards for simulation", { framing })
              goTo("simulation")
            }}
          >
            Generate policy options <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="border-b border-white/10 bg-white/5 px-5 py-4">
          <div className="text-sm font-semibold">Analysis panel</div>
          <div className="mt-1 text-sm text-muted-foreground">Drivers and next questions (dummy but plausible)</div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-5">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-muted-foreground">Framing lock</div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Goal</span>
                  <span className="text-right">
                    {framing.goal === "congestion-reduction" ? "Congestion reduction" : "Stay / spend promotion"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Areas</span>
                  <span className="text-right">{framing.areas.join(", ")}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-right">{framing.timeRange}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Threshold</span>
                  <span className="text-right">{framing.unacceptableThreshold}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold">Summary of key drivers</div>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  Concentration pattern: Odori ↔ Susukino corridor exhibits repeated spillover due to narrow crossings and synchronized venue changes.
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  Trigger pattern: short, sharp surges at Station are consistent with timetable clustering and tour-group bursts.
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  Persistence pattern: after 18:00, dwell time increases, lowering throughput even if arrivals remain flat.
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold">Suggested questions to explore next</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                  If we reduce peak intensity downtown by 10–15%, where does the load realistically go (ring meshes vs station)?
                </li>
                <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                  Which lever changes throughput fastest: crosswalk timing, transit nudges, or time-slot adjustments?
                </li>
                <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                  Does the chosen threshold (peak / queue / dwell) align with operational constraints (staffing, signage, crowd messaging)?
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
