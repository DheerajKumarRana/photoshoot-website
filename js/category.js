/* =====================================================================
   CATEGORY PAGE — one template for every occasion: category.html#<id>
   (#<id>/films opens on films). A hash rather than ?c= because static
   hosts' clean-URL redirects can drop the query string. Copy comes from CAT_PAGES, photos
   from PHOTOS and films from FILMS, all in content.js.
   The gallery is a port of animated-gallery.tsx: a 350vh scroll track
   with a sticky stage. The three-column grid starts tipped back 75° and
   stands up over the first half of the scroll, then settles from 1.2x
   to 1x while the columns drift against each other. The heading blurs
   in line by line, like ContainerStagger / ContainerAnimated.
   ===================================================================== */
(function(){
const [cid,view]=decodeURIComponent(location.hash.slice(1)).split("/");
const cat=catById[cid]||CATS[0];
addEventListener("hashchange",()=>{scrollTo(0,0);location.reload()});   // another category picked from this page
const page=CAT_PAGES[cat.id]||{lead:cat.title,accent:"",tail:"",text:cat.line};
const FILM_ALL=[...FILMS.highlights.map(f=>({...f,kind:"hl"})),...FILMS.reels.map(f=>({...f,kind:"rl"}))];
const photos=PHOTOS.filter(p=>p.cat===cat.id);
const ownFilms=FILM_ALL.filter(f=>f.cat===cat.id), films=ownFilms.length?ownFilms:FILM_ALL;

/* ---------- Copy ---------- */
document.title=`${cat.title} photography & films | Vistaar Content`;
$('meta[name="description"]').content=`${page.lead} ${page.accent} ${page.tail} ${page.text}`.replace(/\s+/g," ").trim();
$("#cpKicker").textContent=cat.title;
$("#cpLead").textContent=page.lead;
$("#cpAccent").textContent=page.accent;
$("#cpTail").textContent=page.tail;
$("#cpText").textContent=page.text;
$("#cpNPhoto").textContent=photos.length;
$("#cpNFilm").textContent=ownFilms.length;
$$(".cp-in").forEach((el,i)=>el.style.setProperty("--d",(i*.12).toFixed(2)+"s"));
requestAnimationFrame(()=>document.body.classList.add("cp-ready"));

/* ---------- Grid ---------- */
const grid=$("#cpGrid"),note=$("#cpNote");
const tabs={photo:$("#cpTabPhoto"),film:$("#cpTabFilm")};
let cols=[];
let mode=view==="films"?"film":"photo";

function card(item,i,first){
  const b=document.createElement("button");b.type="button";b.className="cp-card";
  if(!first){b.tabIndex=-1;b.setAttribute("aria-hidden","true")}
  const img=document.createElement("img");img.alt="";img.decoding="async";img.draggable=false;b.appendChild(img);
  if(mode==="photo"){
    b.setAttribute("aria-label",`${item.moment}. Open full screen`);
    b.insertAdjacentHTML("beforeend",`<span class="mx-cap"><small>${esc(cat.title)}</small>${esc(item.moment)}</span>`);
    queueImg(img,item.cat,item.seed,640,480,item.src||US(item.img,800,600));
    b.addEventListener("click",()=>openLB(i));
  }else{
    const hl=item.kind==="hl";
    b.classList.add("film");b.setAttribute("aria-label",`Play ${item.title}`);
    b.insertAdjacentHTML("beforeend",`<span class="play" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 1.8v12.4L14 8z"/></svg></span><span class="mx-cap"><small>${hl?"Event highlight":"Reel"}</small>${esc(item.title)}</span>`);
    queueImg(img,item.cat,700+i,640,480,item.poster||US(item.img,800,600));
    b.addEventListener("click",()=>openFilm(item,img.src));
  }
  return b;
}
// Photos: 4 columns on desktop, 3 on smaller screens, every other column
// starting higher like the original's middle one, and just enough rows to
// fill the screen, so every photo is actually seen. Each photo appears once;
// the list repeats only if it's too short to fill the wall, and then only
// the first copy is reachable by keyboard and screen readers.
// Films: two columns, each film once.
const photoCols=()=>innerWidth<1000?3:4;
// Cards needed to fill the stage: rows to cover the height, plus one extra
// card for each raised column. Card shape matches the CSS (4:3, 4:5 on phones).
function photoSlots(){
  const n=photoCols(),gap=innerWidth<700?6:10,colW=(innerWidth-2*gap-gap*(n-1))/n,cardH=colW*(innerWidth<700?5/4:3/4);
  return n*(Math.ceil(innerHeight/(cardH+gap))+1)+Math.floor(n/2);
}
function build(animate){
  const list=mode==="photo"?photos:films,seen=new Set();
  const n=mode==="photo"?photoCols():2,total=mode==="photo"?Math.max(list.length,photoSlots()):list.length;
  grid.innerHTML="";grid.style.gridTemplateColumns=`repeat(${n},minmax(0,1fr))`;
  grid.classList.toggle("is-film",mode==="film");$("#cpScroll").classList.toggle("is-film",mode==="film");
  cols=Array.from({length:n},(_,c)=>{const el=document.createElement("div");el.className="cp-col"+(mode==="photo"&&c%2?" is-up":"");grid.appendChild(el);return el});
  // Deal row by row; the raised columns take the first card of each row, so they end up one longer.
  const order=[...cols.keys()].sort((a,b)=>(b%2)-(a%2));
  for(let s=0;s<total&&list.length;s++){const i=s%list.length;cols[order[s%n]].appendChild(card(list[i],i,!seen.has(i)));seen.add(i)}
  note.hidden=mode!=="film"||!!ownFilms.length;
  grid.setAttribute("aria-labelledby",mode==="photo"?"cpTabPhoto":"cpTabFilm");
  if(animate&&!reduced)grid.animate([{opacity:0,filter:"blur(10px)"},{opacity:1,filter:"blur(0)"}],{duration:520,easing:"cubic-bezier(.2,.7,.2,1)"});
}
function setMode(k,animate=true){
  for(const key in tabs){const on=key===k;tabs[key].setAttribute("aria-selected",on);tabs[key].tabIndex=on?0:-1}
  if(k===mode&&cols.length)return;
  mode=k;build(animate);kick();
  // The films track is shorter; if that left the grid behind, bring it back into view.
  const sc=$("#cpScroll"),r=sc.getBoundingClientRect();
  if(r.bottom<innerHeight)scrollTo(0,r.top+scrollY+(sc.offsetHeight-innerHeight)*.6);
  history.replaceState(null,"","#"+cat.id+(k==="film"?"/films":""));
}
Object.entries(tabs).forEach(([k,t])=>{
  t.addEventListener("click",()=>setMode(k));
  t.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){const n=k==="photo"?"film":"photo";setMode(n);tabs[n].focus();e.preventDefault()}});
});
for(const key in tabs){const on=key===mode;tabs[key].setAttribute("aria-selected",on);tabs[key].tabIndex=on?0:-1}
build(false);

