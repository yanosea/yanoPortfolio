/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        default: ["MaruMonica", "sans-serif"]
      },
      colors: {
        main: "#D8DEE9",
        sub: "#81A1C1",
        sub_darker: "#5E81AC",
        background: "#2E3440",
      }
    }
  },
  plugins: []
};
