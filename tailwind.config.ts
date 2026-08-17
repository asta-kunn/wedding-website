import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#191527",
          deep: "#0E0B18",
          soft: "#241E36",
          line: "#332B48",
        },
        brass: {
          DEFAULT: "#C6A15B",
          light: "#E3CB92",
          dim: "#8A6E3A",
        },
        paper: {
          DEFAULT: "#F7F1E6",
          dim: "#E8DFCD",
          line: "#D6C9AE",
          ink: "#2A2418",
          mute: "#6B6152",
        },
        leaf: "#5C7F63",
        rose: "#8E3B4A",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
      boxShadow: {
        sheet: "0 -18px 50px rgba(0,0,0,0.55)",
        card: "0 10px 30px rgba(0,0,0,0.35)",
      },
      keyframes: {
        stamp: {
          "0%": { opacity: "0", transform: "scale(1.8) rotate(-14deg)" },
          "60%": { opacity: "1", transform: "scale(0.94) rotate(-7deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-8deg)" },
        },
        riseUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        sweep: {
          "0%": { top: "0%", opacity: "0.15" },
          "50%": { opacity: "1" },
          "100%": { top: "100%", opacity: "0.15" },
        },
      },
      animation: {
        stamp: "stamp 420ms cubic-bezier(.2,.8,.3,1) both",
        riseUp: "riseUp 320ms cubic-bezier(.2,.8,.3,1) both",
        fadeIn: "fadeIn 220ms ease-out both",
        sweep: "sweep 2.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
