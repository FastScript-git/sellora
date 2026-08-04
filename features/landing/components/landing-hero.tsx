import Link from "next/link";
import {
  ArrowRight,
  Check,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

type LandingHeroProps = {
  locale: string;
};

const navigationItems = [
  {
    key: "features",
    href: "#features",
  },
  {
    key: "howItWorks",
    href: "#how-it-works",
  },
  {
    key: "pricing",
    href: "#pricing",
  },
  {
    key: "security",
    href: "#security",
  },
] as const;

export async function LandingHero({
  locale,
}: LandingHeroProps) {
  const t = await getTranslations({
    locale,
    namespace: "landingHero",
  });

  const dashboardHref =
    `/${locale}/dashboard`;

  const createEmployeeHref =
    `/${locale}/dashboard/employees/new`;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" />
            </span>

            <span className="text-lg font-semibold tracking-tight">
              Sellora
            </span>
          </Link>

          <nav
            aria-label="Landing navigation"
            className="hidden items-center gap-7 lg:flex"
          >
            {navigationItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(`navigation.${item.key}`)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={dashboardHref}
              className="hidden h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              {t("login")}
            </Link>

            <Link
              href={createEmployeeHref}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              {t("startFree")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pb-14 sm:pt-28 lg:px-8 lg:pb-16 lg:pt-30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[780px] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.22),transparent_58%)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-28 -z-10 size-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="mx-auto w-full max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            {t("badge")}
          </div>

          <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            {t("title")}

            <span className="mt-2 block bg-gradient-to-r from-blue-400 via-primary to-violet-400 bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-6 text-muted-foreground sm:text-base">
            {t("description")}
          </p>

          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href={createEmployeeHref}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:opacity-95 sm:w-auto"
            >
              {t("primaryAction")}
              <ArrowRight className="size-4" />
            </Link>

            <a
              href="#product-preview"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border bg-background/70 px-5 text-sm font-medium backdrop-blur transition-colors hover:bg-muted sm:w-auto"
            >
              <Play className="size-4" />
              {t("secondaryAction")}
            </a>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <HeroBenefit text={t("noCard")} />
            <HeroBenefit text={t("setup")} />
            <HeroBenefit text={t("cancel")} />
          </div>

          <div className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-xl border bg-card/60 px-3 py-2 text-left backdrop-blur">
            <ShieldCheck className="size-4 shrink-0 text-emerald-500" />

            <span className="text-xs leading-5 text-muted-foreground">
              {t("secure")}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

type HeroBenefitProps = {
  text: string;
};

function HeroBenefit({
  text,
}: HeroBenefitProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500/10">
        <Check className="size-2.5 text-emerald-500" />
      </span>

      {text}
    </span>
  );
}
