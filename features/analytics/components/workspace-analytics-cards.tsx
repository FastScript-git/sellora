import {
  Bot,
  CircleCheckBig,
  Gauge,
  MessageSquare,
  MessagesSquare,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type WorkspaceAnalyticsCardsProps = {
  locale: string;
  conversationsLast30Days: number;
  openConversations: number;
  messagesLast30Days: number;
  qualifiedLeads: number;
  averageLeadScore: number | null;
  activeEmployees: number;
};

export function WorkspaceAnalyticsCards({
  locale,
  conversationsLast30Days,
  openConversations,
  messagesLast30Days,
  qualifiedLeads,
  averageLeadScore,
  activeEmployees,
}: WorkspaceAnalyticsCardsProps) {
  const isUkrainian = locale === "uk";

  const cards = [
    {
      key: "conversations",
      label: isUkrainian
        ? "Розмови за 30 днів"
        : "Conversations in 30 days",
      value: conversationsLast30Days,
      icon: MessagesSquare,
    },
    {
      key: "open",
      label: isUkrainian
        ? "Відкриті розмови"
        : "Open conversations",
      value: openConversations,
      icon: MessageSquare,
    },
    {
      key: "messages",
      label: isUkrainian
        ? "Повідомлення за 30 днів"
        : "Messages in 30 days",
      value: messagesLast30Days,
      icon: CircleCheckBig,
    },
    {
      key: "qualified",
      label: isUkrainian
        ? "Кваліфіковані ліди"
        : "Qualified leads",
      value: qualifiedLeads,
      icon: Users,
    },
    {
      key: "lead-score",
      label: isUkrainian
        ? "Середній Lead Score"
        : "Average lead score",
      value:
        averageLeadScore !== null
          ? `${averageLeadScore}/100`
          : "—",
      icon: Gauge,
    },
    {
      key: "employees",
      label: isUkrainian
        ? "Активні AI-співробітники"
        : "Active AI employees",
      value: activeEmployees,
      icon: Bot,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.key}>
            <CardContent className="flex min-h-36 flex-col justify-between p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-5 text-muted-foreground">
                  {card.label}
                </p>

                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                  <Icon className="size-4 text-muted-foreground" />
                </span>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight">
                {card.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
