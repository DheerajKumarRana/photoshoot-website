/* =====================================================================
   CMS LOADER — pulls the live content from Supabase (edited at /admin)
   into the same globals content.js defines, then starts the page.
   Load order: content.js → cms-config.js → cms.js → the scripts named in data-next.
   If Supabase is slow or unreachable, the page runs on content.js as is.

   Supabase settings live in cms-config.js.
   ===================================================================== */
const CMS=(()=>{
  const me=document.currentScript,next=(me&&me.dataset.next||"").split(/\s+/).filter(Boolean);
  const headers={apikey:CMS_KEY,Authorization:`Bearer ${CMS_KEY}`};
  const root=document.documentElement;
  root.classList.add("cms-wait");

  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),3500);
  const get=q=>fetch(`${CMS_URL}/rest/v1/${q}`,{headers,signal:ctl.signal}).then(r=>r.ok?r.json():Promise.reject(new Error(`${q.split("?")[0]} ${r.status}`)));
  const pub="select=*&published=eq.true&order=sort.asc";
  Promise.all([get(`categories?${pub}`),get(`photos?${pub}`),get(`films?${pub}`),get(`gallery?${pub}`),get("site_settings?select=key,value")])
    .then(apply)
    .catch(e=>console.warn("CMS unavailable, showing content.js:",e.message||e))
    .finally(()=>{clearTimeout(timer);applyTexts();root.classList.remove("cms-wait");boot()});

  const fill=(arr,items)=>{arr.length=0;arr.push(...items)};
  function apply([cats,photos,films,gallery,settings]){
    if(cats.length){
      fill(CATS,cats.map(c=>({id:c.id,title:c.title,short:c.short||c.title,img:c.src||c.img||"",line:c.line||"",subs:c.subs||[]})));
      for(const k in CAT_PAGES)delete CAT_PAGES[k];
      cats.forEach(c=>CAT_PAGES[c.id]={lead:c.page_lead,accent:c.page_accent,tail:c.page_tail,text:c.page_text});
    }
    // Anything filed under a hidden or missing category stays off the site.
    const live=new Set(CATS.map(c=>c.id)),ok=r=>live.has(r.category_id);
    if(photos.length)fill(PHOTOS,photos.filter(ok).map((p,i)=>({cat:p.category_id,moment:p.moment||"",r:+p.ratio||1.5,img:p.src||p.img||"",src:p.src||"",seed:100+i})));
    if(films.length){
      const f=films.filter(ok).map(f=>({cat:f.category_id,kind:f.kind,title:f.title,src:f.src||"",poster:f.poster||"",img:f.img||""}));
      fill(FILMS.highlights,f.filter(x=>x.kind==="highlight"));fill(FILMS.reels,f.filter(x=>x.kind==="reel"));
    }
    if(gallery.length)fill(GALLERY,gallery.filter(g=>!g.category_id||ok(g)).map(g=>({cat:g.category_id||CATS[0].id,title:g.title,caption:g.caption,src:g.src||"",img:g.img||""})));

    const S=Object.fromEntries(settings.map(s=>[s.key,s.value]));
    if(S.contact)Object.assign(CONFIG,S.contact);
    if(S.team)Object.assign(TEAM,S.team);
    if(S.prints&&S.prints.length)fill(PRINTS,S.prints.filter(p=>live.has(p.cat)));
    if(S.steps&&S.steps.length)fill(STEPS,S.steps.map(s=>[s.title,s.text]));
    if(S.texts)Object.assign(TEXTS,S.texts);
    // The hero always deals 20 cards; a shorter list repeats.
    const hero=(S.hero||[]).filter(h=>live.has(h.cat)&&h.img);
    if(hero.length)fill(HERO,Array.from({length:20},(_,i)=>[hero[i%hero.length].cat,hero[i%hero.length].img]));
  }

  function applyTexts(){
    document.querySelectorAll("[data-cms]").forEach(el=>{const v=TEXTS[el.dataset.cms];if(typeof v==="string"&&v.trim())el.textContent=v});
  }

  function boot(){
    for(const src of next){const s=document.createElement("script");s.src=src;s.async=false;document.body.appendChild(s)}
  }

  // Saves an enquiry for the Enquiries inbox in /admin. Never blocks the
  // WhatsApp hand-off: a failure here only means it isn't logged.
  function enquire(row){
    return fetch(`${CMS_URL}/rest/v1/enquiries`,{method:"POST",keepalive:true,
      headers:{...headers,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(row)})
      .catch(()=>{});
  }
  return {enquire};
})();
