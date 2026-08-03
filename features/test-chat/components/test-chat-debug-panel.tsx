"use client";

import {
  BookOpen,
  Bot,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Clock3,
  Coins,
  FileText,
  Gauge,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type TestChatDebugData = {
  model: string;
  latencyMs: number;

  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };

  knowledgeSources: number;
  prompt: string;

  trace: {
    id: string;
    title: string;
    status: "success" | "warning" | "error";
    durationMs?: number;
    details?: string;
  }[];
};

type TestChatDebugPanelProps = {
  debug: TestChatDebugData | null;
  prompt?: string | null;
};

export function TestChatDebugPanel({
  debug,
  prompt,
}: TestChatDebugPanelProps) {
  const t = useTranslations(
    "aiEmployeeTestChat.inspector",
  );

  if (!debug) {
    return (
      <aside className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-xl border bg-card xl:sticky xl:top-4 xl:max-h-[calc(100dvh-10rem)]">
        <header className="shrink-0 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />

            <h3 className="font-semibold">
              {t("title")}
            </h3>
          </div>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
            <Gauge className="size-5 text-muted-foreground" />
          </span>

          <p className="mt-4 text-sm font-medium">
            {t("noData")}
          </p>

          <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">
            {t("noDataDescription")}
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-xl border bg-card xl:sticky xl:top-4 xl:max-h-[calc(100dvh-10rem)]">
      <header className="shrink-0 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />

          <h3 className="font-semibold">
            {t("title")}
          </h3>
        </div>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {t("runtime")}
        </p>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <DebugMetric
            icon={Bot}
            label={t("model")}
            value={debug.model}
          />

          <DebugMetric
            icon={Clock3}
            label={t("latency")}
            value={`${debug.latencyMs} ${t("milliseconds")}`}
          />

          <DebugMetric
            icon={FileText}
            label={t("inputTokens")}
            value={debug.usage.inputTokens}
          />

          <DebugMetric
            icon={MessageSquare}
            label={t("outputTokens")}
            value={debug.usage.outputTokens}
          />

          <DebugMetric
            icon={Gauge}
            label={t("totalTokens")}
            value={debug.usage.totalTokens}
          />

          <DebugMetric
            icon={BookOpen}
            label={t("knowledge")}
            value={debug.knowledgeSources}
          />
        </section>

        <section className="rounded-xl border">
          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <Coins className="size-4 text-muted-foreground" />

            <h4 className="text-sm font-medium">
              {t("usage")}
            </h4>
          </div>

          <div className="space-y-2.5 px-3 py-3 text-xs">
            <UsageRow
              label={t("input")}
              value={t("tokens", {
                count: debug.usage.inputTokens,
              })}
            />

            <UsageRow
              label={t("output")}
              value={t("tokens", {
                count: debug.usage.outputTokens,
              })}
            />

            <UsageRow
              label={t("total")}
              value={t("tokens", {
                count: debug.usage.totalTokens,
              })}
              strong
            />
          </div>
        </section>

        <section className="rounded-xl border">
          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <FileText className="size-4 text-muted-foreground" />

            <h4 className="text-sm font-medium">
              {t("prompt")}
            </h4>
          </div>

          <div className="max-h-64 overflow-y-auto px-3 py-3">
            {prompt?.trim() ? (
              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-muted-foreground">
                {prompt}
              </pre>
            ) : (
              <p className="text-xs leading-5 text-muted-foreground">
                {t("promptUnavailable")}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border">
          <div className="border-b px-3 py-2.5">
            <h4 className="text-sm font-medium">
              {t("trace")}
            </h4>
          </div>

          <div className="space-y-2 p-3">
            {debug.trace.map((step) => (
              <TraceItem
                key={step.id}
                title={step.title}
                status={step.status}
                durationMs={step.durationMs}
                details={step.details}
                millisecondsLabel={t(
                  "milliseconds",
                )}
              />
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

type TraceItemProps = {
  title: string;
  status: "success" | "warning" | "error";
  durationMs?: number;
  details?: string;
  millisecondsLabel: string;
};

function TraceItem({
  title,
  status,
  durationMs,
  details,
  millisecondsLabel,
}: TraceItemProps) {
  const StatusIcon =
    status === "success"
      ? CheckCircle2
      : status === "warning"
        ? CircleAlert
        : CircleX;

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start gap-2.5">
        <StatusIcon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            status === "success" &&
              "text-emerald-500",
            status === "warning" &&
              "text-amber-500",
            status === "error" &&
              "text-destructive",
          )}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="break-words text-xs font-medium">
              {title}
            </p>

            <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
              {durationMs ?? 0}{" "}
              {millisecondsLabel}
            </span>
          </div>

          {details ? (
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              {details}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type DebugMetricProps = {
  icon: typeof Bot;
  label: string;
  value: string | number;
};

function DebugMetric({
  icon: Icon,
  label,
  value,
}: DebugMetricProps) {
  return (
    <div className="min-w-0 rounded-xl border bg-muted/15 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />

        <span className="truncate text-[11px]">
          {label}
        </span>
      </div>

      <p className="mt-2 break-all text-sm font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

type UsageRowProps = {
  label: string;
  value: string;
  strong?: boolean;
};

function UsageRow({
  label,
  value,
  strong = false,
}: UsageRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span
        className={
          strong
            ? "font-semibold text-foreground"
            : "font-medium text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

export type { TestChatDebugData };
