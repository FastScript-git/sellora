import {
  BookOpen,
  MessageSquare,
  MessagesSquare,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type EmployeeAnalyticsCardsProps = {
  conversations: number;
  messages: number;
  contacts: number;
  knowledgeSources: number;
  locale: string;
};

export function EmployeeAnalyticsCards({
  conversations,
  messages,
  contacts,
  knowledgeSources,
  locale,
}: EmployeeAnalyticsCardsProps) {
  const t = useTranslations(
    "aiEmployeeAnalytics.metrics",
  );

  const numberFormatter =
    new Intl.NumberFormat(locale);

  const cards = [
    {
      key: "conversations",
      label: t("conversations"),
      value: conversations,
      icon: MessagesSquare,
    },
    {
      key: "messages",
      label: t("messages"),
      value: messages,
      icon: MessageSquare,
    },
    {
      key: "contacts",
      label: t("contacts"),
      value: contacts,
      icon: Users,
    },
    {
      key: "knowledgeSources",
      label: t("knowledgeSources"),
      value: knowledgeSources,
      icon: BookOpen,
    },
  ] as const;

  return (
    <section
      aria-label={t("label")}
      className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className="min-w-0"
          >
            <CardContent className="flex min-h-28 min-w-0 items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="break-words text-xs leading-5 text-muted-foreground">
                  {card.label}
                </p>

                <p className="mt-2 break-all text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                  {numberFormatter.format(
                    card.value,
                  )}
                </p>
              </div>

              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40 sm:size-11">
                <Icon className="size-4 text-muted-foreground sm:size-5" />
              </span>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
