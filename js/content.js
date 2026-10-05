/* =====================================================================
   BUSINESS DETAILS + CONTENT
   This is the only file you need to edit for day-to-day changes.

   1. CONFIG  — your contact details. Fill in every TODO.
   2. CATS    — the portfolio categories shown on the wheel.
   3. HERO / PHOTOS / PRINTS — images. Put a real URL in `src`
                (e.g. "assets/images/wedding-01.jpg"). An empty `src`
                falls back to a generated stand-in image.
   4. FILMS   — real video files in `src` (.mp4), poster image in `poster`.
   ===================================================================== */

const CONFIG = {
  // --- Contact (required) ---
  whatsapp:  "910000000000",      // TODO: country code + number, digits only. e.g. 919876543210
  phone:     "+91 00000 00000",   // TODO: shown as a tappable call link
  email:     "",                  // TODO: e.g. hello@vistaarcontent.com

  // --- Social (leave "" to hide the link) ---
  instagram: "",                  // e.g. https://instagram.com/vistaarcontent
  youtube:   "",                  // e.g. https://youtube.com/@vistaarcontent
  facebook:  "",                  // e.g. https://facebook.com/vistaarcontent

  // --- Studio location (leave "" to hide) ---
  city:      "",                  // e.g. Hyderabad
  mapsUrl:   ""                   // e.g. https://maps.app.goo.gl/xxxxx
};

// Unsplash photo IDs (free under the Unsplash License). Swap for your own shoots.
const US=(id,w,h)=>id?`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}${h?`&h=${h}`:""}&q=72`:"";

const CATS = [
  { id:"weddings", title:"Weddings", short:"Weddings", img:"photo-1587271636175-90d58cdad458",
    line:"The whole day, from the first haldi to the last goodbye at the gate.", subs:[] },
  { id:"engagement", title:"Engagement & Pre-Wedding", short:"Engagement", img:"photo-1630526720753-aa4e71acf67d",
    line:"The ring, the two families meeting, and a shoot of just the two of you before the big day.", subs:[] },
  { id:"ceremonies", title:"Traditional Ceremonies", short:"Ceremonies", img:"photo-1611106211090-8f3c79eb8552",
    line:"Family rituals, photographed with the patience they deserve.",
    subs:["Baby Shower / Seemantham","Half Saree Ceremony","Ear Piercing","Naming Ceremony","Other Pooja / Family Ceremonies"] },
  { id:"kids", title:"Baby & Kids", short:"Baby & Kids", img:"photo-1635770618588-06bd8d5d73b9",
    line:"Little ones move fast. We keep up.", subs:["1st Birthday","Birthday Parties","Kids Celebrations"] },
  { id:"birthdays", title:"Birthdays & Celebrations", short:"Celebrations", img:"photo-1653821355736-0c2598d0a63e",
    line:"Milestones, toasts and the friends who stayed till the end.", subs:["Milestone Birthdays","Anniversaries","Private Parties"] },
  { id:"housewarming", title:"Housewarming", short:"Housewarming", img:"photo-1659352790654-058e9077a4f4",
    line:"The first lamp, the first pooja, the first meal in a new home.", subs:["Griha Pravesh","Pooja","Family Moments"] },
  { id:"maternity", title:"Maternity & Family", short:"Maternity & Family", img:"photo-1657912230172-23f8b31665ed",
    line:"Calm portraits of a family about to grow, and of the family it becomes.", subs:[] },
  { id:"corporate", title:"Corporate & Social Events", short:"Corporate & Social", img:"photo-1531058020387-3be344556be6",
    line:"Annual days, launches and gatherings, covered for the people who planned them.", subs:[] }
];

const HERO = [
  ["weddings","photo-1587271636175-90d58cdad458"],["engagement","photo-1630526720753-aa4e71acf67d"],
  ["ceremonies","photo-1611106211090-8f3c79eb8552"],["kids","photo-1589169011402-8b2cbd1ee593"],
  ["weddings","photo-1621801306185-8c0ccf9c8eb8"],["birthdays","photo-1653821355736-0c2598d0a63e"],
  ["maternity","photo-1657912230172-23f8b31665ed"],["corporate","photo-1531058020387-3be344556be6"],
  ["weddings","photo-1587271315307-eaebc181c749"],["engagement","photo-1735052712464-9d24b69be5f5"],
  ["housewarming","photo-1659352790654-058e9077a4f4"],["weddings","photo-1587271407850-8d438ca9fdf2"],
  ["kids","photo-1635770618588-06bd8d5d73b9"],["ceremonies","photo-1727430228383-aa1fb59db8bf"],
  ["birthdays","photo-1633891119630-cb3665df5b7d"],["engagement","photo-1654156577076-e0350ba86cc1"],
  ["weddings","photo-1743684821666-05b9c5046937"],["birthdays","photo-1567122087721-47b09b61e1d1"],
  ["weddings","photo-1722952934661-dde241aeb591"],["weddings","photo-1727430256509-0f897d6f4765"]
];

