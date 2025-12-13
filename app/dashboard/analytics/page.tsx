"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts"
import { useVendorStore } from "@/features/dashboard/stores/vendor-store"

const salesData = [
  { name: "Mon", sales: 400 },
  { name: "Tue", sales: 300 },
  { name: "Wed", sales: 500 },
  { name: "Thu", sales: 450 },
  { name: "Fri", sales: 600 },
  { name: "Sat", sales: 550 },
  { name: "Sun", sales: 480 },
]

const categoryData = [
  { name: "Electronics", value: 400 },
  { name: "Clothing", value: 300 },
  { name: "Home", value: 200 },
  { name: "Sports", value: 100 },
]

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

export default function Analytics() {
  const vendorType = useVendorStore((state) => state.vendorType)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights into your store performance</p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Weekly Sales</CardTitle>
            <CardDescription className="text-muted-foreground">Sales performance for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a3a3a3", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a3a3a3", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                      color: "#fafafa",
                    }}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Sales by Category</CardTitle>
            <CardDescription className="text-muted-foreground">Distribution of sales across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                      color: "#fafafa",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {vendorType === "business" && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Customer Segments</CardTitle>
              <CardDescription className="text-muted-foreground">Breakdown by customer type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { segment: "Enterprise", percentage: 45, color: "bg-primary" },
                  { segment: "SMB", percentage: 35, color: "bg-accent" },
                  { segment: "Startup", percentage: 20, color: "bg-yellow-500" },
                ].map((item) => (
                  <div key={item.segment} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{item.segment}</span>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Traffic Sources</CardTitle>
              <CardDescription className="text-muted-foreground">Where your customers come from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { source: "Organic Search", visits: "12,543", change: "+12%" },
                  { source: "Direct", visits: "8,234", change: "+5%" },
                  { source: "Referral", visits: "4,567", change: "-2%" },
                  { source: "Social", visits: "3,123", change: "+18%" },
                ].map((item) => (
                  <div key={item.source} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.source}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-foreground">{item.visits}</span>
                      <span
                        className={`ml-2 text-xs ${item.change.startsWith("+") ? "text-accent" : "text-destructive"}`}
                      >
                        {item.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Conversion Funnel</CardTitle>
              <CardDescription className="text-muted-foreground">User journey analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { stage: "Visitors", value: 10000, width: 100 },
                  { stage: "Add to Cart", value: 3500, width: 70 },
                  { stage: "Checkout", value: 1200, width: 45 },
                  { stage: "Purchase", value: 450, width: 25 },
                ].map((item) => (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{item.stage}</span>
                      <span className="text-muted-foreground">{item.value.toLocaleString()}</span>
                    </div>
                    <div
                      className="h-8 rounded bg-primary/20 flex items-center justify-center"
                      style={{ width: `${item.width}%` }}
                    >
                      <span className="text-xs font-medium text-primary">
                        {((item.value / 10000) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
