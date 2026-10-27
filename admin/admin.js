/* =====================================================================
   VISTAAR CMS — the website editor at /admin.
   Signs in with Supabase Auth; only users listed in the admins table can
   change anything (the database rules enforce it, not this file).
   Every save goes straight to Supabase and is live on the next page load.

   Pages: Home page (each section's text and photos), Category pages
   (one per occasion: wording, cover, photos, films), Contact & social,
   Enquiries. Text left empty falls back to what's written in the HTML.
   ===================================================================== */
const sb=supabase.createClient(CMS_URL,CMS_KEY);
const $=(s,r=document)=>r.querySelector(s);
function h(tag,attrs,...kids){
  const el=document.createElement(tag);
  for(const[k,v]of Object.entries(attrs||{})){
    if(v==null||v===false)continue;
    if(k.startsWith("on"))el.addEventListener(k.slice(2),v);
    else if(k==="class")el.className=v;
    else el.setAttribute(k,v===true?"":v);
  }
  for(const c of kids.flat())if(c!=null&&c!==false)el.append(c.nodeType?c:String(c));
  return el;
}

const S={cats:[],photos:[],films:[],gallery:[],set:{},enq:[]};
const DEF={texts:{
  "recent.introPhoto":"Stills from recent shoots across every occasion we cover. Pick a category, or open any photo to see it full screen.",
  "recent.introFilm":"Event highlights to watch with the family, and short reels cut for Instagram and WhatsApp. Open any film to play it."
}};

/* ---------- Feedback ---------- */
let toastT;
function toast(msg,bad){const t=$("#toast");t.textContent=msg;t.className="toast on"+(bad?" bad":"");clearTimeout(toastT);toastT=setTimeout(()=>t.className="toast",bad?7000:2200)}
async function q(p){const r=await p;if(r.error)throw new Error(r.error.message);return r.data}
async function run(fn,msg="Saved"){
  try{const v=await fn();if(msg)toast(msg);return v}
  catch(e){console.error(e);toast(e.message||String(e),true)}
}

/* ---------- Sign in ---------- */
function showLogin(msg=""){$("#app").hidden=true;$("#login").hidden=false;$("#lgMsg").textContent=msg}
$("#loginForm").addEventListener("submit",async e=>{
  e.preventDefault();const btn=$("#lgBtn");btn.disabled=true;$("#lgMsg").textContent="";
  const{error}=await sb.auth.signInWithPassword({email:$("#lgEmail").value.trim(),password:$("#lgPass").value});
  btn.disabled=false;
  if(error)return showLogin(error.message==="Invalid login credentials"?"That email and password don't match.":error.message);
  start();
});
$("#signOut").addEventListener("click",async()=>{await sb.auth.signOut();location.hash="";location.reload()});

async function start(){
  const{data:{session}}=await sb.auth.getSession();
  if(!session)return showLogin();
  const{data:isAdmin}=await sb.rpc("is_admin");
  if(!isAdmin){
    await sb.auth.signOut();
    return showLogin(`${session.user.email} can sign in but isn't an editor. On your computer, run: npm run admin -- ${session.user.email}`);
  }
  $("#who").textContent=session.user.email;
  try{await loadAll()}catch(e){return showLogin("Couldn't load the content: "+e.message)}
  $("#login").hidden=true;$("#app").hidden=false;
  route();
}

async function loadAll(){
  const[cats,photos,films,gallery,set,enq]=await Promise.all([
    q(sb.from("categories").select("*").order("sort")),
    q(sb.from("photos").select("*").order("sort")),
    q(sb.from("films").select("*").order("sort")),
    q(sb.from("gallery").select("*").order("sort")),
    q(sb.from("site_settings").select("key,value")),
    q(sb.from("enquiries").select("*").order("created_at",{ascending:false}).limit(500))
  ]);
  Object.assign(S,{cats,photos,films,gallery,enq,set:Object.fromEntries(set.map(s=>[s.key,s.value]))});
  // The original wording of every editable text, read from the pages themselves.
  await Promise.all(["index.html","category.html"].map(async page=>{
    try{
      const doc=new DOMParser().parseFromString(await(await fetch(page,{cache:"no-store"})).text(),"text/html");
      doc.querySelectorAll("[data-cms]").forEach(el=>{DEF.texts[el.dataset.cms]??=el.textContent.trim().replace(/\s+/g," ")});
    }catch{}
  }));
}

