"use client"

import { usePathname } from "next/navigation"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useVendorStore } from "@/features/dashboard/stores/vendor-store"
import { NotificationModal } from "@/features/notifications/components/notification-modal"
import type { ReactNode } from "react"

const pageTitles: Record<string, string> = {
  "/": "Overview",
  "/analytics": "Analytics",
  "/rfp": "RFP",
  "/rfq": "RFQ",
  "/inventory": "Inventory",
  "/team": "Team Management",
  "/reports": "Reports",
  "/settings": "Settings",
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const vendorType = useVendorStore((state) => state.vendorType)
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || "Dashboard"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-4">
            <div className="relative max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 w-64 bg-secondary border-border" />
            </div>
            {vendorType === "business" && (
              <>
                <Badge variant="outline" className="border-primary text-primary hidden sm:flex">
                  Business Plan
                </Badge>
                <NotificationModal />
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
