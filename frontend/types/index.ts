export type UserRole = "admin" | "supervisor" | "assessor"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

export type Severity = "critical" | "high" | "moderate" | "low"
<<<<<<< HEAD
export type ReportStatus = "pending" | "verified" | "rejected" | "in_progress" | "resolved" | "dismissed"
=======
export type ReportStatus = "pending" | "verified" | "in_progress" | "resolved" | "dismissed"
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
export type DamageCategory =
  | "structural"
  | "flooding"
  | "fire"
  | "landslide"
  | "wind"
  | "earthquake"
  | "infrastructure"
  | "environmental"

export interface GeoLocation {
  lat: number
  lng: number
  address: string
  zone?: string
}

export interface AIClassification {
  category: DamageCategory
  severity: Severity
  confidence: number
  tags: string[]
}

export interface DisasterReport {
  id: string
  title: string
  description: string
  location: GeoLocation
  severity: Severity
  status: ReportStatus
  category: DamageCategory
  structureType: string
  images: string[]
<<<<<<< HEAD
  photoUrl?: string
=======
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  aiClassification: AIClassification
  peopleAffected: number
  infrastructureImpact: string[]
  emergencyRequired: boolean
  reportedBy: string
  reportedAt: string
  updatedAt: string
  timeline: TimelineEvent[]
}

export interface TimelineEvent {
  id: string
  action: string
  user: string
  timestamp: string
  details?: string
}

export interface Zone {
  id: string
  name: string
  boundaries: [number, number][]
  riskLevel: Severity
  activeIncidents: number
}

export interface Facility {
  id: string
  name: string
  type: "hospital" | "fire_station" | "police" | "shelter" | "command_center"
  location: GeoLocation
  status: "operational" | "limited" | "offline"
  capacity?: number
}

export interface AlertRule {
  id: string
  name: string
  condition: string
  severity: Severity
  enabled: boolean
  createdBy: string
  createdAt: string
}

export interface AuditLog {
  id: string
  action: string
  user: string
  target: string
  timestamp: string
  details: string
}

export interface DashboardStats {
  totalIncidents: number
  criticalAlerts: number
  peopleAffected: number
  activeZones: number
  trendsIncidents: number
  trendsCritical: number
  trendsPeople: number
  trendsZones: number
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}
