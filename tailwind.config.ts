import type { Config } from "tailwindcss";

const mulberryPalette = {
  50: "#FAF3F5",
  100: "#F5E6E9",
  200: "#EDCFD6",
  300: "#DEAAB7",
  400: "#CB7B90",
  500: "#B6516D",
  600: "#A33756",
  700: "#9F1239", // Primary Mulberry Wine
  800: "#881337", // Deep Wine
  900: "#70142D",
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
        mulberry: mulberryPalette,
        burgundy: mulberryPalette,
        navy: mulberryPalette,
        stoneCanvas: "#F5F1F2",
        stoneCard: "#FFFFFF",
        stoneBorder: "#E8E2E4",
        stoneMuted: "#796E72",
        ink: "#272125",
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "'Space Grotesk'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;