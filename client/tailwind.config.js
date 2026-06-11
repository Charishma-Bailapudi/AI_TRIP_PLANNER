/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        darkBg: "#0b0f19",
        glassSurface: "rgba(17, 25, 40, 0.75)",
        glassBorder: "rgba(255, 255, 255, 0.08)",
        primaryIndigo: "#3b82f6",
        primaryCyan: "#06b6d4",
        alertRose: "#f43f5e",
      },
      fontFamily: {
        headings: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
