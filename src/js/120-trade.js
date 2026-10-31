/* ================= trade ================= */
function trader(who){return who==='orbital'?S.orbital:S.trader}
function sell(i,n,tr){n=Math.min(n,Math.floor(cnt(i)));if(n<=0)return;const v=n*ITEMS[i].v*priceMul(tr)*BAL.sell;take(i,n);S.silver+=v;flow('silver',v);S.stats.earned=(S.stats.earned||0)+v}
function buySeeds(k){
  const c=CROPS[k];if(owns(k))return;
  if(S.silver<c.unlock){msg('Not enough silver.','bad');return}
  S.silver-=c.unlock;S.unlocked[k]=true;msg(`${c.n} seeds bought. Your farms can grow ${c.n.toLowerCase()} for good now.`,'good');
}
function buyGoods(i,n,tr){
  const price=ITEMS[i].v*1.4;n=Math.min(n,tr.stock.goods[i]||0,Math.floor(S.silver/price));
  if(n<=0){msg('Not enough silver.','bad');return}
  S.silver-=n*price;tr.stock.goods[i]-=n;add(i,n);
}
function findPen(type){let best=null,free=-1;for(const p of built('pen')){const f=penCap(p)-penUsed(p);if(f>=ANIMALS[type].space&&f>free){free=f;best=p}}return best}
function buyAnimal(type,tr){
  const d=ANIMALS[type];
  if((tr.stock.animals[type]||0)<=0)return;
  if(S.silver<d.price){msg('Not enough silver.','bad');return}
  const p=findPen(type);if(!p){msg(`No ranch has room for a ${d.n.toLowerCase()}. Build or upgrade a ranch plot.`,'bad');return}
  S.silver-=d.price;tr.stock.animals[type]--;
  const a=newAnimal(type,GX-1.5,GATE_Y+.5,p.id);const[ox,oy]=plotOrigin(p);
  const tx=ox+RI(0,P-1),ty=oy+RI(1,P-1),path=findPath(GX-2,GATE_Y,tx,ty);a.path=path||[];if(!path){a.x=tx+.5;a.y=ty+.5}
  S.ani.push(a);msg(`Bought a ${d.n.toLowerCase()}. It walks to your ${plotName(p).toLowerCase()}.`,'good');
}
function sellAnimal(type,tr){
  const d=ANIMALS[type],a=S.ani.find(a=>a.type===type&&a.age>=d.adult&&!a.r);if(!a)return;
  S.ani=S.ani.filter(x=>x!==a);const v=d.price*.75*priceMul(tr);S.silver+=v;flow('silver',v);S.stats.earned=(S.stats.earned||0)+v;
  if(sel&&sel.k==='ani'&&sel.id===a.id)sel=null;
}

