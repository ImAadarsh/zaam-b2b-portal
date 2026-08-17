import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        zaam: {
          green: {
            50: "#ECFDF5",
            100: "#D1FAE5",
            200: "#A7F3D0",
            300: "#6EE7B7",
            400: "#34D399",
            500: "#10B981",
            600: "#0D7844",
            700: "#0A6036",
            800: "#064E2B",
            900: "#022C19",
          },
          gold: {
            50: "#FFFBEB",
            100: "#FEF3C7",
            200: "#FDE68A",
            300: "#FCD34D",
            400: "#FBBF24",
            500: "#D4A017",
            600: "#B88914",
            700: "#8C680E",
            800: "#5F460A",
            900: "#382905",
          },
          dark: {
            950: "#050505",
            900: "#0A0A0A",
            800: "#141414",
            700: "#1E1E1E",
            600: "#2A2A2A",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
        'soft-md': '0 6px 16px -4px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 12px 28px -6px rgba(0, 0, 0, 0.12)',
        'glow-green': '0 0 20px -3px rgba(13, 120, 68, 0.35)',
        'glow-gold': '0 0 20px -3px rgba(212, 160, 23, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-beam': 'scanBeam 2s ease-in-out infinite',
      },
      keyframes: {
        scanBeam: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
