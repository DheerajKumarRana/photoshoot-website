
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)), lerp=(a,b,t)=>a+(b-a)*t, rad=d=>d*Math.PI/180;
const mq=matchMedia("(prefers-reduced-motion: reduce)");
let reduced=mq.matches; mq.addEventListener&&mq.addEventListener("change",e=>reduced=e.matches);
const catById=Object.fromEntries(CATS.map(c=>[c.id,c]));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- Stand-in image generator (replace with real photos) ---------- */
const PAL={
  weddings:["#2a0807","#7d1912","#d6a24a","#ffe2a8"],
  engagement:["#221a33","#6e4467","#e6a3a0","#fbe1cf"],
  ceremonies:["#1d2610","#5f6f19","#eab31d","#fbe6a6"],
  kids:["#22344b","#6fa6cc","#f4b3a1","#fdeccd"],
  birthdays:["#200f33","#b2365f","#f2a541","#a6e6e0"],
  housewarming:["#160c06","#64340f","#e39a33","#ffe3a6"],
  maternity:["#26302a","#8ea795","#e9c3b6","#f8eee6"],
  corporate:["#0b1625","#2c4667","#9fb5cb","#e8eef3"]
};
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rgba(hex,a){const n=parseInt(hex.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
const grain=(()=>{const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d");const d=x.createImageData(128,128);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);return c})();
const imgCache=new Map();
function glowDot(g,x,y,r,col,a){const b=g.createRadialGradient(x,y,r*.15,x,y,r);b.addColorStop(0,rgba(col,a));b.addColorStop(.8,rgba(col,a*.65));b.addColorStop(1,rgba(col,0));g.fillStyle=b;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
function photo(cat,seed,w,h){
  w=Math.round(w);h=Math.round(h);
  const key=`${cat}|${seed}|${w}x${h}`; if(imgCache.has(key))return imgCache.get(key);
  const p=PAL[cat]||PAL.weddings, r=rng(hash(key)), u=w/480;
  const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");
  const a=r()*Math.PI*2, lg=g.createLinearGradient(w/2-Math.cos(a)*w*.7,h/2-Math.sin(a)*h*.7,w/2+Math.cos(a)*w*.7,h/2+Math.sin(a)*h*.7);
  lg.addColorStop(0,p[0]);lg.addColorStop(.55,p[1]);lg.addColorStop(1,p[0]);g.fillStyle=lg;g.fillRect(0,0,w,h);
  const gx=w*(.2+r()*.6),gy=h*(.12+r()*.45),gr=Math.max(w,h)*(.45+r()*.4);
  let rg=g.createRadialGradient(gx,gy,0,gx,gy,gr);rg.addColorStop(0,rgba(p[3],.8));rg.addColorStop(.35,rgba(p[2],.42));rg.addColorStop(1,rgba(p[2],0));g.fillStyle=rg;g.fillRect(0,0,w,h);
  g.globalCompositeOperation="lighter";
  const n=16+Math.floor(r()*26);
  for(let i=0;i<n;i++)glowDot(g,r()*w,r()*h*.85,(5+r()*r()*62)*u,r()<.5?p[2]:p[3],.07+r()*.26);
  // fairy lights
  if(["weddings","birthdays","kids","corporate","engagement"].includes(cat)&&r()<.6){
    const y0=h*(.08+r()*.3),sag=h*(.05+r()*.1);
    for(let t=0;t<=1;t+=.035){const x=t*w,y=y0+Math.sin(t*Math.PI)*sag+(r()-.5)*4*u;glowDot(g,x,y,(3+r()*5)*u,p[3],.55);glowDot(g,x,y,14*u,p[2],.12)}
  }
  g.globalCompositeOperation="source-over";
  // marigold toran
  if(["weddings","ceremonies","housewarming"].includes(cat)&&r()<.65){
    const y0=h*(.02+r()*.07),sag=h*(.04+r()*.06),cols=["#F2A516","#E8710A","#F7C948"];
    for(let t=0;t<=1;t+=.011){const x=t*w,y=y0+Math.sin(t*Math.PI)*sag;glowDot(g,x,y,w*.02*(.8+r()*.5),cols[(r()*3)|0],.75)}
    for(let k=0;k<5;k++){const x=w*(.1+k*.2),yb=y0+Math.sin((x/w)*Math.PI)*sag,len=4+((r()*5)|0);
      for(let j=1;j<=len;j++)glowDot(g,x+(r()-.5)*3*u,yb+j*w*.028,w*.017,cols[(r()*3)|0],.7)}
  }
  // confetti
  if(["birthdays","kids"].includes(cat)){for(let i=0;i<40;i++){g.save();g.translate(r()*w,r()*h);g.rotate(r()*3);g.fillStyle=rgba([p[2],p[3],"#ffffff"][(r()*3)|0],.35+r()*.4);g.fillRect(0,0,(4+r()*7)*u,(2+r()*3)*u);g.restore()}}
  // soft, out-of-focus figures in the foreground
  const figs=1+Math.floor(r()*3);
  for(let i=0;i<figs;i++){const fx=w*(.2+r()*.6),fy=h*(.78+r()*.18),fr=w*(.13+r()*.08);g.save();g.translate(fx,fy);g.scale(1,2.1);rg=g.createRadialGradient(0,0,0,0,0,fr);rg.addColorStop(0,rgba(p[0],.78));rg.addColorStop(1,rgba(p[0],0));g.fillStyle=rg;g.fillRect(-fr,-fr,fr*2,fr*2);g.restore()}
  // vignette + grain
  rg=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.75);rg.addColorStop(0,"rgba(0,0,0,0)");rg.addColorStop(1,"rgba(0,0,0,.42)");g.fillStyle=rg;g.fillRect(0,0,w,h);
  g.globalAlpha=.09;g.globalCompositeOperation="overlay";g.fillStyle=g.createPattern(grain,"repeat");g.fillRect(0,0,w,h);
  g.globalAlpha=1;g.globalCompositeOperation="source-over";
  const url=c.toDataURL("image/jpeg",.8);imgCache.set(key,url);return url;
}
// Generate images a few at a time so the page stays responsive.
const imgQueue=[];let pumping=false;
function queueImg(el,cat,seed,w,h,src){
  if(src){el.onerror=()=>{el.onerror=null;imgQueue.push([el,cat,seed,w,h]);if(!pumping){pumping=true;setTimeout(pump,30)}};el.src=src;return}
  imgQueue.push([el,cat,seed,w,h]);
  if(!pumping){pumping=true;setTimeout(pump,30)}
}
// Whatever is closest to the screen is drawn first.
function nextImg(){let best=0,bd=Infinity;const vh=innerHeight;
  for(let i=0;i<imgQueue.length;i++){const r=imgQueue[i][0].getBoundingClientRect();
    const d=(r.width||r.height)?(r.bottom<0?-r.bottom:r.top>vh?r.top-vh:0):1e7+i;if(d<bd){bd=d;best=i;if(d===0)break}}
  return imgQueue.splice(best,1)[0]}
function pump(){const t=performance.now();while(imgQueue.length&&performance.now()-t<14){const[el,c,s,w,h]=nextImg();el.src=photo(c,s,w,h)}if(imgQueue.length)setTimeout(pump,8);else pumping=false}

/* ---------- Navigation ---------- */
const nav=$("#nav"), toneSecs=$$("[data-tone]");
function updateNav(){
  const y=(parseFloat(getComputedStyle(nav).paddingTop)||0)+34;let sec=null;
  for(const s of toneSecs){if(s===nav)continue;const r=s.getBoundingClientRect();if(r.top<=y&&r.bottom>y){sec=s;break}}
  nav.dataset.tone=sec?sec.dataset.tone:"light";
  nav.classList.toggle("solid",!!sec&&!sec.hasAttribute("data-hero"));
}
addEventListener("scroll",updateNav,{passive:true});addEventListener("resize",updateNav);
const menuBtn=$("#menuBtn");
function setMenu(open){nav.classList.toggle("open",open);menuBtn.setAttribute("aria-expanded",open);menuBtn.setAttribute("aria-label",open?"Close menu":"Open menu");document.body.style.overflow=open?"hidden":""}
menuBtn.addEventListener("click",()=>setMenu(!nav.classList.contains("open")));
$$("#navLinks a").forEach(a=>a.addEventListener("click",()=>setMenu(false)));
addEventListener("keydown",e=>{if(e.key==="Escape"&&nav.classList.contains("open"))setMenu(false)});

let glideId=0;
function glideTo(y,dur=650){
  cancelAnimationFrame(glideId);
  if(reduced){scrollTo(0,y);return}
  const y0=scrollY,d=y-y0,t0=performance.now();if(Math.abs(d)<2)return;
  const stop=()=>{cancelAnimationFrame(glideId);removeEventListener("wheel",stop);removeEventListener("touchstart",stop)};
  addEventListener("wheel",stop,{passive:true,once:true});addEventListener("touchstart",stop,{passive:true,once:true});
  const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);scrollTo(0,y0+d*e);if(k<1)glideId=requestAnimationFrame(step);else stop()};
  glideId=requestAnimationFrame(step);
}
function goTo(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:reduced?"auto":"smooth"})}
let openCategory=()=>{}, selectTab=()=>{}, openPhoto=()=>{}, openFilmG=()=>{};
document.addEventListener("click",e=>{
  const g=e.target.closest("[data-go]");if(!g)return;
  e.preventDefault();selectTab(g.dataset.go);setMenu(false);goRecent();
});

