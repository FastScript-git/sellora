import { getAIEmployees } from "@/features/ai-employees/queries";
import { WorkflowBuilder } from "@/features/workflows/components/workflow-builder";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const dynamic = "force-dynamic";

export default async function NewWorkflowPage() {
  const workspace = await getCurrentWorkspace();

  const employees = await getAIEmployees({
    workspaceId: workspace.id,
  });

  return (
    <WorkflowBuilder
      employees={employees.map((employee) => ({
        id: employee.id,
        name: employee.name,
        role: employee.role,
        status: employee.status,
      }))}
    />
  );
}
