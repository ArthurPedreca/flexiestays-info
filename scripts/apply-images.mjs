// One-off: point each content file's heroImage at the correct, verified
// Wikimedia photo (in /public/images/wiki), and generate an image-credits page
// from CREDITS.json (CC licences require attribution).
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const C = join(ROOT, 'src', 'content');
const W = '/images/wiki';

// file (relative to src/content) -> { src, alt }.  Files not listed keep their
// current image (already correct: hengistbury, bournemouth-beach aerial, poole
// sandbanks, 48-hours aerial, and several hubs).
const MAP = {
  // Attractions
  'listings/bournemouth-pier.md': { src: `${W}/bournemouth-pier.jpg`, alt: 'Bournemouth Pier and the Pier Theatre seen from the beach' },
  'listings/boscombe-pier.md': { src: `${W}/boscombe-pier.jpg`, alt: 'Boscombe Pier stretching into Poole Bay' },
  'listings/oceanarium-bournemouth.md': { src: `${W}/oceanarium.jpg`, alt: 'Inside the Oceanarium aquarium in Bournemouth' },
  'listings/russell-cotes-museum.md': { src: `${W}/russell-cotes.jpg`, alt: 'The ornate decorated ceiling inside the Russell-Cotes museum' },
  'listings/lower-gardens.md': { src: `${W}/lower-gardens.jpg`, alt: 'The Lower Gardens promenade in Bournemouth on a summer day' },
  // Beaches
  'listings/alum-chine-beach.md': { src: `${W}/alum-chine.jpg`, alt: 'Alum Chine Beach and Poole Bay on a sunny day' },
  'listings/durley-chine-beach.md': { src: `${W}/durley-chine.jpg`, alt: 'Durley Chine seafront and promenade' },
  'listings/boscombe-beach.md': { src: `${W}/boscombe-beach.jpg`, alt: 'Boscombe Beach and promenade at sunset' },
  'listings/southbourne-beach.md': { src: `${W}/southbourne-beach.jpg`, alt: 'The flower-covered clifftop above Southbourne beach' },
  // Food & drink
  'listings/west-beach-restaurant.md': { src: `${W}/durley-chine.jpg`, alt: 'Seafront dining on the Bournemouth promenade' },
  'listings/urban-reef-boscombe.md': { src: `${W}/boscombe-beach.jpg`, alt: 'Boscombe seafront at dusk' },
  'listings/koh-thai-tapas.md': { src: `${W}/westbourne.jpg`, alt: "Westbourne's Victorian shopping arcade" },
  'listings/chines-coffee-house.md': { src: `${W}/bournemouth-square.jpg`, alt: 'Bournemouth town centre' },
  'listings/the-goat-and-tricycle.md': { src: `${W}/bournemouth-square.jpg`, alt: 'Bournemouth town centre near the pub' },
  // Areas
  'areas/boscombe.md': { src: `${W}/boscombe-pier.jpg`, alt: 'Boscombe Pier and seafront' },
  'areas/christchurch.md': { src: `${W}/christchurch-priory.jpg`, alt: 'Christchurch Priory in the medieval town of Christchurch' },
  'areas/southbourne.md': { src: `${W}/southbourne-beach.jpg`, alt: 'The clifftop above Southbourne beach' },
  'areas/westbourne.md': { src: `${W}/westbourne.jpg`, alt: "Westbourne's Victorian shopping arcade" },
  // Events
  'events/bournemouth-air-festival.md': { src: `${W}/air-festival.jpg`, alt: 'An aerobatic display drawing a heart over the bay at the Bournemouth Air Festival' },
  'events/bournemouth-friday-fireworks.md': { src: `${W}/bournemouth-pier.jpg`, alt: 'Bournemouth Pier at dusk' },
  'events/arts-by-the-sea-festival.md': { src: `${W}/lower-gardens.jpg`, alt: 'The Lower Gardens in Bournemouth town centre' },
  'events/christmas-tree-wonderland.md': { src: `${W}/bournemouth-square.jpg`, alt: 'Bournemouth town centre, home to the Christmas Tree Wonderland' },
  // Blog
  'blog/top-things-to-do-in-bournemouth.md': { src: `${W}/bournemouth-pier.jpg`, alt: 'Bournemouth Pier and beach' },
  'blog/bournemouths-best-beaches.md': { src: `${W}/alum-chine.jpg`, alt: 'A sunny sandy Bournemouth beach' },
  'blog/where-to-eat-in-bournemouth.md': { src: `${W}/durley-chine.jpg`, alt: 'Seafront dining on the Bournemouth promenade' },
  'blog/bournemouth-with-kids.md': { src: `${W}/bournemouth-beach.jpg`, alt: 'Families on the sandy beach by Bournemouth Pier' },
  // Itineraries
  'itineraries/a-rainy-day-in-bournemouth.md': { src: `${W}/oceanarium.jpg`, alt: 'Inside the Oceanarium aquarium, a good rainy-day option' },
  // Hubs
  'hubs/things-to-do__attractions.md': { src: `${W}/bournemouth-pier.jpg`, alt: 'Bournemouth Pier and the Pier Theatre' },
  'hubs/food-and-drink__restaurants.md': { src: `${W}/durley-chine.jpg`, alt: 'Seafront dining on the Bournemouth promenade' },
};

