/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Bebas Neue", "Oswald", "sans-serif"],
        athletic: ["Rajdhani", "sans-serif"],
        tech: ["Orbitron", "monospace"],
        impact: ["Oswald", "sans-serif"],
      },
      colors: {
        michigan: {
          maize: "#FFCB05",
          blue: "#00274C",
          "blue-light": "#0066CC",
          "maize-light": "#FFD966",
        },
        primary: {
          50: "#f0f8ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0066CC", // Michigan blue light
          600: "#00274C", // Michigan blue
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e293b",
        },
        secondary: {
          50: "#fffef0",
          100: "#fffce0",
          200: "#fff9ba",
          300: "#fff47d",
          400: "#ffed38",
          500: "#FFCB05", // Michigan maize
          600: "#e6b800",
          700: "#cc9900",
          800: "#b38600",
          900: "#996600",
        },
      },
    },
  },
  plugins: [],
};
