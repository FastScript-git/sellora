import { extractContactDetails } from "@/features/ai/services/extract-contact-details";
import { processLeadActions } from "@/features/ai/services/process-lead-actions";
import { summarizeConversation } from "@/features/ai/services/summarize-conversation";
import { updateContactFromExtraction } from "@/features/contacts/services/update-contact-from-extraction";
import { updateContactSummary } from "@/features/contacts/services/update-contact-summary";

type ProcessConversationSideEffectsInput = {
  workspaceId: string;
  contactId: string;
  conversationId: string;
  content: string;
};

async function processContactExtraction({
  workspaceId,
  contactId,
  content,
}: Pick<
  ProcessConversationSideEffectsInput,
  "workspaceId" | "contactId" | "content"
>) {
  try {
    const extractedDetails =
      await extractContactDetails(
        content,
      );

    const updateResult =
      await updateContactFromExtraction({
        workspaceId,
        contactId,
        details:
          extractedDetails,
      });

    if (updateResult.updated) {
      console.info(
        "Contact details extracted from conversation message:",
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
  ProcessConversationSideEffectsInput,
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
        "Contact qualified from conversation message:",
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
      "Failed to process lead actions from message:",
      error,
    );
  }
}

async function processConversationSummary({
  workspaceId,
  contactId,
  conversationId,
}: Pick<
  ProcessConversationSideEffectsInput,
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
        "Contact summary updated from conversation:",
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

export async function processConversationPreResponseSideEffects({
  workspaceId,
  contactId,
  content,
}: Pick<
  ProcessConversationSideEffectsInput,
  "workspaceId" | "contactId" | "content"
>) {
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
}

export async function processConversationPostResponseSideEffects({
  workspaceId,
  contactId,
  conversationId,
}: Pick<
  ProcessConversationSideEffectsInput,
  "workspaceId" | "contactId" | "conversationId"
>) {
  await processConversationSummary({
    workspaceId,
    contactId,
    conversationId,
  });
}
