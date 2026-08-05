const widgetSdk = String.raw`
(() => {
  "use strict";

  const script =
    document.currentScript ||
    Array.from(document.scripts)
      .reverse()
      .find((item) =>
        item.src.includes("/widget.js"),
      );

  if (!script) {
    console.error(
      "[Sellora Widget] SDK script element was not found.",
    );

    return;
  }

  const widgetKey =
    script.dataset.widgetKey ||
    script.dataset.widget ||
    script.getAttribute(
      "data-sellora-widget",
    ) ||
    "";

  if (!widgetKey.trim()) {
    console.error(
      "[Sellora Widget] Missing data-widget-key attribute.",
    );

    return;
  }

  if (
    document.querySelector(
      '[data-sellora-widget-root="' +
        widgetKey +
        '"]',
    )
  ) {
    return;
  }

  const sdkUrl = new URL(script.src);
  const baseUrl = sdkUrl.origin;

  const requestedLocale =
    script.dataset.locale === "uk"
      ? "uk"
      : "en";

  const fallbackPosition =
    script.dataset.position ===
    "bottom-left"
      ? "bottom-left"
      : "bottom-right";

  const root =
    document.createElement("div");

  root.dataset.selloraWidgetRoot =
    widgetKey;

  root.style.position = "fixed";
  root.style.zIndex = "2147483000";
  root.style.bottom = "20px";
  root.style.pointerEvents = "none";
  root.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  document.body.appendChild(root);

  const launcher =
    document.createElement("button");

  launcher.type = "button";
  launcher.setAttribute(
    "aria-label",
    "Open Sellora chat",
  );
  launcher.setAttribute(
    "aria-expanded",
    "false",
  );

  launcher.style.width = "56px";
  launcher.style.height = "56px";
  launcher.style.padding = "0";
  launcher.style.border = "0";
  launcher.style.borderRadius = "18px";
  launcher.style.display = "flex";
  launcher.style.alignItems = "center";
  launcher.style.justifyContent =
    "center";
  launcher.style.cursor = "pointer";
  launcher.style.color = "#ffffff";
  launcher.style.background =
    "#2563eb";
  launcher.style.boxShadow =
    "0 16px 40px rgba(0, 0, 0, 0.24)";
  launcher.style.pointerEvents =
    "auto";
  launcher.style.transition =
    "transform 160ms ease, box-shadow 160ms ease";

  launcher.innerHTML = [
    '<svg width="24" height="24"',
    ' viewBox="0 0 24 24"',
    ' fill="none"',
    ' xmlns="http://www.w3.org/2000/svg">',
    '<path d="M7 18.5L3.5 21V6.5',
    'C3.5 4.567 5.067 3 7 3H17',
    'C18.933 3 20.5 4.567 20.5 6.5V15',
    'C20.5 16.933 18.933 18.5 17 18.5H7Z"',
    ' stroke="currentColor"',
    ' stroke-width="1.8"',
    ' stroke-linejoin="round"/>',
    '<path d="M8 8.5H16M8 12H13.5"',
    ' stroke="currentColor"',
    ' stroke-width="1.8"',
    ' stroke-linecap="round"/>',
    '</svg>',
  ].join("");

  const panel =
    document.createElement("div");

  panel.style.position = "absolute";
  panel.style.bottom = "72px";
  panel.style.width = "390px";
  panel.style.height = "min(680px, calc(100vh - 120px))";
  panel.style.maxWidth =
    "calc(100vw - 24px)";
  panel.style.borderRadius = "20px";
  panel.style.overflow = "hidden";
  panel.style.background = "#ffffff";
  panel.style.boxShadow =
    "0 24px 80px rgba(0, 0, 0, 0.28)";
  panel.style.opacity = "0";
  panel.style.visibility = "hidden";
  panel.style.transform =
    "translateY(12px) scale(0.98)";
  panel.style.transformOrigin =
    "bottom right";
  panel.style.pointerEvents = "none";
  panel.style.transition =
    "opacity 180ms ease, transform 180ms ease, visibility 180ms ease";

  const iframe =
    document.createElement("iframe");

  iframe.title = "Sellora chat";
  iframe.src =
    baseUrl +
    "/" +
    requestedLocale +
    "/widget/" +
    encodeURIComponent(widgetKey) +
    "?embed=1";

  iframe.allow =
    "clipboard-write";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.style.background =
    "transparent";

  panel.appendChild(iframe);
  root.appendChild(panel);
  root.appendChild(launcher);

  let isOpen = false;
  let position = fallbackPosition;

  function applyPosition() {
    root.style.left =
      position === "bottom-left"
        ? "20px"
        : "auto";

    root.style.right =
      position === "bottom-right"
        ? "20px"
        : "auto";

    panel.style.left =
      position === "bottom-left"
        ? "0"
        : "auto";

    panel.style.right =
      position === "bottom-right"
        ? "0"
        : "auto";

    panel.style.transformOrigin =
      position === "bottom-left"
        ? "bottom left"
        : "bottom right";
  }

  function renderOpenState() {
    launcher.setAttribute(
      "aria-expanded",
      String(isOpen),
    );

    if (isOpen) {
      panel.style.opacity = "1";
      panel.style.visibility =
        "visible";
      panel.style.transform =
        "translateY(0) scale(1)";
      panel.style.pointerEvents =
        "auto";

      launcher.innerHTML = [
        '<svg width="24" height="24"',
        ' viewBox="0 0 24 24"',
        ' fill="none"',
        ' xmlns="http://www.w3.org/2000/svg">',
        '<path d="M6 6L18 18M18 6L6 18"',
        ' stroke="currentColor"',
        ' stroke-width="2"',
        ' stroke-linecap="round"/>',
        '</svg>',
      ].join("");
    } else {
      panel.style.opacity = "0";
      panel.style.visibility =
        "hidden";
      panel.style.transform =
        "translateY(12px) scale(0.98)";
      panel.style.pointerEvents =
        "none";

      launcher.innerHTML = [
        '<svg width="24" height="24"',
        ' viewBox="0 0 24 24"',
        ' fill="none"',
        ' xmlns="http://www.w3.org/2000/svg">',
        '<path d="M7 18.5L3.5 21V6.5',
        'C3.5 4.567 5.067 3 7 3H17',
        'C18.933 3 20.5 4.567 20.5 6.5V15',
        'C20.5 16.933 18.933 18.5 17 18.5H7Z"',
        ' stroke="currentColor"',
        ' stroke-width="1.8"',
        ' stroke-linejoin="round"/>',
        '<path d="M8 8.5H16M8 12H13.5"',
        ' stroke="currentColor"',
        ' stroke-width="1.8"',
        ' stroke-linecap="round"/>',
        '</svg>',
      ].join("");
    }
  }

  launcher.addEventListener(
    "mouseenter",
    () => {
      launcher.style.transform =
        "translateY(-2px)";
      launcher.style.boxShadow =
        "0 20px 48px rgba(0, 0, 0, 0.3)";
    },
  );

  launcher.addEventListener(
    "mouseleave",
    () => {
      launcher.style.transform =
        "translateY(0)";
      launcher.style.boxShadow =
        "0 16px 40px rgba(0, 0, 0, 0.24)";
    },
  );

  launcher.addEventListener(
    "click",
    () => {
      isOpen = !isOpen;
      renderOpenState();
    },
  );

  function applyResponsiveLayout() {
    if (window.innerWidth <= 640) {
      root.style.left = "12px";
      root.style.right = "12px";
      root.style.bottom = "12px";

      panel.style.position = "fixed";
      panel.style.left = "12px";
      panel.style.right = "12px";
      panel.style.bottom = "80px";
      panel.style.width = "auto";
      panel.style.maxWidth = "none";
      panel.style.height =
        "calc(100dvh - 104px)";

      launcher.style.marginLeft =
        position === "bottom-right"
          ? "auto"
          : "0";
    } else {
      root.style.bottom = "20px";
      panel.style.position =
        "absolute";
      panel.style.bottom = "72px";
      panel.style.width = "390px";
      panel.style.maxWidth =
        "calc(100vw - 24px)";
      panel.style.height =
        "min(680px, calc(100vh - 120px))";
      launcher.style.marginLeft = "0";

      applyPosition();
    }
  }

  async function loadConfig() {
    try {
      const response = await fetch(
        baseUrl +
          "/api/widget/config/" +
          encodeURIComponent(widgetKey),
        {
          method: "GET",
          credentials: "omit",
          mode: "cors",
        },
      );

      if (!response.ok) {
        return;
      }

      const payload =
        await response.json();

      const config =
        payload?.data?.config ??
        payload?.data ??
        payload?.config ??
        null;

      const color =
        config?.widgetPrimaryColor ??
        config?.primaryColor ??
        null;

      const configuredPosition =
        config?.widgetPosition ??
        config?.position ??
        null;

      if (
        typeof color === "string" &&
        /^#[0-9a-f]{6}$/i.test(color)
      ) {
        launcher.style.background =
          color;
      }

      if (
        configuredPosition ===
          "bottom-left" ||
        configuredPosition ===
          "bottom-right"
      ) {
        position =
          configuredPosition;
      }

      applyResponsiveLayout();
    } catch {
      // The iframe will display the
      // public widget error state.
    }
  }

  applyPosition();
  applyResponsiveLayout();
  renderOpenState();
  void loadConfig();

  window.addEventListener(
    "resize",
    applyResponsiveLayout,
  );

  window.addEventListener(
    "message",
    (event) => {
      if (event.origin !== baseUrl) {
        return;
      }

      if (
        event.data?.type ===
        "SELLORA_WIDGET_CLOSE"
      ) {
        isOpen = false;
        renderOpenState();
      }

      if (
        event.data?.type ===
        "SELLORA_WIDGET_OPEN"
      ) {
        isOpen = true;
        renderOpenState();
      }
    },
  );

  window.SelloraWidget = {
    open() {
      isOpen = true;
      renderOpenState();
    },

    close() {
      isOpen = false;
      renderOpenState();
    },

    toggle() {
      isOpen = !isOpen;
      renderOpenState();
    },
  };
})();
`;

export function GET() {
  return new Response(widgetSdk, {
    status: 200,
    headers: {
      "Content-Type":
        "application/javascript; charset=utf-8",
      "Cache-Control":
        "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
      "X-Content-Type-Options":
        "nosniff",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
