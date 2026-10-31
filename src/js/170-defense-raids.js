/* ================= defense & raids ================= */
const SIDES=['W','N','E','S'],SIDEN={W:'west',N:'north',E:'east',S:'south'},OUTV={W:[-1,0],E:[1,0],N:[0,-1],S:[0,1]};
const DEF={
  post:{n:'Guard post',cost:30,mat:{wood:20},cap:1,range:2,cover:.5,acc:.05,d:'Sandbags on the wall for one guard. Better cover and range.'},
  tower:{n:'Watchtower',cost:120,mat:{wood:50},cap:2,range:4,cover:.6,acc:.1,d:'A wooden tower for two guards.'},
  stonetower:{n:'Stone tower',cost:220,mat:{stone:80},cap:2,range:5,cover:.75,acc:.15,req:'masonry',d:'A stone tower for two guards. Best cover.'},
  turret:{n:'Auto-turret',cost:300,mat:{steel:25,comp:4},cap:0,range:13,dmg:5,rate:1.5,acc:.45,req:'turrets',d:'Hoses raiders with machine-gun bursts on its own.'},
};
const WALL_HP=[60,240,600,1200];
const WUP={
  batt:{n:'Battlements',d:'Guards on this side get 20% more cover against arrows and bullets.',cost:60,mat:{wood:30}},
  tower:{n:'Corner towers',d:'Guards on this side shoot 2 tiles further.',cost:150,mat:{stone:40}},
  pitch:{n:'Pitch holes',d:'Raiders hammering this wall get scalded every few seconds.',cost:120,mat:{wood:20,stone:30}},
  moat:{n:'Moat',d:'A water-filled ditch right in front of the wall. Raiders wade through it at half speed, right under your guns.',cost:90,mat:{stone:30}},
};
function wupCost(k){const D=k==='house'?{cost:200,mat:{stone:60}}:WUP[k],m=1+Math.max(0,S.wall)*.6,mat={};for(const a in D.mat)mat[a]=Math.round(D.mat[a]*m);return{cost:Math.round(D.cost*m),mat}}
function wup(side,k){return !!(side&&S.wup&&S.wup[side]&&S.wup[side][k])}
function buildWup(side,k){if(S.wall<0){msg('Dig a trench first.','bad');return}if(wup(side,k))return;const c=wupCost(k);if(!costOk(c)){msg(`Needs ${costStr(c)}.`,'bad');return}pay(c);S.wup=S.wup||{};S.wup[side]=S.wup[side]||{};S.wup[side][k]=1;chron('build',`Added ${WUP[k].n.toLowerCase()} to the ${SIDEN[side]} wall.`);sfx('done');msg(`${WUP[k].n} built on the ${SIDEN[side]} wall.`,'good')}
function gateHouse(i){for(const g of S.gates)if(g.house&&gateCells(g).includes(i))return true;return false}
function rollRaider(fac){if(fac==='mech'){const L=Object.keys(MECH).filter(k=>k!=='centipede'||S.t/DAY>18);let t=0;for(const k of L)t+=MECH[k].w;let q=Math.random()*t,m='scyther';for(const k of L){q-=MECH[k].w;if(q<=0){m=k;break}}return{v:m==='centipede'||m==='termite'?'heavy':'std',kind:MECH[m].kind,mech:m}}const q=Math.random(),v=q<.45?'light':q<.87?'std':'heavy',F=RFAC[fac];let k=Math.random()<F.archer?'archer':'melee';if(v==='heavy')k=fac==='tribal'?'melee':'archer';if(v==='light'&&fac==='tribal')k=Math.random()<.6?'archer':'melee';if(F.insect)k='melee';return{v,kind:k}}
const RANGED=['charge','lmg','assault','sniper','rifle','recurve','bow'],MELEE=['monosword','zweihander','warhammer','longsword','steelspear','spear'];
const WDMG={charge:26,lmg:11,assault:14,sniper:45,rifle:30,recurve:16,bow:12,monosword:55,zweihander:40,warhammer:34,longsword:28,steelspear:22,spear:14,fists:5};
const ARMORV={marine:.65,recon:.5,plate:.45,flakvest:.35,leatherarmor:.25,woodarmor:.15},HELMV={marinehelm:.22,advhelmet:.15,helmet:.1},BODYA=['marine','recon','plate','flakvest','leatherarmor','woodarmor'],HELMA=['marinehelm','advhelmet','helmet'];
const RFAC={
  tribal:{n:'Tribal raiders',names:['Ashen Tribe','Bone Hollow Clan','Red Feather People','Owl Creek Clan'],count:1.45,hp:.7,dmg:.8,archer:.35,range:6,spd:[1.6,2.2],shirts:['#7a5a3a','#6b4a2a','#8a6a44','#5e4a30']},
  industrial:{n:'Pirates',names:['Rust Jackals','Grey Dog Gang','Saltmarsh Reavers','Iron Mule Gang'],count:1,hp:1,dmg:1,archer:.45,range:7.5,spd:[1.5,2],armor:.12,pirate:true,shirts:['#4f4a3a','#5e4a3a','#4a4f52','#6b2f2a']},
  space:{n:'Space pirates',names:['Void Corsairs','Black Nova Syndicate','Ninth Fleet'],count:.5,hp:2.1,dmg:1.6,archer:.6,range:8.5,spd:[1.6,2],armor:.35,pirate:true,ship:true,shirts:['#2c3036','#33363d','#3a2c30']},
  insect:{n:'Insectoids',names:['Insectoid swarm','Hive brood','Megaspider nest'],count:1.65,hp:.6,dmg:.9,archer:0,spd:[1.9,2.6],insect:true},
  mech:{n:'Mechanoids',names:['Mechanoid cluster','Ancient war cluster','Dormant hive mind'],count:.45,hp:1.7,dmg:1.3,archer:.5,range:8,spd:[1.4,1.7],armor:.35,mech:true},
};
const RAIDERS=['Rust Jackals'];
/* mechanoid roster, after RimWorld: hp/spd/dmg are multipliers, range in tiles, wall = wall damage multiplier */
const MECH={
  scyther:{n:'Scyther',kind:'melee',hp:1.3,spd:1.4,dmg:1.6,armor:.3,sz:.95,w:3},
  lancer:{n:'Lancer',kind:'archer',hp:1.1,spd:1.05,dmg:1.7,armor:.3,sz:1,range:9.5,shot:'charge',w:3},
  pikeman:{n:'Pikeman',kind:'archer',hp:.9,spd:.8,dmg:1.3,armor:.25,sz:1,range:14,shot:'bullet',w:2},
  centipede:{n:'Centipede',kind:'archer',hp:5,spd:.55,dmg:1.2,armor:.5,sz:1.55,range:9,shot:'bullet',burst:true,w:1},
  termite:{n:'Termite',kind:'melee',hp:2.4,spd:.6,dmg:1,armor:.45,sz:1.2,wall:4,w:1},
};
const TACTICS={
  rush:{n:'Rush',d:'They charge the wall the moment they arrive.'},
  siege:{n:'Siege',d:'They gather out of range, wait for everyone, then storm together.'},
  vanguard:{n:'Vanguard',d:'A light vanguard attacks first; the main army follows a little later.'},
  flank:{n:'Pincer',d:'One group pins you down while a second hits another wall.'},
  sappers:{n:'Sappers',d:'Heavy fighters hammer one stretch of wall to break through.'},
  skirmish:{n:'Skirmish',d:'Their shooters snipe at your guards from range before the rest charge.'},
};
function pickTactic(fac,size){const d=S.t/DAY;if(d<7&&S.reloc===0)return'rush';
  const w={tribal:{rush:4,vanguard:3,flank:2,skirmish:2,siege:1},industrial:{siege:3,skirmish:3,flank:2,sappers:2,vanguard:1,rush:1},space:{siege:3,sappers:3,flank:2,skirmish:1},insect:{rush:6,flank:3},mech:{siege:4,rush:2,sappers:2,flank:1}}[fac]||{rush:1};
  if(size<6){delete w.flank;delete w.vanguard}
  let t=0;for(const k in w)t+=w[k];let q=Math.random()*t;for(const k in w){q-=w[k];if(q<=0)return k}return'rush'}
function pickFaction(){const d=S.t/DAY,w=raidWealth(),pool=['tribal','tribal'];if(d>6)pool.push('insect');if(d>8)pool.push('industrial','industrial');if(d>25||w>9000)pool.push('space');if(d>40)pool.push('space','insect');if(d>12)pool.push('mech');if(d>30||S.reloc>0)pool.push('mech');return pick(pool)}
function gearFactor(){
  const pw=[];for(const c of S.cols){const w=c.weapon||c.melee;if(w)pw.push(WDMG[w]/12)}
  for(const w of[...RANGED,...MELEE])for(let k=0;k<Math.min(cnt(w),S.cols.length);k++)pw.push(WDMG[w]/12);
  pw.sort((a,b)=>b-a);const top=pw.slice(0,Math.max(1,S.cols.length));const avg=top.reduce((a,b)=>a+b,0)/top.length;
  let ar=0;for(const c of S.cols)ar+=ARMORV[c.armor]||0;return clamp(avg*(1+ar/Math.max(1,S.cols.length)),.6,3.6)}
function raidPlan(scale){const fac=pickFaction(),f=RFAC[fac],E=gearFactor(),pts=raidSize()*(scale||1);return{fac,count:clamp(Math.round(pts*E*f.count),3,140),E}}
let offlineSim=false,defMode=false,autoDef=false,awayNotes=[],gateMode=false,landMode=false,fx=[],shells=[];
let slotCache=null,slotKey=-1,innerCache={},innerKey=-1;
function wallSlots(){
  if(S.wall<0)return[];
  if(slotKey===geoVer&&slotCache)return slotCache;slotKey=geoVer;const out=[];
  for(const i of wallInfo.cells){
    if(kind[i]!==1)continue;const st=wallInfo.straight[i];if(!st)continue;
    const x=i%W,y=(i-x)/W;if((st==='v'?y:x)%3!==0)continue;if(nearGate(x,y,2))continue;
    const n=wallInfo.inner[i];if(n<0)continue;
    out.push({id:'c'+i,cell:i,side:wallInfo.side[i],x,y,ix:n%W,iy:Math.floor(n/W)});
  }
  return slotCache=out;
}
function slotById(id){return wallSlots().find(s=>s.id===id)}
function wallMax(){return S.wall<0?1:WALL_HP[S.wall]}
function cellMax(i){return S.wall<0?1:WALL_HP[S.wall]*(kind[i]===4?(gateHouse(i)?1.2:.6):1)}
function wallName(){return S.wall<0?'No wall yet':WALLS[S.wall].n}
function cellHP(i){return S.whp[i]??cellMax(i)}
function sideOfTile(x,y){if(x<0||y<0||x>=W||y>=H)return null;const i=x+y*W;return isWallCell(i)?wallInfo.side[i]:null}
function sideCells(side){return wallInfo.cells.filter(i=>wallInfo.side[i]===side)}
function sideHealth(side){let h=0,m=0,b=0;for(const i of sideCells(side)){h+=Math.max(0,cellHP(i));m+=cellMax(i);if(S.breach[i])b++}return{f:m?h/m:1,b}}
function gateSide(g){return wallInfo.side[g.x+g.y*W]||'W'}
function gateCost(){return{cost:80,mat:{...[{wood:10},{wood:30},{stone:40},{stone:40,steel:15}][Math.max(0,S.wall)]}}}
function postDef(c){return c.post&&S.def[c.post.slot.id]?DEF[S.def[c.post.slot.id].type]:null}
function isGuard(c){return c.assign==='guard'||(typeof c.assign==='string'&&c.assign.startsWith('g:'))}
function rangedW(c){return c.weapon&&RANGED.includes(c.weapon)?c.weapon:null}
function meleeW(c){return c.melee||(c.weapon&&MELEE.includes(c.weapon)?c.weapon:null)}
function guardSide(c){return 'W'}
function fighter(c){return(isGuard(c)||c.militia)&&!c.downed}
function raidActive(){return !!(S.raid&&S.raid.phase==='active')}
function aliveRaiders(){return S.raid&&S.raid.raiders?S.raid.raiders.filter(r=>!r.dead&&!r.gone):[]}
function raidInside(){return raidActive()&&aliveRaiders().some(r=>r.inside)}
function isMelee(c){return !rangedW(c)}
function hotSide(){const n={};for(const r of aliveRaiders())n[r.side]=(n[r.side]||0)+1;let best=S.raid?S.raid.sides[0]:'W',bn=-1;for(const s in n)if(n[s]>bn){bn=n[s];best=s}return best}
let gPlan=null,gPlanT=-99;
/* Spreads fighters over the walls under attack: sides by raider count, then posts and inner wall tiles
   evenly along the stretch the raiders are hitting (no more clumping at the gate). Cached ~1s. */
