import type { Config } from "tailwindcss";

// Tokens de marca Godoyecom (manual de marca) + tokens de gráficas
// (derivados del sistema de dataviz: superficie, tinta y paleta categórica
// validada para contraste y daltonismo). No se usan como "eyeballed values".
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#b7ef10",
          "green-dark": "#a3d90f",
          "green-deep": "#8ec20d",
          black: "#1a1a1a",
          white: "#feffff",
        },
        surface: {
          DEFAULT: "#fcfcfb",
          page: "#f9f9f7",
          sunken: "#f2f1ed",
        },
        ink: {
          primary: "#0b0b0b",
          secondary: "#52514e",
          muted: "#898781",
          inverted: "#feffff",
        },
        line: {
          grid: "#e1e0d9",
          baseline: "#c3c2b7",
          hairline: "rgba(11,11,11,0.10)",
        },
        status: {
          good: "#0ca30c",
          warning: "#fab219",
          serious: "#ec835a",
          critical: "#d03b3b",
        },
        series: {
          1: "#2a78d6",
          2: "#eb6834",
          3: "#1baf7a",
          4: "#eda100",
          5: "#e87ba4",
          6: "#008300",
          7: "#4a3aa7",
          8: "#e34948",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,11,11,0.06), 0 1px 1px rgba(11,11,11,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
