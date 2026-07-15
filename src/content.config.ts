// ============================================================
// CONTENT COLLECTIONS  the data model for The Bournemouth Guide
//
// This file is the *contract* the content automation writes against.
// Every page on the site is generated from a Markdown file whose
// frontmatter must satisfy one of the schemas below. If the AI pipeline
// produces frontmatter that fails validation, `astro build` fails loudly
// instead of shipping a broken page  which is exactly what we want.
//
// Taxonomy mirrors bournemouth.co.uk:
//   • listings  -> flat POI database  (/listing/{slug})   [attractions,
//                  beaches, hotels, restaurants, shops, activities...]
//   • events    -> flat dated records (/event/{slug})
//   • blog      -> editorial listicles (/blog/{slug})
//   • areas     -> town/village guides (/explore/towns|villages/{slug})
//   • itineraries -> persona guides    (/ideas-and-inspiration/itineraries/{slug})
//   • hubs      -> editorial copy for category hub pages
//   • pages     -> generic info/utility pages (about, visitor info...)
// ============================================================

import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ---------- shared enums ----------

// The single location taxonomy reused by every filterable collection.
// Keep this list stable  hub filter UIs depend on it.
const AREAS = [
  'central',
  'west-cliff',
  'east-cliff',
  'boscombe',
  'southbourne',
  'westbourne',
  'poole',
  'christchurch',
  'surrounding-area',
] as const;

// Every point of interest is one of these. Drives the /listing card "kind"
// label, the map pin colour and which hub pages it appears on.
const LISTING_CATEGORIES = [
  'attraction',
  'beach',
  'hotel',
  'bed-and-breakfast',
  'self-catering',
  'holiday-park',
  'restaurant',
  'pub-bar',
  'cafe',
  'shop',
  'activity',
  'venue',
] as const;

const EVENT_CATEGORIES = [
  'family',
  'music',
  'sports',
  'festival',
  'exhibition',
  'food-drink',
  'seasonal',
  'community',
] as const;

const BLOG_CATEGORIES = [
  'things-to-do',
  'food-and-drink',
  'beaches',
  'events',
  'seasonal',
  'family',
  'wellness',
  'walking',
  'guides',
] as const;

// ---------- reusable sub-schemas ----------

const geo = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const address = z.object({
  street: z.string().optional(),
  locality: z.string().default('Bournemouth'),
  region: z.string().default('Dorset'),
  postcode: z.string().optional(),
  country: z.string().default('GB'),
});

const contact = z
  .object({
    website: z.string().url().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  })
  .optional();

const faq = z.object({
  question: z.string(),
  answer: z.string(),
});

// Per-page SEO overrides. When omitted, templates fall back to the page
// title/description. `keywords` is advisory (used for internal grouping,
// not emitted as a meta keywords tag).
const seo = z
  .object({
    title: z.string().max(70).optional(),
    description: z.string().max(200).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
    noindex: z.boolean().default(false),
  })
  .optional();

// A hero/lead image. Path is relative to /public (e.g. "/images/foo.jpg").
// When absent, templates render the branded gradient placeholder.
const image = z
  .object({
    src: z.string(),
    alt: z.string(),
  })
  .optional();

// ============================================================
// listings  the flat POI database
// ============================================================
const listings = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/listings' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(LISTING_CATEGORIES),
    // Free-form finer category, e.g. "Museum & Gallery", "Seafood Restaurant".
    subcategory: z.string().optional(),
    area: z.enum(AREAS),
    tagline: z.string().max(160),
    heroImage: image,
    gallery: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
    // Bulleted "key highlights" block shown near the top of the page.
    highlights: z.array(z.string()).default([]),
    address: address.default({}),
    geo: geo.optional(),
    contact: contact,
    openingTimes: z.string().optional(),
    priceGuide: z.string().optional(),
    amenities: z.array(z.string()).default([]),
    accessible: z.boolean().optional(),
    dogFriendly: z.boolean().optional(),
    familyFriendly: z.boolean().optional(),
    freeEntry: z.boolean().optional(),
    // Beach-specific badges (ignored for other categories).
    blueFlag: z.boolean().optional(),
    seasideAward: z.boolean().optional(),
    awards: z.array(z.string()).default([]),
    faqs: z.array(faq).default([]),
    related: z.array(reference('listings')).default([]),
    seo,
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
  }),
});

// ============================================================
// events  flat, dated records (ephemeral)
// ============================================================
const events = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().max(160),
    category: z.enum(EVENT_CATEGORIES),
    heroImage: image,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    // Human-readable recurring dates, e.g. "Every Friday, 24 Jul – 28 Aug 2026".
    recurringDates: z.array(z.string()).default([]),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    // Link to the venue in the listings DB (relational, like the source site),
    // OR provide a free-text location if the venue has no listing page.
    venue: reference('listings').optional(),
    locationName: z.string().optional(),
    area: z.enum(AREAS).optional(),
    geo: geo.optional(),
    price: z.string().optional(),
    ticketUrl: z.string().url().optional(),
    organizer: z.string().optional(),
    faqs: z.array(faq).default([]),
    seo,
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// ============================================================
// blog  editorial articles / listicles
// ============================================================
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    category: z.enum(BLOG_CATEGORIES),
    heroImage: image,
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('The Bournemouth Guide'),
    tags: z.array(z.string()).default([]),
    // Internal-linking engine: articles point back into the listings DB.
    relatedListings: z.array(reference('listings')).default([]),
    relatedPosts: z.array(reference('blog')).default([]),
    faqs: z.array(faq).default([]),
    seo,
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// ============================================================
// areas  town & village guides
// ============================================================
const areas = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/areas' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['town', 'village', 'neighbourhood']),
    tagline: z.string().max(160),
    heroImage: image,
    gallery: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
    geo: geo.optional(),
    relatedListings: z.array(reference('listings')).default([]),
    faqs: z.array(faq).default([]),
    seo,
    draft: z.boolean().default(false),
    updatedDate: z.coerce.date().optional(),
  }),
});

// ============================================================
// itineraries  persona / scenario guides
// ============================================================
const itineraries = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/itineraries' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().max(160),
    // e.g. "Families", "Couples", "Rainy day", "24 hours", "48 hours".
    persona: z.string(),
    duration: z.string().optional(),
    heroImage: image,
    relatedListings: z.array(reference('listings')).default([]),
    faqs: z.array(faq).default([]),
    seo,
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    updatedDate: z.coerce.date().optional(),
  }),
});

// ============================================================
// hubs  editorial intro copy for the category hub pages.
// The listing grid on each hub is generated dynamically from `listings`;
// this collection only supplies the hero + intro + SEO for the hub.
// `id` (the filename) maps to the hub's URL path, e.g.
//   things-to-do.md            -> /things-to-do
//   food-and-drink_restaurants -> /food-and-drink/restaurants  (use "__")
// ============================================================
const hubs = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/hubs' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().max(200),
    heroImage: image,
    // Which listing category this hub lists (optional  some hubs are editorial only).
    listCategory: z.enum(LISTING_CATEGORIES).optional(),
    faqs: z.array(faq).default([]),
    seo,
    draft: z.boolean().default(false),
  }),
});

// ============================================================
// pages  generic info / utility / editorial pages
// ============================================================
const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().optional(),
    heroImage: image,
    faqs: z.array(faq).default([]),
    seo,
    draft: z.boolean().default(false),
    updatedDate: z.coerce.date().optional(),
  }),
});

export const collections = {
  listings,
  events,
  blog,
  areas,
  itineraries,
  hubs,
  pages,
};
