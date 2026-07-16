"use client";

import {
  useActionState,
  useState,
} from "react";
import {
  Check,
  Copy,
  Eye,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateWidgetSettingsAction } from "@/features/channels/actions/update-widget-settings";
import { initialUpdateWidgetSettingsState } from "@/features/channels/actions/update-widget-settings-state";
import { cn } from "@/lib/utils";

type WidgetDesignerProps = {
  channelId: string;
  employeeId: string;
  locale: string;
  widgetKey: string;
  widgetTitle: string | null;
  widgetGreeting: string | null;
  widgetPrimaryColor: string;
  widgetPosition: string;
};

export function WidgetDesigner({
  channelId,
  employeeId,
  locale,
  widgetKey,
  widgetTitle,
  widgetGreeting,
  widgetPrimaryColor,
  widgetPosition,
}: WidgetDesignerProps) {
  const isUkrainian = locale === "uk";

  const [title, setTitle] = useState(
    widgetTitle ?? "AI Assistant",
  );

  const [greeting, setGreeting] = useState(
    widgetGreeting ??
      "Hello 👋 How can I help you today?",
  );

  const [color, setColor] = useState(
    widgetPrimaryColor || "#2563eb",
  );

  const [position, setPosition] = useState(
    widgetPosition === "bottom-left"
      ? "bottom-left"
      : "bottom-right",
  );

  const [copied, setCopied] = useState(false);

  const [state, formAction, isPending] = useActionState(
    updateWidgetSettingsAction,
    initialUpdateWidgetSettingsState,
  );

  const fieldErrors = state?.fieldErrors ?? {};

  const copy = isUkrainian
    ? {
        title: "Дизайнер віджета",
        description:
          "Налаштуйте вигляд віджета для вашого сайту.",
        widgetTitle: "Назва віджета",
        greeting: "Привітальне повідомлення",
        primaryColor: "Основний колір",
        position: "Позиція",
        bottomRight: "Праворуч унизу",
        bottomLeft: "Ліворуч унизу",
        save: "Зберегти зміни",
        saving: "Збереження...",
        preview: "Попередній перегляд",
        installation: "Код встановлення",
        copyScript: "Копіювати",
        copied: "Скопійовано",
      }
    : {
        title: "Widget Designer",
        description:
          "Configure the appearance of your website widget.",
        widgetTitle: "Widget title",
        greeting: "Greeting message",
        primaryColor: "Primary color",
        position: "Position",
        bottomRight: "Bottom right",
        bottomLeft: "Bottom left",
        save: "Save changes",
        saving: "Saving...",
        preview: "Live preview",
        installation: "Installation",
        copyScript: "Copy script",
        copied: "Copied",
      };

  const snippet = `<script
  src="https://app.sellora.ai/widget/widget.js"
  data-widget-key="${widgetKey}"
  async
></script>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy widget installation code:",
        error,
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <form
        action={formAction}
        className="space-y-6 rounded-2xl border bg-card p-6"
      >
        <input
          type="hidden"
          name="channelId"
          value={channelId}
        />

        <input
          type="hidden"
          name="employeeId"
          value={employeeId}
        />

        <input
          type="hidden"
          name="locale"
          value={locale}
        />

        <div>
          <h2 className="font-semibold">
            {copy.title}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widgetTitle"
            className="text-sm font-medium"
          >
            {copy.widgetTitle}
          </label>

          <Input
            id="widgetTitle"
            name="widgetTitle"
            value={title}
            maxLength={80}
            disabled={isPending}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            aria-invalid={Boolean(
              fieldErrors.widgetTitle,
            )}
          />

          {fieldErrors.widgetTitle ? (
            <p className="text-xs text-destructive">
              {fieldErrors.widgetTitle}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widgetGreeting"
            className="text-sm font-medium"
          >
            {copy.greeting}
          </label>

          <Textarea
            id="widgetGreeting"
            name="widgetGreeting"
            rows={4}
            maxLength={500}
            value={greeting}
            disabled={isPending}
            onChange={(event) =>
              setGreeting(event.target.value)
            }
            aria-invalid={Boolean(
              fieldErrors.widgetGreeting,
            )}
          />

          <div className="flex items-center justify-between gap-3">
            {fieldErrors.widgetGreeting ? (
              <p className="text-xs text-destructive">
                {fieldErrors.widgetGreeting}
              </p>
            ) : (
              <span />
            )}

            <span className="text-xs tabular-nums text-muted-foreground">
              {greeting.length}/500
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widgetPrimaryColor"
            className="text-sm font-medium"
          >
            {copy.primaryColor}
          </label>

          <div className="flex items-center gap-3">
            <Input
              id="widgetPrimaryColor"
              name="widgetPrimaryColor"
              type="color"
              value={color}
              disabled={isPending}
              onChange={(event) =>
                setColor(event.target.value)
              }
              className="w-16 cursor-pointer p-1"
            />

            <Input
              value={color}
              maxLength={7}
              disabled={isPending}
              onChange={(event) =>
                setColor(event.target.value)
              }
              aria-label={copy.primaryColor}
            />
          </div>

          {fieldErrors.widgetPrimaryColor ? (
            <p className="text-xs text-destructive">
              {fieldErrors.widgetPrimaryColor}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widgetPosition"
            className="text-sm font-medium"
          >
            {copy.position}
          </label>

          <select
            id="widgetPosition"
            name="widgetPosition"
            value={position}
            disabled={isPending}
            onChange={(event) =>
              setPosition(event.target.value)
            }
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="bottom-right">
              {copy.bottomRight}
            </option>

            <option value="bottom-left">
              {copy.bottomLeft}
            </option>
          </select>

          {fieldErrors.widgetPosition ? (
            <p className="text-xs text-destructive">
              {fieldErrors.widgetPosition}
            </p>
          ) : null}
        </div>

        {state?.message ? (
          <div
            role="status"
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              state.success
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-destructive/40 bg-destructive/10 text-destructive",
            )}
          >
            {state.message}
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {copy.saving}
            </>
          ) : (
            copy.save
          )}
        </Button>
      </form>

      <div className="space-y-6">
        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Eye className="size-4 text-muted-foreground" />

            <h3 className="font-semibold">
              {copy.preview}
            </h3>
          </div>

          <div
            className={cn(
              "flex h-[500px] items-end rounded-xl border bg-muted/20 p-6",
              position === "bottom-left"
                ? "justify-start"
                : "justify-end",
            )}
          >
            <div className="w-[320px] overflow-hidden rounded-2xl border bg-background shadow-xl">
              <div
                className="px-5 py-4 text-white"
                style={{
                  backgroundColor: color,
                }}
              >
                <p className="truncate font-semibold">
                  {title || "AI Assistant"}
                </p>

                <p className="mt-1 text-xs text-white/75">
                  Online
                </p>
              </div>

              <div className="min-h-36 p-5">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md border bg-muted/30 px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {greeting ||
                      "Hello! How can I help you today?"}
                  </p>
                </div>
              </div>

              <div className="border-t p-3">
                <div className="h-10 rounded-xl border bg-muted/20" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="font-semibold">
              {copy.installation}
            </h3>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  {copy.copied}
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  {copy.copyScript}
                </>
              )}
            </Button>
          </div>

          <pre className="overflow-x-auto rounded-xl border bg-muted/30 p-4 text-xs leading-6">
            <code>{snippet}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}