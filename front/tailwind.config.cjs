/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        default: ["DotGothic16", "sans-serif"],
        normal: ["Zen Kaku Gothic New", "sans-serif"]
      },
      colors: {
        "main": "#3B4252",
        "main-dark": "#E5E9F0",
        "sub": "#81A1C1",
        "sub-dark": "#81A1C1",
        "sub-darker": "#5E81AC",
        "sub-darker-dark": "#5E81AC",
        "background": "#E5E9F0",
        "background-dark": "#3B4252",
        "red": "#BF616A",
        "orange": "#D08770",
        "green": "#A3BE8C",
        "yellow": "#EBCB8B",
        "yellow-lighter": "#FFE79D",
        "purple": "#B48EAD",
        "purple-lighter": "#C69ABE",
        "blue": "#5E81AC",
        "gray": "#D8DEE9",
        "gray-dark": "#4C566A",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            fontSize: '14px',
            maxWidth: "100%",
            color: theme("colors.main"),
            "h1, h2, h3, h4, h5, h6": {
              color: theme("colors.main"),
              marginTop: "-90px",
              paddingTop: "90px",
            },
            strong: {
              color: theme("colors.main"),
            },
            a: {
              color: theme("colors.main"),
              "&:hover": {
                color: theme("colors.blue"),
                "transition-duration": "150ms",
              },
            },
            "ll > li::marker": {
              color: theme("colors.main"),
            },
            "ul > li::marker": {
              color: theme("colors.main"),
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
            fontSize: '14px',
            maxWidth: "100%",
            color: theme("colors.main-dark"),
            "h1, h2, h3, h4, h5, h6": {
              color: theme("colors.main-dark"),
              marginTop: "-90px",
              paddingTop: "90px",
            },
            strong: {
              color: theme("colors.main-dark"),
            },
            a: {
              color: theme("colors.main-dark"),
              "&:hover": {
                color: theme("colors.blue"),
                "transition-duration": "150ms",
              },
            },
            "ol > li::marker": {
              color: theme("colors.main-dark"),
            },
            "ul > li::marker": {
              color: theme("colors.main-dark"),
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
