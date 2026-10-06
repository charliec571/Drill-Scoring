import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        concordia: {
          DEFAULT: "#7A3346",
          burgundy: "#7A3346",
          "burgundy-light": "#964257",
          "burgundy-lighter": "#B8556F",
          "burgundy-dark": "#55212E",
          "burgundy-deep": "#35121B",
          white: "#FFFFFF",
          cream: "#FAF8F5",
        },
        military: {
          camo: "#1C2318",
          olive: "#323E25",
          "olive-light": "#4A5B37",
          drab: "#242C1B",
          gold: "#D4AF37",
          "gold-light": "#F3CE5A",
          brass: "#C59A27",
          dark: "#11151A",
          slate: "#232A33",
        },
        army: {
          gold: "#D4AF37",
          "gold-light": "#F5D264",
          "gold-dark": "#B08B20",
          green: "#323E25",
          "green-light": "#4A5B37",
          "green-dark": "#1F2716",
          black: "#0D1014",
          dark: "#151A21",
          slate: "#242C37",
          muted: "#8A94A6",
          border: "#3E4756",
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
