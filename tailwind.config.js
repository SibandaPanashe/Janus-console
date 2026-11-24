export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        janus: {
          bg: "#0b0e14",
          panel: "#12161f",
          line: "#1f2633",
          text: "#e6edf3",
          dim: "#8b949e",
          accent: "#3b82f6",
          ok: "#22c55e",
          warn: "#f59e0b",
          bad: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