/* ---------- Layout ---------- */
const side=$("#side");
$("#menu").addEventListener("click",()=>side.classList.add("open"));
$("#sideClose").addEventListener("click",()=>side.classList.remove("open"));
addEventListener("hashchange",()=>{if(!$("#app").hidden)route()});

function renderNav(){
  const cur=location.hash||"#home",nNew=S.enq.filter(e=>e.status==="new").length;
  const items=[["#home","Home page"],["#cats","Category pages"],
    ...S.cats.map(c=>[`#cat/${c.id}`,c.title,"sub",!c.published]),
    ["#contact","Contact & social"],["#enquiries","Enquiries",null,false,nNew]];
  $("#sideNav").replaceChildren(...items.map(([href,label,cls,hidden,badge])=>
    h("a",{href,class:[cls,cur===href?"on":""].filter(Boolean).join(" ")},h("span",{},label),hidden&&h("em",{},"hidden"),badge>0&&h("b",{},badge))));
}
function route(){
  const[r,arg]=(location.hash||"#home").slice(1).split("/");
  side.classList.remove("open");renderNav();$("#view").replaceChildren();scrollTo(0,0);
  if(r==="cat"&&S.cats.some(c=>c.id===arg))pageCat(arg);
  else if(r==="cats")pageCats();
  else if(r==="contact")pageContact();
  else if(r==="enquiries")pageEnq();
  else pageHome();
}
function head(crumb,title,view){
  $("#crumb").textContent=crumb;$("#pageTitle").textContent=title;document.title=`${title} · Vistaar CMS`;
  const a=$("#viewPage");a.hidden=!view;if(view)a.href=view;
}
const add=(...els)=>$("#view").append(...els);

/* ---------- Small building blocks ---------- */
const card=(title,hint,...body)=>h("section",{class:"card"},h("div",{class:"card-h"},h("h2",{},title),hint&&h("p",{},hint)),...body);
const field=(label,input,help)=>h("label",{class:"fld"},h("span",{class:"fld-l"},label),input,help&&h("small",{},help));
function inp(value,rows){const el=rows?h("textarea",{rows}):h("input",{type:"text"});el.value=value??"";return el}
const thumb=v=>v?US(v,480):"";
function catSelect(value,onChange,none){
  const s=h("select",{},none&&h("option",{value:""},none),...S.cats.map(c=>h("option",{value:c.id},c.title)));
  s.value=value||"";s.addEventListener("change",()=>onChange(s.value||null));return s;
}
function pubToggle(on,onChange){
  const c=h("input",{type:"checkbox"});c.checked=!!on;c.addEventListener("change",()=>onChange(c.checked));
  return h("label",{class:"pub",title:"Show this on the website"},c,h("span",{},"On site"));
}
function tools(i,n,move,del){
  return h("div",{class:"tools"},
    h("button",{type:"button",class:"ic",title:"Move earlier",disabled:i===0,onclick:()=>move(-1)},"←"),
    h("button",{type:"button",class:"ic",title:"Move later",disabled:i===n-1,onclick:()=>move(1)},"→"),
    h("button",{type:"button",class:"ic del",title:"Delete",onclick:del},"✕"));
}
function saveBtn(label,fn){
  const b=h("button",{type:"button",class:"btn primary"},label);
  b.addEventListener("click",async()=>{b.disabled=true;await run(fn);b.disabled=false;b.classList.remove("dirty")});
  return b;
}
// Marks a Save button as having unsaved changes when anything in `scope` is edited.
const watch=(scope,btn)=>scope.addEventListener("input",()=>btn.classList.add("dirty"));
async function saveSet(key,value){
  await q(sb.from("site_settings").upsert({key,value,updated_at:new Date().toISOString()}));
  S.set[key]=value;
}

