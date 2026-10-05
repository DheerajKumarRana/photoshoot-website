# Vistaar Content — Website

Photography and films for weddings, traditional ceremonies and family occasions.

A fast, dependency-free static website. No build step, no framework, no server
required — the whole site is plain HTML, CSS and JavaScript, so it can be hosted
free on Netlify, Vercel, Cloudflare Pages or GitHub Pages.

---

## Run it locally

```bash
npm run dev
```

Then open <http://localhost:3000>.

> You must open it through a local server, not by double-clicking `index.html`.
> Opening the file directly (`file://`) breaks the fonts and the 3D background.

Any static server works. Alternatives:

```bash
npx serve .          # Node
python -m http.server 3000   # Python
```

---

## Project structure

```
.
├── index.html            Page markup + all SEO tags (title, Open Graph, schema)
├── 404.html              Not-found page
├── css/
│   └── styles.css        All styling and design tokens
├── js/
│   ├── content.js        ← YOUR DETAILS AND PHOTOS LIVE HERE
│   └── app.js            Animations, gallery, film player, enquiry form
├── assets/
│   ├── images/           Your photographs
│   ├── videos/           Your film files (.mp4)
│   └── icons/            Favicon and app icons
├── tools/
│   └── check-config.mjs  Pre-launch checklist (npm run check)
├── robots.txt            Search engine rules
├── sitemap.xml           Page list for Google
├── site.webmanifest      Install-to-homescreen settings
├── netlify.toml          Netlify hosting config (caching + security headers)
└── vercel.json           Vercel hosting config
```

For everyday changes you only ever need to edit **`js/content.js`**.

---

## Before going live

Run the checker at any time to see what is still outstanding:

```bash
npm run check
```

It exits with an error while anything is still a placeholder.

### 1. Contact details — `js/content.js`

Open the `CONFIG` block at the top and fill in every `TODO`:

```js
const CONFIG = {
  whatsapp:  "919876543210",            // country code + number, digits only
  phone:     "+91 98765 43210",
  email:     "hello@vistaarcontent.com",
  instagram: "https://instagram.com/vistaarcontent",
  youtube:   "",                        // leave "" to hide the link
  facebook:  "",
  city:      "Hyderabad",
  mapsUrl:   "https://maps.app.goo.gl/..."
};
```

**The WhatsApp number is the one setting that must be correct.** The enquiry
form builds a pre-filled WhatsApp message and opens it in a new tab; with the
wrong number, enquiries go nowhere.

### 2. Your photographs

Drop your files into `assets/images/`, then point to them in `js/content.js`.
Every photo entry has a `src` field. An empty `src` renders a generated
placeholder; a real path renders your photograph:

```js
{ cat:"weddings", moment:"Under the mandap", r:2/3, src:"assets/images/wedding-mandap.jpg" },
```

The same applies to `HERO`, `PRINTS` and `TEAM`.

**Export sizes:** roughly 1600px on the long edge, JPEG quality 70–80. Use WebP
if you can. Large unoptimised files are the single biggest cause of a slow site.

### 3. Your films

Put `.mp4` files in `assets/videos/` and a poster image for each in
`assets/images/`:

```js
{ cat:"weddings", title:"Wedding highlight film",
  src:"assets/videos/sharma-wedding.mp4",
  poster:"assets/images/sharma-wedding-poster.jpg" },
```

Films over ~20 MB should be hosted on YouTube or Vimeo instead of served
directly, otherwise mobile visitors will wait a long time.

### 4. Your domain and SEO

Search and replace `www.vistaarcontent.com` with your real domain across
`index.html`, `robots.txt` and `sitemap.xml`.

In `index.html`, also complete the `TODO` fields in the structured-data block
near the bottom of `<head>`: phone, email, street address, city, state, pin code
and your real social profile URLs. This is what lets Google show Vistaar Content
as a local photography business with a location and contact details.

### 5. Social link preview

Add a **1200 × 630** JPG at `assets/images/og-cover.jpg`. This is the image
people see when your link is shared on WhatsApp, Facebook or LinkedIn. Without
it, shared links appear as plain grey text.

### 6. App icons

Replace these with your logo:

- `assets/icons/favicon.svg` — browser tab (a simple placeholder mark is included)
- `assets/icons/favicon.ico` — 32×32, older browsers
- `assets/icons/apple-touch-icon.png` — 180×180, iPhone home screen
- `assets/icons/icon-192.png` and `icon-512.png` — Android home screen

<https://realfavicongenerator.net> will produce all of these from one logo file.

---

## Deploying

### Netlify (easiest)

1. Push this folder to a GitHub repository.
2. On <https://netlify.com>, choose **Add new site → Import an existing project**.
3. Pick the repository. Leave the build command empty and set the publish
   directory to `.` — `netlify.toml` already configures this.
4. Under **Domain settings**, add your domain and follow the DNS instructions.

### Vercel

Import the repository at <https://vercel.com/new> and deploy. `vercel.json`
handles the rest. Or from the terminal:

```bash
npx vercel --prod
```

### Cloudflare Pages / GitHub Pages

Both serve this folder as-is. No build command, output directory `.`.

HTTPS is automatic and free on all of the above.

---

## After launch

- **Google Search Console** — <https://search.google.com/search-console>. Add your
  domain, then submit `https://yourdomain.com/sitemap.xml` so Google indexes the
  site. This is the step most photography sites skip.
- **Google Business Profile** — far more important than the website for local
  enquiries. Create one, add photos, and link it to the site.
- **Analytics** — to see visitor numbers, add a Plausible, Fathom or Google
  Analytics snippet just before `</head>` in `index.html`.
- **Speed check** — run <https://pagespeed.web.dev> against the live URL. If the
  score is low, the cause is almost always oversized images.

---

## Notes on the build

- No JavaScript framework and no bundler, so there is nothing to keep updated
  and nothing that can break on a dependency upgrade.
- The only external dependencies are Google Fonts and `three.js` (loaded from a
  CDN for the 3D background). Both fail gracefully.
- All animation respects `prefers-reduced-motion`.
- The enquiry form validates in the browser and hands off to WhatsApp — there is
  no backend and no database, so there is nothing to maintain or secure.

If you later want enquiries stored in a database with an admin panel, that
requires adding a backend; the current setup deliberately avoids one.
