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
        brand: {
          navy: "#10243A",
          "navy-dark": "#0B1928",
          "navy-light": "#183B56",
          "navy-muted": "#38526B",
          emerald: "#15966B",
          "emerald-dark": "#0F7652",
          "emerald-light": "#34D399",
          "emerald-accent": "#DDF5E9",
          "emerald-subtle": "#EDFAF3",
          surface: "#F7F8FA",
          "surface-card": "#FFFFFF",
          border: "#E7EAEE",
          "border-dark": "#D3D8E0",
          text: "#17212B",
          "text-muted": "#667085",
          danger: "#DC4545",
          warning: "#D99A28",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-manrope)", "var(--font-inter)", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        premium: "0 10px 30px -5px rgba(16, 36, 58, 0.08), 0 4px 12px -2px rgba(16, 36, 58, 0.04)",
        floating: "0 20px 40px -8px rgba(16, 36, 58, 0.16), 0 8px 16px -4px rgba(16, 36, 58, 0.08)",
        card: "0 2px 8px -2px rgba(16, 36, 58, 0.05), 0 1px 4px -1px rgba(16, 36, 58, 0.03)",
        "card-hover": "0 16px 32px -4px rgba(16, 36, 58, 0.12), 0 6px 12px -2px rgba(16, 36, 58, 0.06)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
export default config;
