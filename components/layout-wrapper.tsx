"use client"

import { usePathname } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ReactNode } from "react"

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const noDashboardRoutes = ["/auth/login", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-otp"]

  return noDashboardRoutes.includes(pathname) ? (
    <>{children}</>
  ) : (
    <DashboardLayout>{children}</DashboardLayout>
  )
}