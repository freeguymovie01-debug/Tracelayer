import type {
  DisasterReport,
  Zone,
  Facility,
  AuditLog,
  AlertRule,
  User,
  DashboardStats,
  ReportStatus,
} from "@/types"
<<<<<<< HEAD

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

/**
 * Generic fetch wrapper that adds Authorization header
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("disaster_token") : null
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // To match typical fetch behavior, we can parse JSON if needed
  // Some endpoints might return 204 No Content
  if (response.status === 204) return null

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "")
    throw new Error(`API Error: ${response.status} ${errorBody}`)
  }

  return response.json()
}
=======
import {
  demoReports,
  demoZones,
  demoFacilities,
  demoAuditLogs,
  demoAlertRules,
  demoUsers,
  dashboardStats,
} from "@/mock/demoData"

// Simulated network delay
const delay = (ms: number = 300) => new Promise((r) => setTimeout(r, ms + Math.random() * 200))

// In-memory store (mutable copy for demo)
let reports = [...demoReports]
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5

export const api = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
<<<<<<< HEAD
    const data = await fetchAPI("/analytics/summary")

    // Calculate basic trend percentages
    const prev = data?.trend?.previous24h || 0
    const curr = data?.trend?.last24h || 0
    const trendsIncidents = prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)

    return {
      totalIncidents: data?.totalAssessments || 0,
      criticalAlerts: data?.recentAlerts || 0,
      peopleAffected: (data?.totalAssessments || 0) * 15, // Using a scaled multiplier as peopleAffected isn't in overview
      activeZones: data?.top5CriticalZones?.length || 0,
      trendsIncidents,
      trendsCritical: trendsIncidents, // Borrowing incident trend
      trendsPeople: trendsIncidents,
      trendsZones: 0
    }
=======
    await delay(400)
    const current = {
      ...dashboardStats,
      totalIncidents: reports.length,
      criticalAlerts: reports.filter((r) => r.severity === "critical").length,
      peopleAffected: reports.reduce((s, r) => s + r.peopleAffected, 0),
    }
    return current
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  },

  // Reports
  async getReports(filters?: {
    severity?: string
    status?: string
    category?: string
    search?: string
    page?: number
    limit?: number
<<<<<<< HEAD
    zone?: string
  }): Promise<{ data: DisasterReport[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams()
    if (filters?.page) query.append("page", filters.page.toString())
    if (filters?.limit) query.append("limit", filters.limit.toString())
    if (filters?.severity) query.append("severity", filters.severity)
    if (filters?.status) query.append("status", filters.status)
    if (filters?.zone) query.append("zone", filters.zone)
    // category and search aren't explicitly in API_CONTRACTS for GET /assessments, but adding them as params
    if (filters?.category) query.append("category", filters.category)
    if (filters?.search) query.append("search", filters.search)

    const res = await fetchAPI(`/assessments?${query.toString()}`)

    // Map backend Prisma objects to frontend DisasterReport expectations
    const mappedData = res.data.map((item: any) => ({
      ...item,
      id: item.id,
      title: item.damageType ? `${item.damageType} Report` : `Report ${item.id.slice(0, 8)}`,
      severity: item.severityScore >= 80 ? 'critical' : item.severityScore >= 60 ? 'high' : item.severityScore >= 35 ? 'moderate' : 'low',
      location: {
        lat: item.lat,
        lng: item.lng,
        zone: item.zone?.name || "Unknown Zone",
      },
      category: item.damageType?.toLowerCase() || 'infrastructure',
      photoUrl: item.photoUrl ? (item.photoUrl.startsWith('http') ? item.photoUrl : `${API_URL}${item.photoUrl}`) : null,
      peopleAffected: item.peopleAffected ?? item.personsDamage ?? 0,
      infrastructureImpact: item.infraDamage > 0 ? ['Infrastructure Damage'] : [],
      emergencyRequired: item.severityScore >= 80,
      aiClassification: { category: item.damageType?.toLowerCase() || 'infrastructure', severity: item.severityScore >= 80 ? 'critical' : item.severityScore >= 60 ? 'high' : item.severityScore >= 35 ? 'moderate' : 'low', confidence: item.aiConfidence ?? 1.0, tags: [] },
      timeline: [{ id: "1", action: "Report created", user: item.user?.name || "System", timestamp: item.createdAt }],
      reportedBy: item.user?.name || item.user?.email || "Unknown",
      reportedAt: item.createdAt,
      updatedAt: item.updatedAt || item.createdAt,
    }))

    return { ...res, data: mappedData }
  },

  async getReport(id: string): Promise<DisasterReport | null> {
    try {
      const item = await fetchAPI(`/assessments/${id}`)
      if (!item) return null

      // Map backend Prisma object single view
      return {
        ...item,
        id: item.id,
        title: item.damageType ? `${item.damageType} Report` : `Report ${item.id.slice(0, 8)}`,
        severity: item.severityScore >= 80 ? 'critical' : item.severityScore >= 60 ? 'high' : item.severityScore >= 35 ? 'moderate' : 'low',
        location: {
          lat: item.lat,
          lng: item.lng,
          zone: item.zone?.name || "Unknown Zone",
        },
        category: item.damageType?.toLowerCase() || 'infrastructure',
        photoUrl: item.photoUrl ? (item.photoUrl.startsWith('http') ? item.photoUrl : `${API_URL}${item.photoUrl}`) : null,
        peopleAffected: item.peopleAffected ?? item.personsDamage ?? 0,
        infrastructureImpact: item.infraDamage > 0 ? ['Infrastructure Damage'] : [],
        emergencyRequired: item.severityScore >= 80,
        aiClassification: { category: item.damageType?.toLowerCase() || 'infrastructure', severity: item.severityScore >= 80 ? 'critical' : item.severityScore >= 60 ? 'high' : item.severityScore >= 35 ? 'moderate' : 'low', confidence: item.aiConfidence ?? 1.0, tags: [] },
        timeline: [{ id: "1", action: "Report created", user: item.user?.name || "System", timestamp: item.createdAt }],
        reportedBy: item.user?.name || item.user?.email || "Unknown",
        reportedAt: item.createdAt,
        updatedAt: item.updatedAt || item.createdAt,
      } as DisasterReport
    } catch {
      return null
    }
  },

  async createReport(report: any): Promise<DisasterReport> {
    return fetchAPI("/assessments", {
      method: "POST",
      body: JSON.stringify(report)
    })
  },

  async updateReportStatus(id: string, status: ReportStatus | string, user: string): Promise<DisasterReport | null> {
    try {
      // In API_CONTRACTS: PATCH /assessments/:id/verify
      const endpoint = (status === "verified" || status === "rejected" || status === "REJECTED" || status === "VERIFIED") ? `/assessments/${id}/verify` : `/assessments/${id}`
      return fetchAPI(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ status: status.toString().toUpperCase() })
      })
    } catch {
      return null
    }
  },

  // Users & Auth
  async login(email: string, password: string = "password123"): Promise<User | null> {
    try {
      const data = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      })
      // The backend returns { token, user: { ... } }
      if (data && data.token) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("disaster_token", data.token)
        }
        return data.user
      }
      return null
    } catch (err) {
      console.error("Login failed", err)
      return null
    }
  },

  async getMe(): Promise<User | null> {
    try {
      return fetchAPI("/auth/me")
    } catch {
      return null
    }
=======
  }): Promise<{ data: DisasterReport[]; total: number }> {
    await delay(350)
    let filtered = [...reports]
    if (filters?.severity) filtered = filtered.filter((r) => r.severity === filters.severity)
    if (filters?.status) filtered = filtered.filter((r) => r.status === filters.status)
    if (filters?.category) filtered = filtered.filter((r) => r.category === filters.category)
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.location.address.toLowerCase().includes(q)
      )
    }
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const start = (page - 1) * limit
    return { data: filtered.slice(start, start + limit), total: filtered.length }
  },

  async getReport(id: string): Promise<DisasterReport | null> {
    await delay(250)
    return reports.find((r) => r.id === id) || null
  },

  async createReport(report: Omit<DisasterReport, "id" | "reportedAt" | "updatedAt" | "timeline" | "aiClassification">): Promise<DisasterReport> {
    await delay(600)
    const newReport: DisasterReport = {
      ...report,
      id: `RPT-${2000 + reports.length}`,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiClassification: {
        category: report.category,
        severity: report.severity,
        confidence: 0.85 + Math.random() * 0.13,
        tags: [report.category, report.severity, report.structureType.toLowerCase()],
      },
      timeline: [
        { id: `t-new-1`, action: "Report Created", user: report.reportedBy, timestamp: new Date().toISOString(), details: "Initial field assessment submitted" },
        { id: `t-new-2`, action: "AI Classification", user: "System", timestamp: new Date().toISOString(), details: `Auto-classified as ${report.severity} ${report.category}` },
      ],
    }
    reports = [newReport, ...reports]
    return newReport
  },

  async updateReportStatus(id: string, status: ReportStatus, user: string): Promise<DisasterReport | null> {
    await delay(300)
    const idx = reports.findIndex((r) => r.id === id)
    if (idx === -1) return null
    reports[idx] = {
      ...reports[idx],
      status,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...reports[idx].timeline,
        { id: `t-${Date.now()}`, action: "Status Updated", user, timestamp: new Date().toISOString(), details: `Status changed to ${status}` },
      ],
    }
    return reports[idx]
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  },

  // Zones
  async getZones(): Promise<Zone[]> {
<<<<<<< HEAD
    // Currently no explicit endpoint in API contracts, returning mock or empty for now
    return []
=======
    await delay(200)
    return demoZones
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  },

  // Facilities
  async getFacilities(): Promise<Facility[]> {
<<<<<<< HEAD
    return []
=======
    await delay(200)
    return demoFacilities
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  },

  // Users
  async getUsers(): Promise<User[]> {
<<<<<<< HEAD
    return []
=======
    await delay(200)
    return demoUsers
  },

  async login(email: string): Promise<User | null> {
    await delay(500)
    return demoUsers.find((u) => u.email === email) || null
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  },

  // Alert Rules
  async getAlertRules(): Promise<AlertRule[]> {
<<<<<<< HEAD
    return []
=======
    await delay(200)
    return demoAlertRules
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
<<<<<<< HEAD
    return []
=======
    await delay(200)
    return demoAuditLogs
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  },

  // Analytics aggregations
  async getAnalytics(): Promise<{
    incidentsByDay: { date: string; count: number }[]
    severityDistribution: { name: string; value: number }[]
    categoryDistribution: { name: string; value: number }[]
    infraImpact: { name: string; value: number }[]
    zoneComparison: { zone: string; critical: number; high: number; moderate: number; low: number }[]
  }> {
<<<<<<< HEAD
    try {
      const data = await fetchAPI("/analytics/summary")

      // Transform backend response to frontend chart expectations
      return {
        incidentsByDay: [
          { date: new Date(Date.now() - 86400000 * 2).toISOString(), count: Math.floor((data?.trend?.previous24h || 0) / 2) },
          { date: new Date(Date.now() - 86400000).toISOString(), count: data?.trend?.previous24h || 0 },
          { date: new Date().toISOString(), count: data?.trend?.last24h || 0 }
        ],
        severityDistribution: data?.severityBreakdown ? Object.entries(data.severityBreakdown).map(([name, value]) => ({
          name: name === 'medium' ? 'moderate' : name.toLowerCase(),
          value: Number(value)
        })) : [],
        categoryDistribution: [
          { name: "Structural", value: data?.totalAssessments * 0.4 || 0 },
          { name: "Flooding", value: data?.totalAssessments * 0.3 || 0 },
          { name: "Infrastructure", value: data?.totalAssessments * 0.3 || 0 }
        ],
        infraImpact: [
          { name: "Power Grid", value: 40 },
          { name: "Roads", value: 35 },
          { name: "Water Supply", value: 25 }
        ],
        zoneComparison: data?.top5CriticalZones ? data.top5CriticalZones.map((z: any) => ({
          zone: z.zoneName,
          critical: z.avgSeverity >= 80 ? z.count : 0,
          high: z.avgSeverity >= 60 && z.avgSeverity < 80 ? z.count : 0,
          moderate: z.avgSeverity >= 35 && z.avgSeverity < 60 ? z.count : 0,
          low: z.avgSeverity < 35 ? z.count : 0,
        })) : [],
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
      // Return empty structures if the endpoint fails
      return {
        incidentsByDay: [],
        severityDistribution: [],
        categoryDistribution: [],
        infraImpact: [],
        zoneComparison: [],
      }
=======
    await delay(400)

    const dayMap: Record<string, number> = {}
    const sevMap: Record<string, number> = { critical: 0, high: 0, moderate: 0, low: 0 }
    const catMap: Record<string, number> = {}
    const infraMap: Record<string, number> = {}
    const zoneMap: Record<string, Record<string, number>> = {}

    reports.forEach((r) => {
      const day = r.reportedAt.split("T")[0]
      dayMap[day] = (dayMap[day] || 0) + 1
      sevMap[r.severity]++
      catMap[r.category] = (catMap[r.category] || 0) + 1
      r.infrastructureImpact.forEach((inf) => {
        infraMap[inf] = (infraMap[inf] || 0) + 1
      })
      const zone = r.location.zone || "Unknown"
      if (!zoneMap[zone]) zoneMap[zone] = { critical: 0, high: 0, moderate: 0, low: 0 }
      zoneMap[zone][r.severity]++
    })

    return {
      incidentsByDay: Object.entries(dayMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      severityDistribution: Object.entries(sevMap).map(([name, value]) => ({ name, value })),
      categoryDistribution: Object.entries(catMap).map(([name, value]) => ({ name, value })),
      infraImpact: Object.entries(infraMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      zoneComparison: Object.entries(zoneMap).map(([zone, data]) => ({ zone, ...data })),
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
    }
  },
}
