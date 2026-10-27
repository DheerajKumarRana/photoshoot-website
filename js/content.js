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
// A full URL or a path (an uploaded photo from the CMS, assets/...) is used as it is.
const US=(id,w,h)=>!id?"":/^(https?:)?\/\/|^[\w-]+\//.test(id)?id:`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}${h?`&h=${h}`:""}&q=72`;

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

// Headline and intro for each category's own page (category.html?c=<id>).
// The heading reads: lead + accent (in gold) + tail. Photos come from PHOTOS
// and films from FILMS, matched by `cat`.
const CAT_PAGES = {
  weddings:     { lead:"Every ritual,", accent:"every relative,", tail:"every happy tear.",
                  text:"From the first haldi splash to the vidaai at the gate, we follow the whole day so you can live it instead of managing it." },
  engagement:   { lead:"The ring, the nerves,", accent:"and the yes", tail:"you'll replay forever.",
                  text:"Ring ceremonies where two families meet, and pre-wedding shoots that feel like a day out together, not a photo session." },
  ceremonies:   { lead:"Rituals your grandmother", accent:"will want framed", tail:"on the wall.",
                  text:"Half saree, seemantham, naming and ear piercing ceremonies. We know when the important moment is coming and wait for it quietly." },
  kids:         { lead:"Tiny humans,", accent:"huge moments,", tail:"zero second takes.",
                  text:"First birthdays and little parties move fast and never repeat. We stay at their eye level and keep up with them." },
  birthdays:    { lead:"Make a wish.", accent:"We'll catch it", tail:"before the candles go out.",
                  text:"Cakes, speeches, toasts and the friends who stayed till the end. Milestone birthdays and anniversaries, kept for good." },
  housewarming: { lead:"New walls,", accent:"first memories,", tail:"the same old family.",
                  text:"The first lamp lit, the first pooja, the first meal at your own table. Griha pravesh, photographed like the beginning it is." },
  maternity:    { lead:"Counting down", accent:"to the smallest", tail:"member of the family.",
                  text:"Calm, unhurried portraits of a family about to grow, and of the family it becomes once the little one arrives." },
  corporate:    { lead:"Your event,", accent:"on the record,", tail:"and looking its best.",
                  text:"Annual days, launches and conferences, covered properly for the people who planned them and for everyone who couldn't make it." }
};

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
  { cat:"engagement", moment:"The rings", r:3/2, img:"photo-1533091090875-1ff4acc497dd" },
  // More from each category, shown on the category pages (and in Recent work).
  { cat:"weddings", moment:"Petals rain on the pheras", r:2/3, img:"photo-1754782915842-aa4fca6c203a" },
  { cat:"weddings", moment:"A forehead kiss, after dark", r:2/3, img:"photo-1599462616558-2b75fd26a283" },
  { cat:"weddings", moment:"Mandap glowing under the tree", r:2/3, img:"photo-1744805624954-a6686543c3ff" },
  { cat:"weddings", moment:"The bride, all smiles", r:2/3, img:"photo-1600685890506-593fdf55949b" },
  { cat:"weddings", moment:"Haldi poured from above", r:2/3, img:"photo-1681717166573-f71589207785" },
  { cat:"weddings", moment:"Haldi, hands everywhere", r:2/3, img:"photo-1780227102903-956ab5da42d0" },
  { cat:"weddings", moment:"The groom's haldi shower", r:3/2, img:"photo-1635919254233-38ea27301900" },
  { cat:"weddings", moment:"Hands joined at the ritual", r:3/2, img:"photo-1597157639073-69284dc0fdaf" },
  { cat:"engagement", moment:"Rings, mehndi, holding on", r:2/3, img:"photo-1770823218239-996df9afcff0" },
  { cat:"engagement", moment:"The ring, up close", r:3/2, img:"photo-1542042161784-26ab9e041e89" },
  { cat:"engagement", moment:"A hug among the trees", r:3/2, img:"photo-1731998308650-a22f31095825" },
  { cat:"engagement", moment:"Walking the hilltop together", r:3/2, img:"photo-1532712938310-34cb3982ef74" },
  { cat:"engagement", moment:"Red gown, pink sky", r:3/2, img:"photo-1631621583126-ed10a80f62b1" },
  { cat:"engagement", moment:"Fairy lights, slow walk", r:2/3, img:"photo-1724847665609-c648e04dda32" },
  { cat:"engagement", moment:"Garden light, close together", r:3/2, img:"photo-1754782540893-2122877f2975" },
  { cat:"engagement", moment:"Forest path, soft haze", r:2/3, img:"photo-1635481728744-086dc12ceaf5" },
  { cat:"ceremonies", moment:"Havan fire, rising high", r:2/3, img:"photo-1695824396901-8b3a1d4b652f" },
  { cat:"ceremonies", moment:"Hands warmed over the aarti", r:2/3, img:"photo-1625072290979-cac544181be8" },
  { cat:"ceremonies", moment:"Blessings from the elders", r:3/2, img:"photo-1641279676778-3c94588147fd" },
  { cat:"ceremonies", moment:"The whole family at pooja", r:3/2, img:"photo-1668432747162-5e7ded79e498" },
  { cat:"ceremonies", moment:"Her first half saree", r:2/3, img:"photo-1703044412383-fa6b9884e802" },
  { cat:"ceremonies", moment:"Marigolds and a shy smile", r:2/3, img:"photo-1681717075175-19feb7a6f664" },
  { cat:"ceremonies", moment:"Yellow sari, quiet moment", r:3/2, img:"photo-1698460917986-8dfcea8b6ca7" },
  { cat:"ceremonies", moment:"Mehndi hands, cupped together", r:2/3, img:"photo-1514178703120-3fa66528901d" },
  { cat:"kids", moment:"Big eyes, bigger wonder", r:2/3, img:"photo-1630305131239-c8df91783f10" },
  { cat:"kids", moment:"One today, party hat on", r:2/3, img:"photo-1734943598774-d0f20418a9a2" },
  { cat:"kids", moment:"Thinking very hard", r:2/3, img:"photo-1624434350526-0ad3a4f3c1cb" },
  { cat:"kids", moment:"Peekaboo after bath time", r:2/3, img:"photo-1630305130592-210da48f151e" },
  { cat:"kids", moment:"Pure, fist-pumping joy", r:3/2, img:"photo-1680762662839-46b6d050b2c3" },
  { cat:"kids", moment:"Little Krishna, peacock feather", r:2/3, img:"photo-1597430755294-d6e010d67279" },
  { cat:"kids", moment:"Ball in the air", r:3/2, img:"photo-1502086223501-7ea6ecd79368" },
  { cat:"kids", moment:"That toddler grin", r:3/2, img:"photo-1694401977295-9a4cee0e9ae8" },
  { cat:"birthdays", moment:"Candles, then the wish", r:2/3, img:"photo-1545696563-af8f6ec2295a" },
  { cat:"birthdays", moment:"Confetti and real laughter", r:2/3, img:"photo-1544155892-b2b6c64204fc" },
  { cat:"birthdays", moment:"Glasses up, balloons behind", r:2/3, img:"photo-1699730164892-d7c433524ff3" },
  { cat:"birthdays", moment:"A toast across the table", r:3/2, img:"photo-1527529482837-4698179dc6ce" },
  { cat:"birthdays", moment:"Family clinks, dinner glow", r:3/2, img:"photo-1533777419517-3e4017e2e15a" },
  { cat:"birthdays", moment:"The heart cake arrives", r:2/3, img:"photo-1765150399819-ed5b9e13ff1b" },
  { cat:"birthdays", moment:"Sparklers for the milestone", r:3/2, img:"photo-1634535462955-91cf1a97122e" },
  { cat:"birthdays", moment:"Balloon arch, all set", r:3/2, img:"photo-1741969494307-55394e3e4071" },
  { cat:"housewarming", moment:"A diya set on the rangoli", r:3/2, img:"photo-1670943519416-aaca0212308b" },
  { cat:"housewarming", moment:"Rangoli at the doorstep", r:2/3, img:"photo-1659451336076-9857b8cbef10" },
  { cat:"housewarming", moment:"Toran up, lamps lit", r:2/3, img:"photo-1700544628901-523c8108d864" },
  { cat:"housewarming", moment:"Brass lamp, marigold garland", r:2/3, img:"photo-1702505433756-88130191bb4b" },
  { cat:"housewarming", moment:"Kalash ready for pooja", r:3/2, img:"photo-1551979122-3a33d9391335" },
  { cat:"housewarming", moment:"Lakshmi's footsteps, welcomed in", r:3/2, img:"photo-1761295908318-4007b4597822" },
  { cat:"housewarming", moment:"Diyas among the petals", r:3/2, img:"photo-1577083753695-e010191bacb5" },
  { cat:"housewarming", moment:"Colour, pinch by pinch", r:2/3, img:"photo-1700993714468-408700d3599e" },
  { cat:"maternity", moment:"Three of us, dressed up", r:1, img:"photo-1730130596440-e9925840f028" },
  { cat:"maternity", moment:"Silhouette, waiting for you", r:2/3, img:"photo-1489674297774-eadf82cba14c" },
  { cat:"maternity", moment:"Sea breeze, bump and all", r:2/3, img:"photo-1702360681796-6aa6d4f569f9" },
  { cat:"maternity", moment:"Scan in hand, a kiss", r:2/3, img:"photo-1702360681320-b98ddd6ab13b" },
  { cat:"maternity", moment:"Window light, new arrival", r:2/3, img:"photo-1543342384-1f1350e27861" },
  { cat:"maternity", moment:"Dad's first lift", r:3/2, img:"photo-1773243086594-43577199874f" },
  { cat:"maternity", moment:"Tiny feet, two hearts", r:3/2, img:"photo-1768657890590-7eb13ba27844" },
  { cat:"maternity", moment:"Parents leaning in close", r:2/3, img:"photo-1785706134100-c839b7adfdf8" },
  { cat:"corporate", moment:"Keynote, packed hall", r:3/2, img:"photo-1587825140708-dfaf72ae4b04" },
  { cat:"corporate", moment:"A room full of listeners", r:3/2, img:"photo-1558008258-3256797b43f3" },
  { cat:"corporate", moment:"Questions from the floor", r:3/2, img:"photo-1715610258704-e8f9f5710fe0" },
  { cat:"corporate", moment:"Speaker facing the crowd", r:3/2, img:"photo-1544531586-fde5298cdd40" },
  { cat:"corporate", moment:"Panel under the spotlight", r:3/2, img:"photo-1582192730841-2a682d7375f9" },
  { cat:"corporate", moment:"Workshop around the table", r:3/2, img:"photo-1542744173-8e7e53415bb0" },
  { cat:"corporate", moment:"Team talk, brick walls", r:3/2, img:"photo-1591115765373-5207764f72e7" },
  { cat:"corporate", moment:"Her turn on stage", r:3/2, img:"photo-1679579664878-2c025e3f87b0" },
  { cat:"birthdays", moment:"Two hands, one cake knife", r:3/2, img:"photo-1789257042333-4e546f05c7b4" },
  { cat:"birthdays", moment:"Party hat, tinsel, first cake", r:2/3, img:"photo-1674279293147-4398a39b1847" },
  { cat:"birthdays", moment:"Party hats and wide eyes", r:3/2, img:"photo-1648556141401-eb1389a12571" },
  { cat:"birthdays", moment:"Big hugs before the cake", r:3/2, img:"photo-1642516111352-a4ed1c2566f5" },
  { cat:"birthdays", moment:"One breath, three candles", r:3/2, img:"photo-1639376710313-683c2d4d0104" },
  { cat:"birthdays", moment:"Birthday hat, sticky fingers", r:2/3, img:"photo-1600084787689-c4ca2d558d50" },
  { cat:"housewarming", moment:"Garlanded and seated for pooja", r:3/2, img:"photo-1700195088413-14c85f4486bd" },
  { cat:"housewarming", moment:"Kalash crowned with mango leaves", r:3/2, img:"photo-1754276747848-fed9fe91d806" },
  { cat:"housewarming", moment:"Brass kalash, lamps and bananas", r:3/2, img:"photo-1783255166346-b7c82195ba34" },
  { cat:"housewarming", moment:"Bangled hands arrange the thali", r:3/2, img:"photo-1627419375575-6cb2faa849b3" },
  { cat:"housewarming", moment:"Diyas ringed in marigold rangoli", r:3/2, img:"photo-1635192592106-77a5aacbe1a3" },
  { cat:"housewarming", moment:"Havan flame, first blessing", r:2/3, img:"photo-1721786838752-aada8c94d732" },
  { cat:"housewarming", moment:"Red kalash among rose petals", r:3/2, img:"photo-1680491026421-75b3f2feef56" },
  { cat:"maternity", moment:"Gold silk and jasmine garlands", r:2/3, img:"photo-1788067694849-91b88f7f4bc3" },
  { cat:"maternity", moment:"A kiss for the bump", r:2/3, img:"photo-1646375036693-bd0aa0f23c0e" },
  { cat:"maternity", moment:"His hands over hers", r:2/3, img:"photo-1709823157693-c63157807cc3" },
  { cat:"maternity", moment:"Gold embroidery, soft studio light", r:2/3, img:"photo-1739358148464-8a0f831d455c" },
  { cat:"maternity", moment:"Peeking over mama's shoulder", r:3/2, img:"photo-1780329941563-866557aca9f7" },
  { cat:"maternity", moment:"Family of five, red wall", r:3/2, img:"photo-1780329944309-08b392306b49" },
  { cat:"maternity", moment:"Swaddled in pink blossoms", r:3/2, img:"photo-1791013908525-774ca6447202" },
  { cat:"corporate", moment:"At the podium, mid-thought", r:3/2, img:"photo-1775113586139-b583cc93517f" },
  { cat:"corporate", moment:"Smiles across the audience", r:3/2, img:"photo-1555725305-e823b44548de" },
  { cat:"corporate", moment:"Applause around the office", r:2/3, img:"photo-1761393382562-8ad78afa1179" },
  { cat:"corporate", moment:"Team applauds the presenter", r:3/2, img:"photo-1577962917302-cd874c4e31d2" },
  { cat:"corporate", moment:"Thumbs up, team photo", r:3/2, img:"photo-1776248783518-400b6d0da64c" },
  { cat:"corporate", moment:"A full house awaits", r:3/2, img:"photo-1594122230689-45899d9e6f69" },
  { cat:"weddings", moment:"South Indian muhurtham, family close", r:2/3, img:"photo-1574017144578-85168ddb5040" },
  { cat:"weddings", moment:"Petals falling, garlands on", r:2/3, img:"photo-1633104502699-b2ecf0fee294" },
  { cat:"weddings", moment:"Saffron safa, a stolen smile", r:2/3, img:"photo-1733759414886-6b3a5423ceb3" },
  { cat:"weddings", moment:"Palace aisle, hand in hand", r:3/2, img:"photo-1756190564669-215843660e93" },
  { cat:"engagement", moment:"The ring slips on", r:2/3, img:"photo-1696224809463-7b520db9e758" },
  { cat:"engagement", moment:"On one knee, saree flying", r:3/2, img:"photo-1720105761843-18bf89dbb570" },
  { cat:"engagement", moment:"Under hanging jasmine strings", r:2/3, img:"photo-1744804298565-a25360f791ec" },
  { cat:"engagement", moment:"Golden hour, leaning in", r:2/3, img:"photo-1767790693205-c9f4df07a234" },
  { cat:"engagement", moment:"Foreheads touching at sunset", r:2/3, img:"photo-1761211488163-67bc659a8180" },
  { cat:"engagement", moment:"Lehenga and suit, old tree", r:2/3, img:"photo-1633685772450-948af3ac0121" },
  { cat:"ceremonies", moment:"Hands cupped over the aarti", r:2/3, img:"photo-1753621005126-3bd82fd927b2" },
  { cat:"ceremonies", moment:"Sacred thread, gently tied", r:3/2, img:"photo-1768341395921-93a8444e007e" },
  { cat:"ceremonies", moment:"Little one, first blessings", r:2/3, img:"photo-1677000247242-d00476a2e314" },
  { cat:"ceremonies", moment:"Half saree, shy smile", r:2/3, img:"photo-1757351122974-be385f9afe25" },
  { cat:"ceremonies", moment:"Silk and temple gold", r:2/3, img:"photo-1617627143750-d86bc21e42bb" },
  { cat:"ceremonies", moment:"Havan fire, rising flames", r:3/2, img:"photo-1646137148895-425961f5bcd9" },
  { cat:"ceremonies", moment:"Grandmother's lap, ritual begins", r:2/3, img:"photo-1632661702178-c7d75a2d86e6" },
  { cat:"kids", moment:"Little Krishna, all giggles", r:3/2, img:"photo-1597294150753-b6e790b68d1c" },
  { cat:"kids", moment:"Siblings at the balloon arch", r:3/2, img:"photo-1756621716318-9eec89d42715" },
  { cat:"kids", moment:"Cake smash, face first", r:3/2, img:"photo-1564228511783-821f2f547f44" },
  { cat:"kids", moment:"Crawling toward the camera", r:3/2, img:"photo-1610674632272-2d3e9a345453" },
  { cat:"kids", moment:"Big eyes, pink balloons", r:3/2, img:"photo-1652161908642-0e04c4474215" },
  { cat:"kids", moment:"Bath time, bangled hands", r:3/2, img:"photo-1780329926596-ab65a5c8f1d4" },
  { cat:"kids", moment:"Birthday boy, one balloon", r:2/3, img:"photo-1529347599731-ec02b259c9f0" }
].map((p,i)=>({ src:"", seed:100+i, ...p }));

