import { create } from "zustand"

export interface Notification {
  id: string
  type: "order" | "message" | "team" | "alert"
  title: string
  description: string
  details: string
  time: string
  read: boolean
}

export const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    description: "Order #12345 has been placed for $299.99",
    details:
      "Customer Jane Smith placed an order for Wireless Headphones Pro (x1) and USB-C Charging Cable (x2). Shipping address: 123 Main St, New York, NY 10001. Payment method: Visa ending in 4242. Expected delivery: Dec 5, 2025.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "message",
    title: "Customer Message",
    description: "John Doe sent you a message about their order",
    details:
      "Message from John Doe: \"Hi, I wanted to check on the status of my order #12340. It's been a few days since I placed it and I haven't received any shipping updates yet. Could you please look into this? Thanks!\" - Received at 10:45 AM",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "team",
    title: "Team Member Added",
    description: "Sarah Johnson joined your team as an Editor",
    details:
      "Sarah Johnson (sarah.johnson@email.com) has been added to your team with Editor permissions. As an Editor, Sarah can: view and edit products, manage inventory levels, respond to customer messages, and generate basic reports. She cannot: access billing, manage team members, or delete products.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "4",
    type: "alert",
    title: "Low Stock Alert",
    description: "Wireless Headphones is running low (5 left)",
    details:
      "Product: Wireless Headphones Pro (SKU: WHP-001)\nCurrent stock: 5 units\nAverage daily sales: 3 units\nEstimated stock out: 2 days\nRecommended action: Reorder at least 50 units to maintain 2-week inventory buffer.\nSupplier: TechParts Inc. - Last order lead time was 5 business days.",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "order",
    title: "Order Shipped",
    description: "Order #12340 has been shipped successfully",
    details:
      "Order #12340 has been shipped via FedEx Ground.\nTracking number: 7891234567890\nShip date: Nov 28, 2025\nEstimated delivery: Dec 2, 2025\nDestination: 456 Oak Ave, Los Angeles, CA 90001\nItems: Smart Watch (x1), Watch Band - Navy (x1)\nCustomer has been notified via email.",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "6",
    type: "message",
    title: "Support Request",
    description: "New support ticket from Emily Brown",
    details:
      'Support Ticket #4521\nPriority: Medium\nCategory: Return Request\nCustomer: Emily Brown (emily.b@email.com)\nSubject: "Wrong size received"\nMessage: "I ordered a Medium t-shirt but received a Large. I would like to exchange it for the correct size. Order #12335."\nSuggested response: Apologize for the error and provide return shipping label.',
    time: "5 hours ago",
    read: true,
  },
]

interface NotificationStore {
  notifications: Notification[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: initialNotifications,
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
}))
