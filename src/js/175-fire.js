/* ================= fire =================
   S.fires: {'x,y': {x,y,i:intensity 0..1.6, fuel, t}}. Fires grow, spread to neighbouring
   plants, trees and buildings, damage what they burn and go out in the rain. Colonists put them out. */
const FIRE_NOFUEL=['farm','hydro','quarry','solar','comms'];
function treeAt(x,y){for(const o of S.outside)if(o.k==='tree'&&Math.floor(o.x)===x&&Math.floor(o.y)===y)return o;return null}
function fireFuel(x,y){if(x<0||y<0||x>=W||y>=H)return 0;const i=x+y*W;
  if(S.plants[x+','+y])return 1.2;const p=tilePlot(x,y);if(p&&p.type&&!FIRE_NOFUEL.includes(p.type))return 3;
  if(treeAt(x,y))return 2.2;return 0}
function tilePlot(x,y){const p=plotAt(x,y);if(p)return p;const pid=owned[x+y*W];return pid>=0?plotById(pid):null}
let fireMsgT=-99;
function ignite(x,y,why){x=Math.floor(x);y=Math.floor(y);S.fires=S.fires||{};const k=x+','+y;if(S.fires[k])return false;const fu=fireFuel(x,y);if(!fu)return false;
  S.fires[k]={x,y,i:.45,fuel:fu,t:0};
  if(!offlineSim&&S.t-fireMsgT>25&&kAt(x,y)!==0){fireMsgT=S.t;const p=tilePlot(x,y);msg(`Fire${p&&p.type?' in the '+plotName(p).toLowerCase():''}! ${why?why+' ':''}Colonists rush to put it out.`,'bad');sfx('horn')}
  return true}