function guardPlan(){
  if(gPlan&&gPlan.id===(S.raid&&S.raid.id)&&S.t-gPlanT<1&&S.t>=gPlanT)return gPlan;
  gPlanT=S.t;const P={id:S.raid&&S.raid.id,side:{},pos:{}};gPlan=P;if(!S.raid)return P;
  const team=S.cols.filter(fighter).sort((a,b)=>a.id-b.id),al=aliveRaiders().filter(r=>!r.inside&&!r.fleeing&&!r.hold);
  const cn={};for(const r of al)cn[r.side]=(cn[r.side]||0)+1;let sides=Object.keys(cn).sort((a,b)=>cn[b]-cn[a]);
  if(!sides.length){sides=S.raid.sides.filter(s=>sideCells(s).length);if(!sides.length)sides=['W'];for(const s of sides)cn[s]=1}
  const tot=sides.reduce((a,s)=>a+cn[s],0),alloc={};for(const s of sides)alloc[s]=Math.floor(cn[s]/tot*team.length);
  let rem=team.length-sides.reduce((a,s)=>a+alloc[s],0);for(const s of sides)if(rem>0&&!alloc[s]){alloc[s]++;rem--}for(let k=0;rem>0;k++){alloc[sides[k%sides.length]]++;rem--}
  let idx=0;for(const s of sides){const g=team.slice(idx,idx+alloc[s]);idx+=alloc[s];if(!g.length)continue;
    const vert=s==='W'||s==='E',ax=i=>vert?Math.floor(i/W):i%W,tg=al.filter(r=>r.side===s).map(r=>ax(r.tc)),all=sideCells(s).map(ax);if(!all.length)continue;
    let lo,hi;if(tg.length){lo=Math.min(...tg)-3;hi=Math.max(...tg)+3}else{lo=Math.min(...all);hi=Math.max(...all)}
    const dist=v=>v<lo?lo-v:v>hi?v-hi:0;
    const posts=postPositions(s).map(p=>({p,d:dist(vert?p.slot.y:p.slot.x)})).filter(o=>!tg.length||o.d<=8).sort((a,b)=>a.d-b.d);
    const ranged=g.filter(c=>rangedW(c)),rest=g.filter(c=>!rangedW(c));let pi=0;const free=[];
    for(const c of ranged){if(pi<posts.length){const p=posts[pi++].p;P.side[c.id]=s;P.pos[c.id]={x:p.slot.ix,y:p.slot.iy,post:{slot:p.slot,k:p.k}}}else free.push(c)}
    free.push(...rest);if(!free.length)continue;
    let sp=[];const ins=innerSpots(s);for(let w=0;w<20;w++){sp=ins.filter(n=>{const v=vert?Math.floor(n/W):n%W;return v>=lo-1&&v<=hi+1});if(sp.length>=free.length*2||(lo<=Math.min(...all)&&hi>=Math.max(...all)))break;lo-=2;hi+=2}
    if(!sp.length)sp=ins;sp=sp.slice().sort((a,b)=>(vert?Math.floor(a/W)-Math.floor(b/W):a%W-b%W));
    free.forEach((c,k)=>{P.side[c.id]=s;if(!sp.length){P.pos[c.id]={x:GX+1,y:GATE_Y,post:null};return}const n=sp[Math.min(sp.length-1,Math.floor((k+.5)*sp.length/free.length))];P.pos[c.id]={x:n%W,y:Math.floor(n/W),post:null}})}
  return P}
