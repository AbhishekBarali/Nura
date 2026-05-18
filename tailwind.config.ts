import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "'Literata'", "Georgia", "serif"],
        body: ["var(--font-body)", "'Source Sans 3'", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "var(--accent-primary)",
        "primary-light": "var(--accent-light)",
      },
      animation: {
        "fade-in": "fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in": "slideIn 0.4s ease-out",
        breathe: "breathe 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