function fireCount(){return S.fires?Object.keys(S.fires).length:0}
function fireNearBase(x,y){const b=baseBox();return x>=b.x0-6&&x<=b.x1+6&&y>=b.y0-6&&y<=b.y1+6}
let fireAsgT=0,fireDirtyT=0;
function tickFire(dt){const F=S.fires;if(!F)return;const ks=Object.keys(F);if(!ks.length)return;
  const wet=S.wx&&(S.wx.k==='rain'||S.wx.k==='storm'||S.wx.k==='snow');
  for(const k of ks){const f=F[k];f.t+=dt;f.i=Math.min(1.6,f.i+dt*(wet?-.22:.07));f.fuel-=dt*.035*Math.max(.2,f.i);
    if(f.i<=0||f.fuel<=0){delete F[k];if(!offlineSim&&stains.length<220)stains.push({x:f.x+.5,y:f.y+.6,r:R(8,12),col:'rgba(30,24,18,.9)',t:S.t,seed:RI(1,999)});continue}
    const pk=f.x+','+f.y;if(S.plants[pk]&&f.t>3){delete S.plants[pk]}
    if(f.t>6&&f.i>.8){const tr=treeAt(f.x,f.y);if(tr){S.outside=S.outside.filter(o=>o!==tr);if(sel&&sel.k==='out'&&sel.id===tr.id)sel=null}}
    {const p=tilePlot(f.x,f.y);if(p&&p.type){p.dmg=Math.min(1,(p.dmg||0)+dt*.01*f.i);
      if((p.type==='storage'||p.type==='kitchen')&&Math.random()<dt*.5*f.i){const fl=Object.keys(S.items).filter(i=>cnt(i)>=1&&(ITEMS[i].food||['wood','hay','cotton','wool','leather','chemfuel','parka','duster'].includes(i)));if(fl.length){const it=pick(fl),n=Math.max(1,Math.floor(cnt(it)*.015));take(it,n);if(it==='chemfuel'&&Math.random()<.3){boomFx(f.x+.5,f.y+.5);f.i=1.6}}}}}
    for(const c of S.cols)if(!c.downed&&Math.floor(c.x)===f.x&&Math.floor(c.y)===f.y&&f.i>1)hurtColonist(c,dt*1.5);
    if(S.raid)for(const r of aliveRaiders())if(Math.floor(r.x)===f.x&&Math.floor(r.y)===f.y)hitRaider(r,dt*6);
    if(f.i>.7&&f.t>4&&!wet&&Math.random()<dt*.055*f.i){const d=pick([[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]);ignite(f.x+d[0],f.y+d[1])}}
  fireDirtyT-=dt;if(fireDirtyT<=0){fireDirtyT=3;plotDirty=true}
  fireAsgT-=dt;if(fireAsgT<=0){fireAsgT=1;assignFirefighters()}}
function canFightFire(c){return !c.downed&&!c.cover&&!(fighter(c)&&raidActive())&&!(c.militia&&raidActive())&&!outOfGrid(c)}
function assignFirefighters(){const F=S.fires,fs0=Object.values(F).filter(f=>fireNearBase(f.x,f.y)).sort((a,b)=>b.i-a.i),load={};
  for(const c of S.cols){if(c.fireJob&&(!F[c.fireJob]||!canFightFire(c))){c.fireJob=null}if(c.fireJob)load[c.fireJob]=(load[c.fireJob]||0)+1}
  for(const f of fs0){const k=f.x+','+f.y;while((load[k]||0)<2){let best=null,bd=1e9;for(const c of S.cols){if(c.fireJob||!canFightFire(c))continue;const d=Math.hypot(c.x-f.x,c.y-f.y);if(d<bd){bd=d;best=c}}if(!best)return;best.fireJob=k;releaseJob(best);best.sleeping=false;best.path=[];best.dest=null;load[k]=(load[k]||0)+1}}}
function fireFight(c,dt){const f=S.fires&&S.fires[c.fireJob];if(!f){c.fireJob=null;return false}
  const d=Math.hypot(c.x-(f.x+.5),c.y-(f.y+.5));
  if(d>1.6){let tx=f.x,ty=f.y,bd=1e9;for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const x=f.x+dx,y=f.y+dy;if(!walkable(x,y))continue;const dd=Math.hypot(c.x-x-.5,c.y-y-.5)+(dx||dy?0:2);if(dd<bd){bd=dd;tx=x;ty=y}}
    if(walkTo(c,tx,ty,dt,walkSpd(c)*1.3)){c.status='Running to put out a fire';return true}
    if(Math.hypot(c.x-tx-.5,c.y-ty-.5)>.8){c.fireJob=null;return false}}
  c.path=[];c.face=f.x+.5<c.x-.3?'l':f.x+.5>c.x+.3?'r':f.y<c.y?'u':'d';c.working=true;c.status='Beating out a fire';
  f.i-=dt*(.3+.02*c.sk.construction);if(f.i>1.2&&Math.random()<dt*.2)hurtColonist(c,R(1,3));
  if(!offlineSim&&Math.random()<dt*4)fx.push({k:'dust',x:f.x+.5+R(-.3,.3),y:f.y+.4,z:.4,vx:R(-.2,.2),vy:-.5,vz:0,t:0,life:1.2,sz:R(6,9)});
  if(f.i<=0){delete S.fires[c.fireJob];c.fireJob=null;gainXP(c,'construction',2)}return true}
/* sources */
function lightningStrike(){const b=baseBox(),trees=S.outside.filter(o=>o.k==='tree'&&fireNearBase(o.x,o.y)),pl=built().filter(p=>!FIRE_NOFUEL.includes(p.type));let x,y;
  if(pl.length&&Math.random()<.35){const p=pick(pl),[ox,oy]=plotOrigin(p);x=ox+RI(0,P-1);y=oy+RI(0,P-1)}else if(trees.length){const o=pick(trees);x=Math.floor(o.x);y=Math.floor(o.y)}else return;
  if(!offlineSim){boomFx(x+.5,y+.5);sfx('thunder',x,y);fx.push({k:'flash',x:x+.5,y:y+.5,z:0,vx:0,vy:0,vz:0,t:0,life:.4,sz:30});bolts.push({x:x+.5,y:y+.5,t:0})}
  ignite(x,y,'Lightning struck.')}
