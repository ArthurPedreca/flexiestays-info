// One-off helper: fetch freely-licensed Bournemouth photos from Wikimedia
// Commons (relevance search in the File namespace), pick the best landscape
// JPEG whose filename matches the subject, download a ~1600px version, and
// record attribution to public/images/wiki/CREDITS.json.
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "images",
  "wiki",
);
const UA = {
  "User-Agent":
    "TheBournemouthGuide/1.0 (site content setup; contact hello@thebournemouthguide.com)",
};
const BAD =
  /\b(map|chart|admiralty|sign|plan|diagram|logo|poster|badge|arms|engraving|drawing|painting|scheme|graph|1855|1957|survey)\b/i;

const TARGETS = [
  { file: "bournemouth-pier", q: "Bournemouth Pier", kw: ["pier"] },
  { file: "boscombe-pier", q: "Boscombe Pier", kw: ["boscombe"] },
  {
    file: "oceanarium",
    q: "Oceanarium Bournemouth aquarium",
    kw: ["oceanarium", "aquarium"],
  },
  {
    file: "russell-cotes",
    q: "Russell-Cotes Art Gallery Museum Bournemouth",
    kw: ["russell"],
  },
  { file: "lower-gardens", q: "Lower Gardens Bournemouth", kw: ["garden"] },
  {
    file: "bournemouth-beach",
    q: "Bournemouth beach pier sand",
    kw: ["bournemouth"],
  },
  { file: "boscombe-beach", q: "Boscombe beach Bournemouth", kw: ["boscombe"] },
  { file: "alum-chine", q: "Alum Chine Bournemouth beach", kw: ["alum"] },
  { file: "durley-chine", q: "Durley Chine Bournemouth beach", kw: ["durley"] },
  {
    file: "southbourne-beach",
    q: "Southbourne Dorset beach cliff",
    kw: ["southbourne"],
  },
  {
    file: "christchurch-priory",
    q: "Christchurch Priory Dorset",
    kw: ["christchurch", "priory"],
  },
  {
    file: "westbourne",
    q: "Westbourne Bournemouth arcade street",
    kw: ["westbourne"],
  },
  { file: "poole-quay", q: "Poole Quay Dorset harbour", kw: ["poole"] },
  {
    file: "bournemouth-square",
    q: "The Square Bournemouth town centre",
    kw: ["bournemouth", "square"],
  },
  {
    file: "air-festival",
    q: "Bournemouth Air Festival",
    kw: ["air", "festival", "bournemouth"],
  },
  {
    file: "bournemouth-gardens",
    q: "Bournemouth pleasure gardens pavilion",
    kw: ["bournemouth", "garden"],
  },
];

const strip = (s) =>
  (s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

async function searchFiles(q) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search" +
    "&gsrnamespace=6&gsrlimit=20&gsrsearch=" +
    encodeURIComponent(q) +
    "&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1600";
  const r = await fetch(url, { headers: UA });
  const j = await r.json();
  if (!j.query) return [];
  return Object.values(j.query.pages)
    .map((p) => ({ title: p.title, info: p.imageinfo && p.imageinfo[0] }))
    .filter((x) => x.info);
}

function pick(cands, kw) {
  return (
    cands
      .filter((c) => c.info.mime === "image/jpeg" && c.info.width >= 1100)
      .filter((c) => !BAD.test(c.title))
      .filter((c) => kw.some((k) => c.title.toLowerCase().includes(k)))
      // prefer landscape, then wider aspect, then bigger
      .map((c) => ({ ...c, ar: c.info.width / c.info.height }))
      .filter((c) => c.ar >= 1.1 && c.ar <= 2.6)
      .sort((a, b) => b.info.width - a.info.width)[0]
  );
}

await mkdir(OUT, { recursive: true });
const credits = {};
for (const t of TARGETS) {
  try {
    const cands = await searchFiles(t.q);
    const best = pick(cands, t.kw);
    if (!best) {
      console.log(
        `SKIP  ${t.file}  no suitable match (from ${cands.length} results)`,
      );
      continue;
    }
    const dl = best.info.thumburl || best.info.url;
    const res = await fetch(dl, { headers: UA });
    if (!res.ok) {
      console.log(`FAIL  ${t.file}  HTTP ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(join(OUT, `${t.file}.jpg`), buf);
    const md = best.info.extmetadata || {};
    credits[`${t.file}.jpg`] = {
      title: best.title,
      source:
        best.info.descriptionurl ||
        `https://commons.wikimedia.org/wiki/${encodeURIComponent(best.title)}`,
      artist: strip(md.Artist && md.Artist.value) || "Unknown",
      license:
        strip(md.LicenseShortName && md.LicenseShortName.value) || "See source",
      dimensions: `${best.info.width}x${best.info.height}`,
    };
    console.log(
      `OK    ${t.file}.jpg  ${Math.round(buf.length / 1024)}KB  [${credits[`${t.file}.jpg`].license}]  <- ${best.title}`,
    );
  } catch (e) {
    console.log(`ERR   ${t.file}  ${e.message}`);
  }
}
await writeFile(join(OUT, "CREDITS.json"), JSON.stringify(credits, null, 2));
console.log(
  `\nWrote ${Object.keys(credits).length} images + CREDITS.json to public/images/wiki/`,
);
