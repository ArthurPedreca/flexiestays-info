# Content model authoring & automation contract

Every page on The Bournemouth Guide is generated from a **Markdown file** in
`src/content/<collection>/`. The file's **frontmatter** (the `---` block at the
top) must satisfy the Zod schema in `src/content.config.ts`. If it doesn't,
`astro build` fails with a clear message so the automation can't ship a broken
page.

This document is the human-readable version of that contract. Give it to the
content-generation pipeline.

> **The golden rules for the automation**
>
> 1. One Markdown file = one page. The **filename (without `.md`) is the URL slug**.
> 2. Reword source material never copy text verbatim from bournemouth.co.uk.
> 3. Only set `heroImage`/`gallery` to images that **exist in `public/images/`**.
>    If you have no image, **omit the field** the design shows a branded
>    placeholder, which looks intentional.
> 4. `area` and every `category` must be one of the exact enum values below.
> 5. Cross-references (`related`, `relatedListings`, `venue`) use the **slug**
>    (filename) of the target entry.

---

## Shared enums

**`area`** (location taxonomy used by listings, events):
`central` · `west-cliff` · `east-cliff` · `boscombe` · `southbourne` ·
`westbourne` · `poole` · `christchurch` · `surrounding-area`

**listing `category`:**
`attraction` · `beach` · `hotel` · `bed-and-breakfast` · `self-catering` ·
`holiday-park` · `restaurant` · `pub-bar` · `cafe` · `shop` · `activity` · `venue`

**event `category`:**
`family` · `music` · `sports` · `festival` · `exhibition` · `food-drink` ·
`seasonal` · `community`

**blog `category`:**
`things-to-do` · `food-and-drink` · `beaches` · `events` · `seasonal` ·
`family` · `wellness` · `walking` · `guides`

---

## 1. `listings/` → `/listing/{slug}` (POIs)

The flat database of every point of interest: attractions, beaches, hotels,
restaurants, pubs, cafés, shops, activities, venues.

```yaml
---
title: "Oceanarium Bournemouth"
category: "attraction" # required  enum above
subcategory: "Aquarium" # optional free text (shown as the card "kind")
area: "central" # required  enum above
tagline: "Seafront aquarium with Poole Bay, Amazon and Great Barrier Reef habitats." # required, <=160 chars
heroImage: # optional  omit if no real image
  src: "/images/oceanarium.jpg"
  alt: "The Oceanarium on Bournemouth seafront"
gallery: # optional
  - { src: "/images/oceanarium-1.jpg", alt: "Shark tank" }
highlights: # optional bulleted list near the top
  - "Over 250 species across themed zones"
  - "Under-fives go free"
address: # optional
  street: "Pier Approach"
  postcode: "BH2 5AA"
geo: { lat: 50.7147, lng: -1.8756 } # optional but recommended  adds a map + geo schema
contact: # optional
  website: "https://example.com"
  phone: "+44 1202 000000"
openingTimes: "Daily 10am–5pm (last entry 4pm)" # optional free text
priceGuide: "From £12.95" # optional free text
amenities: ["Café", "Gift shop", "Accessible"] # optional pills
accessible: true # optional booleans
dogFriendly: false
familyFriendly: true
freeEntry: false
blueFlag: true # beaches only
seasideAward: true # beaches only
awards: ["Blue Flag 2026"] # optional
faqs: # optional  rendered + emitted as FAQ schema
  - { question: "Is it accessible?", answer: "Yes, step-free throughout." }
related: ["bournemouth-pier", "lower-gardens"] # optional  other listing slugs
featured: false
draft: false
---
Body in Markdown. First paragraph is styled as a lead. Use `##` / `###`
headings, lists and links. Link internally to other pages, e.g.
[Bournemouth Pier](/listing/bournemouth-pier).
```

## 2. `events/` → `/event/{slug}` (dated)

```yaml
---
title: "Bournemouth Air Festival"
tagline: "Four days of free seafront air displays over Poole Bay."
category: "festival" # enum above
heroImage: { src: "/images/air-festival.jpg", alt: "Red Arrows over the bay" } # optional
startDate: 2026-08-27 # required (YYYY-MM-DD)
endDate: 2026-08-30 # optional
startTime: "10:00" # optional
endTime: "17:00" # optional
recurringDates: # optional human-readable list
  - "Thu 27 Aug – Sun 30 Aug 2026"
