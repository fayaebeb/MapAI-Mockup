"use client"

import { create } from "zustand"
import { BRIEF_INSIGHTS, createBaselineHeatPoints, POLICY_OPTIONS, type PolicyOption, type PolicyType } from "@/lib/mock-data"
import { runSimulation, type MeshDelta } from "@/lib/simulation"

export type AppStep = "pulse" | "brief" | "chat" | "analysis" | "simulation" | "trace"

export type FramingState = {
  goal?: "congestion-reduction" | "stay-spend-promotion"
  areas: string[]
  timeRange?: "today" | "weekend" | "weekday" | "evening" | "all-day"
  unacceptableThreshold?: "peak>0.75" | "peak>0.65" | "queue>10m" | "dwell>+8m"
  notes: string
}

export type TraceEvent = {
  id: string
  atISO: string
  title: string
  detail?: string
  data?: unknown
}

type SimulationState = {
  selectedPolicyId?: string
  selectedPolicyType?: PolicyType
  ran: boolean
  meshDeltas: MeshDelta[]
}

type AppState = {
  step: AppStep
  framing: FramingState
  trace: TraceEvent[]

  baselinePoints: ReturnType<typeof createBaselineHeatPoints>
  afterPoints?: ReturnType<typeof createBaselineHeatPoints>

  policyOptions: PolicyOption[]
  simulation: SimulationState

  goTo: (step: AppStep) => void
  log: (title: string, detail?: string, data?: unknown) => void
  setFraming: (patch: Partial<FramingState>) => void
  resetFraming: () => void
  selectPolicy: (policyId: string) => void
  runSelectedSimulation: () => void
  finalizeDecision: () => void
  resetApp: () => void
}

function nowISO() {
  return new Date().toISOString()
}

let idSeq = 0
function uid(prefix: string) {
  idSeq += 1
  return `${prefix}-${idSeq}`
}

export const useAppStore = create<AppState>((set, get) => ({
  step: "pulse",
  framing: { areas: [], notes: "" },
  trace: [],

  baselinePoints: createBaselineHeatPoints(),
  afterPoints: undefined,

  policyOptions: POLICY_OPTIONS,
  simulation: { ran: false, meshDeltas: [] },

  goTo: (step) => set({ step }),

  log: (title, detail, data) =>
    set((s) => ({
      trace: [
        ...s.trace,
        {
          id: uid("trace"),
          atISO: nowISO(),
          title,
          detail,
          data
        }
      ]
    })),

  setFraming: (patch) => set((s) => ({ framing: { ...s.framing, ...patch } })),

  resetFraming: () => set({ framing: { areas: [], notes: "" } }),

  selectPolicy: (policyId) => {
    const prev = get().simulation.selectedPolicyId
    if (prev && prev !== policyId) {
      const prevPolicy = get().policyOptions.find((p) => p.id === prev)
      if (prevPolicy) get().log("Rejected policy option", prevPolicy.title, prevPolicy)
    }

    const policy = get().policyOptions.find((p) => p.id === policyId)
    set({
      simulation: {
        selectedPolicyId: policyId,
        selectedPolicyType: policy?.type,
        ran: false,
        meshDeltas: []
      },
      afterPoints: undefined
    })
    if (policy) get().log("Selected policy option", `${policy.title} — ${policy.subtitle}`, policy)
  },

  runSelectedSimulation: () => {
    const { baselinePoints, simulation } = get()
    if (!simulation.selectedPolicyType) return
    const { afterPoints, meshDeltas } = runSimulation(simulation.selectedPolicyType, baselinePoints)
    set({ afterPoints, simulation: { ...simulation, ran: true, meshDeltas } })
    get().log("Ran simulation", `Policy: ${simulation.selectedPolicyType}`, { meshDeltas })
  },

  finalizeDecision: () => {
    const { simulation, framing } = get()
    const chosen = get().policyOptions.find((p) => p.id === simulation.selectedPolicyId)
    get().log(
      "Finalized decision",
      chosen ? chosen.title : "No policy selected",
      { framing, chosen, meshDeltas: simulation.meshDeltas }
    )
    set({ step: "trace" })
  },

  resetApp: () => {
    set({
      step: "pulse",
      framing: { areas: [], notes: "" },
      trace: [],
      baselinePoints: createBaselineHeatPoints(),
      afterPoints: undefined,
      policyOptions: POLICY_OPTIONS,
      simulation: { ran: false, meshDeltas: [] }
    })
  }
}))

export const ALWAYS_THREE_INSIGHTS = BRIEF_INSIGHTS
