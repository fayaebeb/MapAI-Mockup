"use client"

import { ALWAYS_THREE_INSIGHTS, useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function BriefStep() {
  const goTo = useAppStore((s) => s.goTo)
  const log = useAppStore((s) => s.log)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-8">
      <div className="flex flex-col gap-2">
        <div className="text-xs text-muted-foreground">Today’s briefing</div>
        <div className="text-2xl font-semibold tracking-tight md:text-3xl">3 diagnostic digests</div>
        <div className="text-sm text-muted-foreground">
          Exactly three signals. Enough to decide what to analyze next — not enough to bias you.
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {ALWAYS_THREE_INSIGHTS.map((insight, i) => (
          <Card key={insight.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant={i === 0 ? "info" : i === 1 ? "warning" : "success"}>Insight {i + 1}</Badge>
                <div className="text-xs text-muted-foreground">Sapporo • today</div>
              </div>
              <CardTitle className="mt-2">{insight.title}</CardTitle>
              <CardDescription>{insight.summary}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <div className="text-xs text-muted-foreground">Comparison</div>
                <div className="mt-2 grid gap-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Yesterday</span>
                    <span>{insight.comparisons.yesterday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last week</span>
                    <span>{insight.comparisons.lastWeek}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Same period last year</span>
                    <span>{insight.comparisons.lastYear}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center">
        <div>
          <div className="text-sm font-medium">Next: reverse chat for problem framing</div>
          <div className="mt-1 text-sm text-muted-foreground">
            MAPAI will ask structured questions to define goals, scope, time window, and unacceptable thresholds.
          </div>
        </div>
        <Button
          size="lg"
          onClick={() => {
            log("Reviewed briefing insights", "Captured 3 diagnostic digests", ALWAYS_THREE_INSIGHTS)
            goTo("chat")
          }}
        >
          Start problem framing <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
