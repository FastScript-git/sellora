import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type LandingSectionTone =
  | "default"
  | "muted";

type LandingSectionProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  tone?: LandingSectionTone;
};

export function LandingSection({
  children,
  className,
  containerClassName,
  id,
  tone = "default",
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "landing-section",
        tone === "muted" &&
          "landing-section-muted",
        className,
      )}
    >
      <LandingContainer
        className={containerClassName}
      >
        {children}
      </LandingContainer>
    </section>
  );
}

type LandingContainerProps = {
  children: ReactNode;
  className?: string;
};

export function LandingContainer({
  children,
  className,
}: LandingContainerProps) {
  return (
    <div
      className={cn(
        "landing-container",
        className,
      )}
    >
      {children}
    </div>
  );
}

type LandingSectionHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function LandingSectionHeader({
  title,
  description,
  eyebrow,
  icon,
  align = "center",
  className,
  titleClassName,
  descriptionClassName,
}: LandingSectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "min-w-0",
        isCentered
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl text-left",
        className,
      )}
    >
      {icon ? (
        <div
          className={cn(
            "mb-4 flex",
            isCentered && "justify-center",
          )}
        >
          {icon}
        </div>
      ) : null}

      {eyebrow ? (
        <p className="text-sm font-medium text-primary">
          {eyebrow}
        </p>
      ) : null}

      <h2
        className={cn(
          "landing-heading",
          eyebrow && "mt-2",
          titleClassName,
        )}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "landing-description mt-3 text-balance",
            isCentered && "mx-auto",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

type LandingSurfaceProps<
  TElement extends ElementType,
> = {
  as?: TElement;
  children: ReactNode;
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<TElement>,
  "as" | "children" | "className"
>;

export function LandingSurface<
  TElement extends ElementType = "div",
>({
  as,
  children,
  className,
  ...props
}: LandingSurfaceProps<TElement>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "landing-surface",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

type LandingGridProps = {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
};

export function LandingGrid({
  children,
  className,
  columns = 3,
}: LandingGridProps) {
  return (
    <div
      className={cn(
        "landing-grid",
        columns === 2 &&
          "landing-grid-2",
        columns === 3 &&
          "landing-grid-3",
        columns === 4 &&
          "landing-grid-4",
        className,
      )}
    >
      {children}
    </div>
  );
}