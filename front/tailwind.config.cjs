/** @type {import("tailwindcss").Config} */
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
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: theme("colors.main"),
            "h1, h2, h3, h4, h5, h6, strong": {
              color: theme("colors.main"),
            },
            a: {
              color: theme("colors.main"),
              "&:hover": {
                color: theme("colors.blue.600"),
                "transition-duration": "150ms",
              },
            },
            code: {
              color: theme("colors.sub"),
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
          },
        },
      }),
    }
  },
  plugins: [
    require("@tailwindcss/typography"),
  ]
};