/* ---------- Uploads (public "media" bucket) ---------- */
const BUCKET_URL=`${CMS_URL}/storage/v1/object/public/media/`;
const fileName=ext=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}.${ext}`;
// Photos are resized to at most 2400px on the long side and saved as WebP.
async function uploadImage(file,folder){
  if(!/^image\//.test(file.type))throw new Error(`${file.name} isn't an image.`);
  const bmp=await createImageBitmap(file),k=Math.min(1,2400/Math.max(bmp.width,bmp.height));
  const c=h("canvas");c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);
  c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);
  const blob=await new Promise(r=>c.toBlob(r,"image/webp",.86));
  const type=blob?"image/webp":file.type,path=`${folder}/${fileName(blob?"webp":file.name.split(".").pop())}`;
  await q(sb.storage.from("media").upload(path,blob||file,{contentType:type,cacheControl:"31536000"}));
  return{url:BUCKET_URL+path,w:c.width,h:c.height};
}
async function uploadVideo(file,folder){
  if(!/^video\/(mp4|webm)$/.test(file.type))throw new Error("Videos must be MP4 or WebM files.");
  if(file.size>100*1024*1024)throw new Error(`${file.name} is ${(file.size/1048576).toFixed(0)} MB. The limit is 100 MB; export a smaller version.`);
  const path=`${folder}/${fileName(file.type.split("/")[1])}`;
  await q(sb.storage.from("media").upload(path,file,{contentType:file.type,cacheControl:"31536000"}));
  return BUCKET_URL+path;
}
// Removes an uploaded file that nothing uses any more. Stock photos are left alone.
function dropFile(url){if(url&&url.startsWith(BUCKET_URL))sb.storage.from("media").remove([url.slice(BUCKET_URL.length)])}

function filePick(accept,multiple,onFiles,label,cls="btn sm"){
  const fi=h("input",{type:"file",accept,hidden:true,multiple});
  const b=h("button",{type:"button",class:cls,onclick:()=>fi.click()},label);
  fi.addEventListener("change",async()=>{
    const files=[...fi.files];fi.value="";if(!files.length)return;
    b.disabled=true;
    try{await onFiles(files,t=>b.textContent=t)}catch(e){toast(e.message,true)}
    b.disabled=false;b.textContent=label;
  });
  return h("span",{},b,fi);
}
const IMG_TYPES="image/jpeg,image/png,image/webp,image/avif";
// A photo with a Replace button. onPick receives {url,w,h} after upload.
function imgPick(value,folder,onPick,ratio="4/3"){
  const img=h("img",{alt:"",src:thumb(value)||null,loading:"lazy"});
  return h("div",{class:"pick"},h("div",{class:"pick-img",style:`aspect-ratio:${ratio}`},img),
    filePick(IMG_TYPES,false,async([f],say)=>{say("Uploading…");const up=await uploadImage(f,folder);img.src=up.url;await onPick(up)},"Replace photo"));
}

/* ---------- Text blocks (site_settings.texts) ---------- */
function textsForm(fields){
  const T=S.set.texts||{};
  const rows=fields.map(([k,label,lines])=>{const el=inp(T[k]||DEF.texts[k]||"",lines);el.placeholder=DEF.texts[k]||"";return[k,field(label,el),el]});
  const btn=saveBtn("Save text",async()=>{
    const next={...(S.set.texts||{})};
    for(const[k,,el]of rows){const v=el.value.trim();if(!v||v===DEF.texts[k])delete next[k];else next[k]=v}
    await saveSet("texts",next);
  });
  const box=h("div",{class:"fields"},...rows.map(r=>r[1]),h("div",{class:"actions"},btn,h("small",{class:"muted"},"Clear a box to go back to the original wording.")));
  watch(box,btn);return box;
}

/* ---------- Lists kept in site_settings (hero, prints, steps) ---------- */
function listEditor({key,items,fields,folder,max=99,addLabel,blank={}}){
  const list=items.map(x=>({...x}));
  const wrap=h("div",{class:"tiles"});
  const btn=saveBtn("Save changes",()=>saveSet(key,list));
  const dirty=()=>btn.classList.add("dirty");
  const control=(f,it)=>{
    if(f.type==="img")return imgPick(it[f.k],folder,up=>{it[f.k]=up.url;dirty()},f.ratio);
    if(f.type==="cat")return field(f.label,catSelect(it[f.k],v=>{it[f.k]=v;dirty()}));
    const el=inp(it[f.k],f.rows);el.addEventListener("input",()=>{it[f.k]=el.value;dirty()});return field(f.label,el);
  };
  const draw=()=>{
    wrap.replaceChildren(...list.map((it,i)=>h("div",{class:"tile"},h("span",{class:"num"},i+1),...fields.map(f=>control(f,it)),
      tools(i,list.length,d=>{[list[i],list[i+d]]=[list[i+d],list[i]];dirty();draw()},()=>{list.splice(i,1);dirty();draw()}))));
    if(list.length<max)wrap.append(h("div",{class:"tile add"},folder
      ?filePick(IMG_TYPES,true,async(files,say)=>{for(const[n,f]of files.slice(0,max-list.length).entries()){say(`Uploading ${n+1} of ${files.length}…`);list.push({...blank,img:(await uploadImage(f,folder)).url})}dirty();draw()},addLabel,"btn")
      :h("button",{type:"button",class:"btn",onclick:()=>{list.push({...blank});dirty();draw()}},addLabel)));
  };
  draw();
  return h("div",{},wrap,h("div",{class:"actions"},btn));
}

