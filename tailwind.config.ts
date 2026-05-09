import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#06070b",
          900: "#0a0c12",
          800: "#0f1218",
          700: "#151823",
          600: "#1c2030",
          500: "#252a3d",
        },
        neon: {
          blue: "#5b8cff",
          violet: "#a78bfa",
          cyan: "#22d3ee",
          emerald: "#34d399",
          amber: "#fbbf24",
          rose: "#fb7185",
        },
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace"],
      },
      boxShadow: {
        glow: "0 0 30px -8px rgba(91,140,255,0.35)",
        "glow-violet": "0 0 30px -8px rgba(167,139,250,0.4)",
        "glow-emerald": "0 0 30px -8px rgba(52,211,153,0.4)",
        glass:
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.06), 0 20px 40px -20px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(800px circle at 20% 0%, rgba(91,140,255,0.10), transparent 50%), radial-gradient(600px circle at 90% 30%, rgba(167,139,250,0.10), transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 600ms ease-out",
        "slide-up": "slideUp 600ms cubic-bezier(0.16,1,0.3,1)",
        shimmer: "shimmer 2.4s linear infinite",
        pulseGlow: "pulseGlow 3.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
