// ============================================================
// Central site configuration + helpers.
// Single source of truth for nav, footer, human-readable labels
// and URL builders. Templates and JSON-LD read from here.
// ============================================================

// Keep in sync with `site` in astro.config.mjs.
export const SITE_URL = 'https://www.thebournemouthguide.com';

// Every "Book Now" / "Book this property" booking CTA in the guide points here.
export const BOOKING_URL = 'https://flexiestays.com';

// Listing categories that represent bookable places to stay.
export const ACCOMMODATION_CATEGORIES = ['hotel', 'bed-and-breakfast', 'self-catering', 'holiday-park'];
export const isAccommodation = (category: string) => ACCOMMODATION_CATEGORIES.includes(category);

export const SITE = {
  name: 'The Bournemouth Guide',
  shortName: 'Bournemouth Guide',
  tagline: 'Beaches, attractions, food & events in Bournemouth, Dorset',
  description:
    'The complete guide to Bournemouth, Dorset: interactive map, seven miles of sandy beaches, top attractions, the best restaurants, events and places to stay  written with local knowledge.',
  locale: 'en_GB',
  lang: 'en-GB',
  url: SITE_URL,
  ogImage: '/images/bournemouth-pier-beach-aerial.jpg',
  logo: '/images/bournemouth-pier-and-beach.jpg',
  // Organization.sameAs = THIS guide's own verified profiles (its Facebook,
  // Instagram, X, etc.). Never list reference sites (bournemouth.co.uk) or the
  // booking partner (flexiestays) here — they are different entities and doing
  // so sends a false "same organization" signal to search engines. Fill in once
  // the guide's own social accounts exist.
  sameAs: [] as string[],
  geo: { lat: 50.7192, lng: -1.8808 },
} as const;

// Primary navigation (mirrors bournemouth.co.uk's top-level sections).
export const NAV = [
  { label: 'Things to Do', href: '/things-to-do' },
  { label: "What's On", href: '/whats-on' },
  { label: 'Food & Drink', href: '/food-and-drink' },
  { label: 'Where to Stay', href: '/accommodation' },
  { label: 'Explore', href: '/explore' },
  { label: 'Guide', href: '/blog' },
] as const;

export const FOOTER = [
  {
    heading: 'Explore',
    links: [
      { label: 'Things to Do', href: '/things-to-do' },
      { label: 'Beaches', href: '/things-to-do/beaches' },
      { label: 'Attractions', href: '/things-to-do/attractions' },
      { label: 'Areas & Towns', href: '/explore' },
      { label: 'Interactive Map', href: '/#map-section' },
    ],
  },
  {
    heading: 'Plan',
    links: [
      { label: 'Where to Stay', href: '/accommodation' },
      { label: 'Food & Drink', href: '/food-and-drink' },
      { label: "What's On", href: '/whats-on' },
      { label: 'Visitor Information', href: '/visitor-information' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'About This Guide', href: '/about' },
      { label: 'The Guide (Blog)', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'Image Credits', href: '/image-credits' },
    ],
  },
] as const;

// ---------- human-readable labels ----------

export const AREA_LABELS: Record<string, string> = {
  central: 'Town Centre',
  'west-cliff': 'West Cliff',
  'east-cliff': 'East Cliff',
  boscombe: 'Boscombe',
  southbourne: 'Southbourne',
  westbourne: 'Westbourne',
  poole: 'Poole',
  christchurch: 'Christchurch',
  'surrounding-area': 'Surrounding Area',
};

export const CATEGORY_LABELS: Record<string, string> = {
  attraction: 'Attraction',
  beach: 'Beach',
  hotel: 'Hotel',
  'bed-and-breakfast': 'B&B',
  'self-catering': 'Self-Catering',
  'holiday-park': 'Holiday Park',
  restaurant: 'Restaurant',
  'pub-bar': 'Pub & Bar',
  cafe: 'Café',
  shop: 'Shop',
  activity: 'Activity',
  venue: 'Venue',
};

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  family: 'Family',
  music: 'Music',
  sports: 'Sport',
  festival: 'Festival',
  exhibition: 'Exhibition',
  'food-drink': 'Food & Drink',
  seasonal: 'Seasonal',
  community: 'Community',
};

export const BLOG_CATEGORY_LABELS: Record<string, string> = {
  'things-to-do': 'Things to Do',
  'food-and-drink': 'Food & Drink',
  beaches: 'Beaches',
  events: 'Events',
  seasonal: 'Seasonal',
  family: 'Family',
  wellness: 'Wellness',
  walking: 'Walking',
  guides: 'Guides',
};

// Which map-pin colour class a listing category uses.
export function pinType(category: string): 'beach' | 'attraction' | 'food' | 'stay' | 'area' {
  if (category === 'beach') return 'beach';
  if (['restaurant', 'pub-bar', 'cafe'].includes(category)) return 'food';
  if (['hotel', 'bed-and-breakfast', 'self-catering', 'holiday-park'].includes(category)) return 'stay';
  if (['attraction', 'activity', 'venue', 'shop'].includes(category)) return 'attraction';
  return 'area';
}

// ---------- URL builders ----------
// `id` is the content-collection entry id (the slug from the filename).

export const listingUrl = (id: string) => `/listing/${id}`;
export const eventUrl = (id: string) => `/event/${id}`;
export const blogUrl = (id: string) => `/blog/${id}`;
export const itineraryUrl = (id: string) => `/ideas-and-inspiration/itineraries/${id}`;
export const areaUrl = (type: string, id: string) =>
  type === 'town' ? `/explore/towns/${id}` : `/explore/villages/${id}`;

// Turn a site-relative path into an absolute URL for canonical/OG/JSON-LD.
export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return new URL(path, SITE_URL).href;
}
