import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          soft: "#171717",
        },
        line: "var(--line)",
        surface: "var(--surface)",
        muted: "var(--muted)",
      },
    },
  },
  plugins: [],
};

export default config;