/* =====================================================================
   HERO — port of scroll-morph-hero.tsx
   Same phases (scatter → line → circle → arc) and the same geometry.
   Scroll is native: the hero section is tall and its stage is sticky, so
   page scroll drives the morph and the arc shuffle, and the page carries on
   past it instead of being trapped by a wheel listener.
   ===================================================================== */
function initHero(){
  const sec=$("#top"),stage=$("#heroStage"),host=$("#heroCards"),intro=$("#heroIntro"),content=$("#heroContent");
  const N=20, MAX=3000, MORPH_END=600;
  const cards=[];
  for(let i=0;i<N;i++){
    const cat=catById[HERO[i][0]];
    const el=document.createElement("button");el.type="button";el.className="hcard";el.tabIndex=-1;
    el.innerHTML=`<span class="hflip"><span class="hface hfront"><img alt="" draggable="false"></span><span class="hface hback"><span>${esc(cat.short)}</span><small>View</small></span></span>`;
    el.addEventListener("click",()=>openCategory(cat.id));
    host.appendChild(el);
    const img=el.querySelector("img");
    queueImg(img,cat.id,i+1,120,170,US(HERO[i][1],240,340));
    cards.push({el,p:{x:0,y:0,r:0,s:.6,o:0},v:{x:0,y:0,r:0,s:0,o:0}});
  }
  const scatter=cards.map(()=>({x:(Math.random()-.5)*1500,y:(Math.random()-.5)*1000,r:(Math.random()-.5)*180,s:.6,o:0}));
  cards.forEach((c,i)=>Object.assign(c.p,scatter[i]));
  let phase="scatter", size={w:stage.clientWidth,h:stage.clientHeight};
  new ResizeObserver(()=>{size={w:stage.clientWidth,h:stage.clientHeight}}).observe(stage);
  if(reduced){phase="circle"}else{setTimeout(()=>phase="line",500);setTimeout(()=>phase="circle",2500)}

  const morph={x:0,v:0},rot={x:0,v:0},mouse={x:0,v:0};let mouseT=0,introV=0;
  stage.addEventListener("mousemove",e=>{const r=stage.getBoundingClientRect();mouseT=((e.clientX-r.left)/r.width*2-1)*100});
  stage.addEventListener("mouseleave",()=>mouseT=0);
  const spring=(s,t,k,c,dt)=>{const n=Math.ceil(dt*240),h=dt/n;for(let i=0;i<n;i++){s.v+=(-k*(s.x-t)-c*s.v)*h;s.x+=s.v*h}};

  let running=false,last=0;
  new IntersectionObserver(([e])=>{if(e.isIntersecting&&!running){running=true;last=performance.now();requestAnimationFrame(loop)}else if(!e.isIntersecting)running=false}).observe(sec);

  function loop(t){
    if(!running)return;requestAnimationFrame(loop);
    const dt=Math.min(.05,Math.max(.001,(t-last)/1000));last=t;
    const total=Math.max(1,sec.offsetHeight-innerHeight);
    const vs=clamp(-sec.getBoundingClientRect().top,0,total)/total*MAX;
    const mT=clamp(vs/MORPH_END,0,1), rT=clamp((vs-MORPH_END)/(MAX-MORPH_END),0,1)*360;
    if(reduced){morph.x=mT;rot.x=rT;mouse.x=0}else{spring(morph,mT,40,20,dt);spring(rot,rT,40,20,dt);spring(mouse,mouseT,30,20,dt)}
    const mv=clamp(morph.x,0,1.05), rv=rot.x, px=mouse.x;
    const W=size.w,H=size.h,isMobile=W<768,minD=Math.min(W,H);

    for(let i=0;i<N;i++){
      let tg;
      if(phase==="scatter")tg=scatter[i];
      else if(phase==="line"){const sp=70;tg={x:i*sp-N*sp/2,y:0,r:0,s:1,o:1}}
      else{
        const cr=Math.min(minD*(isMobile?.4:.35),350),cs=isMobile?.72:1,ca=(i/N)*360,cx=Math.cos(rad(ca))*cr,cy=Math.sin(rad(ca))*cr;
        const baseR=Math.min(W,H*1.5),arcR=baseR*(isMobile?1.4:1.1);
        const apexY=H*(isMobile?.35:.25),centerY=apexY+arcR;
        const spread=isMobile?100:130,start=-90-spread/2,step=spread/(N-1);
        const prog=clamp(rv/360,0,1),bounded=-prog*spread*.8;
        const aa=start+i*step+bounded;
        const ax=Math.cos(rad(aa))*arcR+px,ay=Math.sin(rad(aa))*arcR+centerY,as=isMobile?1.4:1.8;
        tg={x:lerp(cx,ax,mv),y:lerp(cy,ay,mv),r:lerp(ca+90,aa+90,mv),s:lerp(cs,as,mv),o:1};
      }
      const c=cards[i];
      for(const k of ["x","y","r","s","o"]){
        if(reduced){c.p[k]=tg[k];continue}
        const st={x:c.p[k],v:c.v[k]};spring(st,tg[k],40,15,dt);c.p[k]=st.x;c.v[k]=st.v;
      }
      c.el.style.transform=`translate(${c.p.x}px,${c.p.y}px) rotate(${c.p.r}deg) scale(${c.p.s})`;
      c.el.style.setProperty("--s",Math.max(.2,c.p.s).toFixed(3));
      c.el.style.opacity=clamp(c.p.o,0,1);
    }
    const it=phase==="circle"?clamp(1-mv*2,0,1):0;
    introV=reduced?it:lerp(introV,it,1-Math.exp(-dt*3));
    intro.style.opacity=introV;intro.style.filter=`blur(${(1-introV)*10}px)`;
    const co=clamp((mv-.8)/.2,0,1);
    content.style.opacity=co;content.style.transform=`translateY(${20*(1-co)}px)`;
    content.style.pointerEvents=co>.5?"auto":"none";
  }
}

/* =====================================================================
   CATEGORIES — port of works-wheel.tsx
   Same `turn` model and geometry (ring → drum, bow, cull). Turn is read
   from page scroll through a sticky stage, then the wheel settles on the
   nearest item once scrolling stops, as the original settles a wheel burst.
   ===================================================================== */
