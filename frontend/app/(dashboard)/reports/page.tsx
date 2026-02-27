"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
<<<<<<< HEAD
import { useSocket } from "@/hooks/useSocket"
=======
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search, Filter, Download, ExternalLink, Plus, ChevronLeft, ChevronRight,
  SlidersHorizontal, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { DisasterReport } from "@/types"
import { toast } from "sonner"

const severityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  moderate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  low: "bg-success/10 text-success border-success/20",
}

const statusStyles: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  verified: "bg-primary/10 text-primary",
<<<<<<< HEAD
  rejected: "bg-destructive/10 text-destructive",
=======
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  in_progress: "bg-warning/15 text-warning-foreground",
  resolved: "bg-success/10 text-success",
  dismissed: "bg-muted text-muted-foreground line-through",
}

export default function ReportsPage() {
  const { hasRole } = useAuth()
  const [reports, setReports] = useState<DisasterReport[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sevFilter, setSevFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [catFilter, setCatFilter] = useState("all")
  const [selected, setSelected] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const limit = 10

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const res = await api.getReports({
      page,
      limit,
      search: search || undefined,
      severity: sevFilter !== "all" ? sevFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      category: catFilter !== "all" ? catFilter : undefined,
    })
    setReports(res.data)
    setTotal(res.total)
    setLoading(false)
  }, [page, search, sevFilter, statusFilter, catFilter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

<<<<<<< HEAD
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleNewAssessment = () => {
      toast.info("New report received, refreshing list...")
      fetchReports()
    }

    const handleAlert = (alertData: any) => {
      toast.warning("Critical Alert Fired!", { description: alertData.message })
      fetchReports()
    }

    socket.on("newAssessment", handleNewAssessment)
    socket.on("alertFired", handleAlert)

    return () => {
      socket.off("newAssessment", handleNewAssessment)
      socket.off("alertFired", handleAlert)
    }
  }, [socket, fetchReports])

=======
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  const totalPages = Math.ceil(total / limit)

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
  }

  const selectAll = () => {
    if (selected.length === reports.length) {
      setSelected([])
    } else {
      setSelected(reports.map((r) => r.id))
    }
  }

  const exportCSV = () => {
    toast.success("Export started", { description: "CSV file will download shortly." })
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Reports</h2>
          <p className="text-sm text-muted-foreground">{total} total reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" asChild>
            <Link href="/report"><Plus className="h-3.5 w-3.5" /> New Report</Link>
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="glass-card">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports by ID, title, or location..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              className="gap-1.5 text-xs shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              {(sevFilter !== "all" || statusFilter !== "all" || catFilter !== "all") && (
                <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center">
                  {[sevFilter, statusFilter, catFilter].filter((f) => f !== "all").length}
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
              <Select value={sevFilter} onValueChange={(v) => { setSevFilter(v); setPage(1) }}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
<<<<<<< HEAD
                  <SelectItem value="rejected">Flagged</SelectItem>
=======
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
                </SelectContent>
              </Select>
              <Select value={catFilter} onValueChange={(v) => { setCatFilter(v); setPage(1) }}>
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="structural">Structural</SelectItem>
                  <SelectItem value="flooding">Flooding</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="landslide">Landslide</SelectItem>
                  <SelectItem value="wind">Wind</SelectItem>
                  <SelectItem value="earthquake">Earthquake</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                </SelectContent>
              </Select>
              {(sevFilter !== "all" || statusFilter !== "all" || catFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 gap-1 text-muted-foreground"
                  onClick={() => { setSevFilter("all"); setStatusFilter("all"); setCatFilter("all"); setPage(1) }}
                >
                  <X className="h-3 w-3" /> Clear
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selected.length > 0 && hasRole(["admin"]) && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-xs font-medium">{selected.length} selected</span>
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.success("Bulk action performed")}>
            Bulk Update Status
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {hasRole(["admin"]) && (
                      <TableHead className="w-10 pl-4">
                        <Checkbox
                          checked={selected.length === reports.length && reports.length > 0}
                          onCheckedChange={selectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Severity</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Zone</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="group">
                      {hasRole(["admin"]) && (
                        <TableCell className="pl-4">
                          <Checkbox
                            checked={selected.includes(report.id)}
                            onCheckedChange={() => toggleSelect(report.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1 h-6 rounded-full shrink-0",
                            report.severity === "critical" ? "bg-destructive" :
<<<<<<< HEAD
                              report.severity === "high" ? "bg-orange-500" :
                                report.severity === "moderate" ? "bg-yellow-500" : "bg-success"
=======
                            report.severity === "high" ? "bg-orange-500" :
                            report.severity === "moderate" ? "bg-yellow-500" : "bg-success"
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
                          )} />
                          {report.id}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium max-w-[200px] truncate">{report.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] capitalize", severityStyles[report.severity])}>
                          {report.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("text-[10px] capitalize", statusStyles[report.status])}>
<<<<<<< HEAD
                          {report.status === "rejected" ? "Flagged" : report.status.replace("_", " ")}
=======
                          {report.status.replace("_", " ")}
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground capitalize">{report.category}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{report.location.zone}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(report.reportedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                          <Link href={`/reports/${report.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="sr-only">View report {report.id}</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(page - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
