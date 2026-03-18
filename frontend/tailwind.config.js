/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#192841",
        'primary-light': "#1e4266",
        accent: "#FFA500",
        'accent-dark': "#FF8C00",
        dark: "#555",
      },
      fontFamily: {
        sans: ["'Niradei', Arial", "sans-serif"],
      },
      animation: {
        slideInLeft: "slideInLeft 0.8s ease",
        slideInRight: "slideInRight 0.8s ease",
        glow: "glow 2s ease-in-out infinite",
        pulse: "pulse 0.8s ease-in-out",
        ripple: "ripple 0.6s ease-out",
        neon: "neon 1.5s ease-in-out infinite",
        slideUp: "slideUp 0.6s ease",
        slideDown: "slideDown 0.6s ease",
        fadeInScale: "fadeInScale 0.6s ease",
        shimmer: "shimmer 1s ease",
        expandRipple: "expandRipple 0.6s ease-out",
        textGlow: "textGlow 2s ease-in-out infinite",
      },
      keyframes: {
        slideInLeft: {
          from: {
            opacity: "0",
            transform: "translateX(-50px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        slideInRight: {
          from: {
            opacity: "0",
            transform: "translateX(50px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(255, 165, 0, 0.4), 0 0 40px rgba(255, 165, 0, 0.2)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(255, 165, 0, 0.6), 0 0 60px rgba(255, 165, 0, 0.3)",
          },
        },
        pulse: {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
        },
        ripple: {
          "0%": {
            transform: "scale(0)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(4)",
            opacity: "0",
          },
        },
        neon: {
          "0%, 100%": {
            textShadow: "0 0 10px #FFA500",
            boxShadow: "0 0 10px #FFA500",
          },
          "50%": {
            textShadow: "0 0 20px #FFA500, 0 0 30px #FF8C00",
            boxShadow: "0 0 20px #FFA500, 0 0 30px #FF8C00",
          },
        },
        slideUp: {
          from: {
            opacity: "0",
            transform: "translateY(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideDown: {
          from: {
            opacity: "0",
            transform: "translateY(-30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInScale: {
          from: {
            opacity: "0",
            transform: "scale(0.8)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        shimmer: {
          "0%": {
            backgroundPosition: "-1000px 0",
          },
          "100%": {
            backgroundPosition: "1000px 0",
          },
        },
        expandRipple: {
          "0%": {
            transform: "scale(0)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(4)",
            opacity: "0",
          },
        },
        textGlow: {
          "0%, 100%": {
            textShadow: "0 0 10px rgba(255, 165, 0, 0.3), 0 0 20px rgba(255, 165, 0, 0.1)",
          },
          "50%": {
            textShadow: "0 0 15px rgba(255, 165, 0, 0.6), 0 0 30px rgba(255, 165, 0, 0.3)",
          },
        },
      },
    },
  },
  plugins: [],
}
