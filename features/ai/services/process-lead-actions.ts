import {
  qualifyLeadMessage,
  type LeadQualification,
} from "@/features/ai/services/qualify-lead-message";
import {
  updateContactFromLeadQualification,
  type ContactLeadQualificationUpdateResult,
} from "@/features/contacts/services/update-contact-from-lead-qualification";
import { createAiTask } from "@/features/tasks/services/create-ai-task";

type ProcessLeadActionsInput = {
  workspaceId: string;
  contactId: string;
  content: string;
};

export type ProcessLeadActionsResult = {
  qualification: LeadQualification;
  contactUpdate: ContactLeadQualificationUpdateResult;
};

export async function processLeadActions({
  workspaceId,
  contactId,
  content,
}: ProcessLeadActionsInput): Promise<ProcessLeadActionsResult> {
  const qualification =
    await qualifyLeadMessage(content);

  const contactUpdate =
    await updateContactFromLeadQualification({
      workspaceId,
      contactId,
      qualification,
    });

  if (qualification.nextAction) {
    await createAiTask({
      workspaceId,
      contactId,
      title: qualification.nextAction,
      description: qualification.reason,
    });
  }

  return {
    qualification,
    contactUpdate,
  };
}