function initWheel(){
  const CARD_H=.38,CARD_MAX_W=.34,CARD_RATIO=1.45,STEP=40,DRUM=2.22,LENS=2.7,RING_R=1.14,BOW=1.82,TITLE=.124,CULL=1.6,EASE=.075;
  const A=.04,B=.9; // scroll range the turn is spread across; the rest is dwell
  const sec=$("#portfolio"),stage=$("#wheelStage"),rotEl=$("#wheelRot"),label=$("#wheelLabel"),title=$("#wheelTitle"),hint=$("#wheelHint");
  const idx=$("#wheelIndex"),count=CATS.length,last=count-1;
  const cards=CATS.map((c,i)=>{
    const a=document.createElement("a");a.className="wcard";a.href="#recent";a.id=`wheel-${i}`;a.setAttribute("role","option");a.tabIndex=-1;
    a.setAttribute("aria-label",c.title);
    a.innerHTML=`<span class="wface"><img alt="${esc(c.title)}" draggable="false"><span class="wact"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>See the work</span></span>`;
    a.addEventListener("click",e=>{e.preventDefault();openCategory(c.id)});
    rotEl.appendChild(a);
    queueImg(a.querySelector("img"),c.id,7+i,580,400,US(c.img,1160,800));
    const li=document.createElement("li");li.innerHTML=`<button type="button">${esc(c.title)}</button>`;
    li.firstChild.addEventListener("click",()=>scrollToItem(i+1));idx.appendChild(li);
    return a;
  });
  const idxBtns=$$("button",idx);
  let m={},turn=0,target=0,active=-1;
  function measure(){
    const w=stage.clientWidth,h=stage.clientHeight,mobile=w<768;
    const cardW=Math.min(h*CARD_H*CARD_RATIO,w*(mobile?.74:CARD_MAX_W)),cardH=cardW/CARD_RATIO;
    const ringR=mobile?Math.min(cardH*RING_R,w*.3):cardH*RING_R;
    m={w,h,mobile,cardW,cardH,ringR,drumR:cardH*DRUM,bow:cardH*BOW,
       ringScale:clamp((((2*Math.PI*ringR)/count)*.82)/(cardW||1),.16,1)};
    stage.style.perspective=`${cardH*LENS}px`;
    cards.forEach(c=>{c.style.width=cardW+"px";c.style.height=cardH+"px";c.style.marginLeft=-cardW/2+"px";c.style.marginTop=-cardH/2+"px"});
    label.style.fontSize=clamp(cardH*TITLE,22,56)+"px";
    title.style.setProperty("--wt",clamp(cardH*TITLE*(mobile?1.25:1),24,54)+"px");
    title.style.maxWidth=mobile?"":Math.max(220,w/2-cardW/2-w*.06-28)+"px";
  }
  measure();new ResizeObserver(measure).observe(stage);

  const place=(ringDeg,drumDeg,mm)=>
    `translateX(${mm*(-m.bow*(1-Math.cos(rad(drumDeg))))}px) rotateZ(${(1-mm)*ringDeg}deg) translateY(${-(1-mm)*m.ringR}px) rotateX(${mm*drumDeg}deg) translateZ(${mm*m.drumR}px)`;

  function readTarget(){
    const r=sec.getBoundingClientRect(),total=Math.max(1,sec.offsetHeight-innerHeight);
    const p=clamp(-r.top/total,0,1);target=clamp((p-A)/(B-A),0,1)*count;
  }
  function scrollYFor(k){const total=sec.offsetHeight-innerHeight;return sec.getBoundingClientRect().top+scrollY+(A+(k/count)*(B-A))*total}
  function scrollToItem(k){glideTo(scrollYFor(clamp(k,0,count)),700)}

  function setActive(i){
    if(i===active)return;active=i;const c=CATS[i];
    $("#wtName").textContent=c.title;$("#wtLine").textContent=c.line;
    $("#wtSubs").innerHTML=c.subs.map(s=>`<li>${esc(s)}</li>`).join("");
    $("#wtCount").textContent=`${i+1} of ${count}`;
    $("#wtLink").onclick=e=>{e.preventDefault();openCategory(c.id)};
    idxBtns.forEach((b,j)=>b.setAttribute("aria-current",j===i));
    cards.forEach((c2,j)=>c2.setAttribute("aria-selected",j===i));
    stage.setAttribute("aria-activedescendant",`wheel-${i}`);
  }
  setActive(0);

  let running=false;
  new IntersectionObserver(([e])=>{if(e.isIntersecting&&!running){running=true;requestAnimationFrame(draw)}else if(!e.isIntersecting)running=false}).observe(sec);
  function draw(){
    if(!running)return;requestAnimationFrame(draw);
    readTarget();
    const gap=target-turn;
    turn=Math.abs(gap)<.0005?target:turn+gap*(reduced?1:EASE);
    const t=turn,mm=clamp(t,0,1),pos=Math.max(0,t-1);
    rotEl.style.transform=`translateZ(${-mm*m.drumR}px)`;
    for(let i=0;i<count;i++){
      const d=i-pos,c=cards[i];
      c.style.transform=place(d*(360/count),d*STEP,mm);
      const hide=mm>.5&&Math.abs(d)>CULL;
      c.style.opacity=hide?"0":"1";c.style.pointerEvents=hide?"none":"";
      c.style.zIndex=String(Math.round(100-Math.abs(d)*2));
      c.tabIndex=(mm>.5&&Math.round(pos)===i)?0:-1;
      const fs=lerp(m.ringScale,1,mm);c.firstElementChild.style.transform=`scale(${fs})`;c.firstElementChild.style.setProperty("--s",fs.toFixed(3));
    }
    label.style.opacity=String(1-mm);
    title.style.opacity=String(mm);title.style.visibility=mm>.25?"visible":"hidden";
    hint.style.opacity=m.mobile?(t<.3?"1":"0"):(t>count-.5?"0":(t<.2?"1":".6"));
    setActive(clamp(Math.round(pos),0,last));
  }

  // Settle on an item after scrolling stops, like the component's SETTLE.
  let settle;
  addEventListener("scroll",()=>{clearTimeout(settle);settle=setTimeout(()=>{
    const r=sec.getBoundingClientRect();
    if(r.top>1||r.bottom<innerHeight-1)return;
    if(target<.5||target>=count)return;
    const k=Math.max(1,Math.round(target)),y=scrollYFor(k);
    if(Math.abs(y-scrollY)>3)glideTo(y,620);
  },260)},{passive:true});

  stage.addEventListener("keydown",e=>{
    if(e.key==="ArrowDown"||e.key==="ArrowRight")scrollToItem(Math.round(target)+1);
    else if(e.key==="ArrowUp"||e.key==="ArrowLeft")scrollToItem(Math.round(target)-1);
    else if(e.key==="Enter"&&target>=.5)openCategory(CATS[active].id);
    else return;
    e.preventDefault();
  });
}

/* =====================================================================
   ABOUT — port of InteractiveImageGallery.
   Photos and step cards share one flow (photo, step 1, photo, step 2 ...).
   Hovering any item scales it to 1.05 and blurs the rest to 50%, as in the
   component; a step and the photo before it stay in focus together.
   On first view the items deal in one after another, in reading order.
   ===================================================================== */