/* ---------- Rows in a table (photos, films, gallery): saved as you go ---------- */
const upd=(table,row,patch,msg="Saved")=>run(async()=>{await q(sb.from(table).update(patch).eq("id",row.id));Object.assign(row,patch)},msg);
function bound(table,row,k,label,rows){
  const el=inp(row[k],rows);el.addEventListener("change",()=>upd(table,row,{[k]:el.value.trim()}));return field(label,el);
}
async function reorder(table,L,i,d,redraw){
  [L[i],L[i+d]]=[L[i+d],L[i]];
  const changed=L.map((r,k)=>[r,k]).filter(([r,k])=>r.sort!==k);
  changed.forEach(([r,k])=>r.sort=k);redraw();
  await run(()=>Promise.all(changed.map(([r,k])=>q(sb.from(table).update({sort:k}).eq("id",r.id)))),"Order saved");
}
// `list` is the key in S that holds the rows (the same as the table, except enquiries).
async function removeRow(table,row,what,redraw,files=[],list=table){
  if(!confirm(`Delete this ${what}? This can't be undone.`))return;
  await run(async()=>{await q(sb.from(table).delete().eq("id",row.id));S[list]=S[list].filter(r=>r!==row);files.forEach(dropFile);redraw()},"Deleted");
}
const firstSort=L=>L.length?Math.min(...L.map(r=>r.sort))-1:0;
const lastSort=L=>L.length?Math.max(...L.map(r=>r.sort))+1:0;

/* =====================================================================
   HOME PAGE — one card per section, top to bottom as on the site.
   ===================================================================== */
function pageHome(){
  head("Page","Home page","index.html");
  const hero=S.set.hero||HERO.map(([cat,img])=>({cat,img}));
  const steps=S.set.steps||STEPS.map(([title,text])=>({title,text}));
  const team=S.set.team||TEAM;
  add(
    h("p",{class:"lead"},"Sections are in the order they appear on the home page. Changes are live as soon as you save; refresh the website to see them."),
    card("1 · Hero","The opening animation and headline. The photo cards fly in and form a circle; tapping one opens its category.",
      textsForm([["hero.intro","Opening line"],["hero.cue","Scroll prompt"],["hero.title","Main heading",2],["hero.text","Paragraph",3]]),
      h("h3",{},"Hero photo cards"),h("p",{class:"muted"},"Up to 20. With fewer, the cards repeat. The category decides where a tap leads."),
      listEditor({key:"hero",items:hero,folder:"hero",max:20,addLabel:"+ Add photos",blank:{cat:S.cats[0]?.id},
        fields:[{k:"img",type:"img",ratio:"3/4"},{k:"cat",type:"cat",label:"Category"}]})),
    card("2 · “Every moment” strip","The big lettering under the hero, with two short notes.",
      textsForm([["manifesto.note1","Left note",2],["manifesto.note2","Right note",2]])),
    card("3 · What we shoot (wheel)","The turning wheel of categories. Category names, lines and covers are edited on each category page.",
      textsForm([["wheel.label","Label"],["wheel.hint","Scroll hint"]]),
      h("a",{class:"btn sm",href:"#cats"},"Edit categories →")),
    card("4 · About","Heading, paragraph, and the steps of how a shoot works. Each step is paired with the print at the same number.",
      textsForm([["about.title","Heading",2],["about.text","Paragraph",4],["about.hint","Hint under the steps"]]),
      h("h3",{},"Steps"),
      listEditor({key:"steps",items:steps,max:6,addLabel:"+ Add a step",blank:{title:"",text:""},
        fields:[{k:"title",label:"Step"},{k:"text",label:"Description",rows:3}]}),
      h("h3",{},"Prints next to the steps"),
      listEditor({key:"prints",items:S.set.prints||PRINTS,folder:"prints",max:6,addLabel:"+ Add prints",blank:{cat:S.cats[0]?.id,caption:""},
        fields:[{k:"img",type:"img",ratio:"1/1"},{k:"caption",label:"Caption"},{k:"cat",type:"cat",label:"Category"}]})),
    card("5 · Team photo","The frosted photo visitors wipe clear.",
      textsForm([["team.title","Heading"],["team.text","Paragraph",2],["team.hint","Hint"]]),
      teamEditor(team)),
    card("6 · Recent work","The 3D photo wall. Its photos and films come from the category pages.",
      textsForm([["recent.bigTitle","Big title"],["recent.bigText","Line under the big title"],["recent.title","Heading"],
        ["recent.introPhoto","Intro on the Photography tab",3],["recent.introFilm","Intro on the Films tab",3]])),
    card("7 · Films & reels","Films are added on each category page. The first event highlight is the large feature here.",
      textsForm([["films.title","Heading"],["films.text","Paragraph",2]])),
    card("8 · Enquiry form","Phone, WhatsApp and email come from Contact & social. Every enquiry also lands in Enquiries.",
      textsForm([["enquire.title","Heading"],["enquire.text","Paragraph",2]])),
    card("9 · Polaroid gallery","The prints pegged on a line, just above the footer.",
      textsForm([["gallery.title","Heading"],["gallery.text","Paragraph",2]]),
      galleryEditor()),
    card("10 · Footer","Shown on every page.",
      textsForm([["footer.tag","Tagline under the logo",2],["footer.strip","Line at the very bottom"]]))
  );
}

