import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identité réelle Medical Wellness (site existant)
        gold: {
          50: "#fdf9e8",
          100: "#f9efc4",
          200: "#f3dd8a",
          300: "#eec955",
          400: "#d4af37",
          500: "#c19b2f",
          600: "#a68728",
          700: "#8a6f20",
          800: "#6e5819",
          900: "#524112",
        },
        ivory: {
          50: "#fefdf9",
          100: "#fdfaef",
          200: "#faf3db",
          300: "#f5e9bf",
          400: "#edd99e",
          500: "#e0c67a",
        },
        noir: {
          50: "#f6f5f2",
          100: "#e0ddd6",
          200: "#c2bcaf",
          300: "#a39b88",
          400: "#857b64",
          500: "#6b624e",
          600: "#534c3d",
          700: "#3c372d",
          800: "#26231c",
          900: "#1a1813",
          950: "#0d0c09",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(26 24 19 / 0.06), 0 1px 2px -1px rgb(26 24 19 / 0.06)",
        "card-hover": "0 6px 20px -4px rgb(26 24 19 / 0.12)",
        gold: "0 4px 20px -4px rgb(212 175 55 / 0.35)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;