"use client";

import {
  Bot,
  CalendarDays,
  Check,
  Code2,
  ContactRound,
  Database,
  FileText,
  Globe2,
  HandHelping,
  Loader2,
  Mail,
  Search,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useState,
  useTransition,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateAIEmployeeToolAction } from "@/features/ai-tools/actions/update-ai-tool";
import type { AIEmployeeToolKey } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type ToolItem = {
  key: AIEmployeeToolKey;
  isEnabled: boolean;
};

type AIToolsManagerProps = {
  employeeId: string;
  locale: string;
  tools: ToolItem[];
};

type ToolDefinition = {
  key: AIEmployeeToolKey;
  icon: typeof Search;
  available: boolean;
};

const toolDefinitions: ToolDefinition[] = [
  {
    key: "KNOWLEDGE_SEARCH",
    icon: Search,
    available: true,
  },
  {
    key: "LEAD_COLLECTION",
    icon: UserPlus,
    available: true,
  },
  {
    key: "CONTACT_CREATION",
    icon: ContactRound,
    available: true,
  },
  {
    key: "HUMAN_HANDOFF",
    icon: HandHelping,
    available: true,
  },
  {
    key: "WEB_SEARCH",
    icon: Globe2,
    available: false,
  },
  {
    key: "EMAIL",
    icon: Mail,
    available: true,
  },
  {
    key: "DOCUMENTS",
    icon: FileText,
    available: true,
  },
  {
    key: "CALENDAR",
    icon: CalendarDays,
    available: true,
  },
  {
    key: "CRM",
    icon: Database,
    available: false,
  },
  {
    key: "CUSTOM_API",
    icon: Code2,
    available: false,
  },
];

const integrationItems = [
  {
    key: "telegram",
    label: "Telegram",
    icon: Bot,
  },
  {
    key: "gmail",
    label: "Gmail",
    icon: Mail,
  },
  {
    key: "calendar",
    label: "Google Calendar",
    icon: CalendarDays,
  },
  {
    key: "crm",
    label: "HubSpot CRM",
    icon: Database,
  },
] as const;

export function AIToolsManager({
  employeeId,
  locale,
  tools,
}: AIToolsManagerProps) {
  const t = useTranslations(
    "aiEmployeeTools",
  );

  const initialEnabledState =
    Object.fromEntries(
      tools.map((tool) => [
        tool.key,
        tool.isEnabled,
      ]),
    ) as Record<
      AIEmployeeToolKey,
      boolean
    >;

  const [enabledTools, setEnabledTools] =
    useState(initialEnabledState);

  const [pendingKey, setPendingKey] =
    useState<AIEmployeeToolKey | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  const availableToolCount =
    toolDefinitions.filter(
      (tool) => tool.available,
    ).length;

  const enabledCount =
    toolDefinitions.filter(
      (tool) =>
        tool.available &&
        enabledTools[tool.key],
    ).length;

  function toggleTool(
    tool: ToolDefinition,
  ) {
    if (
      !tool.available ||
      isPending
    ) {
      return;
    }

    const previousValue =
      enabledTools[tool.key] ?? false;

    const nextValue =
      !previousValue;

    setError(null);
    setPendingKey(tool.key);

    setEnabledTools((current) => ({
      ...current,
      [tool.key]: nextValue,
    }));

    startTransition(async () => {
      const result =
        await updateAIEmployeeToolAction({
          employeeId,
          key: tool.key,
          isEnabled: nextValue,
          locale,
        });

      if (!result.success) {
        setEnabledTools((current) => ({
          ...current,
          [tool.key]: previousValue,
        }));

        setError(
          result.error ||
            t("messages.updateFailed"),
        );
      }

      setPendingKey(null);
    });
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border bg-card">
        <header className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 shrink-0 text-primary" />

              <h2 className="font-semibold">
                {t("capabilities.title")}
              </h2>
            </div>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t(
                "capabilities.description",
              )}
            </p>
          </div>

          <Badge
            variant="outline"
            className="w-fit shrink-0"
          >
            {t(
              "capabilities.enabledCount",
              {
                enabled: enabledCount,
                available:
                  availableToolCount,
              },
            )}
          </Badge>
        </header>

        {error ? (
          <div
            role="alert"
            className="mx-4 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
          {toolDefinitions.map(
            (tool) => {
              const Icon = tool.icon;

              const enabled =
                enabledTools[
                  tool.key
                ] ?? false;

              const saving =
                pendingKey ===
                  tool.key &&
                isPending;

              return (
                <article
                  key={tool.key}
                  className={cn(
                    "flex min-h-44 flex-col bg-card p-4",
                    !tool.available &&
                      "bg-muted/20",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                        enabled &&
                          tool.available
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "bg-background text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>

                    {tool.available ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          enabled
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                            : "text-muted-foreground",
                        )}
                      >
                        {enabled
                          ? t(
                              "states.enabled",
                            )
                          : t(
                              "states.disabled",
                            )}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {t(
                          "states.comingSoon",
                        )}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex-1">
                    <h3 className="text-sm font-semibold">
                      {t(
                        `tools.${tool.key}.title`,
                      )}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {t(
                        `tools.${tool.key}.description`,
                      )}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant={
                      enabled
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="mt-4 w-full"
                    disabled={
                      !tool.available ||
                      isPending
                    }
                    onClick={() =>
                      toggleTool(tool)
                    }
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {t(
                          "states.saving",
                        )}
                      </>
                    ) : enabled ? (
                      <>
                        <Check className="size-4" />
                        {t(
                          "states.enabled",
                        )}
                      </>
                    ) : (
                      t("states.disabled")
                    )}
                  </Button>
                </article>
              );
            },
          )}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-xl border bg-card">
          <header className="border-b px-4 py-4">
            <h2 className="font-semibold">
              {t("integrations.title")}
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t(
                "integrations.description",
              )}
            </p>
          </header>

          <div className="divide-y">
            {integrationItems.map(
              (integration) => {
                const Icon =
                  integration.icon;

                return (
                  <div
                    key={integration.key}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
                        <Icon className="size-4 text-muted-foreground" />
                      </span>

                      <span className="truncate text-sm font-medium">
                        {integration.label}
                      </span>
                    </div>

                    <Badge
                      variant="secondary"
                      className="shrink-0"
                    >
                      {t(
                        "states.comingSoon",
                      )}
                    </Badge>
                  </div>
                );
              },
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border bg-card">
          <header className="border-b px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-semibold">
                  {t("customApi.title")}
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t(
                    "customApi.description",
                  )}
                </p>
              </div>

              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/30">
                <Code2 className="size-4 text-muted-foreground" />
              </span>
            </div>
          </header>

          <div className="p-4">
            <div className="rounded-xl border border-dashed bg-muted/10 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {t(
                    "customApi.restApi",
                  )}
                </Badge>

                <Badge variant="secondary">
                  {t(
                    "states.planned",
                  )}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-9 rounded-lg border bg-background" />
                <div className="h-9 rounded-lg border bg-background" />
                <div className="h-20 rounded-lg border bg-background" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
