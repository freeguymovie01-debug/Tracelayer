"use client"

<<<<<<< HEAD
import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { useSocket } from "@/hooks/useSocket"
=======
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
import { KPICard } from "@/components/kpi-card"
import { SeverityDistributionChart, IncidentTrendChart, CategoryDistributionChart, InfraImpactChart } from "@/components/charts/dashboard-charts"
import { RecentReportsTable } from "@/components/recent-reports-table"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Activity, Users, MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import type { DashboardStats, DisasterReport } from "@/types"

const DashboardMap = dynamic(() => import("@/components/map/dashboard-map").then(m => m.DashboardMap), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-xl" />,
})

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [reports, setReports] = useState<DisasterReport[]>([])
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof api.getAnalytics>> | null>(null)
  const [loading, setLoading] = useState(true)

<<<<<<< HEAD
  const load = useCallback(async () => {
    const [s, r, a] = await Promise.all([
      api.getDashboardStats(),
      api.getReports({ limit: 8 }),
      api.getAnalytics(),
    ])
    setStats(s)
    setReports(r.data)
    setAnalytics(a)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleUpdate = () => {
      load()
    }

    socket.on("newAssessment", handleUpdate)
    socket.on("alertFired", handleUpdate)
    socket.on("mapUpdate", handleUpdate)

    return () => {
      socket.off("newAssessment", handleUpdate)
      socket.off("alertFired", handleUpdate)
      socket.off("mapUpdate", handleUpdate)
    }
  }, [socket, load])
=======
  useEffect(() => {
    async function load() {
      const [s, r, a] = await Promise.all([
        api.getDashboardStats(),
        api.getReports({ limit: 8 }),
        api.getAnalytics(),
      ])
      setStats(s)
      setReports(r.data)
      setAnalytics(a)
      setLoading(false)
    }
    load()
  }, [])
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5

  if (loading || !stats || !analytics) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[130px] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Skeleton className="lg:col-span-3 h-[420px] rounded-xl" />
          <Skeleton className="lg:col-span-2 h-[420px] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Incidents"
          value={stats.totalIncidents}
          trend={stats.trendsIncidents}
          icon={Activity}
          color="primary"
        />
        <KPICard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          trend={stats.trendsCritical}
          icon={AlertTriangle}
          color="critical"
        />
        <KPICard
          title="People Affected"
          value={stats.peopleAffected}
          trend={stats.trendsPeople}
          icon={Users}
          color="warning"
          format="compact"
        />
        <KPICard
          title="Active Zones"
          value={stats.activeZones}
          trend={stats.trendsZones}
          icon={MapPin}
          color="success"
        />
      </div>

      {/* Map + Intel Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Live Map */}
        <div className="lg:col-span-3 h-[420px] rounded-xl overflow-hidden border border-border">
          <DashboardMap reports={reports} />
        </div>

        {/* Intelligence Panel */}
        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
          <SeverityDistributionChart data={analytics.severityDistribution} />
          <IncidentTrendChart data={analytics.incidentsByDay} />
        </div>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryDistributionChart data={analytics.categoryDistribution} />
        <InfraImpactChart data={analytics.infraImpact} />
      </div>

      {/* Recent Reports */}
      <RecentReportsTable reports={reports} />
    </div>
  )
}
