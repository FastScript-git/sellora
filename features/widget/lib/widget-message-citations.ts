export type WidgetMessageCitation = {
  sourceId: string;
  sourceTitle: string;
  citationNumbers: number[];
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function getWidgetMessageCitations(
  metadata: unknown,
): WidgetMessageCitation[] {
  if (!isRecord(metadata)) {
    return [];
  }

  const knowledgeSources =
    metadata.knowledgeSources;

  if (!Array.isArray(knowledgeSources)) {
    return [];
  }

  const sources = new Map<
    string,
    WidgetMessageCitation
  >();

  knowledgeSources.forEach(
    (source, index) => {
      if (!isRecord(source)) {
        return;
      }

      const sourceId =
        typeof source.knowledgeSourceId ===
        "string"
          ? source.knowledgeSourceId
          : "";

      const sourceTitle =
        typeof source.sourceTitle ===
        "string"
          ? source.sourceTitle.trim()
          : "";

      if (!sourceId || !sourceTitle) {
        return;
      }

      const citationNumber =
        index + 1;

      const existing =
        sources.get(sourceId);

      if (existing) {
        if (
          !existing.citationNumbers.includes(
            citationNumber,
          )
        ) {
          existing.citationNumbers.push(
            citationNumber,
          );
        }

        return;
      }

      sources.set(sourceId, {
        sourceId,
        sourceTitle,
        citationNumbers: [
          citationNumber,
        ],
      });
    },
  );

  return Array.from(
    sources.values(),
  );
}
