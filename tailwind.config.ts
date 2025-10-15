import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

function cssVar(name: string, fallback: string) {
  return `var(${name}, ${fallback})`;
}

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: cssVar("--color-primary", "#1e3a8a"),
        secondary: cssVar("--color-secondary", "#f97316"),
      },
    },
  },
  plugins: [],
};

export default config;