function teamEditor(team){
  const t={...team};
  const alt=inp(t.alt);
  const btn=saveBtn("Save team photo",()=>saveSet("team",{...t,alt:alt.value.trim()}));
  const box=h("div",{class:"row2"},
    imgPick(t.src||t.img,"team",up=>{t.src=up.url;btn.classList.add("dirty")},"16/9"),
    h("div",{class:"fields"},field("Photo description (for screen readers)",alt),h("div",{class:"actions"},btn)));
  watch(box,btn);return box;
}

function galleryEditor(){
  const wrap=h("div",{class:"tiles"});
  const L=()=>S.gallery.slice().sort((a,b)=>a.sort-b.sort);
  const draw=()=>{const list=L();wrap.replaceChildren(...list.map((g,i)=>h("div",{class:"tile"+(g.published?"":" off")},
    imgPick(g.src||g.img,"gallery",up=>{const old=g.src;return upd("gallery",g,{src:up.url},"Photo replaced").then(()=>dropFile(old))},"1/1"),
    bound("gallery",g,"title","Written on the print"),bound("gallery",g,"caption","Caption",2),
    field("Category",catSelect(g.category_id,v=>upd("gallery",g,{category_id:v}),"— none —")),
    h("div",{class:"tile-foot"},pubToggle(g.published,v=>upd("gallery",g,{published:v},v?"Shown on site":"Hidden").then(draw)),
      tools(i,list.length,d=>reorder("gallery",list,i,d,draw),()=>removeRow("gallery",g,"print",draw,[g.src]))))),
    h("div",{class:"tile add"},filePick(IMG_TYPES,true,async(files,say)=>{
      for(const[n,f]of files.entries()){say(`Uploading ${n+1} of ${files.length}…`);const up=await uploadImage(f,"gallery");
        S.gallery.push(await q(sb.from("gallery").insert({title:"",caption:"",src:up.url,sort:lastSort(S.gallery),published:true}).select().single()))}
      toast("Added");draw()},"+ Add prints","btn")))};
  draw();return wrap;
}

/* =====================================================================
   CATEGORY PAGES
   ===================================================================== */
