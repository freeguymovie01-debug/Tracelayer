"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  MapPin, Building2, Layers, Camera, Users, CheckCircle2,
  ArrowLeft, ArrowRight, Loader2, Zap, LocateFixed, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { DamageCategory, Severity } from "@/types"

const steps = [
  { id: "location", label: "Location", icon: MapPin },
  { id: "structure", label: "Structure", icon: Building2 },
  { id: "damage", label: "Damage", icon: Layers },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "impact", label: "Impact", icon: Users },
  { id: "review", label: "Review", icon: CheckCircle2 },
]

const structureTypes = [
  { value: "Residential", icon: "🏠", desc: "Houses, apartments" },
  { value: "Commercial", icon: "🏢", desc: "Offices, retail" },
  { value: "Industrial", icon: "🏭", desc: "Factories, warehouses" },
  { value: "Government", icon: "🏛", desc: "Public buildings" },
  { value: "Infrastructure", icon: "🌉", desc: "Bridges, roads" },
  { value: "Mixed-use", icon: "🏙", desc: "Combined purpose" },
]

const damageCategories: { value: DamageCategory; label: string; icon: string; color: string }[] = [
  { value: "structural", label: "Structural", icon: "🏚", color: "border-primary/30 bg-primary/5" },
  { value: "flooding", label: "Flooding", icon: "🌊", color: "border-blue-500/30 bg-blue-500/5" },
  { value: "fire", label: "Fire", icon: "🔥", color: "border-orange-500/30 bg-orange-500/5" },
  { value: "landslide", label: "Landslide", icon: "⛰", color: "border-amber-600/30 bg-amber-600/5" },
  { value: "wind", label: "Wind", icon: "🌪", color: "border-teal-500/30 bg-teal-500/5" },
  { value: "earthquake", label: "Earthquake", icon: "📳", color: "border-red-600/30 bg-red-600/5" },
  { value: "infrastructure", label: "Infrastructure", icon: "🔧", color: "border-slate-500/30 bg-slate-500/5" },
  { value: "environmental", label: "Environmental", icon: "☢", color: "border-green-600/30 bg-green-600/5" },
]

const infraOptions = ["Power Grid", "Water Supply", "Roads", "Bridges", "Communications", "Gas Lines", "Sewage", "Transit"]

