(() => {
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

  const widgetKey = currentScript.dataset.widgetKey?.trim();

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

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;

      script.addEventListener("load", resolve, {
        once: true,
      });

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
    });

    window.__selloraWidgetScriptPromises[src] = promise;

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

    const ui = window.SelloraWidgetUI.createWidgetUI({
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

    async function sendMessage(message) {
      if (isSending) {
        return;
      }

      isSending = true;
      updateComposerState();

      const typingIndicator =
        ui.createTypingIndicator();

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/widget/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              widgetKey,
              conversationId:
                conversationId || undefined,
              message,
            }),
          },
        );

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(
            payload.error ||
              "Unable to send message.",
          );
        }

        conversationId = payload.conversationId;

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

        ui.createMessageRow({
          content: payload.message,
          role: "employee",
        });

        if (!ui.isOpen()) {
          ui.incrementUnreadMessages();
        }
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

    ui.launcher.addEventListener("click", () => {
      ui.setOpen(!ui.isOpen());
    });

    ui.closeButton.addEventListener("click", () => {
      ui.setOpen(false);
    });

    ui.input.addEventListener("input", () => {
      updateComposerState();

      ui.input.style.height = "auto";
      ui.input.style.height =
        `${Math.min(ui.input.scrollHeight, 120)}px`;
    });

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

    ui.form.addEventListener("submit", (event) => {
      event.preventDefault();

      const message = ui.input.value.trim();

      if (!message || isSending) {
        return;
      }

      ui.createMessageRow({
        content: message,
        role: "user",
      });

      ui.input.value = "";
      ui.input.style.height = "auto";
      updateComposerState();

      void sendMessage(message);
    });

    async function loadWidgetConfig() {
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/widget/config/${encodeURIComponent(widgetKey)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(
            payload.error ||
              "Widget configuration could not be loaded.",
          );
        }

        ui.applyConfig(payload.widget);

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

    async function loadHistory() {
      if (!conversationId) {
        ui.renderHistory([]);
        return;
      }

      try {
        const url = new URL(
          `${apiBaseUrl}/api/widget/history`,
        );

        url.searchParams.set("widgetKey", widgetKey);
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
            conversationId = "";

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

            ui.renderHistory([]);
            return;
          }

          throw new Error(
            payload.error ||
              "Conversation history could not be loaded.",
          );
        }

        ui.renderHistory(payload.messages);
      } catch (error) {
        console.error(
          "[Sellora Widget] Failed to load conversation history.",
          error,
        );

        ui.renderHistory([]);
      }
    }

    async function initializeWidget() {
      updateComposerState();

      const configLoaded =
        await loadWidgetConfig();

      if (!configLoaded) {
        return;
      }

      await loadHistory();
    }

    void initializeWidget();
  }

  void bootstrapWidget().catch((error) => {
    console.error(
      "[Sellora Widget] Failed to initialize.",
      error,
    );
  });
})();