function pageCats(){
  head("Pages","Category pages",null);
  const list=h("div",{class:"cat-list"});
  const draw=()=>{
    const L=S.cats.slice().sort((a,b)=>a.sort-b.sort);
    list.replaceChildren(...L.map((c,i)=>{
      const n=S.photos.filter(p=>p.category_id===c.id).length,f=S.films.filter(x=>x.category_id===c.id).length;
      return h("div",{class:"cat-row"+(c.published?"":" off")},
        h("img",{alt:"",src:thumb(c.src||c.img)||null,loading:"lazy"}),
        h("div",{},h("strong",{},c.title),h("small",{},`${n} photos · ${f} films${c.published?"":" · hidden"}`)),
        h("div",{class:"tools"},
          h("button",{type:"button",class:"ic",title:"Move up",disabled:i===0,onclick:()=>reorder("categories",L,i,-1,()=>{draw();renderNav()})},"↑"),
          h("button",{type:"button",class:"ic",title:"Move down",disabled:i===L.length-1,onclick:()=>reorder("categories",L,i,1,()=>{draw();renderNav()})},"↓")),
        h("a",{class:"btn sm",href:`#cat/${c.id}`},"Edit"));
    }));
  };
  draw();
  const name=inp("");name.placeholder="e.g. Naming Ceremony";
  const addBtn=h("button",{type:"button",class:"btn primary",onclick:()=>run(async()=>{
    const title=name.value.trim();if(!title)throw new Error("Type a name for the new category.");
    const id=title.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    if(S.cats.some(c=>c.id===id))throw new Error("A category with that name already exists.");
    const row=await q(sb.from("categories").insert({id,title,short:title,line:"",sort:lastSort(S.cats),published:false,page_lead:title}).select().single());
    S.cats.push(row);location.hash=`#cat/${id}`;
  },"Category added. It stays hidden until you switch it on.")},"Add category");
  add(
    h("p",{class:"lead"},"Each occasion has its own page on the site (category.html#name) and a slot on the home page wheel. The order here is the order on the wheel."),
    card("Categories",null,list),
    card("Add a category","It starts hidden, so you can add its photos before it goes live.",h("div",{class:"inline"},name,addBtn)),
    card("Shared on every category page",null,
      textsForm([["category.moreTitle","“More occasions” heading"],["category.moreText","“More occasions” paragraph",2],["category.filmNote","Note when a category has no films yet",2]]))
  );
}

function pageCat(id){
  const c=S.cats.find(x=>x.id===id);
  head("Category page",c.title,`category.html#${encodeURIComponent(c.id)}`);
  add(basicsCard(c),photosCard(c),filmsCard(c));
}

function basicsCard(c){
  const f={};
  const mk=(k,label,rows,help)=>{f[k]=inp(Array.isArray(c[k])?c[k].join(", "):c[k],rows);return field(label,f[k],help)};
  let cover=null;
  const preview=h("p",{class:"preview"});
  const paint=()=>preview.replaceChildren(f.page_lead.value+" ",h("em",{},f.page_accent.value)," "+f.page_tail.value);
  const pub=h("input",{type:"checkbox"});pub.checked=c.published;
  const btn=saveBtn("Save page",async()=>{
    const patch={title:f.title.value.trim(),short:f.short.value.trim()||f.title.value.trim(),line:f.line.value.trim(),
      subs:f.subs.value.split(",").map(s=>s.trim()).filter(Boolean),
      page_lead:f.page_lead.value.trim(),page_accent:f.page_accent.value.trim(),page_tail:f.page_tail.value.trim(),page_text:f.page_text.value.trim(),
      published:pub.checked,updated_at:new Date().toISOString()};
    if(!patch.title)throw new Error("The category needs a name.");
    if(cover){if(c.src!==cover)dropFile(c.src);patch.src=cover}
    await q(sb.from("categories").update(patch).eq("id",c.id));Object.assign(c,patch);
    renderNav();head("Category page",c.title,`category.html#${encodeURIComponent(c.id)}`);
  });
  const box=h("div",{},
    h("div",{class:"row2"},
      h("div",{},h("p",{class:"fld-l"},"Cover photo (wheel and “more occasions”)"),imgPick(c.src||c.img,`covers/${c.id}`,up=>{cover=up.url;btn.classList.add("dirty")},"4/5")),
      h("div",{class:"fields"},mk("title","Name"),mk("short","Short name (buttons and filters)"),
        mk("line","One-line description (wheel)",2),mk("subs","Occasions covered",null,"Separate with commas. Shown under the name on the wheel."),
        h("label",{class:"pub big"},pub,h("span",{},"Show this category on the website")))),
    h("h3",{},"Page heading"),
    h("p",{class:"muted"},"The heading reads in three parts; the middle part is in gold."),
    preview,
    h("div",{class:"grid3"},mk("page_lead","Start"),mk("page_accent","Gold middle"),mk("page_tail","End")),
    h("div",{class:"fields"},mk("page_text","Paragraph under the heading",3)),
    h("div",{class:"actions"},btn));
  paint();box.addEventListener("input",()=>{paint();btn.classList.add("dirty")});
  return card("Name, cover and heading",null,box);
}

