import { prisma } from "@/lib/prisma";

import type { ExtractedContactDetails } from "@/features/ai/services/extract-contact-details";

type UpdateContactFromExtractionInput = {
  workspaceId: string;
  contactId: string;
  details: ExtractedContactDetails;
};

type ContactFieldUpdates = {
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

function hasExtractedContactDetails(
  details: ExtractedContactDetails,
): boolean {
  return Boolean(
    details.firstName ||
      details.lastName ||
      details.email ||
      details.phone ||
      details.company ||
      details.jobTitle,
  );
}

export async function updateContactFromExtraction({
  workspaceId,
  contactId,
  details,
}: UpdateContactFromExtractionInput): Promise<ContactExtractionUpdateResult> {
  if (!hasExtractedContactDetails(details)) {
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

  const data: ContactFieldUpdates = {};
  const updatedFields: ContactExtractionUpdateResult["updatedFields"] =
    [];

  if (!contact.firstName && details.firstName) {
    data.firstName = details.firstName;
    updatedFields.push("firstName");
  }

  if (!contact.lastName && details.lastName) {
    data.lastName = details.lastName;
    updatedFields.push("lastName");
  }

  if (!contact.email && details.email) {
    data.email = details.email;
    updatedFields.push("email");
  }

  if (!contact.phone && details.phone) {
    data.phone = details.phone;
    updatedFields.push("phone");
  }

  if (!contact.company && details.company) {
    data.company = details.company;
    updatedFields.push("company");
  }

  if (!contact.jobTitle && details.jobTitle) {
    data.jobTitle = details.jobTitle;
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

  return {
    updated: true,
    updatedFields,
  };
}