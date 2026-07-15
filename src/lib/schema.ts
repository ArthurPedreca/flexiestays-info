// ============================================================
// JSON-LD (schema.org) builders.
// Every template feeds structured data through these so search engines
// and AI answer engines (GEO) can parse the site cleanly.
// ============================================================

import { SITE, absoluteUrl } from './site';

type Json = Record<string, unknown>;

export function organization(): Json {
  const org: Json = {
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: SITE.name,
    url: SITE.url,
    logo: { '@type': 'ImageObject', url: absoluteUrl(SITE.logo) },
  };
  // Only emit sameAs when we actually have verified profiles for the guide.
  if (SITE.sameAs.length) org.sameAs = SITE.sameAs;
  return org;
}

export function website(): Json {
  return {
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    description: SITE.description,
    publisher: { '@id': absoluteUrl('/#organization') },
  };
}

export function breadcrumbs(items: { name: string; url: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url),
    })),
  };
}

export function faqPage(faqs: { question: string; answer: string }[]): Json | null {
  if (!faqs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

// Map a listing category to the most specific schema.org type available.
function listingSchemaType(category: string): string {
  switch (category) {
    case 'beach':
      return 'Beach';
    case 'hotel':
    case 'bed-and-breakfast':
    case 'self-catering':
    case 'holiday-park':
      return 'LodgingBusiness';
    case 'restaurant':
    case 'cafe':
      return 'Restaurant';
    case 'pub-bar':
      return 'BarOrPub';
    case 'shop':
      return 'Store';
    default:
      return 'TouristAttraction';
  }
}

interface ListingLike {
  title: string;
  category: string;
  tagline: string;
  address?: { street?: string; locality?: string; region?: string; postcode?: string; country?: string };
  geo?: { lat: number; lng: number };
  contact?: { website?: string; phone?: string; email?: string };
  heroImage?: { src: string; alt: string };
  freeEntry?: boolean;
  awards?: string[];
}

export function listing(data: ListingLike, url: string): Json {
  const node: Json = {
    '@type': listingSchemaType(data.category),
    '@id': absoluteUrl(url) + '#poi',
    name: data.title,
    description: data.tagline,
    url: absoluteUrl(url),
  };
  if (data.heroImage) node.image = absoluteUrl(data.heroImage.src);
  if (data.address) {
    node.address = {
      '@type': 'PostalAddress',
      streetAddress: data.address.street,
      addressLocality: data.address.locality ?? 'Bournemouth',
      addressRegion: data.address.region ?? 'Dorset',
      postalCode: data.address.postcode,
      addressCountry: data.address.country ?? 'GB',
    };
  }
  if (data.geo) node.geo = { '@type': 'GeoCoordinates', latitude: data.geo.lat, longitude: data.geo.lng };
  if (data.contact?.website) node.sameAs = data.contact.website;
  if (data.contact?.phone) node.telephone = data.contact.phone;
  if (data.freeEntry) node.isAccessibleForFree = true;
  if (data.awards?.length) node.award = data.awards;
  return node;
}

interface EventLike {
  title: string;
  tagline: string;
  startDate: Date;
  endDate?: Date;
  locationName?: string;
  geo?: { lat: number; lng: number };
  heroImage?: { src: string; alt: string };
  price?: string;
  ticketUrl?: string;
  organizer?: string;
}

export function event(data: EventLike, url: string): Json {
  const node: Json = {
    '@type': 'Event',
    '@id': absoluteUrl(url) + '#event',
    name: data.title,
    description: data.tagline,
    url: absoluteUrl(url),
    startDate: data.startDate.toISOString(),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
  };
  if (data.endDate) node.endDate = data.endDate.toISOString();
  if (data.heroImage) node.image = absoluteUrl(data.heroImage.src);
  node.location = {
    '@type': 'Place',
    name: data.locationName ?? 'Bournemouth',
    address: { '@type': 'PostalAddress', addressLocality: 'Bournemouth', addressRegion: 'Dorset', addressCountry: 'GB' },
    ...(data.geo ? { geo: { '@type': 'GeoCoordinates', latitude: data.geo.lat, longitude: data.geo.lng } } : {}),
  };
  if (data.organizer) node.organizer = { '@type': 'Organization', name: data.organizer };
  if (data.price || data.ticketUrl) {
    node.offers = {
      '@type': 'Offer',
      ...(data.price ? { price: data.price } : {}),
      priceCurrency: 'GBP',
      ...(data.ticketUrl ? { url: data.ticketUrl } : {}),
      availability: 'https://schema.org/InStock',
    };
  }
  return node;
}

interface ArticleLike {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  author: string;
  heroImage?: { src: string; alt: string };
}

export function blogPosting(data: ArticleLike, url: string): Json {
  const node: Json = {
    '@type': 'BlogPosting',
    '@id': absoluteUrl(url) + '#article',
    headline: data.title,
    description: data.description,
    url: absoluteUrl(url),
    datePublished: data.pubDate.toISOString(),
    dateModified: (data.updatedDate ?? data.pubDate).toISOString(),
    author: { '@type': 'Organization', name: data.author },
    publisher: { '@id': absoluteUrl('/#organization') },
    mainEntityOfPage: absoluteUrl(url),
  };
  if (data.heroImage) node.image = absoluteUrl(data.heroImage.src);
  return node;
}

// Wrap a set of nodes into a single @graph document.
export function graph(...nodes: (Json | null | undefined)[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  });
}
