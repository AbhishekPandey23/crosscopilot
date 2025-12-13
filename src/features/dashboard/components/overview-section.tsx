"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Users, TrendingUp, Package, Eye } from "lucide-react"
import { StatsChart } from "./stats-chart"
import { useVendorStore } from "@/features/dashboard/stores/vendor-store"


export default function Overview() {
  const vendorType = useVendorStore((state) => state.vendorType)
  const baseStats = [
    { title: "Total Revenue", value: "$45,231.89", change: "+20.1%", trend: "up", icon: DollarSign },
    { title: "Orders", value: "2,350", change: "+15.2%", trend: "up", icon: ShoppingCart },
    { title: "Products Views", value: "12,234", change: "+8.4%", trend: "up", icon: Eye },
  ]

  const businessStats = [
    { title: "Team Members", value: "24", change: "+2", trend: "up", icon: Users },
    { title: "Inventory Items", value: "1,543", change: "-12", trend: "down", icon: Package },
    { title: "Conversion Rate", value: "3.24%", change: "+0.5%", trend: "up", icon: TrendingUp },
  ]

  const stats = vendorType === "business" ? [...baseStats, ...businessStats] : baseStats

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
      </div>

      <div
        className={`grid gap-4 ${vendorType === "business" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-3"}`}
      >
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center text-xs mt-1">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-3 h-3 text-accent mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-destructive mr-1" />
                  )}
                  <span className={stat.trend === "up" ? "text-accent" : "text-destructive"}>{stat.change}</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className={`grid gap-6 ${vendorType === "business" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue Overview</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your revenue performance over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatsChart />
          </CardContent>
        </Card>

        {vendorType === "business" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Team Performance</CardTitle>
              <CardDescription className="text-muted-foreground">Sales performance by team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Sarah Johnson", role: "Sales Lead", sales: 89, color: "bg-primary" },
                  { name: "Mike Chen", role: "Account Manager", sales: 76, color: "bg-accent" },
                  { name: "Emily Davis", role: "Sales Rep", sales: 64, color: "bg-primary" },
                  { name: "Alex Kim", role: "Sales Rep", sales: 52, color: "bg-accent" },
                ].map((member) => (
                  <div key={member.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      <span className="text-sm font-medium text-foreground">{member.sales}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div className={`h-full rounded-full ${member.color}`} style={{ width: `${member.sales}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {vendorType === "business" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Business-exclusive features at your fingertips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Export Reports", icon: "📊" },
                { label: "Bulk Upload", icon: "📦" },
                { label: "Team Analytics", icon: "👥" },
                { label: "API Access", icon: "🔗" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="p-4 rounded-lg bg-secondary hover:bg-muted transition-colors text-center"
                >
                  <span className="text-2xl mb-2 block">{action.icon}</span>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
