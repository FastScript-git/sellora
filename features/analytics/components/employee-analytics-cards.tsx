import {
  BookOpen,
  MessageSquare,
  MessagesSquare,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type EmployeeAnalyticsCardsProps = {
  conversations: number;
  messages: number;
  contacts: number;
  knowledgeSources: number;
};

const cards = [
  {
    key: "conversations",
    label: "Conversations",
    icon: MessagesSquare,
  },
  {
    key: "messages",
    label: "Messages",
    icon: MessageSquare,
  },
  {
    key: "contacts",
    label: "Contacts",
    icon: Users,
  },
  {
    key: "knowledgeSources",
    label: "Knowledge Sources",
    icon: BookOpen,
  },
] as const;

export function EmployeeAnalyticsCards(
  props: EmployeeAnalyticsCardsProps,
) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.key}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {card.label}
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {props[card.key]}
                </p>
              </div>

              <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
                <Icon className="size-5 text-muted-foreground" />
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}