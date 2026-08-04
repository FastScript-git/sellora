import {
  BarChart3,
  Bot,
  Check,
  MessageSquare,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  LandingGrid,
  LandingSection,
  LandingSectionHeader,
  LandingSurface,
} from "@/features/landing/components/landing-section";
import { cn } from "@/lib/utils";

type LandingDashboardPreviewProps = {
  locale: string;
};

export async function LandingDashboardPreview({
  locale,
}: LandingDashboardPreviewProps) {
  const t = await getTranslations({
    locale,
    namespace: "landingDashboardPreview",
  });

  const navigationItems = [
    {
      label: t("navigation.dashboard"),
      icon: BarChart3,
      active: true,
    },
    {
      label: t("navigation.employees"),
      icon: Bot,
      active: false,
    },
    {
      label: t("navigation.conversations"),
      icon: MessageSquare,
      active: false,
    },
    {
      label: t("navigation.automations"),
      icon: Zap,
      active: false,
    },
    {
      label: t("navigation.contacts"),
      icon: Users,
      active: false,
    },
  ];

  return (
    <LandingSection
      id="product-preview"
      tone="muted"
      className="relative"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-32 -z-10 size-[560px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <LandingSectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <div className="relative mx-auto mt-7 max-w-6xl">
        <div
          aria-hidden="true"
          className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/10 blur-3xl"
        />

        <LandingSurface className="overflow-hidden bg-card/90 p-2 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="overflow-hidden rounded-xl border bg-background">
            <div className="flex h-12 items-center gap-2 border-b px-4">
              <span className="size-2.5 rounded-full bg-red-400/70" />
              <span className="size-2.5 rounded-full bg-amber-400/70" />
              <span className="size-2.5 rounded-full bg-emerald-400/70" />

              <div className="ml-3 h-6 min-w-0 flex-1 rounded-md bg-muted/60" />

              <span className="hidden rounded-md border px-2 py-1 text-[10px] text-muted-foreground sm:inline-flex">
                sellora.app
              </span>
            </div>

            <div className="grid min-h-[420px] md:grid-cols-[180px_minmax(0,1fr)]">
              <aside className="hidden border-r bg-muted/10 p-3 md:block">
                <div className="mb-7 flex items-center gap-2 px-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="size-4" />
                  </span>

                  <span className="text-sm font-semibold">
                    Sellora
                  </span>
                </div>

                <div className="space-y-1.5">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-lg px-3 text-xs",
                          item.active
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </aside>

              <div className="min-w-0 p-3 sm:p-4 lg:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
                      {t("navigation.dashboard")}
                    </p>

                    <h3 className="mt-2 truncate text-xl font-semibold sm:text-2xl">
                      {t("performance")}
                    </h3>
                  </div>

                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                    <BarChart3 className="size-4 text-muted-foreground" />
                  </span>
                </div>

                <LandingGrid
                  columns={3}
                  className="mt-4 gap-2 md:grid-cols-3"
                >
                  <PreviewMetric
                    label={t("metrics.conversations")}
                    value="1 248"
                    change="+18%"
                  />

                  <PreviewMetric
                    label={t("metrics.qualifiedLeads")}
                    value="286"
                    change="+24%"
                  />

                  <PreviewMetric
                    label={t("metrics.resolution")}
                    value="86%"
                    change="+7%"
                  />
                </LandingGrid>

                <LandingGrid
                  columns={2}
                  className="mt-3 gap-3 lg:grid-cols-2"
                >
                  <LandingSurface className="rounded-xl p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        {t("activeEmployee")}
                      </p>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-500">
                        <span className="size-1.5 rounded-full bg-current" />
                        {t("active")}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
                        <Bot className="size-5 text-muted-foreground" />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {t("employeeName")}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {t("employeeRole")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      <ProgressItem
                        label={t("metrics.conversations")}
                        value="82%"
                      />

                      <ProgressItem
                        label={t("metrics.qualifiedLeads")}
                        value="68%"
                      />

                      <ProgressItem
                        label={t("metrics.resolution")}
                        value="91%"
                      />
                    </div>
                  </LandingSurface>

                  <LandingSurface className="rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        {t("latestConversation")}
                      </p>

                      <MessageSquare className="size-4 text-muted-foreground" />
                    </div>

                    <div className="mt-4 rounded-xl border bg-muted/20 p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                          <Users className="size-4 text-muted-foreground" />
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {t("customer")}
                          </p>

                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {t("minutesAgo")}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-5 text-muted-foreground">
                        {t("customerMessage")}
                      </p>
                    </div>

                    <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <Bot className="size-4" />
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {t("employeeName")}
                          </p>

                          <p className="mt-0.5 text-[10px] text-primary">
                            {t("aiLabel")}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-5 text-muted-foreground">
                        {t("aiReply")}
                      </p>
                    </div>
                  </LandingSurface>
                </LandingGrid>

                <LandingSurface className="mt-3 overflow-hidden rounded-xl p-3">
                  <div className="flex h-20 items-end gap-1.5 sm:h-24 sm:gap-2">
                    {[
                      42,
                      58,
                      47,
                      72,
                      64,
                      88,
                      76,
                      94,
                      84,
                      100,
                      91,
                      96,
                    ].map((height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className="min-w-0 flex-1 rounded-t-md bg-primary/70"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    ))}
                  </div>
                </LandingSurface>
              </div>
            </div>
          </div>
        </LandingSurface>

        <LandingSurface className="absolute -bottom-5 left-4 hidden rounded-xl bg-card/95 p-3 shadow-xl backdrop-blur sm:block lg:left-12">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Check className="size-4 text-emerald-500" />
            </span>

            <div>
              <p className="text-xs font-medium">
                {t("leadQualified")}
              </p>

              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {t("automated")}
              </p>
            </div>
          </div>
        </LandingSurface>
      </div>
    </LandingSection>
  );
}

type PreviewMetricProps = {
  label: string;
  value: string;
  change: string;
};

function PreviewMetric({
  label,
  value,
  change,
}: PreviewMetricProps) {
  return (
    <LandingSurface className="rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs text-muted-foreground">
          {label}
        </p>

        <span className="text-xs font-medium text-emerald-500">
          {change}
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold tabular-nums">
        {value}
      </p>
    </LandingSurface>
  );
}

type ProgressItemProps = {
  label: string;
  value: string;
};

function ProgressItem({
  label,
  value,
}: ProgressItemProps) {
  const numericValue = Number.parseInt(
    value,
    10,
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-xs text-muted-foreground">
          {label}
        </span>

        <span className="shrink-0 text-xs font-medium">
          {value}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${numericValue}%`,
          }}
        />
      </div>
    </div>
  );
}