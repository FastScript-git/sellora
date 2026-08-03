(() => {
  const HISTORY_POLL_INTERVAL_MS = 4000;

  const currentScript =
    document.currentScript ||
    document.querySelector(
      'script[src*="/widget/widget.js"][data-widget-key]',
    );

  if (!currentScript) {
    console.error(
      "[Sellora Widget] Installation script was not found.",
    );
    return;
  }

  const widgetKey =
    currentScript.dataset.widgetKey?.trim();

  if (!widgetKey) {
    console.error(
      "[Sellora Widget] data-widget-key is required.",
    );
    return;
  }

  const existingWidget = document.querySelector(
    `[data-sellora-widget="${widgetKey}"]`,
  );

  if (existingWidget) {
    return;
  }

  const scriptUrl = new URL(currentScript.src);
  const apiBaseUrl = scriptUrl.origin;
  const widgetAssetsBaseUrl =
    `${apiBaseUrl}/widget`;

  const conversationStorageKey =
    `sellora-conversation-${widgetKey}`;

  window.__selloraWidgetScriptPromises ??= {};

  function loadScript(src) {
    const existingPromise =
      window.__selloraWidgetScriptPromises[src];

    if (existingPromise) {
      return existingPromise;
    }

    const promise = new Promise(
      (resolve, reject) => {
        const script =
          document.createElement("script");

        script.src = src;
        script.async = true;

        script.addEventListener(
          "load",
          resolve,
          {
            once: true,
          },
        );

        script.addEventListener(
          "error",
          () => {
            reject(
              new Error(
                `[Sellora Widget] Failed to load ${src}`,
              ),
            );
          },
          {
            once: true,
          },
        );

        document.head.append(script);
      },
    );

    window.__selloraWidgetScriptPromises[src] =
      promise;

    return promise;
  }

  async function bootstrapWidget() {
    await loadScript(
      `${widgetAssetsBaseUrl}/widget-styles.js`,
    );

    await loadScript(
      `${widgetAssetsBaseUrl}/widget-ui.js`,
    );

    let conversationId = "";
    let isSending = false;
    let historyRequestInFlight = false;
    let historyPollTimer = null;
    let isDestroyed = false;

    const seenMessageIds = new Set();

    try {
      conversationId =
        window.localStorage.getItem(
          conversationStorageKey,
        ) || "";
    } catch (error) {
      console.warn(
        "[Sellora Widget] Local storage is unavailable.",
        error,
      );
    }

    const ui =
      window.SelloraWidgetUI.createWidgetUI({
        widgetKey,
      });

    function updateComposerState() {
      const hasMessage = Boolean(
        ui.input.value.trim(),
      );

      ui.sendButton.disabled =
        isSending || !hasMessage;

      ui.input.disabled = isSending;
    }

    function rememberMessageIds(messages) {
      if (!Array.isArray(messages)) {
        return;
      }

      messages.forEach((message) => {
        if (
          message &&
          typeof message.id === "string"
        ) {
          seenMessageIds.add(message.id);
        }
      });
    }

    function clearConversation() {
      conversationId = "";
      seenMessageIds.clear();

      try {
        window.localStorage.removeItem(
          conversationStorageKey,
        );
      } catch (error) {
        console.warn(
          "[Sellora Widget] Could not remove stale conversation ID.",
          error,
        );
      }

      stopHistoryPolling();
      ui.renderHistory([]);
    }

    function stopHistoryPolling() {
      if (historyPollTimer !== null) {
        window.clearTimeout(
          historyPollTimer,
        );

        historyPollTimer = null;
      }
    }

    function scheduleHistoryPoll() {
      stopHistoryPolling();

      if (
        isDestroyed ||
        !conversationId ||
        document.hidden
      ) {
        return;
      }

      historyPollTimer =
        window.setTimeout(async () => {
          await synchronizeHistory();
          scheduleHistoryPoll();
        }, HISTORY_POLL_INTERVAL_MS);
    }

    function startHistoryPolling() {
      if (
        isDestroyed ||
        !conversationId ||
        document.hidden
      ) {
        return;
      }

      scheduleHistoryPoll();
    }

    async function trackWidgetEvent(type) {
      try {
        await fetch(
          `${apiBaseUrl}/api/widget/${encodeURIComponent(widgetKey)}/events`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              type,
              pageUrl:
                window.location.href,
              referrer:
                document.referrer ||
                undefined,
            }),
          },
        );
      } catch (error) {
        console.warn(
          "[Sellora Widget] Failed to track event.",
          error,
        );
      }
    }

    async function requestHistory() {
      if (!conversationId) {
        return {
          success: true,
          messages: [],
        };
      }

      const url = new URL(
        `${apiBaseUrl}/api/widget/history`,
      );

      url.searchParams.set(
        "widgetKey",
        widgetKey,
      );

      url.searchParams.set(
        "conversationId",
        conversationId,
      );

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        if (response.status === 404) {
          clearConversation();

          return {
            success: false,
            stale: true,
            messages: [],
          };
        }

        throw new Error(
          payload.error ||
            "Conversation history could not be loaded.",
        );
      }

      return {
        success: true,
        stale: false,
        messages: Array.isArray(
          payload.messages,
        )
          ? payload.messages
          : [],
      };
    }

    async function loadHistory() {
      if (!conversationId) {
        ui.renderHistory([]);
        return;
      }

      try {
        const result =
          await requestHistory();

        if (!result.success) {
          return;
        }

        seenMessageIds.clear();
        rememberMessageIds(
          result.messages,
        );

        ui.renderHistory(
          result.messages,
        );
      } catch (error) {
        console.error(
          "[Sellora Widget] Failed to load conversation history.",
          error,
        );

        ui.renderHistory([]);
      }
    }

    async function synchronizeHistory({
      markOnly = false,
      force = false,
    } = {}) {
      if (
        isDestroyed ||
        !conversationId ||
        historyRequestInFlight ||
        (!force &&
          (document.hidden || isSending))
      ) {
        return;
      }

      historyRequestInFlight = true;

      try {
        const result =
          await requestHistory();

        if (!result.success) {
          return;
        }

        const newMessages =
          result.messages.filter(
            (message) =>
              message &&
              typeof message.id ===
                "string" &&
              !seenMessageIds.has(
                message.id,
              ),
          );

        rememberMessageIds(
          result.messages,
        );

        if (markOnly) {
          return;
        }

        newMessages.forEach(
          (message) => {
            if (
              typeof message.content !==
              "string"
            ) {
              return;
            }

            const role =
              message.role === "user"
                ? "user"
                : "employee";

            ui.createMessageRow({
              content:
                message.content,
              role,
            });

            if (
              role === "employee" &&
              !ui.isOpen()
            ) {
              ui.incrementUnreadMessages();
            }
          },
        );
      } catch (error) {
        console.warn(
          "[Sellora Widget] Failed to synchronize conversation history.",
          error,
        );
      } finally {
        historyRequestInFlight = false;
      }
    }

    async function sendMessage(message) {
      if (isSending) {
        return;
      }

      const isNewConversation =
        !conversationId;

      isSending = true;
      updateComposerState();

      void trackWidgetEvent(
        "USER_MESSAGE",
      );

      const typingIndicator =
        ui.createTypingIndicator();

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/widget/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              widgetKey,
              conversationId:
                conversationId ||
                undefined,
              message,
            }),
          },
        );

        const payload =
          await response.json();

        if (
          !response.ok ||
          !payload.success
        ) {
          throw new Error(
            payload.error ||
              "Unable to send message.",
          );
        }

        conversationId =
          payload.conversationId;

        if (isNewConversation) {
          void trackWidgetEvent(
            "CONVERSATION_STARTED",
          );
        }

        if (!payload.awaitingHuman) {
          void trackWidgetEvent(
            "AI_RESPONSE",
          );
        }

        try {
          window.localStorage.setItem(
            conversationStorageKey,
            conversationId,
          );
        } catch (error) {
          console.warn(
            "[Sellora Widget] Could not save conversation ID.",
            error,
          );
        }

        typingIndicator.remove();

        if (
          typeof payload.message ===
            "string" &&
          payload.message.trim()
        ) {
          ui.createMessageRow({
            content: payload.message,
            role: "employee",
          });

          if (!ui.isOpen()) {
            ui.incrementUnreadMessages();
          }
        }

        /*
         * The user message and the AI response are already
         * rendered locally. Mark their server IDs as seen so
         * the polling cycle does not add duplicates.
         */
        await synchronizeHistory({
          markOnly: true,
          force: true,
        });

        startHistoryPolling();
      } catch (error) {
        typingIndicator.remove();

        console.error(
          "[Sellora Widget] Failed to send message.",
          error,
        );

        ui.createMessageRow({
          content:
            "Sorry, something went wrong. Please try again.",
          role: "employee",
          error: true,
        });
      } finally {
        isSending = false;
        updateComposerState();
        ui.input.focus();
      }
    }

    ui.launcher.addEventListener(
      "click",
      () => {
        const opening =
          !ui.isOpen();

        ui.setOpen(opening);

        if (opening) {
          void trackWidgetEvent(
            "OPEN",
          );

          void synchronizeHistory({
            force: true,
          });
        }
      },
    );

    ui.closeButton.addEventListener(
      "click",
      () => {
        ui.setOpen(false);
      },
    );

    ui.input.addEventListener(
      "input",
      () => {
        updateComposerState();

        ui.input.style.height =
          "auto";

        ui.input.style.height =
          `${Math.min(
            ui.input.scrollHeight,
            120,
          )}px`;
      },
    );

    ui.input.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" &&
          !event.shiftKey &&
          !event.isComposing
        ) {
          event.preventDefault();
          ui.form.requestSubmit();
        }
      },
    );

    ui.form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        const message =
          ui.input.value.trim();

        if (
          !message ||
          isSending
        ) {
          return;
        }

        ui.createMessageRow({
          content: message,
          role: "user",
        });

        ui.input.value = "";
        ui.input.style.height =
          "auto";

        updateComposerState();

        void sendMessage(message);
      },
    );

    async function loadWidgetConfig() {
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/widget/config/${encodeURIComponent(widgetKey)}`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          },
        );

        const payload =
          await response.json();

        if (
          !response.ok ||
          !payload.success
        ) {
          throw new Error(
            payload.error ||
              "Widget configuration could not be loaded.",
          );
        }

        ui.applyConfig(
          payload.widget,
        );

        return true;
      } catch (error) {
        console.error(
          "[Sellora Widget] Failed to load widget configuration.",
          error,
        );

        ui.root.remove();

        return false;
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopHistoryPolling();
        return;
      }

      void synchronizeHistory({
        force: true,
      });

      startHistoryPolling();
    }

    function cleanup() {
      if (isDestroyed) {
        return;
      }

      isDestroyed = true;

      stopHistoryPolling();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.removeEventListener(
        "pagehide",
        cleanup,
      );

      removalObserver.disconnect();
    }

    const removalObserver =
      new MutationObserver(() => {
        if (!ui.root.isConnected) {
          cleanup();
        }
      });

    removalObserver.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true,
      },
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    window.addEventListener(
      "pagehide",
      cleanup,
      {
        once: true,
      },
    );

    async function initializeWidget() {
      updateComposerState();

      const configLoaded =
        await loadWidgetConfig();

      if (!configLoaded) {
        cleanup();
        return;
      }

      await loadHistory();
      startHistoryPolling();

      void trackWidgetEvent("VIEW");
    }

    void initializeWidget();
  }

  void bootstrapWidget().catch(
    (error) => {
      console.error(
        "[Sellora Widget] Failed to initialize.",
        error,
      );
    },
  );
})();
