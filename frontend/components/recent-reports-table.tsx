"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, ArrowRight } from "lucide-react"
import type { DisasterReport } from "@/types"
import { cn } from "@/lib/utils"

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
  dismissed: "bg-muted text-muted-foreground",
}

export function RecentReportsTable({ reports }: { reports: DisasterReport[] }) {
  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">Recent Reports</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
          <Link href="/reports">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs pl-6">ID</TableHead>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Severity</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Location</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="group">
                  <TableCell className="font-mono text-xs pl-6">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1 h-6 rounded-full",
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
                  <TableCell className="text-xs font-medium max-w-[200px] truncate">
                    {report.title}
                  </TableCell>
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
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                    {report.location.zone}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(report.reportedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell className="pr-6">
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
      </CardContent>
    </Card>
  )
}
