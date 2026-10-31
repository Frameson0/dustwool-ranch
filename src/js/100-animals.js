/* ================= animals ================= */
function newAnimal(type,x,y,pen,age){return{id:nid(),type,x,y,pen,age:age??ANIMALS[type].adult+R(0,100),p:R(0,.6),hun:0,r:0,path:[],wt:R(0,3),face:Math.random()<.5?'l':'r'}}
function penUsed(p){let s=0;for(const a of S.ani)if(a.pen===p.id)s+=ANIMALS[a.type].space;return s}
function penCap(p){return Math.round(tierDef(p).cap*clusterBonus(p))}
function updAni(a,dt){
  const d=ANIMALS[a.type];
  a.age+=dt;
  a.hun+=d.eat*(biome().hay||1)/60*dt;while(a.hun>=1&&cnt('hay')>=1){take('hay',1);flow('hay',-1);a.hun-=1}
  if(a.hun>3)a.hun=3;
  const fed=a.hun<2;
  if(a.age>=d.adult){a.p=Math.min(1,a.p+dt/d.ptime*(fed?1:.4));if(d.ground&&a.p>=1){a.p=0;layEgg(a)}}
  if(a.r)return;
  if(a.path&&a.path.length){stepMove(a,dt,d.speed);return}
  a.wt-=dt;
  if(a.wt<=0){const p=plotById(a.pen);if(p&&p.type==='pen'){const[ox,oy]=plotOrigin(p);a.path=[[ox+RI(0,P-1),oy+RI(1,P-1)]]}a.wt=R(3,10)}
}
function layEgg(a){
  const x=Math.floor(a.x),y=Math.floor(a.y),p=plotById(a.pen);if(!p||!inPlot(p,x,y))return;
  const g=S.ground.find(g=>g.x===x&&g.y===y&&g.i==='egg'&&!g.r);
  if(g)g.n++;else S.ground.push({id:nid(),i:'egg',n:1,x,y,pen:p.id,r:0,lay:true});
}
function tickPens(dt){
  for(const p of built('pen')){
    p.breed=p.breed||{};
    const rancher=workersOf(p.id).length>0;
    for(const type in ANIMALS){
      const d=ANIMALS[type],adults=S.ani.filter(a=>a.pen===p.id&&a.type===type&&a.age>=d.adult);
      if(adults.length<2||!rancher||penUsed(p)+d.space>penCap(p))continue;
      p.breed[type]=(p.breed[type]||0)+dt*(done('breeding')?2:1);
      if(p.breed[type]>=d.gest){p.breed[type]=0;const m=pick(adults);S.ani.push(newAnimal(type,m.x,m.y,p.id,0));msg(`A ${d.n.toLowerCase()} was born.`,'good');S.stats.born=(S.stats.born||0)+1}
    }
  }
}

