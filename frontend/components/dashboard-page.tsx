"use client"

import { useState, useEffect } from "react"
import { SecurityDashboard } from "@/components/security-dashboard"
import { LoginForm } from "@/components/login-form"

export function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  if (!isLoggedIn) {
    return <LoginForm onLogin={() => setIsLoggedIn(true)} />
  }

  return <SecurityDashboard />
}