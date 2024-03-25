import { defineConfig } from "astro/config";
import compress from "astro-compress";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

const FRONT_PORT = parseInt(process.env.FRONT_PORT , 10) || 4321;

export default defineConfig({
  integrations: [compress(), icon(), mdx(), sitemap(), tailwind()],
  site: "https://yanosea.org",
  server: { port:FRONT_PORT , host: true },
  image: {
    remotePatterns: [{
      protocol: "https"
    }]
  }
});
