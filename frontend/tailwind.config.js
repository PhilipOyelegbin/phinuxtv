/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050816",
          900: "#0b1220",
          800: "#121a2a",
        },
        ember: {
          400: "#ff8a5b",
          500: "#ff6b3d",
        },
        mint: {
          300: "#8ef0cf",
          400: "#57dfba",
        },
      },
      boxShadow: {
        glow: "0 0 50px rgba(87, 223, 186, 0.18)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(87,223,186,0.18), transparent 28%), radial-gradient(circle at top right, rgba(255,107,61,0.14), transparent 25%), linear-gradient(180deg, rgba(5,8,22,0.98), rgba(11,18,32,0.96))",
      },
    },
  },
  plugins: [],
};
