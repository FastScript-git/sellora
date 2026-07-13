"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="lg:hidden"
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative h-full w-72 max-w-[85vw] shadow-2xl">
            <Sidebar
              activePath={pathname}
              className="flex h-full w-full"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}