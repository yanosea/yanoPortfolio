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
        "main": "#5c6a72",
        "main-dark": "#d3c6aa",
        "sub": "#7fbbb3",
        "sub-dark": "#7fbbb3",
        "sub-darker": "#83c092",
        "sub-darker-dark": "#83c092",
        "background": "#fdf6e3",
        "background-dark": "#2d353b",
        "red": "#e67e80",
        "orange": "#e69875",
        "green": "#a7c080",
        "yellow": "#dfa000",
        "yellow-lighter": "#dbbc7f",
        "purple": "#df69ba",
        "purple-lighter": "#d699b6",
        "blue": "#83c092",
        "gray": "#bec5b2",
        "gray-dark": "#4f5b58",
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