const STEPS=[
  ["We talk","Tell us the occasion, the date and who absolutely has to be in the photos."],
  ["We plan","We map the rituals and timings with you, and with your planner if you have one."],
  ["We shoot","Photos and film side by side, without staging every moment."],
  ["You get the edit","Your photographs and films, ready to share with family and to keep."]
];
function initAbout(){
  const sec=$("#about"),ig=$("#ig"),coarse=matchMedia("(hover: none)").matches;
  let n=0;
  // Each photo and its step live in one pair, so a pair never splits across rows.
  STEPS.forEach(([t,d],i)=>{
    const p=PRINTS[i];if(!p)return;
    const pair=document.createElement("li");pair.className="ig-pair";
    const im=document.createElement("div");im.className="ig-item ig-img";im.tabIndex=0;im.dataset.pair=i;im.style.setProperty("--i",n++);
    im.setAttribute("role","img");im.setAttribute("aria-label",p.caption);
    im.innerHTML=`<img alt="" draggable="false"><span class="ig-cap" aria-hidden="true">${esc(p.caption)}</span>`;
    queueImg(im.firstChild,p.cat,300+i,400,400,US(p.img,420,420));
    const st=document.createElement("div");st.className="ig-item ig-step";st.tabIndex=0;st.dataset.pair=i;st.style.setProperty("--i",n++);
    st.innerHTML=`<span class="n">${i+1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p>`;
    pair.append(im,st);ig.appendChild(pair);
  });
  const all=$$(".ig-item",ig);
  // Everything rests blurred; the hovered item and its partner come into focus.
  const focus=el=>all.forEach(x=>{x.classList.toggle("on",x.dataset.pair===el.dataset.pair);x.classList.toggle("hot",x===el)});
  const clear=()=>all.forEach(x=>x.classList.remove("on","hot"));
  all.forEach(el=>{
    el.addEventListener("pointerenter",e=>{if(e.pointerType!=="touch")focus(el)});
    el.addEventListener("pointerleave",e=>{if(e.pointerType!=="touch")clear()});
    el.addEventListener("focus",()=>focus(el));el.addEventListener("blur",clear);
    el.addEventListener("click",e=>{if(coarse||e.pointerType==="touch")el.classList.contains("hot")?clear():focus(el)});
  });
  // On phones there is no hover: the pair nearest the middle of the screen comes into focus as you scroll.
  if(coarse){
    $(".ig-hint").textContent="Scroll or tap to bring each photo and step into focus.";
    const pairs=$$(".ig-pair",ig);
    const pick=()=>{const mid=innerHeight/2;let best=null,bd=1e9;
      pairs.forEach(p=>{const r=p.getBoundingClientRect();const d=Math.abs((r.top+r.bottom)/2-mid);if(d<bd&&r.bottom>0&&r.top<innerHeight){bd=d;best=p}});
      if(best){const el=best.firstElementChild;all.forEach(x=>{x.classList.toggle("on",x.dataset.pair===el.dataset.pair);x.classList.remove("hot")})}};
    addEventListener("scroll",pick,{passive:true});pick();
  }else document.addEventListener("pointerdown",e=>{if(!ig.contains(e.target))clear()});
  if(reduced){sec.classList.add("in");return}
  new IntersectionObserver(([e],o)=>{if(e.isIntersecting){sec.classList.add("in");o.disconnect()}},{threshold:.25}).observe(sec);
}

/* ---------- Recent work: photography + films ---------- */
/* =====================================================================
   RECENT WORK — port of the 3D parallax matrix component.
   Same keyframes: banner 90vw x 80vh, 48px radius, 4px border -> full
   bleed over the first 15% of the section; then the tilted grid
   (rotateY -45, rotateX 25, rotateZ 15, z -800) straightens to
   (-8, 4, 2, 0) while the four columns slide against each other.
   Progress is page scroll through a sticky stage, smoothed with the
   same spring (stiffness 100, damping 20, mass 0.5). When it settles,
   the tabs and filters drop in and re-deal the wall.
   ===================================================================== */
const goRecent=()=>{const sec=$("#recent");scrollTo({top:sec.getBoundingClientRect().top+scrollY+(sec.offsetHeight-innerHeight)*.97,behavior:reduced?"auto":"smooth"})};
function initRecent(){
  const sec=$("#recent"),banner=$("#mxBanner"),grid=$("#mxGrid"),title=$("#mxTitle"),ui=$("#mxUi"),chips=$("#chips"),intro=$("#mxIntro");
  const tabs={photo:$("#tab-photo"),film:$("#tab-film")};
  const FILM_LIST=[...FILMS.highlights.map(f=>({...f,kind:"hl"})),...FILMS.reels.map(f=>({...f,kind:"rl"}))].map((f,i)=>({...f,fi:i}));
  const counts={};PHOTOS.forEach(p=>counts[p.cat]=(counts[p.cat]||0)+1);
  const FILTERS={
    photo:[{id:"all",label:"All",n:PHOTOS.length},...CATS.filter(c=>counts[c.id]).map(c=>({id:c.id,label:c.short,n:counts[c.id]}))],
    film:[{id:"all",label:"All",n:FILM_LIST.length},{id:"hl",label:"Event highlights",n:FILMS.highlights.length},{id:"rl",label:"Reels",n:FILMS.reels.length}]
  };
  const INTRO={photo:"Stills from recent shoots across every occasion we cover. Pick a category, or open any photo to see it full screen.",
               film:"Event highlights to watch with the family, and short reels cut for Instagram and WhatsApp. Open any film to play it."};
  let mode="photo",filter="all",list=[];
  const cols=[0,1,2,3].map(()=>{const c=document.createElement("div");c.className="mx-col";grid.appendChild(c);return c});

  function card(item,first){
    const b=document.createElement("button");b.type="button";b.className="mx-card";
    if(first){b.tabIndex=0}else{b.tabIndex=-1;b.setAttribute("aria-hidden","true")}
    const img=document.createElement("img");img.alt="";img.decoding="async";img.draggable=false;b.appendChild(img);
    if(mode==="photo"){
      const p=item.p,c=catById[p.cat];
      b.setAttribute("aria-label",`${c.title}, ${p.moment}. Open full screen`);
      b.insertAdjacentHTML("beforeend",`<span class="mx-cap"><small>${esc(c.title)}</small>${esc(p.moment)}</span>`);
      queueImg(img,p.cat,p.seed,480,Math.round(480/p.r),p.src||US(p.img,520,640));
      b.addEventListener("click",()=>openLB(list.indexOf(item)));
    }else{
      const f=item,hl=f.kind==="hl",c=catById[f.cat];
      b.classList.add("film");b.setAttribute("aria-label",`Play ${f.title}`);
      b.insertAdjacentHTML("beforeend",`<span class="play" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 1.8v12.4L14 8z"/></svg></span><span class="mx-cap"><small>${hl?"Event highlight":"Reel"}, ${esc(c.short)}</small>${esc(f.title)}</span>`);
      queueImg(img,f.cat,500+f.fi,hl?640:300,hl?360:533,f.poster||US(f.img,hl?1100:540,hl?620:960));
      b.addEventListener("click",()=>openFilm(f,img.src));
    }
    return b;
  }
  function build(animate){
    list=mode==="photo"?PHOTOS.map((p,i)=>({p,i})).filter(o=>filter==="all"||o.p.cat===filter)
                       :FILM_LIST.filter(f=>filter==="all"||f.kind===filter);
    const seen=new Set();
    cols.forEach((col,c)=>{
      col.innerHTML="";
      let items;
      if(list.length>=8){const base=list.filter((_,j)=>j%4===c);items=[...base,...base];while(items.length<8)items.push(...base)}
      else items=Array.from({length:8},(_,k)=>list[(c*3+k)%list.length]);
      items.forEach(it=>{const first=!seen.has(it);seen.add(it);col.appendChild(card(it,first))});
    });
    if(animate&&!reduced)grid.animate([{opacity:0},{opacity:1}],{duration:480,easing:"cubic-bezier(.2,.7,.2,1)"});
  }
  function renderChips(){
    chips.innerHTML=FILTERS[mode].map(f=>`<button type="button" class="chip" data-f="${f.id}" aria-pressed="${f.id===filter}">${esc(f.label)}<span>${f.n}</span></button>`).join("");
  }
  function setFilter(id){
    if(!FILTERS[mode].some(f=>f.id===id))id="all";
    if(id===filter&&list.length)return;filter=id;renderChips();build(true);
  }
  chips.addEventListener("click",e=>{const c=e.target.closest(".chip");if(c)setFilter(c.dataset.f)});
  selectTab=k=>{
    if(k!=="photo"&&k!=="film")k="photo";
    for(const key in tabs){const on=key===k;tabs[key].setAttribute("aria-selected",on);tabs[key].tabIndex=on?0:-1}
    intro.textContent=INTRO[k];
    if(k===mode&&list.length)return;
    mode=k;filter="all";renderChips();build(list.length>0);
  };
  Object.entries(tabs).forEach(([k,t])=>{
    t.addEventListener("click",()=>selectTab(k));
    t.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){const n=k==="photo"?"film":"photo";selectTab(n);tabs[n].focus();e.preventDefault()}});
  });
  openCategory=id=>{selectTab("photo");setFilter(id);goRecent()};
  openPhoto=i=>{selectTab("photo");if(filter!=="all")setFilter("all");openLB(list.findIndex(o=>o.i===i))};
  selectTab("photo");

  // Photo viewer
  const lb=$("#lightbox"),lbImg=$("#lbImg");let li=0;
  function showLB(){
    const {p}=list[li],c=catById[p.cat],fallback=photo(p.cat,p.seed,480,Math.round(480/p.r));
    lbImg.style.opacity=0;
    setTimeout(()=>{lbImg.onerror=()=>{lbImg.onerror=null;lbImg.src=fallback};lbImg.src=p.src||US(p.img,1800)||fallback;lbImg.alt=`${c.title}, ${p.moment}`;lbImg.style.opacity=1},reduced?0:120);
    $("#lbCap").innerHTML=`<small>${esc(c.title)}</small>${esc(p.moment)}`;
    $("#lbCount").textContent=`${li+1} of ${list.length}`;
  }
  function openLB(i){if(mode!=="photo"||i<0)return;li=i;showLB();lb.showModal()}
  const step=d=>{li=(li+d+list.length)%list.length;showLB()};
  $("#lbPrev").addEventListener("click",()=>step(-1));$("#lbNext").addEventListener("click",()=>step(1));
  lb.addEventListener("keydown",e=>{if(e.key==="ArrowRight")step(1);else if(e.key==="ArrowLeft")step(-1)});
  let sx=null;const fig=$("#lbFig");
  fig.addEventListener("pointerdown",e=>sx=e.clientX);
  fig.addEventListener("pointerup",e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50)step(dx<0?1:-1)});

  // Film player
  const fb=$("#filmbox"),fbBody=$("#fbBody");
  openFilmG=(f,poster)=>openFilm(f,poster);
  function openFilm(f,poster){
    const c=catById[f.cat];
    $("#fbKind").textContent=f.kind==="hl"?"Event highlight":"Reel";
    $("#fbCap").innerHTML=`<small>${esc(c.title)}</small>${esc(f.title)}`;
    if(f.src)fbBody.innerHTML=`<video src="${esc(f.src)}" ${f.poster?`poster="${esc(f.poster)}"`:""} controls autoplay playsinline></video>`;
    else fbBody.innerHTML=`<div class="fb-wait"><img src="${poster}" alt=""><p>This film will play here once it's uploaded.</p></div>`;
    fb.showModal();
  }
  $$(".dlg").forEach(d=>{
    d.addEventListener("click",e=>{if(e.target.closest("[data-close]")||e.target===d)d.close()});
    d.addEventListener("close",()=>{if(d===fb)fbBody.innerHTML=""});
  });

  // Scroll-linked matrix
  const seg=(v,a,b,x,y)=>lerp(x,y,clamp((v-a)/(b-a),0,1));
  const sp={x:0,v:0};let running=false,last=0;
  const unit=CSS.supports("height","1svh")?"svh":"vh",ys=[[0,-40],[-40,10],[0,-40],[-30,20]];
  new IntersectionObserver(([e])=>{if(e.isIntersecting&&!running){running=true;last=performance.now();requestAnimationFrame(loop)}else if(!e.isIntersecting)running=false}).observe(sec);
  function loop(t){
    if(!running)return;requestAnimationFrame(loop);
    const dt=Math.min(.05,Math.max(.001,(t-last)/1000));last=t;
    const r=sec.getBoundingClientRect(),target=clamp(-r.top/Math.max(1,sec.offsetHeight-innerHeight),0,1);
    if(reduced){sp.x=target}else{const n=Math.ceil(dt*240),h=dt/n;for(let i=0;i<n;i++){const a=(-100*(sp.x-target)-20*sp.v)/.5;sp.v+=a*h;sp.x+=sp.v*h}}
    const p=sp.x;
    banner.style.width=seg(p,0,.15,90,100)+"vw";
    banner.style.height=seg(p,0,.15,80,100)+unit;
    banner.style.borderRadius=seg(p,0,.15,48,0)+"px";
    banner.style.borderWidth=seg(p,0,.15,4,0)+"px";
    grid.style.transform=`translateZ(${seg(p,.15,1,-800,0)}px) rotateX(${seg(p,.15,1,25,4)}deg) rotateY(${seg(p,.15,1,-45,-8)}deg) rotateZ(${seg(p,.15,1,15,2)}deg)`;
    cols.forEach((c,i)=>c.style.transform=`translateY(${seg(p,.15,1,ys[i][0],ys[i][1])}%)`);
    title.style.opacity=String(1-clamp((p-.1)/.2,0,1));
    ui.classList.toggle("on",p>.85);
  }
}

