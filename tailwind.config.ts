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
        vayflo: {
          50:  "#f0f4ff",
          100: "#e0eaff",
          200: "#c7d7fe",
          300: "#a5bbfc",
          400: "#8196f8",
          500: "#6272f1",
          600: "#4f56e5",
          700: "#3f43ca",
          800: "#3438a3",
          900: "#2e3382",
          950: "#1c1f4c",
        },
        sidebar: "#0f1117",
      },
    },
  },
  plugins: [],
};

export default config;
