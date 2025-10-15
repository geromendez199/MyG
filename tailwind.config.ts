const config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Permite usar bg-primary, text-primary, etc. con opacidad: bg-primary/90
        primary: "rgb(var(--primary) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
export default config;