/* ---------- Enquiry form → WhatsApp ---------- */
function initForm(){
  const sel=$("#fType");
  sel.innerHTML=`<option value="">Choose an occasion</option>`+CATS.map(c=>`<option>${esc(c.title)}</option>`).join("")+`<option>Something else</option>`;
  const form=$("#enqForm"),status=$("#fStatus");
  const num=CONFIG.whatsapp.replace(/\D/g,"");
  const alt=[];
  if(num)alt.push(`Or message us directly on <a href="https://wa.me/${num}" target="_blank" rel="noopener">WhatsApp</a>`);
  if(CONFIG.phone)alt.push(`call <a href="tel:${esc(CONFIG.phone.replace(/[^+\d]/g,""))}">${esc(CONFIG.phone)}</a>`);
  if(CONFIG.email)alt.push(`email <a href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a>`);
  $("#enqAlt").innerHTML=alt.length?alt.join(", or ")+".":"";

  const fc=$("#footContact");
  const addLink=(href,label,blank)=>fc.insertAdjacentHTML("beforeend",
    `<li><a href="${esc(href)}"${blank?' target="_blank" rel="noopener"':""}>${esc(label)}</a></li>`);
  if(num)             addLink(`https://wa.me/${num}`,"WhatsApp",true);
  if(CONFIG.phone)    addLink(`tel:${CONFIG.phone.replace(/[^+\d]/g,"")}`,CONFIG.phone);
  if(CONFIG.email)    addLink(`mailto:${CONFIG.email}`,"Email");
  if(CONFIG.instagram)addLink(CONFIG.instagram,"Instagram",true);
  if(CONFIG.youtube)  addLink(CONFIG.youtube,"YouTube",true);
  if(CONFIG.facebook) addLink(CONFIG.facebook,"Facebook",true);
  if(CONFIG.mapsUrl)  addLink(CONFIG.mapsUrl,CONFIG.city?`Find us in ${CONFIG.city}`:"Find us on the map",true);

  const setErr=(id,msg)=>{const f=$("#"+id).closest(".field");f.classList.toggle("bad",!!msg);$("#e"+id.slice(1)).textContent=msg;$("#"+id).setAttribute("aria-invalid",!!msg)};
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(form));let ok=true;
    if(!d.name.trim()){setErr("fName","Enter your name so we know who to reply to.");ok=false}else setErr("fName","");
    if(d.phone.replace(/\D/g,"").length<10){setErr("fPhone","Enter a phone number with at least 10 digits.");ok=false}else setErr("fPhone","");
    if(!ok){form.querySelector(".bad input").focus();return}
    const date=d.date?new Date(d.date+"T00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}):"";
    const lines=[`Hi Vistaar Content, I'm ${d.name.trim()}.`,
      d.type?`I'd like to book a shoot for: ${d.type}.`:"I'd like to book a shoot.",
      date&&`Date: ${date}`, d.city&&`City and venue: ${d.city}`, d.msg&&`Notes: ${d.msg}`, `Phone: ${d.phone}`].filter(Boolean);
    const a=document.createElement("a");a.href=`https://wa.me/${num}?text=${encodeURIComponent(lines.join("\n"))}`;a.target="_blank";a.rel="noopener";
    document.body.appendChild(a);a.click();a.remove();
    status.textContent="WhatsApp opened in a new tab with your details filled in. Press send there to reach us.";
  });
}

