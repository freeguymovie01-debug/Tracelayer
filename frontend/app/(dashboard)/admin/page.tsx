"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  Users, Bell, MapPinned, Building2, FileText,
  Shield, MoreHorizontal, Plus,
} from "lucide-react"
import type { User, AlertRule, Zone, Facility, AuditLog } from "@/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const severityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-orange-500/10 text-orange-600",
  moderate: "bg-yellow-500/10 text-yellow-700",
  low: "bg-success/10 text-success",
}

export default function AdminPage() {
  const { hasRole } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [alerts, setAlerts] = useState<AlertRule[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasRole(["admin"])) {
      router.push("/dashboard")
      return
    }
    async function load() {
      const [u, a, z, f, al] = await Promise.all([
        api.getUsers(),
        api.getAlertRules(),
        api.getZones(),
        api.getFacilities(),
        api.getAuditLogs(),
      ])
      setUsers(u)
      setAlerts(a)
      setZones(z)
      setFacilities(f)
      setAuditLogs(al)
      setLoading(false)
    }
    load()
  }, [hasRole, router])

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Administration</h2>
        <p className="text-sm text-muted-foreground">Manage system configuration and users</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="users" className="text-xs gap-1.5"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs gap-1.5"><Bell className="h-3.5 w-3.5" /> Alerts</TabsTrigger>
          <TabsTrigger value="zones" className="text-xs gap-1.5"><MapPinned className="h-3.5 w-3.5" /> Zones</TabsTrigger>
          <TabsTrigger value="facilities" className="text-xs gap-1.5"><Building2 className="h-3.5 w-3.5" /> Facilities</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs gap-1.5"><FileText className="h-3.5 w-3.5" /> Audit</TabsTrigger>
        </TabsList>

        {/* Users */}
        <TabsContent value="users">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">System Users</CardTitle>
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toast.info("User invitation would open here")}>
                <Plus className="h-3 w-3" /> Add User
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs pl-6">User</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {u.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          <Shield className="h-3 w-3 mr-1" /> {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          <span className="sr-only">More actions for {u.name}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Alert Rules</CardTitle>
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toast.info("Alert rule editor would open here")}>
                <Plus className="h-3 w-3" /> New Rule
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs pl-6">Name</TableHead>
                    <TableHead className="text-xs">Condition</TableHead>
                    <TableHead className="text-xs">Severity</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs pr-6">Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs font-medium pl-6">{a.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{a.condition}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("text-[10px] capitalize", severityStyles[a.severity])}>
                          {a.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={a.enabled ? "default" : "outline"} className="text-[10px]">
                          {a.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Switch checked={a.enabled} onCheckedChange={() => toast.info("Toggle would persist")} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zones */}
        <TabsContent value="zones">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Disaster Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {zones.map((z) => (
                  <Card key={z.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold">{z.name}</h4>
                        <Badge variant="secondary" className={cn("text-[10px] capitalize", severityStyles[z.riskLevel])}>
                          {z.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{z.activeIncidents} active incidents</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facilities */}
        <TabsContent value="facilities">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Registered Facilities</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs pl-6">Name</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Capacity</TableHead>
                    <TableHead className="text-xs pr-6">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilities.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="text-xs font-medium pl-6">{f.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground capitalize">{f.type.replace("_", " ")}</TableCell>
                      <TableCell>
                        <Badge variant={f.status === "operational" ? "default" : "secondary"} className="text-[10px] capitalize">
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{f.capacity}</TableCell>
                      <TableCell className="text-xs text-muted-foreground pr-6 max-w-[180px] truncate">{f.location.address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs pl-6">Action</TableHead>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Target</TableHead>
                    <TableHead className="text-xs">Details</TableHead>
                    <TableHead className="text-xs pr-6">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-medium pl-6">{log.action}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.user}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{log.target}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{log.details}</TableCell>
                      <TableCell className="text-xs text-muted-foreground pr-6">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
