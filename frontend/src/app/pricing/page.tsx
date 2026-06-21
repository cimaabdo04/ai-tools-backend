"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Check, X, HelpCircle } from "lucide-react";
import { Button } from "@components/ui/button";
import { Switch } from "@components/ui/switch";
import { Badge } from "@components/ui/badge";
import {
  Dialog, DialogContent, DialogTrigger, DialogHeader,
} from "@components/ui/dialog";
import { cn } from "@lib/utils";

const plans = [
  {
    key: "starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for individuals exploring AI tools.",
    features: ["tools", "compare", "bookmarks"],
    notIncluded: ["reviews", "submit", "analytics", "api", "support", "custom"],
    cta: "pricing.getStarted",
  },
  {
    key: "professional",
    monthlyPrice: 19,
    yearlyPrice: 190,
    description: "For professionals who need more capabilities.",
    features: ["tools", "compare", "bookmarks", "reviews", "submit", "analytics"],
    notIncluded: ["api", "support", "custom"],
    popular: true,
    cta: "pricing.getStarted",
  },
  {
    key: "enterprise",
    monthlyPrice: 99,
    yearlyPrice: 990,
    description: "For teams and organizations with advanced needs.",
    features: ["tools", "compare", "bookmarks", "reviews", "submit", "analytics", "api", "support", "custom"],
    cta: "pricing.contactSales",
  },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes, the Starter plan is free forever. Professional and Enterprise plans come with a 14-day free trial.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.",
  },
];

export default function PricingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [yearly, setYearly] = useState(false);

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4">{t("pricing.title")}</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {t("pricing.subtitle")}
        </p>
      </motion.div>

      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={cn("text-sm", !yearly && "font-medium")}>{t("pricing.monthly")}</span>
        <Switch checked={yearly} onCheckedChange={setYearly} />
        <span className={cn("text-sm", yearly && "font-medium")}>{t("pricing.yearly")}</span>
        {yearly && (
          <Badge variant="success" className="ml-1">Save up to 20%</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative rounded-xl border bg-card p-6 flex flex-col",
              plan.popular && "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary"
            )}
          >
            {plan.popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                {t("pricing.popular")}
              </Badge>
            )}
            <div className="mb-6">
              <h3 className="text-lg font-semibold capitalize">{t(`pricing.${plan.key}`)}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.monthlyPrice === 0 ? "" : yearly ? "/year" : t("pricing.monthly").toLowerCase()}
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{t(`pricing.features.${f}`)}</span>
                </li>
              ))}
              {(plan.notIncluded ?? []).map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{t(`pricing.features.${f}`)}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? "default" : "outline"}
              className="w-full"
              asChild
            >
              <Link href={plan.monthlyPrice === 0 ? "/register" : "/checkout"}>
                {t(plan.cta)}
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto mt-20"
      >
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-lg border bg-card"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium">
                {faq.q}
                <HelpCircle className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-sm text-muted-foreground">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
