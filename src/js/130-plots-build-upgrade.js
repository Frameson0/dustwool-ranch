/* ================= plots: build / upgrade ================= */
function canBuildType(type){
  const t=PLOTS[type].tiers[0];
  if(type==='farm'&&biome().nofarm)return'No soil in a mountain hollow';
  if(t.req&&!done(t.req))return'Needs research: '+reqName(t.req);
  if(type==='comms'&&hasComms())return'One tower is enough';
  return null;
}
function conNeed(t){return 6+6*t}
function etaStr(c){return c.rt>1e-4?fmtTime(Math.ceil((1-c.prog)/c.rt))+' left':'waiting for builders'}
function hasConstructors(){return S.cols.some(isConstructor)}
function isConstructor(c){const p=typeof c.assign==='number'?plotById(c.assign):null;return !!(p&&p.type==='construction')}
function conWho(){sfx('place');return S.test?'':hasConstructors()?' Your builders will put it up.':' Idle colonists will build it.'}
function buildPlot(p,type){
  if(!p||!p.open||p.type||p.con)return;
  const why=canBuildType(type);if(why){msg(why+'.','bad');return}
  let par=null;if(PLOTS[type].annex){par=annexSpot(p,type);if(!par){msg(`A ${PLOTS[type].n.toLowerCase()} must go right next to a ${PLOTS[type].of.map(t=>PLOTS[t].n.toLowerCase()).join(' or ')} that has none yet.`,'bad');return}}
  const t=PLOTS[type].tiers[0];if(!costOk(t)){msg(`Needs ${costStr(t)}.`,'bad');return}
  if(par)p.par=par.id;else delete p.par;
  pay(t);p.spent=S.test?0:t.cost;p.con={type,tier:0,prog:0,need:conNeed(0),paid:t};plotDirty=true;
  msg(`${t.n} planned.${conWho()}`,'good');
}
function applyBuilt(p,type){
  p.type=type;p.tier=0;
  if(type==='treefarm')p.crop='tree';
  if(type==='farm'||type==='hydro'){const nbF=[nb(p,-1,0),nb(p,0,-1),nb(p,1,0),nb(p,0,1)].find(n=>n&&n.type===type&&n.crop);p.crop=nbF?nbF.crop:'potato'}
  if(BILLS[type])p.bill=BILLS[type][0];
  if(type==='pen')p.breed={};
  if(type==='comms'){S.nextOrbital=S.t+60;S.nextContract=S.t+30}
}
function cancelCon(p){if(!p.con)return;refundCost(p.con.paid,1);if(!p.type)p.spent=0;else p.spent=Math.max(0,(p.spent||0)-(p.con.paid.cost||0));delete p.con;plotDirty=true;msg('Construction cancelled. Costs refunded.')}
function plotSpot(p){const[ox,oy]=plotOrigin(p),c=[];for(let y=oy;y<=oy+P;y++)for(let x=ox;x<ox+P;x++)if(walkable(x,y))c.push([x,y]);return c.length?pick(c):null}
function rectSpot(x0,y0,w,h){const c=[];for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(walkable(x,y))c.push([x,y]);return c.length?pick(c):null}
function conSites(){
  const out=[];
  for(const p of S.plots)if(p.con)out.push({id:'p'+p.id,con:p.con,name:PLOTS[p.con.type].tiers[p.con.tier].n.toLowerCase(),spot:()=>plotSpot(p)});
  for(const sl of wpSlots()){const w=S.wp[sl.key];if(w&&w.con)out.push({id:'w'+sl.key,con:w.con,name:WPLOTS[w.type].n.toLowerCase(),spot:()=>rectSpot(sl.x0,sl.y0,sl.w,sl.h)})}
  {const pend=roadPending();if(pend.length){const t=S.road[pend[0]]+1,mat=roadMat(t);if(cnt(mat)>=1||S.test){if(!S.roadCon||!pend.includes(S.roadCon.cell)){const gc=(GX+1)+GATE_Y*W;pend.sort((a,b)=>Math.abs(a%W-gc%W)+Math.abs(Math.floor(a/W)-GATE_Y)-Math.abs(b%W-gc%W)-Math.abs(Math.floor(b/W)-GATE_Y));S.roadCon={cell:pend[0],prog:0,need:.9,rt:S.roadCon&&S.roadCon.rt}}const rc=S.roadCon;out.push({id:'road',con:rc,name:`path (${pend.length} tile${pend.length>1?'s':''} to pave)`,spot:()=>[rc.cell%W,Math.floor(rc.cell/W)]})}}}
  for(const sl of laneCache){const l=S.lanes&&S.lanes[sl.key];if(l&&l.con)out.push({id:'L'+sl.key,con:l.con,name:laneName(l).toLowerCase(),spot:()=>rectSpot(sl.x0,sl.y0,sl.w,sl.h)})}
  if(S.wallCon)out.push({id:'wall',con:S.wallCon,name:WALLS[S.wallCon.tier].n.toLowerCase(),spot:()=>{const c=wallInfo.cells.filter(i=>wallInfo.inner[i]>=0);if(!c.length)return null;const n=wallInfo.inner[pick(c)];return[n%W,Math.floor(n/W)]}});
  const trapFirst=S.raid&&S.raid.traps,n0=out.length;
  if(!raidActive())for(const k in S.traps){const t=S.traps[k],i=+k,sp=()=>[i%W,Math.floor(i/W)];
    if(t.con)out.push({id:'t'+k,con:t.con,name:TRAPS[t.type].n.toLowerCase(),spot:sp});
    else if(t.type==='spikes'&&t.ch<=0){t.re=t.re||{prog:0,need:3};out.push({id:'t'+k,con:t.re,name:'spike trap (resetting)',spot:sp})}}
  if(trapFirst&&out.length>n0){const tr=out.splice(n0);out.unshift(...tr)}
  return out;
}
function finishSite(id){
  if(id==='road'){const rc=S.roadCon;if(!rc)return;const i=rc.cell,t=(S.road[i]??0)+1;if(S.road[i]!==undefined&&t<=(S.roadTarget||0)){const mat=roadMat(t);if(cnt(mat)>=1||S.test){if(!S.test)take(mat,1);S.road[i]=t;roadTier[i]=t;if(i===(GX+1)+GATE_Y*W)gateT=t;plotDirty=true}}S.roadCon=null;return}
  if(id==='wall'){if(!S.wallCon)return;const t=S.wallCon.tier,first=S.wall<0;S.wallCon=null;chron('build',`${first?'Dug a':'Finished the'} ${WALLS[t].n.toLowerCase()}.`);S.wall=t;S.whp={};S.breach={};refreshSite();msg(first?`The ${WALLS[t].n.toLowerCase()} is dug, with a bridge in the west.`:`The ${WALLS[t].n.toLowerCase()} is finished.`,'good');return}
  if(id[0]==='L'){const l=S.lanes[id.slice(1)];if(l&&l.con){delete l.con;rebuildBlocked();unstick();msg(`${laneName(l)} finished.`,'good');const sl=laneCache.find(q=>q.key===id.slice(1));if(sl&&!offlineSim)uiPulse(sl.x0+sl.w/2,sl.y0+sl.h/2,laneName(l))}return}
  if(id[0]==='p'){const p=plotById(+id.slice(1));if(!p||!p.con)return;const con=p.con;delete p.con;
    if(!p.type){applyBuilt(p,con.type);S.stats=S.stats||{};S.stats.bt=S.stats.bt||{};if(!S.stats.bt[con.type]){S.stats.bt[con.type]=1;chron('build',`Built the first ${PLOTS[con.type].tiers[0].n.toLowerCase()}.`)}}else{p.tier=con.tier;if(con.tier>=2)chron('build',`Upgraded to ${PLOTS[con.type].tiers[con.tier].n.toLowerCase()}.`)}
    rebuildBlocked();cleanPlants();unstick();for(const c of workersOf(p.id))releaseJob(c);msg(`${PLOTS[con.type].tiers[con.tier].n} finished.`,'good');if(!offlineSim){const[ox,oy]=plotOrigin(p);uiPulse(ox+2.5,oy+2.5,PLOTS[con.type].tiers[con.tier].n)}}
  else if(id[0]==='w'){const w=S.wp[id.slice(1)];if(w&&w.con){delete w.con;if(WPLOTS[w.type].work)w.bill=BILLS[WPLOTS[w.type].work][0];rebuildBlocked();plotDirty=true;msg(`${WPLOTS[w.type].n} finished.`,'good');if(w.type==='tradespot'&&S.trader)autoTrade(S.trader)}}
  else if(id==='wall'){if(!S.wallCon)return;const t=S.wallCon.tier,first=S.wall<0;S.wallCon=null;S.wall=t;S.whp={};S.breach={};refreshSite();msg(first?`The ${WALLS[t].n.toLowerCase()} is dug, with a bridge in the west.`:`The ${WALLS[t].n.toLowerCase()} is finished.`,'good')}
  else if(id[0]==='t'){const t=S.traps[id.slice(1)];if(t){if(t.con)delete t.con;else{if(cnt('wood')>=5||S.test){take('wood',S.test?0:5);t.ch=TRAPS[t.type].ch}delete t.re}}}
}
function conBonus(c){const p=typeof c.assign==='number'?plotById(c.assign):null;return p&&p.type==='construction'?tierDef(p).speed*clusterBonus(p):1}
function conJob(c){
  const ss=conSites();if(!ss.length)return null;
  let best=null,bn=1e9;for(const st of ss.slice(0,4)){const n=S.cols.filter(o=>o!==c&&o.job&&o.job.t==='con'&&o.job.sid===st.id).length;if(n<bn){bn=n;best=st}}
  const sp=best.spot();if(!sp)return null;
  return{t:'con',sid:best.id,x:sp[0],y:sp[1],st:0,w:R(6,10)};
}
function repairFor(c){
  if(!raidActive())return repairNeeded();
  for(const k in S.whp){const i=+k;if(!isWallCell(i)||S.breach[i]||wallInfo.inner[i]<0)continue;if(S.cols.some(o=>o!==c&&o.job&&o.job.t==='repair'&&o.job.cell===i))continue;return{kind:'wall',cell:i}}
  if(!raidInside()){const p=S.plots.find(p=>p.type&&p.dmg>0&&!S.cols.some(o=>o.job&&o.job.t==='repair'&&o.job.pid===p.id));if(p)return{kind:'plot',pid:p.id}}
  return null;
}
function upgradeCost(p){return PLOTS[p.type].tiers[p.tier+1]||null}
function upgradePlots(list){
  list=list.filter(p=>!p.con);if(!list.length)return;const n=upgradeCost(list[0]);if(!n)return;
  if(n.req&&!done(n.req)){msg('Needs research: '+reqName(n.req)+' first.','bad');return}
  const total={cost:(n.cost||0)*list.length,mat:{}};for(const k in n.mat||{})total.mat[k]=n.mat[k]*list.length;
  if(!costOk(total)){msg(`Needs ${costStr(n,list.length)}.`,'bad');return}
  pay(total);
  for(const p of list){p.con={type:p.type,tier:p.tier+1,prog:0,need:conNeed(p.tier+1),paid:n};if(!S.test)p.spent=(p.spent||0)+n.cost}
  plotDirty=true;msg((list.length>1?`Upgrade of ${list.length} plots to ${n.n} planned.`:`Upgrade to ${n.n} planned.`)+conWho()+' The plot keeps working meanwhile.','good');
}
function cleanPlants(){
  const valid=new Map();for(const p of built()){if(!GROW_TYPES.includes(p.type))continue;for(const[x,y]of cropCells(p))valid.set(x+','+y,p.id)}
  for(const k in S.plants){if(!valid.has(k))delete S.plants[k];else S.plants[k].pid=valid.get(k)}
}
function demolish(p){
  if(p.con&&!p.type){cancelCon(p);return}
  if(p.con)refundCost(p.con.paid,1),delete p.con;
  if(p.type==='pen'&&S.ani.some(a=>a.pen===p.id)){msg('Sell the animals in this ranch first.','bad');return}
  for(const c of workersOf(p.id)){releaseJob(c);c.assign=null;if(c.weapon){add(c.weapon,1);c.weapon=null}if(c.melee){add(c.melee,1);c.melee=null}}
  const refund=Math.floor((p.spent||0)/2);S.silver+=refund;
  msg(`${plotName(p)} demolished. Refunded ${refund} silver.`);
  rackReturn(p);delete p.bills;
  p.type=null;p.tier=0;p.spent=0;delete p.crop;delete p.bill;delete p.par;
  rebuildBlocked();cleanPlants();
}
function upgradeWall(){
  const n=WALLS[S.wall+1];if(!n||S.wallCon)return;
  if(n.req&&!done(n.req)){msg('Needs research: '+reqName(n.req)+' first.','bad');return}
  if(!costOk(n)){msg(`Needs ${costStr(n)}.`,'bad');return}
  if(S.wallCon)return;pay(n);S.wallCon={tier:S.wall+1,prog:0,need:S.wall<0?10:14+8*(S.wall+1),paid:n};plotDirty=true;msg(`${n.n} planned.${conWho()}`,'good');
}
function unstick(){
  for(const e of[...S.cols,...S.ani])if(!walkable(Math.floor(e.x),Math.floor(e.y))){
    const cx=Math.floor(e.x),cy=Math.floor(e.y);
    outer:for(let r=1;r<6;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(walkable(cx+dx,cy+dy)){e.x=cx+dx+.5;e.y=cy+dy+.5;e.path=[];break outer}
  }
}

