/* =====================================================================
   SHARED — helpers, stand-in images, nav and the footer glow.
   Loaded on every page, after content.js and before the page's own script.
   ===================================================================== */

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)), lerp=(a,b,t)=>a+(b-a)*t, rad=d=>d*Math.PI/180;
const mq=matchMedia("(prefers-reduced-motion: reduce)");
let reduced=mq.matches; mq.addEventListener&&mq.addEventListener("change",e=>reduced=e.matches);
const catById=Object.fromEntries(CATS.map(c=>[c.id,c]));
const catUrl=id=>"category.html#"+encodeURIComponent(id);
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