/* =====================================================================
   FOOTER GLOW — port of ruixen-gradient-footer.tsx
   Same viewBox, bell-curve bar heights, blur and scroll maths: the glow is
   pinned to the viewport floor and rises over the last band-height of
   scroll, reaching full height exactly at the end of the page.
   Colours retuned to the brand (peacock, zari, marigold, sindoor);
   swap GLOW_STOPS for RUIXEN_STOPS to get the original rainbow.
   ===================================================================== */
const RUIXEN_STOPS=[[0,"#340B05"],[.1827,"#0358F7"],[.2837,"#5092C7"],[.4135,"#E1ECFE"],[.5866,"#FFD400"],[.6827,"#FA3D1D"],[.8029,"#FD02F5"],[1,"#FFC0FD00"]];
const GLOW_STOPS=[[0,"#071A1C"],[.1827,"#0E5C63"],[.2837,"#5FA8A2"],[.4135,"#EEF4EF"],[.5866,"#F2C14E"],[.6827,"#E8710A"],[.8029,"#B3261E"],[1,"#F7B3A600"]];
function initGlow({bars=9,blur=15,peak=.98,valley=.55,minReveal=0,stops=GLOW_STOPS}={}){
  const band=$("#glow"),svg=band.querySelector("svg"),VBW=1271,VBH=599,colW=VBW/bars,mid=(bars-1)/2;
  const NS="http://www.w3.org/2000/svg";
  let html=`<defs><linearGradient id="vcGlowGrad" x1="0" y1="1" x2="0" y2="0">${stops.map(([o,c])=>`<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient><filter id="vcGlowBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter></defs>`;
  for(let i=0;i<bars;i++){
    const t=mid===0?0:Math.abs(i-mid)/mid,h=peak*VBH*(valley+(1-valley)*(1-Math.pow(t,1.24)));
    html+=`<g filter="url(#vcGlowBlur)"><rect x="${i*colW}" y="${VBH-h}" width="${colW*1.23}" height="${h}" fill="url(#vcGlowGrad)"/></g>`;
  }
  svg.innerHTML=html;
  const measure=()=>{
    const h=band.offsetHeight||1,left=document.documentElement.scrollHeight-innerHeight-scrollY;
    band.style.transform=`scaleY(${minReveal+(1-minReveal)*clamp((h-left)/h,0,1)})`;
  };
  measure();addEventListener("scroll",measure,{passive:true});addEventListener("resize",measure,{passive:true});
}
initGlow();
$("#footQuick").addEventListener("submit",e=>{
  e.preventDefault();const d=$("#fqDate").value;if(d)$("#fDate").value=d;
  goTo("enquire");setTimeout(()=>$("#fName").focus({preventScroll:true}),reduced?0:700);
});

/* ---------- Footer ---------- */
$("#footCats").innerHTML=CATS.map(c=>`<li><button type="button" data-cat="${c.id}">${esc(c.title)}</button></li>`).join("");
$("#footCats").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(b)openCategory(b.dataset.cat)});
$("#yr").textContent=new Date().getFullYear();

/* ---------- Boot ---------- */
/* =====================================================================
   3D BACKGROUND — a sheet of white silk with a zari sheen, drifting gold
   motes in front. Fixed behind the page; it answers the mouse and shifts
   as the page scrolls. Static frame under reduced motion.
   ===================================================================== */
function initBg(){
  if(!window.THREE)return;
  const cv=$("#bg3d");let r;
  try{r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:"low-power"})}catch(e){return}
  const small=innerWidth<768;
  r.setPixelRatio(Math.min(devicePixelRatio||1,small?1.25:1.5));r.setClearColor(0xffffff,0);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,1,.1,100);cam.position.set(0,0,9);
  const seg=small?64:120,geo=new THREE.PlaneGeometry(24,15,seg,Math.round(seg*.62));
  const base=geo.attributes.position.array.slice();
  const silk=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x202020,roughness:.62,metalness:.3,side:THREE.DoubleSide}));
  silk.rotation.x=-.86;silk.position.set(0,-2.1,0);scene.add(silk);
  scene.add(new THREE.HemisphereLight(0x8a8a8a,0x000000,.35));
  const key=new THREE.DirectionalLight(0xffffff,.3);key.position.set(-6,3,2.5);scene.add(key);
  const zari=new THREE.PointLight(0xD9B25C,1.1,26);zari.position.set(-5,2.5,4);scene.add(zari);
  const teal=new THREE.PointLight(0x6FA7A2,.45,22);teal.position.set(6,-1,3);scene.add(teal);
  // gold motes
  const N=small?60:140,pg=new THREE.BufferGeometry(),pp=new Float32Array(N*3),sp=new Float32Array(N);
  for(let i=0;i<N;i++){pp[i*3]=(Math.random()-.5)*16;pp[i*3+1]=(Math.random()-.5)*9;pp[i*3+2]=Math.random()*5-1;sp[i]=.15+Math.random()*.35}
  pg.setAttribute("position",new THREE.BufferAttribute(pp,3));
  const motes=new THREE.Points(pg,new THREE.PointsMaterial({color:0xC9A24A,size:small?.06:.05,transparent:true,opacity:.6,depthWrite:false}));
  scene.add(motes);
  function size(){const w=innerWidth,h=innerHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  size();addEventListener("resize",size);
  let mx=0,my=0,cx=0,cy=0;
  addEventListener("pointermove",e=>{mx=e.clientX/innerWidth*2-1;my=e.clientY/innerHeight*2-1},{passive:true});
  const pos=geo.attributes.position;
  function wave(t){
    const a=pos.array;
    for(let i=0;i<a.length;i+=3){const x=base[i],y=base[i+1];
      a[i+2]=Math.sin(x*.42+t*.55)*.62+Math.sin(y*.58+t*.38+x*.22)*.42+Math.sin((x+y)*.95+t*.9)*.1}
    pos.needsUpdate=true;geo.computeVertexNormals();
  }
  let t=0,last=performance.now();
  function frame(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
    const sp2=scrollY/Math.max(1,document.body.scrollHeight-innerHeight);
    cx=lerp(cx,mx,.04);cy=lerp(cy,my,.04);
    cam.position.x=cx*.6;cam.position.y=-cy*.35+.4-sp2*1.2;cam.lookAt(0,-1-sp2*.8,0);
    silk.rotation.z=sp2*.35;zari.position.x=-5+sp2*9;
    wave(t);
    const a=pg.attributes.position.array;
    for(let i=0;i<N;i++){a[i*3+1]+=sp[i]*dt*.35;if(a[i*3+1]>4.5)a[i*3+1]=-4.5}
    pg.attributes.position.needsUpdate=true;motes.rotation.y=Math.sin(t*.05)*.2;
    r.render(scene,cam);
  }
  if(reduced){wave(0);r.render(scene,cam)}
  else{let id;const loop=n=>{id=requestAnimationFrame(loop);frame(n)};id=requestAnimationFrame(loop);
    document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelAnimationFrame(id);else{last=performance.now();id=requestAnimationFrame(loop)}})}
  requestAnimationFrame(()=>cv.classList.add("on"));
}
initBg();
initHero();
/* ---------- Manifesto + side tab ---------- */
(function(){
  const mf=$("#manifesto"),ap=$("#aperture"),tab=$("#sideTab"),hero=$("#top"),enq=$("#enquire");
  new IntersectionObserver(([e])=>mf.classList.toggle("in",e.isIntersecting&&!reduced),{threshold:.3}).observe(mf);
  const onScroll=()=>{
    const r=mf.getBoundingClientRect();
    if(!reduced&&r.bottom>0&&r.top<innerHeight)ap.style.transform=`rotate(${(innerHeight-r.top)*.25}deg)`;
    const pastHero=hero.getBoundingClientRect().bottom<innerHeight*.5,er=enq.getBoundingClientRect();
    const wr=$("#portfolio").getBoundingClientRect(),inWheel=wr.top<innerHeight*.5&&wr.bottom>innerHeight*.5;
    tab.classList.toggle("show",pastHero&&!inWheel&&er.top>innerHeight*.6);
  };
  addEventListener("scroll",onScroll,{passive:true});onScroll();
})();
updateNav();
/* =====================================================================
   FILMS — port of image-mask.tsx.
   Same nine objectBoundingBox clip shapes in a 3-column grid, plus the
   wide "inverted" banner. Each shape holds a film: the poster shows until
   a video URL is added to FILMS, then the clip plays muted inside the
   shape on hover (or while on screen on touch devices). Click opens the
   film player with sound. Images scale to 1.1 on hover, as in the original.
   ===================================================================== */
