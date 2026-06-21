"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Switch } from "@components/ui/switch";
import { EmptyState } from "@components/common/empty-state";
import { formatRelativeDate } from "@lib/utils";
import {
  Bell, CheckCheck, Trash2, Info, AlertCircle, CheckCircle, AlertTriangle, Star, MessageSquare, Settings,
} from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error" | "review" | "message";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const mockNotifications: Notification[] = [
  { id: "n1", type: "success", title: "Tool Approved", message: "Your submission 'AI Writer Pro' has been approved and is now live.", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "n2", type: "review", title: "New Review", message: "Someone reviewed your tool 'ImageGenius' with 4 stars.", read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "n3", type: "warning", title: "Subscription Expiring", message: "Your Pro plan will renew in 3 days.", read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "n4", type: "message", title: "New Message", message: "You have a new message from the admin team.", read: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "n5", type: "info", title: "Feature Update", message: "We've added new comparison features. Check them out!", read: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "n6", type: "error", title: "Payment Failed", message: "Your last payment could not be processed. Please update your payment method.", read: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
];

const notificationIcons: Record<string, typeof Bell> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  review: Star,
  message: MessageSquare,
};

const notificationColors: Record<string, string> = {
  info: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  success: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  warning: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  error: "text-red-600 bg-red-100 dark:bg-red-900/30",
  review: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  message: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30",
};

export default function NotificationsPage() {
  const t = useTranslations();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && <Badge>{unreadCount} unread</Badge>}
          </div>
          <p className="text-muted-foreground mt-1">Stay updated with your activity</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />Mark all as read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowPreferences(!showPreferences)}>
            <Settings className="h-4 w-4 mr-2" />Preferences
          </Button>
        </div>
      </div>

      {showPreferences && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Control how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch checked={preferences.emailNotifications} onCheckedChange={(v) => setPreferences((p) => ({ ...p, emailNotifications: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive push notifications in your browser</p>
              </div>
              <Switch checked={preferences.pushNotifications} onCheckedChange={(v) => setPreferences((p) => ({ ...p, pushNotifications: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Marketing Emails</p>
                <p className="text-xs text-muted-foreground">Receive updates about new features and promotions</p>
              </div>
              <Switch checked={preferences.marketingEmails} onCheckedChange={(v) => setPreferences((p) => ({ ...p, marketingEmails: v }))} />
            </div>
          </CardContent>
        </Card>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          message="You're all caught up! Notifications will appear here when something happens."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = notificationIcons[n.type] ?? Bell;
            return (
              <Card
                key={n.id}
                className={`transition-colors ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}
                onClick={() => markAsRead(n.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${notificationColors[n.type] ?? "text-muted-foreground bg-muted"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!n.read ? "font-semibold" : ""}`}>{n.title}</p>
                        {!n.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(n.createdAt)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!n.read && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}>
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
