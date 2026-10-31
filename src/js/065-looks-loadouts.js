/* ================= looks and loadouts =================
   Colonist appearance (outfit, colours, hat) and gear presets ("loadouts").
   A loadout decides which weapons and armor a colonist takes and can put them in a uniform. */
const OUTFITS={plain:'Plain shirt',vest:'Work vest',coat:'Long coat',overalls:'Overalls',uniform:'Uniform',robe:'Robe'};
const HATS={none:'No hat',cap:'Cap',cowboy:'Wide-brim hat',beanie:'Beanie',bandana:'Bandana',hood:'Hood'};
const PALETTE=['#6b7f4a','#4f5b3a','#3e4a32','#7a5a3a','#5a3e2a','#94704a','#c9a66b','#5a6f80','#3a4a5e','#2e3a4a','#8b5a4a','#9a3b2e','#6d4f5f','#4f6b62','#5f5f6e','#2c3036','#d8d2c4','#e8c870'];
const LO_WEAPON={best:'Best available',ranged:'Ranged first',melee:'Melee only',none:'Unarmed'};
const LO_ARMOR={best:'Best armor',light:'Light armor only',none:'No armor'};
function defaultLoadouts(){return[
  {id:1,n:'Standard',weapon:'best',armor:'best',helmet:1,always:0,uni:0,outfit:'uniform',c1:'#4f5b3a',c2:'#2e3424',hat:'none'},
  {id:2,n:'Wall guard',weapon:'ranged',armor:'best',helmet:1,always:1,uni:1,outfit:'uniform',c1:'#4f5b3a',c2:'#c9a66b',hat:'cap'},
  {id:3,n:'Rancher',weapon:'ranged',armor:'light',helmet:0,always:0,uni:1,outfit:'overalls',c1:'#5a6f80',c2:'#7a5a3a',hat:'cowboy'}]}
function loadoutOf(c){if(!S.loadouts)return null;return S.loadouts.find(l=>l.id===c.lo)||S.loadouts[0]||null}
function lookOf(p,noHat){if(!p||p.id===undefined||!p.sk)return p;const L=S&&S.loadouts?loadoutOf(p):null;if(L&&L.uni)return{...p,shirt:L.c1,trim:L.c2,outfit:L.outfit,hat:noHat?'none':L.hat};return noHat&&p.hat&&p.hat!=='none'?{...p,hat:'none'}:p}
function dropPortraits(){for(const k in portCache)delete portCache[k]}
/* gear rules from the loadout, used by guards (every tick) and by 'always wear' presets */
function lightArmor(a){return a==='woodarmor'||a==='leatherarmor'||a==='flakvest'}
function equipArmorBy(c,L){
  if(!L||L.armor==='none'){if(c.armor){add(c.armor,1);c.armor=null}}
  else{const pool=L.armor==='light'?BODYA.filter(lightArmor):BODYA;if(c.armor&&!pool.includes(c.armor)){add(c.armor,1);c.armor=null}const bb=pool.find(a=>cnt(a)>=1),bc=pool.indexOf(c.armor);if(bb&&(bc<0||pool.indexOf(bb)<bc)){if(c.armor)add(c.armor,1);take(bb,1);c.armor=bb}}
  if(!L||!L.helmet){if(c.helmet){add(c.helmet,1);c.helmet=null}}
  else{const hb=HELMA.find(a=>cnt(a)>=1),hc=HELMA.indexOf(c.helmet);if(hb&&(hc<0||HELMA.indexOf(hb)<hc)){if(c.helmet)add(c.helmet,1);take(hb,1);c.helmet=hb}}}
let loT=0;
function tickLoadouts(dt){loT-=dt;if(loT>0)return;loT=5;if(!S.loadouts)return;
  for(const c of S.cols){if(isGuard(c)||c.militia||c.downed)continue;const L=loadoutOf(c);if(L&&L.always)equipArmorBy(c,L);else if(!S.raid&&(c.armor||c.helmet)){if(c.armor){add(c.armor,1);c.armor=null}if(c.helmet){add(c.helmet,1);c.helmet=null}}}}
