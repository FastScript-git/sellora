import { notFound } from "next/navigation";

import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { TestChatPanel } from "@/features/test-chat/components/test-chat-panel";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type TestChatPageProps = {
  params: Promise<{
    employeeId: string;
  }>;
};

export default async function TestChatPage({
  params,
}: TestChatPageProps) {
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
    <div className="mx-auto w-full max-w-5xl">
      <TestChatPanel employeeName={employee.name} />
    </div>
  );
}