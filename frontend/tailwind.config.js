/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cadtBlue: "#0B4F9C",
        cadtNavy: "#0F2747",
        cadtSky: "#EAF3FF",
        cadtLine: "#D6E4F5",
      },
      boxShadow: {
        card: "0 20px 45px rgba(15, 39, 71, 0.12)",
      },
    },
  },
  plugins: [],
};