/* ---------- Scroll-linked tilt ---------- */
const scroller=$("#cpScroll"),seg=(p,a,b,x,y)=>lerp(x,y,clamp((p-a)/(b-a),0,1));
let sp=0,raf=0;
function frame(){
  raf=0;
  const r=scroller.getBoundingClientRect(),target=clamp(-r.top/Math.max(1,scroller.offsetHeight-innerHeight),0,1);
  sp=reduced?1:lerp(sp,target,.16);                       // reduced motion: the grid simply lies flat
  grid.style.transform=`rotateX(${seg(sp,0,.5,75,0).toFixed(2)}deg) scale(${seg(sp,.5,.9,1.2,1).toFixed(4)})`;
  const side=seg(sp,.5,1,-10,2).toFixed(2),mid=seg(sp,.5,1,15,5).toFixed(2);
  cols.forEach((c,i)=>c.style.transform=`translateY(${i%2?mid:side}%)`);
  if(!reduced&&Math.abs(target-sp)>.0004)raf=requestAnimationFrame(frame);
}
const kick=()=>{if(!raf)raf=requestAnimationFrame(frame)};
addEventListener("scroll",kick,{passive:true});addEventListener("resize",kick);
let lastFit=photoCols()+"x"+photoSlots();
addEventListener("resize",()=>{const f=photoCols()+"x"+photoSlots();if(f!==lastFit){lastFit=f;if(mode==="photo"){build(false);kick()}}});
sp=clamp(-scroller.getBoundingClientRect().top/Math.max(1,scroller.offsetHeight-innerHeight),0,1);frame();
// "See the work" lands where the grid has just stood up.
$("#cpSee").addEventListener("click",e=>{
  e.preventDefault();
  const top=scroller.getBoundingClientRect().top+scrollY+(scroller.offsetHeight-innerHeight)*.55;
  scrollTo({top,behavior:reduced?"auto":"smooth"});
});

