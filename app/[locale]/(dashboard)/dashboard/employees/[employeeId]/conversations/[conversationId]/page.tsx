import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConversationViewer } from "@/features/conversations/components/conversation-viewer";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type ConversationDetailsPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
    conversationId: string;
  }>;
};

export default async function ConversationDetailsPage({
  params,
}: ConversationDetailsPageProps) {
  const { locale, employeeId, conversationId } = await params;

  const workspace = await getCurrentWorkspace();

  const conversationsHref =
    `/${locale}/dashboard/employees/` +
    `${employeeId}/conversations`;

  const backLabel =
    locale === "uk"
      ? "До розмов"
      : "Back to conversations";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={conversationsHref} />}
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Button>

      <ConversationViewer
        conversationId={conversationId}
        employeeId={employeeId}
        workspaceId={workspace.id}
        locale={locale}
      />
    </div>
  );
}