function photosCard(c){
  const wrap=h("div",{class:"tiles photos"}),count=h("span",{class:"count"});
  const L=()=>S.photos.filter(p=>p.category_id===c.id).sort((a,b)=>a.sort-b.sort);
  const draw=()=>{const list=L();count.textContent=`${list.length} photos`;
    wrap.replaceChildren(...list.map((p,i)=>h("div",{class:"tile"+(p.published?"":" off")},
      imgPick(p.src||p.img,`photos/${c.id}`,up=>{const old=p.src;return upd("photos",p,{src:up.url,ratio:+(up.w/up.h).toFixed(3)},"Photo replaced").then(()=>dropFile(old))},"4/3"),
      bound("photos",p,"moment","Caption"),
      h("div",{class:"tile-foot"},pubToggle(p.published,v=>upd("photos",p,{published:v},v?"Shown on site":"Hidden").then(draw)),
        tools(i,list.length,d=>reorder("photos",list,i,d,draw),()=>removeRow("photos",p,"photo",draw,[p.src]))))))};
  const upload=filePick(IMG_TYPES,true,async(files,say)=>{
    for(const[n,f]of files.entries()){
      say(`Uploading ${n+1} of ${files.length}…`);const up=await uploadImage(f,`photos/${c.id}`);
      S.photos.push(await q(sb.from("photos").insert({category_id:c.id,moment:"",ratio:+(up.w/up.h).toFixed(3),src:up.url,sort:firstSort(L()),published:true}).select().single()));
      draw();
    }
    toast(`${files.length} photo${files.length>1?"s":""} added`);
  },"+ Upload photos","btn primary");
  draw();
  return card("Photos","Shown in this page’s grid and in Recent work on the home page. New uploads go first; use the arrows to reorder. Large photos are resized automatically.",
    h("div",{class:"inline"},upload,count),wrap);
}

function filmsCard(c){
  const wrap=h("div",{class:"tiles films"});
  const L=()=>S.films.filter(f=>f.category_id===c.id).sort((a,b)=>a.sort-b.sort);
  const draw=()=>{const list=L();
    wrap.replaceChildren(...list.map((f,i)=>{
      const kind=h("select",{},h("option",{value:"highlight"},"Event highlight (wide)"),h("option",{value:"reel"},"Reel (vertical)"));
      kind.value=f.kind;kind.addEventListener("change",()=>upd("films",f,{kind:kind.value}));
      const vid=h("p",{class:"muted vid"},f.src?h("a",{href:f.src,target:"_blank",rel:"noopener"},"▶ Video attached"):"No video yet: it shows as a still photo.");
      const link=inp(f.src);link.placeholder="https://…/film.mp4";
      link.addEventListener("change",()=>upd("films",f,{src:link.value.trim()||null}).then(draw));
      return h("div",{class:"tile"+(f.published?"":" off")},
        imgPick(f.poster||f.img,`films/${c.id}`,up=>{const old=f.poster;return upd("films",f,{poster:up.url},"Poster replaced").then(()=>dropFile(old))},f.kind==="reel"?"9/16":"16/9"),
        bound("films",f,"title","Title"),field("Type",kind),vid,
        filePick("video/mp4,video/webm",false,async([file],say)=>{say("Uploading video… (this can take a minute)");const url=await uploadVideo(file,`films/${c.id}`);
          const old=f.src;await upd("films",f,{src:url},"Video uploaded");dropFile(old);draw()},f.src?"Replace video":"Upload video (MP4)"),
        field("…or a direct link to a video file",link,"Must end in .mp4 or .webm. YouTube links won't play here."),
        h("div",{class:"tile-foot"},pubToggle(f.published,v=>upd("films",f,{published:v},v?"Shown on site":"Hidden").then(draw)),
          tools(i,list.length,d=>reorder("films",list,i,d,draw),()=>removeRow("films",f,"film",draw,[f.src,f.poster]))));
    }),
    h("div",{class:"tile add"},h("button",{type:"button",class:"btn",onclick:()=>run(async()=>{
      S.films.push(await q(sb.from("films").insert({category_id:c.id,kind:"highlight",title:"New film",sort:lastSort(S.films),published:false}).select().single()));draw();
    },"Film added (hidden until you switch it on)")},"+ Add a film")))};
  draw();
  return card("Films","Event highlights are wide films; reels are vertical. Add a poster photo and the video file, then switch it on.",wrap);
}

/* =====================================================================
   CONTACT & SOCIAL
   ===================================================================== */
