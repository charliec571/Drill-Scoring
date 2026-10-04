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
        army: {
          gold: "#FFC72C",
          "gold-light": "#FFE58F",
          "gold-dark": "#D4A017",
          green: "#4B5320",
          "green-light": "#636F2B",
          "green-dark": "#363C16",
          black: "#111418",
          dark: "#1A1F26",
          slate: "#2D3748",
          muted: "#8A94A6",
          border: "#3B4252",
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
