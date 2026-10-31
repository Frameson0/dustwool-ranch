/* ================= render ================= */
let cw=0,ch=0,DPR=1;
const cv=$('game'),ctx=cv.getContext('2d');
const isTouch=matchMedia('(pointer:coarse)').matches;let MOB=false;
let installEvt=null;const isStandalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;if(S)updateUI()});
addEventListener('appinstalled',()=>{installEvt=null;if(S){msg('Dustwool Ranch is installed as an app.','good');updateUI()}});
const TABS_SHORT={work:'Work',research:'Tech',trade:'Trade',contracts:'Jobs',defense:'Def',gear:'Gear',log:'Log',world:'Map',menu:'Menu'};
function setMob(){const m=innerWidth<700||innerHeight<520;if(m!==MOB){MOB=m;document.body.classList.toggle('mob',m);if(m)document.body.classList.add('side-hidden');for(const k in TABS_SHORT){const b=document.getElementById('tab-'+k);if(!b)continue;if(!b.dataset.full)b.dataset.full=b.textContent;b.textContent=m?TABS_SHORT[k]:b.dataset.full}}}
function resize(){setMob();DPR=Math.min(3,window.devicePixelRatio||1);cw=innerWidth;ch=innerHeight;cv.width=cw*DPR;cv.height=ch*DPR}
function sideW(){return document.body.classList.contains('side-hidden')||cw<700||MOB?0:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--side'))||290}
function s2w(sx,sy){return[(sx-cw/2)/cam.z+cam.x,(sy-ch/2)/cam.z+cam.y]}
let hover=null,dragCol=null;
function render(rdt){
  if(plotDirty){buildPlots();plotDirty=false}
  if(staticCv&&seasonIdx()!==seasonDrawn)buildStatic();
  {const w=S.wx?S.wx.k:'clear',tw={clear:1,rain:1.5,snow:1.3,storm:2.8}[w]||1;WIND+=(tw-WIND)*Math.min(1,rdt*.4)}
  const now=performance.now();SUN=sunAt((S.t%DAY)/DAY*24);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle=rgb(biome().pal.out,-30);ctx.fillRect(0,0,cw,ch);
  ctx.save();ctx.translate(cw/2,ch/2);ctx.scale(cam.z,cam.z);ctx.translate(-cam.x,-cam.y);
  ctx.drawImage(staticCv,-PADL*T,-PADT*T,staticCv._w,staticCv._h);drawRiver(now);if(outerRoad.length)drawOuterRoad(ctx,gateT);ctx.drawImage(plotCv,0,0,W*T,H*T);
  if(SUN.a>0){ctx.globalAlpha=SUN.a;if(staticSil)ctx.drawImage(staticSil,-PADL*T+SUN.dx,-PADT*T+SUN.dy,staticTopCv._w,staticTopCv._h);if(plotSil){const sc=plotShadow();ctx.drawImage(sc,0,0,W*T,H*T)}ctx.globalAlpha=1}
  ctx.drawImage(plotTopCv,0,0,W*T,H*T);if(staticTopCv)ctx.drawImage(staticTopCv,-PADL*T,-PADT*T,staticTopCv._w,staticTopCv._h);drawPlotDamage(ctx);drawDefense(ctx,performance.now());drawStains();drawArmoryLive();drawMortarLive(now);drawTraps();drawLanesLive();drawWingHints();
  const hp=hover&&!gateMode?plotAt(hover[0],hover[1]):null,hk=hover?kAt(hover[0],hover[1]):-1;
  if(hover&&gateMode){const go=gateOK(hover[0],hover[1]);if(go)for(const i of go.cells){const x=i%W,y=(i-x)/W;rr(ctx,x*T+1,y*T+1,T-2,T-2,5);ctx.fillStyle=go.ok?'rgba(140,220,110,.45)':'rgba(230,100,80,.45)';ctx.fill()}}
  if(hover&&!gateMode&&hk===5){const ws=wpAt(hover[0],hover[1]);if(ws){rr(ctx,ws.x0*T+2,ws.y0*T+2,ws.w*T-4,ws.h*T-4,8);ctx.fillStyle='rgba(255,250,220,.08)';ctx.fill();ctx.strokeStyle='rgba(243,231,160,.6)';ctx.lineWidth=1.5;ctx.stroke()}}
  if(landMode){for(const p of S.plots){if(!lockedAdj(p))continue;const c=expandCost(p);const[ox,oy]=plotOrigin(p),on=hp===p;rr(ctx,ox*T+2,oy*T+2,P*T-4,P*T-4,12);ctx.fillStyle=on?'rgba(243,231,160,.28)':'rgba(243,231,160,.12)';ctx.fill();ctx.strokeStyle='rgba(243,231,160,.9)';ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.stroke();ctx.setLineDash([]);ctx.font='700 13px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText('Clear this land',(ox+2.5)*T,(oy+2.3)*T);ctx.fillStyle='#f3e7a0';ctx.fillText('Clear this land',(ox+2.5)*T,(oy+2.3)*T);ctx.font='600 11px Arimo, Arial, sans-serif';ctx.strokeText(costStr(c),(ox+2.5)*T,(oy+2.8)*T);ctx.fillStyle='#e8e2d0';ctx.fillText(costStr(c),(ox+2.5)*T,(oy+2.8)*T)}}
  if(!landMode&&hp&&!dragCol&&!hp.open&&hk===0&&S.proj&&S.proj.pid===hp.id){const[ox,oy]=plotOrigin(hp);rr(ctx,ox*T,oy*T,P*T,P*T,12);ctx.fillStyle='rgba(255,250,220,.07)';ctx.fill();ctx.strokeStyle='rgba(243,231,160,.5)';ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.stroke();ctx.setLineDash([]);
    if(!S.proj){ctx.font='700 13px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText('Clear land',(ox+2.5)*T,(oy+2.5)*T);ctx.fillStyle='#f3e7a0';ctx.fillText('Clear land',(ox+2.5)*T,(oy+2.5)*T)}}
  if(hp&&!dragCol&&hp.open){const[ox,oy]=plotOrigin(hp);rr(ctx,ox*T,oy*T,P*T,P*T,12);ctx.fillStyle='rgba(255,250,220,.06)';ctx.fill();if(!hp.type&&!hp.con){ctx.fillStyle='rgba(255,250,220,.55)';ctx.font='700 30px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('+',(ox+2.5)*T,(oy+2.5)*T)}}
  let hlId=dragCol&&dragCol.moved?dragCol.target:(sel&&sel.k==='col'&&colById(sel.id)?colById(sel.id).assign:null);
  if(typeof hlId==='string'&&hlId.startsWith('b:'))hlId=+hlId.slice(2);else if(hlId==='build')hlId=S.proj?S.proj.pid:null;
  if(hlId==='out'){rr(ctx,(GX-8)*T,(GATE_Y-8)*T,7.5*T,17*T,14);ctx.strokeStyle='rgba(243,231,160,.9)';ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.stroke();ctx.setLineDash([])}
  else if(hlId!==null&&hlId!==undefined){const hl=plotById(hlId);if(hl){const[ox,oy]=plotOrigin(hl),ww=hl.small?hl.sl.w:P,hh=hl.small?hl.sl.h:P;rr(ctx,ox*T-4,oy*T-4,ww*T+8,hh*T+8,14);ctx.strokeStyle='rgba(243,231,160,.9)';ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.stroke();ctx.setLineDash([])}}
  drawStacks();
  for(const k in S.plants){const q=S.plants[k],[x,y]=k.split(',').map(Number);drawPlant(ctx,q.c,q.g,x*T+T/2,y*T+T/2)}
  for(const gi of S.ground){drawItem(ctx,gi.i,gi.x*T+T/2,gi.y*T+T/2,T*.55);if(gi.n>1)stackLabel(gi.x,gi.y,gi.n)}
  const beds=allBeds(),ents=[];
  for(const o of S.outside)ents.push({y:o.y+.52,f:()=>{if(o.k==='tree')drawTree(ctx,o,now);else if(o.k==='rock')drawRock(ctx,o);else drawChunk(ctx,o,now);if(o.mark)drawMark(o)}});
  for(const a of S.ani)ents.push({y:a.y,f:()=>drawAnimal(ctx,a,a.x*T,a.y*T-T*.3,T)});
  for(const a of S.wild)ents.push({y:a.y,f:()=>drawWild(ctx,a,a.x*T,a.y*T+T*.2)});
  S.cols.forEach((c,i)=>{
    if(c.sleeping&&c.job&&c.job.bed&&beds[i]&&!(c.path&&c.path.length)){const b=beds[i];ents.push({y:b.y,f:()=>drawSleeper(ctx,c,b.x*T,b.y*T)})}
    else if(c.downed)ents.push({y:c.y,f:()=>{ctx.save();ctx.translate(c.x*T,c.y*T);ctx.rotate(Math.PI/2);drawPawn(ctx,c,0,0,T,'d',0);ctx.restore();ctx.fillStyle='#d86a52';ctx.font='700 12px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.fillText('+',c.x*T,c.y*T-T*.45)}});
    else if(c.post&&fighter(c)&&postDraw(c)){const pd=postDraw(c);ents.push({y:pd.y,f:()=>{const ox=c.x,oy=c.y;c.x=pd.x;c.y=pd.y;drawColonist(c,c,true,null,now);c.x=ox;c.y=oy}})}
    else ents.push({y:c.y,f:()=>drawColonist(c,c,true,null,now)});
  });
  for(const p of S.plots){if(!p.stock||!p.type)continue;const L=layouts[p.id];if(!L||!L.rack)continue;const ks=Object.keys(p.stock).filter(i=>p.stock[i]>0);if(!ks.length)continue;const[ox,oy]=plotOrigin(p);
    L.rack.forEach(([x,y],ri)=>{const its=ks.filter((_,k)=>k%L.rack.length===ri).slice(0,2);its.forEach((i,k)=>{const bx=(ox+x)*T+9+k*13,by=(oy+y)*T+(k?21:11);drawItem(ctx,i,bx,by,15)})})}
  if(S.fires)for(const k in S.fires){const f=S.fires[k];ents.push({y:f.y+.8,f:()=>drawFire(f,now)})}
  if(bolts.length)ents.push({y:1e9,f:drawBolts});
  if(S.raid&&S.raid.raiders)for(const r of S.raid.raiders)if(!r.gone)ents.push({y:r.y-(r.dead?1:0),f:()=>drawRaider(r,now)});
  for(const v of S.vis){
    if(v.hide&&v.cine)continue;
    if(v.k==='pack')ents.push({y:v.y,f:()=>{const hop=v.hop?Math.max(0,1-(now-v.hop)/600):0;drawAnimal(ctx,v,v.x*T,v.y*T-T*.3-Math.sin(hop*Math.PI)*12,T,true);if(v.em&&v.em.k==='heart')drawBubble(ctx,v.x*T+10,v.y*T-T*1.3,'heart',now)}});
    else ents.push({y:v.y,f:()=>drawColonist(v.look,v,false,v.k,now)});
  }
  ents.sort((a,b)=>a.y-b.y);for(const e of ents)e.f();
  for(const c of S.cols){const j=c.job;if(!j||c.path&&c.path.length)continue;let p=null,x=0,y=0;
    if((j.t==='harvest'||j.t==='sow'||j.t==='pick')&&j.st===1){p=j.p;x=j.x;y=j.y}
    else if(j.t==='tend'&&j.st===1){const a=aniById(j.aid);if(a){p=j.p;x=a.x-.5;y=a.y-1.3}}
    else if(j.t==='gather'&&j.st===1){const o=S.outside.find(o=>o.id===j.oid);if(o){p=j.p;x=o.x;y=o.y-.8}}
    else if((j.t==='craft'&&j.st===2)||(j.t==='mine'&&j.st===1)){const pl=plotById(j.pid);if(pl&&layouts[pl.id]){const s=layouts[pl.id].stations[j.sti]||layouts[pl.id].stations[0],[ox,oy]=plotOrigin(pl);p=j.p;x=ox+s[0];y=oy+s[1]}}
    if(p!==null){rr(ctx,x*T+3,y*T-4,T-6,6,3);ctx.fillStyle='rgba(10,10,10,.75)';ctx.fill();rr(ctx,x*T+4,y*T-3,Math.max(.1,(T-8)*clamp(p,0,1)),4,2);ctx.fillStyle='#d8b04a';ctx.fill()}}
  for(const sh of shots){sh.t+=rdt;const k=clamp(sh.t/.18,0,1),x=sh.x1+(sh.x2-sh.x1)*k,y=sh.y1+(sh.y2-sh.y1)*k;ctx.strokeStyle=sh.fac==='space'?'rgba(110,230,255,.95)':sh.fac==='industrial'?'rgba(255,225,130,.95)':sh.enemy?'rgba(240,120,90,.9)':sh.melee?'rgba(240,240,230,.8)':'rgba(255,230,160,.9)';const ln=sh.bullet?.05:.12;ctx.lineWidth=sh.melee?3:sh.bullet?1.6:2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo((x-(sh.x2-sh.x1)*ln)*T,(y-(sh.y2-sh.y1)*ln)*T);ctx.lineTo(x*T,y*T);ctx.stroke()}shots=shots.filter(sh=>sh.t<.3);
  drawFx(rdt);drawConstruction();
  if(S.proj){const p=plotById(S.proj.pid),[ox,oy]=plotOrigin(p),bx=(ox+.5)*T,by=(oy+2.2)*T,bw=4*T;rr(ctx,bx,by,bw,11,5);ctx.fillStyle='rgba(10,10,10,.75)';ctx.fill();rr(ctx,bx+2,by+2,Math.max(.1,(bw-4)*clamp(S.proj.prog,0,1)),7,3);ctx.fillStyle='#d8b04a';ctx.fill();
    const nb2=S.cols.filter(c=>c.assign==='build').length;ctx.font='600 11px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';const tx=(nb2||hasConstructors()?(S.proj.prog<.6?'Clearing land':'Building the wall'):'Needs builders')+' · '+etaStr(S.proj);ctx.strokeText(tx,bx+bw/2,by-2);ctx.fillStyle=nb2?'#f0efe6':'#e8b04a';ctx.fillText(tx,bx+bw/2,by-2)}
  if(S.raid&&S.raid.ship){const sh=S.raid.ship,h=clamp(1-(S.t-sh.t0)/4,0,1);drawGunship(sh.x,sh.y,h)}
  if(S.orbital){const pp=padPos();if(pp)drawCraft(pp[0],pp[1],clamp(1-(S.t-(S.orbital.t0||0))/4,0,1),'shuttle')}
  drawProjs();
  for(const s of ships){s.t+=rdt;if(s.dark)drawGunship(s.x,s.y,clamp((s.t-4.5)/2.5,0,1));else drawShip(s)}ships=ships.filter(s=>s.t<7);
  drawUiFx(rdt);drawTutMap(now);drawSelection();
  ctx.restore();
  drawWeather(rdt,now);
  const hr=(S.t%DAY)/DAY*24;let dark=0;
  if(hr<3||hr>=23)dark=1;else if(hr<4.5)dark=1-(hr-3)/1.5;else if(hr>=21.5)dark=(hr-21.5)/1.5;
  const warm=hr>=4.5&&hr<7.5?(1-(hr-4.5)/3)*.7:hr>=15.5&&hr<23?(hr<20?(hr-15.5)/4.5:1-(hr-20)/3*.5)*.8:0;
  if(warm>0){ctx.save();ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgb(255,${Math.round(255-85*warm)},${Math.round(255-150*warm)})`;ctx.fillRect(0,0,cw,ch);ctx.restore()}
  const glowD=Math.max(dark,hr>=19.5&&hr<21.5?(hr-19.5)/2*.6:hr>=4.5&&hr<5.5?(5.5-hr)*.6:0);
  if(dark>0){ctx.fillStyle=`rgba(16,22,48,${dark*.42})`;ctx.fillRect(0,0,cw,ch)}if(glowD>0)drawLights(glowD,now)
}
function drawRiver(now){if(!RIV||RIV.dry)return;const g=ctx,R0=RIV,n=R0.pts.length;
  if(!R0.frozen){g.save();g.lineCap='round';const fl=.8+WIND*.25;
    R0.lanes.forEach((ln,k)=>{g.beginPath();ln.forEach(([x,y],i)=>i?g.lineTo(x*T,y*T):g.moveTo(x*T,y*T));g.setLineDash([T*(.45+k*.12),T*(1.1+(k%3)*.4)]);g.lineDashOffset=-(now/1000)*T*(1.3+((k*7)%3)*.3+(k===2?.4:0))*fl;g.strokeStyle=`rgba(225,242,246,${k===2?.24:.13})`;g.lineWidth=k===2?2.2:1.4;g.stroke()});
    g.setLineDash([]);
    for(let i=0;i<22;i++){const sv=((now/14000+i*.0451)%1),idx=Math.floor(sv*(n-1)),p=R0.pts[idx],nn=R0.nrm[idx],o=Math.sin(i*12.9)*R0.half[idx]*.8,tw=.5+.5*Math.sin(now/260+i*3.1);g.fillStyle=`rgba(255,255,255,${.4*tw})`;g.fillRect((p[0]+nn[0]*o)*T-2,(p[1]+nn[1]*o)*T-.5,4,1.2)}
    for(const f of R0.fish){let sv=(f.s0+now/1000*f.sp)%1;if(sv<0)sv+=1;const fi=sv*(n-1),i0=Math.min(n-2,Math.floor(fi)),fr=fi-i0,L=(a,b)=>a+(b-a)*fr,pa=R0.pts[i0],pb=R0.pts[i0+1],na=R0.nrm[i0],nb2=R0.nrm[i0+1],nn=[L(na[0],nb2[0]),L(na[1],nb2[1])],hh=L(R0.half[i0],R0.half[i0+1]),lat=(f.lat+Math.sin(now/900+f.ph)*.18)*hh,x=(L(pa[0],pb[0])+nn[0]*lat)*T,y=(L(pa[1],pb[1])+nn[1]*lat)*T,dir=f.sp>0?1:-1,ang=Math.atan2(-nn[0]*dir,nn[1]*dir);
      const jp=((now/1000+f.ph*3.7)%11)/11,jump=jp<.035?jp/.035:-1;
      g.save();g.translate(x,y-(jump>=0?Math.sin(jump*Math.PI)*16:0));g.rotate(ang+(jump>=0?(jump-.5)*1.4*dir:Math.sin(now/180+f.ph)*.15));
      g.fillStyle=jump>=0?'rgba(70,90,100,.95)':'rgba(25,45,55,.5)';g.beginPath();g.ellipse(0,0,3,7,0,0,7);g.fill();g.beginPath();g.moveTo(0,6);g.lineTo(-3.5,11);g.lineTo(3.5,11);g.closePath();g.fill();g.restore();
      if(jump>=0&&jump>.7||jp>.035&&jp<.07){const k=jump>=0?(jump-.7)/.3:(jp-.035)/.035;g.strokeStyle=`rgba(235,248,252,${.7*(1-k)})`;g.lineWidth=1.5;g.beginPath();g.ellipse(x,y,4+k*12,2+k*5,0,0,7);g.stroke()}}
    g.restore()}}
let wxCam=null,wxP=[],flash=0,nextBolt=0,bolt=null;
function drawWeather(rdt,now){const w=S.wx?S.wx.k:'clear',se=seasonIdx(),b=biome(),cold=!!(S.wx&&S.wx.cold);
  const rain=(w==='rain'||w==='storm')&&!cold,snow=w==='snow'||(w==='storm'&&cold),leaves=!rain&&!snow&&b.out2==='grass'&&se!==3;
  const kind_=rain?'r':snow?'s':leaves?'l':null,want=Math.round((rain?(w==='storm'?380:210):snow?(w==='storm'?300:150):leaves?(se===2?48:9):0)),wind=(WIND-1)*130+25;
  const spawn=(p,top)=>{p.k=kind_;p.x=Math.random()*(cw+200)-100;p.y=top?-20-Math.random()*40:Math.random()*ch;p.z=Math.random();p.ph=Math.random()*9;p.vr=(Math.random()-.5)*6;p.rot=Math.random()*6;p.c=se===2?pick(['#b8642a','#d0902e','#8a4a22','#c8a040','#a83a22']):se===0?pick(['#7ab050','#f0c0d0']):pick(['#6a9a40','#88b050']);return p};
  while(wxP.length<want)wxP.push(spawn({},false));if(wxP.length>want)wxP.length=want;
  if(wxCam){const zr=cam.z/wxCam.z,dx=(cam.x-wxCam.x)*cam.z,dy=(cam.y-wxCam.y)*cam.z;if(zr!==1||dx||dy)for(const p of wxP){p.x=(p.x-cw/2)*zr+cw/2-dx;p.y=(p.y-ch/2)*zr+ch/2-dy;const W2=cw+240,H2=ch+120;if(p.x<-120)p.x+=W2;else if(p.x>cw+120)p.x-=W2;if(p.y<-90)p.y+=H2;else if(p.y>ch+30&&dy<0)p.y-=H2}}
  wxCam={x:cam.x,y:cam.y,z:cam.z};
  ctx.save();
  if(rain||snow){ctx.fillStyle=w==='storm'?'rgba(18,26,40,.26)':rain?'rgba(25,35,50,.13)':'rgba(200,210,225,.08)';ctx.fillRect(0,0,cw,ch)}
  ctx.lineCap='round';
  for(const p of wxP){
    if(p.k==='r'){p.x+=wind*rdt*1.6;p.y+=(820+p.z*300)*rdt;if(p.y>ch+20){spawn(p,true)}else{ctx.strokeStyle=`rgba(190,210,230,${.22+p.z*.2})`;ctx.lineWidth=1+p.z*.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-wind*.02,p.y-12-p.z*8);ctx.stroke()}}
    else if(p.k==='s'){p.x+=(wind*.7+Math.sin(now/700+p.ph)*22)*rdt;p.y+=(45+p.z*55)*rdt;if(p.y>ch+10||p.x>cw+60){spawn(p,true)}else{ctx.fillStyle=`rgba(255,255,255,${.55+p.z*.35})`;ctx.beginPath();ctx.arc(p.x,p.y,1+p.z*1.8,0,7);ctx.fill()}}
    else if(p.k==='l'){p.x+=wind*rdt*(1.4+p.z)+Math.sin(now/600+p.ph)*14*rdt;p.y+=(24+p.z*36)*rdt+Math.sin(now/450+p.ph)*16*rdt;p.rot+=p.vr*rdt;if(p.y>ch+20||p.x>cw+40){spawn(p,true);if(Math.random()<.5){p.x=-20;p.y=Math.random()*ch}}else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(1,.55+.45*Math.sin(now/300+p.ph));ctx.fillStyle=p.c;ctx.beginPath();ctx.ellipse(0,0,4+p.z*2,2+p.z,0,0,7);ctx.fill();ctx.restore()}}
    else spawn(p,true);
  }
  if(w==='storm'&&!cold){if(now>nextBolt){nextBolt=now+R(4500,12000);flash=1;const x0=R(cw*.15,cw*.85),pts=[[x0,0]];let x=x0,y=0;while(y<ch*.7){y+=R(20,50);x+=R(-30,30);pts.push([x,y])}bolt={pts,t:now};sfx('thunder',undefined,undefined,{delay:R(.3,1.8)})}
    if(flash>0){const f2=now-bolt.t<120?flash:flash*(.6+.4*Math.sin((now-bolt.t)/40));ctx.fillStyle=`rgba(235,240,255,${Math.max(0,f2)*.5})`;ctx.fillRect(0,0,cw,ch);if(now-bolt.t<260){ctx.strokeStyle='rgba(255,255,240,.95)';ctx.lineWidth=2.5;ctx.beginPath();bolt.pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()}flash-=rdt*2.6}}
  if(raidActive()){const a=.1+.06*Math.sin(now/300),gr=ctx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*.35,cw/2,ch/2,Math.max(cw,ch)*.75);gr.addColorStop(0,'rgba(180,30,20,0)');gr.addColorStop(1,`rgba(180,30,20,${a})`);ctx.fillStyle=gr;ctx.fillRect(0,0,cw,ch)}
  ctx.restore()}
let uifx=[];
function uiPulse(x,y,txt,col){sfx('done',x,y);uifx.push({k:'ring',x,y,t:0,life:1.1,col:col||'243,231,160'});if(txt)uifx.push({k:'txt',x,y,t:0,life:2,txt})}
function drawUiFx(rdt){for(const f of uifx){f.t+=rdt;const k=f.t/f.life;
    if(f.k==='ring'){for(let m=0;m<2;m++){const kk=clamp(k-m*.18,0,1);if(kk<=0)continue;ctx.strokeStyle=`rgba(${f.col},${(1-kk)*.85})`;ctx.lineWidth=3*(1-kk)+1;ctx.beginPath();ctx.arc(f.x*T,f.y*T,T*(.4+kk*2.4),0,7);ctx.stroke()}}
    else{const y=f.y*T-T*.6-k*34;ctx.font='700 14px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=k<.15?k/.15:1-Math.max(0,(k-.6)/.4);ctx.lineWidth=3.5;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(f.txt,f.x*T,y);ctx.fillStyle='#f3e7a0';ctx.fillText(f.txt,f.x*T,y);ctx.globalAlpha=1}}
  uifx=uifx.filter(f=>f.t<f.life)}
function drawMark(o){const x=o.x*T+T-4,y=o.y*T+2;ctx.beginPath();ctx.arc(x,y,7,0,7);fs(ctx,o.k==='tree'?'#d8b04a':'#7fc8d8',1.4);ctx.strokeStyle=OUT;ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();if(o.k==='tree'){ctx.moveTo(x-3,y+3);ctx.lineTo(x+2,y-2);ctx.moveTo(x,y-4);ctx.lineTo(x+4,y)}else ctx.arc(x,y,3,0,7);ctx.stroke()}
function stackLabel(x,y,n){
  ctx.font='700 10px Arimo, Arial, sans-serif';ctx.textAlign='right';ctx.textBaseline='alphabetic';
  ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(n,x*T+T-2,y*T+T-2);ctx.fillStyle='#f0f0e8';ctx.fillText(n,x*T+T-2,y*T+T-2);
}
function drawStacks(){
  const sc=storeCells(),tc=tableCells(),kc=kitchenCells(),ar=armories().length>0;let si=0,ti=0,ki=0;
  for(const i in ITEMS){
    if(ar&&isGear(i))continue;let n=Math.floor(cnt(i));
    while(n>0){
      let cell,cap;
      if(ITEMS[i].table&&ti<tc.length){cell=tc[ti++];cap=25}
      else if(KFOOD.includes(i)&&ki<kc.length){cell=kc[ki++];cap=25}
      else if(si<sc.length){cell=sc[si++];cap=Math.floor(tierDef(cell[2]).per*clusterBonus(cell[2])*(biome().storage||1))}
      else break;
      const k=Math.min(n,cap);drawItem(ctx,i,cell[0]*T+T/2,cell[1]*T+T/2,T*.75);stackLabel(cell[0],cell[1],k);n-=k;
    }
  }
}
function drawColonist(p,e,isCol,kind_,now){
  const moving=e.path&&e.path.length;let bob=moving?Math.abs(Math.sin(now/110))*2:0,wx=0;
  if(isCol&&e.working&&!moving){wx=Math.sin(now/70+e.id)*1.6;bob=Math.abs(Math.sin(now/140+e.id))*1.5}
  const sit=isCol&&e.loafing&&!moving;
  let cx=e.x*T+wx,cy=e.y*T-T*.12+(sit?4:0);const atk=e.atkT&&now-e.atkT<260?(now-e.atkT)/260:-1;if(atk>=0){const l=Math.sin(atk*Math.PI)*7;cx+=Math.cos(e.atkA)*l;cy+=Math.sin(e.atkA)*l}
  if(sit){E(ctx,cx,cy+T*.28,T*.3,T*.13);fs(ctx,'#7a5834',1.5);E(ctx,cx,cy+T*.22,T*.26,T*.1);fs(ctx,'#b08a5a',1.2);ctx.strokeStyle='rgba(90,60,30,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy+T*.22,T*.12,0,6);ctx.stroke()}
  if(isCol&&e.helmet){p._noHat=1;drawPawn(ctx,p,cx,cy,T,e.face,bob);p._noHat=0}else drawPawn(ctx,p,cx,cy,T,e.face,bob);if(atk>=0)slash(cx,cy,e.atkA,atk);
  if(isCol&&(e.armor||e.helmet)){const by=cy+T*.04-bob,AC={woodarmor:['#9a7448','#7a5834'],leatherarmor:['#a8784a','#7a5434'],flakvest:['#5a6448','#3f4733'],plate:['#aab1b7','#7c838a'],recon:['#46535c','#2e383f'],marine:['#55616c','#353e46']};
    if(e.armor){const[c1,c2]=AC[e.armor]||AC.woodarmor;rr(ctx,cx-T*.19,by-T*.03,T*.38,T*.27,6);fs(ctx,c1,1.3);ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx,by-T*.02);ctx.lineTo(cx,by+T*.23);ctx.stroke();
      if(e.armor==='flakvest'){for(const sd of[-1,1]){rr(ctx,cx+sd*T*.1-3,by+T*.1,6,6,1);fs(ctx,c2,.8)}}
      if(['plate','recon','marine'].includes(e.armor)){for(const sd of[-1,1]){E(ctx,cx+sd*T*.22,by,T*(e.armor==='marine'?.12:.09),T*.08);fs(ctx,c2,1.3)}}
      if(e.armor==='recon'||e.armor==='marine'){ctx.fillStyle='#5fe0f0';ctx.fillRect(cx-T*.1,by+T*.05,T*.2,2)}}
    if(e.helmet){const hx=cx+(e.face==='l'?-T*.035:e.face==='r'?T*.035:0),hy=by-T*.22;
      if(e.helmet==='marinehelm'){ctx.beginPath();ctx.arc(hx,hy,T*.22,0,7);fs(ctx,'#3a434b',1.5);if(e.face!=='u'){rr(ctx,hx-T*.14+(e.face==='l'?-2:e.face==='r'?2:0),hy-T*.05,T*.28,T*.08,3);ctx.fillStyle='#5fe0f0';ctx.fill()}}
      else{ctx.beginPath();ctx.ellipse(hx,hy-T*.04,T*.22,T*.17,0,Math.PI,0);ctx.closePath();fs(ctx,e.helmet==='advhelmet'?'#6f777e':'#9aa0a6',1.4);if(e.helmet==='advhelmet'){ctx.fillStyle='rgba(20,24,28,.85)';ctx.fillRect(hx-T*.15,hy-T*.08,T*.3,3)}}}}
  if(isCol&&(e.hp??100)<100){rr(ctx,cx-11,cy-T*.66,22,4,2);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fill();ctx.fillStyle=e.hp>50?'#8fc46a':e.hp>25?'#d8b14a':'#d86a52';ctx.fillRect(cx-10.5,cy-T*.66+.5,21*clamp(e.hp/100,0,1),3)}
  if(isCol&&e.load&&e.load.length){const hp=plotById(e.assign),tier=hp&&hp.type==='storage'?hp.tier:0,top=e.load.slice().sort((a,b)=>b.n-a.n)[0];
    if(tier===0){rr(ctx,cx-9,cy-T*.62,18,13,5);fs(ctx,'#b09a6e',1.4);drawItem(ctx,top.i,cx,cy-T*.42,T*.38)}
    else{const sd=e.face==='l'?1:e.face==='r'?-1:0,kx=cx+sd*T*.62,ky=cy+(sd?T*.12:T*.5),wv=tier===2?1.25:1;
      ctx.strokeStyle=OUT;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx+sd*T*.2,cy+T*.12);ctx.lineTo(kx-sd*10*wv,ky);ctx.stroke();ctx.strokeStyle='#8a6440';ctx.lineWidth=1.6;ctx.stroke();
      rr(ctx,kx-11*wv,ky-8*wv,22*wv,16*wv,3);fs(ctx,tier===2?'#7a5834':'#9a7448',1.6);
      for(const wx2 of[-9*wv,9*wv]){ctx.beginPath();ctx.arc(kx+wx2,ky+7*wv,4*wv,0,7);fs(ctx,'#4a3420',1.4)}
      drawItem(ctx,top.i,kx,ky-4*wv,T*.4*wv);if(tier===2){ctx.beginPath();ctx.arc(kx,ky-8*wv,11*wv,Math.PI,0);ctx.strokeStyle='rgba(230,220,190,.85)';ctx.lineWidth=2;ctx.stroke()}}}
  if(isCol&&e.carcass){ctx.save();ctx.translate(cx,cy-T*.5);ctx.scale(.6,.6);drawWild(ctx,{type:e.carcass,dead:true,face:'r'},0,0);ctx.restore()}
  if(isCol&&(e.hunting||e.carcass||fighter(e))){const w=e.useMelee?meleeW(e):(e.hunting||e.carcass)?(e.weapon||e.melee):(rangedW(e)||meleeW(e));if(w){const bow=w==='bow'||w==='recurve';ctx.save();ctx.translate(cx+(e.face==='l'?-T*.28:T*.28),cy+T*.08);ctx.scale((e.face==='l'?-1:1)*(bow?-1:1),1);drawItem(ctx,w,0,0,T*.5);ctx.restore()}
    const other=w&&fighter(e)?(w===meleeW(e)?rangedW(e):meleeW(e)):null;if(other){ctx.save();ctx.translate(cx-(e.face==='l'?-T*.12:T*.12),cy-T*.02);ctx.rotate(.9);ctx.globalAlpha=.85;drawItem(ctx,other,0,0,T*.38);ctx.restore()}}
  if(isCol&&e.carry)drawItem(ctx,e.carry.i,cx+T*.1,cy+T*.22,T*.42);
  if(isCol&&e.hold&&moving)drawItem(ctx,e.hold.i,cx+T*.1,cy+T*.22,T*.42);
  const em=e.em||e.bub;
  if(em&&em.k==='smoke'){const sd=e.face==='l'?-1:1,hx=cx+sd*6,hy=cy-T*.18;ctx.strokeStyle='#f2eee4';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx+sd*6,hy+1);ctx.stroke();ctx.fillStyle='#e08a3a';ctx.beginPath();ctx.arc(hx+sd*7,hy+1,1.4,0,7);ctx.fill();
    for(let k=0;k<3;k++){const t=((now/1000+k*.6)%1.8)/1.8;ctx.fillStyle=`rgba(220,220,220,${.5*(1-t)})`;ctx.beginPath();ctx.arc(hx+sd*8+Math.sin(t*6+k)*3,hy-t*22,2+t*4,0,7);ctx.fill()}}
  else if(em&&em.k==='read'){const hx=cx,hy=cy+T*.12,fl=Math.sin(now/900)>.95?2:0;ctx.save();ctx.translate(hx,hy);ctx.beginPath();ctx.moveTo(-9,-4);ctx.lineTo(0,-2);ctx.lineTo(9,-4-fl);ctx.lineTo(9,5);ctx.lineTo(0,7);ctx.lineTo(-9,5);ctx.closePath();fs(ctx,'#f2eee4',1.4);ctx.strokeStyle='#7a3f36';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(0,7);ctx.stroke();ctx.strokeStyle='rgba(60,50,40,.5)';ctx.lineWidth=.8;ctx.beginPath();for(const y of[0,2.5]){ctx.moveTo(-7,y);ctx.lineTo(-2,y+1);ctx.moveTo(2,y+1);ctx.lineTo(7,y)}ctx.stroke();ctx.restore()}
  else if(em&&em.k==='beer'){const hx=cx+(e.face==='l'?-T*.3:T*.3),hy=cy+T*.05-(Math.sin(now/500)>.7?6:0);rr(ctx,hx-4,hy-6,8,10,2);fs(ctx,'#d8a030',1.3);ctx.fillStyle='#f6f2e8';ctx.fillRect(hx-4,hy-6,8,3);ctx.strokeStyle=OUT;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(hx+5,hy-1,2.5,-1.5,1.5);ctx.stroke()}
  else if(em)drawBubble(ctx,cx+8,cy-T*.42,em.k,now);
  if(isCol&&e.sleeping){ctx.font='700 11px Arimo, Arial, sans-serif';ctx.fillStyle='#cfd8f0';ctx.textAlign='center';ctx.fillText('z',cx+10,cy-14-Math.sin(now/400)*3)}
  const label=isCol?p.nick:kind_==='wanderer'?p.nick+' (wanderer)':'Trader';
  ctx.font='600 10px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  const tw=ctx.measureText(label).width+10;
  rr(ctx,cx-tw/2,cy+T*.42,tw,13,6);ctx.fillStyle='rgba(0,0,0,.55)';ctx.fill();
  ctx.fillStyle=isCol?'#f0efe6':kind_==='wanderer'?'#a9d0f0':'#d8d0a0';ctx.fillText(label,cx,cy+T*.42+7);
}
function padPos(){const p=built('comms')[0];if(!p)return null;const[ox,oy]=plotOrigin(p);return[ox+3.4,oy+3.4]}
function drawCraft(x,y,h,kind){
  const cx=x*T,cy=y*T,big=kind==='gunship',sc=big?1.35:kind==='drop'?.85:1,hull=big?'#3c4046':'#c7c8c3',dk=big?'#26292d':'#8e908c',stripe=big?'#b8322a':'#d8742a';
  ctx.fillStyle=`rgba(0,0,0,${.38*(1-h*.7)})`;E(ctx,cx+h*50,cy+30*sc,T*1.9*sc*(1-h*.4),T*.8*sc*(1-h*.4));ctx.fill();
  ctx.save();ctx.translate(cx,cy-h*340);ctx.scale(sc*(1+h*.3),sc*(1+h*.3));
  if(h>0||kind==='gunship'&&h>0){ctx.fillStyle='rgba(255,150,70,.85)';for(const ex of[-20,20]){E(ctx,ex,46,7,12+Math.random()*10);ctx.fill()}}
  for(const ex of[-1,1]){rr(ctx,ex*26-9,10,18,34,5);fs(ctx,dk,2);ctx.fillStyle='#4a4d50';ctx.fillRect(ex*26-6,40,12,6);ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;ctx.strokeRect(ex*26-6,16,12,18)}
  ctx.beginPath();ctx.moveTo(-18,-34);ctx.quadraticCurveTo(0,-50,18,-34);ctx.lineTo(24,30);ctx.quadraticCurveTo(0,40,-24,30);ctx.closePath();fs(ctx,hull,2.4);
  ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-20,-6);ctx.lineTo(20,-6);ctx.moveTo(-22,14);ctx.lineTo(22,14);ctx.moveTo(0,-6);ctx.lineTo(0,30);ctx.stroke();
  ctx.fillStyle=stripe;ctx.beginPath();ctx.moveTo(-21,0);ctx.lineTo(21,0);ctx.lineTo(22,6);ctx.lineTo(-22,6);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(-11,-30);ctx.quadraticCurveTo(0,-40,11,-30);ctx.lineTo(9,-20);ctx.lineTo(-9,-20);ctx.closePath();fs(ctx,big?'#5fe0f0':'#3d5a70',1.6);ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-7,-30,4,6);
  if(big){for(const ex of[-1,1]){ctx.beginPath();ctx.moveTo(ex*22,-4);ctx.lineTo(ex*46,14);ctx.lineTo(ex*44,24);ctx.lineTo(ex*22,22);ctx.closePath();fs(ctx,dk,2);rr(ctx,ex*36-3,-10,6,24,2);fs(ctx,'#1e2023',1.2)}}
  else{rr(ctx,-8,-14,16,10,3);fs(ctx,'#e6e6e2',1.2)}
  ctx.restore();
}
function drawGunship(x,y,h){drawCraft(x,y,h,'gunship')}
function drawGunshipOld(x,y,h){
  const cx=x*T,cy=y*T;ctx.fillStyle=`rgba(0,0,0,${.4*(1-h*.7)})`;E(ctx,cx+h*40,cy+26,T*2.4*(1-h*.4),T*.8*(1-h*.4));ctx.fill();
  ctx.save();ctx.translate(cx,cy-h*320);ctx.scale(1+h*.3,1+h*.3);
  if(h>0){ctx.fillStyle='rgba(255,120,60,.8)';for(const fx2 of[-26,26]){E(ctx,fx2,38,8,16+Math.random()*8);ctx.fill()}}
  ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(22,-30);ctx.lineTo(58,8);ctx.lineTo(50,30);ctx.lineTo(20,24);ctx.lineTo(12,38);ctx.lineTo(-12,38);ctx.lineTo(-20,24);ctx.lineTo(-50,30);ctx.lineTo(-58,8);ctx.lineTo(-22,-30);ctx.closePath();fs(ctx,'#3a3e44',2.6);
  ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(10,-20);ctx.lineTo(-10,-20);ctx.closePath();fs(ctx,'#c8382a',1.6);
  ctx.fillStyle='#8a2a22';ctx.fillRect(-46,10,22,5);ctx.fillRect(24,10,22,5);
  for(const gx of[-34,34]){rr(ctx,gx-4,-6,8,22,2);fs(ctx,'#24272b',1.4)}
  ctx.fillStyle='rgba(95,224,240,.85)';ctx.fillRect(-6,-2,12,4);ctx.restore();
}
function drawBug(r,cx,cy,now){
  const sz={scarab:.5,spelopede:.78,megaspider:1.1}[r.bug]*T*(r.behemoth?r.sz:1),col=r.behemoth?'#5a3a2c':{scarab:'#3d3a2a',spelopede:'#4f3c2c',megaspider:'#2f2a36'}[r.bug],dir=r.face==='l'?-1:1;
  if(r.emerge>0){E(ctx,cx,cy+sz*.35,sz*.7,sz*.28);fs(ctx,'#5a4630',1.4);ctx.fillStyle=col;E(ctx,cx,cy+sz*.2,sz*.3,sz*.14);ctx.fill();return}
  ctx.save();ctx.translate(cx,cy+sz*.3);ctx.scale(dir,1);
  if(r.dead){ctx.globalAlpha=.8;ctx.scale(1,-1);ctx.translate(0,sz*.25)}
  else{ctx.fillStyle='rgba(0,0,0,.22)';E(ctx,0,sz*.08,sz*.55,sz*.14);ctx.fill()}
  const mv=r.dead?0:(r.bash?Math.sin(now/50):Math.sin(now/90+r.id))*.25;
  ctx.strokeStyle=OUT;ctx.lineWidth=Math.max(2,sz*.08);ctx.lineCap='round';ctx.beginPath();
  for(let k=0;k<3;k++){const lx=-sz*.18+k*sz*.2,sw=(k%2?mv:-mv)*sz;for(const sd of[-1,1]){ctx.moveTo(lx,-sz*.12);ctx.lineTo(lx+sw+sd*sz*.12,-sz*.02+sd*sz*.05);ctx.lineTo(lx+sw*1.4+sd*sz*.2,sz*.1)}}ctx.stroke();
  ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,sz*.04);ctx.stroke();
  E(ctx,-sz*.24,-sz*.2,sz*.32,sz*.22);fs(ctx,col,1.6);
  if(r.bug==='spelopede'){ctx.strokeStyle='rgba(20,14,8,.6)';ctx.lineWidth=1.2;ctx.beginPath();for(let k=0;k<3;k++){ctx.moveTo(-sz*.4+k*sz*.12,-sz*.36);ctx.lineTo(-sz*.42+k*sz*.12,-sz*.04)}ctx.stroke()}
  if(r.bug==='megaspider'){ctx.fillStyle='#5a3a4a';for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(-sz*.38+k*sz*.14,-sz*.36);ctx.lineTo(-sz*.33+k*sz*.14,-sz*.5);ctx.lineTo(-sz*.29+k*sz*.14,-sz*.36);ctx.fill()}}
  E(ctx,sz*.08,-sz*.18,sz*.16,sz*.15);fs(ctx,col,1.5);
  E(ctx,sz*.28,-sz*.17,sz*.12,sz*.11);fs(ctx,col,1.4);
  ctx.fillStyle=r.bug==='megaspider'?'#e05040':'#d8c040';ctx.beginPath();ctx.arc(sz*.33,-sz*.21,Math.max(1.4,sz*.03),0,7);ctx.fill();
  ctx.strokeStyle=OUT;ctx.lineWidth=2.4;ctx.beginPath();const op=r.bash?Math.abs(Math.sin(now/80))*.1:.04;ctx.moveTo(sz*.36,-sz*.14);ctx.quadraticCurveTo(sz*.5,-sz*(.14+op),sz*.46,-sz*.04);ctx.moveTo(sz*.36,-sz*.1);ctx.quadraticCurveTo(sz*.52,-sz*(.04-op),sz*.44,sz*.02);ctx.stroke();ctx.strokeStyle='#c9b48a';ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.14)';E(ctx,-sz*.3,-sz*.28,sz*.14,sz*.06);ctx.fill();
  ctx.restore();
  if(!r.dead&&r.hp<r.max){rr(ctx,cx-10,cy-sz*.6,20,4,2);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fill();ctx.fillStyle='#d86a52';ctx.fillRect(cx-9.5,cy-sz*.6+.5,19*clamp(r.hp/r.max,0,1),3)}
}
function drawShip(s){const t=s.t;let h=0;if(t<2)h=(2-t)/2;else if(t>4.5)h=(t-4.5)/2.5;drawCraft(s.x??3,s.y??(GATE_Y-4),clamp(h,0,1),s.kind||'drop')}
function drawSelection(){
  if(!sel)return;let x,y,w,h;
  if(sel.k==='col'){const c=colById(sel.id);if(!c){sel=null;return}x=c.x-.5;y=c.y-.85;w=1;h=1.2}
  else if(sel.k==='ani'){const a=aniById(sel.id);if(!a){sel=null;return}const big=a.type==='shaggox'?1.4:1;x=a.x-.5*big;y=a.y-.9*big;w=big;h=big}
  else if(sel.k==='vis'){const v=S.vis.find(v=>v.id===sel.id);if(!v){sel=null;return}x=v.x-.5;y=v.y-.85;w=1;h=1.2}
  else if(sel.k==='out'){const o=S.outside.find(o=>o.id===sel.id);if(!o){sel=null;return}x=o.x-.1;y=o.y-.6;w=1.2;h=1.5}
  else if(sel.k==='wild'){const a=S.wild.find(a=>a.id===sel.id);if(!a){sel=null;return}x=a.x-.6;y=a.y-.9;w=1.2;h=1.2}
  else if(sel.k==='slot'){const sl=slotById(sel.id);if(!sl){sel=null;return}x=sl.x-.4;y=sl.y-.4;w=1.8;h=1.8}
  else if(sel.k==='wall'){const b=baseBox();x=b.x0-.2;y=b.y0-.2;w=b.x1-b.x0+.4;h=b.y1-b.y0+.4}
  else if(sel.k==='wp'){const ws=wpSlots().find(s=>s.key===sel.key);if(!ws){sel=null;return}x=ws.x0;y=ws.y0;w=ws.w;h=ws.h}
  else if(sel.k==='lane'){const sl=laneCache.find(s=>s.key===sel.key);if(!sl){sel=null;return}x=sl.x0;y=sl.y0;w=sl.w;h=sl.h}
  else if(sel.k==='trap'){if(!S.traps[sel.key]){sel=null;return}x=sel.key%W;y=Math.floor(sel.key/W);w=1;h=1}
  else if(sel.k==='gate'){const g=S.gates.find(g=>gateCells(g).includes(sel.cell));if(!g){sel=null;return}x=g.v?g.x:g.x-1;y=g.v?g.y-1:g.y;w=g.v?1:3;h=g.v?3:1}
  else if(sel.k==='plot'){const p=plotById(sel.id);if(!p){sel=null;return}const[ox,oy]=plotOrigin(p);x=ox;y=oy;w=P;h=P}
  x*=T;y*=T;w*=T;h*=T;const L=Math.min(12,w/3);ctx.strokeStyle='#f6f6ee';ctx.lineWidth=2/cam.z+1;ctx.lineCap='round';ctx.beginPath();
  for(const[cx,cy,dx,dy]of[[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){ctx.moveTo(cx+dx*L,cy);ctx.lineTo(cx,cy);ctx.lineTo(cx,cy+dy*L)}
  ctx.stroke();
}

