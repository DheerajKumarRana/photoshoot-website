#!/usr/bin/env node
/**
 * Copies everything in js/content.js into Supabase, so the CMS starts with
 * the site's current content. Run after supabase/schema.sql:
 *
 *   npm run seed            first import (stops if photos already exist)
 *   npm run seed -- --force replace the content tables with content.js again
 *
 * Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env. Runs on your
 * computer only; the service role key never goes into the website.
 * Enquiries and admins are never touched.
 */
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const force = process.argv.includes("--force");

// --- .env -------------------------------------------------------------
if (!existsSync(".env")) fail("No .env file. Copy .env.example to .env and fill it in.");
const env = {};
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const URL_ = (env.SUPABASE_URL || "").replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) fail("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set in .env.");

// --- content.js ---------------------------------------------------------
const C = vm.runInNewContext(
  readFileSync("js/content.js", "utf8") + ";({CONFIG,CATS,CAT_PAGES,HERO,PHOTOS,FILMS,TEAM,PRINTS,GALLERY})"
);

const rest = async (path, { method = "GET", body, prefer } = {}) => {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    if (/relation .* does not exist|Could not find the table/i.test(text))
      fail("The tables don't exist yet. Run supabase/schema.sql in the Supabase SQL Editor first.");
    fail(`${method} ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
};

// --- Safety check ------------------------------------------------------
const existing = await rest("photos?select=id&limit=1");
if (existing.length && !force)
  fail("Supabase already has photos. Run `npm run seed -- --force` to replace them with content.js.");

if (force) {
  // Children first (they reference categories). The filter matches every row.
  for (const t of ["photos", "films", "gallery"]) await rest(`${t}?id=not.is.null`, { method: "DELETE" });
}

// --- Rows ---------------------------------------------------------------
const nz = (s) => (s ? s : null);
const categories = C.CATS.map((c, i) => {
  const p = C.CAT_PAGES[c.id] || {};
  return {
    id: c.id, title: c.title, short: c.short, line: c.line || "", subs: c.subs || [],
    img: nz(c.img), src: null,
    page_lead: p.lead || "", page_accent: p.accent || "", page_tail: p.tail || "", page_text: p.text || "",
    sort: i, published: true,
  };
});
const photos = C.PHOTOS.map((p, i) => ({
  category_id: p.cat, moment: p.moment || "", ratio: Math.round(p.r * 1000) / 1000,
  img: nz(p.img), src: nz(p.src), sort: i, published: true,
}));
const films = [
  ...C.FILMS.highlights.map((f) => ({ ...f, kind: "highlight" })),
  ...C.FILMS.reels.map((f) => ({ ...f, kind: "reel" })),
].map((f, i) => ({
  category_id: f.cat, kind: f.kind, title: f.title, src: nz(f.src), poster: nz(f.poster), img: nz(f.img),
  sort: i, published: true,
}));
const gallery = C.GALLERY.map((g, i) => ({
  category_id: g.cat || null, title: g.title || "", caption: g.caption || "",
  img: nz(g.img), src: nz(g.src), sort: i, published: true,
}));
const settings = [
  { key: "contact", value: C.CONFIG },
  { key: "team", value: C.TEAM },
  { key: "hero", value: C.HERO.map(([cat, img]) => ({ cat, img })) },
  { key: "prints", value: C.PRINTS },
];

// --- Write ----------------------------------------------------------------
const upsert = (table, rows, onConflict) =>
  rest(`${table}${onConflict ? `?on_conflict=${onConflict}` : ""}`, {
    method: "POST", body: rows, prefer: `resolution=merge-duplicates,return=minimal`,
  });

await upsert("categories", categories, "id");
await upsert("site_settings", settings, "key");
await rest("photos", { method: "POST", body: photos, prefer: "return=minimal" });
await rest("films", { method: "POST", body: films, prefer: "return=minimal" });
await rest("gallery", { method: "POST", body: gallery, prefer: "return=minimal" });

// --- Report -----------------------------------------------------------------
const count = async (t) => {
  const res = await fetch(`${URL_}/rest/v1/${t}?select=*`, {
    method: "HEAD", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: "count=exact" },
  });
  return (res.headers.get("content-range") || "").split("/")[1] || "?";
};
console.log("Imported into Supabase:");
for (const t of ["categories", "photos", "films", "gallery", "site_settings"]) console.log(`  ${t.padEnd(14)} ${await count(t)}`);

function fail(msg) { console.error(`\x1b[31m✖\x1b[0m ${msg}`); process.exit(1); }
