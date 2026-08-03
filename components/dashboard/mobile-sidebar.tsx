"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  Menu,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const [isOpen, setIsOpen] =
    useState(false);

  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [isOpen]);

  function handleNavigationClick(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    const target =
      event.target as HTMLElement;

    const link = target.closest("a");

    if (link) {
      setIsOpen(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(true)
        }
        className="cursor-pointer lg:hidden"
      >
        <Menu className="size-5" />
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard navigation"
        >
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
            onClick={() =>
              setIsOpen(false)
            }
          />

          <div
            className="relative h-full w-72 max-w-[85vw] shadow-2xl"
            onClick={
              handleNavigationClick
            }
          >
            <Sidebar
              activePath={pathname}
              className="flex h-full w-full"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              onClick={() =>
                setIsOpen(false)
              }
              className="absolute right-3 top-3 cursor-pointer"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
