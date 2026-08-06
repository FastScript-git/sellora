import { NextResponse } from "next/server";

import { processWidgetMessage } from "@/features/ai/services/process-widget-message";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    widgetKey: string;
  }>;
};

type CreateWidgetMessageBody = {
  conversationId?: string;
  content?: string;

  visitor?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
};

type WidgetMessage = {
  id: string;
  role:
    | "USER"
    | "ASSISTANT"
    | "OPERATOR"
    | "SYSTEM";
  content: string;
  createdAt: Date;
};

type WidgetMessageResult = {
  conversationId: string;
  contactId: string;
  message: WidgetMessage;
  isNewConversation: boolean;
};

function normalizeOptionalText(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : undefined;
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const { widgetKey } = await context.params;

    const normalizedWidgetKey = widgetKey.trim();

    if (!normalizedWidgetKey) {
      return NextResponse.json(
        {
          error: "Widget key is required.",
        },
        {
          status: 400,
        },
      );
    }

    let body: CreateWidgetMessageBody;

    try {
      body =
        (await request.json()) as CreateWidgetMessageBody;
    } catch {
      return NextResponse.json(
        {
          error: "Request body must be valid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    const content = normalizeOptionalText(body.content);

    if (!content) {
      return NextResponse.json(
        {
          error: "Message content is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (content.length > 10_000) {
      return NextResponse.json(
        {
          error:
            "Message content must not exceed 10000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const requestedConversationId =
      normalizeOptionalText(body.conversationId);

    const visitor = {
      firstName: normalizeOptionalText(
        body.visitor?.firstName,
      ),

      lastName: normalizeOptionalText(
        body.visitor?.lastName,
      ),

      email: normalizeOptionalText(
        body.visitor?.email,
      )?.toLowerCase(),

      phone: normalizeOptionalText(
        body.visitor?.phone,
      ),
    };

    const channel = await prisma.channel.findFirst({
      where: {
        widgetKey: normalizedWidgetKey,
        type: "WEBSITE",
        isEnabled: true,
      },

      select: {
        id: true,
        name: true,
        employeeId: true,

        employee: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
            status: true,
          },
        },
      },
    });

    if (!channel) {
      return NextResponse.json(
        {
          error:
            "Website chat channel was not found or is disabled.",
        },
        {
          status: 404,
        },
      );
    }

    if (channel.employee.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "The AI employee assigned to this widget is not active.",
        },
        {
          status: 409,
        },
      );
    }

    const now = new Date();

    const result =
      await prisma.$transaction<WidgetMessageResult>(
        async (transaction) => {
          if (requestedConversationId) {
            const existingConversation =
              await transaction.conversation.findFirst({
                where: {
                  id: requestedConversationId,
                  employeeId: channel.employeeId,
                  channelId: channel.id,
                },

                select: {
                  id: true,
                  contactId: true,
                },
              });

            if (!existingConversation) {
              throw new Error(
                "WIDGET_CONVERSATION_NOT_FOUND",
              );
            }

            const message =
              await transaction.conversationMessage.create({
                data: {
                  conversationId:
                    existingConversation.id,
                  role: "USER",
                  content,

                  metadata: {
                    source: "WEBSITE_WIDGET",
                  },
                },

                select: {
                  id: true,
                  role: true,
                  content: true,
                  createdAt: true,
                },
              });

            await transaction.conversation.update({
              where: {
                id: existingConversation.id,
              },

              data: {
                status: "OPEN",

                unreadCount: {
                  increment: 1,
                },

                lastMessageAt: now,
                closedAt: null,
              },
            });

            if (existingConversation.contactId) {
              await transaction.contact.update({
                where: {
                  id: existingConversation.contactId,
                },

                data: {
                  lastInteractionAt: now,

                  ...(visitor.firstName
                    ? {
                        firstName:
                          visitor.firstName,
                      }
                    : {}),

                  ...(visitor.lastName
                    ? {
                        lastName:
                          visitor.lastName,
                      }
                    : {}),

                  ...(visitor.email
                    ? {
                        email: visitor.email,
                      }
                    : {}),

                  ...(visitor.phone
                    ? {
                        phone: visitor.phone,
                      }
                    : {}),
                },
              });
            }

            if (!existingConversation.contactId) {
              throw new Error(
                "WIDGET_CONTACT_NOT_FOUND",
              );
            }

            return {
              conversationId:
                existingConversation.id,

              contactId:
                existingConversation.contactId,

              message,

              isNewConversation: false,
            };
          }

          let contactId: string | undefined;

          if (visitor.email) {
            const existingContact =
              await transaction.contact.findFirst({
                where: {
                  workspaceId:
                    channel.employee.workspaceId,

                  email: visitor.email,
                },

                select: {
                  id: true,
                },
              });

            if (existingContact) {
              contactId = existingContact.id;

              await transaction.contact.update({
                where: {
                  id: existingContact.id,
                },

                data: {
                  lastInteractionAt: now,

                  ...(visitor.firstName
                    ? {
                        firstName:
                          visitor.firstName,
                      }
                    : {}),

                  ...(visitor.lastName
                    ? {
                        lastName:
                          visitor.lastName,
                      }
                    : {}),

                  ...(visitor.phone
                    ? {
                        phone: visitor.phone,
                      }
                    : {}),
                },
              });
            }
          }

          if (!contactId) {
            const contact =
              await transaction.contact.create({
                data: {
                  workspaceId:
                    channel.employee.workspaceId,

                  firstName: visitor.firstName,
                  lastName: visitor.lastName,
                  email: visitor.email,
                  phone: visitor.phone,
                  lastInteractionAt: now,
                },

                select: {
                  id: true,
                },
              });

            contactId = contact.id;
          }

          const conversation =
            await transaction.conversation.create({
              data: {
                employeeId: channel.employeeId,
                contactId,
                channelId: channel.id,

                title:
                  visitor.firstName ||
                  visitor.email ||
                  "Website visitor",

                status: "OPEN",
                unreadCount: 1,
                lastMessageAt: now,

                messages: {
                  create: {
                    role: "USER",
                    content,

                    metadata: {
                      source: "WEBSITE_WIDGET",
                    },
                  },
                },
              },

              select: {
                id: true,

                messages: {
                  take: 1,

                  orderBy: {
                    createdAt: "desc",
                  },

                  select: {
                    id: true,
                    role: true,
                    content: true,
                    createdAt: true,
                  },
                },
              },
            });

          const message = conversation.messages[0];

          if (!message) {
            throw new Error(
              "WIDGET_MESSAGE_CREATION_FAILED",
            );
          }

          return {
            conversationId: conversation.id,
            contactId,
            message,
            isNewConversation: true,
          };
        },
      );

    const aiResult = await processWidgetMessage({
      workspaceId:
        channel.employee.workspaceId,

      contactId: result.contactId,

      conversationId:
        result.conversationId,

      userMessageId:
        result.message.id,

      content,
    });

    return NextResponse.json(
      {
        data: {
          conversationId:
            result.conversationId,

          message: result.message,

          assistantMessage:
            aiResult.assistantMessage,

          isNewConversation:
            result.isNewConversation,

          channel: {
            id: channel.id,
            name: channel.name,
          },

          employee: {
            id: channel.employee.id,
            name: channel.employee.name,
          },
        },

        warning: aiResult.warning,
      },
      {
        status: result.isNewConversation
          ? 201
          : 200,
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "WIDGET_CONVERSATION_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          error:
            "Conversation was not found for this widget.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "WIDGET_CONTACT_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          error:
            "The contact connected to this conversation was not found.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "WIDGET_MESSAGE_CREATION_FAILED"
    ) {
      return NextResponse.json(
        {
          error:
            "The message could not be created.",
        },
        {
          status: 500,
        },
      );
    }

    console.error(
      "Failed to create website widget message:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while sending the message.",
      },
      {
        status: 500,
      },
    );
  }
}