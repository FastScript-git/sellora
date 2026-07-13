import { notFound } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";

type PageProps = {
  params: Promise<{
    employeeId: string;
  }>;
};

export default async function AIEmployeePage({
  params,
}: PageProps) {
  const { employeeId } = await params;

  const workspace = await getCurrentWorkspace();

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {employee.name}
        </h1>

        <p className="text-muted-foreground">
          {employee.role}
        </p>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="font-semibold">
          Description
        </h2>

        <p className="mt-3 text-muted-foreground">
          {employee.description || "No description"}
        </p>
      </div>
    </div>
  );
}