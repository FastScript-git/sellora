import { notFound } from "next/navigation";

import { WorkflowDetails } from "@/features/workflows/components/workflow-details";
import { getWorkflowById } from "@/features/workflows/repositories/workflow.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const dynamic = "force-dynamic";

type WorkflowDetailsPageProps = {
  params: Promise<{
    locale: string;
    workflowId: string;
  }>;
};

export default async function WorkflowDetailsPage({
  params,
}: WorkflowDetailsPageProps) {
  const { locale, workflowId } = await params;

  const workspace = await getCurrentWorkspace();

  const workflow = await getWorkflowById({
    workflowId,
    workspaceId: workspace.id,
  });

  if (!workflow) {
    notFound();
  }

  return (
    <WorkflowDetails
      workflow={workflow}
      locale={locale}
    />
  );
}
