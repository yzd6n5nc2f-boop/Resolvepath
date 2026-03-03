import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          background: "#F5F7FA",
          surface: "#FFFFFF",
          surface2: "#F1F4F8",
          border: "#D7DDE5",
          text: "#111111",
          muted: "#596275",
          primary: "#E14040",
          primarySoft: "#FDE9E9",
          success: "#1F7A4D",
          warning: "#AD6B17",
          danger: "#C53F3F",
          info: "#44638F"
        }
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        card: "0 14px 30px rgba(17, 24, 39, 0.08)",
        soft: "0 6px 16px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
