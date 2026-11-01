import type { Config } from "tailwindcss";

const burgundyPalette = {
  100: "#F1E7E4",
  300: "#D2A9A3",
  500: "#A84F58",
  700: "#8E3B46",
  900: "#642A34",
};

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: burgundyPalette,
        navy: burgundyPalette,
        ink: "#292727",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;