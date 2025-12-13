"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Calendar, TrendingUp, DollarSign, ShoppingCart } from "lucide-react"

const reports = [
  {
    title: "Monthly Sales Report",
    description: "Complete sales breakdown for the current month",
    icon: DollarSign,
    date: "Generated Jan 15, 2024",
  },
  {
    title: "Inventory Analysis",
    description: "Stock levels and turnover rates",
    icon: ShoppingCart,
    date: "Generated Jan 14, 2024",
  },
  {
    title: "Performance Metrics",
    description: "Team and product performance overview",
    icon: TrendingUp,
    date: "Generated Jan 13, 2024",
  },
  {
    title: "Quarterly Review",
    description: "Q4 2023 comprehensive business review",
    icon: Calendar,
    date: "Generated Jan 10, 2024",
  },
]

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and download business reports</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Stats</CardTitle>
            <CardDescription className="text-muted-foreground">This month's highlights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Total Revenue", value: "$125,430" },
              { label: "Orders Processed", value: "2,847" },
              { label: "New Customers", value: "342" },
              { label: "Return Rate", value: "2.3%" },
            ].map((stat) => (
              <div key={stat.label} className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Scheduled Reports</CardTitle>
            <CardDescription className="text-muted-foreground">Automated report generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Weekly Summary", schedule: "Every Monday, 9:00 AM" },
              { name: "Monthly Financials", schedule: "1st of each month" },
              { name: "Inventory Alert", schedule: "Daily, 6:00 PM" },
            ].map((report) => (
              <div key={report.name} className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <div>
                  <p className="font-medium text-foreground">{report.name}</p>
                  <p className="text-xs text-muted-foreground">{report.schedule}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  Edit
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Reports</CardTitle>
          <CardDescription className="text-muted-foreground">Download previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => {
              const Icon = report.icon
              return (
                <div
                  key={report.title}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{report.title}</p>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{report.date}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
