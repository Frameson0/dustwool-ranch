/* ================= relocation (prestige) ================= */
function relocOffer(){
  const L=S.reloc;
  if(L===0)return{n:'Wagon convoy',via:'caravan',silver:700,items:{meal:50,parka:4},seats:4};
  if(L===1)return{n:'Shuttle charter',via:'orbital',silver:2500,items:{meal:100,cheese:20,parka:10,comp:8},seats:5};
  const f=Math.pow(1.7,L-1);
  return{n:'Bulk shuttle charter',via:'orbital',silver:Math.round(2500*f),items:{meal:Math.round(100*f),cheese:Math.round(20*f),parka:Math.round(10*f),comp:Math.round(8*f)},seats:Math.min(8,4+L)};
}
function eraUnlocks(e){return RESEARCH.filter(r=>r.era===e).map(r=>r.n)}
function siteSize(b,level){const s=BIOMES[b].size;return[Math.min(9,s[0]+Math.max(0,level-1)),s[1]]}
function canRelocate(){const o=relocOffer(),tr=trader(o.via);if(!tr)return false;if(S.silver<o.silver)return false;for(const i in o.items)if(cnt(i)<o.items[i])return false;return true}
let cine=null;
function startCine(bk){if(cine||!canRelocate())return;sfx('depart');const o=relocOffer(),seats=o.seats||4,pk=modal&&modal.pick?new Set(modal.pick):new Set(S.cols.slice(0,seats).map(c=>c.id));closeModal();
  const going=S.cols.filter(c=>pk.has(c.id)).slice(0,seats),stay=S.cols.filter(c=>!going.includes(c)),B=BIOMES[bk],[nc,nr]=siteSize(bk,S.reloc+1),nname=pick(SITE_NAMES.filter(n=>n!==S.site.name));
  const old={name:S.site.name,biome:biome().n,days:Math.max(1,Math.round((S.t-(S.siteT||0))/DAY)),built:built().length,plots:openCount(),going:going.length,stay:stay.length,wealth:raidWealth(),wall:wallName()};
  const el=document.createElement('div');el.id='cine';
  el.innerHTML=`<div class="bar bt"></div><div class="bar bb"></div><div class="ctitle"><small>Farewell to</small>${esc(old.name)}</div>
    <div class="ccard"><h4>${esc(old.biome)}</h4><div><span>Days here</span><b>${old.days}</b></div><div><span>Buildings</span><b>${old.built}</b></div><div><span>Land cleared</span><b>${old.plots} plots</b></div><div><span>Colony wealth</span><b>${fmt(old.wealth)}</b></div><div><span>Defenses</span><b>${esc(old.wall)}</b></div><div><span>On the road</span><b>${old.going}${old.stay?` · ${old.stay} stay`:''}</b></div></div>
    <div class="sub"></div><div class="fade"></div>
    <div class="cnew"><small>Next stop</small><b>${esc(nname)}</b><div class="bn">${esc(B.n)} · ${nc}×${nr} plots</div><div class="bn" style="color:#e8c870">Era ${Math.min(ERAS.length,S.reloc+2)}: ${ERAS[Math.min(ERAS.length-1,S.reloc+1)]}</div><ul>${B.pros.map(x=>`<li class="p">+ ${esc(x)}</li>`).join('')}${B.cons.map(x=>`<li class="c">− ${esc(x)}</li>`).join('')}</ul></div>
    <div class="cskip">Click or Esc to skip</div>`;
  document.body.appendChild(el);document.body.classList.add('cine');requestAnimationFrame(()=>el.classList.add('on'));
  el.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();cineSkip()});
  sel=null;tab=null;camAnim=null;
  const gx=GX+2,gy=GATE_Y,road=outerRoad.slice().reverse(),packs=[0,1].map(k=>{const a={k:'pack',id:nid(),x:gx+.5,y:gy+.5+(k?.7:-.7),path:[],face:'l',type:'shaggox',age:999,emT:99,home:[gx,gy],cine:true,hide:true};S.vis.push(a);return a});
  const half=Math.ceil(going.length/2),order=[going[0],packs[0],...going.slice(1,half),packs[1],...going.slice(half)].filter(Boolean);
  cine={t:0,bk,pick:pk,nname,el,actors:[],old};
  order.forEach((e,k)=>{let pts=[];if(e.k!=='pack'){e.job=null;e.sleeping=false;e.post=null;const p=findPath(clamp(Math.floor(e.x),0,W-1),clamp(Math.floor(e.y),0,H-1),gx,gy);pts=p?p.map(([x,y])=>[x+.5,y+.5]):[[gx+.5,gy+.5]]}
    const lat=((k%3)-1)*.42;pts.push([GX+.5,gy+.5+lat*.4]);for(const[x,y]of road)pts.push([x,y+lat]);
    cine.actors.push({e,pts,delay:(e.k==='pack'?2.6:0)+k*.6,walk:e.k==='pack'?2.3:2.5})});
  for(const c of stay){c.job=null;c.path=[];c.status='Staying behind';c.face='l'}
}
function cineSub(t){const s0=cine.el.querySelector('.sub');s0.textContent=t;s0.classList.add('show')}
function cineUpdate(dt){const C=cine,q=s=>C.el.querySelector(s);C.t+=dt;const t=C.t;
  if(t>1.2&&!C.s1){C.s1=1;q('.ctitle').classList.add('show');cineSub('The colonists pack what they can carry.')}
  if(t>2.6&&!C.s2){C.s2=1;q('.ccard').classList.add('show');for(const a of C.actors)if(a.e.k==='pack'){a.e.hide=false;dirtFx(a.e.x,a.e.y,8)}}
  if(t>6.5&&!C.s3){C.s3=1;cineSub(`The caravan heads west, towards ${C.nname}.`)}
  if(!C.swapped){let sx=0,sy=0,n=0;
    for(const a of C.actors){const e=a.e;if(t>=a.delay){let d=a.walk*dt;while(d>0&&a.pts.length){const[tx,ty]=a.pts[0],dx=tx-e.x,dy=ty-e.y,L=Math.hypot(dx,dy);if(Math.abs(dx)>.02)e.face=dx<0?'l':'r';if(L<=d){e.x=tx;e.y=ty;a.pts.shift();d-=L}else{e.x+=dx/L*d;e.y+=dy/L*d;d=0}}e.path=a.pts.length?[[0,0]]:[]}
      if(e.k!=='pack'){e.working=false;e.status='Leaving with the caravan'}sx+=e.x;sy+=e.y;n++}
    if(n){const tz=t<5?1.2:.9;cam.z+=(tz-cam.z)*Math.min(1,dt*.7);cam.x+=(sx/n*T-cam.x)*Math.min(1,dt*1.6);cam.y+=(sy/n*T-cam.y)*Math.min(1,dt*1.6)}
    if(!C.fadeAt&&t>8&&(t>18||sx/n<-PADL*.32))C.fadeAt=t}
  if(C.fadeAt){const k=t-C.fadeAt;
    if(k>=0&&!C.f1){C.f1=1;q('.fade').classList.add('show');q('.ccard').classList.remove('show');q('.ctitle').classList.remove('show');q('.sub').classList.remove('show')}
    if(k>1.3&&!C.swapped){C.swapped=true;modal={k:'none',pick:C.pick};relocate(C.bk);modal=null;S.speed=Math.max(1,S.speed)}
    if(k>1.6&&!C.f2){C.f2=1;q('.cnew').classList.add('show')}
    if(k>6&&!C.f3){C.f3=1;q('.cnew').classList.remove('show');q('.fade').classList.remove('show');C.el.classList.remove('on')}
    if(k>7.4)cineEnd()}}