const FILMS = {
  highlights: [
    { cat:"kids", title:"First birthday highlight", src:"", img:"photo-1589169011402-8b2cbd1ee593" },
    { cat:"weddings", title:"Wedding highlight film", src:"", img:"photo-1727430256509-0f897d6f4765" },
    { cat:"engagement", title:"Pre-wedding film", src:"", img:"photo-1735052712489-f45220126a0c" },
    { cat:"housewarming", title:"Family day highlight", src:"", img:"photo-1609253932702-796cbf3d3171" },
    { cat:"weddings", title:"Pheras, the full ceremony", src:"", img:"photo-1754782915842-aa4fca6c203a" },
    { cat:"engagement", title:"Ring ceremony highlight", src:"", img:"photo-1770823218239-996df9afcff0" },
    { cat:"ceremonies", title:"Half saree ceremony highlight", src:"", img:"photo-1703044412383-fa6b9884e802" },
    { cat:"ceremonies", title:"Havan and blessings", src:"", img:"photo-1641279676778-3c94588147fd" },
    { cat:"birthdays", title:"Fiftieth birthday highlight", src:"", img:"photo-1527529482837-4698179dc6ce" },
    { cat:"housewarming", title:"Griha pravesh highlight", src:"", img:"photo-1700544628901-523c8108d864" },
    { cat:"maternity", title:"Maternity film", src:"", img:"photo-1702360681796-6aa6d4f569f9" },
    { cat:"maternity", title:"Welcome home, little one", src:"", img:"photo-1543342384-1f1350e27861" },
    { cat:"corporate", title:"Conference highlight", src:"", img:"photo-1587825140708-dfaf72ae4b04" },
    { cat:"corporate", title:"Panel discussion recap", src:"", img:"photo-1582192730841-2a682d7375f9" }
  ],
  reels: [
    { cat:"weddings", title:"Bride and groom, thirty seconds", src:"", img:"photo-1722952934661-dde241aeb591" },
    { cat:"kids", title:"Little one, big day", src:"", img:"photo-1635770618588-06bd8d5d73b9" },
    { cat:"ceremonies", title:"Half saree reveal", src:"", img:"photo-1727430228383-aa1fb59db8bf" },
    { cat:"engagement", title:"The ring moment", src:"", img:"photo-1654156577076-e0350ba86cc1" },
    { cat:"birthdays", title:"Surprise party", src:"", img:"photo-1567122087721-47b09b61e1d1" },
    { cat:"corporate", title:"Annual day recap", src:"", img:"photo-1633358050629-bb6a292616ff" },
    { cat:"weddings", title:"Haldi morning", src:"", img:"photo-1681717166573-f71589207785" },
    { cat:"engagement", title:"Hilltop pre-wedding", src:"", img:"photo-1532712938310-34cb3982ef74" },
    { cat:"ceremonies", title:"Aarti in slow motion", src:"", img:"photo-1625072290979-cac544181be8" },
    { cat:"kids", title:"One today, party hat on", src:"", img:"photo-1734943598774-d0f20418a9a2" },
    { cat:"kids", title:"Little Krishna dress-up", src:"", img:"photo-1597430755294-d6e010d67279" },
    { cat:"birthdays", title:"Cake, candles, wish", src:"", img:"photo-1545696563-af8f6ec2295a" },
    { cat:"birthdays", title:"Sparkler entrance", src:"", img:"photo-1634535462955-91cf1a97122e" },
    { cat:"housewarming", title:"Rangoli, pinch by pinch", src:"", img:"photo-1700993714468-408700d3599e" },
    { cat:"housewarming", title:"The first lamp lit", src:"", img:"photo-1670943519416-aaca0212308b" },
    { cat:"maternity", title:"Bump to baby", src:"", img:"photo-1702360681320-b98ddd6ab13b" },
    { cat:"maternity", title:"Dad's first lift", src:"", img:"photo-1773243086594-43577199874f" },
    { cat:"corporate", title:"Launch night", src:"", img:"photo-1679579664878-2c025e3f87b0" }
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

// Polaroids on the line, just above the footer. title is written on the print,
// caption shows underneath. Set src to your own photo, or swap the Unsplash ID in img.
const GALLERY = [
  { cat:"weddings", title:"Under the mandap", caption:"Seven rounds, one long held breath.", src:"", img:"photo-1587271636175-90d58cdad458" },
  { cat:"weddings", title:"Mehendi hands", caption:"The night before, still drying.", src:"", img:"photo-1621801306185-8c0ccf9c8eb8" },
  { cat:"engagement", title:"Holding on", caption:"A pre-wedding walk, just the two of them.", src:"", img:"photo-1654156577076-e0350ba86cc1" },
  { cat:"ceremonies", title:"The first sari", caption:"Green and gold for the half saree ceremony.", src:"", img:"photo-1611106211090-8f3c79eb8552" },
  { cat:"kids", title:"Up in the air", caption:"First birthday, and the giggle we waited for.", src:"", img:"photo-1635770618588-06bd8d5d73b9" },
  { cat:"weddings", title:"Before the pheras", caption:"The bride, a quiet minute before it all.", src:"", img:"photo-1587271315307-eaebc181c749" },
  { cat:"housewarming", title:"A new home", caption:"Griha pravesh, the whole family together.", src:"", img:"photo-1659352790654-058e9077a4f4" },
  { cat:"maternity", title:"Week one", caption:"New parents, still learning the weight of it.", src:"", img:"photo-1657912230172-23f8b31665ed" },
  { cat:"birthdays", title:"Candles lit", caption:"Dinner table, everyone leaning in.", src:"", img:"photo-1653821355736-0c2598d0a63e" },
  { cat:"weddings", title:"Newlyweds", caption:"The first portrait as a married couple.", src:"", img:"photo-1743684821666-05b9c5046937" }
];

// The four "how a shoot works" steps in About, each paired with a print above.
const STEPS = [
  ["We talk","Tell us the occasion, the date and who absolutely has to be in the photos."],
  ["We plan","We map the rituals and timings with you, and with your planner if you have one."],
  ["We shoot","Photos and film side by side, without staging every moment."],
  ["You get the edit","Your photographs and films, ready to share with family and to keep."]
];

// Page text edited in the CMS, keyed like the data-cms attributes in the HTML.
// Filled by js/cms.js; empty means the text written in the HTML is kept.
const TEXTS = {};
