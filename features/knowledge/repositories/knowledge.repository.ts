import type {
  KnowledgeSourceStatus,
  KnowledgeSourceType,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateKnowledgeSourceData = {
  employeeId: string;
  type: KnowledgeSourceType;
  title: string;
  sourceUrl?: string | null;
  content?: string | null;
  storageKey?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
};

type GetKnowledgeSourceForEmployeeParams = {
  sourceId: string;
  employeeId: string;
};

export async function createKnowledgeSource(
  data: CreateKnowledgeSourceData,
) {
  return prisma.knowledgeSource.create({
    data,
  });
}

export async function getKnowledgeSources(
  employeeId: string,
) {
  return prisma.knowledgeSource.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: {
          chunks: true,
        },
      },
    },
  });
}

export async function updateKnowledgeSourceStatus({
  sourceId,
  status,
  content,
}: {
  sourceId: string;
  status: KnowledgeSourceStatus;
  content?: string | null;
}) {
  return prisma.knowledgeSource.update({
    where: {
      id: sourceId,
    },
    data: {
      status,
      ...(content !== undefined ? { content } : {}),
    },
  });
}

export async function deleteKnowledgeSource(id: string) {
  return prisma.knowledgeSource.delete({
    where: {
      id,
    },
  });
}

export async function getKnowledgeSourceById(
  id: string,
) {
  return prisma.knowledgeSource.findUnique({
    where: {
      id,
    },

    include: {
      chunks: {
        orderBy: {
          chunkIndex: "asc",
        },

        select: {
          id: true,
          chunkIndex: true,
          content: true,
          tokenCount: true,
          metadata: true,
          createdAt: true,
        },
      },

      indexJobs: {
        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          status: true,
          attempts: true,
          startedAt: true,
          finishedAt: true,
          error: true,
          createdAt: true,
          updatedAt: true,
        },
      },

      _count: {
        select: {
          chunks: true,
          indexJobs: true,
        },
      },
    },
  });
}

export async function getKnowledgeSourceForEmployee({
  sourceId,
  employeeId,
}: GetKnowledgeSourceForEmployeeParams) {
  return prisma.knowledgeSource.findFirst({
    where: {
      id: sourceId,
      employeeId,
    },
    select: {
      id: true,
      employeeId: true,
      type: true,
      title: true,
      status: true,
    },
  });
}
export type CreateDocumentKnowledgeSourceWithJobData = {
  employeeId: string;
  type: KnowledgeSourceType;
  title: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
};

export async function createDocumentKnowledgeSourceWithJob(
  data: CreateDocumentKnowledgeSourceWithJobData,
) {
  return prisma.$transaction(async (transaction) => {
    const source = await transaction.knowledgeSource.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        title: data.title,
        storageKey: data.storageKey,
        fileName: data.fileName,
        mimeType: data.mimeType,
        fileSizeBytes: data.fileSizeBytes,
      },
    });

    const indexJob = await transaction.knowledgeIndexJob.create({
      data: {
        knowledgeSourceId: source.id,
      },
    });

    return {
      source,
      indexJob,
    };
  });
}
type RenameKnowledgeSourceParams = {
  sourceId: string;
  employeeId: string;
  title: string;
};

export async function renameKnowledgeSource({
  sourceId,
  employeeId,
  title,
}: RenameKnowledgeSourceParams) {
  return prisma.knowledgeSource.updateMany({
    where: {
      id: sourceId,
      employeeId,
    },

    data: {
      title,
    },
  });
}

type DeleteKnowledgeSourceForEmployeeParams = {
  sourceId: string;
  employeeId: string;
};

export async function deleteKnowledgeSourceForEmployee({
  sourceId,
  employeeId,
}: DeleteKnowledgeSourceForEmployeeParams) {
  return prisma.knowledgeSource.deleteMany({
    where: {
      id: sourceId,
      employeeId,
    },
  });
}

type GetWorkspaceKnowledgeSourcesParams = {
  workspaceId: string;
  search?: string;
  employeeId?: string;
  type?: KnowledgeSourceType;
  status?: KnowledgeSourceStatus;
};

export async function getWorkspaceKnowledgeSources({
  workspaceId,
  search,
  employeeId,
  type,
  status,
}: GetWorkspaceKnowledgeSourcesParams) {
  const normalizedSearch = search?.trim();

  return prisma.knowledgeSource.findMany({
    where: {
      employee: {
        workspaceId,
      },

      ...(employeeId
        ? {
            employeeId,
          }
        : {}),

      ...(type
        ? {
            type,
          }
        : {}),

      ...(status
        ? {
            status,
          }
        : {}),

      ...(normalizedSearch
        ? {
            OR: [
              {
                title: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                fileName: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                sourceUrl: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                employee: {
                  name: {
                    contains: normalizedSearch,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      updatedAt: "desc",
    },

    select: {
      id: true,
      employeeId: true,
      type: true,
      title: true,
      sourceUrl: true,
      fileName: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      employee: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
      },

      _count: {
        select: {
          chunks: true,
          indexJobs: true,
        },
      },
    },
  });
}

export async function getWorkspaceKnowledgeEmployees(
  workspaceId: string,
) {
  return prisma.aIEmployee.findMany({
    where: {
      workspaceId,
      status: {
        not: "ARCHIVED",
      },
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      role: true,
      status: true,

      _count: {
        select: {
          knowledgeSources: true,
        },
      },
    },
  });
}
