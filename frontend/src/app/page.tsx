"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Search, Star, Grid3X3, Users, MessageSquare, Sparkles, TrendingUp, Clock, Mail, ChevronRight } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { ToolCard } from "@components/common/tool-card";
import { ToolGrid } from "@components/common/tool-grid";
import { CategoryCard } from "@components/common/category-card";
import { useTools, useFeaturedTools } from "@hooks/use-tools";
import { useCategories } from "@hooks/use-categories";
import { ROUTES, ITEMS_PER_PAGE } from "@lib/constants";

function StatsSection() {
  const t = useTranslations();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const locale = useLocale();
  const isRtl = locale === "ar";

  const stats = [
    { icon: Grid3X3, value: "500+", label: t("home.stats.tools") },
    { icon: Star, value: "20+", label: t("home.stats.categories") },
    { icon: Users, value: "50K+", label: t("home.stats.users") },
    { icon: MessageSquare, value: "10K+", label: t("home.stats.reviews") },
  ];

  return (
    <section ref={ref} className="container py-16 md:py-24">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 text-center"
          >
            <stat.icon className="h-8 w-8 text-primary mb-2" />
            <motion.span
              className="text-3xl font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.15 + 0.3, type: "spring", stiffness: 100 }}
            >
              {stat.value}
            </motion.span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeaturedToolsSection() {
  const t = useTranslations();
  const { data, isLoading, isError } = useFeaturedTools();
  const tools = data?.tools ?? [];

  return (
    <section className="border-t bg-muted/30 py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {t("home.featured")}
            </h2>
            <p className="text-muted-foreground mt-1">{t("home.featuredSubtitle")}</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href={ROUTES.TOOLS}>
              {t("common.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
        <ToolGrid tools={tools} isLoading={isLoading} isError={isError} variant="featured" />
      </div>
    </section>
  );
}

function CategoriesSection() {
  const t = useTranslations();
  const { data, isLoading } = useCategories();
  const categories = data?.categories ?? [];

  return (
    <section className="container py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("home.categories")}</h2>
          <p className="text-muted-foreground mt-1">{t("home.categoriesSubtitle")}</p>
        </div>
        <Button variant="ghost" asChild>
          <Link href={ROUTES.CATEGORIES}>
            {t("common.viewAll")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-5 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-muted mb-3" />
              <div className="h-5 w-32 bg-muted rounded mb-2" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
          ))
        ) : (
          categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <CategoryCard category={cat} />
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}

function TrendingSection() {
  const t = useTranslations();
  const { data, isLoading, isError } = useTools({ sort: "popular", perPage: 6 });
  const tools = data?.data ?? [];

  return (
    <section className="border-t bg-muted/30 py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              {t("tools.popular")}
            </h2>
            <p className="text-muted-foreground mt-1">Most trending AI tools right now</p>
          </div>
        </motion.div>
        <ToolGrid tools={tools} isLoading={isLoading} isError={isError} />
      </div>
    </section>
  );
}

function LatestSection() {
  const t = useTranslations();
  const { data, isLoading, isError } = useTools({ sort: "newest", perPage: 6 });
  const tools = data?.data ?? [];

  return (
    <section className="container py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            {t("tools.newest")}
          </h2>
          <p className="text-muted-foreground mt-1">Recently added AI tools</p>
        </div>
        <Button variant="ghost" asChild>
          <Link href={ROUTES.TOOLS + "?sort=newest"}>
            {t("common.viewAll")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
      <ToolGrid tools={tools} isLoading={isLoading} isError={isError} />
    </section>
  );
}

function CtaSection() {
  const t = useTranslations();

  return (
    <section className="border-t bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="container text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight">{t("home.cta.title")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("home.cta.subtitle")}</p>
        <Button size="lg" className="mt-6" asChild>
          <Link href={ROUTES.SUBMIT_TOOL}>
            {t("home.cta.button")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}

function NewsletterSection() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="container py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-lg text-center"
      >
        <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          {t("footer.newsletter")}
        </h2>
        {subscribed ? (
          <p className="text-emerald-600 font-medium">Thanks for subscribing!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder={t("footer.newsletterPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">{t("footer.subscribe")}</Button>
          </form>
        )}
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.TOOLS}?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <motion.div
          className="container text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t("home.hero.title")}
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t("home.hero.subtitle")}
          </motion.p>
          <motion.form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex w-full max-w-xl items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative flex-1">
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search.placeholder")}
                className={`flex h-12 w-full rounded-xl border border-input bg-background ${isRtl ? 'pr-10' : 'pl-10'} px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 rounded-xl">
              <Search className="h-5 w-5 mr-2" />
              {t("search.search")}
            </Button>
          </motion.form>
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" asChild>
              <Link href={ROUTES.TOOLS}>
                <Sparkles className="h-5 w-5 mr-2" />
                {t("home.hero.cta")}
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={ROUTES.SUBMIT_TOOL}>
                {t("home.hero.ctaSecondary")}
                <ArrowRight className={`${isRtl ? 'mr-2' : 'ml-2'} h-4 w-4`} />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <StatsSection />
      <LatestSection />
      <FeaturedToolsSection />
      <CategoriesSection />
      <TrendingSection />
      <CtaSection />
      <NewsletterSection />
    </div>
  );
}
