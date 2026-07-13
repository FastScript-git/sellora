import { prisma } from "@/lib/prisma";

const DEMO_WORKSPACE_SLUG = "demo-workspace";

export async function getCurrentWorkspace() {
  const workspace = await prisma.workspace.upsert({
    where: {
      slug: DEMO_WORKSPACE_SLUG,
    },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: DEMO_WORKSPACE_SLUG,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return workspace;
}