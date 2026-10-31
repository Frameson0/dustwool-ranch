/* ================= jobs ================= */
function releaseJob(c){
  const j=c.job;
  if(j){
    if(j.t==='harvest'){const p=S.plants[j.x+','+j.y];if(p&&p.r===c.id)p.r=0}
    if(j.t==='sow')sowRes.delete(j.x+','+j.y);
    if(j.t==='tend'){const a=aniById(j.aid);if(a&&a.r===c.id)a.r=0}
    if(j.t==='pick'||j.t==='collect'){const g=S.ground.find(g=>g.id===j.gid);if(g&&g.r===c.id)g.r=0}
    if(j.t==='gather'){const o=S.outside.find(o=>o.id===j.oid);if(o&&o.r===c.id)o.r=0}
    if(j.t==='hunt'&&j.aid){const a=S.wild.find(a=>a.id===j.aid);if(a&&a.r===c.id)a.r=0}
  }
  if(j&&j.extra){for(const[i,m]of j.extra){add(i,m);flow(i,m)}j.extra=null}
  if(c.hold){for(const[i,n]of c.hold.all){add(i,n);flow(i,n)}c.hold=null}
  c.hunting=false;
  if(c.carcass){const w=WILD[c.carcass];add('meat',w.meat);add('leather',w.leather);c.carcass=null}
  if(c.load&&c.load.length&&!isHauler(c)){for(const l of c.load){add(l.i,l.n);flow(l.i,l.n)}c.load=[]}
  c.job=null;c.path=[];c.sleeping=false;c.loafing=false;c.em=null;
}
function assignTargetName(id){if(id==='out')return'Gathering outside';if(id==='build')return'clearing new land';if(id==='guard'||(typeof id==='string'&&id.startsWith('g:')))return'guard duty on the wall';const p=plotById(id);return p?plotLabel(p):'—'}
function assign(c,pid){
  if(c.assign===pid)return true;
  if(typeof pid==='string'&&pid.startsWith('g:'))pid='guard';
  if(c.assign===pid)return true;
  const toGuard=pid==='guard';
  if(pid!==null&&pid!=='out'&&pid!=='build'&&!toGuard){
    const p=plotById(pid);
    if(!p||!slots(p)){msg(p&&p.type?`${plotName(p)} needs no workers.`:'Build something on this plot first.','bad');return false}
    if(workersOf(pid).filter(o=>o!==c).length>=slots(p)){msg(`${plotName(p)} is full (${slots(p)} worker${slots(p)>1?'s':''}). Upgrade it for more slots.`,'bad');return false}
  }
  const wasGuard=isGuard(c);releaseJob(c);c.assign=pid;c.post=null;c.stationKey=null;c.eqT=0;
  const toHunt=typeof pid==='number'&&plotById(pid)&&plotById(pid).type==='hunting';
  if(wasGuard&&!toGuard)unequip(c,toHunt&&c.weapon&&RANGED.includes(c.weapon));
  else if(!toHunt&&!toGuard){if(c.weapon){add(c.weapon,1);c.weapon=null}if(c.melee){add(c.melee,1);c.melee=null}}
  msg(`${c.nick}: ${pid!==null?'now '+(pid==='out'?'gathers outside the walls':pid==='build'?'clearing new land':toGuard?'on '+assignTargetName(pid):'works at '+assignTargetName(pid)):'unassigned'}.`);
  return true;
}
function plotLabel(p){return plotName(p)+(p.type==='farm'||p.type==='hydro'?' ('+CROPS[p.crop].n+')':'')}
function nearest(c,list,fn){let best=null,bd=1e9;for(const it of list){const[x,y]=fn(it),d=Math.abs(x+.5-c.x)+Math.abs(y+.5-c.y);if(d<bd){bd=d;best=it}}return best}
function cropCells(p){const[ox,oy]=plotOrigin(p);return layouts[p.id].crops.map(([x,y])=>[ox+x,oy+y])}

