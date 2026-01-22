# MAPAI Tourism (Sapporo Edition) — Mock App

High-fidelity, interactive single-page mock for a “City Simulation OS” overtourism workflow:
Pulse → Brief → Reverse Chat → Analysis Mode (Map) → Policy Cards → Simulation → Decision Trace export.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Tech

- Next.js (React + TypeScript)
- Tailwind CSS + shadcn/ui-style components (`components/ui/*`)
- Zustand global state (`lib/store.ts`)
- Framer Motion transitions + pulse blob (`components/steps/pulse-step.tsx`)
- MapLibre GL JS heatmap + overlays (`components/map/city-map.tsx`)