/* ---------- Photo viewer ---------- */
const lb=$("#lightbox"),lbImg=$("#lbImg");let li=0;
function showLB(){
  const p=photos[li],fallback=photo(p.cat,p.seed,640,480);
  lbImg.style.opacity=0;
  setTimeout(()=>{lbImg.onerror=()=>{lbImg.onerror=null;lbImg.src=fallback};lbImg.src=p.src||US(p.img,1800)||fallback;lbImg.alt=`${cat.title}, ${p.moment}`;lbImg.style.opacity=1},reduced?0:120);
  $("#lbCap").innerHTML=`<small>${esc(cat.title)}</small>${esc(p.moment)}`;
  $("#lbCount").textContent=`${li+1} of ${photos.length}`;
}
function openLB(i){li=i;showLB();lb.showModal()}
const step=d=>{li=(li+d+photos.length)%photos.length;showLB()};
$("#lbPrev").addEventListener("click",()=>step(-1));$("#lbNext").addEventListener("click",()=>step(1));
lb.addEventListener("keydown",e=>{if(e.key==="ArrowRight")step(1);else if(e.key==="ArrowLeft")step(-1)});
let sx=null;const fig=$("#lbFig");
fig.addEventListener("pointerdown",e=>sx=e.clientX);
fig.addEventListener("pointerup",e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50)step(dx<0?1:-1)});

/* ---------- Film player ---------- */
const fb=$("#filmbox"),fbBody=$("#fbBody");
function openFilm(f,poster){
  $("#fbKind").textContent=f.kind==="hl"?"Event highlight":"Reel";
  $("#fbCap").innerHTML=`<small>${esc(catById[f.cat].title)}</small>${esc(f.title)}`;
  if(f.src)fbBody.innerHTML=`<video src="${esc(f.src)}" ${f.poster?`poster="${esc(f.poster)}"`:""} controls autoplay playsinline></video>`;
  else fbBody.innerHTML=`<div class="fb-wait"><img src="${poster}" alt=""><p>This film will play here once it's uploaded.</p></div>`;
  fb.showModal();
}
$$(".dlg").forEach(d=>{
  d.addEventListener("click",e=>{if(e.target.closest("[data-close]")||e.target===d)d.close()});
  d.addEventListener("close",()=>{if(d===fb)fbBody.innerHTML=""});
});
const lock=()=>{document.documentElement.style.overflow=document.querySelector("dialog[open]")?"hidden":""};
$$("dialog").forEach(d=>new MutationObserver(lock).observe(d,{attributes:true,attributeFilter:["open"]}));

/* ---------- Other occasions + footer ---------- */
$("#cpCats").innerHTML=CATS.filter(c=>c.id!==cat.id).map(c=>
  `<li><a class="cp-cat" href="${catUrl(c.id)}"><img alt="" loading="lazy" decoding="async" data-cat="${c.id}"><span>${esc(c.title)}<small>${esc(c.line)}</small></span></a></li>`).join("");
$$("#cpCats img").forEach((img,i)=>{const c=catById[img.dataset.cat];queueImg(img,c.id,900+i,480,600,US(c.img,520,650))});
$("#footCats").innerHTML=CATS.map(c=>`<li><a href="${catUrl(c.id)}"${c.id===cat.id?' aria-current="page"':""}>${esc(c.title)}</a></li>`).join("");
$("#yr").textContent=new Date().getFullYear();
$("#toTop").addEventListener("click",e=>{e.preventDefault();scrollTo({top:0,behavior:reduced?"auto":"smooth"})});
initGlow();
updateNav();
})();
