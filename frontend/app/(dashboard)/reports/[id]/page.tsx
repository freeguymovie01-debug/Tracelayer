"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft, MapPin, Users, AlertTriangle, Building2,
<<<<<<< HEAD
  Clock, CheckCircle2, Zap, Shield, Activity, Download, FileText
=======
  Clock, CheckCircle2, Zap, Shield, Activity,
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { DisasterReport, ReportStatus } from "@/types"
import { toast } from "sonner"

const severityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  moderate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  low: "bg-success/10 text-success border-success/20",
}

const severityMeter: Record<string, number> = { critical: 100, high: 75, moderate: 50, low: 25 }

<<<<<<< HEAD
const statusSteps = ["pending", "rejected", "verified"]
=======
const statusSteps = ["pending", "verified", "in_progress", "resolved"]
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, hasRole } = useAuth()
  const [report, setReport] = useState<DisasterReport | null>(null)
  const [loading, setLoading] = useState(true)

<<<<<<< HEAD
  const [isEditing, setIsEditing] = useState(false)
  const [editNotes, setEditNotes] = useState("")
  const [editPeople, setEditPeople] = useState(0)
  const [saving, setSaving] = useState(false)

  const isAssessor = user?.role === "assessor"

=======
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  useEffect(() => {
    async function load() {
      const id = params.id as string
      const r = await api.getReport(id)
      setReport(r)
      setLoading(false)
    }
    load()
  }, [params.id])

<<<<<<< HEAD
  const startEdit = () => {
    setEditNotes(report?.description || "")
    setEditPeople(report?.peopleAffected || 0)
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!report || !user) return
    setSaving(true)
    try {
      const token = sessionStorage.getItem("disaster_token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/assessments/${report.id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes, peopleAffected: editPeople })
      })
      if (res.ok) {
        toast.success("Fixes submitted", { description: "Report re-queued for verification" })
        setReport({ ...report, description: editNotes, peopleAffected: editPeople, status: "pending" })
        setIsEditing(false)
      } else {
        toast.error("Failed to update report")
      }
    } catch {
      toast.error("Network error")
    }
    setSaving(false)
  }

=======
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  const handleStatusChange = async (newStatus: ReportStatus) => {
    if (!report || !user) return
    const updated = await api.updateReportStatus(report.id, newStatus, user.name)
    if (updated) {
<<<<<<< HEAD
      setReport({ ...report, status: newStatus })
=======
      setReport(updated)
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
      toast.success("Status updated", { description: `Changed to ${newStatus.replace("_", " ")}` })
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Report not found</h2>
          <Button variant="outline" onClick={() => router.push("/reports")}>Back to Reports</Button>
        </div>
      </div>
    )
  }

<<<<<<< HEAD
  const currentStep = statusSteps.indexOf(report.status?.toLowerCase() || "pending")