function newJob(c){
  if(c.recover>0)return{t:'sleep',st:0,recover:true};
  if(outOfGrid(c))return{t:'comeback'};
  if(c.carcass)return{t:'hunt',st:'home'};
  if(c.load&&c.load.length&&isHauler(c))return{t:'unload',st:0};
  if(isNight())return{t:'sleep',st:0};
  if(c.carry)return{t:'haul',st:0};
  if(c.food<.35&&commons()&&(cnt('meal')>=1||cnt('finemeal')>=1))return{t:'eat',st:0};
  if(c.assign==='out')return gatherJob(c)||{t:'loaf',st:0};
  if(c.assign==='build')return buildJob(c)||restJob(c,null,c.status);
  const p=c.assign!==null?plotById(c.assign):null;
  if(p&&!p.type){c.assign=null}
  if(p&&p.type==='construction'){const rp=repairFor(c);if(rp)return{t:'repair',...rp,st:0};const cj=conJob(c);if(cj)return cj;if(S.proj){const bj=buildJob(c);if(bj)return bj}return restJob(c,p,'Nothing to build right now')}
  if(p&&GROW_TYPES.includes(p.type))return growJob(c,p)||restJob(c,p,c.status);
  if(p&&p.type==='hunting')return huntJob(c,p)||restJob(c,p,c.status);
  if(p&&p.type==='pen')return penJob(c,p)||restJob(c,p,'Nothing to tend right now');
  if(p&&CRAFT_TYPES.includes(p.type))return craftJob(c,p)||restJob(c,p,c.status);
  if(p&&p.type==='quarry'){if(paused(p)){c.status=pauseText(p);return restJob(c,p,c.status)}return{t:'mine',pid:p.id,st:0,p:0,sti:freeStation(c,p)}}
  if(p&&p.type==='research'){if(!S.research.cur)return restJob(c,p,'No research project selected');return{t:'research',pid:p.id,st:0}}
  if(p&&p.type==='storage'){if(c.load&&c.load.length)return{t:'unload',st:0};return haulJob(c,p)||restJob(c,p,c.status)}
  if(!hasConstructors()){const cj=conJob(c);if(cj)return cj}
  const rp=repairNeeded();if(rp)return{t:'repair',...rp,st:0};
  return wanderJob(c,commons(),'Idle');
}
const LIMIT_TYPES=['farm','hydro','treefarm','kitchen','workshop','tailor','weaponsmith','armorsmith','hunting','quarry','refinery','munitions','fabrication'];
function quarryOres(p){const o=['stone'];const d=tierDef(p);for(const x of d.ores||[]){if(x==='plasteel'&&!(S.site.biome==='mountain'||S.site.biome==='tundra'||S.site.biome==='cave'))continue;o.push(x)}return o}
function quarryOre(p){const o=quarryOres(p);return o.includes(p.prod)?p.prod:'stone'}
function limitItem(p){if(p.type==='quarry')return quarryOre(p);if(GROW_TYPES.includes(p.type))return CROPS[p.crop].item;if(p.type==='hunting')return'meat';if(BILLS[p.type])return null;if(p.type==='quarry')return'stone';return null}
function hasLimit(p){return p.limit!==undefined&&p.limit!==null&&p.limit!==''}
function paused(p){if(!hasLimit(p)||BILLS[p.type])return false;const i=limitItem(p);return i&&cnt(i)>=p.limit}
function pauseText(p){const i=limitItem(p);return`Paused: ${fmt(cnt(i))} ${ITEMS[i].n.toLowerCase()} in stock (limit ${p.limit})`}
function growJob(c,p){
  if(paused(p)){c.status=pauseText(p);return null}
  if(p.type==='farm'&&biome().nofarm){c.status='No soil here. Only hydroponics works.';return null}
  const cells=cropCells(p);
  const ripe=cells.filter(([x,y])=>{const q=S.plants[x+','+y];return q&&q.g>=1&&!q.r});
  if(ripe.length){const t=nearest(c,ripe,a=>a);S.plants[t[0]+','+t[1]].r=c.id;return{t:'harvest',x:t[0],y:t[1],st:0,p:0,pid:p.id}}
  const crop=CROPS[p.crop];
  if(!owns(p.crop)){c.status=`No ${crop.n.toLowerCase()} seeds. Buy them once from a trader.`;return null}
  const empty=cells.filter(([x,y])=>!S.plants[x+','+y]&&!sowRes.has(x+','+y));
  if(!empty.length){c.status='Tending growing crops';return null}
  const t=nearest(c,empty,a=>a);sowRes.set(t[0]+','+t[1],c.id);
  return{t:'sow',x:t[0],y:t[1],st:0,p:0,crop:p.crop,pid:p.id};
}
function penJob(c,p){
  const eggs=haulers().length?[]:S.ground.filter(g=>g.pen===p.id&&g.lay&&!g.r);
  if(eggs.length){const g=nearest(c,eggs,g=>[g.x,g.y]);g.r=c.id;return{t:'pick',gid:g.id,x:g.x,y:g.y,st:0,p:0}}
  const ready=S.ani.filter(a=>a.pen===p.id&&!a.r&&!(a.path&&a.path.length)&&a.age>=ANIMALS[a.type].adult&&a.p>=1&&!ANIMALS[a.type].ground);
  if(ready.length){const a=nearest(c,ready,a=>[Math.floor(a.x),Math.floor(a.y)]);a.r=c.id;return{t:'tend',aid:a.id,st:0,p:0,pid:p.id}}
  return null;
}
function gatherJob(c){
  const woodFull=S.woodLimit!==undefined&&S.woodLimit!==null&&cnt('wood')>=S.woodLimit;
  const list=S.outside.filter(o=>o.mark&&!o.r&&(o.k==='chunk'?S.t-o.land>3:o.k==='rock'?true:o.g>=1&&!woodFull));
  if(!list.length)return null;
  const o=nearest(c,list,o=>[o.x,o.y]);o.r=c.id;return{t:'gather',oid:o.id,st:0,p:0};
}
/* ---- bills: each crafting building keeps an ordered list of bills.
   b={id,r:recipe,mode:'until'|'count'|'forever',n,done,off}. Workers take the first bill that can run. */
function bills(p){if(!p.bills){p.bills=[];if(BILLS[p.type]){const r=BILLS[p.type].includes(p.bill)?p.bill:BILLS[p.type][0];p.bills.push({id:nid(),r,mode:hasLimit(p)?'until':'forever',n:hasLimit(p)?p.limit:20,done:0});p.limit=null}}return p.bills}
function billBusy(b){let n=0;for(const c of S.cols)if(c.job&&c.job.t==='craft'&&c.job.bid===b.id)n++;return n}
function billWhy(p,b){const rec=RECIPES[b.r];if(!rec)return'Unknown recipe';if(b.off)return'Suspended';if(rec.req&&!done(rec.req))return'Needs research: '+reqName(rec.req);if((rec.tier||0)>p.tier)return'Needs a tier '+(rec.tier+1)+' building';
  if(b.mode==='until'&&cnt(rec.out)+billBusy(b)*rec.outN>=b.n)return`Target reached (${fmt(cnt(rec.out))} in stock)`;if(b.mode==='count'&&(b.done||0)+billBusy(b)>=b.n)return'Done';
  if(!localIngr(p,rec)&&!pickIngr(rec))return'Waiting for ingredients ('+rec.d+')';return null}
