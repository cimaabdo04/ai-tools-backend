"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";
import { ROUTES } from "@lib/constants";
import { useCategories } from "@hooks/use-categories";
import {
  Twitter,
  Github,
  Linkedin,
  Mail,
  Heart,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@components/common/logo";
import { getCategoryName } from "@lib/utils";

interface SettingsFooterSection {
  title: string;
  links: { label: string; href: string }[];
}

const footerLinks = [
  {
    title: "footer.product",
    links: [
      { label: "nav.tools", href: ROUTES.TOOLS },
      { label: "nav.categories", href: ROUTES.CATEGORIES },
      { label: "nav.pricing", href: ROUTES.PRICING },
      { label: "nav.submitTool", href: ROUTES.SUBMIT_TOOL },
    ],
  },
  {
    title: "footer.company",
    links: [
      { label: "nav.about", href: ROUTES.ABOUT },
      { label: "nav.blog", href: ROUTES.BLOG },
      { label: "nav.contact", href: ROUTES.CONTACT },
      { label: "nav.faq", href: ROUTES.FAQ },
    ],
  },
  {
    title: "footer.legal",
    links: [
      { label: "footer.privacy", href: "/privacy" },
      { label: "footer.terms", href: "/terms" },
      { label: "footer.cookies", href: "/cookies" },
    ],
  },
];

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hello@aiatlas.com", label: "Email" },
];

export function Footer() {
  const t = useTranslations();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories?.slice(0, 6) || [];

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<{ data: { footerLinks?: string } }>("/settings"),
    staleTime: 300000,
  });

  const settingsFooterLinks: SettingsFooterSection[] = useMemo(() => {
    try {
      const raw = settingsData?.data?.footerLinks;
      if (!raw) return [];
      const parsed = JSON.parse(typeof raw === "string" ? raw : "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [settingsData]);

  const activeFooterLinks = settingsFooterLinks.length > 0 ? settingsFooterLinks : null;

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {(activeFooterLinks || footerLinks).map((group: any) => (
            <div key={group.title}>
              <h3 className="font-semibold text-sm mb-3">
                {activeFooterLinks ? group.title : t(group.title)}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link: any) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {activeFooterLinks ? link.label : t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {categories.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">
                {t("footer.categories")}
              </h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`${ROUTES.CATEGORIES}/${cat.slug}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {getCategoryName(cat)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={ROUTES.CATEGORIES}
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {t("footer.viewAll")}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="border-t">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {t("footer.madeWith")} <Heart className="h-3 w-3 text-red-500 fill-red-500" />{" "}
            {t("footer.by")}
          </p>
        </div>
      </div>
    </footer>
  );
}
