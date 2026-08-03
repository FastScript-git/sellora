type WorkspaceHeaderProps = {
  title: string;
  description: string;
};

export function WorkspaceHeader({
  title,
  description,
}: WorkspaceHeaderProps) {
  return (
    <header className="border-b pb-6">
      <div className="min-w-0">
        <h1 className="break-words text-3xl font-semibold tracking-tight">
          {title}
        </h1>

        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </header>
  );
}