/* ---- input racks: tier 2+ crafting buildings keep ingredients next to the benches (p.stock, outside main storage) */
function rackCap(p){return CRAFT_TYPES.includes(p.type)&&!p.small?[0,60,100,150,200][p.tier]||0:0}
function rackUsed(p){let n=0;for(const i in p.stock||{})n+=p.stock[i];for(const c of S.cols){const j=c.job;if(j&&j.t==='craft'&&j.pid===p.id&&j.extra)for(const[i,m]of j.extra)n+=m}return n}
function localIngr(p,rec){if(!p.stock)return null;const out=[];for(const s of rec.in){let best=null;for(const i of s.any)if((p.stock[i]||0)>=s.n&&(!best||p.stock[i]>p.stock[best]))best=i;if(!best)return null;out.push([best,s.n])}return out}
function rackReturn(p){for(const i in p.stock||{})if(p.stock[i]>0)add(i,p.stock[i]);p.stock={}}
function pickIngr(rec){const out=[];for(const s of rec.in){let best=null;for(const i of s.any)if(cnt(i)>=s.n&&(!best||cnt(i)>cnt(best)))best=i;if(!best)return null;out.push([best,s.n])}return out}
function freeStation(c,p){const L=layouts[p.id],used=new Set(S.cols.filter(o=>o!==c&&o.job&&o.job.pid===p.id&&o.job.sti!==undefined).map(o=>o.job.sti));for(let i=0;i<L.stations.length;i++)if(!used.has(i))return i;return 0}
function craftJob(c,p){
  const L=bills(p);if(!L.length){c.status='No bills. Add one in the building panel.';return null}
  let first=null;for(const b of L){const why=billWhy(p,b);if(!why){const rec=RECIPES[b.r];if(!localIngr(p,rec)&&!storeCells().length){c.status='No storage plot';return null}p.bill=b.r;return{t:'craft',pid:p.id,st:0,p:0,sti:freeStation(c,p),rk:b.r,bid:b.id}}if(!first)first=RECIPES[b.r].n+': '+why.toLowerCase()}
  c.status=L.every(b=>/^(Done|Target|Suspended)/.test(billWhy(p,b)))?'All bills done or paused':first;return null;
}
function restJob(c,p,reason){
  if(!hasConstructors()&&!isConstructor(c)){const cj=conJob(c);if(cj)return cj}
  const rp=repairNeeded();if(rp)return{t:'repair',...rp,st:0};
  const cp=commons();
  if(!cp)return wanderJob(c,p,reason);
  const j=wanderJob(c,cp,null);c.status='Relaxing at the '+plotName(cp).toLowerCase()+(reason?' \u00b7 '+reason:'');j.w=R(5,9);return j;
}
function wanderJob(c,p,status){
  let cells=[];
  if(p){const[ox,oy]=plotOrigin(p);for(let k=0;k<8;k++){const x=ox+RI(0,P-1),y=oy+RI(0,P-1);if(walkable(x,y))cells.push([x,y])}
    if(p.type==='commons'){const L=layouts[p.id];cells=L.seats.map(([x,y])=>[ox+x,oy+y])}}
  else if(c.assign==='out'){for(let k=0;k<10;k++){const x=RI(Math.max(0,GX-7),GX-2),y=GATE_Y+RI(-3,3);if(walkable(x,y))cells.push([x,y])}}
  else{const cx=Math.floor(c.x),cy=Math.floor(c.y);for(let k=0;k<14;k++){const x=cx+RI(-4,4),y=cy+RI(-4,4);if(walkable(x,y)&&kind[x+y*W]===2&&owned[x+y*W]<0)cells.push([x,y])}}
  if(status)c.status=status;
  if(!cells.length)return{t:'wait',w:2};
  const t=pick(cells);return{t:'wander',x:t[0],y:t[1],st:0,w:R(3,7),social:!!(p&&p.type==='commons')};
}
function eatInPlace(c){
  if(c.food>.35)return;
  if(c.food>.15&&commons()&&(cnt('meal')>=1||cnt('finemeal')>=1))return;
  for(const i of['finemeal','meal']){if(cnt(i)>=1){take(i,1);flow(i,-1);c.food+=ITEMS[i].food;c.buff=1;return}}
  for(const i of['potato','rice','corn','egg']){while(c.food<.9&&cnt(i)>=1){take(i,1);flow(i,-1);c.food+=ITEMS[i].food}if(c.food>=.9){c.buff=1;return}}
}
function updCol(c,dt){
  c.food=Math.max(0,c.food-dt/DAY);eatInPlace(c);
  if(c.bub&&S.t>c.bub.until)c.bub=null;
  if(c.recover>0)c.recover-=dt;
  if(c.downed){c.status='Knocked down';c.working=false;if(!raidActive()){c.downT=(c.downT||0)+dt;if(c.downT>3){c.downed=false;c.hp=Math.max(c.hp,30);c.recover=DAY*.35;c.militia=false;msg(`${c.nick} got back up and limps to bed.`)}}return}
  if((raidActive()||(S.raid&&S.raid.recall))&&!fighter(c)&&(raidInside()||isOut(c)||c.assign==='out'||c.assign==='build')){
    if(!c.cover){releaseJob(c);c.cover=true;c.stationKey=null}
    c.status='Taking cover';c.working=false;c.sleeping=false;
    if(outOfGrid(c)){freeMove(c,GX-2.5,GATE_Y+.5,walkSpd(c)*1.2,dt);return}
    if(c.path&&c.path.length){stepMove(c,dt,walkSpd(c)*1.2);return}
    const b=bedOf(c),cp=commons();const tgt=b?[b.x,b.y]:cp?(()=>{const[ox,oy]=plotOrigin(cp);return[ox+1,oy+1]})():[GX+3,GATE_Y];
    if(Math.floor(c.x)!==tgt[0]||Math.floor(c.y)!==tgt[1]){if(!c.coverTried){c.coverTried=true;goTo(c,tgt[0],tgt[1])}}
    return;
  }
  if(c.cover&&!raidActive()){c.cover=false;c.coverTried=false}
  if(c.fireJob&&fireFight(c,dt))return;
  if(fighter(c)&&(raidActive()||!isNight())){if(c.job){releaseJob(c)}c.sleeping=false;if(c.wait>0)c.wait-=dt;updCombatant(c,dt);return}
  if(c.wait>0){c.wait-=dt;if(c.job&&c.job.social&&!c.bub&&Math.random()<dt*.22){c.bub={k:pick(['chat','chat','ha','note','cards','cards']),until:S.t+2.8}}return}
  if(isNight()&&!raidActive()&&(!c.job||c.job.t!=='sleep')&&!c.carry&&!c.carcass&&!outOfGrid(c)&&!(c.load&&c.load.length)){releaseJob(c);c.job={t:'sleep',st:0}}
  if(c.path&&c.path.length){stepMove(c,dt,walkSpd(c));return}
  if(!c.job){c.job=newJob(c);if(!c.job){c.wait=1.5;return}}
  const j=c.job;c.working=false;
  switch(j.t){
    case 'wait':c.wait=j.w;c.job=null;break;
    case 'repair':{
      if(j.kind==='plot'){const p=plotById(j.pid);if(!p||!p.type||!(p.dmg>0)){c.job=null;return}
        if(j.st===0){const ec=plotEntry(p).cell;if(!goTo(c,ec[0],ec[1])){c.job=null;c.wait=1;return}j.st=1;c.status='Going to repair the '+plotName(p).toLowerCase();return}
        c.status='Repairing the '+plotName(p).toLowerCase();c.working=true;c.face='u';p.dmg=Math.max(0,p.dmg-dt*.06*workMult(c,'construction')*conBonus(c));if(p.dmg<=0){p.dmg=0;c.job=null;gainXP(c,'construction',4);plotDirty=true}return}
      const wc=j.cell;if(!isWallCell(wc)||S.whp[wc]===undefined){c.job=null;return}
      const inn=wallInfo.inner[wc],sd=wallInfo.side[wc];if(inn<0){c.job=null;return}
      if(j.st===0){if(!goTo(c,inn%W,Math.floor(inn/W))){c.job=null;c.wait=1;return}j.st=1;c.status='Going to repair the '+SIDEN[sd]+' wall';return}
      c.status='Repairing the '+SIDEN[sd]+' wall';c.working=true;c.face=sd==='W'?'l':sd==='E'?'r':sd==='N'?'u':'d';
      repairCell(wc,dt*20*(S.wall+1)*workMult(c,'construction')*conBonus(c));
      if(S.whp[wc]===undefined){c.job=null;gainXP(c,'construction',4)}return}
    case 'con':{
      const st=conSites().find(x=>x.id===j.sid);if(!st){c.job=null;return}
      if(j.st===0){if(!goTo(c,j.x,j.y)){c.job=null;c.wait=1;return}j.st=1;c.status='Going to build the '+st.name;return}
      c.working=true;c.status='Building the '+st.name;
      st.con.prog+=dt*workMult(c,'construction')*conBonus(c)/st.con.need;gainXP(c,'construction',dt*.5);
      if(!offlineSim&&Math.random()<dt*.9)dirtFx(c.x+(Math.random()-.5)*.6,c.y+.2,2);
      if(st.con.prog>=1){finishSite(st.id);c.job=st.id==='road'?conJob(c):null;return}
      j.w-=dt;if(j.w<=0)c.job=null;
      break;}
    case 'build':{
      const pr=S.proj;if(!pr){c.job=null;return}
      if(j.st===0){if(!goTo(c,j.x,j.y)){c.job=null;c.wait=1;return}j.st=1;c.status='Heading out to clear land';return}
      const clr=pr.prog<.6;c.working=true;
      c.status=clr?(pr.obs0?'Clearing land: felling trees and breaking rocks':'Leveling the ground'):S.wall<0?'Marking out the new land':['Digging a trench around the new land','Raising a palisade around the new land','Laying a stone wall around the new land','Building a reinforced wall around the new land'][S.wall];
      pr.prog+=dt*workMult(c,'construction')*conBonus(c)*(c.traits.includes('strong')?1.15:1)/pr.need;gainXP(c,'construction',dt*.3);
      if(!offlineSim&&Math.random()<dt*1.6)dirtFx(c.x+(Math.random()-.5)*.5,c.y+.2,3);
      const p=plotById(pr.pid),want=Math.floor(clamp(pr.prog/.6,0,1)*pr.obs0),obs=plotObstacles(p);
      while(pr.obs0-obs.length<want&&obs.length){const o=nearest(c,obs,o=>[o.x,o.y]);obs.splice(obs.indexOf(o),1);S.outside=S.outside.filter(x=>x!==o);
        if(o.r){const g=colById(o.r);if(g&&g!==c)releaseJob(g)}
        if(o.k==='tree'){const n=o.g>=.5?RI(10,16):RI(2,5);add('wood',n);flow('wood',n)}else{const n=RI(5,9);add('stone',n);flow('stone',n)}
        if(!offlineSim)dirtFx(o.x+.5,o.y+.5,8);if(sel&&sel.k==='out'&&sel.id===o.id)sel=null}
      if(pr.prog>=1){completeExpansion();return}
      j.w-=dt;if(j.w<=0)c.job=null;
      break;}
    case 'comeback':{c.status='Heading back to the gate';c.hunting=false;if(freeMove(c,GX-2.5,GATE_Y+.5,walkSpd(c),dt))c.job=null;return}
    case 'arm':{
      if(j.st===0){const st=armSpot();if(!st){c.job=null;c.wait=2;return}if(!goTo(c,st[0],st[1])){c.job=null;c.wait=2;return}j.st=1;c.status='Fetching a weapon from the '+(armories().length?'armory':'storage');return}
      const w=bestWeapon();if(w){take(w,1);c.weapon=w;msg(`${c.nick} picked up a ${ITEMS[w].n.toLowerCase()}.`)}c.job=null;return}
    case 'hunt':{
      const p=plotById(c.assign);
      if(j.st==='home'){
        if(!c.carcass){c.job=null;return}
        if(!p||p.type!=='hunting'){const w=WILD[c.carcass];c.carry={i:'meat',n:w.meat};c.carry2={i:'leather',n:w.leather};c.carcass=null;c.job={t:'haul',st:0};return}
        if(outOfGrid(c)){c.status='Carrying a '+WILD[c.carcass].n.toLowerCase()+' home';c.hunting=false;freeMove(c,GX-2.5,GATE_Y+.5,walkSpd(c)*.8,dt);return}
        if(!j.inside){const L=layouts[p.id],[ox,oy]=plotOrigin(p),stn=L.stations[0];if(!goTo(c,ox+stn[2],oy+stn[3])){c.wait=1;return}j.inside=true;c.status='Carrying a '+WILD[c.carcass].n.toLowerCase()+' home';return}
        c.status='Butchering a '+WILD[c.carcass].n.toLowerCase();c.face='u';c.working=true;j.p=(j.p||0)+dt*workMult(c,'cooking')*tierDef(p).speed/6;
        if(j.p>=1){const w=WILD[c.carcass],m=.85+c.sk.cooking*.02;c.carry={i:'meat',n:Math.round(w.meat*m)};c.carry2={i:'leather',n:Math.round(w.leather*m)};c.carcass=null;gainXP(c,'cooking',4);S.stats.hunted=(S.stats.hunted||0)+1;c.job={t:'haul',st:0}}
        return;
      }
      const a=S.wild.find(a=>a.id===j.aid);
      if(!a){c.job=null;return}
      const wp=WEAPONS[c.weapon]||WEAPONS.spear;
      if(j.st===0){if(!goTo(c,GX-3,GATE_Y)){c.job=null;c.wait=2;return}j.st=1;c.status='Heading out to hunt';return}
      c.hunting=true;
      if(a.dead){c.status='Fetching the '+WILD[a.type].n.toLowerCase();if(freeMove(c,a.x,a.y,walkSpd(c),dt)){S.wild=S.wild.filter(x=>x!==a);c.carcass=a.type;c.hunting=false;c.job={t:'hunt',st:'home'}}return}
      const d=Math.hypot(a.x-c.x,a.y-c.y);
      if(d>wp.range){c.status='Stalking a '+WILD[a.type].n.toLowerCase();j.p=0;freeMove(c,a.x,a.y,walkSpd(c)*(a.flee>0?1.1:.8),dt,wp.range*.8);return}
      c.status='Aiming at a '+WILD[a.type].n.toLowerCase();c.face=a.x<c.x?'l':'r';
      j.p=(j.p||0)+dt*workMult(c,'shooting')/wp.aim;
      if(j.p>=1){j.p=0;gainXP(c,'shooting',5);
        const hit=Math.random()<clamp(.4+.045*c.sk.shooting+wp.acc,.2,.95);if(wp.range<2){c.atkT=performance.now();c.atkA=Math.atan2(a.y-c.y,a.x-c.x)}else launch({x1:c.x,y1:c.y-.4,x2:hit?a.x:a.x+R(-.8,.8),y2:hit?a.y-.2:a.y+R(-.6,.6),kind:projKind(c.weapon||c.melee),vis:hit});
        if(hit){a.dead=true;a.flee=0;msg(`${c.nick} brought down a ${WILD[a.type].n.toLowerCase()}.`,'good')}
        else{a.flee=4;const dx=a.x-c.x,dy=a.y-c.y,l=Math.hypot(dx,dy)||1;a.tx=clamp(a.x+dx/l*8,-PADL+2,-1);a.ty=clamp(a.y+dy/l*8,-PADT+2,H+PADB-2)}}
      return;}
    case 'loaf':{
      if(j.st===0){const idx=workersOf('out').indexOf(c),spots=[[GX-1,GATE_Y-2],[GX-2,GATE_Y-2],[GX-1,GATE_Y+2],[GX-2,GATE_Y-3],[GX-1,GATE_Y+3]],sp=spots[Math.max(0,idx)%spots.length];c.em=null;c.loafing=false;if(!goTo(c,sp[0],sp[1])){c.job=null;c.wait=2;return}j.st=1;c.status='Heading to the gate';return}
      c.loafing=true;c.face='d';
      if(!c.em)c.em={k:pick(['smoke','read','read']),until:1e12};
      c.status=c.em.k==='smoke'?'Smoking by the gate, nothing to gather':'Reading by the gate, nothing to gather';
      c.wait=3;c.job={t:'loaf',st:2};
      if(j.st===2&&c.food<.35){c.em=null;c.loafing=false;c.job=null;c.wait=0;return}
      if(j.st===2){const gj=gatherJob(c);if(gj){c.em=null;c.loafing=false;c.wait=0;c.job=gj}}
      return;}
    case 'wander':if(j.st===0){if(!goTo(c,j.x,j.y)){c.job=null;c.wait=1;return}j.st=1;return}
      if(j.st===1){c.wait=j.w;j.st=2;if(!j.social)c.job=null;else{const cp=commons();if(cp){const[ox]=plotOrigin(cp);c.face=c.x<ox+2.5?'r':'l'}}return}
      c.job=null;break;
    case 'sleep':{
      const b=bedOf(c);
      if(j.st===0){if(b&&goTo(c,b.x,b.y)){j.bed=true;c.status='Going to bed'}else j.bed=false;j.st=1;return}
      c.status=j.bed?(j.recover?'Recovering in bed':'Sleeping'):'Sleeping rough (no bed)';c.sleeping=true;
      if(j.recover){if(c.recover<=0){c.sleeping=false;c.job=null}break}
      if(!isNight()){c.sleeping=false;c.rested=j.bed?1:.85;if(!j.bed)msg(`${c.nick} slept on the ground. Build housing.`,'bad');c.job=null}
      break;}
    case 'eat':{
      const cp=commons();if(!cp||(cnt('meal')<1&&cnt('finemeal')<1)){c.job=null;return}
      const L=layouts[cp.id],[ox,oy]=plotOrigin(cp);
      if(j.st===0){const seat=pick(L.seats);if(!goTo(c,ox+seat[0],oy+seat[1])){c.job=null;c.wait=1;return}j.st=1;j.p=0;c.status='Going to eat';return}
      c.status='Eating at the '+plotName(cp).toLowerCase();j.p+=dt/3;
      if(!c.bub&&Math.random()<dt*.3)c.bub={k:'chat',until:S.t+2};
      if(j.p>=1){const i=cnt('finemeal')>=1?'finemeal':'meal';take(i,1);flow(i,-1);c.food+=ITEMS[i].food;c.buff=commonsBuff()+(i==='finemeal'?.05:0);c.job=null}
      break;}
    case 'harvest':{
      const k=j.x+','+j.y,q=S.plants[k];if(!q){c.job=null;return}
      if(j.st===0){if(!goTo(c,j.x,j.y)){q.r=0;c.job=null;c.wait=2;return}j.st=1;c.status='Going to harvest '+CROPS[q.c].n.toLowerCase();return}
      c.status='Harvesting '+CROPS[q.c].n.toLowerCase();c.working=true;
      j.p+=dt*workMult(c,'plants')/3;
      if(j.p>=1){
        const p=plotById(j.pid),cr=CROPS[q.c],ym=p&&p.type?(tierDef(p).yield||1):1;
        const n=Math.max(1,Math.round(cr.yield*ym*(.85+c.sk.plants*.025)));
        delete S.plants[k];c.carry={i:cr.item,n};
        gainXP(c,'plants',6);S.stats.harvests=(S.stats.harvests||0)+1;c.job={t:'haul',st:0};
      }break;}
    case 'sow':{
      const k=j.x+','+j.y,p=plotById(j.pid);
      if(S.plants[k]||!p||c.assign!==p.id){sowRes.delete(k);c.job=null;return}
      if(j.st===0){if(!goTo(c,j.x,j.y)){sowRes.delete(k);c.job=null;c.wait=2;return}j.st=1;c.status='Going to sow';return}
      c.status='Sowing '+CROPS[j.crop].n.toLowerCase();c.working=true;
      j.p+=dt*workMult(c,'plants')/2.5;
      if(j.p>=1){sowRes.delete(k);if(owns(j.crop))S.plants[k]={c:j.crop,g:0,r:0,pid:j.pid};gainXP(c,'plants',3);c.job=null}
      break;}
    case 'pick':{
      const g=S.ground.find(g=>g.id===j.gid);if(!g){c.job=null;return}
      if(j.st===0){if(!goTo(c,g.x,g.y)){g.r=0;c.job=null;c.wait=2;return}j.st=1;c.status='Going to collect eggs';return}
      c.status='Collecting eggs';c.working=true;j.p+=dt*workMult(c,'animals')/1.2;
      if(j.p>=1){S.ground.splice(S.ground.indexOf(g),1);c.carry={i:g.i,n:g.n};gainXP(c,'animals',2);c.job={t:'haul',st:0}}
      break;}
    case 'tend':{
      const a=aniById(j.aid);if(!a){c.job=null;return}
      const d=ANIMALS[a.type];
      if(j.st===0){if(!goTo(c,Math.floor(a.x),Math.floor(a.y))){a.r=0;c.job=null;c.wait=2;return}j.st=1;c.status='Going to the '+d.n.toLowerCase();return}
      c.status=d.work+' a '+d.n.toLowerCase();c.face=a.x<c.x?'l':'r';c.working=true;
      j.p+=dt*workMult(c,'animals')/4;
      if(j.p>=1){
        const p=plotById(j.pid);let m=(.85+c.sk.animals*.025)*(p&&p.type?(tierDef(p).prod||1)*clusterBonus(p):1);
        if(a.type==='shaggox')m*=biome().wool||1;
        a.p=0;a.r=0;c.carry={i:d.prod,n:Math.max(1,Math.round(d.pcount*m))};gainXP(c,'animals',6);c.job={t:'haul',st:0};
      }break;}
    case 'gather':{
      const o=S.outside.find(o=>o.id===j.oid);if(!o){c.job=null;return}
      if(j.st===0){if(!goTo(c,o.x,o.y)){o.r=0;c.job=null;c.wait=2;return}j.st=1;c.status=o.k==='tree'?'Going to chop a tree':o.k==='rock'?'Going to break a rock':'Going to salvage a ship chunk';return}
      c.status=o.k==='tree'?'Chopping a tree':o.k==='rock'?'Breaking a rock':'Salvaging a ship chunk';c.working=true;
      const sk=o.k==='tree'?'plants':o.k==='rock'?'mining':'crafting';
      j.p+=dt*workMult(c,sk)*(c.traits.includes('strong')?1.25:1)/(o.k==='tree'?5:o.k==='rock'?7:8);
      if(j.p>=1){
        o.r=0;
        if(o.k==='tree'){o.g=0;c.carry={i:'wood',n:RI(14,22)};gainXP(c,'plants',4)}
        else if(o.k==='rock'){S.outside=S.outside.filter(x=>x!==o);c.carry={i:'stone',n:RI(6,10)};gainXP(c,'mining',4);if(sel&&sel.k==='out'&&sel.id===o.id)sel=null}
        else{S.outside=S.outside.filter(x=>x!==o);c.carry={i:'comp',n:RI(2,4)};c.carry2={i:'steel',n:RI(8,16)};gainXP(c,'crafting',6);if(sel&&sel.k==='out'&&sel.id===o.id)sel=null}
        c.job={t:'haul',st:0};
      }break;}
    case 'craft':{
      const p=plotById(j.pid);if(!p||!p.type||c.assign!==p.id){releaseJob(c);return}
      const rec=RECIPES[j.rk||p.bill],L=layouts[p.id],stn=L.stations[j.sti]||L.stations[0],[ox,oy]=plotOrigin(p);
      if(j.st===0){const lc=localIngr(p,rec);if(lc&&L.rack&&L.rack.length){const rk=nearest(c,L.rack.map(([x,y])=>[ox+x,oy+y]),a=>a);if(rk&&goTo(c,rk[0],rk[1])){j.local=1;j.st=1;c.status='Taking ingredients from the rack';return}}
        const kc=p.type==='kitchen'?kitchenCells():[],st=nearest(c,kc.length?kc:storeCells(),a=>a);if(!st||!goTo(c,st[0],st[1])){c.job=null;c.wait=2;return}j.st=1;c.status='Fetching ingredients';return}
      if(j.st===1){
        let ing;if(j.local){ing=localIngr(p,rec);if(!ing){j.local=0;j.st=0;return}for(const[i,n]of ing)p.stock[i]-=n}
        else{ing=pickIngr(rec);if(!ing){c.job=null;return}for(const[i,n]of ing){take(i,n);flow(i,-n)}
          const cap=rackCap(p);if(cap>0){p.stock=p.stock||{};let room=cap-rackUsed(p);const ex=[];for(let k=0;k<3&&room>0;k++)for(const[i,n]of ing){const m=Math.min(n,room,Math.floor(cnt(i)));if(m>0){take(i,m);flow(i,-m);ex.push([i,m]);room-=m}}j.extra=ex}}
        c.hold={i:ing[0][0],all:ing};
        if(!goTo(c,ox+stn[2],oy+stn[3])){releaseJob(c);c.wait=2;return}
        j.st=2;c.status='Carrying ingredients';return;
      }
      c.status=rec.n;c.face='u';c.working=true;
      j.p+=dt*workMult(c,rec.sk)*tierDef(p).speed*clusterBonus(p)/rec.work;
      if(j.extra){for(const[i,m]of j.extra)p.stock[i]=(p.stock[i]||0)+m;j.extra=null}
      if(j.p>=1){c.hold=null;c.carry={i:rec.out,n:rec.outN};gainXP(c,rec.sk,8);S.stats.crafted=(S.stats.crafted||0)+1;const b=(p.bills||[]).find(x=>x.id===j.bid);if(b){b.done=(b.done||0)+1;if(b.mode==='count'&&b.done>=b.n)msg(`${plotName(p)}: bill finished, ${b.n} × ${ITEMS[rec.out].n.toLowerCase()}.`,'good')}c.job={t:'haul',st:0}}
      break;}
    case 'mine':{
      const p=plotById(j.pid);if(!p||p.type!=='quarry'||c.assign!==p.id){c.job=null;return}
      const L=layouts[p.id],stn=L.stations[j.sti]||L.stations[0],[ox,oy]=plotOrigin(p);
      if(j.st===0){if(!goTo(c,ox+stn[2],oy+stn[3])){c.job=null;c.wait=2;return}j.st=1;c.status='Going to the quarry face';return}
      const ore=quarryOre(p);c.status=ore==='stone'?'Cutting stone':ore==='steel'?'Digging steel ore':'Digging plasteel';c.face='u';c.working=true;
      j.p+=dt*workMult(c,'mining')*tierDef(p).speed*clusterBonus(p)/(ore==='stone'?10:ore==='steel'?16:24);
      if(j.p>=1){c.carry={i:ore,n:ore==='stone'?RI(6,9):ore==='steel'?RI(4,7):RI(2,4)};gainXP(c,'mining',6);c.job={t:'haul',st:0}}
      break;}
    case 'research':{
      const p=plotById(j.pid);if(!p||p.type!=='research'){c.job=null;return}
      const L=layouts[p.id],[ox,oy]=plotOrigin(p);
      if(j.st===0){j.sti=freeStation(c,p);const stn=L.stations[j.sti]||L.stations[0];if(!goTo(c,ox+stn[2],oy+stn[3])){c.job=null;c.wait=2;return}j.st=1;c.status='Going to research';return}
      c.face='u';
      const cur=S.research.cur;
      if(!cur){c.status='No research project selected';return}
      const pr=RESEARCH.find(r=>r.id===cur);
      c.status='Researching '+pr.n.toLowerCase();c.working=true;
      let rate=(.8+.25*c.sk.intellectual)*tierDef(p).speed*clusterBonus(p)*(biome().research||1)*c.rested*(c.buff||1);
      rate*=1+bonus('research');if(c.traits.includes('book'))rate*=1.25;if(c.traits.includes('indus'))rate*=1.2;if(c.traits.includes('lazy'))rate*=.8;if(c.food<=0)rate*=.6;
      S.research.prog[cur]=(S.research.prog[cur]||0)+dt*rate;
      gainXP(c,'intellectual',dt*.4);
      if(S.research.prog[cur]>=pr.cost)completeResearch(pr);
      break;}
    case 'haul':{
      if(!c.carry){c.job=null;return}
      if(j.st===0&&!isHauler(c)&&haulers().length){
        const d=dropCell(c,c.carry.i);
        if(d){if(!goTo(c,d[0],d[1])){c.wait=2;return}j.st=1;j.drop=d;c.status='Leaving '+ITEMS[c.carry.i].n.toLowerCase()+' at the pickup pile';return}
      }
      if(j.drop){addGround(c.carry.i,c.carry.n,j.drop[0],j.drop[1],j.drop[2]);c.carry=null;c.job=null;if(c.carry2){c.carry=c.carry2;c.carry2=null;c.job={t:'haul',st:0}}break}
      if(j.st===0){
        const st=nearest(c,haulTargets(c.carry.i),a=>a);
        if(!st){c.status='No storage plot to haul to';c.wait=3;if(S.t-(S.noStoreWarn||-99)>60){S.noStoreWarn=S.t;msg('Your colonists need a storage plot.','bad')}return}
        if(!goTo(c,st[0],st[1])){c.wait=2;return}
        j.st=1;c.status='Hauling '+ITEMS[c.carry.i].n.toLowerCase();return;
      }
      if(stockUsed()+c.carry.n>stockCap()){c.status='Storage full';c.wait=3;if(S.t-(S.fullWarn||-99)>60){S.fullWarn=S.t;msg('Storage is full. Sell goods or upgrade storage.','bad')}return}
      add(c.carry.i,c.carry.n);flow(c.carry.i,c.carry.n);c.carry=null;c.job=null;if(c.carry2){c.carry=c.carry2;c.carry2=null;c.job={t:'haul',st:0}}
      break;}
    case 'collect':{
      const g=S.ground.find(g=>g.id===j.gid);if(!g){c.job=(c.load&&c.load.length)?{t:'unload',st:0}:null;return}
      if(j.st===0){if(!goTo(c,g.x,g.y)){g.r=0;c.job=null;c.wait=2;return}j.st=1;c.status='Collecting '+ITEMS[g.i].n.toLowerCase();return}
      c.load=c.load||[];const room=haulCap(c)-loadSize(c),n=Math.min(room,g.n);
      if(n>0){const l=c.load.find(l=>l.i===g.i);if(l)l.n+=n;else c.load.push({i:g.i,n});g.n-=n}
      g.r=0;if(g.n<=0)S.ground=S.ground.filter(x=>x!==g);
      gainXP(c,'hauling',1);
      if(haulCap(c)-loadSize(c)>0){const more=S.ground.filter(o=>!o.r&&Math.abs(o.x-c.x)+Math.abs(o.y-c.y)<9);if(more.length){const o=nearest(c,more,o=>[o.x,o.y]);o.r=c.id;c.job={t:'collect',gid:o.id,st:0};return}}
      c.job={t:'unload',st:0};break;}
    case 'unload':{
      if(!c.load||!c.load.length){c.job=null;return}
      if(j.st===0){const st=nearest(c,storeCells(),a=>a);if(!st){c.status='No storage plot';c.wait=3;return}if(!goTo(c,st[0],st[1])){c.wait=2;return}j.st=1;c.status='Hauling '+loadSize(c)+' goods to storage';return}
      const free=stockCap()-stockUsed();if(free<=0){c.status='Storage full';c.wait=3;if(S.t-(S.fullWarn||-99)>60){S.fullWarn=S.t;msg('Storage is full. Sell goods or upgrade storage.','bad')}return}
      let room=free;for(const l of c.load){const n=Math.min(room,l.n);add(l.i,n);flow(l.i,n);l.n-=n;room-=n}
      c.load=c.load.filter(l=>l.n>0);gainXP(c,'hauling',4);
      if(!c.load.length)c.job=null;break;}
  }
}
function researchOK(r){return(!r.pre||done(r.pre))&&(!r.era||era()>=r.era)&&(!r.items||S.research.paid&&S.research.paid[r.id])}
function researchCanPay(r){if(!r.items)return true;for(const k in r.items)if(cnt(k)<r.items[k])return false;return true}
function startResearch(id){const r=RESEARCH.find(x=>x.id===id);if(!r||done(id))return;if(r.era&&era()<r.era){msg(`${r.n} needs the ${ERAS[r.era]} era. Move the colony to a new site first.`,'bad');return}if(r.pre&&!done(r.pre)){msg('First research '+reqName(r.pre)+'.','bad');return}
  if(r.items&&!(S.research.paid&&S.research.paid[id])){if(!researchCanPay(r)){msg('This research needs '+Object.keys(r.items).map(k=>r.items[k]+' '+ITEMS[k].n.toLowerCase()).join(' and ')+'.','bad');return}for(const k in r.items)take(k,r.items[k]);S.research.paid=S.research.paid||{};S.research.paid[id]=true}
  S.research.cur=id}
function completeResearch(pr){
  chron('research',`Researched ${pr.n}.`);S.research.done[pr.id]=true;S.research.prog[pr.id]=pr.cost;
  const next=RESEARCH.find(r=>!done(r.id)&&researchOK(r));
  S.research.cur=next?next.id:null;
  letter('info','Research complete',`${pr.n} is done. ${pr.d}${next?` Researchers moved on to ${next.n}.`:''}`);
}

