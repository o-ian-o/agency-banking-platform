/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fintech: {
          50: "#f8fafc", // Subtle background
          100: "#f1f5f9",
          600: "#2563eb", // Trust blue for primary buttons
          800: "#1e293b", // Dark slate for headers
          900: "#0f172a", // Deep contrast text
        },
      },
    },
  },
  plugins: [],
};
