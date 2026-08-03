"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 3000;

export function ConversationsLiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    let intervalId: number | null = null;
    let stopped = false;

    function stopRefreshing() {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    function refreshInbox() {
      if (
        stopped ||
        document.hidden
      ) {
        return;
      }

      router.refresh();
    }

    function startRefreshing() {
      stopRefreshing();

      if (
        stopped ||
        document.hidden
      ) {
        return;
      }

      intervalId = window.setInterval(
        refreshInbox,
        REFRESH_INTERVAL_MS,
      );
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopRefreshing();
        return;
      }

      refreshInbox();
      startRefreshing();
    }

    function handleWindowFocus() {
      refreshInbox();
      startRefreshing();
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    window.addEventListener(
      "focus",
      handleWindowFocus,
    );

    startRefreshing();

    return () => {
      stopped = true;
      stopRefreshing();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus,
      );
    };
  }, [router]);

  return null;
}
