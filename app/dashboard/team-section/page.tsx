"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, MoreVertical } from "lucide-react"

const teamMembers = [
  { name: "Sarah Johnson", email: "sarah@example.com", role: "Admin", status: "Active", initials: "SJ" },
  { name: "Mike Chen", email: "mike@example.com", role: "Manager", status: "Active", initials: "MC" },
  { name: "Emily Davis", email: "emily@example.com", role: "Sales", status: "Active", initials: "ED" },
  { name: "Alex Kim", email: "alex@example.com", role: "Sales", status: "Away", initials: "AK" },
  { name: "Lisa Brown", email: "lisa@example.com", role: "Support", status: "Active", initials: "LB" },
  { name: "Tom Wilson", email: "tom@example.com", role: "Inventory", status: "Offline", initials: "TW" },
]

const getRoleColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "bg-primary/20 text-primary border-primary/30"
    case "Manager":
      return "bg-accent/20 text-accent border-accent/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-accent"
    case "Away":
      return "bg-yellow-500"
    case "Offline":
      return "bg-muted-foreground"
    default:
      return "bg-muted-foreground"
  }
}

export default function TeamSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and permissions</p>
          <span className="text-sm text-destructive">Out of Service</span>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold text-foreground mt-1">24</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Now</p>
            <p className="text-2xl font-bold text-accent mt-1">18</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Invites</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">3</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Team Members</CardTitle>
          <CardDescription className="text-muted-foreground">View and manage all team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.email} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-primary/20 text-primary">{member.initials}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(member.status)}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={getRoleColor(member.role)}>
                    {member.role}
                  </Badge>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