let bolts=[];
let mishapT=0;
function tickFireSources(dt){
  if(S.wx&&S.wx.k==='storm'&&!S.wx.cold&&Math.random()<dt/140)lightningStrike();
  mishapT-=dt;if(mishapT>0)return;mishapT=30;
  for(const p of built()){const ch=p.type==='burner'?.015:p.type==='kitchen'&&p.tier===0?.006:p.type==='refinery'?.008:0;if(ch&&Math.random()<ch){const[ox,oy]=plotOrigin(p);ignite(ox+2,oy+2,p.type==='burner'?'A generator caught fire.':p.type==='kitchen'?'Sparks from the cooking fire.':'Chemfuel fumes ignited.')}}}
/* drawing: layered flickering flames, smoke and a glow */
function drawFire(f,now){const x=(f.x+.5)*T,y=(f.y+.75)*T,s=T*(.45+.35*Math.min(1,f.i)),ph=now/90+f.x*13.7+f.y*7.1;
  ctx.save();ctx.globalCompositeOperation='lighter';const gr=ctx.createRadialGradient(x,y-s*.4,0,x,y-s*.4,s*1.8);gr.addColorStop(0,'rgba(255,150,50,.22)');gr.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=gr;ctx.fillRect(x-s*2,y-s*2.4,s*4,s*4);ctx.restore();
  const tongue=(ox,h,w,col,k)=>{const sw=Math.sin(ph*1.3+k)*w*.35,hh=h*(.85+.15*Math.sin(ph*2.1+k*1.7));ctx.beginPath();ctx.moveTo(x+ox-w,y);ctx.quadraticCurveTo(x+ox-w*.9,y-hh*.45,x+ox+sw,y-hh);ctx.quadraticCurveTo(x+ox+w*.9,y-hh*.45,x+ox+w,y);ctx.closePath();ctx.fillStyle=col;ctx.fill()};
  tongue(-s*.3,s*.9,s*.28,'#c8401c',1);tongue(s*.3,s*.8,s*.26,'#c8401c',2.3);tongue(0,s*1.25,s*.4,'#e8701f',0);tongue(-s*.12,s*.85,s*.24,'#f6a630',3.1);tongue(s*.1,s*.7,s*.2,'#fbd25a',4.2);tongue(0,s*.45,s*.14,'#fff1a8',5);
  for(let k=0;k<3;k++){const t=((now/1400)+k/3+f.x*.13)%1;ctx.fillStyle=`rgba(${60+k*10},${55+k*10},${50+k*10},${.32*(1-t)*Math.min(1,f.i)})`;ctx.beginPath();ctx.arc(x+Math.sin(t*5+k)*6,y-s*1.2-t*T*1.6,4+t*10,0,7);ctx.fill()}
  if(Math.random()<.15){ctx.fillStyle='#ffd27a';ctx.fillRect(x+R(-s*.5,s*.5),y-s*R(.8,1.8),1.6,1.6)}}
function drawBolts(){bolts=bolts.filter(b=>(b.t+=1/60)<.35);for(const b of bolts){const x=b.x*T,y=b.y*T;ctx.save();ctx.strokeStyle=`rgba(230,240,255,${1-b.t/.35})`;ctx.lineWidth=3;ctx.shadowColor='#bcd4ff';ctx.shadowBlur=12;ctx.beginPath();let px=x+R(-40,40),py=y-T*9;ctx.moveTo(px,py);while(py<y){py+=R(12,26);px+=(x-px)*.25+R(-14,14);ctx.lineTo(Math.min(py,y)===y?x:px,Math.min(py,y))}ctx.stroke();ctx.restore()}}