=======
  const currentStep = statusSteps.indexOf(report.status)
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 mt-0.5" onClick={() => router.push("/reports")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to reports</span>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-foreground">{report.title}</h1>
              <Badge variant="outline" className={cn("text-[10px] capitalize", severityStyles[report.severity])}>
                {report.severity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">{report.id}</p>
          </div>
        </div>

<<<<<<< HEAD
        <div className="flex items-center gap-3">
          {hasRole(["admin", "supervisor"]) && (
            <Select value={report.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="rejected">Flagged (Requires Assessor Fixes)</SelectItem>
                <SelectItem value="verified">Verified (Sent to Officials)</SelectItem>
              </SelectContent>
            </Select>
          )}
          {hasRole(["admin", "supervisor"]) && (
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
          )}
        </div>
=======
        {hasRole(["admin", "supervisor"]) && (
          <Select value={report.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        )}
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
      </div>

      {/* Status workflow */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {statusSteps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2 transition-all",
                  i <= currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted text-muted-foreground"
                )}>
                  {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn("text-xs font-medium capitalize hidden sm:block", i <= currentStep ? "text-foreground" : "text-muted-foreground")}>
<<<<<<< HEAD
                  {s === "rejected" ? "Flagged" : s}
=======
                  {s.replace("_", " ")}
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
                </span>
                {i < statusSteps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 rounded", i < currentStep ? "bg-primary" : "bg-muted")} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
<<<<<<< HEAD

          {/* Photo Documentation */}
          {report.photoUrl && (
            <Card className="glass-card overflow-hidden">
              <div className="relative w-full h-[300px] sm:h-[400px] bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.photoUrl}
                  alt="Assessment Photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  {report.aiClassification.confidence < 0.60 && (
                    <Badge variant="destructive" className="bg-destructive/90 text-white border-none shadow-sm gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Low Confidence — Manual Review Recommended
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          )}

          <Card className="glass-card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold mt-1">Report Details</CardTitle>
              {isAssessor && report.status.toLowerCase() === "rejected" && !isEditing && (
                <Button variant="outline" size="sm" onClick={startEdit} className="h-7 text-xs gap-1">
                  <FileText className="h-3 w-3" /> Fix & Resubmit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-3 bg-muted/20 p-3 rounded-xl border border-border">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-semibold mb-1 block">Correction Notes</label>
                    <textarea
                      className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-semibold mb-1 block">People Affected</label>
                    <input
                      type="number"
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={editPeople}
                      onChange={(e) => setEditPeople(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveEdit} disabled={saving}>{saving ? "Saving..." : "Submit Fixes"}</Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Location</p>
                        <p className="text-xs font-medium">{report.location.zone} ({report.location.lat?.toFixed(4)}, {report.location.lng?.toFixed(4)})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Structure</p>
                        <p className="text-xs font-medium">{report.structureType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Category</p>
                        <p className="text-xs font-medium capitalize">{report.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">People Affected</p>
                        <p className="text-xs font-medium">{report.peopleAffected.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
=======
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Location</p>
                    <p className="text-xs font-medium">{report.location.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Structure</p>
                    <p className="text-xs font-medium">{report.structureType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Category</p>
                    <p className="text-xs font-medium capitalize">{report.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">People Affected</p>
                    <p className="text-xs font-medium">{report.peopleAffected.toLocaleString()}</p>
                  </div>
                </div>
              </div>
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
            </CardContent>
          </Card>

          {/* Severity meter */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Severity Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Severity Level</span>
                  <Badge variant="outline" className={cn("text-[10px] capitalize", severityStyles[report.severity])}>
                    {report.severity}
                  </Badge>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      report.severity === "critical" ? "bg-destructive" :
<<<<<<< HEAD
                        report.severity === "high" ? "bg-orange-500" :
                          report.severity === "moderate" ? "bg-yellow-500" : "bg-success"
=======
                      report.severity === "high" ? "bg-orange-500" :
                      report.severity === "moderate" ? "bg-yellow-500" : "bg-success"
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
                    )}
                    style={{ width: `${severityMeter[report.severity]}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Low</span><span>Moderate</span><span>High</span><span>Critical</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure impact */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Infrastructure Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
<<<<<<< HEAD
                {report.infrastructureImpact.length > 0 ? (
                  report.infrastructureImpact.map((inf) => (
                    <Badge key={inf} variant="secondary" className="text-xs">{inf}</Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">Minimal/No Impact</Badge>
                )}
=======
                {report.infrastructureImpact.map((inf) => (
                  <Badge key={inf} variant="secondary" className="text-xs">{inf}</Badge>
                ))}
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
              </div>
              {report.emergencyRequired && (
                <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-xs font-medium text-destructive">Emergency Response Required</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Classification */}
          <Card className="glass-card border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> AI Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Category</span>
                <Badge variant="secondary" className="text-[10px] capitalize">{report.aiClassification.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Severity</span>
                <Badge variant="secondary" className="text-[10px] capitalize">{report.aiClassification.severity}</Badge>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Confidence</span>
                  <span className="text-xs font-semibold text-primary">
                    {(report.aiClassification.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={report.aiClassification.confidence * 100} className="h-1.5" />
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {report.aiClassification.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[9px] capitalize">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* People affected */}
          <Card className="glass-card">
            <CardContent className="p-5 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{report.peopleAffected.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">People Affected</p>
            </CardContent>
          </Card>

          {/* Meta */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Reported By", value: report.reportedBy, icon: Shield },
                { label: "Reported At", value: new Date(report.reportedAt).toLocaleString(), icon: Clock },
                { label: "Last Updated", value: new Date(report.updatedAt).toLocaleString(), icon: Activity },
                { label: "Zone", value: report.location.zone || "Unassigned", icon: MapPin },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.timeline.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "h-2 w-2 rounded-full mt-1.5",
                        i === 0 ? "bg-primary" : "bg-muted-foreground/30"
                      )} />
                      {i < report.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium text-foreground">{event.action}</p>
                      <p className="text-[10px] text-muted-foreground">{event.user}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.details && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{event.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
