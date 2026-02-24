export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#272756",
          // 500: "#000073",
          100: "#2539F21F",
          50: "#253af20d",
        },
        error: {
          500: "#D92D20",
          100: "#FFEFEF",
        },
        sec: {
          500: "#24282E",
          400: "#1C1C1E",
          300: "#727A90",
          100: "#1F2A40",
        },
      },
      fontWeight: {
        normal: 400,
        semibold: 500,
        bold: 600,
      },
    },
  },
  plugins: [],
};