function stationSide(c){
  if(!S.raid)return null;{const P=guardPlan();if(P.side[c.id])return P.side[c.id]}
  const al=aliveRaiders().filter(r=>!r.inside),team=S.cols.filter(fighter).sort((a,b)=>a.id-b.id),i=Math.max(0,team.indexOf(c)),n=team.length;
  if(!al.length)return S.raid.sides[i%S.raid.sides.length];
  const cn={};for(const r of al)cn[r.side]=(cn[r.side]||0)+1;const sides=Object.keys(cn).sort((a,b)=>cn[b]-cn[a]);let acc=0;
  for(const sd of sides){acc+=cn[sd]/al.length*n;if(i<Math.round(acc))return sd}return sides[0];
}
function postPositions(side){
  const out=[];for(const sl of wallSlots()){if(sl.side!==side)continue;const d=S.def[sl.id];if(!d)continue;const D=DEF[d.type];for(let k=0;k<D.cap;k++)out.push({slot:sl,k})}
  return out;
}
function innerSpots(side){
  if(innerKey!==geoVer){innerKey=geoVer;innerCache={}}
  if(innerCache[side])return innerCache[side];
  const uniq=[...new Set(sideCells(side).filter(i=>kind[i]===1&&wallInfo.straight[i]).map(i=>wallInfo.inner[i]).filter(n=>n>=0))];
  let fx2,fy2;const g=S.gates.find(g=>gateSide(g)===side);
  if(g){fx2=g.x;fy2=g.y}else{let sx=0,sy=0;for(const n of uniq){sx+=n%W;sy+=Math.floor(n/W)}fx2=sx/Math.max(1,uniq.length);fy2=sy/Math.max(1,uniq.length)}
  const d=n=>Math.hypot(n%W-fx2,Math.floor(n/W)-fy2);uniq.sort((a,b)=>d(a)-d(b));
  return innerCache[side]=uniq;
}
function stationPos(c,side){
  const team=S.cols.filter(o=>fighter(o)&&stationSide(o)===side).sort((a,b)=>a.id-b.id),i=Math.max(0,team.indexOf(c)),posts=postPositions(side);
  if(i<posts.length){const p=posts[i];return{ix:p.slot.ix,iy:p.slot.iy,slot:p.slot,k:p.k}}
  const sp=innerSpots(side),o=i-posts.length;
  if(!sp.length)return{ix:GX+1,iy:GATE_Y,slot:null};
  const n=sp[Math.min(sp.length-1,o*2)];return{ix:n%W,iy:Math.floor(n/W),slot:null};
}
function postDraw(c){if(!c.post)return null;const sl=c.post.slot,d=S.def[sl.id];if(!d)return null;const two=DEF[d.type].cap>1;let x=sl.x+.5,y=sl.y+.5;if(two){if(sl.side==='W'||sl.side==='E')y+=c.post.k?.38:-.38;else x+=c.post.k?.38:-.38}return{x,y}}
function shootOrigin(c){return postDraw(c)||{x:c.x,y:c.y}}
function nearestRaiderFrom(x,y,range){let best=null,bd=range;for(const r of aliveRaiders()){const d=Math.hypot(r.x-x,r.y-y);if(d<=bd){bd=d;best=r}}return best}
function equipGuard(c){
  c.eqT=(c.eqT||0)-1;if(c.eqT>0)return;c.eqT=20;
  const LO=loadoutOf(c),wp=LO?LO.weapon:'best';
  if(wp==='none'){if(c.weapon){add(c.weapon,1);c.weapon=null}if(c.melee){add(c.melee,1);c.melee=null}}
  else{
    if(c.weapon&&MELEE.includes(c.weapon)){if(!c.melee)c.melee=c.weapon;else add(c.weapon,1);c.weapon=null}
    if(wp==='melee'){if(c.weapon){add(c.weapon,1);c.weapon=null}}
    else{const br=RANGED.find(w=>cnt(w)>=1),cr=RANGED.indexOf(c.weapon);if(br&&(cr<0||RANGED.indexOf(br)<cr)){if(c.weapon)add(c.weapon,1);take(br,1);c.weapon=br}}
    const bm=MELEE.find(w=>cnt(w)>=1),cm=MELEE.indexOf(c.melee);if(bm&&(cm<0||MELEE.indexOf(bm)<cm)){if(c.melee)add(c.melee,1);take(bm,1);c.melee=bm}}
  equipArmorBy(c,LO||{armor:'best',helmet:1});
}
function unequip(c,keepWeapon){if(c.weapon&&!keepWeapon){add(c.weapon,1);c.weapon=null}if(c.melee){add(c.melee,1);c.melee=null}if(c.armor){add(c.armor,1);c.armor=null}if(c.helmet){add(c.helmet,1);c.helmet=null}c.post=null;c.stationKey=null}
function hurtColonist(c,d){
  const armor=(ARMORV[c.armor]||0)+(HELMV[c.helmet]||0);c.hp=(c.hp??100)-d*(1-armor);hitFx(c.x,c.y-.3,armor>0,false);
  if(c.hp<=0){c.hp=0;c.downed=true;c.downT=0;c.path=[];c.post=null;c.stationKey=null;const keepMil=c.militia;releaseJob(c);c.militia=keepMil;if(S.raid)S.raid.downed=(S.raid.downed||0)+1;msg(`${c.nick} was knocked down!`,'bad')}
}
function dealHit(c,r,d){const crit=Math.random()<.06+.006*c.sk.shooting;if(crit){d*=2.6;critFx(r.x,r.y)}hitRaider(r,d)}
function hitRaider(r,d){r.hitAt=performance.now();
  r.hp-=d*(1-(r.armor||0));r.hurtT=S.t;hitFx(r.x,r.y-.3,(r.armor||0)>0,!!r.bug);
  if(r.hp<=0&&!r.dead){r.dead=true;r.path=[];const R0=S.raid;R0.killed++;R0.lootSilver+=RI(3,9);
    if(r.loot){add(r.loot.i,r.loot.n);r.loot=null}
    if(r.bug){R0.lootSilver-=RI(2,6);return}
    if(r.mech){R0.lootSilver-=RI(3,9);if(Math.random()<.55)R0.lootItems.mechpart=(R0.lootItems.mechpart||0)+RI(1,2);if(Math.random()<.5)R0.lootItems.steel=(R0.lootItems.steel||0)+RI(5,15);if(!offlineSim)boomFx(r.x,r.y);return}
    const q=Math.random();if(q<.12){R0.lootItems.bow=(R0.lootItems.bow||0)+1}else if(q<.2){R0.lootItems.spear=(R0.lootItems.spear||0)+1}else if(q<.24){R0.lootItems.woodarmor=(R0.lootItems.woodarmor||0)+1}}
}
function raidWealth(){let w=S.silver;for(const i in S.items)w+=cnt(i)*ITEMS[i].v;for(const p of S.plots)w+=p.spent||0;for(const a of S.ani)w+=ANIMALS[a.type].price;return w}
function raidSize(){return clamp(Math.round(4+raidWealth()/350+S.t/DAY*.3),4,70)}
function raidSides(){
  if(biome().cave)return['W'];
  if(S.t<12*DAY&&S.reloc===0)return['W'];
  const q=Math.random(),pool=['W','W','N','S','E'],a=pick(pool);
  if(q<.6)return[a];
  const b=pick(SIDES.filter(s=>s!==a));if(q<.9)return[a,b];
  return[a,b,pick(SIDES.filter(s=>s!==a&&s!==b))];
}
function startRaid(size,sides,delay,test,fac){
  fac=fac||pickFaction();const F=RFAC[fac],f=pick(F.names);
  if(F.pirate&&!test)delay=Math.max(delay,F.ship?75:60);
  const pts=raidSize(),demand=F.pirate?Math.round(60+pts*22+Math.min(S.silver,6000)*.06):0;
  const tac=S.raid&&false?null:pickTactic(fac,size);if(tac==='flank'&&sides.length<2&&!biome().cave){const o=SIDES.filter(s=>s!==sides[0]&&sideCells(s).length);if(o.length)sides=[sides[0],pick(o)]}
  S.raid={id:nid(),f,fac,tac:(tac==='flank'&&sides.length<2)?'vanguard':tac,phase:'warn',at:S.t+delay,total:size,sides,killed:0,fled:0,downed:0,stolen:{},lootSilver:0,lootItems:{},raiders:[],test:!!test,demand,comp:Array.from({length:size},()=>rollRaider(fac))};
  if(F.ship){const sd=sides[0],b=baseBox();S.raid.ship={x:sd==='W'?-PADL+6:sd==='E'?W+PADR-6:(b.x0+b.x1)/2+R(-6,6),y:sd==='N'?-PADT+5:sd==='S'?H+PADB-5:(b.y0+b.y1)/2+R(-5,5),t0:S.t};const sh=S.raid.ship,cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;for(let k=0;k<40&&hasRock&&(rockAt(sh.x,sh.y)||rockAt(sh.x-2,sh.y)||rockAt(sh.x+2,sh.y));k++){sh.x+=(cx-sh.x)*.06+R(-1.5,1.5);sh.y+=(cy-sh.y)*.06+R(-1.5,1.5)}}
  const who=F.mech?`A mechanoid cluster: ${size} war machines are marching on the colony from the ${sides.map(s=>SIDEN[s]).join(' and ')}. Mechanoids never flee.`:F.insect?`A swarm of ${size} insectoids is burrowing towards the colony from the ${sides.map(s=>SIDEN[s]).join(' and ')}.`:`${size} ${F.n.toLowerCase()} of the ${f} are coming from the ${sides.map(s=>SIDEN[s]).join(' and ')}.`;
  letter('raid',test?'Test raid incoming':F.pirate?(F.ship?'Gunship in orbit':'Pirates demand tribute'):'Raid incoming',`${who} ${F.pirate?(F.ship?`Their gunship is landing outside your wall. They demand ${fmt(demand)} silver, or they attack in about ${Math.round(delay)} seconds.`:`They demand ${fmt(demand)} silver, or they attack in about ${Math.round(delay)} seconds.`):`They arrive in about ${Math.round(delay)} seconds.`} Guards take position; workers keep working until the wall is breached.`,{pirate:!!F.pirate});
  raidWarnVisitors();sfx('horn');
  if(!test&&!offlineSim&&opt('pauseRaid')){S.speed=0;msg('Paused: raid warning. Prepare your defenses, then press play.','warn')}
}
function payRaid(){const R0=S.raid;if(!R0||R0.phase!=='warn'||!R0.demand)return;if(S.silver<R0.demand&&!S.test){msg(`You need ${fmt(R0.demand)} silver.`,'bad');return}if(!S.test)S.silver-=R0.demand;msg(`You paid ${fmt(R0.demand)} silver. The ${R0.f} leave.`,'warn');if(R0.ship)ships.push({t:4.5,lift:true,x:R0.ship.x,y:R0.ship.y,dark:true});S.letters=S.letters.filter(l=>l.k!=='raid');S.raid=null;S.nextRaid=S.t+R(4,7)*DAY;standDown();raidOverVisitors()}
function raidTargets(side){
  let ex=sideCells(side).filter(i=>wallInfo.exposed[i]);
  if(!ex.length)ex=sideCells(side);if(!ex.length)ex=wallInfo.cells.slice();
  const gates=ex.filter(i=>kind[i]===4),out=[];
  if(gates.length&&Math.random()<.55)out.push(pick(gates));
  out.push(pick(ex));if(Math.random()<.5)out.push(pick(ex));
  return out;
}
function approachOf(i,jit){const x=i%W,y=(i-x)/W,[ox,oy]=OUTV[wallInfo.side[i]||'W'];return[x+.5+ox*.9-oy*jit,y+.5+oy*.9+ox*jit]}
function stagePt(r){const[ax,ay]=approachOf(r.tc,r.jit),[ox,oy]=OUTV[wallInfo.side[r.tc]||'W'];return[ax+ox*4,ay+oy*4]}
function spawnPoint(side,i){for(let k=0;k<25;k++){const p=spawnPoint0(side,i);if(!hasRock||!rockAt(p[0],p[1]))return p}const p=spawnPoint0(side,i),b=baseBox(),cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;for(let k=0;k<200&&rockAt(p[0],p[1]);k++){const d=Math.hypot(cx-p[0],cy-p[1])||1;p[0]+=(cx-p[0])/d*.5;p[1]+=(cy-p[1])/d*.5}return p}
function spawnPoint0(side,i){
  const x=i%W,y=(i-x)/W;
  if(side==='W')return[R(-PADL+2,-PADL+8),y+R(-4,4)];
  if(side==='E')return[R(W+PADR-8,W+PADR-2),y+R(-4,4)];
  if(side==='N')return[x+R(-4,4),R(-PADT+2,-PADT+6)];
  return[x+R(-4,4),R(H+PADB-6,H+PADB-2)];
}
function pickTarget(side){const sc=sideCells(side),ex=sc.filter(i=>wallInfo.exposed[i]),pool=ex.length?ex:sc.length?sc:wallInfo.cells,gates=pool.filter(i=>kind[i]===4);if(gates.length&&Math.random()<.22)return pick(gates);return pick(pool)}
const VARM={light:{hp:.6,spd:1.2,dmg:.7,sz:.86},std:{hp:1,spd:1,dmg:1,sz:1},heavy:{hp:2.5,spd:.85,dmg:1.7,sz:1.17}};
function spawnRaiders(){sfx('drums');
  const R0=S.raid,F=RFAC[R0.fac||'tribal'],E=gearFactor();
  for(let i=0;i<R0.total;i++){
    const side=R0.sides[i%R0.sides.length],tc=pickTarget(side),sd=wallInfo.side[tc]||side;let[x,y]=spawnPoint(sd,tc);
    if(R0.ship){x=R0.ship.x+R(-2,2);y=R0.ship.y+R(-1.5,2)}
    const pre=(R0.comp&&R0.comp[i])||rollRaider(R0.fac||'tribal'),v=pre.v,VM=VARM[v],hp=R(25,45)*F.hp/Math.sqrt(E)*VM.hp*Math.max(.5,1+bonus('raidhp'));
    let kind_=pre.kind;
    const r={id:nid(),fac:R0.fac,v,sz:VM.sz,side:sd,tc,jit:R(-.42,.42),st:0,x,y,spawn:[x,y],hp,max:hp,dmgM:F.dmg*VM.dmg,armor:(F.armor||0)+(v==='heavy'?.15:0),kind:kind_,spd:R(F.spd[0],F.spd[1])*VM.spd,cool:R(0,2),inside:false,path:[],face:'r',
      look:{skin:pick(SKIN),hair:pick(HAIRC),hs:RI(0,3),shirt:pick(F.shirts||['#5a3a2a'])}};
    if(F.insect){r.bug=v==='light'?'scarab':v==='std'?'spelopede':'megaspider';r.kind='melee'}
    if(F.mech){const M=MECH[pre.mech||'scyther'];r.mech=pre.mech||'scyther';r.kind=M.kind;r.hp=r.max=R(30,40)*F.hp/Math.sqrt(E)*M.hp*Math.max(.5,1+bonus('raidhp'));r.spd=R(F.spd[0],F.spd[1])*M.spd;r.dmgM=F.dmg*M.dmg;r.armor=M.armor;r.sz=M.sz;if(M.range)r.range=M.range;if(M.burst)r.burst=true;if(M.wall)r.wallM=M.wall;r.shot=M.shot}
    raidRole(r,R0,i);
    if(R0.boss&&i===R0.total-1)makeBoss(r,R0);
    R0.raiders.push(r);
  }
}
function raidRole(r,R0,i){const t=R0.tac;
  if(t==='rush'){r.st=1;r.spd*=1.1}
  else if(t==='vanguard'){if(!(r.v==='light'||i%4===0)){r.hold=true}}
  else if(t==='flank'){if(R0.sides.length>1&&r.side!==R0.sides[0])r.hold=true}
  else if(t==='sappers'){R0.sapCells=R0.sapCells||(()=>{const sc=sideCells(R0.sides[0]).filter(c=>wallInfo.exposed[c]&&kind[c]!==4);if(!sc.length)return[r.tc];const a=pick(sc),ax=wallInfo.side[a]==='W'||wallInfo.side[a]==='E'?(c=>Math.floor(c/W)):(c=>c%W);return sc.filter(c=>Math.abs(ax(c)-ax(a))<=1)})();r.tc=pick(R0.sapCells);r.side=wallInfo.side[r.tc]||r.side;if(r.v==='heavy'||r.kind==='melee')r.wallM=(r.wallM||1)*2.2}
  if(r.hold)R0.waveT=R0.waveT||R(30,45)}
/* how far the defenders on the wall can shoot: best ranged weapon a fighter has (or can take), plus post/tower bonuses */
function guardReach(){let m=0;const fs0=S.cols.filter(c=>isGuard(c)||c.militia);for(const c of fs0){const w=rangedW(c);if(w)m=Math.max(m,WEAPONS[w].range)}
  if(fs0.length){const b=RANGED.find(w=>cnt(w)>=1);if(b)m=Math.max(m,WEAPONS[b].range)}if(!m)m=14;let pb=0;for(const id in S.def){const D=DEF[S.def[id].type];if(D&&D.cap)pb=Math.max(pb,D.range||0)}
  return m+pb+(S.wup&&Object.values(S.wup).some(u=>u.tower)?2:0)}
