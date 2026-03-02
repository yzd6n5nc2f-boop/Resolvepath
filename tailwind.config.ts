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
          navy: "#921E2B",
          teal: "#E14040",
          gray: "#F9C2B2",
          amber: "#F48787",
          ink: "#6B2C35",
          cloud: "#F3F6F9"
        }
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        card: "0 10px 30px rgba(146, 30, 43, 0.10)",
        soft: "0 6px 18px rgba(146, 30, 43, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
