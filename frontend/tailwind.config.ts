import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        mist: "#eef7f6",
        water: "#1c8d9e",
        leaf: "#2f8f5b",
        coral: "#d96f4a"
      }
    }
  },
  plugins: []
};

export default config;
