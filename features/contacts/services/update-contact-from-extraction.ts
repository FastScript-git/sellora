import { createContactTimelineEvent } from "@/features/contacts/services/create-contact-timeline-event";
import { prisma } from "@/lib/prisma";

import type { ExtractedContactDetails } from "@/features/ai/services/extract-contact-details";

type UpdateContactFromExtractionInput = {
  workspaceId: string;
  contactId: string;
  details: ExtractedContactDetails;
};

type ContactExtractionUpdates = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
};

export type ContactExtractionUpdateResult = {
  updated: boolean;
  updatedFields: Array<
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "company"
    | "jobTitle"
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

function buildDetectedName(
  firstName: string | null,
  lastName: string | null,
): string | null {
  const name = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name.length > 0
    ? name
    : null;
}

export async function updateContactFromExtraction({
  workspaceId,
  contactId,
  details,
}: UpdateContactFromExtractionInput): Promise<ContactExtractionUpdateResult> {
  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      workspaceId,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      company: true,
      jobTitle: true,
    },
  });

  if (!contact) {
    return {
      updated: false,
      updatedFields: [],
    };
  }

  const normalizedDetails = {
    firstName: normalizeOptionalText(
      details.firstName,
    ),

    lastName: normalizeOptionalText(
      details.lastName,
    ),

    email: normalizeOptionalText(
      details.email,
    )?.toLowerCase() ?? null,

    phone: normalizeOptionalText(
      details.phone,
    ),

    company: normalizeOptionalText(
      details.company,
    ),

    jobTitle: normalizeOptionalText(
      details.jobTitle,
    ),
  };

  const data: ContactExtractionUpdates = {};

  const updatedFields: ContactExtractionUpdateResult["updatedFields"] =
    [];

  if (
    !contact.firstName &&
    normalizedDetails.firstName
  ) {
    data.firstName =
      normalizedDetails.firstName;

    updatedFields.push("firstName");
  }

  if (
    !contact.lastName &&
    normalizedDetails.lastName
  ) {
    data.lastName =
      normalizedDetails.lastName;

    updatedFields.push("lastName");
  }

  if (
    !contact.email &&
    normalizedDetails.email
  ) {
    data.email =
      normalizedDetails.email;

    updatedFields.push("email");
  }

  if (
    !contact.phone &&
    normalizedDetails.phone
  ) {
    data.phone =
      normalizedDetails.phone;

    updatedFields.push("phone");
  }

  if (
    !contact.company &&
    normalizedDetails.company
  ) {
    data.company =
      normalizedDetails.company;

    updatedFields.push("company");
  }

  if (
    !contact.jobTitle &&
    normalizedDetails.jobTitle
  ) {
    data.jobTitle =
      normalizedDetails.jobTitle;

    updatedFields.push("jobTitle");
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

  const detectedName = buildDetectedName(
    data.firstName ?? null,
    data.lastName ?? null,
  );

  const timelineEvents: Promise<void>[] = [];

  if (detectedName) {
    timelineEvents.push(
      createContactTimelineEvent({
        workspaceId,
        contactId,
        type: "TAGS_UPDATED",
        title: "Contact name detected",
        description: detectedName,
        metadata: {
          source: "AI_CONTACT_EXTRACTION",
          fields: updatedFields.filter(
            (field) =>
              field === "firstName" ||
              field === "lastName",
          ),
        },
      }),
    );
  }

  if (data.email) {
    timelineEvents.push(
      createContactTimelineEvent({
        workspaceId,
        contactId,
        type: "TAGS_UPDATED",
        title: "Email detected",
        description: data.email,
        metadata: {
          source: "AI_CONTACT_EXTRACTION",
          field: "email",
        },
      }),
    );
  }

  if (data.phone) {
    timelineEvents.push(
      createContactTimelineEvent({
        workspaceId,
        contactId,
        type: "TAGS_UPDATED",
        title: "Phone detected",
        description: data.phone,
        metadata: {
          source: "AI_CONTACT_EXTRACTION",
          field: "phone",
        },
      }),
    );
  }

  if (data.company) {
    timelineEvents.push(
      createContactTimelineEvent({
        workspaceId,
        contactId,
        type: "TAGS_UPDATED",
        title: "Company detected",
        description: data.company,
        metadata: {
          source: "AI_CONTACT_EXTRACTION",
          field: "company",
        },
      }),
    );
  }

  if (data.jobTitle) {
    timelineEvents.push(
      createContactTimelineEvent({
        workspaceId,
        contactId,
        type: "TAGS_UPDATED",
        title: "Job title detected",
        description: data.jobTitle,
        metadata: {
          source: "AI_CONTACT_EXTRACTION",
          field: "jobTitle",
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