function pageContact(){
  head("Settings","Contact & social","index.html#enquire");
  const v={...CONFIG,...(S.set.contact||{})},f={};
  const mk=(k,label,help,ph)=>{f[k]=inp(v[k]);if(ph)f[k].placeholder=ph;return field(label,f[k],help)};
  const btn=saveBtn("Save contact details",async()=>{
    const next={...v};for(const k in f)next[k]=f[k].value.trim();
    next.whatsapp=next.whatsapp.replace(/\D/g,"");
    if(next.whatsapp&&next.whatsapp.length<11)throw new Error("Give the WhatsApp number with the country code, e.g. 919876543210.");
    await saveSet("contact",next);f.whatsapp.value=next.whatsapp;
  });
  const box=h("div",{class:"fields"},
    mk("whatsapp","WhatsApp number","Country code and number, digits only. The enquiry form sends messages here.","919876543210"),
    mk("phone","Phone number (shown on the site)",null,"+91 98765 43210"),
    mk("email","Email",null,"hello@vistaarcontent.com"),
    mk("instagram","Instagram link","Leave empty to hide.","https://instagram.com/…"),
    mk("youtube","YouTube link","Leave empty to hide.","https://youtube.com/@…"),
    mk("facebook","Facebook link","Leave empty to hide.","https://facebook.com/…"),
    mk("city","City",null,"Hyderabad"),
    mk("mapsUrl","Google Maps link",null,"https://maps.app.goo.gl/…"),
    h("div",{class:"actions"},btn));
  watch(box,btn);
  add(card("Contact details","Used by the enquiry form, the footer and the contact links.",box));
}

/* =====================================================================
   ENQUIRIES
   ===================================================================== */
const STATUS={new:"New",contacted:"Contacted",booked:"Booked",closed:"Closed"};
function pageEnq(){
  head("Inbox","Enquiries",null);
  const list=h("div",{class:"enq-list"});
  let filter="open";
  const filters=h("div",{class:"seg"});
  const draw=()=>{
    const rows=S.enq.filter(e=>filter==="all"||(filter==="open"?e.status==="new"||e.status==="contacted":e.status===filter));
    filters.replaceChildren(...[["open","Open"],["new","New"],["booked","Booked"],["closed","Closed"],["all","All"]].map(([k,l])=>
      h("button",{type:"button",class:filter===k?"on":"",onclick:()=>{filter=k;draw()}},l)));
    list.replaceChildren(...(rows.length?rows.map(e=>{
      const st=h("select",{class:"st st-"+e.status},...Object.entries(STATUS).map(([k,l])=>h("option",{value:k},l)));
      st.value=e.status;
      st.addEventListener("change",()=>upd("enquiries",e,{status:st.value},"Status updated").then(()=>{renderNav();draw()}));
      const digits=e.phone.replace(/\D/g,""),wa=digits.length===10?"91"+digits:digits;
      return h("article",{class:"enq"},
        h("div",{class:"enq-h"},h("strong",{},e.name),st),
        h("p",{class:"enq-meta"},[e.occasion,e.event_date&&new Date(e.event_date+"T00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}),e.city].filter(Boolean).join(" · ")||"No details given"),
        e.message&&h("p",{class:"enq-msg"},e.message),
        h("div",{class:"enq-foot"},
          h("a",{class:"btn sm",href:`https://wa.me/${wa}`,target:"_blank",rel:"noopener"},"WhatsApp"),
          h("a",{class:"btn sm ghost",href:`tel:${e.phone.replace(/[^+\d]/g,"")}`},e.phone),
          h("small",{class:"muted"},"Received "+new Date(e.created_at).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})),
          h("button",{type:"button",class:"ic del",title:"Delete",onclick:()=>removeRow("enquiries",e,"enquiry",()=>{renderNav();draw()},[],"enq")},"✕")));
    }):[h("p",{class:"empty"},"Nothing here.")]));
  };
  const refresh=h("button",{type:"button",class:"btn sm",onclick:()=>run(async()=>{
    S.enq=await q(sb.from("enquiries").select("*").order("created_at",{ascending:false}).limit(500));renderNav();draw()},"Up to date")},"Refresh");
  draw();
  add(h("p",{class:"lead"},"Every message sent through the website’s enquiry form, newest first. The visitor is also taken to WhatsApp to send it to you."),
    h("div",{class:"inline"},filters,refresh),list);
}

start();
