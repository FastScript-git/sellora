import { Bot, UserRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConversationMessage } from "@/features/conversations/components/conversation-message";
import { getConversationDetails } from "@/features/conversations/services/get-conversation-details";

type Props = {
  conversationId: string;
  workspaceId: string;
};

export async function ConversationViewer({
  conversationId,
  workspaceId,
}: Props) {
  const conversation = await getConversationDetails({
    conversationId,
    workspaceId,
  });

  if (!conversation) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Conversation not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>
            {conversation.title ?? "Conversation"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {conversation.messages.map((message) => (
            <ConversationMessage
              key={message.id}
              role={message.role}
              content={message.content}
              createdAt={message.createdAt}
            />
          ))}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Employee</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Bot className="size-5 text-muted-foreground" />

              <div>
                <p className="font-medium">
                  {conversation.employee.name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {conversation.employee.role}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {conversation.contact ? (
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <UserRound className="size-5 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    {[
                      conversation.contact.firstName,
                      conversation.contact.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Anonymous"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {conversation.contact.email ?? "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  AI Summary
                </p>

                <p className="mt-2 text-sm leading-6">
                  {conversation.contact.summary ??
                    "No summary yet."}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm text-muted-foreground">
                  Lead Score
                </span>

                <span className="font-semibold">
                  {conversation.contact.leadScore ?? "—"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm text-muted-foreground">
                  Sentiment
                </span>

                <span className="font-semibold">
                  {conversation.contact.sentiment}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}