export default function ReportPage() {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdId, setCreatedId] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  // Geolocation state
  const [geoStatus, setGeoStatus] = useState<"loading" | "success" | "error">("loading")
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)

  // Form state
  const [address, setAddress] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [structureType, setStructureType] = useState("")
  const [category, setCategory] = useState<DamageCategory | "">("")
  const [severity, setSeverity] = useState<Severity>("moderate")
  const [peopleAffected, setPeopleAffected] = useState(50)
  const [infrastructure, setInfrastructure] = useState<string[]>([])
  const [emergencyRequired, setEmergencyRequired] = useState(false)

  // Auto-fetch geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("error")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLat(latitude)
        setLng(longitude)
        setGeoStatus("success")
        // Reverse geocode to fill address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          if (data.display_name) {
            setAddress(data.display_name)
          }
        } catch {
          // Fallback: leave address blank for manual input
        }
      },
      () => {
        setGeoStatus("error")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

<<<<<<< HEAD
  // AI & Photos
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [aiRunning, setAiRunning] = useState(false)
  const [aiDone, setAiDone] = useState(false)
  const [aiConfidence, setAiConfidence] = useState(0)
  const [uploadedImageUrl, setUploadedImageUrl] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0])
    }
  }

  const runAiClassification = async () => {
    if (!photoFile) {
      toast.error("Please select a photo first")
      return
    }

    setAiRunning(true)
    try {
      const formData = new FormData()
      formData.append("file", photoFile)

      const token = sessionStorage.getItem("disaster_token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/ai/classify`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })

      if (!res.ok) throw new Error("AI classification failed")
      const result = await res.json()

      setAiConfidence(result.confidence)

      // Auto-set category based on result class if string matching permits
      if (result.damageClass) {
        // e.g. mapping "major-damage" to the frontend Severities
        let mappedSeverity: Severity = "low"
        if (result.severityHint >= 75) mappedSeverity = "critical"
        else if (result.severityHint >= 50) mappedSeverity = "high"
        else if (result.severityHint >= 25) mappedSeverity = "moderate"

        setSeverity(mappedSeverity)
      }

      setAiRunning(false)
      setAiDone(true)
      toast.success("AI Classification Complete", { description: result.classLabel })
    } catch (err) {
      toast.error("AI Analysis failed")
      setAiRunning(false)
    }
=======
  // AI mock
  const [aiRunning, setAiRunning] = useState(false)
  const [aiDone, setAiDone] = useState(false)
  const [aiConfidence, setAiConfidence] = useState(0)

  const runAiClassification = () => {
    setAiRunning(true)
    setTimeout(() => {
      const conf = 0.85 + Math.random() * 0.13
      setAiConfidence(conf)
      if (category) {
        const severities: Severity[] = ["critical", "high", "moderate", "low"]
        setSeverity(severities[Math.floor(Math.random() * 2)])
      }
      setAiRunning(false)
      setAiDone(true)
    }, 1500)
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  }

  const handleSubmit = async () => {
    if (!user || !category) return
    setSubmitting(true)
    try {
<<<<<<< HEAD

      let finalPhotoUrl = "/uploads/placeholder.jpg"

      if (photoFile) {
        const formData = new FormData()
        formData.append("file", photoFile)
        const token = sessionStorage.getItem("disaster_token")
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/uploads/photo`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          finalPhotoUrl = uploadData.url
          setUploadedImageUrl(uploadData.url)
        }
      }

      // Map UI state to the API_CONTRACTS POST /assessments schema
      const baseSeverityNum = severity === 'critical' ? 95 : severity === 'high' ? 70 : severity === 'moderate' ? 45 : 20;

      const payload = {
        zoneId: "cmm3zudp40003u5hngdswdkvz", // Use seed Downtown Metro ID since creating new zones is out of scope 
        lat: lat || 28.6139,
        lng: lng || 77.2090,
        damageType: category,
        structureDamage: structureType === "Residential" ? 60 : 80, // Approximate UI selection
        damageSeverity: baseSeverityNum,
        personsDamage: Math.min(peopleAffected, 100), // Cap for severity score weighting 0-100
        infraDamage: Math.min(infrastructure.length * 15, 100), // Cap for severity score weighting 0-100
        peopleAffected: peopleAffected,               // Send actual count for the DB mapping
        aiConfidence: aiDone ? aiConfidence : 0,      // Send AI recognition score to DB
        photoUrl: finalPhotoUrl,
        notes: description || `Field assessment. ${emergencyRequired ? 'EMERGENCY' : ''}`
      }

      const report = await api.createReport(payload)
=======
      const report = await api.createReport({
        title: title || `${category.charAt(0).toUpperCase() + category.slice(1)} damage at ${address.split(",")[0]}`,
        description: description || `Field assessment report for ${category} damage.`,
        location: { lat, lng, address, zone: "Downtown Metro" },
        severity,
        status: "pending",
        category,
        structureType: structureType || "Residential",
        images: [],
        peopleAffected,
        infrastructureImpact: infrastructure,
        emergencyRequired,
        reportedBy: user.name,
      })
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
      setCreatedId(report.id)
      setSubmitted(true)
      toast.success("Report submitted successfully", { description: `ID: ${report.id}` })
    } catch {
      toast.error("Failed to submit report")
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full glass-card-elevated text-center p-8">
          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Report Submitted</h2>
          <p className="text-sm text-muted-foreground mb-1">Your report has been created and assigned</p>
          <p className="text-sm font-mono font-semibold text-primary mb-6">{createdId}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/reports")}>View All Reports</Button>
            <Button onClick={() => router.push(`/reports/${createdId}`)}>View Report</Button>
          </div>
        </Card>
      </div>
    )
  }

  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-6">
      {/* Steps indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => i <= step && setStep(i)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors",
                i <= step ? "text-primary" : "text-muted-foreground",
                i < step && "cursor-pointer"
              )}
            >
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all",
                i < step ? "bg-primary border-primary text-primary-foreground" :
<<<<<<< HEAD
                  i === step ? "border-primary text-primary" :
                    "border-muted text-muted-foreground"
=======
                i === step ? "border-primary text-primary" :
                "border-muted text-muted-foreground"
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
              )}>
                {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Step content */}
      <Card className="glass-card-elevated">
        <CardContent className="p-6">
          {/* Step 0: Location */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold mb-1">Location Details</h3>
                <p className="text-sm text-muted-foreground">Your location is detected automatically</p>
              </div>

              {/* Geolocation status */}
              <div className={cn(
                "flex items-center gap-3 rounded-xl border p-4 transition-colors",
                geoStatus === "loading" && "border-primary/30 bg-primary/5",
                geoStatus === "success" && "border-green-500/30 bg-green-500/5",
                geoStatus === "error" && "border-destructive/30 bg-destructive/5",
              )}>
                {geoStatus === "loading" && (
                  <>
                    <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Detecting your location...</p>
                      <p className="text-xs text-muted-foreground">Please allow location access when prompted</p>
                    </div>
                  </>
                )}
                {geoStatus === "success" && (
                  <>
                    <LocateFixed className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Location detected</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {lat.toFixed(5)}, {lng.toFixed(5)}
                      </p>
                    </div>
                  </>
                )}
                {geoStatus === "error" && (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Could not detect location</p>
                      <p className="text-xs text-muted-foreground">Please enter your address manually below</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs"
                      onClick={() => {
                        setGeoStatus("loading")
                        navigator.geolocation.getCurrentPosition(
                          async (pos) => {
                            setLat(pos.coords.latitude)
                            setLng(pos.coords.longitude)
                            setGeoStatus("success")
                            try {
                              const res = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
                              )
                              const data = await res.json()
                              if (data.display_name) setAddress(data.display_name)
                            } catch { /* ignore */ }
                          },
                          () => setGeoStatus("error"),
                          { enableHighAccuracy: true, timeout: 10000 }
                        )
                      }}
                    >
                      Retry
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={geoStatus === "loading" ? "Fetching address..." : "Enter or correct the address"}
                />
              </div>
            </div>
          )}

          {/* Step 1: Structure */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold mb-1">Structure Type</h3>
                <p className="text-sm text-muted-foreground">Select the type of structure affected</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {structureTypes.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStructureType(s.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      structureType === s.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <span className="text-2xl block mb-2">{s.icon}</span>
                    <p className="text-sm font-medium">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Damage */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold mb-1">Damage Category</h3>
                <p className="text-sm text-muted-foreground">Identify the type of damage</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {damageCategories.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-center transition-all",
                      category === c.value
                        ? `border-primary bg-primary/5`
                        : `border-border hover:${c.color}`
                    )}
                  >
                    <span className="text-2xl block mb-1">{c.icon}</span>
                    <p className="text-xs font-medium">{c.label}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Report Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description of the damage" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Detailed Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide detailed observations..." rows={3} />
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold mb-1">Photo Documentation</h3>
                <p className="text-sm text-muted-foreground">Upload images for AI classification</p>
              </div>
<<<<<<< HEAD
              <div className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {photoFile ? photoFile.name : "Drop images here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG up to 10MB</p>
=======
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
                <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Drop images here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG up to 10MB each</p>
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
              </div>

              {/* AI Classification */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">AI Classification</span>
                  </div>
                  {!aiDone && !aiRunning && (
<<<<<<< HEAD
                    <Button size="sm" variant="outline" onClick={runAiClassification} disabled={!photoFile}>
=======
                    <Button size="sm" variant="outline" onClick={runAiClassification} disabled={!category}>
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
                      Run AI Analysis
                    </Button>
                  )}
                  {aiRunning && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyzing damage patterns...
                    </div>
                  )}
                  {aiDone && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Category:</span>
                        <Badge variant="secondary" className="capitalize text-[10px]">{category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Suggested severity:</span>
                        <Badge variant="secondary" className="capitalize text-[10px]">{severity}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <span className="text-xs font-semibold text-primary">{(aiConfidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={aiConfidence * 100} className="h-1.5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Impact */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold mb-1">Impact Assessment</h3>
                <p className="text-sm text-muted-foreground">Estimate the scope of impact</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">People Affected</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={peopleAffected}
                    onChange={(e) => setPeopleAffected(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-3xl font-bold text-foreground">{peopleAffected.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Severity Level</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["low", "moderate", "high", "critical"] as Severity[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={cn(
                        "px-3 py-2 rounded-lg border-2 text-xs font-medium capitalize transition-all",
                        severity === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Infrastructure Impact</Label>
                <div className="flex flex-wrap gap-2">
                  {infraOptions.map((inf) => (
                    <Badge
                      key={inf}
                      variant={infrastructure.includes(inf) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() =>
                        setInfrastructure(
                          infrastructure.includes(inf)
                            ? infrastructure.filter((i) => i !== inf)
                            : [...infrastructure, inf]
                        )
                      }
                    >
                      {inf}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                <div>
                  <p className="text-sm font-medium text-foreground">Emergency Response Required</p>
                  <p className="text-[11px] text-muted-foreground">Immediate action needed</p>
                </div>
                <Switch checked={emergencyRequired} onCheckedChange={setEmergencyRequired} />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold mb-1">Review and Submit</h3>
                <p className="text-sm text-muted-foreground">Verify all information before submitting</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Location", value: address || `${lat.toFixed(5)}, ${lng.toFixed(5)}` },
                  { label: "Structure Type", value: structureType || "Not specified" },
                  { label: "Category", value: category || "Not specified" },
                  { label: "Severity", value: severity },
                  { label: "People Affected", value: peopleAffected.toLocaleString() },
                  { label: "Infrastructure", value: infrastructure.join(", ") || "None" },
                  { label: "Emergency", value: emergencyRequired ? "Yes" : "No" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-medium text-foreground capitalize">{item.value}</span>
                  </div>
                ))}
              </div>
              {title && <p className="text-sm font-medium">{title}</p>}
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button size="sm" onClick={() => setStep(step + 1)} className="gap-1">
                Next <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSubmit} disabled={submitting} className="gap-1">
                {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...</> : "Submit Report"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
