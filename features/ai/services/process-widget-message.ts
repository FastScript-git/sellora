import { extractContactDetails } from "@/features/ai/services/extract-contact-details";
import { generateConversationResponse } from "@/features/ai/services/generate-conversation-response";
import { processLeadActions } from "@/features/ai/services/process-lead-actions";
import { summarizeConversation } from "@/features/ai/services/summarize-conversation";
import { updateContactFromExtraction } from "@/features/contacts/services/update-contact-from-extraction";
import { updateContactSummary } from "@/features/contacts/services/update-contact-summary";

type ProcessWidgetMessageInput = {
  workspaceId: string;
  contactId: string;
  conversationId: string;
  userMessageId: string;
  content: string;
};

export type ProcessWidgetMessageResult = {
  assistantMessage: Awaited<
    ReturnType<typeof generateConversationResponse>
  > | null;

  warning: string | null;
};

async function processContactExtraction({
  workspaceId,
  contactId,
  content,
}: Pick<
  ProcessWidgetMessageInput,
  "workspaceId" | "contactId" | "content"
>) {
  try {
    const extractedDetails =
      await extractContactDetails(content);

    const updateResult =
      await updateContactFromExtraction({
        workspaceId,
        contactId,
        details: extractedDetails,
      });

    if (updateResult.updated) {
      console.info(
        "Contact details extracted from widget message:",
        {
          contactId,
          updatedFields:
            updateResult.updatedFields,
        },
      );
    }
  } catch (error) {
    console.error(
      "Failed to update contact from message extraction:",
      error,
    );
  }
}

async function processLeadQualification({
  workspaceId,
  contactId,
  content,
}: Pick<
  ProcessWidgetMessageInput,
  "workspaceId" | "contactId" | "content"
>) {
  try {
    const {
      qualification,
      contactUpdate,
    } = await processLeadActions({
      workspaceId,
      contactId,
      content,
    });

    if (contactUpdate.updated) {
      console.info(
        "Contact qualified from widget message:",
        {
          contactId,
          leadScore:
            qualification.leadScore,
          purchaseIntent:
            qualification.purchaseIntent,
          updatedFields:
            contactUpdate.updatedFields,
        },
      );
    }
  } catch (error) {
    console.error(
      "Failed to process lead actions from widget message:",
      error,
    );
  }
}

async function processConversationSummary({
  workspaceId,
  contactId,
  conversationId,
}: Pick<
  ProcessWidgetMessageInput,
  "workspaceId" | "contactId" | "conversationId"
>) {
  try {
    const summary =
      await summarizeConversation({
        workspaceId,
        contactId,
        conversationId,
      });

    const updateResult =
      await updateContactSummary({
        workspaceId,
        contactId,
        summary,
      });

    if (updateResult.updated) {
      console.info(
        "Contact summary updated from widget conversation:",
        {
          contactId,
          conversationId,
        },
      );
    }
  } catch (error) {
    console.error(
      "Failed to update contact conversation summary:",
      error,
    );
  }
}

export async function processWidgetMessage({
  workspaceId,
  contactId,
  conversationId,
  userMessageId,
  content,
}: ProcessWidgetMessageInput): Promise<ProcessWidgetMessageResult> {
  await Promise.all([
    processContactExtraction({
      workspaceId,
      contactId,
      content,
    }),

    processLeadQualification({
      workspaceId,
      contactId,
      content,
    }),
  ]);

  let assistantMessage: Awaited<
    ReturnType<typeof generateConversationResponse>
  > | null = null;

  let warning: string | null = null;

  try {
    assistantMessage =
      await generateConversationResponse({
        conversationId,
        userMessageId,
      });
  } catch (error) {
    console.error(
      "Failed to generate AI response:",
      error,
    );

    warning =
      "The AI employee could not generate a response.";
  }

  await processConversationSummary({
    workspaceId,
    contactId,
    conversationId,
  });

  return {
    assistantMessage,
    warning,
  };
}