const PHOTOS = [
  { cat:"weddings", moment:"Under the mandap", r:2/3, img:"photo-1587271636175-90d58cdad458" },
  { cat:"engagement", moment:"Pre-wedding by the river", r:4/5, img:"photo-1630526720753-aa4e71acf67d" },
  { cat:"ceremonies", moment:"Green and gold, the first sari", r:2/3, img:"photo-1611106211090-8f3c79eb8552" },
  { cat:"kids", moment:"Giggles on the sofa", r:3/2, img:"photo-1589169011402-8b2cbd1ee593" },
  { cat:"weddings", moment:"Mehendi hands", r:3/2, img:"photo-1621801306185-8c0ccf9c8eb8" },
  { cat:"corporate", moment:"Conference hall, full house", r:3/2, img:"photo-1531058020387-3be344556be6" },
  { cat:"weddings", moment:"The bride, before the pheras", r:4/5, img:"photo-1587271315307-eaebc181c749" },
  { cat:"birthdays", moment:"Dinner table, candles lit", r:4/5, img:"photo-1653821355736-0c2598d0a63e" },
  { cat:"maternity", moment:"New parents", r:4/5, img:"photo-1657912230172-23f8b31665ed" },
  { cat:"engagement", moment:"A walk in the woods", r:2/3, img:"photo-1735052712464-9d24b69be5f5" },
  { cat:"housewarming", moment:"The whole family, together", r:3/2, img:"photo-1659352790654-058e9077a4f4" },
  { cat:"weddings", moment:"Rituals under the canopy", r:3/2, img:"photo-1587271407850-8d438ca9fdf2" },
  { cat:"kids", moment:"Up in the air", r:4/5, img:"photo-1635770618588-06bd8d5d73b9" },
  { cat:"ceremonies", moment:"Sari portrait", r:2/3, img:"photo-1727430228383-aa1fb59db8bf" },
  { cat:"birthdays", moment:"A hug in front of everyone", r:3/2, img:"photo-1633891119630-cb3665df5b7d" },
  { cat:"engagement", moment:"Holding on", r:4/5, img:"photo-1654156577076-e0350ba86cc1" },
  { cat:"corporate", moment:"Keynote", r:4/5, img:"photo-1591833383187-a750e84a494c" },
  { cat:"weddings", moment:"Newlyweds", r:2/3, img:"photo-1743684821666-05b9c5046937" },
  { cat:"housewarming", moment:"Family moments at home", r:4/5, img:"photo-1609253932702-796cbf3d3171" },
  { cat:"maternity", moment:"Family portrait, outdoors", r:3/2, img:"photo-1609253919256-74a3b8f1cd5e" },
  { cat:"birthdays", moment:"Laughing through the toasts", r:4/5, img:"photo-1567122087721-47b09b61e1d1" },
  { cat:"weddings", moment:"Bride and groom portrait", r:4/5, img:"photo-1722952934708-749c22eb2e58" },
  { cat:"corporate", moment:"On stage, all together", r:3/2, img:"photo-1633358050629-bb6a292616ff" },
  { cat:"engagement", moment:"The rings", r:3/2, img:"photo-1533091090875-1ff4acc497dd" }
].map((p,i)=>({ src:"", seed:100+i, ...p }));

const FILMS = {
  highlights: [
    { cat:"kids", title:"First birthday highlight", src:"", img:"photo-1589169011402-8b2cbd1ee593" },
    { cat:"weddings", title:"Wedding highlight film", src:"", img:"photo-1727430256509-0f897d6f4765" },
    { cat:"engagement", title:"Pre-wedding film", src:"", img:"photo-1735052712489-f45220126a0c" },
    { cat:"housewarming", title:"Family day highlight", src:"", img:"photo-1609253932702-796cbf3d3171" }
  ],
  reels: [
    { cat:"weddings", title:"Bride and groom, thirty seconds", src:"", img:"photo-1722952934661-dde241aeb591" },
    { cat:"kids", title:"Little one, big day", src:"", img:"photo-1635770618588-06bd8d5d73b9" },
    { cat:"ceremonies", title:"Half saree reveal", src:"", img:"photo-1727430228383-aa1fb59db8bf" },
    { cat:"engagement", title:"The ring moment", src:"", img:"photo-1654156577076-e0350ba86cc1" },
    { cat:"birthdays", title:"Surprise party", src:"", img:"photo-1567122087721-47b09b61e1d1" },
    { cat:"corporate", title:"Annual day recap", src:"", img:"photo-1633358050629-bb6a292616ff" }
  ]
};

// Team photo for the frosted reveal. Replace img (Unsplash ID) or set src to your own URL.
const TEAM = { src:"", img:"photo-1659352790654-058e9077a4f4", alt:"The Vistaar Content team" };

const PRINTS = [
  { cat:"weddings", caption:"Mehendi, still drying", img:"photo-1621801306185-8c0ccf9c8eb8" },
  { cat:"kids", caption:"The giggle we waited for", img:"photo-1589169011402-8b2cbd1ee593" },
  { cat:"weddings", caption:"Before the pheras", img:"photo-1587271315307-eaebc181c749" },
  { cat:"maternity", caption:"Week one", img:"photo-1657912230172-23f8b31665ed" },
  { cat:"engagement", caption:"Walking it off before the big day", img:"photo-1735052712489-f45220126a0c" }
];

