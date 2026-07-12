export const designSystem = {
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
  },

  sidebar: {
    width: "280px",
  },

  header: {
    height: "64px",
  },

  colors: {
    background: "bg-background",
    foreground: "text-foreground",

    card: "bg-card",
    border: "border-border",

    primary: "bg-blue-600",
    primaryHover: "hover:bg-blue-700",

    muted: "bg-muted",
  },

  animation: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
  },
} as const