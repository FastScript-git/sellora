import {
  ConversationRole,
  Prisma,
  type Conversation,
  type ConversationMessage,
  type ConversationMode,
  type WorkspaceRole,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type AssignedMemberSummary = {
  id: string;
  role: WorkspaceRole;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl: string | null;
  };
};

export type EmployeeConversationListItem =
  Conversation & {
    messages: Array<
      Pick<
        ConversationMessage,
        "id" | "role" | "content" | "createdAt"
      >
    >;

    assignedMember: AssignedMemberSummary | null;

    _count: {
      messages: number;
    };
  };

export type ConversationWithMessages =
  Conversation & {
    messages: ConversationMessage[];

    assignedMember: AssignedMemberSummary | null;

    _count: {
      messages: number;
    };
  };

type CreateConversationParams = {
  employeeId: string;
  contactId?: string | null;
  channelId?: string | null;
  title?: string | null;
};

export async function createConversation({
  employeeId,
  contactId,
  channelId,
  title,
}: CreateConversationParams) {
  return prisma.conversation.create({
    data: {
      employeeId,
      contactId,
      channelId,
      title,
    },
  });
}

type CreateConversationMessageParams = {
  conversationId: string;
  role: ConversationRole;
  content: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createConversationMessage({
  conversationId,
  role,
  content,
  metadata,
}: CreateConversationMessageParams) {
  return prisma.$transaction(
    async (transaction) => {
      const message =
        await transaction.conversationMessage.create({
          data: {
            conversationId,
            role,
            content,
            metadata,
          },
        });

      await transaction.conversation.update({
        where: {
          id: conversationId,
        },

        data: {
          lastMessageAt: message.createdAt,
        },
      });

      return message;
    },
  );
}

export async function getConversationWithMessages(
  conversationId: string,
): Promise<ConversationWithMessages | null> {
  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },

      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },

        assignedMember: {
          select: {
            id: true,
            role: true,

            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },

        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

  return conversation as unknown as
    | ConversationWithMessages
    | null;
}

type GetEmployeeConversationParams = {
  conversationId: string;
  employeeId: string;
};

export async function getEmployeeConversation({
  conversationId,
  employeeId,
}: GetEmployeeConversationParams): Promise<ConversationWithMessages | null> {
  const conversation =
    await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        employeeId,
      },

      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },

        assignedMember: {
          select: {
            id: true,
            role: true,

            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },

        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

  return conversation as unknown as
    | ConversationWithMessages
    | null;
}

export async function getConversationsByEmployee(
  employeeId: string,
): Promise<EmployeeConversationListItem[]> {
  const conversations =
    await prisma.conversation.findMany({
      where: {
        employeeId,
      },

      orderBy: [
        {
          lastMessageAt: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],

      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,

          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },

        assignedMember: {
          select: {
            id: true,
            role: true,

            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },

        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

  return conversations as unknown as
    EmployeeConversationListItem[];
}

type UpdateConversationModeParams = {
  conversationId: string;
  employeeId: string;
  mode: ConversationMode;
};

export async function updateConversationMode({
  conversationId,
  employeeId,
  mode,
}: UpdateConversationModeParams) {
  return prisma.conversation.updateMany({
    where: {
      id: conversationId,
      employeeId,
    },

    data: {
      mode,
    },
  });
}

type AssignConversationMemberParams = {
  conversationId: string;
  employeeId: string;
  assignedMemberId: string | null;
};

export async function assignConversationMember({
  conversationId,
  employeeId,
  assignedMemberId,
}: AssignConversationMemberParams) {
  return prisma.conversation.updateMany({
    where: {
      id: conversationId,
      employeeId,
    },

    data: {
      assignedMemberId,
    },
  });
}

export async function getWorkspaceMembers(
  workspaceId: string,
) {
  return prisma.workspaceMember.findMany({
    where: {
      workspaceId,
    },

    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      role: true,

      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true,
        },
      },
    },
  });
}
