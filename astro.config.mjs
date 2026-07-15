// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The public production URL of the guide. Used for canonical URLs,
// Open Graph tags, JSON-LD @id/url fields and the generated sitemap.
export const SITE = 'https://www.thebournemouthguide.com';

// Hosts that belong to the booking partner (Flexiestays). Links to these get
// rel="sponsored" — a commercial relationship, so we pass referral traffic
// but NOT PageRank (this is what keeps the guide clear of link-scheme risk).
const BOOKING_HOSTS = ['flexiestays.com', 'www.flexiestays.com'];

// Rehype plugin: enforce safe rel/target on links written inside Markdown
// bodies (manual OR AI-generated). Runs on the rendered HTML AST so authors
// and the automation can write plain `[text](url)` and never think about rel.
//   • link to Flexiestays  -> rel="sponsored noopener", opens in new tab
//   • any other external    -> rel="nofollow noopener", opens in new tab
//   • internal/relative link -> left untouched (internal-linking SEO intact)
// No external dependency: walks the hast tree directly.
function rehypeSafeOutboundLinks() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a' && node.properties && node.properties.href) {
        const href = String(node.properties.href);
        if (/^https?:\/\//i.test(href)) {
          let host = '';
          try {
            host = new URL(href).host.toLowerCase();
          } catch {
            host = '';
          }
          const isBooking = BOOKING_HOSTS.includes(host);
          node.properties.target = '_blank';
          node.properties.rel = isBooking ? 'sponsored noopener' : 'nofollow noopener';
        }
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  markdown: {
    rehypePlugins: [rehypeSafeOutboundLinks],
  },
  build: {
    // Emit /things-to-do/index.html instead of /things-to-do.html so the
    // site works on any static host with clean, directory-style URLs.
    format: 'directory',
  },
  integrations: [
    sitemap({
      // Editorial hubs and evergreen pages change more often than deep leaf
      // pages; give crawlers a sensible default cadence.
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