function holdPt(r,d){const[ax,ay]=approachOf(r.tc,r.jit||0),[ox,oy]=OUTV[r.side]||[-1,0];return[ax+ox*d-oy*(r.jit||0)*2,ay+oy*d-ox*(r.jit||0)*2]}
function rallyPt(r){const R0=S.raid;if(!R0.reach)R0.reach=guardReach();const[sx,sy]=stagePt(r),[ox,oy]=OUTV[r.side]||[-1,0],d=r.rd||(r.rd=R0.reach+R(2.5,4.5));let x=sx+ox*d+R(-.5,.5)*0,y=sy+oy*d;x=clamp(x,-PADL+2,W+PADR-2);y=clamp(y,-PADT+2,H+PADB-2);return[x,y+(r.jit||0)*3]}
function moveSafe(r,dx,dy){const nx=r.x+dx,ny=r.y+dy,cx=Math.floor(nx),cy=Math.floor(ny);if(hasRock&&rockAt(nx,ny))return;if(cx<0||cy<0||cx>=W||cy>=H||kind[cx+cy*W]===0||S.breach[cx+cy*W]){r.x=nx;r.y=ny}}
function separateRaiders(){
  const list=aliveRaiders().filter(r=>!r.inside),B=new Map();for(const r of list){const k=Math.floor(r.x)+','+Math.floor(r.y);let a=B.get(k);if(!a)B.set(k,a=[]);a.push(r)}
  for(const r of list){const bx=Math.floor(r.x),by=Math.floor(r.y);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const a=B.get((bx+dx)+','+(by+dy));if(!a)continue;
    for(const o of a){if(o.id<=r.id)continue;let ex=o.x-r.x,ey=o.y-r.y,d=Math.hypot(ex,ey);const md=.32*((r.sz||1)+(o.sz||1));if(d<md){if(d<1e-4){ex=Math.random()-.5;ey=Math.random()-.5;d=Math.hypot(ex,ey)}const pu=(md-d)/2;ex/=d;ey/=d;moveSafe(r,-ex*pu,-ey*pu);moveSafe(o,ex*pu,ey*pu)}}}}
}
function militiaUp(all){
  if(!S.militia||!S.raid)return;
  const guards=S.cols.filter(c=>isGuard(c)&&!c.downed).length;
  if(!all&&S.raid.total<=guards*3)return;
  const cand=S.cols.filter(c=>!isGuard(c)&&!c.militia&&!c.downed&&!(c.recover>0)).sort((a,b)=>b.sk.shooting-a.sk.shooting);
  let n=0;const cap=all?99:6;
  for(const c of cand){if(n>=cap)break;releaseJob(c);c.cover=false;c.coverTried=false;c.militia=true;c.needArm=!rangedW(c)||!meleeW(c);c.armTry=0;c.stationKey=null;n++}
  const spare=[...RANGED,...MELEE].reduce((a,w)=>a+cnt(w),0);
  if(n)msg(all?`The wall is breached! ${n} colonist${n>1?'s':''} join${n>1?'':'s'} the fight${spare?'':' with bare fists'}.`:`${n} colonist${n>1?'s':''} joined the militia.`,'warn');
}
function armWalk(c,dt){
  const wr=!rangedW(c)&&RANGED.find(w=>cnt(w)>=1),wm=!meleeW(c)&&MELEE.find(w=>cnt(w)>=1);
  if(!wr&&!wm){c.needArm=false;return false}
  const sp=armSpot();if(!sp){c.needArm=false;return false}
  if(Math.floor(c.x)===sp[0]&&Math.floor(c.y)===sp[1]&&!(c.path&&c.path.length)){
    if(wr){if(c.weapon&&MELEE.includes(c.weapon)&&!c.melee){c.melee=c.weapon}else if(c.weapon)add(c.weapon,1);take(wr,1);c.weapon=wr;c.milW=true}if(wm&&!meleeW(c)){take(wm,1);c.melee=wm;c.milM=true}c.needArm=false;
    const ar=BODYA.find(a=>cnt(a)>=1);if(ar&&!c.armor){take(ar,1);c.armor=ar;c.milA=true}
    c.stationKey=null;return false}
  if(!(c.path&&c.path.length)){if(c.armTry>2||!goTo(c,sp[0],sp[1])){c.needArm=false;return false}c.armTry=(c.armTry||0)+1}
  stepMove(c,dt,walkSpd(c)*1.2);c.status='Running to the '+(armories().length?'armory':'storage')+' for a weapon';c.post=null;return true;
}
function standDown(){
  for(const c of S.cols){
    c.lpost=null;if(c.militia){c.militia=false;if(c.milW&&c.weapon){add(c.weapon,1);c.weapon=null}if(c.milM&&c.melee){add(c.melee,1);c.melee=null}c.milM=false;if(c.milA&&c.armor){add(c.armor,1);c.armor=null}c.milW=false;c.milA=false;c.needArm=false;c.armTry=0;c.post=null;c.stationKey=null;releaseJob(c)}
    if(c.cover){c.cover=false;releaseJob(c)}
  }
}
function endRaid(){sfx('victory');
  const R0=S.raid;if(!R0)return;
  S.silver+=R0.lootSilver;for(const i in R0.lootItems)add(i,R0.lootItems[i]);
  standDown();raidOverVisitors();
  const stolen=Object.keys(R0.stolen).map(i=>`${R0.stolen[i]} ${ITEMS[i].n.toLowerCase()}`);
  const dmg=S.plots.filter(p=>p.type&&p.dmg>0).length;
  if(S.story)S.story.tension+=.5;
  if(R0.boss){bossFallen(R0);if(bossDead(R0))bossReward(R0);else chron('boss',`${BOSSES[R0.boss.k].t} withdrew from ${S.site.name}.`)}
  {const won=R0.killed>=R0.total*.5;if(won&&!R0.test)stat('raidsWon');stat('raids');chron('raid',`${won?'Repelled':'Survived'} ${R0.total} ${RFAC[R0.fac||'tribal'].n.toLowerCase()} of the ${R0.f}: ${R0.killed} fell${R0.downed?', '+R0.downed+' colonists knocked down':''}.`)}
  letter('raidend',R0.killed>=R0.total*.5?'Raid repelled':'Raid over',`${R0.killed} of ${R0.total} raiders fell, ${R0.fled} fled. Loot: ${fmt(R0.lootSilver)} silver${Object.keys(R0.lootItems).length?' and '+Object.keys(R0.lootItems).map(i=>R0.lootItems[i]+' '+ITEMS[i].n.toLowerCase()).join(', '):''}.${stolen.length?' Stolen: '+stolen.join(', ')+'.':' Nothing was stolen.'}${R0.downed?` ${R0.downed} colonist${R0.downed>1?'s were':' was'} knocked down and will rest in bed.`:''}${dmg?` ${dmg} plot${dmg>1?'s were':' was'} damaged; idle colonists will repair.`:''}`);
  if(R0.ship)ships.push({t:4.5,dark:true,x:R0.ship.x,y:R0.ship.y});S.raid=null;S.nextRaid=S.t+R(4,7)*DAY;shells=[];
  if(autoDef){autoDef=false;if(defMode&&tab!=='defense'){defMode=false;camAnim=normTarget()}}
}
function breachCell(i){sfx('breach',i%W,Math.floor(i/W));
  S.whp[i]=0;if(S.breach[i])return;S.breach[i]=true;blocked[i]=0;plotDirty=true;wallFx(i,24);
  msg(`Raiders broke through the ${SIDEN[wallInfo.side[i]]} ${kind[i]===4?'gate':'wall'}!`,'bad');militiaUp(true);
}
function repairCell(i,amt){
  const m=cellMax(i);S.whp[i]=Math.min(m,cellHP(i)+amt);
  if(S.breach[i]&&S.whp[i]>m*.25){delete S.breach[i];if(kind[i]===1){blocked[i]=1;unstick()}plotDirty=true}
  if(S.whp[i]>=m)delete S.whp[i];
}
function autoResolve(){
  const R0=S.raid;if(!R0)return;
  const guards=S.cols.filter(c=>isGuard(c));
  let def=Math.max(0,S.wall)*1.5;for(const c of guards)def+=(WDMG[c.weapon||c.melee||'fists']/12+.4)*(1+.03*c.sk.shooting);
  for(const id in S.def)def+=S.def[id].type==='turret'?2.5:S.def[id].type==='post'?.3:.6;
  def+=Math.min(wpOfType('mortar').length*2,cnt('shell')*.3);
  const atk=R0.total*.45*(R0.boss?2.2:1)*(R0.fac==='mech'?2:1);let text;if(R0.boss&&def>=atk)bossReward(R0);
  if(def>=atk){const killed=Math.round(R0.total*clamp(def/atk*.5,.4,.9)),loot=killed*6;S.silver+=loot;
    for(const s of R0.sides)for(const i of sideCells(s).filter(i=>wallInfo.exposed[i]).slice(0,6))S.whp[i]=Math.max(1,cellHP(i)-cellMax(i)*.3);
    text=`Your defenders drove off ${R0.total} raiders from the ${R0.f}. ${killed} fell; you looted ${fmt(loot)} silver. The walls took some damage.`}
  else{const share=clamp((atk-def)/atk,.05,.6)*.25,lost=[];
    for(const i in S.items){if(ITEMS[i].v<1)continue;const n=Math.floor(cnt(i)*share);if(n>0){take(i,n);lost.push(`${n} ${ITEMS[i].n.toLowerCase()}`)}}
    const bp=built();for(let k=0;k<Math.min(3,bp.length);k++){const p=pick(bp);p.dmg=Math.min(1,(p.dmg||0)+.35)}
    for(const s of R0.sides){const ex=sideCells(s).filter(i=>wallInfo.exposed[i]);if(ex.length){const i=pick(ex);S.whp[i]=0;S.breach[i]=true;blocked[i]=0}}
    plotDirty=true;
    text=`${R0.total} raiders from the ${R0.f} broke through the ${R0.sides.map(s=>SIDEN[s]).join(' and ')} wall while things were quiet. They stole ${lost.length?lost.slice(0,6).join(', '):'little'} and damaged some plots. Nobody was hurt.`}
  chron('raid',text.split('. ')[0]+'.');stat('raids');if(def>=atk)stat('raidsWon');
  letter('raidend','Raid while you were away',text);awayNotes.push(text);
  S.raid=null;S.nextRaid=S.t+R(4,7)*DAY;standDown();raidOverVisitors();
}
function tickRaid(dt){
  const R0=S.raid;
  if(!R0){if(S.t>=S.nextRaid&&!isNight()&&S.cols.length>=3&&S.t>3*DAY){const pl=raidPlan();startRaid(pl.count,raidSides(),45,false,pl.fac)}return}
  if(R0.phase==='warn'){
    if(S.t>=R0.at){
      if(offlineSim){autoResolve();return}
      S.letters=S.letters.filter(l=>l.k!=='raid'||!l.data.pirate);
      spawnRaiders();R0.phase='active';R0.start=S.t;militiaUp(false);msg(R0.boss?`${BOSSES[R0.boss.k].t} has arrived!`:`The ${R0.f} have arrived!`,'bad');
      if(!ovMode&&!defMode){defMode=true;autoDef=true;camAnim=defTarget()}
    }
    return;
  }
  if(offlineSim){autoResolve();return}
  if(!R0.go&&R0.tac==='siege'){const al=aliveRaiders().filter(r=>!r.hold);
    if(!R0.bomb){if(S.t-R0.start>30||(al.length&&al.every(r=>r.rl))){R0.bomb=true;R0.bombT=S.t;msg('The raiders move up and start shelling the wall!','bad');sfx('horn')}}
    else if(S.t-R0.bombT>40||Object.keys(S.breach).length||R0.killed>=R0.total*.4){R0.go=true;msg('The raiders storm the wall!','bad');sfx('horn')}}
  if(!R0.go&&R0.tac==='skirmish'&&(S.t-R0.start>60||R0.killed>=R0.total*.3)){R0.go=true;msg('The rest of the raiders charge!','bad');sfx('horn')}
  if(!R0.flee&&R0.fac!=='mech'&&(R0.boss?(bossDead(R0)||S.t-R0.start>420*BAL.raidPatience):(R0.killed>=R0.total*(R0.fac==='insect'?.9:BAL.raidFlee)||S.t-R0.start>(220+(R0.waveT||0))*BAL.raidPatience))){R0.flee=true;msg(R0.boss&&bossDead(R0)?'The boss is dead! The rest are fleeing.':'The raiders are fleeing!','good')}
  for(const r of R0.raiders)updRaider(r,dt);
  separateRaiders();
  for(const sl of wallSlots()){
    const d=S.def[sl.id];if(!d||d.type!=='turret')continue;
    d.cool=(d.cool||0)-dt;if(d.cool>0)continue;
    const D=DEF.turret,tg=nearestRaiderFrom(sl.x+.5,sl.y+.5,D.range);
    if(tg){d.burst=(d.burst||0)+1;d.cool=d.burst>=10?(d.burst=0,D.rate):.06;d.ax=tg.x;d.ay=tg.y;{const hit=Math.random()<D.acc,t0=tg;launch({x1:sl.x+.5,y1:sl.y+.3,x2:tg.x+R(-.35,.35),y2:tg.y-.3+R(-.35,.35),kind:'bullet',onHit:hit?()=>{if(!t0.dead)hitRaider(t0,D.dmg)}:null})}}else d.burst=0;
  }
  for(const sl of laneCache){const l=S.lanes[sl.key];if(!l||l.con||l.type!=='turret')continue;l.cool=(l.cool||0)-dt;if(l.cool>0)continue;
    const[tx,ty]=lanePostPos(sl),cx=tx+.5,cy=ty+.5,tg=nearestInside(cx,cy,9);
    if(tg){l.burst=(l.burst||0)+1;l.cool=l.burst>=8?(l.burst=0,1.6):.07;l.ax=tg.x;l.ay=tg.y;const hit=Math.random()<.45,t0=tg;launch({x1:cx,y1:cy-.35,x2:tg.x+R(-.35,.35),y2:tg.y-.3+R(-.35,.35),kind:'bullet',onHit:hit?()=>{if(!t0.dead)hitRaider(t0,5)}:null})}else l.burst=0}
  for(const sp of wpOfType('mortar')){
    const st=S.wp[sp.key];st.cool=(st.cool??R(2,4))-dt;if(st.cool>0)continue;
    const cx=sp.x0+sp.w/2,cy=sp.y0+sp.h/2,cand=aliveRaiders().filter(r=>!r.inside&&!r.fleeing&&Math.hypot(r.x-cx,r.y-cy)<34&&Math.hypot(r.x-cx,r.y-cy)>3);
    if(!cand.length){st.cool=1;continue}
    if(cnt('shell')<1){st.cool=2;st.noAmmo=true;continue}st.noAmmo=false;take('shell',1);
    st.cool=R(6,8);const tg=pick(cand);shells.push({x1:cx,y1:cy,x2:tg.x+R(-1,1),y2:tg.y+R(-1,1),t:0,dur:1.6});
    st.ang=Math.atan2(tg.y-cy,tg.x-cx);fx.push({k:'flash',x:cx,y:cy,z:.3,vx:0,vy:0,vz:0,t:0,life:.25,sz:12});
  }
  for(const sh of shells){sh.t+=dt;if(sh.t>=sh.dur&&!sh.hit){sh.hit=true;for(const r of aliveRaiders()){const dd=Math.hypot(r.x-sh.x2,r.y-sh.y2);if(!r.inside&&dd<3.4)hitRaider(r,R(24,40)*(1-dd/5))}boomFx(sh.x2,sh.y2);boomFx(sh.x2+R(-1,1),sh.y2+R(-1,1));if(Math.random()<.25)ignite(sh.x2+R(-1,1),sh.y2+R(-1,1))}}
  shells=shells.filter(s=>!s.hit);
  if(!aliveRaiders().length)endRaid();
}
function updRaider(r,dt){
  if(r.dead||r.gone)return;let slow=1;
  if(!r.inside&&!r.bug||(r.bug&&!r.inside)){const x=Math.floor(r.x),y=Math.floor(r.y);if(x>=0&&y>=0&&x<W&&y<H){const k=x+y*W,t=S.traps[k];
    if(t&&!t.con){if(t.type==='pit')slow=.35;else if(t.type==='mine'){delete S.traps[k];boomFx(x+.5,y+.5);for(const o of aliveRaiders())if(!o.inside&&Math.hypot(o.x-x-.5,o.y-y-.5)<2.4)hitRaider(o,R(40,60))}else if(t.ch>0){r.hitT=r.hitT||{};if(!r.hitT[k]){r.hitT[k]=1;t.ch--;hitRaider(r,R(14,22));dirtFx(r.x,r.y,5)}}}}}
  if(!r.inside&&r.st===1&&!r.bash&&!r.fleeing&&wup(r.side,'moat')&&r.tc!==undefined){const[ax,ay]=approachOf(r.tc,r.jit||0);if(Math.hypot(r.x-ax,r.y-ay)<3){slow=Math.min(slow,.5);if(!r.moatHit&&!offlineSim){r.moatHit=1;for(let k=0;k<4;k++)fx.push({k:'dust',x:r.x+R(-.3,.3),y:r.y+.2,z:.2,vx:R(-.3,.3),vy:-.2,vz:0,t:0,life:.6,sz:5})}}}
  if(r.inside){const ls=laneAt(Math.floor(r.x),Math.floor(r.y)),l=ls&&S.lanes[ls.key];if(l&&!l.con){if(l.type==='barricade')slow=Math.min(slow,.5);else if(l.type==='spikes'){slow=Math.min(slow,.65);r.hitT=r.hitT||{};if(!r.hitT['L'+ls.key]){r.hitT['L'+ls.key]=1;hitRaider(r,R(12,20));dirtFx(r.x,r.y,4)}}}}
  const sp=r.spd;r.spd=sp*slow;updRaider0(r,dt);r.spd=sp;
}
function updRaider0(r,dt){
  const R0=S.raid;r.cool-=dt;if(r.emerge>0){r.emerge-=dt;if(Math.random()<dt*3)dirtFx(r.x,r.y,2);return}
  if(r.bug&&(R0.flee||r.fleeing)&&!r.inside){r.gone=true;R0.fled++;if(r.loot){R0.stolen[r.loot.i]=(R0.stolen[r.loot.i]||0)+r.loot.n;r.loot=null}dirtFx(r.x,r.y,8);return}
  if(R0.flee&&!r.fleeing){r.fleeing=true;r.path=[];r.bash=false}
  if(r.fleeing){
    r.bash=false;
    if(r.inside){const bx=r.tc%W,by=Math.floor(r.tc/W);
      if(Math.floor(r.x)===bx&&Math.floor(r.y)===by){r.inside=false;r.path=[];r.out=1}
      else{if(!r.path||!r.path.length){if(!rGoTo(r,bx,by)){r.inside=false;r.out=1;return}}stepMove(r,dt,r.spd*1.1);return}}
    if(r.out===1){const[sx,sy]=stagePt(r);if(freeMove(r,sx,sy,r.spd*1.15,dt))r.out=2;return}
    if(freeMove(r,r.spawn[0],r.spawn[1],r.spd*1.15,dt)){r.gone=true;R0.fled++;if(r.loot){R0.stolen[r.loot.i]=(R0.stolen[r.loot.i]||0)+r.loot.n;r.loot=null}}
    return;
  }
  if(!r.inside){
    if(r.hold){if(S.t<R0.start+(R0.waveT||35)){r.bash=false;return}r.hold=false;if(!R0.waveMsg){R0.waveMsg=1;msg(R0.tac==='flank'?`The second group strikes the ${SIDEN[r.side]} wall!`:'The main army arrives!','bad');sfx('horn')}}
    const faceIn=()=>{const o=OUTV[r.side]||[-1,0];r.face=o[0]<0?'r':o[0]>0?'l':r.face};
    if(R0.tac==='siege'&&!R0.go&&!R0.bomb&&!r.st){if(!r.rl){const[qx,qy]=rallyPt(r);if(freeMove(r,qx,qy,r.spd,dt))r.rl=1;return}r.bash=false;faceIn();return}
    if(((R0.tac==='siege'&&R0.bomb)||R0.tac==='skirmish')&&!R0.go&&r.kind!=='archer'&&!r.st){const[hx,hy]=holdPt(r,R0.tac==='siege'?6.5:8);if(freeMove(r,hx,hy,r.spd,dt))faceIn();r.bash=false;return}
    const ranged=r.kind==='archer'&&!r.bug;
    if(ranged&&(r.st||((R0.tac==='skirmish'||R0.tac==='siege')&&!R0.go)||true)){
      let tg=null,bd=r.range||RFAC[r.fac||'tribal'].range||7;for(const c of S.cols){if(c.downed)continue;const o=shootOrigin(c);if(!fighter(c)&&!isOut(c))continue;const d=Math.hypot(o.x-r.x,o.y-r.y);if(d<bd){bd=d;tg=c}}
      if(tg){const o=shootOrigin(tg);r.face=o.x<r.x?'l':'r';r.bash=false;if(r.cool<=0){const burst=r.burst||(r.v==='heavy'&&r.fac!=='tribal'&&r.fac!=='mech');r.cool=(r.fac==='tribal'?R(1.4,1.9):R(2,2.8))*(burst?.25:r.v==='light'?.85:1);const pd=postDef(tg),cover=(pd?pd.cover:0)+(fighter(tg)&&!isOut(tg)&&wup(stationSide(tg),'batt')?.2:0),hit=Math.random()<.3*(1-cover),dm=RI(6,10)*(r.dmgM||1)*(burst?.4:1),t0=tg;launch({x1:r.x,y1:r.y-.4,x2:hit?o.x:o.x+R(-.8,.8),y2:hit?o.y-.3:o.y+R(-.6,.6),kind:r.shot||(r.fac==='tribal'?'arrow':r.fac==='space'?'charge':'bullet'),enemy:true,fire:r.fac==='tribal'&&Math.random()<.12,fac:r.fac,onHit:hit?()=>{if(!t0.downed)hurtColonist(t0,dm)}:null})}return}
    }
    if(r.kind==='archer'&&r.fac==='tribal'&&r.cool<=0&&Math.random()<.3){const pl=built().filter(p=>!FIRE_NOFUEL.includes(p.type));if(pl.length){const p=pick(pl),[ox,oy]=plotOrigin(p),tx=ox+RI(0,P-1)+.5,ty=oy+RI(0,P-1)+.5;if(Math.hypot(tx-r.x,ty-r.y)<14){r.cool=R(3,5);r.face=tx<r.x?'l':'r';launch({x1:r.x,y1:r.y-.4,x2:tx,y2:ty,kind:'arrow',enemy:true,fac:r.fac,fire:true})}}}
    if(S.wall>=0&&!S.breach[r.tc]){let best=null,bd=9;for(const k in S.breach){const i=+k;if(wallInfo.side[i]!==r.side||!wallInfo.exposed[i])continue;const d=Math.hypot(i%W+.5-r.x,Math.floor(i/W)+.5-r.y);if(d<bd){bd=d;best=i}}if(best!==null){r.tc=best}}
    if(ranged&&S.wall>=0&&!S.breach[r.tc]){const fd=Math.min(r.range||RFAC[r.fac||'tribal'].range||7,9)*.8,[fx2,fy2]=holdPt(r,fd);
      if(freeMove(r,fx2,fy2,r.spd,dt)){r.bash=false;faceIn();if(r.cool<=0){const burst=r.burst||(r.v==='heavy'&&r.fac!=='tribal'&&r.fac!=='mech');r.cool=(r.fac==='tribal'?R(1.6,2.2):R(2,2.8))*(burst?.3:1);const tc=r.tc,x2=tc%W+.5+R(-.3,.3),y2=Math.floor(tc/W)+.5+R(-.3,.3),wd=R(3,5)*(r.dmgM||1)*(r.wallM||1)*(burst?.45:1);
        launch({x1:r.x,y1:r.y-.4,x2,y2,kind:r.shot||(r.fac==='tribal'?'arrow':r.fac==='space'?'charge':'bullet'),enemy:true,fac:r.fac,vis:true,onHit:()=>{if(S.breach[tc]||S.wall<0)return;const hp=cellHP(tc)-wd;S.whp[tc]=hp;if(Math.random()<.5)wallFx(tc,1);if(hp<=0)breachCell(tc)}})}}
      return}
    if(!r.st){const[sx,sy]=stagePt(r);if(freeMove(r,sx,sy,r.spd,dt))r.st=1;return}
    if(S.wall>=0&&!S.breach[r.tc]){
      const[ax,ay]=approachOf(r.tc,r.jit);
      if(freeMove(r,ax,ay,r.spd,dt)){r.bash=true;const[ox,oy]=OUTV[r.side];r.face=ox<0?'r':ox>0?'l':r.face;
        if(wup(r.side,'pitch')){r.pT=(r.pT??R(.5,2.5))-dt;if(r.pT<=0){r.pT=2.6;hitRaider(r,R(6,10));fx.push({k:'dust',x:r.x,y:r.y-.6,z:.4,vx:0,vy:-.3,vz:0,t:0,life:1,sz:8})}}
        const hp=cellHP(r.tc)-dt*(r.kind==='archer'?1:3)*(r.dmgM||1)*(r.wallM||1);S.whp[r.tc]=hp;
        if(Math.random()<dt*(r.kind==='archer'?1.5:4))wallFx(r.tc,RI(1,3));
        if(hp<=0)breachCell(r.tc)}
      return;
    }
    r.bash=false;const bx=r.tc%W,by=Math.floor(r.tc/W);
    if(freeMove(r,bx+.5,by+.5,r.spd,dt)){r.inside=true;r.path=[]}
    return;
  }
  if(r.path&&r.path.length&&!(r.retT<=0)){r.retT=(r.retT??1)-dt;stepMove(r,dt,r.spd);return}
  r.retT=1;
  let col=null,bd=4.5;for(const c of S.cols){if(c.downed||outOfGrid(c))continue;const d=Math.hypot(c.x-r.x,c.y-r.y);if(d<bd){bd=d;col=c}}
  if(col){if(bd<=1.3){r.path=[];r.face=col.x<r.x?'l':'r';if(r.cool<=0){r.cool=1.3;sfx('swish',r.x,r.y);r.atkT=performance.now();r.atkA=Math.atan2(col.y-r.y,col.x-r.x);hurtColonist(col,RI(6,10)*(r.dmgM||1))}return}rGoTo(r,Math.floor(col.x),Math.floor(col.y));if(r.path)r.path=r.path.slice(0,4);return}
  if(r.bug&&!r.loot){const foods=[...KFOOD,'meal','finemeal','hay'].filter(i=>cnt(i)>=1);
    if(foods.length){const cells=[...kitchenCells(),...tableCells(),...storeCells()];if(cells.length){if(!r.steal)r.steal=pick(cells).slice(0,2);
      if(Math.floor(r.x)===r.steal[0]&&Math.floor(r.y)===r.steal[1]){const it=pick(foods),n=Math.min(Math.floor(cnt(it)),RI(10,24));take(it,n);r.loot={i:it,n};r.fleeing=true;r.path=[];return}
      if(!rGoTo(r,r.steal[0],r.steal[1]))r.steal=null;return}}
    r.bugT=(r.bugT||0)+dt;if(r.bugT>14){r.fleeing=true;r.path=[];return}}
  if(!r.bug&&!r.loot&&stockUsed()>0){
    const sc=storeCells();if(sc.length){
      if(!r.steal)r.steal=pick(sc).slice(0,2);
      if(Math.floor(r.x)===r.steal[0]&&Math.floor(r.y)===r.steal[1]){
        let best=null;for(const i in S.items)if(cnt(i)>=1&&(!best||ITEMS[i].v>ITEMS[best].v))best=i;
        if(best){const n=Math.min(Math.floor(cnt(best)),Math.max(1,Math.floor(40/ITEMS[best].v)),25);take(best,n);r.loot={i:best,n}}
        r.fleeing=true;return}
      if(!rGoTo(r,r.steal[0],r.steal[1]))r.steal=null;return}
  }
  let p=r.dmgPlot!==undefined?plotById(r.dmgPlot):null;
  if(!p||!p.type||(r.dmgT||0)>8){const bp=built();if(!bp.length){r.fleeing=true;return}p=pick(bp);r.dmgPlot=p.id;r.dmgT=0;const ec=plotEntry(p).cell;rGoTo(r,ec[0],ec[1]);return}
  r.dmgT=(r.dmgT||0)+dt;r.bash=true;p.dmg=Math.min(1,(p.dmg||0)+dt*.04);plotDirty=true;
}
function damagedCellOn(side){for(const k in S.whp){const i=+k;if(isWallCell(i)&&(side===null||wallInfo.side[i]===side)&&wallInfo.inner[i]>=0)return i}return null}
function breachDuty(c){
  if(S.wall<0)return null;let best=null,bd=12;
  for(const k in S.breach){const i=+k;if(!isWallCell(i))continue;const n=wallInfo.inner[i];if(n<0)continue;const d=Math.hypot(n%W+.5-c.x,Math.floor(n/W)+.5-c.y);if(d<bd){bd=d;best=i}}
  if(best===null)return null;const n=wallInfo.inner[best],nx=n%W+.5,ny=Math.floor(n/W)+.5;
  const near=S.cols.filter(o=>fighter(o)&&!o.needArm&&!(o.goPost&&Math.hypot(o.x-nx,o.y-ny)>3.5)).sort((a,b)=>Math.hypot(a.x-nx,a.y-ny)-Math.hypot(b.x-nx,b.y-ny)).slice(0,4);
  return near.includes(c)?{cell:best,k:near.indexOf(c)}:null;
}
function meleeHit(c,tg,dt){c.path=[];c.face=tg.x<c.x?'l':'r';c.useMelee=true;c.working=true;c.cool=(c.cool||0)-dt;if(c.cool<=0){c.cool=1.1;sfx('swish',c.x,c.y);c.atkT=performance.now();c.atkA=Math.atan2(tg.y-c.y,tg.x-c.x);const w=meleeW(c);dealHit(c,tg,WDMG[w||'fists']*(1+c.sk.shooting*.02))}}
function walkTo(c,x,y,dt,v){if(c.dest!==x+','+y||(!(c.path&&c.path.length)&&(Math.floor(c.x)!==x||Math.floor(c.y)!==y))){if(c.stuckT>0)return false;c.dest=x+','+y;if(!goTo(c,x,y)){c.path=[];c.stuckT=1.5;return false}}if(c.path&&c.path.length){stepMove(c,dt,v);return true}return false}
function allInner(){return[...new Set(wallInfo.cells.filter(i=>kind[i]===1&&wallInfo.straight[i]).map(i=>wallInfo.inner[i]).filter(n=>n>=0))]}
function updCombatant(c,dt){
  if(isGuard(c))equipGuard(c);
  const ra=raidActive();c.working=false;c.useMelee=false;if(c.stuckT>0)c.stuckT-=dt;
  if(c.militia&&c.needArm&&ra){if(armWalk(c,dt))return}
  if(ra&&rangedW(c)&&raidInside()){const lp=lanePostFor(c);
    if(lp){const[px2,py2]=lanePostPos(lp);c.lpost=lp.key;c.post=null;let near=null,nd=1.3;for(const r of aliveRaiders()){if(!r.inside)continue;const d=Math.hypot(r.x-c.x,r.y-c.y);if(d<nd){nd=d;near=r}}
      if(near){meleeHit(c,near,dt);c.status='Fighting off raiders at a guard post';return}
      if(Math.floor(c.x)!==px2||Math.floor(c.y)!==py2){if(walkTo(c,px2,py2,dt,walkSpd(c)*1.2)){c.status='Running to a guard post';return}}
      else{c.path=[];const rw=rangedW(c),wp=WEAPONS[rw],tg=nearestInside(c.x,c.y,wp.range+3);
        if(tg){c.face=tg.x<c.x?'l':'r';c.status='Shooting from a guard post';c.working=true;c.aimA=Math.atan2(tg.y-c.y,tg.x-c.x);c.aimT=performance.now();c.aim=(c.aim||0)+dt*workMult(c,'shooting')/wp.aim;
          if(c.aim>=1){c.aim=0;c.shotT=performance.now();gainXP(c,'shooting',1.5);const hit=Math.random()<clamp(.5+.04*c.sk.shooting+wp.acc,.15,.95),t0=tg;launch({x1:c.x,y1:c.y-.4,x2:hit?tg.x:tg.x+R(-.9,.9),y2:hit?tg.y-.3:tg.y+R(-.7,.7),kind:projKind(rw),onHit:hit?()=>{if(!t0.dead&&!t0.gone)dealHit(c,t0,WDMG[rw])}:null})}return}
        c.status='Holding a guard post';return}}
    else c.lpost=null}
  else if(c.lpost)c.lpost=null;
  if(ra){
    let tg=null,bd=14;for(const r of aliveRaiders()){if(!r.inside)continue;const d=Math.hypot(r.x-c.x,r.y-c.y);if(d<bd){bd=d;tg=r}}
    if(tg&&(meleeW(c)||!rangedW(c)||bd<4)){c.post=null;
      if(bd<=1.3){meleeHit(c,tg,dt);c.status='Fighting raiders'+(meleeW(c)?'':' with bare fists');return}
      c.chaseT=(c.chaseT||0)-dt;if(c.chaseT<=0||!(c.path&&c.path.length)){c.chaseT=.6;c.dest=null;goTo(c,clamp(Math.floor(tg.x),0,W-1),clamp(Math.floor(tg.y),0,H-1))}
      if(c.path&&c.path.length)stepMove(c,dt,walkSpd(c)*1.1);c.useMelee=true;c.status='Charging raiders';return}
    const bdty=breachDuty(c);
    if(bdty){c.post=null;const n=wallInfo.inner[bdty.cell],nx=n%W,ny=Math.floor(n/W);
      let near=null,nd=1.6;for(const r of aliveRaiders()){const d=Math.hypot(r.x-c.x,r.y-c.y);if(d<nd){nd=d;near=r}}
      if(near){meleeHit(c,near,dt);c.status='Defending the breach';return}
      const sp=[[0,0],[1,0],[0,1],[-1,0],[0,-1]][bdty.k%5];let tx=nx+sp[0],ty=ny+sp[1];if(!walkable(tx,ty)||!isBaseK(kAt(tx,ty))){tx=nx;ty=ny}
      if(walkTo(c,tx,ty,dt,walkSpd(c)*1.2)){c.status='Running to the breach';c.useMelee=true;return}
      c.useMelee=true;c.status='Guarding the breach with '+(meleeW(c)?'a '+ITEMS[meleeW(c)].n.toLowerCase():'bare fists');return}
  }
  if(!ra&&!S.raid){
    const dc=damagedCellOn(null);
    if(dc!==null){const n=wallInfo.inner[dc],tx=n%W,ty=Math.floor(n/W),sd=wallInfo.side[dc];
      if(walkTo(c,tx,ty,dt,walkSpd(c))){c.status='Heading to repair the '+SIDEN[sd]+' wall';return}
      if(Math.floor(c.x)!==tx||Math.floor(c.y)!==ty)return;
      c.working=true;c.status='Repairing the '+SIDEN[sd]+' wall';c.face=sd==='W'?'l':sd==='E'?'r':sd==='N'?'u':'d';
      repairCell(dc,dt*12*(S.wall+1)*workMult(c,'construction'));if(S.whp[dc]===undefined)gainXP(c,'construction',3);return}
    // patrol
    c.post=null;
    {const bk=wpOfType('barracks');if(bk.length){const s0=bk[c.id%bk.length],sp=[];for(let y=s0.y0;y<s0.y0+s0.h;y++)for(let x=s0.x0;x<s0.x0+s0.w;x++)if(walkable(x,y))sp.push([x,y]);
      if(sp.length){const tg=sp[(c.id*7)%sp.length];if(walkTo(c,tg[0],tg[1],dt,walkSpd(c)*.9)){c.status='Heading to the guard barracks';return}
        if(Math.floor(c.x)===tg[0]&&Math.floor(c.y)===tg[1]){c.working=true;const v=s0.h>s0.w,dummy=v?[s0.x0+1,s0.y0]:[s0.x0,s0.y0+1];c.face=v?(tg[1]>dummy[1]?'u':'d'):(tg[0]>dummy[0]?'l':'r');const ph=Math.floor(S.t/20+c.id)%3;c.status=ph===0?'Shooting at the target dummy':ph===1?'Sparring at the guard barracks':'Cleaning weapons at the barracks';gainXP(c,'shooting',dt*.5);return}}}}
    c.patT=(c.patT||0)-dt;
    if(c.patT<=0||!c.dest){const sp=allInner();if(sp.length){const n=pick(sp);c.dest=null;c.patX=n%W;c.patY=Math.floor(n/W)}c.patT=R(8,15)}
    if(c.patX!==undefined&&walkTo(c,c.patX,c.patY,dt,walkSpd(c)*.8)){c.status='Patrolling the wall';return}
    const ci=kAt(Math.floor(c.x)-1,Math.floor(c.y))===1?'l':kAt(Math.floor(c.x)+1,Math.floor(c.y))===1?'r':kAt(Math.floor(c.x),Math.floor(c.y)-1)===1?'u':'d';c.face=ci;
    c.status='On watch, looking out over the wall';if(!c.bub&&Math.random()<dt*.02)c.bub={k:'?',until:S.t+1.5};return;
  }
  // raid warning or active, outside raiders
  const side=stationSide(c)||'W',team=S.cols.filter(o=>fighter(o)&&stationSide(o)===side).sort((a,b)=>a.id-b.id),ti=Math.max(0,team.indexOf(c));
  const rw=rangedW(c);
  if(ra&&rw&&!(c.path&&c.path.length&&c.repo>1.2)){const o=shootOrigin(c),pd=postDef(c),wp=WEAPONS[rw],tg=nearestRaiderFrom(o.x,o.y,wp.range+(pd?pd.range:0)+(wup(side,'tower')?2:0));
    if(tg){c.path=[];c.face=tg.x<o.x?'l':'r';c.status='Shooting at raiders';c.working=true;c.aimA=Math.atan2(tg.y-o.y,tg.x-o.x);c.aimT=performance.now();c.aim=(c.aim||0)+dt*workMult(c,'shooting')/wp.aim;c.repo=Math.max(c.repo||0,1.5);
      if(c.aim>=1){c.aim=0;c.shotT=performance.now();gainXP(c,'shooting',1.5);const hit=Math.random()<clamp(.35+.04*c.sk.shooting+wp.acc+(pd?pd.acc:0),.15,.95),t0=tg;launch({x1:o.x,y1:o.y-.4,x2:hit?tg.x:tg.x+R(-.9,.9),y2:hit?tg.y-.3:tg.y+R(-.7,.7),kind:projKind(rw),onHit:hit?()=>{if(!t0.dead&&!t0.gone)dealHit(c,t0,WDMG[rw])}:null})}
      return}}
  c.repo=(c.repo||0)-dt;
  if(c.repo<=0||c.goX===undefined){c.repo=R(2,3.5);c.post=null;
    const gp=guardPlan().pos[c.id],posts=postPositions(side);
    if(gp){c.goX=gp.x;c.goY=gp.y;c.goPost=gp.post}
    else if(ti<posts.length){const p=posts[ti];c.goX=p.slot.ix;c.goY=p.slot.iy;c.goPost={slot:p.slot,k:p.k}}
    else{c.goPost=null;const sp=innerSpots(side);let fx2,fy2;const al=aliveRaiders().filter(r=>!r.inside&&r.side===side);
      if(al.length){const r0=al.reduce((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)<Math.hypot(b.x-c.x,b.y-c.y)?a:b);fx2=r0.x;fy2=r0.y}
      if(sp.length){const ord=fx2===undefined?sp:sp.slice().sort((a,b)=>Math.hypot(a%W-fx2,Math.floor(a/W)-fy2)-Math.hypot(b%W-fx2,Math.floor(b/W)-fy2));const n=ord[Math.min(ord.length-1,(ti-posts.length)*2)];c.goX=n%W;c.goY=Math.floor(n/W)}
      else{c.goX=GX+1;c.goY=GATE_Y}}}
  if(walkTo(c,c.goX,c.goY,dt,walkSpd(c)*1.15)){c.post=null;c.status=(ra?'Moving along the ':'Taking position at the ')+SIDEN[side]+' wall';return}
  c.post=c.goPost&&S.def[c.goPost.slot.id]?c.goPost:null;c.face=side==='W'?'l':side==='E'?'r':side==='N'?'u':'d';
  c.status=ra?(rw?'Scanning for raiders at the ':'Ready to defend the ')+SIDEN[side]+' wall':'Waiting for the raiders at the '+SIDEN[side]+' wall';
}
function repairNeeded(){
  if(raidActive())return null;
  const p=S.plots.find(p=>p.type&&p.dmg>0&&!S.cols.some(c=>c.job&&c.job.t==='repair'&&c.job.pid===p.id));if(p)return{kind:'plot',pid:p.id};
  for(const k in S.whp){const i=+k;if(!isWallCell(i)||wallInfo.inner[i]<0)continue;if(S.cols.some(c=>(c.job&&c.job.t==='repair'&&c.job.cell===i)||c.repT===i))continue;return{kind:'wall',cell:i}}
  return null;
}
function defTarget(){if(MOB){const b=baseBox(),land=innerHeight<520,top=56,bot=land?50:Math.round(ch*.46)+46,left=land?Math.min(440,cw*.56):0,x0=b.x0-3,x1=b.x1+2,y0=b.y0-2,y1=b.y1+2,z=clamp(Math.min((cw-left-12)/((x1-x0)*T),(ch-top-bot)/((y1-y0)*T)),.22,1.2);return{z,x:(x0+x1)/2*T-left/2/z,y:(y0+y1)/2*T+(bot-top)/2/z}}const b=baseBox(),sw=sideW(),x0=b.x0-8,x1=b.x1+6,y0=b.y0-6,y1=b.y1+6,bw=(x1-x0)*T,bh=(y1-y0)*T,z=clamp(Math.min((cw-sw-20)/bw,(ch-90)/bh),.2,1.2);return{z,x:(x0+x1)/2*T+sw/2/z,y:(y0+y1)/2*T+36/2/z}}
function buildSlot(id,type){
  const D=DEF[type];if(D.req&&!done(D.req)){msg('Needs research: '+reqName(D.req)+' first.','bad');return}
  if(!costOk(D)){msg(`Needs ${costStr(D)}.`,'bad');return}
  pay(D);S.def[id]={type};for(const c of S.cols){c.stationKey=null}msg(`${D.n} built on the ${SIDEN[slotById(id).side]} wall.`,'good');
}
function buildWP(key,type){
  const D=WPLOTS[type];if(D.req&&!done(D.req)){msg('Needs research: '+reqName(D.req)+' first.','bad');return}
  if(S.wp[key])return;if(!costOk(D)){msg(`Needs ${costStr(D)}.`,'bad');return}
  pay(D);S.wp[key]={type,con:{prog:0,need:conNeed(0)}};plotDirty=true;msg(`${D.n} planned.${conWho()}`,'good');
}
function demolishWP(key){const w=S.wp[key];if(!w)return;for(const c of workersOf('w'+key)){releaseJob(c);c.assign=null}refundCost(WPLOTS[w.type],w.con?1:.5);delete S.wp[key];plotDirty=true;sel=null;msg(`${WPLOTS[w.type].n} taken down. Half the cost refunded.`)}
function tryPlaceGate(x,y){
  if(x<0||y<0||x>=W||y>=H)return false;const i=x+y*W;
  if(S.wall<0){msg('Dig a trench first. Gates sit in the wall.','bad');gateMode=false;return false}
  if(kind[i]!==1){msg('Click a straight stretch of wall to place a gate.','bad');return false}
  const st=wallInfo.straight[i];if(!st){msg('Gates need a straight stretch of wall, not a corner.','bad');return false}
  const gt={x,y,v:st==='v'},cells=gateCells(gt);
  if(!cells.every(k=>kind[k]===1&&wallInfo.straight[k]===st)){msg('Not enough straight wall here for a gate.','bad');return false}
  if(cells.some(k=>{const kx=k%W,ky=(k-kx)/W;return nearGate(kx,ky,3)})){msg('Too close to another gate.','bad');return false}
  for(const sl of wallSlots())if(S.def[sl.id]&&cells.some(k=>{const kx=k%W,ky=(k-kx)/W;return Math.abs(kx-sl.x)<=2&&Math.abs(ky-sl.y)<=2})){msg(`Tear down the ${DEF[S.def[sl.id].type].n.toLowerCase()} next to this spot first.`,'bad');return false}
  for(const s of wpSlots())if(S.wp[s.key]&&cells.some(k=>{const kx=k%W,ky=(k-kx)/W;return kx>=s.x0-1&&kx<=s.x0+s.w&&ky>=s.y0-1&&ky<=s.y0+s.h})){msg(`The ${WPLOTS[S.wp[s.key].type].n.toLowerCase()} is in the way.`,'bad');return false}
  const c=gateCost();if(!costOk(c)){msg(`A gate needs ${costStr(c)}.`,'bad');return false}
  pay(c);S.gates.push(gt);gateMode=false;refreshSite();msg('Gate built.','good');return true;
}
function gateOK(x,y){if(x<0||y<0||x>=W||y>=H)return null;const i=x+y*W;if(kind[i]!==1)return null;if(biome().cave&&wallInfo.side[i]!=='W')return{cells:[i],ok:false};const st=wallInfo.straight[i];if(!st)return{cells:[i],ok:false};const gt={x,y,v:st==='v'},cells=gateCells(gt);return{cells,ok:cells.every(k=>kind[k]===1&&wallInfo.straight[k]===st)&&!cells.some(k=>{const kx=k%W,ky=(k-kx)/W;return nearGate(kx,ky,3)})}}
function removeGate(cell){const g=S.gates.find(g=>gateCells(g).includes(cell));if(!g||g.main)return;S.gates=S.gates.filter(x=>x!==g);refundCost(gateCost(),.5);for(const i of gateCells(g)){delete S.whp[i];delete S.breach[i]}sel=null;refreshSite();msg('Gate walled up. Half the cost refunded.')}
function wallFx(i,n){
  if(offlineSim||fx.length>600)return;const x=i%W,y=(i-x)/W,[ox,oy]=OUTV[wallInfo.side[i]||'W'],t=S.wall;
  for(let k=0;k<n;k++){const px=x+.5+ox*.45+(Math.random()-.5)*(oy?.8:.25),py=y+.5+oy*.45+(Math.random()-.5)*(ox?.8:.25),sp=R(1.2,4),a=Math.random()*Math.PI*2;
    if(t>=2&&Math.random()<.55)fx.push({k:'spark',x:px,y:py,z:R(.2,.6),vx:Math.cos(a)*sp*1.5,vy:Math.sin(a)*sp*1.5,vz:R(1,3),t:0,life:R(.2,.45)});
    else fx.push({k:t===0?'dirt':t===1?'chip':'stone',x:px,y:py,z:R(.1,.4),vx:Math.cos(a)*sp*.5+ox*1.4,vy:Math.sin(a)*sp*.5+oy*1.4,vz:R(2,4.5),t:0,life:R(.5,.9),rot:Math.random()*6,sz:R(1.6,3.2)})}
  if(n>10)for(let k=0;k<7;k++)fx.push({k:'dust',x:x+.5+R(-.6,.6),y:y+.5+R(-.6,.6),z:0,vx:R(-.4,.4),vy:R(-.4,.4),vz:0,t:0,life:R(1,1.8),sz:R(6,10)});
}
let stains=[],projs=[],stuck=[];
function projKind(w){return w==='bow'||w==='recurve'?'arrow':w==='charge'?'charge':'bullet'}
function launch(o){sfx(o.kind==='arrow'?'arrow':o.kind==='charge'?'charge':'gun',o.x1,o.y1);if(offlineSim){if(o.onHit)o.onHit();if(o.fire&&Math.random()<.3)ignite(o.x2,o.y2);return}const d=Math.hypot(o.x2-o.x1,o.y2-o.y1),sp={arrow:15,bullet:45,charge:28}[o.kind]||30;o.t=0;o.dur=Math.max(.06,d/sp);o.arc=o.kind==='arrow'?Math.min(2.4,.6+d*.12):0;projs.push(o)}
function tickProjs(dt){for(const p of projs){p.t+=dt;if(p.t>=p.dur&&!p.done){p.done=true;if(p.fire&&Math.random()<.3)ignite(p.x2,p.y2,'Fire arrows!');if(p.onHit)p.onHit();else if(!p.vis){if(p.kind==='arrow'){if(stuck.length>120)stuck.shift();stuck.push({x:p.x2,y:p.y2,a:Math.atan2(p.y2-p.y1,p.x2-p.x1),t:S.t})}else dirtFx(p.x2,p.y2,p.kind==='charge'?4:2)}}}projs=projs.filter(p=>!p.done)}
function drawProjs(){
  for(const st of stuck){const a=clamp(1-(S.t-st.t)/8,0,1);if(a<=0)continue;ctx.save();ctx.globalAlpha=a;ctx.translate(st.x*T,st.y*T);ctx.rotate(st.a);ctx.strokeStyle='#6e4a2a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle='#e8e2d0';ctx.fillRect(-8,-1.5,3,3);ctx.restore()}
  ctx.globalAlpha=1;stuck=stuck.filter(st=>S.t-st.t<8);
  for(const p of projs){const k=clamp(p.t/p.dur,0,1),gx=p.x1+(p.x2-p.x1)*k,gy=p.y1+(p.y2-p.y1)*k,h=p.arc*Math.sin(Math.PI*k),x=gx*T,y=(gy-h)*T;
    const vx=(p.x2-p.x1),vy=(p.y2-p.y1)-p.arc*Math.PI*Math.cos(Math.PI*k),a=Math.atan2(vy,vx);
    if(p.kind==='arrow'){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(gx*T,gy*T+3,1.6,0,7);ctx.fill();ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle=OUT;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(6,0);ctx.stroke();ctx.strokeStyle=p.enemy?'#a85a3a':'#c9a06a';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#9aa0a4';ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(4,-2.6);ctx.lineTo(4,2.6);ctx.closePath();ctx.fill();ctx.fillStyle=p.enemy?'#c83a2a':'#e8e2d0';ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(-12,-3);ctx.lineTo(-7,0);ctx.lineTo(-12,3);ctx.closePath();ctx.fill();ctx.restore()}
    else if(p.kind==='charge'){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='rgba(95,224,240,.35)';E(ctx,0,0,11,5);ctx.fill();ctx.strokeStyle='#bff6ff';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(5,0);ctx.stroke();ctx.restore()}
    else{const col=p.fac==='space'||p.fac==='mech'?'rgba(110,230,255,.95)':p.enemy?'rgba(255,190,120,.95)':'rgba(255,235,150,.95)';ctx.strokeStyle=col;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-Math.cos(a)*9,y-Math.sin(a)*9);ctx.lineTo(x,y);ctx.stroke()}}
}
function hitFx(x,y,armored,bug){if(offlineSim||fx.length>650)return;sfx(armored?'metal':'hit',x,y);
  if(armored&&Math.random()<.7){for(let k=0;k<5;k++){const a=Math.random()*Math.PI*2,sp=R(1.5,4);fx.push({k:'spark',x,y,z:.4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,vz:R(.5,2.5),t:0,life:R(.15,.35)})}return}
  const col=bug?'#9aa83a':'#9a1e18';for(let k=0;k<5;k++){const a=Math.random()*Math.PI*2,sp=R(.6,2.2);fx.push({k:'blood',col,x,y,z:.4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,vz:R(.5,2),t:0,life:R(.35,.6),sz:R(1.2,2.2)})}
  if(stains.length>220)stains.shift();stains.push({x:x+R(-.25,.25),y:y+.35+R(-.15,.15),r:R(3,6),col,t:S.t,seed:RI(1,999)})}
function critFx(x,y){if(offlineSim)return;fx.push({k:'crit',x,y:y-.3,z:0,vx:0,vy:0,vz:0,t:0,life:.75,sz:1,rot:Math.random()*6})}
function dirtFx(x,y,n){if(offlineSim||fx.length>600)return;for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,sp=R(.6,2);fx.push({k:'dirt',x,y,z:.1,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,vz:R(1.5,3),t:0,life:R(.4,.7),sz:R(1.4,2.6)})}}
function boomFx(x,y){if(offlineSim)return;sfx('boom',x,y);fx.push({k:'flash',x,y,z:0,vx:0,vy:0,vz:0,t:0,life:.3,sz:34});for(let k=0;k<14;k++){const a=Math.random()*Math.PI*2,sp=R(2,6);fx.push({k:'dirt',x,y,z:.2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,vz:R(3,6),t:0,life:R(.6,1),sz:R(2,3.4)})}for(let k=0;k<6;k++)fx.push({k:'dust',x:x+R(-.8,.8),y:y+R(-.8,.8),z:0,vx:R(-.5,.5),vy:R(-.5,.5),vz:0,t:0,life:R(1.2,2),sz:R(12,20)})}

