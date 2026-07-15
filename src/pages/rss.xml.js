import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "../lib/site";

export async function GET(context) {
  const posts = (await getCollection("blog", (e) => !e.data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
  return rss({
    title: `${SITE.name}  The Guide`,
    description:
      "Local guides, listicles and seasonal inspiration for Bournemouth, Dorset.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-gb</language>`,
  });
}
