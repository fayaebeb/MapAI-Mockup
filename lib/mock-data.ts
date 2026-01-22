export type Insight = {
  id: string
  title: string
  summary: string
  comparisons: {
    yesterday: string
    lastWeek: string
    lastYear: string
  }
}

export type HeatPoint = {
  id: string
  mesh: string
  lng: number
  lat: number
  intensity: number // 0..1
  areaTag: "downtown" | "station" | "odori" | "susukino" | "ring" | "suburb"
}

export type Hotspot = {
  id: string
  name: string
  lng: number
  lat: number
  note: string
}

export type PolicyType = "time-dispersion" | "route-dispersion" | "transit-nudges" | "soft-restriction"

export type PolicyOption = {
  id: string
  type: PolicyType
  title: string
  subtitle: string
  levers: string[]
  tradeoffs: string[]
}

export const CITY = {
  name: "Sapporo",
  center: { lng: 141.3545, lat: 43.0621 }
} as const

export const BRIEF_INSIGHTS: Insight[] = [
  {
    id: "insight-1",
    title: "Congestion concentrated in Odori / Susukino",
    summary:
      "Pedestrian density peaks between 16:30–20:30 with repeated spillover into adjacent meshes; queue formation visible near arcade entrances.",
    comparisons: {
      yesterday: "▲ +9% density in Odori core",
      lastWeek: "▲ +14% evening footfall",
      lastYear: "≈ within seasonal band (+2%)"
    }
  },
  {
    id: "insight-2",
    title: "Sudden spike near Sapporo Station",
    summary:
      "A short, sharp surge around 12:10–12:45 suggests synchronized arrivals; platform-to-mall corridor becomes the dominant bottleneck.",
    comparisons: {
      yesterday: "▲ +18% at midday corridor",
      lastWeek: "▲ +11% transfer volume",
      lastYear: "▲ +7% weekday lunchtime"
    }
  },
  {
    id: "insight-3",
    title: "Unusual dwell time increase after 18:00",
    summary:
      "Dwell-time distribution shifts right, indicating slower circulation; likely caused by dining peaks and street-level crowding near narrow crossings.",
    comparisons: {
      yesterday: "▲ +6 min median dwell",
      lastWeek: "▲ +9 min median dwell",
      lastYear: "≈ stable (+1 min)"
    }
  }
]

export const HOTSPOTS: Hotspot[] = [
  {
    id: "hs-odori",
    name: "Odori Park Core",
    lng: 141.3542,
    lat: 43.0607,
    note: "High pedestrian density; crosswalk queueing"
  },
  {
    id: "hs-susukino",
    name: "Susukino Crossing",
    lng: 141.3539,
    lat: 43.0546,
    note: "Evening nightlife surge; slow circulation"
  },
  {
    id: "hs-station",
    name: "Sapporo Station South",
    lng: 141.3509,
    lat: 43.0687,
    note: "Midday arrivals; corridor bottleneck"
  },
  {
    id: "hs-tv",
    name: "Sapporo TV Tower",
    lng: 141.3596,
    lat: 43.0615,
    note: "Tour bus clustering; short-stop spikes"
  }
]

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

