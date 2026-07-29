import { openai } from "@/lib/ai/openai";
import { prisma } from "@/lib/prisma";

type SummarizeConversationInput = {
  workspaceId: string;
  contactId: string;
  conversationId: string;
};

type ConversationSummaryContext = {
  currentSummary: string | null;

  contact: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    jobTitle: string | null;
    leadScore: number | null;
    nextAction: string | null;
  };

  messages: Array<{
    role: string;
    content: string;
  }>;
};

function normalizeOptionalText(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}

function buildContactContext(
  context: ConversationSummaryContext,
): string {
  const contactName = [
    context.contact.firstName,
    context.contact.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const contactDetails = [
    contactName
      ? `Name: ${contactName}`
      : null,

    context.contact.email
      ? `Email: ${context.contact.email}`
      : null,

    context.contact.phone
      ? `Phone: ${context.contact.phone}`
      : null,

    context.contact.company
      ? `Company: ${context.contact.company}`
      : null,

    context.contact.jobTitle
      ? `Job title: ${context.contact.jobTitle}`
      : null,

    typeof context.contact.leadScore === "number"
      ? `Lead score: ${context.contact.leadScore}`
      : null,

    context.contact.nextAction
      ? `Current next action: ${context.contact.nextAction}`
      : null,
  ].filter(
    (value): value is string =>
      Boolean(value),
  );

  return contactDetails.length > 0
    ? contactDetails.join("\n")
    : "No confirmed contact details are available.";
}

function buildConversationTranscript(
  messages: ConversationSummaryContext["messages"],
): string {
  return messages
    .map((message, index) => {
      const speaker =
        message.role === "USER"
          ? "Customer"
          : message.role === "ASSISTANT"
            ? "AI employee"
            : message.role;

      return `${index + 1}. ${speaker}: ${message.content}`;
    })
    .join("\n");
}

async function getConversationSummaryContext({
  workspaceId,
  contactId,
  conversationId,
}: SummarizeConversationInput): Promise<ConversationSummaryContext | null> {
  const conversation =
    await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        contactId,

        contact: {
          workspaceId,
        },
      },

      select: {
        contact: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: true,
            jobTitle: true,
            leadScore: true,
            nextAction: true,
            summary: true,
          },
        },

        messages: {
          orderBy: {
            createdAt: "desc",
          },

          take: 30,

          select: {
            role: true,
            content: true,
          },
        },
      },
    });

  if (!conversation?.contact) {
    return null;
  }

  return {
    currentSummary:
      conversation.contact.summary,

    contact: {
      firstName:
        conversation.contact.firstName,

      lastName:
        conversation.contact.lastName,

      email:
        conversation.contact.email,

      phone:
        conversation.contact.phone,

      company:
        conversation.contact.company,

      jobTitle:
        conversation.contact.jobTitle,

      leadScore:
        conversation.contact.leadScore,

      nextAction:
        conversation.contact.nextAction,
    },

    messages: conversation.messages
      .reverse()
      .map((message) => ({
        role: message.role,
        content: message.content,
      })),
  };
}

export async function summarizeConversation({
  workspaceId,
  contactId,
  conversationId,
}: SummarizeConversationInput): Promise<string | null> {
  try {
    const context =
      await getConversationSummaryContext({
        workspaceId,
        contactId,
        conversationId,
      });

    if (
      !context ||
      context.messages.length === 0
    ) {
      return null;
    }

    const contactContext =
      buildContactContext(context);

    const transcript =
      buildConversationTranscript(
        context.messages,
      );

    const response =
      await openai.responses.create({
        model: "gpt-4.1-mini",

        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: `
You create a concise CRM summary of a sales conversation.

The summary will be shown to a sales manager inside a contact card.

Rules:

1. Use only facts explicitly present in the contact details, previous summary, or conversation.
2. Never invent budget, urgency, authority, company size, purchase timing, or requirements.
3. Write the summary in the primary language used by the customer.
4. Keep the summary concise and useful.
5. Use plain text.
6. Do not use markdown headings, tables, JSON, or code blocks.
7. Use short labeled lines.
8. Include only relevant fields.
9. Possible fields include:
   - Client
   - Company
   - Need
   - Product or service interest
   - Team size
   - Budget
   - Urgency
   - Buying stage
   - Objections
   - Contact details
   - Next action
10. Omit fields that are unknown.
11. Preserve previously confirmed facts unless newer conversation information clearly updates them.
12. Do not mention that information is missing.
13. Do not describe the AI employee's behavior.
14. Maximum length: 900 characters.
                `.trim(),
              },
            ],
          },

          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `
Confirmed contact information:

${contactContext}

Previous CRM summary:

${context.currentSummary ?? "No previous summary."}

Conversation:

${transcript}

Create the updated CRM summary now.
                `.trim(),
              },
            ],
          },
        ],
      });

    return normalizeOptionalText(
      response.output_text,
    );
  } catch (error) {
    console.error(
      "Failed to summarize conversation:",
      error,
    );

    return null;
  }
}