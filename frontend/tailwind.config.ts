import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Sage green — primary brand
        brand: {
          DEFAULT: "#6FA060",
          50: "#F2F6EE",
          100: "#E1EBD8",
          200: "#C5D9B6",
          300: "#A4C28E",
          400: "#86AD6F",
          500: "#6FA060",
          600: "#5C8A50",
          700: "#4A6E41",
          800: "#3B5736",
          900: "#2F4530",
        },
        // Forest — deep sidebar / dark surfaces
        forest: {
          DEFAULT: "#2F3E33",
          50: "#EEF1EE",
          100: "#D6DDD7",
          400: "#52685A",
          500: "#3F5243",
          600: "#374A3B",
          700: "#2F3E33",
          800: "#26322A",
          900: "#1C2620",
        },
        // Cream — page background
        cream: {
          DEFAULT: "#F7F4ED",
          50: "#FBFAF6",
          100: "#F7F4ED",
          200: "#EFEAE0",
          300: "#E5DECF",
        },
        // Stone — borders / muted text on cream
        stone: {
          DEFAULT: "#A8A29E",
          50: "#FAFAF9",
          100: "#F5F4F1",
          200: "#E7E4DD",
          300: "#D1CDC2",
          400: "#A8A39A",
          500: "#7C786F",
          600: "#5C5851",
          700: "#3F3D38",
          800: "#27261F",
          900: "#1A1A14",
        },
        // Semantic
        success: "#6FA060",
        warning: "#D4A24C",
        danger: "#C7503D",
        info: "#5C8A8A",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(31, 38, 32, 0.04), 0 1px 3px 0 rgba(31, 38, 32, 0.06)",
        card: "0 1px 2px 0 rgba(31, 38, 32, 0.04), 0 4px 12px -2px rgba(31, 38, 32, 0.06)",
        elevated: "0 4px 16px -4px rgba(31, 38, 32, 0.10), 0 8px 32px -8px rgba(31, 38, 32, 0.08)",
        ring: "0 0 0 4px rgba(111, 160, 96, 0.18)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      letterSpacing: {
        eyebrow: "0.12em",
      },
    },
  },
  plugins: [],
};

export default config;
