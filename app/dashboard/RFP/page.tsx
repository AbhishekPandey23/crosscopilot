"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useVendorStore } from "@/features/dashboard/stores/vendor-store"



const orders = [
  { id: "#ORD-001", customer: "John Smith", date: "2024-01-15", amount: "$234.50", status: "Completed" },
  { id: "#ORD-002", customer: "Sarah Johnson", date: "2024-01-15", amount: "$89.99", status: "Processing" },
  { id: "#ORD-003", customer: "Mike Wilson", date: "2024-01-14", amount: "$567.00", status: "Shipped" },
  { id: "#ORD-004", customer: "Emily Davis", date: "2024-01-14", amount: "$123.45", status: "Pending" },
  { id: "#ORD-005", customer: "Alex Brown", date: "2024-01-13", amount: "$456.78", status: "Completed" },
  { id: "#ORD-006", customer: "Lisa Chen", date: "2024-01-13", amount: "$321.00", status: "Cancelled" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-accent/20 text-accent border-accent/30"
    case "Processing":
      return "bg-primary/20 text-primary border-primary/30"
    case "Shipped":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    case "Pending":
      return "bg-muted text-muted-foreground border-border"
    case "Cancelled":
      return "bg-destructive/20 text-destructive border-destructive/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export default function Orders() {
  const vendorType = useVendorStore((state) => state.vendorType)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage and track all your orders</p>
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
              <CardTitle className="text-foreground">Recent Orders</CardTitle>
              <CardDescription className="text-muted-foreground">
                {vendorType === "business" ? "Advanced order management" : "Your recent orders"}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9 bg-secondary border-border" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  {vendorType === "business" && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{order.id}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{order.customer}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{order.date}</td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{order.amount}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {order.status}
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
                <p className="text-3xl font-bold text-foreground">98.5%</p>
                <p className="text-sm text-muted-foreground mt-1">Fulfillment Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">2.3 days</p>
                <p className="text-sm text-muted-foreground mt-1">Avg. Processing Time</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">$45.67</p>
                <p className="text-sm text-muted-foreground mt-1">Avg. Order Value</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
