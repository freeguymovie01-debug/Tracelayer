"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: number
  trend: number
  icon: LucideIcon
  format?: "number" | "compact"
  color: "primary" | "critical" | "warning" | "success"
}

function AnimatedCounter({ target, format }: { target: number; format: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const duration = 1200
    const steps = 40
    const increment = target / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), target)
      setCount(current)
      if (step >= steps) clearInterval(timer)
    }, duration / steps)

    return () => clearInterval(timer)
  }, [target])

  const display = format === "compact" && count >= 1000
    ? `${(count / 1000).toFixed(1)}K`
    : count.toLocaleString()

  return <span ref={ref}>{display}</span>
}

const colorMap = {
  primary: "bg-primary/10 text-primary",
  critical: "bg-destructive/10 text-destructive",
  warning: "bg-warning/20 text-warning-foreground",
  success: "bg-success/10 text-success",
}

export function KPICard({ title, value, trend, icon: Icon, format = "number", color }: KPICardProps) {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus

  return (
    <Card className="glass-card-elevated hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              <AnimatedCounter target={value} format={format} />
            </p>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md",
                trend > 0 ? "text-destructive bg-destructive/10" :
                trend < 0 ? "text-success bg-success/10" :
                "text-muted-foreground bg-muted"
              )}>
                <TrendIcon className="h-3 w-3" />
                {Math.abs(trend)}%
              </div>
              <span className="text-[11px] text-muted-foreground">vs last week</span>
            </div>
          </div>
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            colorMap[color]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
