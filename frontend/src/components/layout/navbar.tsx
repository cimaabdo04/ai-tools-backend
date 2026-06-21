"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";
import { useAuthStore } from "@stores/auth-store";
import { useUiStore } from "@stores/ui-store";
import { ROUTES } from "@lib/constants";
import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { SearchInput } from "@components/ui/search-input";
import { Logo } from "@components/common/logo";
import { getInitials } from "@lib/utils";
import {
  Menu,
  X,
  Sun,
  Moon,
  Search,
  ChevronDown,
  Plus,
  Bookmark,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Trophy,
  Sparkles,
  Palette,
  PenLine,
  Users,
  Briefcase,
  Code2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";

const navLinks = [
  { href: ROUTES.TOOLS, label: "nav.tools" },
  { href: ROUTES.CATEGORIES, label: "nav.categories" },
  { href: ROUTES.PRICING, label: "nav.pricing" },
  { href: ROUTES.BLOG, label: "nav.blog" },
];

interface SettingsNavLink {
  label: string;
  href: string;
  children?: SettingsNavLink[];
}

const bestLinks = [
  { href: ROUTES.BEST.AI_TOOLS, label: "nav.bestAiTools", icon: Sparkles, color: "#6366f1" },
  { href: ROUTES.BEST.IMAGE_GENERATORS, label: "nav.bestImageGen", icon: Palette, color: "#ec4899" },
  { href: ROUTES.BEST.WRITING_TOOLS, label: "nav.bestWriting", icon: PenLine, color: "#8b5cf6" },
];

const useCaseLinks = [
  { href: ROUTES.USE_CASES.CONTENT_CREATION, label: "nav.useCaseContent", icon: PenLine, color: "#8b5cf6" },
  { href: ROUTES.USE_CASES.MARKETING, label: "nav.useCaseMarketing", icon: Briefcase, color: "#f59e0b" },
  { href: ROUTES.USE_CASES.DESIGNERS, label: "nav.useCaseDesigners", icon: Palette, color: "#ec4899" },
  { href: ROUTES.USE_CASES.DEVELOPERS, label: "nav.useCaseDevelopers", icon: Code2, color: "#10b981" },
];

export function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { mobileNavOpen, toggleMobileNav } = useUiStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  const isRtl = locale === "ar";

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<{ data: { navLinks?: string } }>("/settings"),
    staleTime: 300000,
  });

  const settingsNavLinks: SettingsNavLink[] = useMemo(() => {
    try {
      const raw = settingsData?.data?.navLinks;
      if (!raw) return [];
      const parsed = JSON.parse(typeof raw === "string" ? raw : "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [settingsData]);

  const activeNavLinks = settingsNavLinks.length > 0 ? settingsNavLinks : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1">
            {(activeNavLinks || navLinks).map((link: any) => {
              if (link.children?.length > 0) {
                return (
                  <DropdownMenu key={link.href || link.label}>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex items-center gap-1",
                        "text-muted-foreground"
                      )}>
                        {activeNavLinks ? link.label : t(link.label)}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRtl ? "end" : "start"} className="w-56">
                      {link.children.map((child: any) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link href={child.href} className="cursor-pointer">
                            {activeNavLinks ? child.label : t(child.label)}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {activeNavLinks ? link.label : t(link.label)}
                </Link>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex items-center gap-1",
                    bestLinks.some((l) => pathname.startsWith(l.href))
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  {t("nav.bestOf")}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRtl ? "end" : "start"} className="w-56">
                {bestLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="flex items-center justify-center h-6 w-6 rounded-md shrink-0" style={{ backgroundColor: `${link.color}1A` }}>
                          <Icon className="h-3.5 w-3.5" style={{ color: link.color }} />
                        </div>
                        {t(link.label)}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex items-center gap-1",
                    useCaseLinks.some((l) => pathname.startsWith(l.href))
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  {t("nav.useCases")}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRtl ? "end" : "start"} className="w-56">
                {useCaseLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="flex items-center justify-center h-6 w-6 rounded-md shrink-0" style={{ backgroundColor: `${link.color}1A` }}>
                          <Icon className="h-3.5 w-3.5" style={{ color: link.color }} />
                        </div>
                        {t(link.label)}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden xl:block w-72">
            <SearchInput
              placeholder={t("search.placeholder")}
              onSearch={(q) => {
                if (q) window.location.href = `${ROUTES.TOOLS}?search=${q}`;
              }}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label={t("search.toggle")}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                {!mounted ? (
                  <Sun className="h-4 w-4" />
                ) : theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-2" />
                {t("theme.light")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-2" />
                {t("theme.dark")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar ?? undefined} alt={user.name ?? ""} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.DASHBOARD}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t("nav.dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.DASHBOARD_BOOKMARKS}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    {t("nav.bookmarks")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.DASHBOARD_PROFILE}>
                    <User className="h-4 w-4 mr-2" />
                    {t("nav.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.DASHBOARD_SETTINGS}>
                    <Settings className="h-4 w-4 mr-2" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.ADMIN}>
                        <Settings className="h-4 w-4 mr-2" />
                        {t("nav.admin")}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href={ROUTES.LOGIN}>{t("auth.login")}</Link>
              </Button>
              <Button asChild>
                <Link href={ROUTES.REGISTER}>{t("auth.register")}</Link>
              </Button>
            </div>
          )}

          <Button asChild className="hidden xl:flex">
            <Link href={ROUTES.SUBMIT_TOOL}>
              <Plus className="h-4 w-4 mr-1" />
              {t("nav.submitTool")}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobileNav}
            aria-label={t("nav.toggle")}
          >
            {mobileNavOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="container pb-3 xl:hidden">
          <SearchInput
            placeholder={t("search.placeholder")}
            onSearch={(q) => {
              if (q) window.location.href = `${ROUTES.TOOLS}?search=${q}`;
              setSearchOpen(false);
            }}
          />
        </div>
      )}
    </header>
  );
}
