import {
  Bot,
  ContactRound,
  CreditCard,
  Database,
  Gauge,
  MessageSquare,
  Radio,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PricingPlans } from "@/features/billing/components/pricing-plans";
import { getWorkspaceBillingUsage } from "@/features/billing/repositories/billing.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

export const dynamic =
  "force-dynamic";

type BillingPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type PlanKey =
  | "free"
  | "pro"
  | "business";

type UsageItem = {
  key: string;
  label: string;
  value: number;
  limit: number | null;
  icon: typeof Bot;
};

export default async function BillingPage({
  params,
}: BillingPageProps) {
  const { locale } =
    await params;

  const workspace =
    await getCurrentWorkspace();

  const usage =
    await getWorkspaceBillingUsage({
      workspaceId: workspace.id,
    });

  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        eyebrow:
          "Підписка та використання",
        title:
          "Billing",
        description:
          "Переглядайте поточний тариф, використання ресурсів і доступні плани Sellora.",

        currentPlan:
          "Поточний тариф",
        freePlan:
          "Free",
        freeDescription:
          "Базовий тариф для тестування Sellora та запуску першого ШІ-співробітника.",
        active:
          "Активний",
        monthlyPrice:
          "$0 / місяць",
        paymentNotice:
          "Оплата ще не підключена. До інтеграції Stripe кнопки зміни тарифу не проводять списання.",

        usageTitle:
          "Використання",
        usageDescription:
          "Поточне використання ресурсів у цьому робочому просторі.",
        unlimited:
          "Без обмежень",
        used:
          "використано",

        aiEmployees:
          "ШІ-співробітники",
        contacts:
          "Контакти",
        workflows:
          "Автоматизації",
        conversations:
          "Розмови",
        messages:
          "Повідомлення",
        knowledgeSources:
          "Джерела знань",
        channels:
          "Канали",

        plansTitle:
          "Доступні тарифи",
        plansDescription:
          "Оберіть тариф відповідно до кількості ШІ-співробітників і обсягу роботи.",

        monthly:
          "Щомісяця",
        yearly:
          "Щороку",
        yearlyDiscount:
          "2 місяці безкоштовно",
        monthlyEquivalent:
          "/ місяць у перерахунку",
        save:
          "Економія",
        recommended:
          "Рекомендований",

        current:
          "Поточний тариф",
        upgrade:
          "Upgrade",
        comingSoon:
          "Оплата скоро",

        perMonth:
          "/ місяць",
        perYear:
          "/ рік",

        planNames: {
          free: "Free",
          pro: "Pro",
          business: "Business",
        } satisfies Record<
          PlanKey,
          string
        >,

        planDescriptions: {
          free:
            "Для тестування продукту та невеликого обсягу розмов.",
          pro:
            "Для малого бізнесу з кількома ШІ-співробітниками.",
          business:
            "Для команд із великим обсягом клієнтських звернень.",
        } satisfies Record<
          PlanKey,
          string
        >,

        features: {
          free: [
            "1 ШІ-співробітник",
            "100 контактів",
            "500 AI-повідомлень",
            "1 Website Widget",
            "Базова аналітика",
          ],

          pro: [
            "5 ШІ-співробітників",
            "5 000 контактів",
            "10 000 AI-повідомлень",
            "Необмежені джерела знань",
            "Автоматизації та аналітика",
          ],

          business: [
            "20 ШІ-співробітників",
            "50 000 контактів",
            "50 000 AI-повідомлень",
            "Командний доступ",
            "Пріоритетна підтримка",
          ],
        } satisfies Record<
          PlanKey,
          string[]
        >,
      }
    : {
        eyebrow:
          "Subscription and usage",
        title:
          "Billing",
        description:
          "Review your current plan, workspace usage and available Sellora plans.",

        currentPlan:
          "Current plan",
        freePlan:
          "Free",
        freeDescription:
          "A basic plan for testing Sellora and launching your first AI Employee.",
        active:
          "Active",
        monthlyPrice:
          "$0 / month",
        paymentNotice:
          "Payments are not connected yet. Upgrade buttons will not charge anything until Stripe is integrated.",

        usageTitle:
          "Usage",
        usageDescription:
          "Current resource usage in this workspace.",
        unlimited:
          "Unlimited",
        used:
          "used",

        aiEmployees:
          "AI Employees",
        contacts:
          "Contacts",
        workflows:
          "Automations",
        conversations:
          "Conversations",
        messages:
          "Messages",
        knowledgeSources:
          "Knowledge sources",
        channels:
          "Channels",

        plansTitle:
          "Available plans",
        plansDescription:
          "Choose a plan based on the size of your AI workforce and workload.",

        monthly:
          "Monthly",
        yearly:
          "Yearly",
        yearlyDiscount:
          "2 months free",
        monthlyEquivalent:
          "/ month equivalent",
        save:
          "Save",
        recommended:
          "Recommended",

        current:
          "Current plan",
        upgrade:
          "Upgrade",
        comingSoon:
          "Payments coming soon",

        perMonth:
          "/ month",
        perYear:
          "/ year",

        planNames: {
          free: "Free",
          pro: "Pro",
          business: "Business",
        } satisfies Record<
          PlanKey,
          string
        >,

        planDescriptions: {
          free:
            "For testing the product and handling a small conversation volume.",
          pro:
            "For small businesses with multiple AI Employees.",
          business:
            "For teams with a high volume of customer conversations.",
        } satisfies Record<
          PlanKey,
          string
        >,

        features: {
          free: [
            "1 AI Employee",
            "100 contacts",
            "500 AI messages",
            "1 Website Widget",
            "Basic analytics",
          ],

          pro: [
            "5 AI Employees",
            "5,000 contacts",
            "10,000 AI messages",
            "Unlimited knowledge sources",
            "Automations and analytics",
          ],

          business: [
            "20 AI Employees",
            "50,000 contacts",
            "50,000 AI messages",
            "Team access",
            "Priority support",
          ],
        } satisfies Record<
          PlanKey,
          string[]
        >,
      };

  const usageItems: UsageItem[] = [
    {
      key: "employees",
      label:
        copy.aiEmployees,
      value:
        usage.aiEmployees,
      limit: 1,
      icon: Bot,
    },

    {
      key: "contacts",
      label:
        copy.contacts,
      value:
        usage.contacts,
      limit: 100,
      icon: ContactRound,
    },

    {
      key: "messages",
      label:
        copy.messages,
      value:
        usage.messages,
      limit: 500,
      icon: MessageSquare,
    },

    {
      key: "workflows",
      label:
        copy.workflows,
      value:
        usage.workflows,
      limit: 3,
      icon: Workflow,
    },

    {
      key: "knowledge",
      label:
        copy.knowledgeSources,
      value:
        usage.knowledgeSources,
      limit: 10,
      icon: Database,
    },

    {
      key: "channels",
      label:
        copy.channels,
      value:
        usage.channels,
      limit: 1,
      icon: Radio,
    },
  ];

  const numberFormatter =
    new Intl.NumberFormat(
      isUkrainian
        ? "uk-UA"
        : "en-US",
    );

  return (
    <div className="min-w-0 space-y-8">
      <header>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <CreditCard className="size-3.5" />

          {copy.eyebrow}
        </div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {copy.title}
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy.description}
        </p>
      </header>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Sparkles className="size-5" />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.currentPlan}
                  </p>

                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                    {copy.active}
                  </Badge>
                </div>

                <h2 className="mt-2 text-2xl font-semibold">
                  {copy.freePlan}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {copy.freeDescription}
                </p>
              </div>
            </div>

            <div className="shrink-0 lg:text-right">
              <p className="text-2xl font-semibold">
                {copy.monthlyPrice}
              </p>

              <Button
                type="button"
                disabled
                className="mt-3 w-full sm:w-auto"
              >
                {copy.current}
              </Button>
            </div>
          </div>

          <div className="border-t bg-muted/20 px-5 py-4 text-sm leading-6 text-muted-foreground sm:px-6">
            {copy.paymentNotice}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {copy.usageTitle}
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {copy.usageDescription}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {usageItems.map(
            (item) => {
              const Icon =
                item.icon;

              const percentage =
                item.limit === null
                  ? 0
                  : Math.min(
                      100,
                      Math.round(
                        (item.value /
                          item.limit) *
                          100,
                      ),
                    );

              return (
                <Card
                  key={item.key}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                        <Icon className="size-4 text-muted-foreground" />
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {item.limit ===
                        null
                          ? copy.unlimited
                          : `${numberFormatter.format(
                              item.value,
                            )} / ${numberFormatter.format(
                              item.limit,
                            )}`}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-medium">
                      {item.label}
                    </p>

                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {numberFormatter.format(
                        item.value,
                      )}
                    </p>

                    {item.limit !==
                    null ? (
                      <>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-[width]",
                              percentage >=
                                90
                                ? "bg-destructive"
                                : percentage >=
                                    70
                                  ? "bg-amber-500"
                                  : "bg-primary",
                            )}
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {percentage}%{" "}
                          {copy.used}
                        </p>
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>

        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                <Gauge className="size-4 text-muted-foreground" />
              </span>

              <div>
                <p className="text-sm font-medium">
                  {copy.conversations}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.unlimited}
                </p>
              </div>
            </div>

            <span className="text-2xl font-semibold tabular-nums">
              {numberFormatter.format(
                usage.conversations,
              )}
            </span>
          </CardContent>
        </Card>
      </section>

      <PricingPlans
        locale={locale}
        translations={{
          title:
            copy.plansTitle,
          description:
            copy.plansDescription,

          monthly:
            copy.monthly,
          yearly:
            copy.yearly,
          yearlyDiscount:
            copy.yearlyDiscount,

          perMonth:
            copy.perMonth,
          perYear:
            copy.perYear,

          monthlyEquivalent:
            copy.monthlyEquivalent,

          save:
            copy.save,

          current:
            copy.current,
          upgrade:
            copy.upgrade,
          comingSoon:
            copy.comingSoon,
          recommended:
            copy.recommended,

          planNames:
            copy.planNames,

          planDescriptions:
            copy.planDescriptions,

          features:
            copy.features,
        }}
      />
    </div>
  );
}
