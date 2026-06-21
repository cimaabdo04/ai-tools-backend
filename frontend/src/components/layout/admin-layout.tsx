"use client";

import { type ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@lib/utils";
import { ROUTES } from "@lib/constants";
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  Tags,
  Star,
  Settings,
  ChevronRight,
  Shield,
  BarChart3,
  Flag,
  FileText,
  Edit,
  DollarSign,
  CreditCard,
  Image,
  Link2,
  TrendingUp,
  BookOpen,
  Languages,
  Palette,
  ClipboardList,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@stores/auth-store";
import { ScrollArea } from "@components/ui/scroll-area";

const adminLinks = [
  { href: ROUTES.ADMIN, label: "admin.overview", icon: LayoutDashboard },
  { href: ROUTES.ADMIN_USERS, label: "admin.users", icon: Users },
  { href: ROUTES.ADMIN_TOOLS, label: "admin.tools", icon: Grid3X3 },
  { href: ROUTES.ADMIN_CATEGORIES, label: "admin.categories", icon: Tags },
  { href: "/admin/tags", label: "admin.tags", icon: FileText },
  { href: ROUTES.ADMIN_REVIEWS, label: "admin.reviews", icon: Star },
  { href: "/admin/reports", label: "admin.reports", icon: Flag },
  { href: "/admin/claims", label: "admin.claims", icon: FileText },
  { href: "/admin/edits", label: "admin.edits", icon: Edit },
  { href: "/admin/pricing", label: "admin.pricing", icon: DollarSign },
  { href: "/admin/subscriptions", label: "admin.subscriptions", icon: ShoppingCart },
  { href: "/admin/payments", label: "admin.payments", icon: CreditCard },
  { href: "/admin/banners", label: "admin.banners", icon: Image },
  { href: "/admin/affiliates", label: "admin.affiliates", icon: Link2 },
  { href: "/admin/analytics", label: "admin.analytics", icon: TrendingUp },
  { href: "/admin/cms/pages", label: "admin.cmsPages", icon: BookOpen },
  { href: "/admin/cms/blog", label: "admin.blog", icon: Edit },
  { href: "/admin/cms/translations", label: "admin.translations", icon: Languages },
  { href: "/admin/white-label", label: "admin.whiteLabel", icon: Palette },
  { href: "/admin/audit-logs", label: "admin.auditLogs", icon: ClipboardList },
  { href: ROUTES.ADMIN_SETTINGS, label: "admin.settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN"))) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleNav = (href: string) => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <button
        className="lg:hidden fixed top-20 right-4 z-50 h-10 w-10 rounded-lg bg-background border shadow-sm flex items-center justify-center"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 flex-col border-r bg-card transition-transform duration-200",
        "lg:flex",
        sidebarOpen ? "flex" : "hidden"
      )}>
        <div className="flex items-center gap-2 p-4 border-b">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">{t("admin.title")}</span>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== ROUTES.ADMIN && pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNav(link.href)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{t(link.label)}</span>
                </Link>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={ROUTES.DASHBOARD}>
              <BarChart3 className="h-4 w-4 ml-2" />
              {t("admin.backToDashboard")}
            </Link>
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
