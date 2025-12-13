"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Building2, User } from "lucide-react"
import { useVendorStore } from "@/features/dashboard/stores/vendor-store"


export default function Settings() {
  const vendorType = useVendorStore((state) => state.vendorType)
  const setVendorType = useVendorStore((state) => state.setVendorType)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Account Type</CardTitle>
          <CardDescription className="text-muted-foreground">
            Switch between vendor account types (Demo toggle)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={vendorType === "individual" ? "default" : "outline"}
              onClick={() => setVendorType("individual")}
            >
              <User className="w-4 h-4 mr-2" />
              Individual
            </Button>
            <Button
              variant={vendorType === "business" ? "default" : "outline"}
              onClick={() => setVendorType("business")}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Business
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {vendorType === "business"
              ? "Business accounts have access to team management, advanced analytics, reports, and bulk operations."
              : "Individual accounts have access to basic features for personal selling."}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Profile Information</CardTitle>
          <CardDescription className="text-muted-foreground">Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john@example.com" className="bg-secondary border-border" />
            </div>
          </div>
          {vendorType === "business" && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" defaultValue="Acme Inc." className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax ID</Label>
                <Input id="tax" defaultValue="XX-XXXXXXX" className="bg-secondary border-border" />
              </div>
            </div>
          )}
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Notifications</CardTitle>
          <CardDescription className="text-muted-foreground">Configure your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Order Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified when you receive a new order</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Low Stock Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
            </div>
            <Switch defaultChecked />
          </div>
          {vendorType === "business" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Team Activity</p>
                  <p className="text-sm text-muted-foreground">Get notified about team member actions</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
                </div>
                <Switch defaultChecked />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {vendorType === "business" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">API Access</CardTitle>
            <CardDescription className="text-muted-foreground">Manage API keys for integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Production API Key</p>
                  <p className="font-mono text-sm text-muted-foreground">vk_live_••••••••••••••••</p>
                </div>
                <Button variant="outline" size="sm">
                  Reveal
                </Button>
              </div>
            </div>
            <Button variant="outline">Generate New Key</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
