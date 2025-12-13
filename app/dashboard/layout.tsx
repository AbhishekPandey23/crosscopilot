import type React from "react"
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout"

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
