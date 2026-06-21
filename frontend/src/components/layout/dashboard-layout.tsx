"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@lib/utils";
import { ROUTES } from "@lib/constants";
import { useUiStore } from "@stores/ui-store";
import { useAuthStore } from "@stores/auth-store";
import {
  LayoutDashboard,
  Grid3X3,
  Bookmark,
  Star,
  User,
  Settings,
  ChevronLeft,
  Menu,
  FolderKanban,
  PlusCircle,
  FileText,
  Shield,
  PenLine,
  CreditCard,
  Receipt,
  Key,
  Bell,
  MessageSquare,
  Link2,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { useTranslations } from "next-intl";

const sidebarLinks = [
  { href: ROUTES.DASHBOARD, label: "dashboard.overview", icon: LayoutDashboard },
  { href: ROUTES.DASHBOARD_SUBMISSIONS, label: "dashboard.mySubmissions", icon: FileText },
  { href: ROUTES.DASHBOARD_SUBMIT, label: "dashboard.submitTool", icon: PlusCircle },
  { href: ROUTES.DASHBOARD_BOOKMARKS, label: "dashboard.bookmarks", icon: Bookmark },
  { href: ROUTES.DASHBOARD_COLLECTIONS, label: "dashboard.collections", icon: FolderKanban },
  { href: ROUTES.DASHBOARD_REVIEWS, label: "dashboard.reviews", icon: Star },
  { href: ROUTES.DASHBOARD_CLAIMS, label: "dashboard.claims", icon: Shield },
  { href: ROUTES.DASHBOARD_EDITS, label: "dashboard.edits", icon: PenLine },
  { href: ROUTES.DASHBOARD_SUBSCRIPTION, label: "dashboard.subscription", icon: CreditCard },
  { href: ROUTES.DASHBOARD_BILLING, label: "dashboard.billing", icon: Receipt },
  { href: ROUTES.DASHBOARD_API_KEYS, label: "dashboard.apiKeys", icon: Key },
  { href: ROUTES.DASHBOARD_NOTIFICATIONS, label: "dashboard.notifications", icon: Bell },
  { href: ROUTES.DASHBOARD_MESSAGES, label: "dashboard.messages", icon: MessageSquare },
  { href: ROUTES.DASHBOARD_AFFILIATES, label: "dashboard.affiliates", icon: Link2 },
  { href: ROUTES.DASHBOARD_PROFILE, label: "dashboard.profile", icon: User },
  { href: ROUTES.DASHBOARD_SETTINGS, label: "dashboard.settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && (
            <span className="text-sm font-semibold">{t("dashboard.title")}</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(!sidebarOpen && "mx-auto")}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                !sidebarOpen && "rotate-180"
              )}
            />
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !sidebarOpen && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{t(link.label)}</span>}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && user && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {(user.name ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-2 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-semibold">{t("dashboard.title")}</h2>
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
