"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@stores/auth-store";
import { useUiStore } from "@stores/ui-store";
import { ROUTES } from "@lib/constants";
import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { X, Home, Grid3X3, Tags, Plus, Bookmark, LayoutDashboard, LogOut, LogIn, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

const authenticatedLinks = [
  { href: ROUTES.HOME, label: "nav.home", icon: Home },
  { href: ROUTES.TOOLS, label: "nav.tools", icon: Grid3X3 },
  { href: ROUTES.CATEGORIES, label: "nav.categories", icon: Tags },
  { href: ROUTES.SUBMIT_TOOL, label: "nav.submitTool", icon: Plus },
  { href: ROUTES.DASHBOARD, label: "nav.dashboard", icon: LayoutDashboard },
  { href: ROUTES.DASHBOARD_BOOKMARKS, label: "nav.bookmarks", icon: Bookmark },
];

const guestLinks = [
  { href: ROUTES.HOME, label: "nav.home", icon: Home },
  { href: ROUTES.TOOLS, label: "nav.tools", icon: Grid3X3 },
  { href: ROUTES.CATEGORIES, label: "nav.categories", icon: Tags },
];

export function MobileNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuthStore();
  const { mobileNavOpen, toggleMobileNav } = useUiStore();

  const links = isAuthenticated ? authenticatedLinks : guestLinks;

  return (
    <AnimatePresence>
      {mobileNavOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={toggleMobileNav}
          />
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-background p-4 shadow-lg lg:hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-bold"
                onClick={toggleMobileNav}
              >
                <span className="text-primary">AI</span>
                <span>Tools</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMobileNav}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={toggleMobileNav}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {t(link.label)}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    logout();
                    toggleMobileNav();
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  {t("auth.logout")}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start gap-3">
                    <Link href={ROUTES.LOGIN} onClick={toggleMobileNav}>
                      <LogIn className="h-5 w-5" />
                      {t("auth.login")}
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start gap-3">
                    <Link href={ROUTES.REGISTER} onClick={toggleMobileNav}>
                      <UserPlus className="h-5 w-5" />
                      {t("auth.register")}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
