import { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-6 py-5">
        <h2 className="text-base font-semibold tracking-tight">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div className="space-y-6 p-6">
        {children}
      </div>
    </section>
  );
}