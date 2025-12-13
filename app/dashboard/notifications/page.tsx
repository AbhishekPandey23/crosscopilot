"use client"

import { useState } from "react"
import { Bell, Check, Package, MessageSquare, Users, AlertCircle, X, ArrowLeft, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useNotificationStore, type Notification } from "@/features/notifications/stores/notification-store"
import Link from "next/link"

const typeIcons = {
  order: Package,
  message: MessageSquare,
  team: Users,
  alert: AlertCircle,
}

const typeColors = {
  order: "text-blue-500 bg-blue-500/10",
  message: "text-green-500 bg-green-500/10",
  team: "text-purple-500 bg-purple-500/10",
  alert: "text-amber-500 bg-amber-500/10",
}

const typeLabels = {
  order: "Order",
  message: "Message",
  team: "Team",
  alert: "Alert",
}

type FilterType = "all" | "order" | "message" | "team" | "alert" | "unread"

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead, clearNotification } = useNotificationStore()
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true
    if (filter === "unread") return !n.read
    return n.type === filter
  })

  const handleViewDetails = (notification: Notification) => {
    markAsRead(notification.id)
    setSelectedNotification(notification)
    setDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">Manage and view all your notifications</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="size-4 mr-2" />
                {filter === "all" ? "All" : filter === "unread" ? "Unread" : typeLabels[filter as keyof typeof typeLabels]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("unread")}>Unread</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("order")}>Orders</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("message")}>Messages</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("team")}>Team</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("alert")}>Alerts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="size-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            {filter === "all"
              ? "All Notifications"
              : filter === "unread"
                ? "Unread Notifications"
                : `${typeLabels[filter as keyof typeof typeLabels]} Notifications`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="size-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs mt-1">
                {filter === "all"
                  ? "You're all caught up!"
                  : `No ${filter === "unread" ? "unread" : typeLabels[filter as keyof typeof typeLabels].toLowerCase()} notifications`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => {
                const Icon = typeIcons[notification.type]
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-4 p-4 hover:bg-secondary/50 transition-colors group",
                      !notification.read && "bg-primary/5",
                    )}
                  >
                    <div className={cn("p-2.5 rounded-full shrink-0", typeColors[notification.type])}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn("text-sm font-medium", !notification.read && "text-foreground")}>
                          {notification.title}
                        </p>
                        {!notification.read && <span className="size-2 rounded-full bg-primary shrink-0" />}
                        <Badge variant="outline" className="text-xs ml-auto shrink-0">
                          {typeLabels[notification.type]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-2">{notification.time}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(notification)}>
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => clearNotification(notification.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2.5 rounded-full", typeColors[selectedNotification.type])}>
                    {(() => {
                      const Icon = typeIcons[selectedNotification.type]
                      return <Icon className="size-5" />
                    })()}
                  </div>
                  <Badge variant="outline">{typeLabels[selectedNotification.type]}</Badge>
                </div>
                <DialogTitle>{selectedNotification.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground/70">{selectedNotification.time}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{selectedNotification.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Details</h4>
                  <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 whitespace-pre-wrap">
                    {selectedNotification.details}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      clearNotification(selectedNotification.id)
                      setDetailsOpen(false)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