let shots=[],huntKeep=false;
function wildCap(){const b=S.site.biome;return b==='forest'?11:b==='mountain'?4:b==='arid'?6:8}
function spawnWild(edge){
  const b=S.site.biome,r=Math.random(),type=b==='arid'?(r<.6?'hare':'boar'):b==='tundra'?(r<.6?'deer':'hare'):(r<.45?'deer':r<.75?'hare':'boar');
  let x=edge?-PADL+1+Math.random()*3:R(-PADL+3,-2),y=R(-PADT+3,H+PADB-3);for(let k=0;k<30&&hasRock&&rockAt(x,y);k++){x=edge?-PADL+1+Math.random()*3:R(-PADL+3,-2);y=R(-PADT+3,H+PADB-3)}
  S.wild.push({id:nid(),type,x,y,tx:x,ty:y,wt:R(1,6),flee:0,dead:false,r:0,face:Math.random()<.5?'l':'r'});
}
function tickWild(dt){
  if(!S.wild)S.wild=[];
  S.wildT=(S.wildT||0)-dt;
  if(S.wildT<=0){S.wildT=R(100,190);if(S.wild.filter(a=>!a.dead).length<wildCap())spawnWild(true)}
  for(const a of S.wild){
    if(a.dead)continue;
    const w=WILD[a.type];if(a.flee>0)a.flee-=dt;
    const dx=a.tx-a.x,dy=a.ty-a.y,d=Math.hypot(dx,dy),v=w.speed*(a.flee>0?4.5:1)*dt;
    if(d>.1){const m=Math.min(v,d),nx=a.x+dx/d*m,ny=a.y+dy/d*m;if(hasRock&&rockAt(nx,ny)){a.tx=a.x;a.ty=a.y;a.wt=0;a.flee=0}else{a.x=nx;a.y=ny}if(Math.abs(dx)>.05)a.face=dx<0?'l':'r';a.moving=true}
    else{a.moving=false;a.wt-=dt;if(a.wt<=0){a.wt=R(3,10);for(let k=0;k<8;k++){a.tx=clamp(a.x+R(-5,5),-PADL+2,-1.5);a.ty=clamp(a.y+R(-5,5),-PADT+2,H+PADB-2);if(Math.abs(a.ty-(GATE_Y+2))<2&&a.tx>-2)a.ty+=4;if(!hasRock||(!rockAt(a.tx,a.ty)&&clearLine(a.x,a.y,a.tx,a.ty)))break;a.tx=a.x;a.ty=a.y}}}
  }
}
function tick(dt,offline){
  S.t+=dt;S.hT=(S.hT||0)+dt;if(S.hT>=DAY/24){S.hT-=DAY/24;sampleStats()}
  S.etaT=(S.etaT||0)+dt;if(S.etaT>=1){const el=S.etaT;S.etaT=0;const cs=conSites().map(x=>x.con);if(S.proj)cs.push(S.proj);for(const c of cs){const d=(c.prog-(c.lp??c.prog))/el;c.lp=c.prog;c.rt=c.rt===undefined?d:c.rt*.55+d*.45}}
  if(S.test){S.silver=Math.max(S.silver,99999);for(const i in ITEMS)if(cnt(i)<500)S.items[i]=500}
  if(S.t-flowT0>=10){flowH.push(flowCur);if(flowH.length>12)flowH.shift();flowCur={};flowT0=S.t}
  const fert=done('fertilizer')?1.25:1;
  for(const k in S.plants){
    const q=S.plants[k];if(q.g>=1)continue;
    const p=S.plots[q.pid];if(!p||!p.type){delete S.plants[k];continue}
    let m=fert*tierDef(p).grow*clusterBonus(p)*(p.dmg?1-.5*p.dmg:1)*seasonGrow(p);
    if(p.type==='farm'){const bg=biome().grow;m*=bg<1&&p.tier>=1?1:bg}
    q.g=Math.min(1,q.g+dt*m/CROPS[q.c].grow);
  }
  tickWild(dt);
  tickPower(dt);
  tickProjs(dt);
  tickRaid(dt);
  if(!raidActive())for(const c of S.cols)if(!c.downed&&(c.hp??100)<100)c.hp=Math.min(100,(c.hp??100)+dt*(c.recover>0?.6:.15));
  for(const a of S.ani)updAni(a,dt);
  tickPens(dt);
  for(const c of S.cols)updCol(c,dt);
  for(const v of S.vis){
    if(v.path&&v.path.length){stepMove(v,dt,2.6);continue}
    if(v.walk&&v.walk.length){const q=v.walk[0];if(freeMove(v,q[0],q[1],2.6,dt))v.walk.shift();if(!v.walk.length){v.walk=null;if(v.leaving)v.gone=true;else if(v.home&&!goTo(v,v.home[0],v.home[1])){v.x=v.home[0]+.5;v.y=v.home[1]+.5}}continue}
    if(v.leaving){if(v.walkOut){v.walk=v.walkOut;v.walkOut=null}else v.gone=true;continue}
    if(v.em&&S.t>v.em.until)v.em=null;
    v.emT=(v.emT||0)-dt;
    if(v.emT<=0&&!v.em){
      v.emT=R(3,8);
      if(v.k==='caravan'){const r=Math.random();v.em=r<.35?{k:'chat',until:S.t+3}:r<.6?{k:'smoke',until:S.t+7}:r<.85?{k:'beer',until:S.t+6}:null;if(v.em&&v.em.k!=='chat')v.face=Math.random()<.5?'l':'d'}
      else if(v.k==='wanderer')v.em={k:'?',until:S.t+2.5};
      else if(v.k==='pack'&&Math.random()<.5)v.face=v.face==='l'?'r':'l';
    }
  }
  S.vis=S.vis.filter(v=>!v.gone);
  if(!S.exps||!S.loadouts)ensureState2();tickLoadouts(dt);tickFireSources(dt);tickFire(dt);tickWeather(dt);tickStory(dt);tickExp(dt);tickBoss(dt);tickEvents(dt);
  if(offline&&S.letters.length>12)S.letters=S.letters.slice(-12);
}