export function createBaselineHeatPoints(): HeatPoint[] {
  const base: Array<Omit<HeatPoint, "id">> = [
    // Odori band
    { mesh: "A-01", lng: 141.3542, lat: 43.061, intensity: 0.82, areaTag: "odori" },
    { mesh: "A-02", lng: 141.357, lat: 43.0612, intensity: 0.78, areaTag: "odori" },
    { mesh: "A-03", lng: 141.3518, lat: 43.0604, intensity: 0.7, areaTag: "odori" },
    // Susukino cluster
    { mesh: "B-01", lng: 141.3539, lat: 43.0546, intensity: 0.84, areaTag: "susukino" },
    { mesh: "B-02", lng: 141.3562, lat: 43.0552, intensity: 0.68, areaTag: "susukino" },
    { mesh: "B-03", lng: 141.3513, lat: 43.0538, intensity: 0.62, areaTag: "susukino" },
    // Station corridor
    { mesh: "C-01", lng: 141.3509, lat: 43.0687, intensity: 0.8, areaTag: "station" },
    { mesh: "C-02", lng: 141.3493, lat: 43.0698, intensity: 0.66, areaTag: "station" },
    { mesh: "C-03", lng: 141.3522, lat: 43.0669, intensity: 0.6, areaTag: "station" },
    // Downtown connector
    { mesh: "D-01", lng: 141.3546, lat: 43.0582, intensity: 0.72, areaTag: "downtown" },
    { mesh: "D-02", lng: 141.3568, lat: 43.0588, intensity: 0.58, areaTag: "downtown" },
    { mesh: "D-03", lng: 141.3519, lat: 43.0576, intensity: 0.55, areaTag: "downtown" },
    // Ring meshes (absorption areas)
    { mesh: "R-01", lng: 141.366, lat: 43.0618, intensity: 0.28, areaTag: "ring" },
    { mesh: "R-02", lng: 141.342, lat: 43.0609, intensity: 0.24, areaTag: "ring" },
    { mesh: "R-03", lng: 141.3612, lat: 43.0526, intensity: 0.22, areaTag: "ring" },
    { mesh: "R-04", lng: 141.3478, lat: 43.0721, intensity: 0.2, areaTag: "ring" },
    // Suburb (low baseline)
    { mesh: "S-01", lng: 141.33, lat: 43.085, intensity: 0.08, areaTag: "suburb" },
    { mesh: "S-02", lng: 141.378, lat: 43.083, intensity: 0.07, areaTag: "suburb" }
  ]

  // Expand into a small deterministic “mesh” by adding offsets around each anchor.
  const offsets = [
    { dx: 0.0, dy: 0.0, k: 1.0 },
    { dx: 0.0022, dy: 0.0016, k: 0.82 },
    { dx: -0.002, dy: 0.0012, k: 0.78 },
    { dx: 0.0014, dy: -0.0017, k: 0.74 },
    { dx: -0.0016, dy: -0.0014, k: 0.7 }
  ] as const

  const points: HeatPoint[] = []
  for (const anchor of base) {
    for (let i = 0; i < offsets.length; i++) {
      const o = offsets[i]
      points.push({
        id: `${anchor.mesh}-${i}`,
        mesh: anchor.mesh,
        lng: anchor.lng + o.dx,
        lat: anchor.lat + o.dy,
        intensity: clamp01(anchor.intensity * o.k),
        areaTag: anchor.areaTag
      })
    }
  }
  return points
}

export const POLICY_OPTIONS: PolicyOption[] = [
  {
    id: "p-time",
    type: "time-dispersion",
    title: "Time dispersion: event schedule shift",
    subtitle: "Stagger arrivals by shifting key activations ±30–60 min",
    levers: ["Partnered venue time slots", "Push notifications", "Timed ticket nudges"],
    tradeoffs: ["May reduce peak vibe", "Requires partner coordination"]
  },
  {
    id: "p-route",
    type: "route-dispersion",
    title: "Route dispersion: redirect foot traffic",
    subtitle: "Actively steer pedestrians to parallel corridors",
    levers: ["Dynamic wayfinding", "Pop-up attractions", "Crosswalk timing tweaks"],
    tradeoffs: ["Risk of displacement complaints", "Signage compliance uncertainty"]
  },
  {
    id: "p-transit",
    type: "transit-nudges",
    title: "Transit nudges: promote subway transfers",
    subtitle: "Reduce surface congestion by shifting short hops to transit",
    levers: ["Fare incentives", "Station guidance staff", "Real-time crowd UI"],
    tradeoffs: ["Subway platform crowding", "Budget impact"]
  },
  {
    id: "p-soft",
    type: "soft-restriction",
    title: "Area soft restriction: signage + staff",
    subtitle: "Slow entry and manage queues at pinch points",
    levers: ["Queue lanes", "Staffed crossings", "On-site advisory signage"],
    tradeoffs: ["Perceived friction", "Operational staffing load"]
  }
]

