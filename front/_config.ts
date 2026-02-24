/**
 * Lume configuration file
 */
// utils
import { extractToc, extractTocFilter, generateSlug } from "@/utils/toc.ts";
// plugins
import codeHighlight from "lume/plugins/code_highlight.ts";
import date from "lume/plugins/date.ts";
import esbuild from "lume/plugins/esbuild.ts";
import favicon from "lume/plugins/favicon.ts";
import feed from "lume/plugins/feed.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import icons from "lume/plugins/icons.ts";
import inline from "lume/plugins/inline.ts";
import jsx from "lume/plugins/jsx.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import lume from "lume/mod.ts";
import mdx from "lume/plugins/mdx.ts";
import metas from "lume/plugins/metas.ts";
import minifyHTML from "lume/plugins/minify_html.ts";
import paginate from "lume/plugins/paginate.ts";
import picture from "lume/plugins/picture.ts";
import postcss from "lume/plugins/postcss.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import robots from "lume/plugins/robots.ts";
import sitemap from "lume/plugins/sitemap.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import transformImages from "lume/plugins/transform_images.ts";

// create site
const site = lume({ src: "./src", location: new URL("https://yanosea.org") });
site.helper("extractToc", extractTocFilter, { type: "filter" });
// extract TOC from MDX files
site.preprocess([".mdx"], async (pages) => {
  for (const page of pages) {
    try {
      const path = `${site.options.src}${page.src.path}${page.src.ext}`;
      const toc = extractToc(await Deno.readTextFile(path));
      if (toc.length > 0) page.data.toc = toc;
    } catch (e) {
      console.error(`TOC error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
});
// site-wide HTML modifications
site.process([".html"], (pages) => {
  for (const page of pages) {
    if (!page.document) {
      continue;
    }
    // add IDs to headings in main content
    page.document.querySelectorAll(
      "main h1, main h2, main h3, main h4, main h5, main h6",
    )
      .forEach((h) => h.setAttribute("id", generateSlug(h.textContent || "")));
    // set external links to open in a new tab
    page.document.querySelectorAll('a[href^="http"]').forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
    // strip trailing slashes from internal links
    page.document.querySelectorAll('a[href^="/"]').forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href !== "/" && href.endsWith("/")) {
        link.setAttribute("href", href.replace(/\/+$/, ""));
      }
    });
  }
});
// plugin config
site.use(icons());
site.use(inline());
site.use(jsx());
site.use(mdx());
site.use(readingInfo({ extensions: [".md", ".mdx"] }));
site.use(date());
site.use(
  codeHighlight({
    theme: {
      name: "night-owl",
      cssFile: "/assets/styles/main.css",
      placeholder: "/* insert-code-theme */",
    },
  }),
);
// esbuild must be used before tailwindcss per lume/plugin-order rule
site.use(esbuild({ options: { format: "iife" } }));
site.use(tailwindcss());
site.use(postcss());
site.use(lightningCss());
site.use(
  googleFonts({
    fonts:
      "https://fonts.google.com/share?selection.family=M+PLUS+1+Code:wght@400;700",
    cssFile: "/assets/styles/main.css",
    placeholder: "/* google-fonts */",
  }),
);
site.use(picture());
site.use(transformImages());
site.use(favicon({ input: "/assets/icons/favicon.svg" }));
site.use(paginate());
site.use(minifyHTML());
site.use(metas());
site.use(sitemap());
site.use(robots());
site.use(feed({
  output: ["/feed.xml"],
  query: "type=blog !url^=/blog/tag/",
  sort: "date=desc",
  info: { title: "=site.title", description: "=site.description" },
  items: { title: "=title", description: "=description", published: "=date" },
}));
site.add("assets");

export default site;
