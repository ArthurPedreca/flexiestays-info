#!/usr/bin/env node
// ---------------------------------------------------------------
// Scaffold a new content Markdown file with valid frontmatter.
//
// Usage:
//   node scripts/new-content.mjs <type> <slug> ["Optional Title"]
//   npm run new:listing -- oceanarium-bournemouth "Oceanarium Bournemouth"
//   npm run new:blog -- best-walks-in-bournemouth
//   npm run new:event -- bournemouth-air-festival
//
// <type> is one of: listing | blog | event | area | itinerary | hub | page
// This is the entry point automation can call to create a page stub,
// then fill the body. Frontmatter matches src/content.config.ts.
// ---------------------------------------------------------------
import { writeFile, mkdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [, , type, slug, ...titleParts] = process.argv;

if (!type || !slug) {
  console.error(
    'Usage: node scripts/new-content.mjs <listing|blog|event|area|itinerary|hub|page> <slug> ["Title"]',
  );
  process.exit(1);
}

const title =
  titleParts.join(" ") ||
  slug.replace(/[-_/]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const today = new Date().toISOString().slice(0, 10);

const templates = {
  listing: {
    dir: "listings",
    fm: `title: "${title}"
category: "attraction"   # attraction|beach|hotel|bed-and-breakfast|self-catering|holiday-park|restaurant|pub-bar|cafe|shop|activity|venue
subcategory: ""
area: "central"          # central|west-cliff|east-cliff|boscombe|southbourne|westbourne|poole|christchurch|surrounding-area
tagline: ""
# heroImage: { src: "/images/....jpg", alt: "" }
highlights: []
geo: { lat: 50.7192, lng: -1.8808 }
address: { postcode: "" }
# contact: { website: "", phone: "" }
amenities: []
faqs: []
related: []
featured: false
draft: true
pubDate: ${today}`,
  },
  blog: {
    dir: "blog",
    fm: `title: "${title}"
description: ""
category: "guides"       # things-to-do|food-and-drink|beaches|events|seasonal|family|wellness|walking|guides
# heroImage: { src: "/images/....jpg", alt: "" }
pubDate: ${today}
author: "The Bournemouth Guide"
tags: []
relatedListings: []
faqs: []
draft: true`,
  },
  event: {
    dir: "events",
    fm: `title: "${title}"
tagline: ""
category: "festival"     # family|music|sports|festival|exhibition|food-drink|seasonal|community
# heroImage: { src: "/images/....jpg", alt: "" }
startDate: ${today}
# endDate: ${today}
# venue: "some-listing-slug"
area: "central"
price: ""
faqs: []
draft: true`,
  },
  area: {
    dir: "areas",
    fm: `title: "${title}"
type: "village"          # town|village|neighbourhood
tagline: ""
# heroImage: { src: "/images/....jpg", alt: "" }
geo: { lat: 50.7192, lng: -1.8808 }
relatedListings: []
faqs: []
draft: true`,
  },
  itinerary: {
    dir: "itineraries",
    fm: `title: "${title}"
tagline: ""
persona: ""
duration: ""
# heroImage: { src: "/images/....jpg", alt: "" }
relatedListings: []
faqs: []
draft: true`,
  },
  hub: {
    dir: "hubs",
    fm: `title: "${title}"
tagline: ""
# heroImage: { src: "/images/....jpg", alt: "" }
faqs: []
draft: true`,
  },
  page: {
    dir: "pages",
    fm: `title: "${title}"
tagline: ""
faqs: []
draft: true`,
  },
};

const tpl = templates[type];
if (!tpl) {
  console.error(
    `Unknown type "${type}". Use: ${Object.keys(templates).join(" | ")}`,
  );
  process.exit(1);
}

const path = join(ROOT, "src", "content", tpl.dir, `${slug}.md`);

try {
  await access(path);
  console.error(`Refusing to overwrite existing file: ${path}`);
  process.exit(1);
} catch {
  // does not exist  good
}

await mkdir(dirname(path), { recursive: true });
await writeFile(
  path,
  `---\n${tpl.fm}\n---\n\nWrite the page body here in Markdown.\n`,
  "utf8",
);
console.log(`Created ${path}`);
console.log("Set draft: false when ready to publish.");
