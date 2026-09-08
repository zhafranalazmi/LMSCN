import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          100: "#D9DCD6", // dari palet — background halaman
          300: "#8AACBE", // tint tengah, buat border/hover halus
          500: "#3A7CA5", // dari palet — accent/menu aktif
          700: "#2F6690", // dari palet — dasar sidebar
          900: "#21476A", // shade paling gelap, buat hover/pressed state
        },
        ink: "#211A1D",
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