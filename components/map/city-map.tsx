"use client"

import { useEffect, useMemo, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { CITY, HOTSPOTS, type HeatPoint } from "@/lib/mock-data"

type Props = {
  baseline: HeatPoint[]
  after?: HeatPoint[]
  showAfter?: boolean
  showDiff?: boolean
}

function toGeoJSON(points: HeatPoint[]) {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      properties: { intensity: p.intensity, mesh: p.mesh, areaTag: p.areaTag, id: p.id },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] }
    }))
  } as const
}

function toDiffGeoJSON(baseline: HeatPoint[], after: HeatPoint[]) {
  const map = new Map<string, HeatPoint>()
  for (const p of baseline) map.set(p.id, p)
  return {
    type: "FeatureCollection",
    features: after.map((p) => {
      const b = map.get(p.id)
      const delta = b ? p.intensity - b.intensity : 0
      return {
        type: "Feature",
        properties: {
          delta,
          abs: Math.abs(delta),
          mesh: p.mesh,
          areaTag: p.areaTag
        },
        geometry: { type: "Point", coordinates: [p.lng, p.lat] }
      }
    })
  } as const
}

export function CityMap({ baseline, after, showAfter = false, showDiff = false }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)

  const baselineGeoJSON = useMemo(() => toGeoJSON(baseline), [baseline])
  const afterGeoJSON = useMemo(() => (after ? toGeoJSON(after) : undefined), [after])
  const diffGeoJSON = useMemo(() => (after ? toDiffGeoJSON(baseline, after) : undefined), [baseline, after])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [CITY.center.lng, CITY.center.lat],
      zoom: 12.2,
      pitch: 35,
      bearing: -8
    })

    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right")

    map.on("load", () => {
      map.addSource("satellite", {
        type: "raster",
        tiles: [
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ],
        tileSize: 256,
        attribution: "Tiles © Esri"
      })

      const firstSymbolLayerId = map.getStyle().layers?.find((l) => l.type === "symbol")?.id
      map.addLayer(
        {
          id: "satellite-layer",
          type: "raster",
          source: "satellite",
          paint: { "raster-opacity": 1 }
        },
        firstSymbolLayerId
      )

      map.addSource("heat-baseline", { type: "geojson", data: baselineGeoJSON as any })
      map.addLayer({
        id: "heat-baseline-layer",
        type: "heatmap",
        source: "heat-baseline",
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
          "heatmap-intensity": 1.1,
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 18, 13, 34, 16, 54],
          "heatmap-opacity": 0.9,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(56,189,248,0)",
            0.15,
            "rgba(56,189,248,0.20)",
            0.35,
            "rgba(59,130,246,0.40)",
            0.6,
            "rgba(37,99,235,0.60)",
            0.85,
            "rgba(29,78,216,0.80)",
            1,
            "rgba(30,64,175,0.95)"
          ]
        }
      })

      map.addSource("hotspots", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: HOTSPOTS.map((h) => ({
            type: "Feature",
            properties: { id: h.id, name: h.name, note: h.note },
            geometry: { type: "Point", coordinates: [h.lng, h.lat] }
          }))
        } as any
      })

      map.addLayer({
        id: "hotspots-glow",
        type: "circle",
        source: "hotspots",
        paint: {
          "circle-radius": 14,
          "circle-color": "rgba(56,189,248,0.18)"
        }
      })
      map.addLayer({
        id: "hotspots",
        type: "circle",
        source: "hotspots",
        paint: {
          "circle-radius": 7,
          "circle-color": "rgba(56,189,248,0.95)",
          "circle-stroke-width": 2,
          "circle-stroke-color": "rgba(2,6,23,0.85)"
        }
      })

      map.on("click", "hotspots", (e: any) => {
        const f = e.features?.[0]
        if (!f) return
        const coords = (f.geometry as any).coordinates as [number, number]
        const name = String((f.properties as any)?.name ?? "")
        const note = String((f.properties as any)?.note ?? "")
        new maplibregl.Popup({ closeButton: true, closeOnClick: true, className: "map-popup" })
          .setLngLat(coords)
          .setHTML(
            `<div style="font-size:12px;line-height:1.35">
              <div style="font-weight:600;margin-bottom:2px">${name}</div>
              <div style="opacity:0.75">${note}</div>
            </div>`
          )
          .addTo(map)
      })

      map.on("mouseenter", "hotspots", () => {
        map.getCanvas().style.cursor = "pointer"
      })
      map.on("mouseleave", "hotspots", () => {
        map.getCanvas().style.cursor = ""
      })
    })

    const onResize = () => map.resize()
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
      map.remove()
      mapRef.current = null
    }
  }, [baselineGeoJSON])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const src = map.getSource("heat-baseline") as any
    if (src?.setData) src.setData(baselineGeoJSON as any)
  }, [baselineGeoJSON])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!afterGeoJSON) return

    const ensureAfter = () => {
      if (!map.getSource("heat-after")) {
        map.addSource("heat-after", { type: "geojson", data: afterGeoJSON as any })
        map.addLayer({
          id: "heat-after-layer",
          type: "heatmap",
          source: "heat-after",
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
            "heatmap-intensity": 1.0,
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 18, 13, 34, 16, 54],
            "heatmap-opacity": 0.0,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(34,197,94,0)",
              0.15,
              "rgba(34,197,94,0.16)",
              0.35,
              "rgba(16,185,129,0.32)",
              0.6,
              "rgba(5,150,105,0.52)",
              0.85,
              "rgba(4,120,87,0.72)",
              1,
              "rgba(6,95,70,0.88)"
            ]
          }
        })
      } else {
        const src = map.getSource("heat-after") as any
        if (src?.setData) src.setData(afterGeoJSON as any)
      }

      if (diffGeoJSON && !map.getSource("diff")) {
        map.addSource("diff", { type: "geojson", data: diffGeoJSON as any })
        map.addLayer({
          id: "diff-layer",
          type: "circle",
          source: "diff",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "abs"], 0, 0, 0.03, 5, 0.08, 10, 0.18, 16],
            "circle-color": [
              "case",
              ["<", ["get", "delta"], 0],
              "rgba(56,189,248,0.75)",
              "rgba(245,158,11,0.75)"
            ],
            "circle-opacity": 0.0,
            "circle-stroke-width": 1,
            "circle-stroke-color": "rgba(2,6,23,0.85)"
          }
        })
      } else if (diffGeoJSON) {
        const src = map.getSource("diff") as any
        if (src?.setData) src.setData(diffGeoJSON as any)
      }
    }

    if (map.isStyleLoaded()) ensureAfter()
    else map.once("load", ensureAfter)
  }, [afterGeoJSON, diffGeoJSON])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const afterOpacity = showAfter ? 0.68 : 0.0
    const diffOpacity = showDiff ? 0.65 : 0.0
    if (map.getLayer("heat-after-layer")) map.setPaintProperty("heat-after-layer", "heatmap-opacity", afterOpacity)
    if (map.getLayer("diff-layer")) map.setPaintProperty("diff-layer", "circle-opacity", diffOpacity)
    if (map.getLayer("heat-baseline-layer")) map.setPaintProperty("heat-baseline-layer", "heatmap-opacity", showAfter ? 0.32 : 0.9)
  }, [showAfter, showDiff])

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black/20" />
}
