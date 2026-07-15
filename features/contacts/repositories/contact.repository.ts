import { prisma } from "@/lib/prisma";

type CreateAnonymousContactParams = {
  workspaceId: string;
};

export async function createAnonymousContact({
  workspaceId,
}: CreateAnonymousContactParams) {
  return prisma.contact.create({
    data: {
      workspaceId,
    },
  });
}

type CreateContactParams = {
  workspaceId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  notes?: string | null;
};

export async function createContact({
  workspaceId,
  firstName,
  lastName,
  email,
  phone,
  company,
  jobTitle,
  notes,
}: CreateContactParams) {
  return prisma.contact.create({
    data: {
      workspaceId,
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      notes,
    },
  });
}

export async function getContactById({
  contactId,
  workspaceId,
}: {
  contactId: string;
  workspaceId: string;
}) {
  return prisma.contact.findFirst({
    where: {
      id: contactId,
      workspaceId,
    },
  });
}

export async function getContactsByWorkspace(
  workspaceId: string,
) {
  return prisma.contact.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: {
          conversations: true,
        },
      },
    },
  });
}