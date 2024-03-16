import { defineConfig } from "astro/config";
import compress from "astro-compress";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

const FRONT_ASTRONODE_PORT = parseInt(process.env.FRONT_ASTRONODE_PORT , 10) || 4321;

export default defineConfig({
  integrations: [compress(), icon(), mdx(), sitemap(), tailwind()],
  site: "https://yanosea.org",
  server: { port:FRONT_ASTRONODE_PORT , host: true },
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  image: {
    remotePatterns: [{
      protocol: "https"
    }]
  }
});
