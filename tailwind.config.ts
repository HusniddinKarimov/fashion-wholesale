const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#fcfc90",
        ink: "#7d7dff",
        gold: "#c9a84c",
        "gold-light": "#e8d49a",
        cta: "#2d4a7a",
        "cta-dark": "#1e3459",
        border: "#e5e3df",
        muted: "#6b7280",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(26, 26, 46, 0.06), 0 1px 3px rgba(26, 26, 46, 0.04)",
        "card-hover": "0 8px 24px rgba(26, 26, 46, 0.12), 0 2px 8px rgba(26, 26, 46, 0.06)",
        modal: "0 20px 60px rgba(26, 26, 46, 0.20)",
      },
    },
  },
  plugins: [],
};
export default config;
