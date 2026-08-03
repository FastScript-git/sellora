"use client";

import {
  Check,
  Copy,
  Eye,
  Loader2,
} from "lucide-react";
import {
  useActionState,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateWidgetSettingsAction } from "@/features/channels/actions/update-widget-settings";
import { initialUpdateWidgetSettingsState } from "@/features/channels/actions/update-widget-settings-state";
import { cn } from "@/lib/utils";

type WidgetDesignerProps = {
  channelId: string;
  employeeId: string;
  locale: string;
  widgetKey: string;
  installationOrigin: string;
  isEnabled: boolean;
  widgetTitle: string | null;
  widgetGreeting: string | null;
  widgetPrimaryColor: string;
  widgetPosition: string;
  allowedDomains: string[];
};

export function WidgetDesigner({
  channelId,
  employeeId,
  locale,
  widgetKey,
  installationOrigin,
  isEnabled,
  widgetTitle,
  widgetGreeting,
  widgetPrimaryColor,
  widgetPosition,
  allowedDomains,
}: WidgetDesignerProps) {
  const isUkrainian =
    locale === "uk";

  const [enabled, setEnabled] =
    useState(isEnabled);

  const [title, setTitle] =
    useState(
      widgetTitle ?? "AI Assistant",
    );

  const [greeting, setGreeting] =
    useState(
      widgetGreeting ??
        "Hello 👋 How can I help you today?",
    );

  const [color, setColor] =
    useState(
      widgetPrimaryColor ||
        "#2563eb",
    );

  const [position, setPosition] =
    useState(
      widgetPosition === "bottom-left"
        ? "bottom-left"
        : "bottom-right",
    );

  const [domains, setDomains] =
    useState(
      allowedDomains.join("\n"),
    );

  const [copied, setCopied] =
    useState(false);

  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    updateWidgetSettingsAction,
    initialUpdateWidgetSettingsState,
  );

  const fieldErrors =
    state?.fieldErrors ?? {};

  const copy = isUkrainian
    ? {
        title: "Дизайнер віджета",
        description:
          "Налаштуйте вигляд віджета для вашого сайту.",
        enabled: "Віджет активний",
        disabled: "Віджет вимкнений",
        enabledDescription:
          "Коли віджет активний, відвідувачі сайту можуть відкривати чат і надсилати повідомлення.",
        disabledDescription:
          "Віджет не завантажуватиметься на сайті, доки ви знову його не ввімкнете.",
        widgetTitle: "Назва віджета",
        greeting:
          "Привітальне повідомлення",
        primaryColor:
          "Основний колір",
        position: "Позиція",
        bottomRight:
          "Праворуч унизу",
        bottomLeft:
          "Ліворуч унизу",
        allowedDomains:
          "Дозволені домени",
        allowedDomainsDescription:
          "По одному домену на рядок. Порожнє поле дозволяє всі домени.",
        allowedDomainsPlaceholder:
          "localhost\nexample.com\n*.example.com",
        save: "Зберегти зміни",
        saving: "Збереження...",
        preview:
          "Попередній перегляд",
        installation:
          "Код встановлення",
        copyScript: "Копіювати",
        copied: "Скопійовано",
        online: "Онлайн",
        fallbackTitle:
          "ШІ-асистент",
        fallbackGreeting:
          "Вітаю! Чим я можу вам допомогти?",
      }
    : {
        title: "Widget Designer",
        description:
          "Configure the appearance of your website widget.",
        enabled: "Widget enabled",
        disabled: "Widget disabled",
        enabledDescription:
          "When enabled, website visitors can open the chat and send messages.",
        disabledDescription:
          "The widget will not load on your website until it is enabled again.",
        widgetTitle: "Widget title",
        greeting: "Greeting message",
        primaryColor:
          "Primary color",
        position: "Position",
        bottomRight: "Bottom right",
        bottomLeft: "Bottom left",
        allowedDomains:
          "Allowed domains",
        allowedDomainsDescription:
          "Enter one domain per line. Leave empty to allow all domains.",
        allowedDomainsPlaceholder:
          "localhost\nexample.com\n*.example.com",
        save: "Save changes",
        saving: "Saving...",
        preview: "Live preview",
        installation: "Installation",
        copyScript: "Copy script",
        copied: "Copied",
        online: "Online",
        fallbackTitle:
          "AI Assistant",
        fallbackGreeting:
          "Hello! How can I help you today?",
      };

  const widgetScriptOrigin =
    installationOrigin.replace(
      /\/$/,
      "",
    ) ||
    "https://app.sellora.ai";

  const snippet = `<script
  src="${widgetScriptOrigin}/widget/widget.js"
  data-widget-key="${widgetKey}"
  async
></script>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        snippet,
      );

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
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[420px_minmax(0,1fr)] xl:gap-6">
      <form
        action={formAction}
        className="min-w-0 space-y-5 rounded-xl border bg-card p-4 sm:space-y-6 sm:p-6"
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

        <input
          type="hidden"
          name="isEnabled"
          value={
            enabled
              ? "true"
              : "false"
          }
        />

        <div className="min-w-0">
          <h2 className="break-words font-semibold">
            {copy.title}
          </h2>

          <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <div className="rounded-xl border bg-muted/10 p-4">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium">
                {enabled
                  ? copy.enabled
                  : copy.disabled}
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                {enabled
                  ? copy.enabledDescription
                  : copy.disabledDescription}
              </p>
            </div>

            <Switch
              checked={enabled}
              disabled={isPending}
              aria-label={
                enabled
                  ? copy.enabled
                  : copy.disabled
              }
              onCheckedChange={(
                checked,
              ) => {
                setEnabled(checked);
              }}
            />
          </div>

          {fieldErrors.isEnabled ? (
            <p className="mt-2 break-words text-xs text-destructive">
              {fieldErrors.isEnabled}
            </p>
          ) : null}
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
              setTitle(
                event.target.value,
              )
            }
            aria-invalid={Boolean(
              fieldErrors.widgetTitle,
            )}
          />

          {fieldErrors.widgetTitle ? (
            <p className="break-words text-xs text-destructive">
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
              setGreeting(
                event.target.value,
              )
            }
            aria-invalid={Boolean(
              fieldErrors.widgetGreeting,
            )}
            className="min-h-32 resize-y"
          />

          <div className="flex min-w-0 items-start justify-between gap-3">
            {fieldErrors.widgetGreeting ? (
              <p className="min-w-0 break-words text-xs text-destructive">
                {
                  fieldErrors.widgetGreeting
                }
              </p>
            ) : (
              <span />
            )}

            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              id="widgetPrimaryColor"
              name="widgetPrimaryColor"
              type="color"
              value={color}
              disabled={isPending}
              onChange={(event) =>
                setColor(
                  event.target.value,
                )
              }
              className="h-11 w-full cursor-pointer p-1 sm:w-16"
            />

            <Input
              value={color}
              maxLength={7}
              disabled={isPending}
              onChange={(event) =>
                setColor(
                  event.target.value,
                )
              }
              aria-label={
                copy.primaryColor
              }
              className="font-mono"
            />
          </div>

          {fieldErrors.widgetPrimaryColor ? (
            <p className="break-words text-xs text-destructive">
              {
                fieldErrors.widgetPrimaryColor
              }
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
              setPosition(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="bottom-right">
              {copy.bottomRight}
            </option>

            <option value="bottom-left">
              {copy.bottomLeft}
            </option>
          </select>

          {fieldErrors.widgetPosition ? (
            <p className="break-words text-xs text-destructive">
              {
                fieldErrors.widgetPosition
              }
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="allowedDomains"
            className="text-sm font-medium"
          >
            {copy.allowedDomains}
          </label>

          <Textarea
            id="allowedDomains"
            name="allowedDomains"
            rows={5}
            value={domains}
            placeholder={
              copy.allowedDomainsPlaceholder
            }
            disabled={isPending}
            onChange={(event) =>
              setDomains(
                event.target.value,
              )
            }
            aria-invalid={Boolean(
              fieldErrors.allowedDomains,
            )}
            className="min-h-36 resize-y font-mono text-xs"
          />

          <p className="break-words text-xs leading-5 text-muted-foreground">
            {
              copy.allowedDomainsDescription
            }
          </p>

          {fieldErrors.allowedDomains ? (
            <p className="break-words text-xs text-destructive">
              {
                fieldErrors.allowedDomains
              }
            </p>
          ) : null}
        </div>

        {state?.message ? (
          <div
            role={
              state.success
                ? "status"
                : "alert"
            }
            className={cn(
              "break-words rounded-xl border px-4 py-3 text-sm",
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

      <div className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:space-y-6">
        <section className="min-w-0 rounded-xl border bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 sm:mb-5">
            <Eye className="size-4 shrink-0 text-muted-foreground" />

            <h3 className="break-words font-semibold">
              {copy.preview}
            </h3>
          </div>

          <div
            className={cn(
              "relative flex min-h-[420px] items-end overflow-hidden rounded-xl border bg-muted/20 p-4 sm:h-[500px] sm:p-6",
              position === "bottom-left"
                ? "justify-start"
                : "justify-end",
            )}
          >
            {!enabled ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 p-5 text-center backdrop-blur-sm sm:p-6">
                <div className="min-w-0">
                  <p className="break-words font-semibold">
                    {copy.disabled}
                  </p>

                  <p className="mt-2 max-w-xs break-words text-sm leading-6 text-muted-foreground">
                    {
                      copy.disabledDescription
                    }
                  </p>
                </div>
              </div>
            ) : null}

            <div className="w-full max-w-[320px] overflow-hidden rounded-2xl border bg-background shadow-xl">
              <div
                className="px-4 py-4 text-white sm:px-5"
                style={{
                  backgroundColor: color,
                }}
              >
                <p className="truncate font-semibold">
                  {title ||
                    copy.fallbackTitle}
                </p>

                <p className="mt-1 text-xs text-white/75">
                  {copy.online}
                </p>
              </div>

              <div className="min-h-36 p-4 sm:p-5">
                <div className="max-w-[90%] rounded-2xl rounded-tl-md border bg-muted/30 px-4 py-3 sm:max-w-[85%]">
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {greeting ||
                      copy.fallbackGreeting}
                  </p>
                </div>
              </div>

              <div className="border-t p-3">
                <div className="h-10 rounded-xl border bg-muted/20" />
              </div>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border bg-card p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="break-words font-semibold">
              {copy.installation}
            </h3>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="w-full sm:w-auto"
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

          <div className="min-w-0 overflow-hidden rounded-xl border bg-muted/30">
            <pre className="max-w-full overflow-x-auto p-4 text-xs leading-6">
              <code>{snippet}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
