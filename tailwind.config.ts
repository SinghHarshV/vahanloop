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
          navy: "#0a192f",
          "navy-light": "#1e293b",
          "navy-muted": "#334155",
          emerald: "#10b981",
          "emerald-dark": "#059669",
          "emerald-light": "#34d399",
          "emerald-subtle": "#ecfdf5",
          surface: "#f8fafc",
          border: "#e2e8f0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
