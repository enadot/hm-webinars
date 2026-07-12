import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./templates/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1320px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', '"Heebo"', "system-ui", "sans-serif"],
        display: ['"Google Sans"', '"Heebo"', "system-ui", "sans-serif"],
        heebo: ['"Heebo"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        tam: ['"Tel Aviv Modernist"', '"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        // Larger base sizes for impactful Hebrew typography
        "display-sm": ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-lg": ["5rem", { lineHeight: "1.02", letterSpacing: "-0.025em", fontWeight: "800" }],
        "display-xl": ["6.5rem", { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "900" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          // Deep, rich navy - more dramatic than #1E3A8A
          primary: "#0B1437",
          "primary-2": "#1B2762",
          // Vibrant amber-gold - more eye-catching than #D4A017
          gold: "#F5B500",
          "gold-light": "#FFCB3D",
          // Saturated, modern purple
          purple: "#7C3AED",
          "purple-2": "#A855F7",
          // Coral accent - adds energy
          coral: "#FB7185",
          // Near-black for text
          dark: "#0A0E27",
          ink: "#1A1F3D",
          // Wealth template - deep forest greens + emerald accents
          forest: "#052E22",
          "forest-2": "#0B4A36",
          emerald: "#10B981",
          "emerald-light": "#34D399",
          mint: "#A7F3D0",
          champagne: "#E3D3A3",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        "glow-gold": "0 20px 60px -10px rgba(245, 181, 0, 0.45)",
        "glow-purple": "0 20px 60px -10px rgba(124, 58, 237, 0.55)",
        "glow-brand": "0 25px 80px -15px rgba(11, 20, 55, 0.65)",
        "card-lift": "0 30px 80px -20px rgba(11, 20, 55, 0.25)",
        "glow-emerald": "0 20px 60px -10px rgba(16, 185, 129, 0.45)",
        "glow-forest": "0 25px 80px -15px rgba(5, 46, 34, 0.65)",
        "card-lift-green": "0 30px 80px -20px rgba(5, 46, 34, 0.25)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blob": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(40px,-30px) scale(1.1)" },
          "66%": { transform: "translate(-30px,30px) scale(0.95)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "marquee-rtl": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(50%)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "blob": "blob 14s ease-in-out infinite",
        "blob-slow": "blob 22s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "marquee-rtl": "marquee-rtl 36s linear infinite",
        "float-y": "float-y 7s ease-in-out infinite",
        "float-y-slow": "float-y 8s ease-in-out 1.2s infinite",
        "float-y-fast": "float-y 6s ease-in-out 0.6s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
