import type { HeatPoint, PolicyType } from "@/lib/mock-data"

export type MeshDelta = {
  mesh: string
  before: number
  after: number
  deltaPct: number
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function sumByMesh(points: HeatPoint[]) {
  const map = new Map<string, number>()
  for (const p of points) map.set(p.mesh, (map.get(p.mesh) ?? 0) + p.intensity)
  return map
}

function meshDelta(before: HeatPoint[], after: HeatPoint[]): MeshDelta[] {
  const b = sumByMesh(before)
  const a = sumByMesh(after)
  const meshes = new Set([...b.keys(), ...a.keys()])
  const result: MeshDelta[] = []
  for (const mesh of meshes) {
    const beforeSum = b.get(mesh) ?? 0
    const afterSum = a.get(mesh) ?? 0
    const deltaPct = beforeSum === 0 ? 0 : ((afterSum - beforeSum) / beforeSum) * 100
    result.push({
      mesh,
      before: round1(beforeSum),
      after: round1(afterSum),
      deltaPct: round1(deltaPct)
    })
  }
  return result.sort((x, y) => Math.abs(y.deltaPct) - Math.abs(x.deltaPct))
}

export function runSimulation(policy: PolicyType, baseline: HeatPoint[]) {
  // Deterministic, policy-specific transformation:
  // - reduce intensity in targeted tags
  // - move a portion into ring/suburb tags
  const movedFraction =
    policy === "time-dispersion" ? 0.12 : policy === "route-dispersion" ? 0.18 : policy === "transit-nudges" ? 0.14 : 0.1

  const target =
    policy === "transit-nudges"
      ? new Set<HeatPoint["areaTag"]>(["station", "downtown"])
      : policy === "soft-restriction"
        ? new Set<HeatPoint["areaTag"]>(["odori", "susukino"])
        : new Set<HeatPoint["areaTag"]>(["downtown", "odori", "susukino"])

  const ringGainBias = policy === "route-dispersion" ? 1.15 : 1.0
  const after = baseline.map((p) => {
    const isTarget = target.has(p.areaTag)
    const reduce = isTarget ? movedFraction : -movedFraction * 0.18
    const next = clamp01(p.intensity * (1 - reduce))

    const ringBoost = p.areaTag === "ring" ? 1 + movedFraction * 0.9 * ringGainBias : 1
    const suburbBoost = p.areaTag === "suburb" ? 1 + movedFraction * 0.25 : 1
    const boosted = clamp01(next * ringBoost * suburbBoost)

    // time-dispersion also smooths extreme peaks slightly
    const peakSmoothing = policy === "time-dispersion" && isTarget ? 0.06 : 0
    return { ...p, intensity: clamp01(boosted * (1 - peakSmoothing)) }
  })

  const deltas = meshDelta(baseline, after).slice(0, 8)
  return { afterPoints: after, meshDeltas: deltas }
}

