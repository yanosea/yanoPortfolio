import { defineConfig } from "astro/config";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "static",
  trailingSlash: "never",
  build: {
    format: "file"
  },
  integrations: [
    icon(),
    mdx(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    (await import("@playform/compress")).default({
      Exclude: [".*hoisted.*"],
    }),
    sitemap(),
    tailwind(),
  ],
  site: "https://yanosea.org",
  image: {
    remotePatterns: [
      {
        protocol: "https",
      },
    ],
  },
});
