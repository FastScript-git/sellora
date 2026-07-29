import { prisma } from "@/lib/prisma";

type CreateAiTaskInput = {
  workspaceId: string;
  contactId: string;
  title: string;
  description?: string | null;
};

export async function createAiTask({
  workspaceId,
  contactId,
  title,
  description,
}: CreateAiTaskInput) {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return null;
  }

  const existingTask = await prisma.task.findFirst({
    where: {
      workspaceId,
      contactId,
      title: normalizedTitle,
      status: {
        in: ["TODO", "IN_PROGRESS"],
      },
    },
  });

  if (existingTask) {
    return existingTask;
  }

  return prisma.task.create({
    data: {
      workspaceId,
      contactId,
      title: normalizedTitle,
      description: description?.trim() || null,
      priority: "MEDIUM",
      status: "TODO",
    },
  });
}