"use client";

import { useState } from "react";
import { Check, Copy, Globe2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type WidgetInstallationCardProps = {
  widgetKey: string;
  channelName: string;
  enabled: boolean;
  copy: {
    title: string;
    description: string;
    statusEnabled: string;
    statusDisabled: string;
    widgetKey: string;
    installationTitle: string;
    installationDescription: string;
    copyScript: string;
    copied: string;
  };
};

export function WidgetInstallationCard({
  widgetKey,
  channelName,
  enabled,
  copy,
}: WidgetInstallationCardProps) {
  const [copied, setCopied] = useState(false);

  const installationScript = `<script
  src="https://cdn.sellora.ai/widget.js"
  data-widget-key="${widgetKey}"
  async
></script>`;

  async function copyInstallationScript() {
    try {
      await navigator.clipboard.writeText(installationScript);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy widget installation script:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
              <Globe2 className="size-5 text-muted-foreground" />
            </span>

            <div>
              <CardTitle>{channelName}</CardTitle>

              <CardDescription className="mt-2">
                {copy.description}
              </CardDescription>
            </div>
          </div>

          <span
            className={
              enabled
                ? "inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
                : "inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground"
            }
          >
            <span
              aria-hidden="true"
              className={
                enabled
                  ? "size-1.5 rounded-full bg-emerald-400"
                  : "size-1.5 rounded-full bg-muted-foreground"
              }
            />

            {enabled ? copy.statusEnabled : copy.statusDisabled}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium">
            {copy.widgetKey}
          </p>

          <code className="mt-2 block overflow-x-auto rounded-lg border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            {widgetKey}
          </code>
        </div>

        <div>
          <p className="text-sm font-medium">
            {copy.installationTitle}
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {copy.installationDescription}
          </p>

          <div className="relative mt-3">
            <pre className="overflow-x-auto rounded-xl border bg-black/30 p-4 pr-32 text-xs leading-6 text-foreground">
              <code>{installationScript}</code>
            </pre>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyInstallationScript}
              className="absolute right-3 top-3"
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
        </div>
      </CardContent>
    </Card>
  );
}