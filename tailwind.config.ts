import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Oxblood & Bone" — cloth-bound first edition. Bone paper, near-black
        // ink, oxblood spot colour. Token names kept (cinema-*) so the whole
        // app re-skins from here.
        cinema: {
          bg: "#EDE6DA", // bone paper
          surface: "#F6F1E7", // lighter page
          "surface-2": "#E3DAC8", // recessed / tinted bone (strips, footer)
          accent: "#6E2B2B", // oxblood (spot colour — CTAs, marks, emphasis)
          "accent-light": "#8A3A2E", // brighter brick (hover + emphasis text)
          ember: "#B5562F", // warm terracotta — reserved for emotional peaks
          text: "#1C1A17", // near-black ink (primary text)
          muted: "#6B6256", // warm gray
          "muted-dark": "#9A9080", // faint warm gray
          // dark surfaces for sections that stay cinematic (story / constellation)
          night: "#161210",
        },
      },
      fontFamily: {
        // Editorial type system (wired via next/font CSS variables).
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        credit: "0.28em",
      },
      boxShadow: {
        // Soft, paper-on-table elevation.
        paper: "0 1px 2px rgba(42,36,28,0.04), 0 8px 30px rgba(42,36,28,0.07)",
        "paper-lg": "0 2px 6px rgba(42,36,28,0.06), 0 18px 50px rgba(42,36,28,0.12)",
        polaroid: "0 1px 1px rgba(42,36,28,0.08), 0 10px 26px rgba(42,36,28,0.14)",
      },
      backgroundImage: {
        // Faint oxblood bloom near the top of the page.
        "hero-glow":
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(110, 43, 43, 0.10), transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        grain: "grain 0.8s steps(4) infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
