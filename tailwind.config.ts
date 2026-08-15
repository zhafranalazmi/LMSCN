import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF7ED",
          100: "#FFEBD1",
          300: "#F6B975",
          500: "#E8873A", // primary amber-orange
          600: "#CC6A22",
          700: "#A6511A",
        },
        plum: {
          50: "#FAF3F6",
          200: "#E3C3D2",
          500: "#8A3B63", // deep plum accent
          700: "#5B2540",
          900: "#2E1220",
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
