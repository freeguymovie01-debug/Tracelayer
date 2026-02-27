"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Filter,
  X,
  MapPin,
  AlertTriangle,
  Users,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { DisasterReport, Facility } from "@/types"
import type L from "leaflet"
import Link from "next/link"

const severityColor: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  moderate: "#eab308",
  low: "#22c55e",
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markersRef = useRef<L.CircleMarker[]>([])
  const facilityMarkersRef = useRef<L.Marker[]>([])

  const [reports, setReports] = useState<DisasterReport[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selected, setSelected] = useState<DisasterReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showFacilities, setShowFacilities] = useState(true)

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    async function load() {
      const [r, f] = await Promise.all([
        api.getReports({ limit: 30 }),
        api.getFacilities(),
      ])
      setReports(r.data)
      setFacilities(f)
      setLoading(false)
    }
    load()
  }, [])

  /* =========================
     RENDER REPORT MARKERS
  ========================= */

  const renderMarkers = useCallback(async () => {
    if (!mapInstance.current) return
    const L = (await import("leaflet")).default

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    reports.forEach((report) => {
      const color = severityColor[report.severity] || "#6366f1"

      const marker = L.circleMarker(
        [report.location.lat, report.location.lng],
        {
          radius:
            report.severity === "critical"
              ? 10
              : report.severity === "high"
              ? 8
              : 6,
          fillColor: color,
          color: "white",
          weight: 2,
          fillOpacity: 0.8,
        }
      ).addTo(mapInstance.current!)

      marker.on("click", () => setSelected(report))
      marker.bindTooltip(`${report.id}: ${report.title}`, {
        direction: "top",
        offset: [0, -8],
      })

      markersRef.current.push(marker)
    })
  }, [reports])

  /* =========================
     RENDER FACILITIES
  ========================= */

  const renderFacilities = useCallback(async () => {
    if (!mapInstance.current) return
    const L = (await import("leaflet")).default

    facilityMarkersRef.current.forEach((m) => m.remove())
    facilityMarkersRef.current = []

    if (!showFacilities) return

    facilities.forEach((f) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:white;border-radius:8px;padding:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
          <span style="font-size:14px;">${
            f.type === "hospital"
              ? "H"
              : f.type === "fire_station"
              ? "F"
              : f.type === "police"
              ? "P"
              : f.type === "shelter"
              ? "S"
              : "C"
          }</span>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      const marker = L.marker([f.location.lat, f.location.lng], {
        icon,
      }).addTo(mapInstance.current!)

      marker.bindTooltip(`${f.name} (${f.type.replace("_", " ")})`, {
        direction: "top",
      })

      facilityMarkersRef.current.push(marker)
    })
  }, [facilities, showFacilities])

  /* =========================
     INIT MAP
  ========================= */

  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current) return

    async function init() {
      const L = (await import("leaflet")).default

      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
      })

      L.control.zoom({ position: "bottomright" }).addTo(map)

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map)

      mapInstance.current = map
    }

    init()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [loading])

  /* =========================
     AUTO-FIT TO REPORTS
  ========================= */

  useEffect(() => {
    if (!mapInstance.current || reports.length === 0) return

    import("leaflet").then((LModule) => {
      const L = LModule.default
      const bounds = L.latLngBounds(
        reports.map((r) => [r.location.lat, r.location.lng])
      )
      mapInstance.current!.fitBounds(bounds, { padding: [40, 40] })
    })
  }, [reports])

  useEffect(() => {
    if (mapInstance.current) renderMarkers()
  }, [renderMarkers])

  useEffect(() => {
    if (mapInstance.current) renderFacilities()
  }, [renderFacilities])

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="h-full p-4">
        <Skeleton className="w-full h-full rounded-xl" />
      </div>
    )
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="flex h-[calc(100vh-3.5rem)] relative overflow-hidden">
      <div
        className={cn(
          "absolute lg:relative z-20 h-full bg-card border-r transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden border-0"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Filters</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />

        {selected && (
          <div className="absolute top-3 right-3 z-10 w-72 bg-card border rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-xs capitalize">
                {selected.severity}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelected(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <h3 className="text-sm font-semibold mb-1">
              {selected.title}
            </h3>

            <div className="space-y-2 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {selected.location.address}
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                {selected.category}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                {selected.peopleAffected} people affected
              </div>
            </div>

            <Button size="sm" className="w-full text-xs" asChild>
              <Link href={`/reports/${selected.id}`}>
                View Full Report
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}