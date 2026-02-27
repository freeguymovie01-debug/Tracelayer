"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

const demoAccounts = [
<<<<<<< HEAD
  { email: "admin@dda.com", role: "Admin", description: "Full system access" },
  { email: "super@dda.com", role: "Supervisor", description: "Team oversight and approvals" },
  { email: "assessor1@dda.com", role: "Field Assessor", description: "Report and assess damage" },
=======
  { email: "admin@demo.com", role: "Admin", description: "Full system access" },
  { email: "supervisor@demo.com", role: "Supervisor", description: "Team oversight and approvals" },
  { email: "assessor@demo.com", role: "Field Assessor", description: "Report and assess damage" },
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
<<<<<<< HEAD
  const [password, setPassword] = useState("password123")
=======
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, login } = useAuth()
  const router = useRouter()

  // Redirect when user is authenticated
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

<<<<<<< HEAD
  const handleLogin = async (loginEmail: string, loginPassword?: string) => {
    setIsLoading(true)
    const success = await login(loginEmail, loginPassword || password)
=======
  const handleLogin = async (loginEmail: string) => {
    setIsLoading(true)
    const success = await login(loginEmail)
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
    if (success) {
      toast.success("Welcome back", { description: "Redirecting to dashboard..." })
      // Navigation happens via the useEffect above once user state updates
    } else {
      toast.error("Invalid credentials", { description: "Please use a demo account." })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnptLTIwIDBoMnYtMmgtMnYyem0wIDRoMnYtMmgtMnYyem00IDBWMzRoLTJ2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground tracking-tight">DisasterIQ</span>
          </div>
          <p className="text-primary-foreground/70 text-sm mt-1">Disaster Damage Intelligence Platform</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight text-balance">
            Real-time disaster intelligence for faster response
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-md">
            Monitor, assess, and coordinate disaster response efforts with AI-powered damage classification and real-time mapping.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-primary-foreground">2.4K+</p>
              <p className="text-primary-foreground/60 text-sm">Reports processed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">98.5%</p>
              <p className="text-primary-foreground/60 text-sm">AI accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">45s</p>
              <p className="text-primary-foreground/60 text-sm">Avg response time</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-primary-foreground/40 text-sm">
          National Disaster Response Authority
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DisasterIQ</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Sign in to your account</h2>
            <p className="text-muted-foreground mt-2">Access the disaster intelligence dashboard</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
<<<<<<< HEAD
              handleLogin(email, password)
=======
              handleLogin(email)
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
<<<<<<< HEAD
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
=======
                  defaultValue="demo1234"
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">Demo accounts</span>
            </div>
          </div>

          <div className="space-y-3">
            {demoAccounts.map((account) => (
              <Card
                key={account.email}
                className="cursor-pointer hover:border-primary/30 transition-all duration-200 hover:shadow-sm"
                onClick={() => {
                  setEmail(account.email)
<<<<<<< HEAD
                  setPassword("password123") // Use the universal test password
                  handleLogin(account.email, "password123")
=======
                  handleLogin(account.email)
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
                }}
              >
                <CardHeader className="p-4 pb-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{account.email}</CardTitle>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {account.role}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <CardDescription className="text-xs">{account.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-warning-foreground">
              This is a demo environment with simulated data. No real disaster data is displayed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