function cineSkip(){const C=cine;if(!C)return;if(!C.fadeAt)C.fadeAt=C.t-.2;else if(C.swapped&&C.t-C.fadeAt<6)C.fadeAt=C.t-6}
function cineEnd(){const C=cine;if(!C)return;C.el.remove();document.body.classList.remove('cine');cine=null;updateUI()}
function relocate(bk){
  if(!canRelocate())return;
  const o=relocOffer();S.silver-=o.silver;for(const i in o.items)take(i,o.items[i]);
  const seats=o.seats||4,pickSet=modal&&modal.pick?modal.pick:new Set(S.cols.slice(0,seats).map(c=>c.id)),left=S.cols.filter(c=>!pickSet.has(c.id));for(const c of left)unequip(c);S.cols=S.cols.filter(c=>pickSet.has(c.id)).slice(0,seats);
  for(const p of S.plots)if(p.stock)rackReturn(p);
  let sold=0;const keep={};for(const i in S.items){if(ITEMS[i].food||i==='comp'||i==='acomp'||i==='schem'||i==='plasteel'){keep[i]=cnt(i);continue}sold+=Math.floor(cnt(i))*ITEMS[i].v*.5}
  for(const a of S.ani)sold+=ANIMALS[a.type].price*.4;
  S.silver+=sold;S.items=keep;
  {const L=S.legacy,earn=legacyEarn();L.pts+=earn;L.runs++;const st=S.stats||{};L.snap={raidsWon:st.raidsWon||0,exps:st.exps||0,bosses:st.bosses||0};chron('legacy',`${S.site.name} became part of the colony’s legacy: +${earn} legacy points.`);const ck=L.perks.cache||0;if(ck){S.silver+=300*ck;add('meal',20*ck)}}
  S.reloc++;S.renown++;
  const[c,r]=siteSize(bk,S.reloc);
  S.site={biome:bk,cols:c,rows:r,seed:RI(1,1e9),name:(cine&&cine.nname)||pick(SITE_NAMES.filter(n=>n!==S.site.name))};S.siteT=S.t;chron('move',`The caravan reached ${S.site.name} in the ${BIOMES[bk].n.toLowerCase()}.`);
  S.plots=initPlots(c,r);S.gates=[];S.wp={};S.proj=null;S.whp={};S.traps={};S.wallCon=null;S.road={};S.roadTarget=0;S.batt=0;
  S.ani=[];S.ground=[];S.plants={};S.vis=[];S.trader=null;S.orbital=null;S.wanderer=null;S.contracts=[];S.letters=[];S.requests=[];S.wall=-1;S.def={};S.raid=null;S.breach={};S.nextRaid=S.t+DAY*4;for(const c of S.cols){c.post=null;c.stationKey=null}
  S.nextCaravan=S.t+60;S.nextWanderer=S.t+150;S.nextOrbital=1e12;S.nextContract=1e12;S.nextChunk=S.t+DAY;S.nextRequest=S.t+DAY;
  setupSite();S.outside=genOutside();S.wild=[];rebuildBlocked();for(let k=0;k<wildCap();k++)spawnWild(false);
  S.cols.forEach((col,k)=>{Object.assign(col,{x:1.5+(k%5)*.7,y:GATE_Y+.5+(k%3)*.6-.6,path:[],job:null,assign:null,carry:null,hold:null,wait:0});goTo(col,GX+2,GATE_Y)});
  sowRes.clear();flowH.length=0;flowCur={};flowT0=S.t;
  {const e=era(),gs=[300,700,1400,2400][e]||2400,gr={wood:60+40*e,stone:30+30*e,steel:20*e,meal:20};S.silver+=gs;for(const i in gr)if(gr[i])add(i,gr[i]);S.grant={silver:gs,items:gr};chron('move',`A new era begins: ${ERAS[e]}.${eraUnlocks(e).length?' Unlocked research: '+eraUnlocks(e).join(', ')+'.':''}`)}
  buildStatic();fitCam();sel=null;tab=null;closeModal();
  letter('info','A new beginning',`Your colonists reached ${S.site.name} in the ${BIOMES[bk].n.toLowerCase()}. Leftover goods and animals were sold for ${fmt(sold)} silver. ${left.length?left.length+' colonist'+(left.length>1?'s':'')+' stayed behind. ':''}Food, components, schematics, plasteel, research, seed stock and silver came along. The new site welcomes you with a settlers’ grant of ${fmt(S.grant.silver)} silver and building materials. <b>Era ${era()+1}: ${ERAS[era()]}</b>${eraUnlocks(era()).length?` unlocks ${eraUnlocks(era()).join(', ')}`:''}. Renown ${S.renown}: traders pay ${S.renown*10}% more.`);
}

