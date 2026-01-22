"use client"

import { useMemo } from "react"
import { CityMap } from "@/components/map/city-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppStore } from "@/lib/store"
import { Check, Play, ShieldAlert } from "lucide-react"

function pct(n: number) {
  const sign = n > 0 ? "+" : ""
  return `${sign}${n.toFixed(1)}%`
}

export function SimulationStep() {
  const baseline = useAppStore((s) => s.baselinePoints)
  const after = useAppStore((s) => s.afterPoints)
  const policyOptions = useAppStore((s) => s.policyOptions)
  const simulation = useAppStore((s) => s.simulation)
  const selectPolicy = useAppStore((s) => s.selectPolicy)
  const run = useAppStore((s) => s.runSelectedSimulation)
  const finalize = useAppStore((s) => s.finalizeDecision)
  const goTo = useAppStore((s) => s.goTo)

  const selected = useMemo(() => policyOptions.find((p) => p.id === simulation.selectedPolicyId), [policyOptions, simulation])

  return (
    <div className="mx-auto grid h-full min-h-0 w-full max-w-7xl gap-4 px-5 py-6 lg:grid-cols-[1fr_420px]">
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Simulation</div>
            <div className="text-2xl font-semibold tracking-tight md:text-3xl">Policy impact preview</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Select a policy card, then explicitly run the simulation to apply a deterministic transformation to the heatmap.
            </div>
          </div>
          {simulation.ran ? (
            <Badge variant="success" className="hidden md:inline-flex">
              Simulation complete
            </Badge>
          ) : (
            <Badge variant="warning" className="hidden md:inline-flex">
              Not yet executed
            </Badge>
          )}
        </div>

        <div className="min-h-0 flex-1">
          <CityMap baseline={baseline} after={after} showAfter={simulation.ran} showDiff={simulation.ran} />
        </div>

        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg border border-white/10 bg-white/5 p-2">
              <ShieldAlert className="h-4 w-4 text-sky-200" />
            </div>
            <div>
              <div className="text-sm font-medium">Responsibility boundary</div>
              <div className="mt-1 text-sm text-muted-foreground">
                The map changes only after you press Run simulation. You can review effects before finalizing.
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:flex-row md:items-center">
            <Button variant="outline" onClick={() => goTo("analysis")}>
              Back to analysis
            </Button>
            <Button
              size="lg"
              onClick={run}
              disabled={!simulation.selectedPolicyType || simulation.ran}
              title={!simulation.selectedPolicyType ? "Select a policy first" : undefined}
            >
              <Play className="h-4 w-4" />
              Run simulation
            </Button>
            <Button size="lg" onClick={finalize} disabled={!simulation.ran}>
              Finalize decision <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="border-b border-white/10 bg-white/5 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">Policy cards</div>
            {selected ? <Badge variant="info">Selected</Badge> : <Badge>Pick one</Badge>}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">3–5 options. Deterministic simulation per policy type.</div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-3 p-5">
            {policyOptions.map((p) => {
              const isSel = p.id === simulation.selectedPolicyId
              return (
                <Card
                  key={p.id}
                  className={isSel ? "border-sky-400/30 bg-sky-500/10" : "cursor-pointer hover:bg-white/10"}
                  onClick={() => selectPolicy(p.id)}
                  role="button"
                  tabIndex={0}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      {isSel ? <Badge variant="info">Selected</Badge> : <Badge>Option</Badge>}
                    </div>
                    <CardDescription>{p.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Levers</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {p.levers.map((l) => (
                          <Badge key={l} variant="default">
                            {l}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Tradeoffs</div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {p.tradeoffs.map((t) => (
                          <div key={t} className="rounded-lg border border-white/10 bg-white/5 p-2">
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {simulation.ran && simulation.meshDeltas.length > 0 && (
              <Card className="overflow-hidden">
                <div className="border-b border-white/10 bg-white/5 px-5 py-4">
                  <div className="text-sm font-semibold">Mesh effects (before → after)</div>
                  <div className="mt-1 text-sm text-muted-foreground">Top absolute deltas</div>
                </div>
                <div className="p-5">
                  <div className="grid gap-2 text-sm">
                    {simulation.meshDeltas.map((d) => (
                      <div
                        key={d.mesh}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{d.mesh}</Badge>
                          <span className="text-muted-foreground">
                            {d.before.toFixed(1)} → {d.after.toFixed(1)}
                          </span>
                        </div>
                        <Badge variant={d.deltaPct < 0 ? "info" : "warning"}>{pct(d.deltaPct)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
