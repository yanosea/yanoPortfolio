/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        default: ["MaruMonica", "sans-serif"],
        PlemolJP: ["PlemolJP", "sans-serif"]
      },
      colors: {
        "main": "#3B4252",
        "main-dark": "#D8DEE9",
        "sub": "#81A1C1",
        "sub-dark": "#81A1C1",
        "sub-darker": "#5E81AC",
        "sub-darker-dark": "#5E81AC",
        "background": "#D8DEE9",
        "background-dark": "#3B4252",
        "red": "#BF616A",
        "orange": "#D08770",
        "green": "#A3BE8C",
        "yellow": "#EBCB8B",
        "yellow-lighter": "#FFE79D",
        "purple": "#B48EAD",
        "purple-lighter": "#C69ABE",
        "blue": "#5E81AC",
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
                color: theme("colors.blue"),
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
        dark: {
          css: {
            maxWidth: "100%",
            color: theme("colors.main-dark"),
            "h1, h2, h3, h4, h5, h6, strong": {
              color: theme("colors.main-dark"),
            },
            a: {
              color: theme("colors.main-dark"),
              "&:hover": {
                color: theme("colors.blue"),
                "transition-duration": "150ms",
              },
            },
            code: {
              color: theme("colors.sub-dark"),
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
