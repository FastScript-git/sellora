import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

function createWorkspaceSlug(
  externalAuthId: string,
) {
  const normalizedId = externalAuthId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `workspace-${normalizedId}`;
}

function createWorkspaceName({
  firstName,
  lastName,
  email,
}: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const fullName = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return `${fullName}'s Workspace`;
  }

  const emailName =
    email.split("@")[0]?.trim();

  if (emailName) {
    return `${emailName}'s Workspace`;
  }

  return "My Workspace";
}

export async function getCurrentWorkspace() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error(
      "Authentication is required to access a workspace.",
    );
  }

  const primaryEmail =
    clerkUser.primaryEmailAddress
      ?.emailAddress ??
    clerkUser.emailAddresses[0]
      ?.emailAddress;

  if (!primaryEmail) {
    throw new Error(
      "The authenticated user does not have an email address.",
    );
  }

  const normalizedEmail =
    primaryEmail.trim().toLowerCase();

  const existingUser =
    await prisma.user.findUnique({
      where: {
        externalAuthId: clerkUser.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        memberships: {
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
          select: {
            workspace: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

  if (existingUser) {
    const userNeedsUpdate =
      existingUser.email !==
        normalizedEmail ||
      existingUser.firstName !==
        clerkUser.firstName ||
      existingUser.lastName !==
        clerkUser.lastName ||
      existingUser.imageUrl !==
        clerkUser.imageUrl;

    if (userNeedsUpdate) {
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          email: normalizedEmail,
          firstName:
            clerkUser.firstName,
          lastName:
            clerkUser.lastName,
          imageUrl:
            clerkUser.imageUrl,
        },
      });
    }

    const membership =
      existingUser.memberships[0];

    if (membership) {
      return membership.workspace;
    }

    return prisma.workspace.create({
      data: {
        name: createWorkspaceName({
          firstName:
            clerkUser.firstName,
          lastName:
            clerkUser.lastName,
          email: normalizedEmail,
        }),
        slug: createWorkspaceSlug(
          clerkUser.id,
        ),
        memberships: {
          create: {
            userId: existingUser.id,
            role: "OWNER",
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }

  const existingUserByEmail =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        memberships: {
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
          select: {
            workspace: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

  if (existingUserByEmail) {
    const updatedUser =
      await prisma.user.update({
        where: {
          id: existingUserByEmail.id,
        },
        data: {
          externalAuthId:
            clerkUser.id,
          firstName:
            clerkUser.firstName,
          lastName:
            clerkUser.lastName,
          imageUrl:
            clerkUser.imageUrl,
        },
        select: {
          id: true,
        },
      });

    const membership =
      existingUserByEmail
        .memberships[0];

    if (membership) {
      return membership.workspace;
    }

    return prisma.workspace.create({
      data: {
        name: createWorkspaceName({
          firstName:
            clerkUser.firstName,
          lastName:
            clerkUser.lastName,
          email: normalizedEmail,
        }),
        slug: createWorkspaceSlug(
          clerkUser.id,
        ),
        memberships: {
          create: {
            userId: updatedUser.id,
            role: "OWNER",
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }

  const createdUser =
    await prisma.user.create({
      data: {
        externalAuthId:
          clerkUser.id,
        email: normalizedEmail,
        firstName:
          clerkUser.firstName,
        lastName:
          clerkUser.lastName,
        imageUrl:
          clerkUser.imageUrl,
      },
      select: {
        id: true,
      },
    });

  return prisma.workspace.create({
    data: {
      name: createWorkspaceName({
        firstName:
          clerkUser.firstName,
        lastName:
          clerkUser.lastName,
        email: normalizedEmail,
      }),
      slug: createWorkspaceSlug(
        clerkUser.id,
      ),
      memberships: {
        create: {
          userId: createdUser.id,
          role: "OWNER",
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}