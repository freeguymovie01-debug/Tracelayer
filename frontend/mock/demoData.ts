import type {
  DisasterReport,
  Zone,
  Facility,
  AuditLog,
  AlertRule,
  User,
  DashboardStats,
} from "@/types"

/* =========================
   USERS
========================= */

export const demoUsers: User[] = [
  { id: "u1", email: "admin@demo.com", name: "Rohit Mehra", role: "admin", avatar: "" },
  { id: "u2", email: "supervisor@demo.com", name: "Ananya Verma", role: "supervisor", avatar: "" },
  { id: "u3", email: "assessor@demo.com", name: "Arjun Singh", role: "assessor", avatar: "" },
]

/* =========================
   ZONES (Delhi NCR)
========================= */

export const demoZones: Zone[] = [
  {
    id: "z1",
    name: "Central Delhi",
    boundaries: [
      [28.635, 77.220],
      [28.640, 77.230],
      [28.630, 77.235],
      [28.625, 77.225],
    ],
    riskLevel: "critical",
    activeIncidents: 14,
  },
  {
    id: "z2",
    name: "South Delhi",
    boundaries: [
      [28.535, 77.240],
      [28.540, 77.255],
      [28.525, 77.260],
      [28.520, 77.245],
    ],
    riskLevel: "high",
    activeIncidents: 9,
  },
  {
    id: "z3",
    name: "Noida Sector Belt",
    boundaries: [
      [28.580, 77.310],
      [28.590, 77.325],
      [28.575, 77.330],
      [28.565, 77.315],
    ],
    riskLevel: "moderate",
    activeIncidents: 5,
  },
  {
    id: "z4",
    name: "Gurugram Urban",
    boundaries: [
      [28.455, 77.020],
      [28.465, 77.035],
      [28.450, 77.045],
      [28.440, 77.030],
    ],
    riskLevel: "low",
    activeIncidents: 3,
  },
]

/* =========================
   FACILITIES
========================= */

export const demoFacilities: Facility[] = [
  {
    id: "f1",
    name: "AIIMS Delhi",
    type: "hospital",
    location: {
      lat: 28.5672,
      lng: 77.2100,
      address: "Ansari Nagar, New Delhi, India",
    },
    status: "operational",
    capacity: 1200,
  },
  {
    id: "f2",
    name: "Connaught Place Fire Station",
    type: "fire_station",
    location: {
      lat: 28.6328,
      lng: 77.2197,
      address: "Connaught Place, New Delhi, India",
    },
    status: "operational",
    capacity: 40,
  },
  {
    id: "f3",
    name: "Yamuna Relief Shelter",
    type: "shelter",
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: "ITO, New Delhi, India",
    },
    status: "operational",
    capacity: 350,
  },
  {
    id: "f4",
    name: "Delhi Police HQ",
    type: "police",
    location: {
      lat: 28.6219,
      lng: 77.2167,
      address: "Rajpath Area, New Delhi, India",
    },
    status: "operational",
    capacity: 150,
  },
  {
    id: "f5",
    name: "National Disaster Command Center",
    type: "command_center",
    location: {
      lat: 28.5965,
      lng: 77.2220,
      address: "CGO Complex, Lodhi Road, New Delhi, India",
    },
    status: "operational",
    capacity: 100,
  },
]

/* =========================
   REPORT GENERATION
========================= */

const structureTypes = [
  "Residential",
  "Commercial",
  "Industrial",
  "Government",
  "Infrastructure",
  "Mixed-use",
]

const categories: DisasterReport["category"][] = [
  "structural",
  "flooding",
  "fire",
  "landslide",
  "wind",
  "earthquake",
  "infrastructure",
  "environmental",
]

const severities: DisasterReport["severity"][] = [
  "critical",
  "high",
  "moderate",
  "low",
]

const statuses: DisasterReport["status"][] = [
  "pending",
  "verified",
  "in_progress",
  "resolved",
  "dismissed",
]

const infraImpacts = [
  "Power Grid",
  "Water Supply",
  "Roads",
  "Bridges",
  "Communications",
  "Gas Lines",
  "Metro Rail",
  "Drainage Systems",
]

