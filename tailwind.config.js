/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        "surface-hover": "var(--surface-hover)",
        "surface-active": "var(--surface-active)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        subtle: "var(--subtle)",
        "input-bg": "var(--input-bg)",
        "input-bg-focus": "var(--input-bg-focus)",
        accent: "var(--accent)",
        danger: "var(--danger)",
        success: "var(--success)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      fontFamily: {
        ui: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: [
          "ui-monospace",
          "JetBrains Mono",
          "SF Mono",
          "Menlo",
          "Monaco",
          "Cascadia Code",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