venue: "bournemouth-beach" # optional  slug of a listing (relational)
locationName: "Bournemouth Seafront" # optional  use if there is no venue listing
area: "central" # optional
geo: { lat: 50.715, lng: -1.874 } # optional (falls back to the venue's geo)
price: "Free" # optional
ticketUrl: "https://example.com" # optional
organizer: "BCP Council" # optional
faqs: [] # optional
featured: true
draft: false
---
Body in Markdown.
```

> Events are **ephemeral**. The automation should mark past events `draft: true`
> (or delete them). The durable, indexable assets are `/whats-on` and the hubs.

## 3. `blog/` → `/blog/{slug}` (articles)

```yaml
---
title: "The Best Beaches in Bournemouth"
description: "A local's guide to all seven miles of sand, beach by beach." # required, <=200
category: "beaches" # enum above
heroImage: { src: "/images/beaches.jpg", alt: "Bournemouth beach" } # optional
pubDate: 2026-06-30 # required
updatedDate: 2026-07-01 # optional
author: "The Bournemouth Guide" # optional (defaults to the guide)
tags: ["beaches", "family", "summer"] # optional
relatedListings: ["bournemouth-beach", "boscombe-beach"] # optional  internal linking!
relatedPosts: ["bournemouth-with-kids"] # optional
faqs: []
featured: false
draft: false
---
Body  ideally a listicle with `##` per item, each linking to a `/listing/`.
```

## 4. `areas/` → `/explore/towns/{slug}` or `/explore/villages/{slug}`

```yaml
---
title: "Boscombe"
type: "village" # "town" | "village" | "neighbourhood"
tagline: "Bournemouth's creative quarter  surf, street art and independents."
heroImage: { src: "/images/boscombe.jpg", alt: "Boscombe pier" } # optional
gallery: []
geo: { lat: 50.725, lng: -1.842 }
relatedListings: ["boscombe-beach", "urban-reef-boscombe"] # optional
faqs: []
draft: false
---
Body in Markdown.
```

## 5. `itineraries/` → `/ideas-and-inspiration/itineraries/{slug}`

```yaml
---
title: "48 Hours in Bournemouth"
tagline: "The perfect weekend: beach, pier, gardens, food and a coastal walk."
persona: "Weekend break" # e.g. Families, Couples, Rainy day, 24 hours
duration: "2 days" # optional
heroImage: { src: "/images/seafront.jpg", alt: "Bournemouth seafront" } # optional
relatedListings: ["bournemouth-pier", "lower-gardens", "west-beach-restaurant"]
faqs: []
featured: false
draft: false
---
Body  e.g. "## Day 1: Morning" sections.
```

## 6. `hubs/` → category hub pages (editorial intro only)

The listing grid on a hub is generated automatically from `listings`; the hub
file only supplies the hero + intro + SEO. **Filename maps to the hub route**,
using `__` for a `/` in the path:

| File                             | Route                         |
| -------------------------------- | ----------------------------- |
| `things-to-do.md`                | `/things-to-do`               |
| `things-to-do__attractions.md`   | `/things-to-do/attractions`   |
| `things-to-do__beaches.md`       | `/things-to-do/beaches`       |
| `food-and-drink.md`              | `/food-and-drink`             |
| `food-and-drink__restaurants.md` | `/food-and-drink/restaurants` |
| `accommodation.md`               | `/accommodation`              |
| `accommodation__hotels.md`       | `/accommodation/hotels`       |

```yaml
---
title: "Things to Do in Bournemouth"
tagline: "Attractions, activities, gardens and days out along the Dorset coast."
heroImage: { src: "/images/seafront.jpg", alt: "Bournemouth seafront" } # optional
faqs: []
draft: false
---
Editorial intro in Markdown (2–4 short paragraphs). The listing cards render below.
```

## 7. `pages/` → generic editorial / info pages (catch-all)

The file path under `src/content/pages/` **mirrors the URL**:

| File                             | Route                          |
| -------------------------------- | ------------------------------ |
| `about.md`                       | `/about`                       |
| `contact.md`                     | `/contact`                     |
| `visitor-information.md`         | `/visitor-information`         |
| `visitor-information/weather.md` | `/visitor-information/weather` |
| `explore/summer.md`              | `/explore/summer`              |

```yaml
---
title: "About The Bournemouth Guide"
tagline: "Who we are and how this guide is made." # optional
heroImage: { src: "/images/aerial.jpg", alt: "Bournemouth from the air" } # optional
faqs: []
draft: false
---
Body in Markdown.
```

---

## Available images (`public/images/`)

Only these exist today. Use them where they fit; otherwise omit `heroImage`.

- `/images/bournemouth-pier-and-beach.jpg`
- `/images/bournemouth-pier-beach-aerial.jpg`
- `/images/bournemouth-town-seafront-aerial.jpg`
- `/images/hengistbury-head-dorset-bournemouth.jpg`
- `/images/durdle-door-dorset-bournemouth.jpg`
- `/images/sandbanks-poole-dorset-bournemouth.jpg`
- `/images/tower-house-apartments-hotel-bournemouth.jpg`
- `/images/cliff-heights-apartments-hotel-bournemouth.jpg`
- `/images/cliff-manor-apartments-hotel-bournemouth.jpg`
- `/images/coast-apartments-hotel-bournemouth.jpg`
- `/images/seabreeze-apartments-hotel-bournemouth.jpg`
- `/images/shore-retreat-apartments-hotel-bournemouth.jpg`
- `/images/pebbles-apartments-hotel-bournemouth.jpg`
