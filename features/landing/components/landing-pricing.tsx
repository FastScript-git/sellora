"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import {
  useLocale,
  useTranslations,
} from "next-intl";
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

const plans = [
  {
    key: "free" as const,
    monthlyPrice: 0,
    yearlyPrice: 0,
    highlighted: false,
  },
  {
    key: "pro" as const,
    monthlyPrice: 99,
    yearlyPrice: 990,
    highlighted: true,
  },
  {
    key: "business" as const,
    monthlyPrice: 299,
    yearlyPrice: 2990,
    highlighted: false,
  },
];

export function LandingPricing() {
  const locale = useLocale();
  const t = useTranslations(
    "landingPricing",
  );

  const [
    billingPeriod,
    setBillingPeriod,
  ] = useState<BillingPeriod>(
    "monthly",
  );

  const isYearly =
    billingPeriod === "yearly";

  const createEmployeeHref =
    `/${locale}/dashboard/employees/new`;

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
    <section
      id="pricing"
      className="landing-section landing-section-muted"
    >
      <div className="landing-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">
            {t("eyebrow")}
          </p>

          <h2 className="landing-heading mt-2">
            {t("title")}
          </h2>

          <p className="landing-description mx-auto mt-3 max-w-2xl text-balance">
            {t("description")}
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex w-full max-w-md rounded-xl border bg-muted/30 p-1 sm:w-auto sm:max-w-none">
            <button
              type="button"
              onClick={() =>
                setBillingPeriod(
                  "monthly",
                )
              }
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:flex-none",
                !isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("monthly")}
            </button>

            <button
              type="button"
              onClick={() =>
                setBillingPeriod(
                  "yearly",
                )
              }
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:flex-none",
                isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("yearly")}

              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-500">
                {t("yearlyBadge")}
              </Badge>
            </button>
          </div>
        </div>

        <div className="mt-7 grid min-w-0 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
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

            const features =
              t.raw(
                `plans.${plan.key}.features`,
              ) as string[];

            return (
              <Card
                key={plan.key}
                className={cn(
                  "relative flex min-w-0 flex-col overflow-hidden",
                  plan.highlighted &&
                    "border-primary shadow-lg shadow-primary/10",
                )}
              >
                {plan.highlighted ? (
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
                ) : null}

                {plan.highlighted ? (
                  <Badge className="absolute right-4 top-4 gap-1">
                    <Sparkles className="size-3" />

                    {t("recommended")}
                  </Badge>
                ) : null}

                <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3">
                  <CardTitle className="text-xl">
                    {t(
                      `plans.${plan.key}.name`,
                    )}
                  </CardTitle>

                  <CardDescription className="max-w-sm text-sm leading-5 lg:min-h-10">
                    {t(
                      `plans.${plan.key}.description`,
                    )}
                  </CardDescription>

                  <div className="pt-2">
                    <div className="flex flex-wrap items-end gap-1">
                      <span className="text-3xl font-semibold tracking-tight">
                        $
                        {numberFormatter.format(
                          displayedPrice,
                        )}
                      </span>

                      <span className="pb-1 text-sm text-muted-foreground">
                        {isYearly
                          ? t("perYear")
                          : t("perMonth")}
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
                          {t(
                            "monthlyEquivalent",
                          )}
                        </p>

                        <p className="text-xs font-medium text-emerald-500">
                          {t("save")} $
                          {numberFormatter.format(
                            yearlySaving,
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 min-h-9" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col p-4 pt-1 sm:p-5 sm:pt-2">
                  <ul className="flex-1 space-y-2">
                    {features.map(
                      (feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm"
                        >
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Check className="size-3 text-primary" />
                          </span>

                          <span className="leading-5 text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>

                  <Button
                    className="mt-5 w-full"
                    variant={
                      plan.highlighted
                        ? "default"
                        : "outline"
                    }
                    nativeButton={false}
                    render={
                      <Link
                        href={
                          createEmployeeHref
                        }
                      />
                    }
                  >
                    {plan.key === "free"
                      ? t("current")
                      : t("upgrade")}

                    <ArrowRight className="ml-auto size-4" />
                  </Button>

                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    {t("noCard")}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
