import { prisma } from "@/lib/prisma";

type GetWorkspaceSettingsParams = {
  workspaceId: string;
};

export async function getWorkspaceSettings({
  workspaceId,
}: GetWorkspaceSettingsParams) {
  return prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },

    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,

      _count: {
        select: {
          memberships: true,
          aiEmployees: true,
          contacts: true,
          tasks: true,
          workflows: true,
          meetings: true,
        },
      },
    },
  });
}

type UpdateWorkspaceNameParams = {
  workspaceId: string;
  name: string;
};

export async function updateWorkspaceName({
  workspaceId,
  name,
}: UpdateWorkspaceNameParams) {
  return prisma.workspace.updateMany({
    where: {
      id: workspaceId,
    },

    data: {
      name,
    },
  });
}
