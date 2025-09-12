/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // enable dark mode using the `.dark` class
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f2ec",
          100: "#cce6d9",
          200: "#99ccae",
          300: "#66b383",
          400: "#339958",
          500: "#004B23", // base
          600: "#003d1d",
          700: "#003017",
          800: "#002411",
          900: "#00180b",
        },
        lime: {
          50: "#f5fbe8",
          100: "#e9f8cc",
          200: "#d3f199",
          300: "#bdeb66",
          400: "#a7e433",
          500: "#7FBA00", // base
          600: "#679500",
          700: "#4f7000",
          800: "#374c00",
          900: "#202700",
        },
        neon: {
          50: "#faffda",
          100: "#f5ffb5",
          200: "#ebff6b",
          300: "#e0ff33",
          400: "#d5ff00",
          500: "#CCFF33", // base
          600: "#a3cc29",
          700: "#7a991f",
          800: "#526615",
          900: "#29330a",
        },
        blue: {
          50: "#e5e6ff",
          100: "#bfc0ff",
          200: "#999aff",
          300: "#7374ff",
          400: "#4d4eff",
          500: "#1900FF", // base
          600: "#1500cc",
          700: "#100099",
          800: "#0c0066",
          900: "#080033",
        },
        jet: {
          50: "#e6e6e6",
          100: "#cccccc",
          200: "#999999",
          300: "#666666",
          400: "#333333",
          500: "#000000", // base
          600: "#000000",
          700: "#000000",
          800: "#000000",
          900: "#000000",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg, 0.5rem)",
        xl: "var(--radius-xl, 0.75rem)",
        "2xl": "var(--radius-2xl, 1rem)",
      },
      animation: {
        "slide-in": "slideIn 0.3s ease-out forwards",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
