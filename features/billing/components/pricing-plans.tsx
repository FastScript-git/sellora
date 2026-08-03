"use client";

import {
  Check,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BillingPeriod =
  | "monthly"
  | "yearly";

type PlanKey =
  | "free"
  | "pro"
  | "business";

type PricingPlansProps = {
  locale: string;

  translations: {
    title: string;
    description: string;

    monthly: string;
    yearly: string;
    yearlyDiscount: string;

    perMonth: string;
    perYear: string;
    monthlyEquivalent: string;
    save: string;

    current: string;
    upgrade: string;
    comingSoon: string;
    recommended: string;

    planNames: Record<
      PlanKey,
      string
    >;

    planDescriptions: Record<
      PlanKey,
      string
    >;

    features: Record<
      PlanKey,
      string[]
    >;
  };
};

const plans = [
  {
    key: "free" as const,
    monthlyPrice: 0,
    yearlyPrice: 0,
    highlighted: false,
    current: true,
  },
  {
    key: "pro" as const,
    monthlyPrice: 99,
    yearlyPrice: 990,
    highlighted: true,
    current: false,
  },
  {
    key: "business" as const,
    monthlyPrice: 299,
    yearlyPrice: 2990,
    highlighted: false,
    current: false,
  },
];

export function PricingPlans({
  locale,
  translations,
}: PricingPlansProps) {
  const [billingPeriod, setBillingPeriod] =
    useState<BillingPeriod>(
      "monthly",
    );

  const numberFormatter =
    new Intl.NumberFormat(
      locale === "uk"
        ? "uk-UA"
        : "en-US",
      {
        maximumFractionDigits: 0,
      },
    );

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {translations.title}
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {translations.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <div className="inline-flex w-full rounded-xl border bg-muted/30 p-1 sm:w-auto">
            <button
              type="button"
              onClick={() =>
                setBillingPeriod(
                  "monthly",
                )
              }
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
                billingPeriod ===
                  "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {translations.monthly}
            </button>

            <button
              type="button"
              onClick={() =>
                setBillingPeriod(
                  "yearly",
                )
              }
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
                billingPeriod ===
                  "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {translations.yearly}

              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-500">
                {translations.yearlyDiscount}
              </Badge>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const isYearly =
            billingPeriod ===
            "yearly";

          const displayedPrice =
            isYearly
              ? plan.yearlyPrice
              : plan.monthlyPrice;

          const yearlyMonthlyEquivalent =
            plan.yearlyPrice > 0
              ? Math.round(
                  plan.yearlyPrice /
                    12,
                )
              : 0;

          const yearlySaving =
            plan.monthlyPrice *
              12 -
            plan.yearlyPrice;

          return (
            <Card
              key={plan.key}
              className={cn(
                "relative flex min-w-0 flex-col",
                plan.highlighted &&
                  "border-primary shadow-sm",
              )}
            >
              {plan.highlighted ? (
                <Badge className="absolute right-4 top-4">
                  <Sparkles className="mr-1 size-3" />

                  {
                    translations.recommended
                  }
                </Badge>
              ) : null}

              <CardHeader>
                <CardTitle>
                  {
                    translations
                      .planNames[
                      plan.key
                    ]
                  }
                </CardTitle>

                <CardDescription className="min-h-12 leading-6">
                  {
                    translations
                      .planDescriptions[
                      plan.key
                    ]
                  }
                </CardDescription>

                <div className="pt-3">
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-semibold tracking-tight">
                      $
                      {numberFormatter.format(
                        displayedPrice,
                      )}
                    </span>

                    <span className="pb-1 text-sm text-muted-foreground">
                      {isYearly
                        ? translations.perYear
                        : translations.perMonth}
                    </span>
                  </div>

                  {isYearly &&
                  plan.yearlyPrice > 0 ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        $
                        {numberFormatter.format(
                          yearlyMonthlyEquivalent,
                        )}{" "}
                        {
                          translations.monthlyEquivalent
                        }
                      </p>

                      <p className="text-xs font-medium text-emerald-500">
                        {translations.save} $
                        {numberFormatter.format(
                          yearlySaving,
                        )}
                      </p>
                    </div>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-3">
                  {translations.features[
                    plan.key
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="size-3 text-primary" />
                      </span>

                      <span className="leading-5 text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  type="button"
                  variant={
                    plan.highlighted
                      ? "default"
                      : "outline"
                  }
                  disabled
                  className="mt-6 w-full"
                >
                  {plan.current
                    ? translations.current
                    : translations.upgrade}
                </Button>

                {!plan.current ? (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {
                      translations.comingSoon
                    }
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
