"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useVendorStore } from "@/features/dashboard/stores/vendor-store"

const rfqs = [
  { id: "#RFQ-001", vendor: "Tech Solutions Inc", date: "2024-01-15", budget: "$50,000", status: "Open" },
  { id: "#RFQ-002", vendor: "Global Supplies Co", date: "2024-01-15", budget: "$25,000", status: "Under Review" },
  { id: "#RFQ-003", vendor: "Premium Services", date: "2024-01-14", budget: "$75,000", status: "Quoted" },
  { id: "#RFQ-004", vendor: "Quality Products", date: "2024-01-14", budget: "$30,000", status: "Open" },
  { id: "#RFQ-005", vendor: "Best Value Corp", date: "2024-01-13", budget: "$45,000", status: "Closed" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-accent/20 text-accent border-accent/30"
    case "Under Review":
      return "bg-primary/20 text-primary border-primary/30"
    case "Quoted":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    case "Closed":
      return "bg-muted text-muted-foreground border-border"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export default function RFQ() {
  const vendorType = useVendorStore((state) => state.vendorType)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Request for Quotation</h1>
          <p className="text-muted-foreground">Manage your RFQs and vendor quotes</p>
        </div>
        {vendorType === "business" && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">Active RFQs</CardTitle>
              <CardDescription className="text-muted-foreground">
                {vendorType === "business" ? "Advanced RFQ management" : "Your active quotation requests"}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search RFQs..." className="pl-9 bg-secondary border-border" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">RFQ ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vendor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Budget</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  {vendorType === "business" && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{rfq.id}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{rfq.vendor}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{rfq.date}</td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{rfq.budget}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={getStatusColor(rfq.status)}>
                        {rfq.status}
                      </Badge>
                    </td>
                    {vendorType === "business" && (
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                          View Details
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {vendorType === "business" && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground mt-1">Active RFQs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground mt-1">Pending Quotes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">$245K</p>
                <p className="text-sm text-muted-foreground mt-1">Total Budget</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
