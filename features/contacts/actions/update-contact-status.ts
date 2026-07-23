"use server";

import type { ContactStatus } from "@/lib/generated/prisma/client";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateContactStatus } from "@/features/contacts/repositories/contact.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

const contactStatuses = [
  "LEAD",
  "QUALIFIED",
  "CUSTOMER",
  "CLOSED",
] as const satisfies readonly ContactStatus[];

const updateContactStatusSchema = z.object({
  contactId: z.string().min(1),
  status: z.enum(contactStatuses),
  locale: z.string().min(2).max(10),
});

export type UpdateContactStatusInput = z.infer<
  typeof updateContactStatusSchema
>;

type UpdateContactStatusResult =
  | {
      success: true;
      status: ContactStatus;
    }
  | {
      success: false;
      error: string;
    };

export async function updateContactStatusAction(
  input: UpdateContactStatusInput,
): Promise<UpdateContactStatusResult> {
  const parsedInput =
    updateContactStatusSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Invalid contact status data.",
    };
  }

  const { contactId, status, locale } =
    parsedInput.data;

  try {
    const workspace = await getCurrentWorkspace();

    const result = await updateContactStatus({
      contactId,
      workspaceId: workspace.id,
      status,
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Contact was not found.",
      };
    }

    revalidatePath(
      `/${locale}/dashboard/pipeline`,
    );

    revalidatePath(
      `/${locale}/dashboard/contacts`,
    );

    revalidatePath(
      `/${locale}/dashboard/contacts/${contactId}`,
    );

    return {
      success: true,
      status,
    };
  } catch (error) {
    console.error(
      "Failed to update contact status:",
      error,
    );

    return {
      success: false,
      error: "Failed to update contact status.",
    };
  }
}