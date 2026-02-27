"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User, UserRole } from "@/types"
import { api } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
<<<<<<< HEAD
  login: (email: string, password?: string) => Promise<boolean>
=======
  login: (email: string) => Promise<boolean>
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  logout: () => void
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("disaster_user") : null
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        sessionStorage.removeItem("disaster_user")
      }
    }
    setIsLoading(false)
  }, [])

<<<<<<< HEAD
  const login = useCallback(async (email: string, password?: string) => {
    setIsLoading(true)
    const found = await api.login(email, password)
=======
  const login = useCallback(async (email: string) => {
    setIsLoading(true)
    const found = await api.login(email)
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
    if (found) {
      setUser(found)
      sessionStorage.setItem("disaster_user", JSON.stringify(found))
      setIsLoading(false)
      return true
    }
    setIsLoading(false)
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem("disaster_user")
<<<<<<< HEAD
    sessionStorage.removeItem("disaster_token")
=======
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
  }, [])

  const hasRole = useCallback(
    (roles: UserRole[]) => {
      if (!user) return false
<<<<<<< HEAD
      return roles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())
=======
      return roles.includes(user.role)
>>>>>>> cab3372ff0f2be88fa0a32a1835ccc5abde6ebd5
    },
    [user]
  )

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