function initFilms(){
  const all=[...FILMS.highlights.map(f=>({...f,kind:"hl"})),...FILMS.reels.map(f=>({...f,kind:"rl"}))].map((f,i)=>({...f,fi:i}));
  const feature=all[0],rest=all.slice(1,10),grid=$("#mkGrid"),touch=matchMedia("(hover: none)").matches;
  function media(fig,f,w,h){
    const img=fig.querySelector("img");
    queueImg(img,f.cat,700+f.fi,Math.round(w/2),Math.round(h/2),f.poster||US(f.img,w,h));
    if(!f.src)return null;
    const v=document.createElement("video");
    Object.assign(v,{muted:true,loop:true,playsInline:true,preload:"none"});v.src=f.src;v.setAttribute("aria-hidden","true");
    v.style.cssText="position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .4s,transform .3s";
    fig.insertBefore(v,fig.firstChild.nextSibling);
    v.addEventListener("playing",()=>v.style.opacity=1);
    return v;
  }
  function wire(btn,v){
    if(!v)return;
    const play=()=>v.play().catch(()=>{}),stop=()=>{v.pause();v.style.opacity=0};
    if(touch){new IntersectionObserver(([e])=>e.isIntersecting&&!reduced?play():stop(),{threshold:.6}).observe(btn)}
    else{btn.addEventListener("pointerenter",()=>{if(!reduced)play()});btn.addEventListener("pointerleave",stop);btn.addEventListener("focus",()=>{if(!reduced)play()});btn.addEventListener("blur",stop)}
  }
  const label=f=>`<small>${f.kind==="hl"?"Event highlight":"Reel"}, ${esc(catById[f.cat].short)}</small>${esc(f.title)}`;
  rest.forEach((f,i)=>{
    const b=document.createElement("button");b.type="button";b.className="mk-item";b.setAttribute("aria-label",`Play ${f.title}`);
    const id=i===0?"clip-pattern":`clip-pattern${i}`;
    b.innerHTML=`<span class="mk-fig" style="clip-path:url(#${id})"><img alt="" draggable="false"><span class="mk-play" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 1.8v12.4L14 8z"/></svg></span></span><span class="mk-cap">${label(f)}</span>`;
    const fig=b.firstChild,v=media(fig,f,600,750);wire(b,v);
    b.addEventListener("click",()=>openFilmG(f,fig.querySelector("img").src));
    grid.appendChild(b);
  });
  const fb=$("#mkFeature"),ffig=fb.firstElementChild;
  $("#mkFeatCap").innerHTML=label(feature);
  fb.setAttribute("aria-label",`Play ${feature.title}`);
  wire(fb,media(ffig,feature,1600,640));
  fb.addEventListener("click",()=>openFilmG(feature,ffig.querySelector("img").src));
}

/* =====================================================================
   TEAM — port of FrostedImageReveal.
   The photo sits under a frosted copy (blur + fractal-noise displacement,
   baseFrequency 0.42 as in the component's filter). A 30-cell-wide hover
   grid (the component's hoverAreas) melts the frost wherever the pointer
   passes; it refreezes over a few seconds. Runs only while being touched.
   ===================================================================== */
function initTeam(){
  const frame=$("#tmFrame"),img=$("#tmImg"),cv=$("#tmFrost"),hint=$("#tmHint"),AREAS=30,HOLD=2000,REFREEZE=.008;
  img.alt=TEAM.alt;
  const ctx=cv.getContext("2d"),src=document.createElement("canvas"),sctx=src.getContext("2d");
  const mask=document.createElement("canvas"),mctx=mask.getContext("2d");
  let W=0,H=0,ready=false,raf=0,lastAct=0,pts=[];
  function cover(c,g){
    const iw=img.naturalWidth,ih=img.naturalHeight;if(!iw)return;
    const k=Math.max(c.width/iw,c.height/ih),w=iw*k,h=ih*k;
    g.drawImage(img,(c.width-w)/2,(c.height-h)/2,w,h);
  }
  function size(){
    const r=frame.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1);
    W=cv.width=src.width=Math.round(r.width*dpr);H=cv.height=src.height=Math.round(r.height*dpr);
    mask.width=AREAS;mask.height=Math.max(1,Math.round(AREAS*r.height/r.width));
    mctx.fillStyle="#000";mctx.fillRect(0,0,mask.width,mask.height);
    paintSource();draw();
  }
  function paintSource(){
    sctx.clearRect(0,0,W,H);cover(src,sctx);
    sctx.globalCompositeOperation="source-atop";sctx.fillStyle="rgba(235,242,245,.12)";sctx.fillRect(0,0,W,H);
    sctx.globalCompositeOperation="source-over";
  }
  function draw(){
    if(!ready)return;
    ctx.globalCompositeOperation="copy";ctx.drawImage(src,0,0);
    ctx.globalCompositeOperation="destination-in";ctx.imageSmoothingEnabled=true;ctx.drawImage(mask,0,0,W,H);
    ctx.globalCompositeOperation="source-over";
  }
  function melt(x,y,r=2.4){
    const g=mctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,"rgba(0,0,0,1)");g.addColorStop(1,"rgba(0,0,0,0)");
    mctx.globalCompositeOperation="destination-out";mctx.fillStyle=g;mctx.beginPath();mctx.arc(x,y,r,0,7);mctx.fill();
    mctx.globalCompositeOperation="source-over";
  }
  function loop(t){
    raf=0;
    while(pts.length){const[x,y]=pts.shift();melt(x,y)}
    // Hold the cleared photo for a few seconds, then let the frost creep back slowly.
    const idle=t-lastAct;
    if(idle>HOLD){mctx.fillStyle=`rgba(0,0,0,${reduced?.02:REFREEZE})`;mctx.fillRect(0,0,mask.width,mask.height)}
    draw();
    if(idle<HOLD+12000)raf=requestAnimationFrame(loop);
  }
  const kick=()=>{lastAct=performance.now();if(!raf)raf=requestAnimationFrame(loop)};
  let px=null,py=null;
  function at(e){
    const r=frame.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*mask.width,y=(e.clientY-r.top)/r.height*mask.height;
    if(px!==null){const d=Math.hypot(x-px,y-py),n=Math.ceil(d/.6);for(let i=1;i<=n;i++)pts.push([px+(x-px)*i/n,py+(y-py)*i/n])}
    else pts.push([x,y]);
    px=x;py=y;hint.classList.add("off");kick();
  }
  frame.addEventListener("pointermove",at);
  frame.addEventListener("pointerdown",at);
  frame.addEventListener("pointerleave",()=>{px=py=null});
  frame.addEventListener("touchmove",e=>{const t=e.touches[0];at({clientX:t.clientX,clientY:t.clientY})},{passive:true});
  img.addEventListener("load",()=>{ready=true;paintSource();draw();cv.style.opacity=1});
  cv.style.opacity=0;
  new ResizeObserver(size).observe(frame);
  queueImg(img,"weddings",880,1280,720,TEAM.src||US(TEAM.img,2200,1240));
  // A one-time wipe on first view shows that the photo can be cleared.
  if(!reduced)new IntersectionObserver(([e],o)=>{
    if(!e.isIntersecting)return;o.disconnect();
    const t0=performance.now(),run=t=>{
      const k=Math.min(1,(t-t0)/1800);if(!ready){requestAnimationFrame(run);return}
      pts.push([k*mask.width,mask.height*(.5+Math.sin(k*Math.PI*2)*.18)]);kick();
      if(k<1)requestAnimationFrame(run);
    };setTimeout(()=>requestAnimationFrame(run),500);
  },{threshold:.5}).observe(frame);
}

