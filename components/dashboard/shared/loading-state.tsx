import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingStateVariant =
  | "default"
  | "cards"
  | "rows"
  | "chat"
  | "analytics";

type LoadingStateProps = {
  variant?: LoadingStateVariant;
  count?: number;
  compact?: boolean;
  className?: string;
};

export function LoadingState({
  variant = "default",
  count,
  compact = false,
  className,
}: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <CardsLoadingState
        count={count ?? 4}
        compact={compact}
        className={className}
      />
    );
  }

  if (variant === "rows") {
    return (
      <RowsLoadingState
        count={count ?? 6}
        compact={compact}
        className={className}
      />
    );
  }

  if (variant === "chat") {
    return (
      <ChatLoadingState
        compact={compact}
        className={className}
      />
    );
  }

  if (variant === "analytics") {
    return (
      <AnalyticsLoadingState
        compact={compact}
        className={className}
      />
    );
  }

  return (
    <DefaultLoadingState
      compact={compact}
      className={className}
    />
  );
}

function DefaultLoadingState({
  compact,
  className,
}: {
  compact: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4",
        className,
      )}
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="space-y-2">
        <Skeleton
          className={cn(
            "h-7",
            compact ? "w-40" : "w-56",
          )}
        />

        <Skeleton
          className={cn(
            "h-4",
            compact
              ? "w-full max-w-sm"
              : "w-full max-w-xl",
          )}
        />
      </div>

      <div
        className={cn(
          "rounded-xl border bg-card",
          compact ? "p-4" : "p-5",
        )}
      >
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="h-4 w-[72%]" />
        </div>
      </div>
    </div>
  );
}

function CardsLoadingState({
  count,
  compact,
  className,
}: {
  count: number;
  compact: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
      aria-busy="true"
      aria-label="Loading cards"
    >
      {Array.from({
        length: count,
      }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "rounded-xl border bg-card",
            compact ? "p-3" : "p-4",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton
                className={cn(
                  compact
                    ? "h-6 w-16"
                    : "h-8 w-20",
                )}
              />
            </div>

            <Skeleton
              className={cn(
                "rounded-xl",
                compact
                  ? "size-9"
                  : "size-11",
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RowsLoadingState({
  count,
  compact,
  className,
}: {
  count: number;
  compact: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        className,
      )}
      aria-busy="true"
      aria-label="Loading rows"
    >
      <div
        className={cn(
          "border-b",
          compact ? "p-3" : "p-4",
        )}
      >
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="divide-y">
        {Array.from({
          length: count,
        }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3",
              compact
                ? "px-3 py-3"
                : "px-4 py-4",
            )}
          >
            <Skeleton
              className={cn(
                "shrink-0 rounded-xl",
                compact
                  ? "size-8"
                  : "size-10",
              )}
            />

            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-64 max-w-[85%]" />
            </div>

            <Skeleton className="hidden h-6 w-20 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatLoadingState({
  compact,
  className,
}: {
  compact: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-[520px] gap-4 xl:grid-cols-[minmax(0,1fr)_360px]",
        className,
      )}
      aria-busy="true"
      aria-label="Loading chat"
    >
      <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
        <div
          className={cn(
            "flex items-center justify-between border-b",
            compact ? "p-3" : "p-4",
          )}
        >
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-56" />
          </div>

          <Skeleton className="h-9 w-24" />
        </div>

        <div className="flex-1 space-y-5 p-4">
          <ChatBubbleSkeleton align="left" />
          <ChatBubbleSkeleton align="right" />
          <ChatBubbleSkeleton align="left" />
        </div>

        <div className="border-t p-4">
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </section>

      <aside className="space-y-3 rounded-xl border bg-card p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-full" />

        <div className="grid grid-cols-2 gap-2 pt-2">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-20 rounded-xl"
            />
          ))}
        </div>

        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </aside>
    </div>
  );
}

function AnalyticsLoadingState({
  compact,
  className,
}: {
  compact: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4",
        className,
      )}
      aria-busy="true"
      aria-label="Loading analytics"
    >
      <CardsLoadingState
        count={4}
        compact={compact}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>

      <RowsLoadingState
        count={5}
        compact={compact}
      />
    </div>
  );
}

function ChatBubbleSkeleton({
  align,
}: {
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        align === "right" &&
          "flex-row-reverse",
      )}
    >
      <Skeleton className="size-9 shrink-0 rounded-xl" />

      <div
        className={cn(
          "space-y-2",
          align === "right"
            ? "w-[58%]"
            : "w-[68%]",
        )}
      >
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
