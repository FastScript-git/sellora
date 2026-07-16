"use client";

import { useState } from "react";
import { Copy, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type WidgetDesignerProps = {
  widgetKey: string;
  widgetTitle: string | null;
  widgetGreeting: string | null;
  widgetPrimaryColor: string;
  widgetPosition: string;
};

export function WidgetDesigner({
  widgetKey,
  widgetTitle,
  widgetGreeting,
  widgetPrimaryColor,
  widgetPosition,
}: WidgetDesignerProps) {
  const [title, setTitle] = useState(
    widgetTitle ?? "AI Assistant",
  );

  const [greeting, setGreeting] = useState(
    widgetGreeting ??
      "Hello 👋 How can I help you today?",
  );

  const [color, setColor] = useState(widgetPrimaryColor);

  const [position, setPosition] = useState(widgetPosition);

  const snippet = `<script
src="https://app.sellora.ai/widget.js"
data-widget="${widgetKey}">
</script>`;

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="space-y-6 rounded-2xl border p-6">
        <div>
          <h2 className="font-semibold">
            Widget Designer
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure your website widget.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Widget title
          </label>

          <Input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Greeting
          </label>

          <Textarea
            rows={4}
            value={greeting}
            onChange={(e) =>
              setGreeting(e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Primary color
          </label>

          <Input
            type="color"
            value={color}
            onChange={(e) =>
              setColor(e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Position
          </label>

          <select
            className="h-10 w-full rounded-lg border bg-background px-3"
            value={position}
            onChange={(e) =>
              setPosition(e.target.value)
            }
          >
            <option value="bottom-right">
              Bottom Right
            </option>

            <option value="bottom-left">
              Bottom Left
            </option>
          </select>
        </div>

        <Button className="w-full">
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border p-6">
          <div className="mb-5 flex items-center gap-2">
            <Eye className="size-4" />

            <h3 className="font-semibold">
              Live Preview
            </h3>
          </div>

          <div className="flex h-[500px] items-end justify-end rounded-xl border bg-muted/20 p-6">
            <div className="w-[320px] overflow-hidden rounded-2xl border bg-background shadow-xl">
              <div
                className="px-5 py-4 text-white"
                style={{
                  background: color,
                }}
              >
                <p className="font-semibold">
                  {title}
                </p>
              </div>

              <div className="p-5">
                <p className="text-sm">
                  {greeting}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">
              Installation
            </h3>

            <Button
              size="sm"
              variant="outline"
            >
              <Copy className="mr-2 size-4" />
              Copy
            </Button>
          </div>

          <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs">
            {snippet}
          </pre>
        </div>
      </div>
    </div>
  );
}