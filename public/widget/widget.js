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
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    .sellora-launcher:hover {
      transform: translateY(-2px);
      background: #1d4ed8;
    }

    .sellora-launcher:focus-visible {
      outline: 3px solid rgba(37, 99, 235, 0.35);
      outline-offset: 4px;
    }

    .sellora-launcher svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;

  const launcher = document.createElement("button");

  launcher.type = "button";
  launcher.className = "sellora-launcher";
  launcher.setAttribute("aria-label", "Open Sellora chat");

  launcher.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
      <path d="M8 9h8"></path>
      <path d="M8 13h5"></path>
    </svg>
  `;

  launcher.addEventListener("click", () => {
    console.info(
      "[Sellora Widget] Launcher clicked.",
      {
        widgetKey,
      },
    );
  });

  shadowRoot.append(style, launcher);
  document.body.append(root);
})();