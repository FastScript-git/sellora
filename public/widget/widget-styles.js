(() => {
  window.SelloraWidgetStyles = `
    :host {
      all: initial;
    }

    * {
      box-sizing: border-box;
    }

    .sellora-widget {
      --sellora-primary-color: #2563eb;
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
      background: var(--sellora-primary-color);
      color: #ffffff;
      box-shadow:
        0 18px 48px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.18);
      cursor: pointer;
      transition:
        transform 160ms ease,
        filter 160ms ease;
    }

    .sellora-launcher:hover {
      transform: translateY(-2px);
      filter: brightness(0.92);
    }

    .sellora-unread-badge {
      position: absolute;
      top: -7px;
      right: -7px;
      display: none;
      min-width: 22px;
      height: 22px;
      align-items: center;
      justify-content: center;
      border: 2px solid #111113;
      border-radius: 999px;
      background: #ef4444;
      color: #ffffff;
      padding: 0 5px;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35);
    }

    .sellora-unread-badge.is-visible {
      display: inline-flex;
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

    .sellora-widget[data-position="bottom-left"] .sellora-launcher {
      right: auto;
      left: 24px;
    }

    .sellora-widget[data-position="bottom-left"] .sellora-panel {
      right: auto;
      left: 24px;
      transform-origin: bottom left;
    }

    .sellora-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 16px;
      background: var(--sellora-primary-color);
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
      color: rgba(255, 255, 255, 0.78);
      font-size: 12px;
      line-height: 1.4;
    }

    .sellora-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: #34d399;
      box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.16);
    }

    .sellora-close {
      display: inline-flex;
      width: 34px;
      height: 34px;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 11px;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
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
      border-color: color-mix(
        in srgb,
        var(--sellora-primary-color) 70%,
        transparent
      );
      border-radius: 16px 16px 5px 16px;
      background: var(--sellora-primary-color);
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
      background: var(--sellora-primary-color);
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

      .sellora-widget[data-position="bottom-left"] .sellora-launcher {
        right: auto;
        left: 16px;
      }

      .sellora-widget[data-position="bottom-left"] .sellora-panel {
        right: auto;
        left: 8px;
      }
    }
  `;
})();