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
          navy: "#1D3A5F",
          teal: "#3BAA9C",
          gray: "#E8EBEE",
          amber: "#F5A550",
          ink: "#2B3748",
          cloud: "#F7F9FB"
        }
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        card: "0 10px 30px rgba(29, 58, 95, 0.08)",
        soft: "0 6px 18px rgba(29, 58, 95, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
