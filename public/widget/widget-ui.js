(() => {
  function createWidgetUI({ widgetKey }) {
    let unreadMessagesCount = 0;
    let welcomeText = "Hello! How can I help you today?";

    const root = document.createElement("div");
    root.dataset.selloraWidget = widgetKey;

    const shadowRoot = root.attachShadow({
      mode: "open",
    });

    const style = document.createElement("style");
    style.textContent = window.SelloraWidgetStyles;

    const widget = document.createElement("div");
    widget.className = "sellora-widget";
    widget.dataset.position = "bottom-right";

    const panel = document.createElement("section");
    panel.className = "sellora-panel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Sellora chat");

    const header = document.createElement("header");
    header.className = "sellora-header";

    const headerCopy = document.createElement("div");
    headerCopy.className = "sellora-header-copy";

    const title = document.createElement("h2");
    title.className = "sellora-title";
    title.textContent = "Sellora";

    const status = document.createElement("div");
    status.className = "sellora-status";
    status.innerHTML = `
      <span class="sellora-status-dot" aria-hidden="true"></span>
      <span>Online</span>
    `;

    headerCopy.append(title, status);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "sellora-close";
    closeButton.setAttribute("aria-label", "Close chat");
    closeButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
      </svg>
    `;

    header.append(headerCopy, closeButton);

    const messages = document.createElement("div");
    messages.className = "sellora-messages";
    messages.setAttribute("aria-live", "polite");

    const footer = document.createElement("footer");
    footer.className = "sellora-footer";

    const form = document.createElement("form");
    form.className = "sellora-form";

    const input = document.createElement("textarea");
    input.className = "sellora-input";
    input.rows = 1;
    input.maxLength = 4000;
    input.placeholder = "Write a message...";

    const sendButton = document.createElement("button");
    sendButton.type = "submit";
    sendButton.className = "sellora-send";
    sendButton.disabled = true;
    sendButton.setAttribute("aria-label", "Send message");
    sendButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m22 2-7 20-4-9-9-4Z"></path>
        <path d="M22 2 11 13"></path>
      </svg>
    `;

    form.append(input, sendButton);

    const powered = document.createElement("div");
    powered.className = "sellora-powered";
    powered.textContent = "Powered by Sellora";

    footer.append(form, powered);
    panel.append(header, messages, footer);

    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "sellora-launcher";
    launcher.setAttribute("aria-label", "Open Sellora chat");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
        <path d="M8 9h8"></path>
        <path d="M8 13h5"></path>
      </svg>
    `;

    const unreadBadge = document.createElement("span");
    unreadBadge.className = "sellora-unread-badge";
    unreadBadge.setAttribute("aria-label", "Unread messages");
    unreadBadge.setAttribute("aria-live", "polite");

    launcher.append(unreadBadge);

    function scrollMessagesToBottom() {
      messages.scrollTop = messages.scrollHeight;
    }

    function clearMessages() {
      messages.replaceChildren();
    }

    function createMessageRow({
      content,
      role = "employee",
      error = false,
    }) {
      const row = document.createElement("div");

      row.className = [
        "sellora-message-row",
        role === "user" ? "is-user" : "",
        error ? "is-error" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const bubble = document.createElement("div");
      bubble.className = "sellora-message";
      bubble.textContent = content;

      row.append(bubble);
      messages.append(row);
      scrollMessagesToBottom();

      return row;
    }

    function showWelcomeMessage() {
      createMessageRow({
        content: welcomeText,
        role: "employee",
      });
    }

    function renderHistory(historyMessages) {
      clearMessages();

      if (
        !Array.isArray(historyMessages) ||
        historyMessages.length === 0
      ) {
        showWelcomeMessage();
        return;
      }

      historyMessages.forEach((message) => {
        if (
          !message ||
          typeof message.content !== "string"
        ) {
          return;
        }

        createMessageRow({
          content: message.content,
          role:
            message.role === "user"
              ? "user"
              : "employee",
        });
      });

      scrollMessagesToBottom();
    }

    function createTypingIndicator() {
      const row = document.createElement("div");
      row.className = "sellora-message-row";

      const bubble = document.createElement("div");
      bubble.className = "sellora-message sellora-typing";
      bubble.setAttribute("aria-label", "AI Employee is typing");

      bubble.innerHTML = `
        <span class="sellora-typing-dot"></span>
        <span class="sellora-typing-dot"></span>
        <span class="sellora-typing-dot"></span>
      `;

      row.append(bubble);
      messages.append(row);
      scrollMessagesToBottom();

      return row;
    }

    function updateUnreadBadge() {
      if (unreadMessagesCount <= 0) {
        unreadBadge.textContent = "";
        unreadBadge.classList.remove("is-visible");
        return;
      }

      unreadBadge.textContent =
        unreadMessagesCount > 9
          ? "9+"
          : String(unreadMessagesCount);

      unreadBadge.classList.add("is-visible");
    }

    function incrementUnreadMessages() {
      unreadMessagesCount += 1;
      updateUnreadBadge();
    }

    function clearUnreadMessages() {
      unreadMessagesCount = 0;
      updateUnreadBadge();
    }

    function setOpen(nextOpen) {
      panel.hidden = !nextOpen;

      launcher.setAttribute(
        "aria-expanded",
        String(nextOpen),
      );

      if (nextOpen) {
        clearUnreadMessages();

        window.setTimeout(() => {
          input.focus();
          scrollMessagesToBottom();
        }, 0);
      }
    }

    function applyConfig(widgetConfig) {
      const employee = widgetConfig.employee;

      title.textContent =
        widgetConfig.title || employee.name;

      welcomeText =
        widgetConfig.greeting ||
        `Hello! I’m ${employee.name}. How can I help you today?`;

      input.placeholder = `Message ${employee.name}...`;

      launcher.setAttribute(
        "aria-label",
        `Open chat with ${employee.name}`,
      );

      panel.setAttribute(
        "aria-label",
        `Chat with ${employee.name}`,
      );

      widget.style.setProperty(
        "--sellora-primary-color",
        widgetConfig.primaryColor || "#2563eb",
      );

      widget.dataset.position =
        widgetConfig.position === "bottom-left"
          ? "bottom-left"
          : "bottom-right";
    }

    widget.append(panel, launcher);
    shadowRoot.append(style, widget);
    document.body.append(root);

    showWelcomeMessage();

    return {
      root,
      panel,
      launcher,
      closeButton,
      form,
      input,
      sendButton,
      clearMessages,
      renderHistory,
      showWelcomeMessage,
      createMessageRow,
      createTypingIndicator,
      incrementUnreadMessages,
      setOpen,
      applyConfig,
      isOpen() {
        return !panel.hidden;
      },
      scrollMessagesToBottom,
    };
  }

  window.SelloraWidgetUI = {
    createWidgetUI,
  };
})();