const reportTitles: Record<string, string[]> = {
  structural: [
    "Building Collapse in Karol Bagh",
    "Foundation Failure at Nehru Place",
    "Cracks in Government Office Block",
    "Residential Block Structural Damage",
  ],
  flooding: [
    "Waterlogging in South Delhi",
    "Yamuna Flood Impact Assessment",
    "Storm Drain Overflow Near Dwarka",
  ],
  fire: [
    "Warehouse Fire in Okhla",
    "Market Area Fire Incident",
    "Electrical Fire in Apartment Complex",
  ],
  landslide: [
    "Aravalli Hills Slope Failure",
    "Mudslide Blocking Road to Gurugram",
  ],
  wind: [
    "High Wind Roof Damage",
    "Fallen Trees Blocking Ring Road",
  ],
  earthquake: [
    "Minor Tremor Structural Assessment",
    "Seismic Damage to Flyover Pillars",
  ],
  infrastructure: [
    "Delhi Metro Service Disruption",
    "Water Pipeline Burst",
    "Power Substation Failure",
  ],
  environmental: [
    "Industrial Chemical Leak",
    "Air Quality Emergency Alert",
  ],
}

function generateReports(): DisasterReport[] {
  const reports: DisasterReport[] = []
  const baseDate = new Date("2026-02-20")

  for (let i = 0; i < 30; i++) {
    const cat = categories[i % categories.length]
    const sev = severities[Math.floor(i / 8) % 4]
    const title = reportTitles[cat][i % reportTitles[cat].length]

    const reportDate = new Date(baseDate)
    reportDate.setDate(reportDate.getDate() - Math.floor(i / 3))

    const lat = 28.45 + Math.random() * 0.25
    const lng = 77.05 + Math.random() * 0.30

    reports.push({
      id: `RPT-${String(1000 + i)}`,
      title,
      description: `Field assessment confirms ${cat} damage in ${demoZones[i % 4].name}. ${
        sev === "critical" ? "Immediate response required." : "Monitoring and assessment ongoing."
      }`,
      location: {
        lat,
        lng,
        address: `${100 + i * 7} ${
          ["MG Road", "Ring Road", "Janpath", "Dwarka Sector 6", "Karol Bagh"][i % 5]
        }, New Delhi, India`,
        zone: demoZones[i % 4].name,
      },
      severity: sev,
      status: statuses[i % 5],
      category: cat,
      structureType: structureTypes[i % structureTypes.length],
      images: [],
      aiClassification: {
        category: cat,
        severity: sev,
        confidence: 0.75 + Math.random() * 0.2,
        tags: [cat, sev],
      },
      peopleAffected: Math.floor(Math.random() * 500) + 20,
      infrastructureImpact: infraImpacts.slice(0, 1 + Math.floor(Math.random() * 3)),
      emergencyRequired: sev === "critical" || sev === "high",
      reportedBy: demoUsers[i % 3].name,
      reportedAt: reportDate.toISOString(),
      updatedAt: new Date(reportDate.getTime() + 3600000).toISOString(),
      timeline: [],
    })
  }

  return reports
}

export const demoReports: DisasterReport[] = generateReports()

/* =========================
   ALERT RULES
========================= */

export const demoAlertRules: AlertRule[] = [
  {
    id: "ar1",
    name: "Critical Severity Auto-Escalate",
    condition: "severity == critical",
    severity: "critical",
    enabled: true,
    createdBy: "Rohit Mehra",
    createdAt: "2026-01-15T10:00:00Z",
  },
]

/* =========================
   AUDIT LOGS
========================= */

export const demoAuditLogs: AuditLog[] = Array.from({ length: 15 }, (_, i) => ({
  id: `al${i + 1}`,
  action: "Report Created",
  user: demoUsers[i % 3].name,
  target: `RPT-${1000 + i}`,
  timestamp: new Date(Date.now() - i * 7200000).toISOString(),
  details: "Mock audit entry",
}))

/* =========================
   DASHBOARD STATS
========================= */

export const dashboardStats: DashboardStats = {
  totalIncidents: demoReports.length,
  criticalAlerts: demoReports.filter(r => r.severity === "critical").length,
  peopleAffected: demoReports.reduce((sum, r) => sum + r.peopleAffected, 0),
  activeZones: demoZones.filter(z => z.activeIncidents > 0).length,
  trendsIncidents: 8,
  trendsCritical: -2,
  trendsPeople: 5,
  trendsZones: 1,
}