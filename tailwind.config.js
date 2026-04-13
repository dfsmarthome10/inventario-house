/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        soft: "#f8fafc",
        accent: "#0ea5e9"
      }
    }
  },
  plugins: []
};