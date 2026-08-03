"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

type SwitchProps = SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
};

export function Switch({
  className,
  size = "default",
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",

        // default
        "data-[size=default]:h-8 data-[size=default]:w-14",

        // small
        "data-[size=sm]:h-6 data-[size=sm]:w-10",

        // OFF
        "data-unchecked:bg-zinc-300 dark:data-unchecked:bg-zinc-700",

        // ON
        "data-checked:bg-emerald-500 hover:data-checked:bg-emerald-400",

        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out",

          "group-data-[size=default]:size-6",
          "group-data-[size=sm]:size-4",

          "group-data-[size=default]:data-unchecked:translate-x-1",
          "group-data-[size=default]:data-checked:translate-x-7",

          "group-data-[size=sm]:data-unchecked:translate-x-1",
          "group-data-[size=sm]:data-checked:translate-x-5",
        )}
      />
    </SwitchPrimitive.Root>
  );
}