/* outfit and hat drawing on top of the basic pawn (body ellipse at cx,by+s*.07) */
function drawOutfit(g,p,cx,by,s,face,lw){const o=p.outfit||'plain';if(o==='plain')return;const tr=p.trim||'#2e3424',bx=cx,bcy=by+s*.07,rx=s*.26,ry=s*.24,back=face==='u';
  const clip=()=>{g.save();g.beginPath();g.ellipse(bx,bcy,rx,ry,0,0,7);g.clip()},end=()=>{g.restore();g.beginPath();g.ellipse(bx,bcy,rx,ry,0,0,7);g.strokeStyle=OUT;g.lineWidth=lw;g.stroke()};
  if(o==='coat'||o==='robe'){g.beginPath();g.moveTo(bx-rx*.85,bcy+ry*.3);g.lineTo(bx-rx*(o==='robe'?1.05:.95),bcy+ry*1.25);g.quadraticCurveTo(bx,bcy+ry*1.42,bx+rx*(o==='robe'?1.05:.95),bcy+ry*1.25);g.lineTo(bx+rx*.85,bcy+ry*.3);g.closePath();fs(g,p.shirt,lw);g.beginPath();g.ellipse(bx,bcy,rx,ry,0,0,7);fs(g,p.shirt,lw)}
  clip();
  if(o==='vest'){g.fillStyle=tr;g.fillRect(bx-rx,bcy-ry,rx*.62,ry*2);g.fillRect(bx+rx*.38,bcy-ry,rx*.62,ry*2);if(!back){g.fillStyle='rgba(255,255,255,.18)';g.fillRect(bx-rx*.5,bcy-ry*.1,rx*.18,ry*.25)}}
  else if(o==='overalls'){g.fillStyle=tr;g.fillRect(bx-rx,bcy+ry*.05,rx*2,ry);g.fillRect(bx-rx*.55,bcy-ry,rx*.22,ry*1.1);g.fillRect(bx+rx*.33,bcy-ry,rx*.22,ry*1.1);if(!back){g.fillStyle='#d8c070';g.beginPath();g.arc(bx-rx*.44,bcy-ry*.05,1.6,0,7);g.arc(bx+rx*.44,bcy-ry*.05,1.6,0,7);g.fill()}}
  else if(o==='uniform'){g.fillStyle=tr;g.fillRect(bx-rx,bcy+ry*.22,rx*2,ry*.2);if(!back){g.fillStyle='#d8c070';g.fillRect(bx-2,bcy+ry*.22,4,ry*.2);g.strokeStyle=tr;g.lineWidth=1.6;g.beginPath();g.moveTo(bx-rx*.35,bcy-ry);g.lineTo(bx,bcy-ry*.45);g.lineTo(bx+rx*.35,bcy-ry);g.stroke();g.fillStyle='rgba(0,0,0,.25)';for(const k of[-.1,.12])g.fillRect(bx-1,bcy+ry*k-1,2,2)}}
  else if(o==='coat'){g.fillStyle=tr;g.fillRect(bx-rx,bcy+ry*.3,rx*2,ry*.16);if(!back){g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1.2;g.beginPath();g.moveTo(bx,bcy-ry*.6);g.lineTo(bx,bcy+ry);g.stroke();g.fillStyle=tr;g.beginPath();g.moveTo(bx-rx*.5,bcy-ry);g.lineTo(bx,bcy-ry*.35);g.lineTo(bx-rx*.15,bcy-ry);g.fill();g.beginPath();g.moveTo(bx+rx*.5,bcy-ry);g.lineTo(bx,bcy-ry*.35);g.lineTo(bx+rx*.15,bcy-ry);g.fill()}}
  else if(o==='robe'){g.strokeStyle=tr;g.lineWidth=s*.07;g.beginPath();g.moveTo(bx-rx*.7,bcy-ry*.8);g.lineTo(bx+rx*.7,bcy+ry*.8);g.stroke()}
  end()}
function drawHatBack(g,p,hx,hy,r,lw){if(p.hat==='hood'){g.beginPath();g.arc(hx,hy+r*.08,r*1.28,0,7);fs(g,p.trim||p.shirt,lw)}}
function drawHat(g,p,hx,hy,r,face,lw){const h=p.hat;if(!h||h==='none'||h==='hood'){if(h==='hood'&&face!=='u'){g.beginPath();g.arc(hx,hy+r*.08,r*1.28,Math.PI*1.08,Math.PI*1.92);g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=lw*1.4;g.stroke()}return}
  const c1=p.trim||'#5a3e2a',sd=face==='l'?-1:face==='r'?1:0;
  if(h==='cap'){g.beginPath();g.ellipse(hx,hy-r*.3,r*1.02,r*.8,0,Math.PI,0);g.closePath();fs(g,c1,lw);if(face!=='u'){g.beginPath();g.ellipse(hx+sd*r*.55,hy-r*.28,r*(sd?.6:.75),r*.2,0,0,7);fs(g,c1,lw)}}
  else if(h==='cowboy'){g.beginPath();g.ellipse(hx,hy-r*.42,r*1.6,r*.42,0,0,7);fs(g,'#8a6a44',lw);g.beginPath();g.ellipse(hx,hy-r*.62,r*.8,r*.62,0,Math.PI,0);g.closePath();fs(g,'#8a6a44',lw);g.fillStyle=c1;g.fillRect(hx-r*.8,hy-r*.7,r*1.6,r*.16)}
  else if(h==='beanie'){g.beginPath();g.ellipse(hx,hy-r*.25,r*1.04,r*.92,0,Math.PI,0);g.closePath();fs(g,c1,lw);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(hx-r*1.02,hy-r*.38,r*2.04,r*.18);g.beginPath();g.arc(hx,hy-r*1.15,r*.22,0,7);fs(g,c1,lw)}
  else if(h==='bandana'){g.fillStyle=c1;g.beginPath();g.ellipse(hx,hy-r*.38,r*1.02,r*.3,0,Math.PI,0);g.lineTo(hx-r,hy-r*.18);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=lw*.8;g.stroke();if(face!=='d'){g.strokeStyle=c1;g.lineWidth=2.4;g.beginPath();g.moveTo(hx-sd*r,hy-r*.3);g.lineTo(hx-sd*r*1.45,hy-r*.05);g.stroke()}}}
