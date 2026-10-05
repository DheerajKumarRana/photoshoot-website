#!/usr/bin/env node
/**
 * Pre-launch check. Run: npm run check
 * Flags every placeholder that must be replaced before the site goes live.
 */
import { readFileSync, existsSync } from "node:fs";

const problems = [];
const warnings = [];
const ok = [];

const read = (f) => (existsSync(f) ? readFileSync(f, "utf8") : null);

// --- 1. Contact config -------------------------------------------------
const content = read("js/content.js");
if (!content) problems.push("js/content.js is missing.");
else {
  const grab = (key) => {
    const line = content.split(/\r?\n/).find((l) => l.trim().startsWith(key + ":"));
    if (!line) return null;
    const m = line.match(/"([^"]*)"/);
    return m ? m[1] : null;
  };
  const wa = grab("whatsapp");
  if (!wa || /^9?1?0+$/.test(wa.replace(/\D/g, "")))
    problems.push(`CONFIG.whatsapp is still the placeholder ("${wa}"). The enquiry form will not reach you.`);
  else ok.push(`WhatsApp number set (${wa}).`);

  for (const [key, label] of [["email", "Email"], ["phone", "Phone"], ["instagram", "Instagram"]]) {
    const v = grab(key);
    if (!v || v.includes("00000")) warnings.push(`CONFIG.${key} is empty or placeholder — the ${label} link will be hidden.`);
    else ok.push(`${label} set.`);
  }
}

// --- 2. Domain / SEO placeholders --------------------------------------
for (const f of ["index.html", "robots.txt", "sitemap.xml"]) {
  const s = read(f);
  if (!s) { problems.push(`${f} is missing.`); continue; }
  if (s.includes("vistaarcontent.com")) warnings.push(`${f} still uses the placeholder domain www.vistaarcontent.com.`);
  const todos = (s.match(/TODO/g) || []).length;
  if (todos) warnings.push(`${f} has ${todos} TODO marker${todos > 1 ? "s" : ""} left.`);
}

// --- 3. Real media ------------------------------------------------------
if (content) {
  if (content.includes("images.unsplash.com"))
    warnings.push("Portfolio still uses Unsplash stock photos. Replace them with your own shoots in js/content.js.");
  const emptyFilm = (content.match(/src:\s*""/g) || []).length;
  if (emptyFilm) warnings.push(`${emptyFilm} items still have an empty \`src\` and will render a generated stand-in image.`);
}

// --- 4. Social preview image -------------------------------------------
if (!existsSync("assets/images/og-cover.jpg"))
  warnings.push("assets/images/og-cover.jpg is missing — WhatsApp/Facebook link previews will show no image. Add a 1200x630 JPG.");

// --- Report -------------------------------------------------------------
const c = { r: "\x1b[31m", y: "\x1b[33m", g: "\x1b[32m", d: "\x1b[2m", x: "\x1b[0m" };
console.log(`\n${c.d}Vistaar Content — pre-launch check${c.x}\n`);
ok.forEach((m) => console.log(`  ${c.g}OK${c.x}    ${m}`));
warnings.forEach((m) => console.log(`  ${c.y}WARN${c.x}  ${m}`));
problems.forEach((m) => console.log(`  ${c.r}BLOCK${c.x} ${m}`));
console.log(
  `\n${problems.length ? c.r + problems.length + " blocking" : c.g + "No blocking"} issue${problems.length === 1 ? "" : "s"}${c.x}, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}.\n`
);
process.exit(problems.length ? 1 : 0);
