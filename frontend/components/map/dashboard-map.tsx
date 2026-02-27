"use client"

import { useEffect, useRef, useState } from "react"
import type { DisasterReport } from "@/types"
import type L from "leaflet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, MapPin, AlertTriangle, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const severityColor: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  moderate: "#eab308",
  low: "#22c55e",
}

interface Props {
  reports: DisasterReport[]
  height?: string
}

export function DashboardMap({ reports, height = "100%" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [selected, setSelected] = useState<DisasterReport | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    let cancelled = false

    async function init() {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      if (cancelled || !mapRef.current) return

      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
      }).setView([22.9734, 78.6569], 5) // India center

      L.control.zoom({ position: "bottomright" }).addTo(map)

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map)

      reports.forEach((report) => {
        const color = severityColor[report.severity] || "#6366f1"
        const marker = L.circleMarker([report.location.lat, report.location.lng], {
          radius: report.severity === "critical" ? 10 : report.severity === "high" ? 8 : 6,
          fillColor: color,
          color: "white",
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.8,
        }).addTo(map)

        marker.on("click", () => {
          setSelected(report)
        })

        marker.bindTooltip(report.id, {
          direction: "top",
          offset: [0, -8],
          className: "leaflet-tooltip-custom",
        })
      })

      mapInstanceRef.current = map
      setReady(true)
    }

    init()

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [reports])

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Legend */}
      {ready && (
        <div className="absolute top-3 left-3 z-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border p-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Severity</p>
          {Object.entries(severityColor).map(([level, color]) => (
            <div key={level} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[11px] text-foreground capitalize">{level}</span>
            </div>
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="absolute top-0 right-0 z-10 w-72 h-full bg-card/95 backdrop-blur-sm border-l border-border p-4 overflow-y-auto animate-in slide-in-from-right-5 duration-300">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className={cn(
              "text-[10px] capitalize",
              selected.severity === "critical" ? "border-destructive/30 text-destructive" :
              selected.severity === "high" ? "border-orange-500/30 text-orange-600" :
              "border-muted"
            )}>
              {selected.severity}
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(null)}>
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Close panel</span>
            </Button>
          </div>

          <h3 className="text-sm font-semibold text-foreground mb-1">{selected.title}</h3>
          <p className="text-xs text-muted-foreground mb-4">{selected.id}</p>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{selected.location.address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground capitalize">{selected.category}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{selected.peopleAffected} people affected</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">{selected.description}</p>

          <Button size="sm" className="w-full mt-4 text-xs" asChild>
            <Link href={`/reports/${selected.id}`}>View Full Report</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
