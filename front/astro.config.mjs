import { defineConfig } from "astro/config";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

const FRONT_PORT = parseInt(process.env.FRONT_PORT , 10) || 4321;

export default defineConfig({
  integrations: [
    icon(),
    mdx(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    (await import("@playform/compress")).default({
      Exclude: [
        ".*hoisted.*"
      ],
    }),
    sitemap(),
    tailwind(),
  ],
  site: "https://yanosea.org",
  server: { port:FRONT_PORT , host: true },
  image: {
    remotePatterns: [{
      protocol: "https"
    }]
  }
});