/* =====================================================================
   PAGER — section-by-section scrolling.
   Every section (and every step inside the pinned, scroll-animated ones:
   hero phases, each category on the wheel, the 3D wall) is a stop.
   Desktop: one wheel / trackpad gesture = one stop, eased glide, and the
   rest of that gesture (fast spins, trackpad momentum) is absorbed, so a
   fast scroll never skips a section. Keyboard keys do the same.
   Touch: native scrolling is kept, and the page settles softly onto a
   nearby stop when a swipe ends. Tall sections get extra stops so no
   content is unreachable.
   ===================================================================== */
function pageStops(){
  const vh=innerHeight,max=document.documentElement.scrollHeight-vh,out=[0];
  const top=el=>el.getBoundingClientRect().top+scrollY;
  $$("main>section, body>footer").forEach(sec=>{
    const t=top(sec),tot=sec.offsetHeight-vh;
    if(sec.id==="top")[0,.2,.6].forEach(p=>out.push(t+p*tot));
    else if(sec.id==="portfolio"){const n=CATS.length;out.push(t);for(let k=1;k<=n;k++)out.push(t+(.04+k/n*.86)*tot)}
    else if(sec.id==="recent")[0,.5,1].forEach(p=>out.push(t+p*tot));
    else if(sec.id==="films"){
      // land on the heading, then each row of shapes, then the wide banner
      const off=(parseFloat(getComputedStyle(nav).paddingTop)||0)+nav.offsetHeight+20,end=t+sec.offsetHeight-vh;
      out.push(t);
      $$("#mkGrid .mk-item").forEach((el,i)=>{if(i%3===0&&i>0)out.push(Math.min(end,top(el)-off))});
      const bn=$("#films .mk-banner");out.push(Math.min(end,top(bn)-off));out.push(end);
    }
    else{
      out.push(t);const h=sec.offsetHeight;
      if(h>vh*1.12){for(let y=t+vh*.8;y<t+h-vh;y+=vh*.8)out.push(y);out.push(t+h-vh)}
    }
  });
  out.push(max);
  return [...new Set(out.map(y=>Math.round(clamp(y,0,max))))].sort((a,b)=>a-b).filter((y,i,a)=>i===0||y-a[i-1]>30);
}
let paging=false,pageEnd=0,pageTarget=null,pageDir=0,glideStart=0,glideDur=1,glideTok=0;
// Fast, responsive glide: starts at full speed and eases into the stop.
function pageGlide(y,done){
  cancelAnimationFrame(glideId);
  const y0=scrollY,d=y-y0,tok=++glideTok;
  if(reduced||Math.abs(d)<2){scrollTo(0,y);done&&done(tok);return}
  const dur=clamp(300+Math.abs(d)*.22,420,820),t0=performance.now();glideStart=t0;glideDur=dur;
  const ease=k=>1-Math.pow(1-k,3);
  const f=t=>{const k=Math.min(1,(t-t0)/dur);scrollTo(0,y0+d*ease(k));if(k<1)glideId=requestAnimationFrame(f);else done&&done(tok)};
  glideId=requestAnimationFrame(f);
}
// One step = the next stop. A new gesture during a glide re-aims it at the stop
// after the current target, so continued scrolling keeps moving at full pace,
// one section at a time, without waiting for the glide to finish.
function pageStep(dir){
  const st=pageStops(),from=(paging&&pageTarget!==null&&dir===pageDir)?pageTarget:scrollY;
  const target=dir>0?st.find(v=>v>from+4):[...st].reverse().find(v=>v<from-4);
  if(target===undefined)return;
  pageTarget=target;pageDir=dir;paging=true;
  pageGlide(target,tok=>{if(tok!==glideTok)return;pageEnd=performance.now();pageTarget=null;paging=false});
}
function initPager(){
  // Freeze the page behind the photo viewer and film player.
  const lock=()=>{document.documentElement.style.overflow=document.querySelector("dialog[open]")?"hidden":""};
  $$("dialog").forEach(d=>new MutationObserver(lock).observe(d,{attributes:true,attributeFilter:["open"]}));
  const blocked=e=>document.querySelector("dialog[open]")||nav.classList.contains("open")||
    (e&&e.target.closest&&e.target.closest("textarea,select"));
  const coarse=matchMedia("(pointer: coarse)").matches;
  if(!coarse){
    let lastT=0,peak=0,dipped=true;const hist=[];
    addEventListener("wheel",e=>{
      if(document.querySelector("dialog[open]")){e.preventDefault();return}
      if(e.ctrlKey||blocked(e))return;
      if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;      // horizontal scrolling stays native
      e.preventDefault();
      // Times come from when the event was created, so events that queue up while
      // the page is busy still count as part of the gesture that made them.
      const now=e.timeStamp||performance.now(),dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),a=Math.abs(dy),gap=now-lastT;lastT=now;
      const recent=hist.slice(-6),avg=recent.length?recent.reduce((x,y)=>x+y,0)/recent.length:0,prevA=recent.length?recent[recent.length-1]:0;
      hist.push(a);if(hist.length>24)hist.shift();
      if(a<2)return;
      const dir=dy>0?1:-1;
      // One gesture owns one step. A gesture ramps up, peaks, then its momentum
      // decays. Only a rise that comes AFTER the decay is a new gesture.
      if(a>peak)peak=a;
      if(a<peak*.6)dipped=true;
      const speedingUp=dipped&&a>avg*1.45+2;
      const notch=e.deltaMode===1||(a>=50&&a===prevA&&Number.isInteger(a)&&gap>25);  // mouse-wheel click
      const paused=gap>200&&(a>=prevA||gap>650);                                    // a real pause
      let go;
      if(!paging)go=now>=pageEnd+60&&(paused||speedingUp||notch||gap>650);
      else if(dir!==pageDir)go=gap>120||speedingUp;                                 // reversing is always honoured
      else go=(performance.now()-glideStart)/glideDur>.45&&(speedingUp||(notch&&gap>60));
      if(go){peak=a;dipped=false}
      if(go)pageStep(dir);
    },{passive:false});
  }else{
    let touching=false,idle;
    addEventListener("touchstart",()=>{touching=true;clearTimeout(idle)},{passive:true});
    addEventListener("touchend",()=>{touching=false},{passive:true});
    addEventListener("scroll",()=>{
      clearTimeout(idle);
      idle=setTimeout(()=>{
        if(touching||paging||blocked())return;
        const y=scrollY,st=pageStops(),near=st.reduce((b,v)=>Math.abs(v-y)<Math.abs(b-y)?v:b,st[0]);
        if(Math.abs(near-y)>3&&Math.abs(near-y)<innerHeight*.2){paging=true;pageGlide(near,tok=>{if(tok===glideTok)paging=false})}
      },140);
    },{passive:true});
  }
  addEventListener("keydown",e=>{
    if(blocked(e)||e.altKey||e.ctrlKey||e.metaKey)return;
    const el=document.activeElement;
    if(el&&(el.matches("input,textarea,select,[contenteditable]")||el.closest(".wheel-stage,[role=tablist]")))return;
    let dir=0;
    if(e.key==="PageDown"||e.key==="ArrowDown"||(e.key===" "&&!e.shiftKey))dir=1;
    else if(e.key==="PageUp"||e.key==="ArrowUp"||(e.key===" "&&e.shiftKey))dir=-1;
    else if(e.key==="Home"){e.preventDefault();pageGlide(0);return}
    else if(e.key==="End"){e.preventDefault();pageGlide(document.documentElement.scrollHeight-innerHeight);return}
    if(!dir)return;
    if(e.key===" "&&el&&el.matches("button,a"))return;
    e.preventDefault();pageStep(dir);
  });
}

setTimeout(()=>{initWheel();initAbout();initTeam();initRecent();initFilms();initPager();initForm();updateNav()},40);
