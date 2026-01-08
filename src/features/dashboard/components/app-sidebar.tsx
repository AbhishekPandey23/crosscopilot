"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Users,
  FileText,
  Settings,
  Building2,
  User,
  Zap,
  ChevronUp,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useVendorStore } from "@/features/dashboard/stores/vendor-store"
import { Button } from "@/components/ui/button"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"

const baseNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/rfps", label: "RFP", icon: FileText },
  { href: "/dashboard/source", label: "Source", icon: Zap },
]

const businessOnlyItems = [
  { href: "/dashboard/team-section", label: "Team Management", icon: Users },
]

const settingsItem = { href: "/dashboard/settings", label: "Settings", icon: Settings }

export function AppSidebar() {
  const vendorType = useVendorStore((state) => state.vendorType)
  const pathname = usePathname()

  const mainNavItems = vendorType === "business" ? [...baseNavItems, ...businessOnlyItems] : baseNavItems

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">C</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">CrossCopilot</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {vendorType === "business" ? "Business" : "Individual"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Account Type Badge */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-sidebar-accent">
              {vendorType === "business" ? (
                <Building2 className="size-4 text-primary" />
              ) : (
                <User className="size-4 text-accent" />
              )}
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                {vendorType === "business" ? "Business Account" : "Individual Account"}
              </span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isBusinessOnly = businessOnlyItems.some((b) => b.href === item.href)
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={isActive} tooltip={item.label} asChild>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {isBusinessOnly && <SidebarMenuBadge className="bg-primary/20 text-primary">Pro</SidebarMenuBadge>}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Preferences</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === settingsItem.href} tooltip={settingsItem.label} asChild>
                  <Link href={settingsItem.href}>
                    <settingsItem.icon />
                    <span>{settingsItem.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-muted">JD</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">John Doe</span>
                    <span className="truncate text-xs text-muted-foreground">john@example.com</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/notifications">Notifications</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutLink>Log out</LogoutLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
