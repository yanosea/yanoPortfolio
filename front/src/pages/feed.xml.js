import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const entries = await getCollection("blog");
  entries.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
  return rss({
    title: "yanosea.org blog",
    description: "blog rss feed of yanosea.org",
    site: context.site,
    items: entries.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.description,
      link: `/blog/${entry.slug}/`,
    })),
  });
}
