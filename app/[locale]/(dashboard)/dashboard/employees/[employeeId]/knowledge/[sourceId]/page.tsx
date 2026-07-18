import { notFound } from "next/navigation";

import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import { getKnowledgeSourceById } from "@/features/knowledge/repositories/knowledge.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type PageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
    sourceId: string;
  }>;
};

export default async function KnowledgeSourcePage({
  params,
}: PageProps) {
  const { employeeId, sourceId } = await params;

  const workspace = await getCurrentWorkspace();

  const hasAccess = await aiEmployeeBelongsToWorkspace({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!hasAccess) {
    notFound();
  }

  const source = await getKnowledgeSourceById(sourceId);

  if (!source || source.employeeId !== employeeId) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{source.title}</h1>

        <p className="mt-2 text-muted-foreground">
          {source.type}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-2 font-semibold">
            {source.status}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            Chunks
          </p>

          <p className="mt-2 font-semibold">
            {source._count.chunks}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            Index Jobs
          </p>

          <p className="mt-2 font-semibold">
            {source._count.indexJobs}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            Updated
          </p>

          <p className="mt-2 font-semibold">
            {source.updatedAt.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            Knowledge Chunks
          </h2>
        </div>

        <div className="divide-y">
          {source.chunks.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No chunks have been indexed yet.
            </div>
          ) : (
            source.chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="space-y-3 p-5"
              >
                <div className="text-xs font-medium text-muted-foreground">
                  Chunk #{chunk.chunkIndex + 1}
                </div>

                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7">
                  {chunk.content}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}