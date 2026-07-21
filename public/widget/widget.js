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
  const conversationStorageKey =
    `sellora-conversation-${widgetKey}`;

  let conversationId = "";
  let isSending = false;

  try {
    conversationId =
      window.localStorage.getItem(conversationStorageKey) || "";
  } catch (error) {
    console.warn(
      "[Sellora Widget] Local storage is unavailable.",
      error,
    );
  }

  const root = document.createElement("div");
  root.dataset.selloraWidget = widgetKey;

  const shadowRoot = root.attachShadow({
    mode: "open",
  });

  const style = document.createElement("style");

  style.textContent = `
    :host {
      all: initial;
    }

    * {
      box-sizing: border-box;
    }

    .sellora-widget {
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
      color: #f4f4f5;
    }

    .sellora-launcher {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 2147483647;
      display: inline-flex;
      width: 56px;
      height: 56px;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 18px;
      background: #2563eb;
      color: #ffffff;
      box-shadow:
        0 18px 48px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.18);
      cursor: pointer;
      transition:
        transform 160ms ease,
        background-color 160ms ease;
    }

    .sellora-launcher:hover {
      transform: translateY(-2px);
      background: #1d4ed8;
    }

    .sellora-launcher:focus-visible,
    .sellora-close:focus-visible,
    .sellora-send:focus-visible,
    .sellora-input:focus-visible {
      outline: 3px solid rgba(37, 99, 235, 0.35);
      outline-offset: 3px;
    }

    .sellora-launcher svg,
    .sellora-close svg,
    .sellora-send svg {
      width: 22px;
      height: 22px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .sellora-panel {
      position: fixed;
      right: 24px;
      bottom: 92px;
      z-index: 2147483647;
      display: flex;
      width: min(380px, calc(100vw - 32px));
      height: min(620px, calc(100vh - 120px));
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 22px;
      background: #111113;
      box-shadow:
        0 28px 80px rgba(0, 0, 0, 0.42),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
      transform-origin: bottom right;
    }

    .sellora-panel[hidden] {
      display: none;
    }

    .sellora-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 16px;
      background:
        radial-gradient(
          circle at top right,
          rgba(37, 99, 235, 0.2),
          transparent 48%
        ),
        #141416;
    }

    .sellora-header-copy {
      min-width: 0;
    }

    .sellora-title {
      margin: 0;
      overflow: hidden;
      color: #fafafa;
      font-size: 15px;
      font-weight: 650;
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sellora-status {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-top: 5px;
      color: #a1a1aa;
      font-size: 12px;
      line-height: 1.4;
    }

    .sellora-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: #34d399;
      box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
    }

    .sellora-close {
      display: inline-flex;
      width: 34px;
      height: 34px;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 11px;
      background: rgba(255, 255, 255, 0.04);
      color: #a1a1aa;
      cursor: pointer;
    }

    .sellora-messages {
      flex: 1;
      overflow-y: auto;
      padding: 18px;
      background: #0d0d0f;
      scroll-behavior: smooth;
    }

    .sellora-message-row {
      display: flex;
      margin-bottom: 14px;
    }

    .sellora-message-row.is-user {
      justify-content: flex-end;
    }

    .sellora-message {
      max-width: 82%;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px 16px 16px 5px;
      background: #18181b;
      color: #e4e4e7;
      padding: 11px 13px;
      font-size: 14px;
      line-height: 1.55;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .sellora-message-row.is-user .sellora-message {
      border-color: rgba(37, 99, 235, 0.45);
      border-radius: 16px 16px 5px 16px;
      background: #2563eb;
      color: #ffffff;
    }

    .sellora-message-row.is-error .sellora-message {
      border-color: rgba(239, 68, 68, 0.35);
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
    }

    .sellora-typing {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-width: 54px;
      min-height: 42px;
    }

    .sellora-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: #a1a1aa;
      animation: sellora-typing 1.2s infinite ease-in-out;
    }

    .sellora-typing-dot:nth-child(2) {
      animation-delay: 160ms;
    }

    .sellora-typing-dot:nth-child(3) {
      animation-delay: 320ms;
    }

    @keyframes sellora-typing {
      0%,
      60%,
      100% {
        opacity: 0.35;
        transform: translateY(0);
      }

      30% {
        opacity: 1;
        transform: translateY(-3px);
      }
    }

    .sellora-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 14px;
      background: #141416;
    }

    .sellora-form {
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }

    .sellora-input {
      min-height: 44px;
      max-height: 120px;
      flex: 1;
      resize: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 13px;
      background: #0f0f11;
      color: #fafafa;
      padding: 11px 12px;
      font: inherit;
      font-size: 14px;
      line-height: 1.5;
    }

    .sellora-input::placeholder {
      color: #71717a;
    }

    .sellora-input:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .sellora-send {
      display: inline-flex;
      width: 44px;
      height: 44px;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 13px;
      background: #2563eb;
      color: #ffffff;
      cursor: pointer;
    }

    .sellora-send:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .sellora-powered {
      margin-top: 9px;
      color: #71717a;
      font-size: 11px;
      text-align: center;
    }

    @media (max-width: 520px) {
      .sellora-launcher {
        right: 16px;
        bottom: 16px;
      }

      .sellora-panel {
        right: 8px;
        bottom: 82px;
        width: calc(100vw - 16px);
        height: min(680px, calc(100vh - 98px));
        border-radius: 20px;
      }
    }
  `;

  const widget = document.createElement("div");
  widget.className = "sellora-widget";

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

  const welcomeRow = document.createElement("div");
  welcomeRow.className = "sellora-message-row";

  const welcomeMessage = document.createElement("div");
  welcomeMessage.className = "sellora-message";
  welcomeMessage.textContent =
    "Hello! How can I help you today?";

  welcomeRow.append(welcomeMessage);
  messages.append(welcomeRow);

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

  function scrollMessagesToBottom() {
    messages.scrollTop = messages.scrollHeight;
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

  function setOpen(nextOpen) {
    panel.hidden = !nextOpen;

    launcher.setAttribute(
      "aria-expanded",
      String(nextOpen),
    );

    if (nextOpen) {
      window.setTimeout(() => {
        input.focus();
        scrollMessagesToBottom();
      }, 0);
    }
  }

  function updateComposerState() {
    const hasMessage = Boolean(input.value.trim());

    sendButton.disabled = isSending || !hasMessage;
    input.disabled = isSending;
  }

  async function sendMessage(message) {
    if (isSending) {
      return;
    }

    isSending = true;
    updateComposerState();

    const typingIndicator = createTypingIndicator();

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
            conversationId: conversationId || undefined,
            message,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.error || "Unable to send message.",
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

      createMessageRow({
        content: payload.message,
        role: "employee",
      });
    } catch (error) {
      typingIndicator.remove();

      console.error(
        "[Sellora Widget] Failed to send message.",
        error,
      );

      createMessageRow({
        content:
          "Sorry, something went wrong. Please try again.",
        role: "employee",
        error: true,
      });
    } finally {
      isSending = false;
      updateComposerState();
      input.focus();
    }
  }

  launcher.addEventListener("click", () => {
    setOpen(panel.hidden);
  });

  closeButton.addEventListener("click", () => {
    setOpen(false);
  });

  input.addEventListener("input", () => {
    updateComposerState();

    input.style.height = "auto";
    input.style.height =
      `${Math.min(input.scrollHeight, 120)}px`;
  });

  input.addEventListener("keydown", (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.isComposing
    ) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = input.value.trim();

    if (!message || isSending) {
      return;
    }

    createMessageRow({
      content: message,
      role: "user",
    });

    input.value = "";
    input.style.height = "auto";
    updateComposerState();

    void sendMessage(message);
  });

  widget.append(panel, launcher);
  shadowRoot.append(style, widget);
  document.body.append(root);

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

    const widgetConfig = payload.widget;
    const employee = widgetConfig.employee;

    // ---------- Title ----------
    title.textContent = widgetConfig.title;

    // ---------- Greeting ----------
    welcomeMessage.textContent = widgetConfig.greeting;

    // ---------- Placeholder ----------
    input.placeholder = `Message ${employee.name}...`;

    // ---------- Accessibility ----------
    launcher.setAttribute(
      "aria-label",
      `Open chat with ${employee.name}`,
    );

    panel.setAttribute(
      "aria-label",
      `Chat with ${employee.name}`,
    );

    // ---------- Primary color ----------
    launcher.style.backgroundColor =
      widgetConfig.primaryColor;

    header.style.background =
      widgetConfig.primaryColor;

    // ---------- Position ----------
    if (widgetConfig.position === "bottom-left") {
      launcher.style.left = "24px";
      launcher.style.right = "auto";

      panel.style.left = "24px";
      panel.style.right = "auto";
    } else {
      launcher.style.right = "24px";
      launcher.style.left = "auto";

      panel.style.right = "24px";
      panel.style.left = "auto";
    }
  } catch (error) {
    console.error(
      "[Sellora Widget] Failed to load widget configuration.",
      error,
    );

    root.remove();
  }
}

  updateComposerState();
  void loadWidgetConfig();
})();