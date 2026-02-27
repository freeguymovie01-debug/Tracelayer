"use client"

import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Shield, Calendar, MapPin, Phone, Building } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const initials = user.name.split(" ").map((n) => n[0]).join("")

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account information</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize text-xs">
                  {user.role}
                </Badge>
                <Badge variant="outline" className="text-xs text-success border-success/30">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription className="text-xs">Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-xs">First Name</Label>
              <Input id="firstName" defaultValue={user.name.split(" ")[0]} className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-xs">Last Name</Label>
              <Input id="lastName" defaultValue={user.name.split(" ").slice(1).join(" ")} className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" defaultValue={user.email} className="h-9 text-sm" disabled />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input id="phone" defaultValue="+1 (555) 123-4567" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept" className="text-xs">Department</Label>
              <Input id="dept" defaultValue="Emergency Response" className="h-9 text-sm" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground">{user.email}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Role:</span>
              <span className="text-foreground capitalize">{user.role}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined:</span>
              <span className="text-foreground">January 15, 2026</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Region:</span>
              <span className="text-foreground">Los Angeles Metro</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Organization:</span>
              <span className="text-foreground">National Disaster Response Authority</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
