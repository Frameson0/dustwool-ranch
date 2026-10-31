/* ================= events ================= */
function promoCost(){return 60+40*S.cols.length}
function promote(tr){const c=promoCost();if(!tr||tr.promo||S.silver<c)return;S.silver-=c;tr.promo=true;S.promoBoost=true;S.nextWanderer=Math.min(S.nextWanderer,S.t+R(25,60));msg(`${tr.name} will tell travellers about your colony. Expect a wanderer at the gate soon.`,'good')}
function caravanGap(){return R(220,320)*(biome().caravan||1)*(1-.08*Math.max(0,S.wall))}
function tickEvents(dt){
  const req=S.requests.find(r=>!r.arrived&&S.t>=r.at);
  if(req&&!S.trader&&!S.raid){req.arrived=true;arriveCaravan(req)}
  if(!S.trader&&!S.raid&&S.t>=S.nextCaravan)arriveCaravan();
  if(S.trader&&S.raid&&S.vis.some(v=>v.shelter))S.trader.until=Math.max(S.trader.until,S.t+30);
  if(S.trader&&S.t>=S.trader.until){
    msg(`The ${S.trader.name} caravan is leaving.`);
    if(S.trader.req){const r=S.requests.find(r=>r.id===S.trader.req);if(r){msg(`Request from ${r.f} went unfilled.`,'bad');S.requests=S.requests.filter(x=>x!==r)}}
    S.trader=null;S.nextCaravan=S.t+caravanGap();
    for(const v of S.vis)if(v.k==='caravan'||v.k==='pack')sendAway(v);
    if(modal&&modal.k==='trade'&&modal.who==='caravan')closeModal();
  }
  if(S.trader&&hasTradeSpot()&&S.t-(S.trader.lastAuto||0)>10){S.trader.lastAuto=S.t;autoTrade(S.trader,true)}
  if(hasComms()&&!S.orbital&&S.t>=S.nextOrbital)arriveOrbital();
  if(S.orbital&&S.t>=S.orbital.until){{const pp=padPos();if(pp)ships.push({t:4.5,x:pp[0],y:pp[1],kind:'shuttle'})}msg(`Orbital trader ${S.orbital.name} has left orbit.`);S.orbital=null;S.nextOrbital=S.t+R(380,520);if(modal&&modal.k==='trade'&&modal.who==='orbital')closeModal()}
  if(S.orbital&&hasTradeSpot()&&S.t-(S.orbital.lastAuto||0)>10){S.orbital.lastAuto=S.t;autoTrade(S.orbital,true)}
  if(!S.wanderer&&!S.raid&&S.t>=S.nextWanderer)arriveWanderer();
  if(S.wanderer&&S.t>=S.wanderer.until)wandererLeaves();
  if(hasComms()&&S.t>=S.nextContract){if(S.contracts.length<3)newContract();S.nextContract=S.t+R(150,240)}
  if(S.t>=S.nextRequest){if(S.requests.filter(r=>!r.arrived).length<2)newRequest();S.nextRequest=S.t+R(2.5,4)*DAY}
  if(S.t>=S.nextChunk){if(S.outside.filter(o=>o.k==='chunk').length<3)dropChunk();S.nextChunk=S.t+R(1.4,2.4)*DAY}
  for(const o of S.outside)if(o.k==='tree'&&o.g<1)o.g=Math.min(1,o.g+dt/(2*DAY));
  S.contracts=S.contracts.filter(k=>k.until>S.t);
  S.letters=S.letters.filter(l=>!((l.k==='raid'&&!S.raid)||(l.k==='trade'&&!S.trader)||(l.k==='orbital'&&!S.orbital)||((l.k==='contract'||l.k==='chunk')&&S.t-(l.t||0)>DAY)));
}
function genStock(orbital){
  const seeds=['haygrass','rice'];
  if(orbital||Math.random()<.6)seeds.push('corn');
  if(done('cotton')&&(orbital||Math.random()<.7))seeds.push('cotton');
  const animals={chicken:RI(2,5)};
  if(orbital||Math.random()<.6)animals.goat=RI(1,3);
  if(orbital||Math.random()<.4)animals.shaggox=RI(1,2);
  const goods=orbital?{comp:RI(4,10),steel:RI(40,100),plasteel:Math.random()<.7?RI(10,40):0,chemfuel:RI(20,60),mechpart:Math.random()<.5?RI(2,4):0,datadisk:Math.random()<.35?1:0}:{wood:RI(40,120),stone:RI(20,60),steel:RI(30,90),leather:Math.random()<.5?RI(10,30):0,comp:Math.random()<.6?RI(1,4):0,chemfuel:Math.random()<.4?RI(10,30):0,seeds:Math.random()<.3?RI(1,2):0,datadisk:Math.random()<.15?1:0};
  return{seeds,animals,goods};
}
function autoSell(tr,quiet){
  let total=0;const sold=[];
  for(const i in S.autoSell){const keep=S.autoSell[i];if(keep===null||keep===undefined||keep==='')continue;const n=Math.floor(cnt(i)-keep);if(n<=0)continue;const v=n*ITEMS[i].v*priceMul(tr)*BAL.sell;take(i,n);S.silver+=v;flow('silver',v);total+=v;sold.push(`${n} ${ITEMS[i].n.toLowerCase()}`)}
  if(total>0){if(!quiet||total>20)msg(`Auto-sold ${sold.join(', ')} for ${fmt(total)} silver.`,'good');S.stats.earned=(S.stats.earned||0)+total}
}
function autoTrade(tr,quiet){if(!hasTradeSpot())return;autoSell(tr,quiet);autoBuy(tr,quiet)}
function autoBuy(tr,quiet){
  const res=S.buyReserve??200;let spent=0;const got=[];
  for(const i in S.autoBuy){const want=S.autoBuy[i];if(want===null||want===undefined)continue;const have=tr.stock.goods[i]||0;if(!have)continue;
    const price=ITEMS[i].v*1.4,n=Math.min(have,Math.floor(want-cnt(i)),Math.floor((S.silver-res)/price));if(n<=0)continue;
    S.silver-=n*price;tr.stock.goods[i]-=n;add(i,n);spent+=n*price;got.push(`${n} ${ITEMS[i].n.toLowerCase()}`)}
  if(spent>0&&(!quiet||spent>20))msg(`Auto-bought ${got.join(', ')} for ${fmt(spent)} silver.`,'good');
}
function roadEntry(){const pts=outerRoad;let i=0;for(let k=0;k<pts.length;k++)if(pts[k][0]<=GX-4)i=k;return{i,p:pts[i]}}
function sendAway(v){v.leaving=true;v.em=null;v.shelter=false;v.hide=false;const e=roadEntry(),x=clamp(Math.floor(e.p[0]),0,W-1),y=clamp(Math.floor(e.p[1]),0,H-1);if(!goTo(v,x,y))v.path=[];v.walkOut=outerRoad.slice(0,e.i+1).reverse()}
function arriveByRoad(v,k){const e=roadEntry();v.x=outerRoad[0][0]-k*1.1;v.y=outerRoad[0][1]+(k%2)*.5;v.walk=outerRoad.slice(1,e.i+1).map(p=>[p[0],p[1]+(k%2?.45:0)]);v.path=[]}
function raidWarnVisitors(){
  if(S.trader){
    const vs=S.vis.filter(v=>v.k==='caravan'||v.k==='pack');
    if(hasTradeSpot()){const sp=wpOfType('tradespot')[0],cells=[];for(let y=sp.y0;y<sp.y0+sp.h;y++)for(let x=sp.x0;x<sp.x0+sp.w;x++)cells.push([x,y]);
      vs.forEach((v,k)=>{const c=cells[(k*2+1)%cells.length];v.shelter=true;v.em=null;goTo(v,c[0],c[1])});
      msg(`The ${S.trader.name} caravan takes shelter at your trade spot.`)}
    else{msg(`The ${S.trader.name} caravan packs up and leaves before the raid. A trade spot would give them shelter.`,'warn');S.trader.until=S.t}
  }
  if(S.wanderer){const v=S.vis.find(v=>v.id===S.wanderer.p.id);if(v){const trees=S.outside.filter(o=>o.k==='tree'&&o.g>=.4&&o.x<GX-1&&Math.abs(o.y-GATE_Y)<10);const t=trees.length?nearest(v,trees,o=>[o.x,o.y]):null;
    if(t){v.hide=true;v.em=null;if(!goTo(v,t.x,t.y)){v.x=t.x+.5;v.y=t.y+.5}msg(`${S.wanderer.p.nick} hides behind a tree outside the wall.`)}}}
}
function raidOverVisitors(){
  for(const v of S.vis){
    if(v.shelter){v.shelter=false;if(v.home)goTo(v,v.home[0],v.home[1])}
    if(v.hide){v.hide=false;goTo(v,GX-2,GATE_Y-1)}
  }
}
function spawnCaravanPawns(atSpot){
  for(let k=0;k<3;k++){
    const p=genPawn();p.pack=k===1;
    const v={k:'caravan',id:p.id,look:p,x:atSpot?GX-4.5+k*.9:.5,y:GATE_Y+2.5+(k%2)*.6,path:[],face:'r',emT:R(1,4),home:[GX-5+k,GATE_Y+2+(k%2)]};
    if(!atSpot)arriveByRoad(v,k);
    S.vis.push(v);
  }
  const a={k:'pack',id:nid(),x:atSpot?GX-2.5:.5,y:GATE_Y+3.6,path:[],face:'r',type:'shaggox',age:999,emT:R(2,5),home:[GX-3,GATE_Y+3]};
  if(!atSpot)arriveByRoad(a,3);
  S.vis.push(a);
}
function arriveCaravan(req){
  S.trader={kind:'caravan',name:req?req.f:pick(FACTIONS),until:S.t+(req?200:150),mul:.85,stock:genStock(false),req:req?req.id:null};
  spawnCaravanPawns(false);autoTrade(S.trader);
  letter('trade',req?'Requested caravan':'Trade caravan',req?`The ${req.f} caravan is here for the ${req.n} ${ITEMS[req.i].n.toLowerCase()} they asked for. They pay ${Math.round(req.mult*100)}% of value.`:`A caravan from ${S.trader.name} is waiting outside your gate. They buy goods and sell seeds, animals, wood and stone.${S.reloc===0?' They also sell the wagon convoy you need to move on (World tab).':''}`,{who:'caravan'});
}
function arriveOrbital(){
  S.orbital={kind:'orbital',name:pick(ORBITAL),until:S.t+260,t0:S.t,mul:1.1,stock:genStock(true)};
  autoTrade(S.orbital);
  letter('orbital','Orbital trader',`${S.orbital.name} answers your comms tower and lands a shuttle on your pad. Click it to trade. Orbital traders pay more, sell components and plasteel and charter shuttles to new sites.`,{who:'orbital'});
}
function arriveWanderer(){
  const p=genPawn(pick(SKILLS));if(S.promoBoost){S.promoBoost=false;const k=pick(SKILLS);p.sk[k]=Math.max(p.sk[k],RI(9,14));p.pa[k]=2}
  const v={k:'wanderer',id:p.id,look:p,x:.5,y:GATE_Y-1.5,path:[],face:'r',emT:3,home:[GX-2,GATE_Y-1]};arriveByRoad(v,0);
  S.wanderer={p,until:S.t+160};S.vis.push(v);
  const best=SKILLS.slice().sort((a,b)=>p.sk[b]-p.sk[a]).slice(0,2).map(s=>`${SKN[s]} ${p.sk[s]}`).join(', ');
  letter('join','Wanderer at the gate',`${colName(p)}, age ${p.age}, is standing at your gate and asks to join. Best at ${best}. Traits: ${p.traits.map(t=>TRAITS[t].n).join(', ')}.`,{pid:p.id});
}
function wandererLeaves(){
  const w=S.wanderer;if(!w)return;
  const v=S.vis.find(v=>v.id===w.p.id);if(v)sendAway(v);
  S.letters=S.letters.filter(l=>!(l.k==='join'&&l.data.pid===w.p.id));
  if(modal&&modal.k==='letter'&&modal.l.k==='join')closeModal();
  msg(`${w.p.nick} moved on.`);S.wanderer=null;S.nextWanderer=S.t+R(180,280)*BAL.join;
}
function acceptWanderer(){
  const w=S.wanderer;if(!w)return;
  if(S.cols.length>=bedCount()){msg('No free bed. Build or upgrade housing first.','bad');return}
  const v=S.vis.find(v=>v.id===w.p.id),c=w.p;
  Object.assign(c,{x:v?v.x:GX-1.5,y:v?v.y:GATE_Y+.5,path:[],job:null,assign:null,carry:null,hold:null,wait:0,food:.8,rested:1,buff:1});
  S.vis=S.vis.filter(x=>x!==v);S.cols.push(c);goTo(c,GX+2,GATE_Y);
  S.letters=S.letters.filter(l=>!(l.k==='join'&&l.data.pid===c.id));
  S.wanderer=null;S.nextWanderer=S.t+R(200,300)*BAL.join;
  msg(`${c.nick} joined. Drag them onto a plot to put them to work.`,'good');chron('people',`${colName(c)} joined the colony.`);sel={k:'col',id:c.id};plotDirty=true;
}
function producible(){
  const cand=['potato','meal','wood'];
  for(const k in CROPS)if(owns(k))cand.push(CROPS[k].item);
  if(S.ani.some(a=>a.type==='chicken'))cand.push('egg');
  if(S.ani.some(a=>a.type==='goat'))cand.push('milk','finemeal');
  if(S.ani.some(a=>a.type==='shaggox'))cand.push('wool');
  if(built('quarry').length)cand.push('stone');
  if(done('cheese'))cand.push('cheese');if(done('tailoring'))cand.push('parka');
  return[...new Set(cand)];
}
function newContract(){
  const i=pick(producible()),v=ITEMS[i].v;
  let n=Math.max(1,Math.round(R(140,420)/v));if(n>10)n=Math.round(n/5)*5;
  const k={id:nid(),f:pick(FACTIONS),i,n,reward:Math.round(n*v*1.7),until:S.t+600};S.contracts.push(k);
  letter('contract','Dropship contract',`${k.f} wants ${n} ${ITEMS[i].n.toLowerCase()} and pays ${fmt(k.reward)} silver on delivery.`);
}
function newRequest(){
  const i=pick(producible()),v=ITEMS[i].v;
  let n=Math.max(2,Math.round(R(180,600)/v));if(n>10)n=Math.round(n/10)*10;
  const days=RI(3,6),mult=pick([1.25,1.3,1.4]);
  const sc=RI(1,2);const r={id:nid(),f:pick(FACTIONS),i,n,mult,at:S.t+days*DAY,schem:sc};S.requests.push(r);
  letter('contract','Caravan request',`${r.f} will send a caravan in ${days} days. They want ${n} ${ITEMS[i].n.toLowerCase()} and pay ${Math.round(mult*100)}% of value for it, plus ${sc} tech schematic${sc>1?'s':''}. Schematics unlock advanced research and are hard to get any other way.`);
}
function fulfillRequest(){
  const tr=S.trader;if(!tr||!tr.req)return;const r=S.requests.find(r=>r.id===tr.req);if(!r)return;
  if(cnt(r.i)<r.n){msg(`You need ${r.n} ${ITEMS[r.i].n.toLowerCase()}.`,'bad');return}
  take(r.i,r.n);const v=r.n*ITEMS[r.i].v*r.mult*(1+.1*S.renown);S.silver+=v;flow('silver',v);S.stats.earned=(S.stats.earned||0)+v;
  const sc=r.schem||1;add('schem',sc);S.requests=S.requests.filter(x=>x!==r);tr.req=null;msg(`Request delivered to ${r.f}. +${fmt(v)} silver and ${sc} tech schematic${sc>1?'s':''}.`,'good');
  for(const vv of S.vis)if(vv.k==='caravan')vv.em={k:'cheer',until:S.t+3};
}
function shipContract(id){
  const k=S.contracts.find(k=>k.id===id);if(!k)return;
  if(cnt(k.i)<k.n){msg(`You need ${k.n} ${ITEMS[k.i].n.toLowerCase()}.`,'bad');return}
  take(k.i,k.n);S.silver+=k.reward;flow('silver',k.reward);S.stats.earned=(S.stats.earned||0)+k.reward;
  S.contracts=S.contracts.filter(x=>x!==k);{const pp=padPos();ships.push({t:0,x:pp?pp[0]:3,y:pp?pp[1]:GATE_Y-4,kind:'drop'})}msg(`Dropship collected ${k.n} ${ITEMS[k.i].n.toLowerCase()}. +${fmt(k.reward)} silver.`,'good');
}
function dropChunk(){
  for(let k=0;k<30;k++){
    const x=RI(1,W-2),y=RI(1,H-2);
    if(!walkable(x,y)||kAt(x,y)!==0||nearBase(x,y)||polyDist(outerRoad,x+.5,y+.5)<2||S.outside.some(o=>Math.abs(o.x-x)<2&&Math.abs(o.y-y)<2))continue;
    S.outside.push({id:nid(),k:'chunk',x,y,land:S.t,mark:false,r:0,seed:RI(1,999)});
    letter('chunk','Ship chunk crashed','A chunk of a wrecked ship crashed outside your walls. Mark it for salvage: a gatherer can pull components out of it.');
    return;
  }
}