function setHero(content, src, alt) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) throw new Error('no frontmatter');
  let fm = fmMatch[1];
  // strip existing heroImage — inline form then block form
  fm = fm.replace(/^heroImage:\s*\{[^}]*\}[ \t]*\n?/m, '');
  fm = fm.replace(/^heroImage:[ \t]*\n(?:[ \t]+\S.*\n?)*/m, '');
  const hero = `heroImage:\n  src: "${src}"\n  alt: "${alt}"`;
  const lines = fm.replace(/\n{3,}/g, '\n\n').trimEnd().split('\n');
  let idx = lines.findIndex((l) => /^tagline:/.test(l));
  if (idx === -1) idx = lines.findIndex((l) => /^description:/.test(l));
  if (idx === -1) idx = lines.findIndex((l) => /^title:/.test(l));
  lines.splice(idx + 1, 0, hero);
  return content.replace(fmMatch[0], `---\n${lines.join('\n')}\n---`);
}

let n = 0;
for (const [rel, img] of Object.entries(MAP)) {
  const p = join(C, rel);
  const before = await readFile(p, 'utf8');
  const after = setHero(before, img.src, img.alt);
  await writeFile(p, after, 'utf8');
  n++;
}
console.log(`Updated heroImage in ${n} content files.`);

// ---- generate the image-credits page from CREDITS.json ----
const usedBaseNames = new Set(
  [...Object.values(MAP)].map((v) => v.src.split('/').pop()),
);
// also the ones kept from earlier that come from wiki? none — kept ones are local originals.
let credits = {};
try {
  credits = JSON.parse(await readFile(join(ROOT, 'public', 'images', 'wiki', 'CREDITS.json'), 'utf8'));
} catch {}
const rows = Object.entries(credits)
  .filter(([file]) => usedBaseNames.has(file))
  .map(([file, c]) => `| ${c.title.replace(/^File:/, '')} | ${c.artist} | ${c.license} | [source](${c.source}) |`)
  .join('\n');

const creditsPage = `---
title: "Image Credits"
tagline: "Photography attributions for The Bournemouth Guide."
draft: false
---

Many of the location photographs on this site come from [Wikimedia Commons](https://commons.wikimedia.org/) and are used under Creative Commons licences, which require attribution. Our thanks to the photographers below. If you are a rights holder and would like a credit corrected or an image removed, please [contact us](/contact).

| Photograph | Author | Licence | Source |
| --- | --- | --- | --- |
${rows}

Placeholder and brand imagery, and any photographs not listed above, are either originals or used with permission.
`;
await writeFile(join(C, 'pages', 'image-credits.md'), creditsPage, 'utf8');
console.log('Wrote src/content/pages/image-credits.md');
