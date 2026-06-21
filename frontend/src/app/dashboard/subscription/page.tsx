"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Dialog, DialogContent } from "@components/ui/dialog";
import { cn } from "@lib/utils";
import { Check, X, CreditCard, Crown, Zap, Building2, ArrowRight, AlertTriangle } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    description: "Perfect for exploring AI tools",
    features: ["Browse AI Tools", "Compare up to 3 tools", "Bookmark tools", "Write reviews"],
    notIncluded: ["Submit unlimited tools", "Advanced analytics", "API access", "Priority support"],
    popular: false,
    icon: Zap,
  },
  {
    id: "pro",
    name: "Professional",
    price: 19,
    period: "month",
    description: "For active contributors and power users",
    features: ["Everything in Starter", "Submit unlimited tools", "Advanced analytics", "Priority support", "API access (1000 req/day)", "Custom collections"],
    notIncluded: [],
    popular: true,
    icon: Crown,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    period: "month",
    description: "For teams and businesses",
    features: ["Everything in Professional", "Unlimited API access", "Dedicated account manager", "Custom integrations", "White-label options", "SLA guarantee"],
    notIncluded: [],
    popular: false,
    icon: Building2,
  },
];

const currentPlanId = "free";

export default function SubscriptionPage() {
  const t = useTranslations();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentPlan = plans.find((p) => p.id === currentPlanId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your plan and billing</p>
      </div>

      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{currentPlan?.name ?? "Free"} Plan</h2>
                {currentPlanId === "free" && <Badge variant="secondary">Current</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {currentPlanId === "free" ? "You are on the free plan. Upgrade to unlock more features." : "Your subscription is active."}
              </p>
              {currentPlanId !== "free" && (
                <p className="text-2xl font-bold mt-2">${currentPlan?.price}<span className="text-sm font-normal text-muted-foreground">/{currentPlan?.period}</span></p>
              )}
            </div>
          </div>
          {currentPlanId !== "free" && (
            <Button variant="outline" className="text-destructive border-destructive" onClick={() => setCancelDialogOpen(true)}>
              Cancel Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent title="Cancel Subscription" description="Are you sure you want to cancel? You will lose access to premium features at the end of your billing period.">
          <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 mb-4">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">What you'll lose:</p>
              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                <li>Unlimited tool submissions</li>
                <li>Advanced analytics</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Plan</Button>
            <Button variant="destructive">Confirm Cancellation</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {currentPlanId === "free" ? "Upgrade your plan" : "Change your plan"}
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.id === currentPlanId;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative transition-all",
                  plan.popular && "border-primary shadow-lg",
                  isCurrent && "border-primary/50",
                  !isCurrent && "hover:border-primary/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
                    {plan.price === 0 && <span className="text-muted-foreground ml-1">Free</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                    {plan.notIncluded.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X className="h-4 w-4 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                    disabled={isCurrent}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {isCurrent ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                    {!isCurrent && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment Method</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlanId === "free" ? (
            <p className="text-sm text-muted-foreground">No payment method on file. Upgrade to a paid plan to add one.</p>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-xs font-bold">VISA</div>
                <div>
                  <p className="text-sm font-medium">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/28</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Update</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
