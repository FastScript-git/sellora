import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  MessageSquare,
  Radio,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LandingDashboardPreview } from "@/features/landing/components/landing-dashboard-preview";
import { LandingHero } from "@/features/landing/components/landing-hero";

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const featureItems = [
  {
    key: "employees",
    icon: Bot,
  },
  {
    key: "knowledge",
    icon: BookOpen,
  },
  {
    key: "conversations",
    icon: MessageSquare,
  },
  {
    key: "automations",
    icon: Workflow,
  },
  {
    key: "channels",
    icon: Radio,
  },
  {
    key: "analytics",
    icon: BarChart3,
  },
] as const;

const stepItems = [
  "create",
  "knowledge",
  "launch",
] as const;

const benefitItems = [
  "availability",
  "verifiedKnowledge",
  "consistentStyle",
  "scaling",
] as const;

export default async function HomePage({
  params,
}: HomePageProps) {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "landingPage",
  });

  const createEmployeeHref =
    `/${locale}/dashboard/employees/new`;

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <LandingHero locale={locale} />

      <main>
        <LandingDashboardPreview
          locale={locale}
        />

        <section
          id="features"
          className="border-b bg-card/30 px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-primary">
                {t("features.eyebrow")}
              </p>

              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {t("features.title")}
              </h2>

              <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
                {t("features.description")}
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2 lg:grid-cols-3">
              {featureItems.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.key}
                    className="min-w-0 bg-background p-7 transition-colors hover:bg-muted/20"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl border bg-muted/40">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <h3 className="mt-5 font-semibold">
                      {t(
                        `features.items.${feature.key}.title`,
                      )}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t(
                        `features.items.${feature.key}.description`,
                      )}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">
                {t("howItWorks.eyebrow")}
              </p>

              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {t("howItWorks.title")}
              </h2>

              <div className="mt-10 space-y-8">
                {stepItems.map((step) => (
                  <div
                    key={step}
                    className="flex min-w-0 gap-5"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-primary">
                      {t(
                        `howItWorks.steps.${step}.number`,
                      )}
                    </span>

                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        {t(
                          `howItWorks.steps.${step}.title`,
                        )}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {t(
                          `howItWorks.steps.${step}.description`,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border bg-card p-6 sm:p-8">
              <p className="text-sm font-medium">
                {t(
                  "howItWorks.benefitsTitle",
                )}
              </p>

              <div className="mt-6 space-y-4">
                {benefitItems.map(
                  (benefit) => (
                    <div
                      key={benefit}
                      className="flex min-w-0 items-start gap-3 rounded-xl border bg-background p-4"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="size-3 text-primary" />
                      </span>

                      <p className="min-w-0 text-sm leading-6 text-muted-foreground">
                        {t(
                          `howItWorks.benefits.${benefit}`,
                        )}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          id="security"
          className="border-y bg-card/30 px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl border bg-background">
              <ShieldCheck className="size-5 text-primary" />
            </span>

            <h2 className="mt-6 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("security.title")}
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t("security.description")}
            </p>
          </div>
        </section>

        <section
          id="pricing"
          className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
        >
          <div className="mx-auto max-w-5xl rounded-3xl border bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_65%)] px-6 py-16 text-center sm:px-12">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl border bg-background/70">
              <Sparkles className="size-5 text-primary" />
            </span>

            <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("cta.title")}
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t("cta.description")}
            </p>

            <Link
              href={createEmployeeHref}
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:opacity-95"
            >
              {t("cta.button")}

              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </span>

            <span className="text-sm font-semibold">
              Sellora
            </span>
          </Link>

          <p className="text-xs text-muted-foreground">
            {t("footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
