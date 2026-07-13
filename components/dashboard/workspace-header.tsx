import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

type WorkspaceHeaderProps = {
  title: string;
  description: string;
};

export function WorkspaceHeader({
  title,
  description,
}: WorkspaceHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b pb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {title}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <Button
          variant="outline"
          className="hidden gap-2 md:flex"
        >
          <Search className="size-4" />

          Search

          <kbd className="ml-3 rounded border bg-muted px-1.5 py-0.5 text-[10px]">
            ⌘K
          </kbd>
        </Button>
      </div>
    </header>
  );
}