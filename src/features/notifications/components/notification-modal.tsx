"use client"

import { useRouter } from "next/navigation"
import { Bell, Check, Package, MessageSquare, Users, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useNotificationStore } from "@/features/notifications/stores/notification-store"
import { useState } from "react"

interface Notification {
  id: string
  type: "order" | "message" | "team" | "alert"
  title: string
  description: string
  time: string
  read: boolean
}

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

export function NotificationModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { notifications, markAsRead, markAllAsRead, clearNotification } = useNotificationStore()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleViewAll = () => {
    setOpen(false)
    router.push("/dashboard/notifications")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="size-5" />
          {unreadCount > 0 && <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
              >
                <Check className="size-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="size-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type]
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-4 hover:bg-secondary/50 transition-colors cursor-pointer group",
                      !notification.read && "bg-primary/5",
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={cn("p-2 rounded-full shrink-0", typeColors[notification.type])}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-medium truncate", !notification.read && "text-foreground")}>
                          {notification.title}
                        </p>
                        {!notification.read && <span className="size-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{notification.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{notification.time}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearNotification(notification.id)
                      }}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-border">
            <Button variant="outline" className="w-full text-sm bg-transparent" onClick={handleViewAll}>
              View All Notifications
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
