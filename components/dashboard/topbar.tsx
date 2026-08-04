"use client";

import type {
  FormEvent,
  ReactNode,
} from "react";
import {
  Bell,
  Check,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Globe2,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useClerk,
  useUser,
} from "@clerk/nextjs";
import {
  useLocale,
  useTranslations,
} from "next-intl";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TopbarProps = {
  title?: string;
  mobileNavigation?: ReactNode;
  className?: string;
};

type NavigationItem = {
  key:
    | "dashboard"
    | "employees"
    | "knowledge"
    | "conversations"
    | "channels"
    | "workflows"
    | "automations"
    | "contacts"
    | "pipeline"
    | "tasks"
    | "calendar"
    | "analytics"
    | "settings"
    | "billing";
  path: string;
};

const navigationItems: NavigationItem[] = [
  {
    key: "dashboard",
    path: "/dashboard",
  },
  {
    key: "employees",
    path: "/dashboard/employees",
  },
  {
    key: "knowledge",
    path: "/dashboard/knowledge",
  },
  {
    key: "conversations",
    path: "/dashboard/conversations",
  },
  {
    key: "channels",
    path: "/dashboard/channels",
  },
  {
    key: "workflows",
    path: "/dashboard/workflows",
  },
  {
    key: "automations",
    path: "/dashboard/automations",
  },
  {
    key: "contacts",
    path: "/dashboard/contacts",
  },
  {
    key: "pipeline",
    path: "/dashboard/pipeline",
  },
  {
    key: "tasks",
    path: "/dashboard/tasks",
  },
  {
    key: "calendar",
    path: "/dashboard/calendar",
  },
  {
    key: "analytics",
    path: "/dashboard/analytics",
  },
  {
    key: "settings",
    path: "/dashboard/settings",
  },
  {
    key: "billing",
    path: "/dashboard/billing",
  },
];

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
) {
  const initials = [
    firstName?.trim().charAt(0),
    lastName?.trim().charAt(0),
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  if (initials) {
    return initials;
  }

  return email
    ?.trim()
    .charAt(0)
    .toUpperCase() || "U";
}

export function Topbar({
  title,
  mobileNavigation,
  className,
}: TopbarProps) {
  const t = useTranslations("topbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const {
    isLoaded,
    user,
  } = useUser();

  const { signOut } = useClerk();

  const searchInputRef =
    useRef<HTMLInputElement>(null);

  const [query, setQuery] =
    useState("");

  const [
    searchFocused,
    setSearchFocused,
  ] = useState(false);

  const [
    isSigningOut,
    setIsSigningOut,
  ] = useState(false);

  const [isDark, setIsDark] =
    useState(() => {
      if (
        typeof document ===
        "undefined"
      ) {
        return true;
      }

      return document.documentElement.classList.contains(
        "dark",
      );
    });

  useEffect(() => {
    function handleShortcut(
      event: KeyboardEvent,
    ) {
      if (
        (event.metaKey ||
          event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener(
      "keydown",
      handleShortcut,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleShortcut,
      );
    };
  }, []);

  const localizedNavigation =
    useMemo(
      () =>
        navigationItems.map(
          (item) => ({
            ...item,
            label: t(
              `navigation.${item.key}`,
            ),
          }),
        ),
      [t],
    );

  const filteredNavigation =
    useMemo(() => {
      const normalized =
        query.trim().toLocaleLowerCase(
          locale,
        );

      if (!normalized) {
        return [];
      }

      return localizedNavigation
        .filter((item) =>
          item.label
            .toLocaleLowerCase(locale)
            .includes(normalized),
        )
        .slice(0, 7);
    }, [
      locale,
      localizedNavigation,
      query,
    ]);

  function navigateTo(
    path: string,
  ) {
    setQuery("");
    setSearchFocused(false);

    router.push(`/${locale}${path}`);
  }

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const firstResult =
      filteredNavigation[0];

    if (firstResult) {
      navigateTo(firstResult.path);
    }
  }

  function changeLanguage(
    nextLocale: "en" | "uk",
  ) {
    if (nextLocale === locale) {
      return;
    }

    const segments =
      pathname.split("/");

    if (
      segments[1] === "en" ||
      segments[1] === "uk"
    ) {
      segments[1] = nextLocale;
    } else {
      segments.splice(
        1,
        0,
        nextLocale,
      );
    }

    const nextPath =
      segments.join("/") || "/";

    const suffix =
      window.location.search +
      window.location.hash;

    router.push(nextPath + suffix);
  }

  function toggleTheme() {
    const root =
      document.documentElement;

    const nextDark =
      !root.classList.contains(
        "dark",
      );

    root.classList.toggle(
      "dark",
      nextDark,
    );

    localStorage.setItem(
      "sellora-theme",
      nextDark
        ? "dark"
        : "light",
    );

    setIsDark(nextDark);
  }

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut({
        redirectUrl: `/${locale}`,
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  const resolvedTitle =
    title ?? t("dashboardTitle");

  const primaryEmail =
    user?.primaryEmailAddress
      ?.emailAddress ??
    user?.emailAddresses[0]
      ?.emailAddress ??
    null;

  const displayName =
    user?.fullName?.trim() ||
    user?.firstName?.trim() ||
    primaryEmail ||
    t("workspaceOwner");

  const initials = getInitials(
    user?.firstName,
    user?.lastName,
    primaryEmail,
  );

  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 sm:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {mobileNavigation}

        <h1 className="truncate text-lg font-semibold tracking-tight">
          {resolvedTitle}
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
        <div className="relative hidden w-full max-w-sm md:block">
          <form
            onSubmit={handleSearchSubmit}
          >
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              ref={searchInputRef}
              type="search"
              value={query}
              placeholder={t(
                "searchPlaceholder",
              )}
              aria-label={t(
                "searchLabel",
              )}
              className="h-9 pl-9 pr-14"
              onFocus={() =>
                setSearchFocused(true)
              }
              onBlur={() => {
                window.setTimeout(() => {
                  setSearchFocused(false);
                }, 150);
              }}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
            />

            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </form>

          {searchFocused &&
          query.trim() ? (
            <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border bg-popover shadow-xl">
              <div className="border-b px-3 py-2 text-xs text-muted-foreground">
                {t("searchHint")}
              </div>

              {filteredNavigation.length >
              0 ? (
                <div className="p-1">
                  {filteredNavigation.map(
                    (item) => (
                      <button
                        key={item.key}
                        type="button"
                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                        onMouseDown={(
                          event,
                        ) => {
                          event.preventDefault();

                          navigateTo(
                            item.path,
                          );
                        }}
                      >
                        <Search className="size-4 shrink-0 text-muted-foreground" />

                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              ) : (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {t("searchEmpty")}
                </p>
              )}
            </div>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t(
                  "changeLanguage",
                )}
                title={t(
                  "changeLanguage",
                )}
                className="hidden cursor-pointer sm:inline-flex"
              />
            }
          >
            <Globe2 className="size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="min-w-44"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                changeLanguage("en")
              }
            >
              <span className="flex-1">
                {t("english")}
              </span>

              {locale === "en" ? (
                <Check className="size-4" />
              ) : null}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                changeLanguage("uk")
              }
            >
              <span className="flex-1">
                {t("ukrainian")}
              </span>

              {locale === "uk" ? (
                <Check className="size-4" />
              ) : null}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t(
            "changeTheme",
          )}
          title={
            isDark
              ? t("lightTheme")
              : t("darkTheme")
          }
          className="hidden cursor-pointer sm:inline-flex"
          onClick={toggleTheme}
        >
          {isDark ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t(
                  "notifications",
                )}
                title={t(
                  "notifications",
                )}
                className="relative cursor-pointer"
              />
            }
          >
            <Bell className="size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-72"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">
                {t("notifications")}
              </p>

              <p className="mt-4 rounded-lg border border-dashed px-4 py-6 text-center text-xs leading-5 text-muted-foreground">
                {t(
                  "notificationsEmpty",
                )}
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="h-10 cursor-pointer gap-2 px-2"
                aria-label={t(
                  "openUserMenu",
                )}
                disabled={!isLoaded}
              />
            }
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className="size-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </span>
            )}

            <span className="hidden min-w-0 text-left lg:block">
              <span className="block max-w-32 truncate text-sm font-medium">
                {displayName}
              </span>

              <span className="block max-w-32 truncate text-xs text-muted-foreground">
                {t("workspaceOwner")}
              </span>
            </span>

            <ChevronDown className="hidden size-4 text-muted-foreground lg:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="min-w-60"
          >
            <div className="min-w-0 px-3 py-2">
              <p className="truncate text-sm font-medium">
                {displayName}
              </p>

              {primaryEmail ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {primaryEmail}
                </p>
              ) : null}
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                navigateTo(
                  "/dashboard/profile",
                )
              }
            >
              <CircleUserRound className="size-4" />
              {t("profile")}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                navigateTo(
                  "/dashboard/settings",
                )
              }
            >
              <Settings className="size-4" />
              {t(
                "workspaceSettings",
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                navigateTo(
                  "/dashboard/billing",
                )
              }
            >
              <CreditCard className="size-4" />
              {t("billing")}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              disabled={isSigningOut}
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              {isSigningOut
                ? "..."
                : t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}