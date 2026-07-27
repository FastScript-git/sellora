import { createContactTimelineEvent } from "@/features/contacts/services/create-contact-timeline-event";
import { prisma } from "@/lib/prisma";

import type { LeadQualification } from "@/features/ai/services/qualify-lead-message";

type UpdateContactFromLeadQualificationInput = {
  workspaceId: string;
  contactId: string;
  qualification: LeadQualification;
};

type ContactLeadQualificationUpdates = {
  leadScore?: number;
  nextAction?: string;
};

export type ContactLeadQualificationUpdateResult = {
  updated: boolean;
  updatedFields: Array<
    "leadScore" | "nextAction"
  >;
};

function normalizeOptionalText(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}

function hasMeaningfulQualification(
  qualification: LeadQualification,
): boolean {
  return Boolean(
    qualification.leadScore > 0 ||
      qualification.purchaseIntent !== "NONE" ||
      qualification.interest ||
      qualification.nextAction ||
      qualification.reason,
  );
}

export async function updateContactFromLeadQualification({
  workspaceId,
  contactId,
  qualification,
}: UpdateContactFromLeadQualificationInput): Promise<ContactLeadQualificationUpdateResult> {
  if (!hasMeaningfulQualification(qualification)) {
    return {
      updated: false,
      updatedFields: [],
    };
  }

  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      workspaceId,
    },

    select: {
      id: true,
      leadScore: true,
      nextAction: true,
    },
  });

  if (!contact) {
    return {
      updated: false,
      updatedFields: [],
    };
  }

  const currentLeadScore =
    contact.leadScore ?? 0;

  const nextAction = normalizeOptionalText(
    qualification.nextAction,
  );

  const data: ContactLeadQualificationUpdates = {};

  const updatedFields: ContactLeadQualificationUpdateResult["updatedFields"] =
    [];

  if (
    qualification.leadScore >
    currentLeadScore
  ) {
    data.leadScore =
      qualification.leadScore;

    updatedFields.push("leadScore");
  }

  if (
    nextAction &&
    nextAction !== contact.nextAction
  ) {
    data.nextAction = nextAction;

    updatedFields.push("nextAction");
  }

  if (updatedFields.length === 0) {
    return {
      updated: false,
      updatedFields: [],
    };
  }

  await prisma.contact.update({
    where: {
      id: contact.id,
    },

    data,
  });

  const timelineEvents: Promise<void>[] = [];

  if (data.leadScore !== undefined) {
    timelineEvents.push(
      createContactTimelineEvent({
        workspaceId,
        contactId,
        type: "LEAD_SCORE_CHANGED",
        title: "Lead score increased",
        description:
          `${currentLeadScore} → ${data.leadScore}`,

        metadata: {
          source: "AI_LEAD_QUALIFICATION",
          previousScore: currentLeadScore,
          newScore: data.leadScore,
          purchaseIntent:
            qualification.purchaseIntent,
          interest:
            qualification.interest,
          reason:
            qualification.reason,
        },
      }),
    );
  }

  if (data.nextAction) {
    timelineEvents.push(
      createContactTimelineEvent({
        workspaceId,
        contactId,
        type: "AI_SUMMARY_UPDATED",
        title: "Next action recommended",
        description: data.nextAction,

        metadata: {
          source: "AI_LEAD_QUALIFICATION",
          purchaseIntent:
            qualification.purchaseIntent,
          leadScore:
            qualification.leadScore,
        },
      }),
    );
  }

  await Promise.all(timelineEvents);

  return {
    updated: true,
    updatedFields,
  };
}