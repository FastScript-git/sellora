import {
  Brain,
  CircleGauge,
  Lightbulb,
  Smile,
  Tags,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ContactSentiment } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type ContactAiSummaryProps = {
  summary: string | null;
  sentiment: ContactSentiment;
  leadScore: number | null;
  tags: unknown;
  nextAction: string | null;
  locale: string;
};

function normalizeTags(tags: unknown) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter(
      (tag): tag is string =>
        typeof tag === "string" && tag.trim().length > 0,
    )
    .map((tag) => tag.trim())
    .slice(0, 10);
}

export function ContactAiSummary({
  summary,
  sentiment,
  leadScore,
  tags,
  nextAction,
  locale,
}: ContactAiSummaryProps) {
  const isUkrainian = locale === "uk";
  const normalizedTags = normalizeTags(tags);

  const copy = isUkrainian
    ? {
        title: "AI-аналіз контакту",
        summary: "Резюме",
        sentiment: "Настрій",
        leadScore: "Оцінка ліда",
        tags: "Теги",
        nextAction: "Наступна рекомендована дія",
        noSummary:
          "AI-резюме з’явиться після першої проаналізованої розмови.",
        noNextAction:
          "Рекомендованої дії поки немає.",
        noTags: "Теги поки не визначені.",
        positive: "Позитивний",
        neutral: "Нейтральний",
        negative: "Негативний",
      }
    : {
        title: "AI Contact Intelligence",
        summary: "Summary",
        sentiment: "Sentiment",
        leadScore: "Lead score",
        tags: "Tags",
        nextAction: "Recommended next action",
        noSummary:
          "AI summary will appear after the first analyzed conversation.",
        noNextAction:
          "No recommended action yet.",
        noTags: "No tags detected yet.",
        positive: "Positive",
        neutral: "Neutral",
        negative: "Negative",
      };

  const sentimentConfig = {
    POSITIVE: {
      label: copy.positive,
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
    NEUTRAL: {
      label: copy.neutral,
      className:
        "border-border bg-muted/40 text-muted-foreground",
    },
    NEGATIVE: {
      label: copy.negative,
      className:
        "border-red-500/30 bg-red-500/10 text-red-400",
    },
  } satisfies Record<
    ContactSentiment,
    {
      label: string;
      className: string;
    }
  >;

  const sentimentState = sentimentConfig[sentiment];

  const normalizedLeadScore =
    typeof leadScore === "number"
      ? Math.min(Math.max(leadScore, 0), 100)
      : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border bg-muted/40">
            <Brain className="size-4 text-muted-foreground" />
          </span>

          <CardTitle className="text-base">
            {copy.title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <section>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Brain className="size-4 text-muted-foreground" />
            {copy.summary}
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {summary || copy.noSummary}
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border bg-background/50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Smile className="size-4 text-muted-foreground" />
              {copy.sentiment}
            </div>

            <span
              className={cn(
                "mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                sentimentState.className,
              )}
            >
              {sentimentState.label}
            </span>
          </section>

          <section className="rounded-xl border bg-background/50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CircleGauge className="size-4 text-muted-foreground" />
              {copy.leadScore}
            </div>

            <div className="mt-3 flex items-end gap-1">
              <span className="text-2xl font-semibold tabular-nums">
                {normalizedLeadScore ?? "—"}
              </span>

              {normalizedLeadScore !== null ? (
                <span className="pb-1 text-xs text-muted-foreground">
                  / 100
                </span>
              ) : null}
            </div>

            {normalizedLeadScore !== null ? (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{
                    width: `${normalizedLeadScore}%`,
                  }}
                />
              </div>
            ) : null}
          </section>
        </div>

        <section>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="size-4 text-muted-foreground" />
            {copy.nextAction}
          </div>

          <p className="mt-2 rounded-xl border bg-background/50 p-4 text-sm leading-6 text-muted-foreground">
            {nextAction || copy.noNextAction}
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Tags className="size-4 text-muted-foreground" />
            {copy.tags}
          </div>

          {normalizedTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {normalizedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {copy.noTags}
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}