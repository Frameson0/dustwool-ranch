/* ================= siege engines =================
   Siege raids bring engines that shell the wall from their range while the raiders gather and bombard,
   and stop once the storm begins. Engines are raiders with r.engine set: guards and mortars can destroy them.
   Left behind when the raid ends, they are salvaged for materials. */
const ENGINES={
  catapult:{n:'Catapult',hp:240,range:22,rate:6.5,dmg:[45,70],shot:'rock',arc:3.2,splash:1,armor:.25,loot:{wood:40,stone:12},fire:.18},
  ballista:{n:'Ballista',hp:160,range:20,rate:3.4,dmg:[22,32],shot:'bolt',arc:0,armor:.2,loot:{wood:30,steel:4}},
  cannon:{n:'Field cannon',hp:280,range:24,rate:5.8,dmg:[50,76],shot:'ball',arc:1.3,splash:1,armor:.45,loot:{steel:30,wood:10}},
  rockets:{n:'Rocket rack',hp:190,range:23,rate:8,salvo:4,dmg:[14,20],shot:'rocket',arc:2,armor:.35,loot:{steel:20,chemfuel:10},fire:.12},
  plasma:{n:'Plasma battery',hp:320,range:26,rate:4.6,dmg:[46,66],shot:'plasma',arc:0,armor:.5,loot:{plasteel:16,comp:3}},
  mortar:{n:'Mech mortar',hp:340,range:28,rate:6,dmg:[55,80],shot:'shell',arc:3.6,splash:1,armor:.5,loot:{mechpart:3,steel:20}},
};
const FAC_ENGINES={tribal:['catapult','ballista'],industrial:['cannon','rockets'],space:['plasma','plasma','rockets'],mech:['mortar']};
function planSiege(fac,size){const L=FAC_ENGINES[fac];if(!L)return[];const n=clamp(1+Math.floor(size/9),1,3),out=[];for(let k=0;k<n;k++)out.push(L[k%L.length===0&&k>0&&L.length>1?1:Math.floor(Math.random()*L.length)]);return out}
function spawnEngines(R0){for(const type of R0.siege||[]){const E=ENGINES[type],side=R0.sides[0],tc=pickTarget(side),sd=wallInfo.side[tc]||side;let[x,y]=spawnPoint(sd,tc);if(R0.ship){x=R0.ship.x+R(-2,2);y=R0.ship.y+R(-1,2)}
  const hp=E.hp*(1+Math.min(1.5,S.t/DAY/60))*Math.max(.5,1+bonus('raidhp'));
  R0.raiders.push({id:nid(),fac:R0.fac,engine:type,kind:'engine',v:'heavy',sz:1.4,side:sd,tc,jit:R(-.9,.9),st:0,x,y,spawn:[x,y],hp,max:hp,dmgM:1,armor:E.armor,spd:.85,cool:R(2,5),inside:false,path:[],face:'r',look:{skin:'#c98a6a',hair:'#2b1d12',hs:1,shirt:'#6b4a2a'}})}}
let siegeShots=[];
function updEngine(r,dt){const R0=S.raid,E=ENGINES[r.engine];
  if(!r.placed){const[hx,hy]=holdPt(r,E.range*.84);if(freeMove(r,hx,hy,r.spd,dt)){r.placed=true;r.cool=Math.max(r.cool,1.5)}return}
  const tx=r.tc%W+.5,ty=Math.floor(r.tc/W)+.5;r.ang=Math.atan2(ty-r.y,tx-r.x);r.face=Math.cos(r.ang)<0?'l':'r';
  if(R0.go||R0.flee||S.wall<0){r.idle=true;return}
  r.cool-=dt;if(r.cool>0)return;
  if(S.breach[r.tc]||!isWallCell(r.tc)){const sc=sideCells(r.side).filter(i=>!S.breach[i]&&wallInfo.exposed[i]);if(!sc.length){r.idle=true;return}let best=sc[0],bd=1e9;for(const i of sc){const d=Math.hypot(i%W+.5-r.x,Math.floor(i/W)+.5-r.y);if(d<bd){bd=d;best=i}}r.tc=best;return}
  r.cool=E.rate*R(.85,1.15);r.fireT=performance.now();const n=E.salvo||1;
  for(let k=0;k<n;k++){const over=Math.random()<.12,[ox,oy]=OUTV[r.side]||[-1,0],ex=tx+R(-.35,.35)-(over?ox*R(2,4):0),ey=ty+R(-.35,.35)-(over?oy*R(2,4):0),d=Math.hypot(ex-r.x,ey-r.y);
    siegeShots.push({x1:r.x,y1:r.y-.3,x2:ex,y2:ey,t:-k*.18,dur:Math.max(.35,d/(E.arc?11:24)),arc:E.arc*Math.min(1,d/12),kind:E.shot,tc:over?-1:r.tc,dmg:R(E.dmg[0],E.dmg[1]),splash:E.splash||0,fire:E.fire||0,fac:r.fac})}
  if(!offlineSim)sfx(E.shot==='plasma'?'charge':E.shot==='bolt'?'arrow':'boom',r.x,r.y)}
function tickSiegeShots(dt){if(!siegeShots.length)return;for(const s of siegeShots){s.t+=dt;if(s.t>=s.dur&&!s.done){s.done=true;siegeImpact(s)}}siegeShots=siegeShots.filter(s=>!s.done)}
function siegeImpact(s){const x=Math.floor(s.x2),y=Math.floor(s.y2);
  if(!offlineSim){if(s.kind==='bolt')dirtFx(s.x2,s.y2,4);else boomFx(s.x2,s.y2);for(let k=0;k<6;k++)fx.push({k:'dust',x:s.x2+R(-.6,.6),y:s.y2+R(-.4,.4),z:.3,vx:R(-.6,.6),vy:R(-.6,.2),vz:0,t:0,life:R(.8,1.6),sz:R(8,13)})}
  const hitCell=i=>{if(!isWallCell(i)||S.breach[i]||S.wall<0)return;const hp=cellHP(i)-s.dmg*(i===s.tc?1:.45);S.whp[i]=hp;wallFx(i,RI(2,4));if(hp<=0)breachCell(i)};
  if(s.tc>=0){hitCell(s.tc);if(s.splash)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])hitCell(s.tc+dx+dy*W)}
  else{for(const c of S.cols)if(!c.downed&&Math.hypot(c.x-s.x2,c.y-s.y2)<1.4)hurtColonist(c,R(8,16));const p=plotAt(x,y);if(p&&p.type){p.dmg=Math.min(1,(p.dmg||0)+.08);plotDirty=true}}
  if(s.fire&&Math.random()<s.fire)ignite(s.x2,s.y2,s.kind==='rocket'?'Rockets set it alight.':'A burning missile hit.')}
function engineDown(r){const R0=S.raid,E=ENGINES[r.engine];r.dead=true;r.path=[];if(!offlineSim){boomFx(r.x,r.y);boomFx(r.x+R(-.5,.5),r.y+R(-.5,.5))}for(const i in E.loot)R0.lootItems[i]=(R0.lootItems[i]||0)+Math.round(E.loot[i]*.5);msg(`The enemy ${E.n.toLowerCase()} is destroyed!`,'good');sfx('victory')}
function salvageEngines(R0){const got={};for(const r of R0.raiders){if(!r.engine||r.dead)continue;const E=ENGINES[r.engine];for(const i in E.loot)got[i]=(got[i]||0)+E.loot[i]}if(Object.keys(got).length){for(const i in got)R0.lootItems[i]=(R0.lootItems[i]||0)+got[i];msg(`The raiders left their siege engines behind. Your colonists salvage ${Object.keys(got).map(i=>got[i]+' '+ITEMS[i].n.toLowerCase()).join(', ')}.`,'good')}}
/* drawing */
function wheel(g,x,y,r){g.beginPath();g.arc(x,y,r,0,7);fs(g,'#5c4228',1.3);g.strokeStyle='#8a6440';g.lineWidth=1;g.beginPath();for(let k=0;k<4;k++){const a=k*Math.PI/4;g.moveTo(x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8);g.lineTo(x-Math.cos(a)*r*.8,y-Math.sin(a)*r*.8)}g.stroke();g.beginPath();g.arc(x,y,r*.28,0,7);fs(g,'#3d2c1a',.8)}
function drawEngine(r,now){const cx=r.x*T,cy=r.y*T,E=ENGINES[r.engine],dir=r.face==='l'?-1:1,ft=r.fireT?(now-r.fireT)/1000:9,s=T*1.5;
  ctx.fillStyle='rgba(0,0,0,.22)';E_(cx+4,cy+s*.42,s*.95,s*.3);
  if(r.dead){ctx.save();ctx.translate(cx,cy);ctx.rotate(.3*dir);rr(ctx,-s*.7,-s*.2,s*1.4,s*.4,4);ctx.fillStyle='#3d3128';ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();for(let k=0;k<3;k++){const t=((now/1600)+k/3+r.id*.1)%1;ctx.fillStyle=`rgba(70,70,70,${.3*(1-t)})`;ctx.beginPath();ctx.arc(cx+Math.sin(t*4+k)*6,cy-t*T*1.8,5+t*12,0,7);ctx.fill()}return}
  ctx.save();ctx.translate(cx,cy);ctx.scale(dir,1);const ang=Math.abs(Math.atan2(Math.sin(r.ang||0),Math.abs(Math.cos(r.ang||0))));
  switch(r.engine){
    case 'catapult':{rr(ctx,-s*.75,-s*.12,s*1.5,s*.34,3);ctx.fillStyle='#8a6440';ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.6;ctx.stroke();ctx.fillStyle='rgba(40,25,10,.35)';for(let x=-s*.6;x<s*.7;x+=s*.3)ctx.fillRect(x,-s*.1,2,s*.3);
      wheel(ctx,-s*.5,s*.24,s*.17);wheel(ctx,s*.5,s*.24,s*.17);
      ctx.strokeStyle=OUT;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-s*.15,-s*.05);ctx.lineTo(0,-s*.5);ctx.lineTo(s*.15,-s*.05);ctx.stroke();ctx.strokeStyle='#7a5834';ctx.lineWidth=3;ctx.stroke();
      const swing=ft<.25?ft/.25:ft<E.rate?Math.max(0,1-(ft-.25)/(E.rate*.7)):0,a=-2.5+swing*2.2;ctx.save();ctx.translate(0,-s*.46);ctx.rotate(a);ctx.strokeStyle=OUT;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-s*.18,0);ctx.lineTo(s*.72,0);ctx.stroke();ctx.strokeStyle='#9a7448';ctx.lineWidth=3.6;ctx.stroke();
      E2(ctx,s*.74,0,s*.12,s*.08);fs(ctx,'#6b4a2a',1.2);if(ft>.4){ctx.beginPath();ctx.arc(s*.74,-s*.04,s*.08,0,7);fs(ctx,'#8a8a82',1)}ctx.restore();
      ctx.strokeStyle='#c9b48a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-s*.15,-s*.05);ctx.lineTo(-s*.5,s*.1);ctx.stroke();break}
    case 'ballista':{ctx.strokeStyle=OUT;ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(-s*.4,s*.32);ctx.lineTo(0,-s*.05);ctx.lineTo(s*.4,s*.32);ctx.moveTo(0,-s*.05);ctx.lineTo(0,s*.34);ctx.stroke();ctx.strokeStyle='#7a5834';ctx.lineWidth=2.6;ctx.stroke();
      ctx.save();ctx.translate(0,-s*.12);ctx.rotate(-ang*.25);rr(ctx,-s*.4,-s*.06,s*.95,s*.12,2);ctx.fillStyle='#8a6440';ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.3;ctx.stroke();
      const pull=ft<.15?0:Math.min(1,(ft-.15)/(E.rate*.6));ctx.strokeStyle=OUT;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(s*.3,-s*.42);ctx.quadraticCurveTo(s*.45,0,s*.3,s*.42);ctx.stroke();ctx.strokeStyle='#6b3f22';ctx.lineWidth=2.4;ctx.stroke();
      ctx.strokeStyle='#ece4cf';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(s*.3,-s*.42);ctx.lineTo(s*.3-pull*s*.5,0);ctx.lineTo(s*.3,s*.42);ctx.stroke();if(pull>.5){ctx.strokeStyle='#5c4228';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s*.3-pull*s*.5,0);ctx.lineTo(s*.62,0);ctx.stroke();ctx.fillStyle='#9aa2a8';ctx.beginPath();ctx.moveTo(s*.62,-3);ctx.lineTo(s*.72,0);ctx.lineTo(s*.62,3);ctx.fill()}ctx.restore();break}
    case 'cannon':case 'mortar':{const mech=r.engine==='mortar';if(mech){for(const x of[-.35,-.12,.12,.35]){ctx.strokeStyle=OUT;ctx.lineWidth=4.4;ctx.beginPath();ctx.moveTo(x*s,0);ctx.lineTo(x*s*1.3,s*.34);ctx.stroke();ctx.strokeStyle='#5a6168';ctx.lineWidth=2.6;ctx.stroke()}mechPlate(ctx,-s*.42,-s*.2,s*.84,s*.34,s*.1);mechEye(ctx,s*.3,-s*.06,s*.06,2,now,r.id)}
      else{rr(ctx,-s*.55,-s*.02,s*.95,s*.22,3);ctx.fillStyle='#6b4a2a';ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.4;ctx.stroke();wheel(ctx,-s*.18,s*.2,s*.22)}
      const rec=ft<.25?(1-ft/.25)*s*.12:0,el=mech?-.9:-.25-ang*.3;ctx.save();ctx.translate(-rec*Math.cos(el),mech?-s*.16:-s*.05);ctx.rotate(el);const L=mech?s*.62:s*.85;const gr=ctx.createLinearGradient(0,-6,0,6);gr.addColorStop(0,mech?'#8a9098':'#5a5f63');gr.addColorStop(1,mech?'#4a5058':'#25282a');rr(ctx,-s*.2,-s*.1,L,s*.2,s*.08);ctx.fillStyle=gr;ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#1a1c1e';ctx.beginPath();ctx.ellipse(L-s*.2,0,s*.04,s*.09,0,0,7);ctx.fill();
      if(ft<.18){ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.moveTo(L-s*.18,0);ctx.lineTo(L,-s*.18);ctx.lineTo(L+s*.3,0);ctx.lineTo(L,s*.18);ctx.closePath();ctx.fill()}ctx.restore();
      if(ft<1.6)for(let k=0;k<4;k++){const t=ft/1.6;ctx.fillStyle=`rgba(200,200,200,${.45*(1-t)})`;ctx.beginPath();ctx.arc(s*.7+k*5,-s*.35-t*s*.8-k*4,4+t*10,0,7);ctx.fill()}break}
    case 'rockets':{rr(ctx,-s*.55,s*.02,s*1.1,s*.18,3);ctx.fillStyle='#5a5f52';ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.3;ctx.stroke();wheel(ctx,-s*.4,s*.24,s*.15);wheel(ctx,s*.4,s*.24,s*.15);
      ctx.save();ctx.translate(0,-s*.08);ctx.rotate(-.5);rr(ctx,-s*.3,-s*.22,s*.7,s*.4,3);ctx.fillStyle='#6b7348';ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.4;ctx.stroke();const left=ft<E.rate*.6?Math.max(0,4-Math.floor(ft/.18)):4;for(let k=0;k<4;k++){const yy=-s*.14+(k%2)*s*.17,xx=s*.32;ctx.beginPath();ctx.arc(xx,yy+(k>1?s*.06:0),s*.06,0,7);ctx.fillStyle=k<left?'#c9a640':'#1a1c1e';ctx.fill()}ctx.restore();
      if(ft<.9){ctx.fillStyle=`rgba(255,180,90,${.6*(1-ft/.9)})`;ctx.beginPath();ctx.arc(-s*.3,-s*.1,8,0,7);ctx.fill()}break}
    case 'plasma':{const bob=Math.sin(now/400+r.id)*2;ctx.strokeStyle=OUT;ctx.lineWidth=4;for(const a of[-.5,0,.5]){ctx.beginPath();ctx.moveTo(0,-s*.05);ctx.lineTo(Math.sin(a)*s*.5,s*.34);ctx.stroke()}ctx.strokeStyle='#4a5058';ctx.lineWidth=2.4;for(const a of[-.5,0,.5]){ctx.beginPath();ctx.moveTo(0,-s*.05);ctx.lineTo(Math.sin(a)*s*.5,s*.34);ctx.stroke()}
      mechPlate(ctx,-s*.3,-s*.32+bob,s*.6,s*.28,s*.12,'#c7cdd2','#7d858c');const ch=Math.min(1,ft/E.rate),glow=.4+.6*ch;ctx.fillStyle=`rgba(150,110,255,${.35*glow})`;ctx.beginPath();ctx.arc(s*.18,-s*.36+bob,s*.22*glow,0,7);ctx.fill();ctx.fillStyle=`rgb(${200+50*ch},${170+60*ch},255)`;ctx.beginPath();ctx.arc(s*.18,-s*.36+bob,s*.08+s*.04*ch,0,7);ctx.fill();
      ctx.strokeStyle='rgba(180,150,255,.8)';ctx.lineWidth=1;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(s*.18,-s*.36+bob,s*(.12+k*.05),now/300+k,now/300+k+1.6);ctx.stroke()}break}
  }
  ctx.restore();
  if(!r.idle&&r.placed&&!r.dead){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(cx-T*.6,cy-T*.95,T*1.2,4);ctx.fillStyle=r.hp/r.max>.5?'#d8b14a':'#d84a3a';ctx.fillRect(cx-T*.6,cy-T*.95,T*1.2*Math.max(0,r.hp/r.max),4)}}
function E_(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill()}
function E2(g,x,y,rx,ry){g.beginPath();g.ellipse(x,y,rx,ry,0,0,7)}
function drawSiegeShots(now){for(const s of siegeShots){if(s.t<0)continue;const k=clamp(s.t/s.dur,0,1),gx=s.x1+(s.x2-s.x1)*k,gy=s.y1+(s.y2-s.y1)*k,h=Math.sin(k*Math.PI)*s.arc,x=gx*T,y=(gy-h)*T,a=Math.atan2((s.y2-s.y1)-Math.cos(k*Math.PI)*s.arc*Math.PI,(s.x2-s.x1));
  if(s.arc){ctx.fillStyle=`rgba(0,0,0,${.25-.12*Math.sin(k*Math.PI)})`;ctx.beginPath();ctx.ellipse(gx*T,gy*T+4,6,3,0,0,7);ctx.fill()}
  ctx.save();ctx.translate(x,y);ctx.rotate(a);
  if(s.kind==='rock'){ctx.beginPath();ctx.arc(0,0,5.5,0,7);fs(ctx,s.fire?'#c8621c':'#8a8a82',1.3);if(s.fire){ctx.fillStyle='rgba(255,180,60,.6)';ctx.beginPath();ctx.arc(-5,0,5,0,7);ctx.fill()}}
  else if(s.kind==='bolt'){ctx.strokeStyle=OUT;ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(8,0);ctx.stroke();ctx.strokeStyle='#7a5834';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#9aa2a8';ctx.beginPath();ctx.moveTo(8,-3);ctx.lineTo(13,0);ctx.lineTo(8,3);ctx.fill()}
  else if(s.kind==='ball'||s.kind==='shell'){ctx.beginPath();ctx.arc(0,0,4.5,0,7);fs(ctx,s.kind==='shell'?'#3a4046':'#1e2022',1.2);ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(-1.5,-1.5,1.3,0,7);ctx.fill();ctx.fillStyle='rgba(160,160,160,.25)';ctx.beginPath();ctx.arc(-9,0,4,0,7);ctx.fill()}
  else if(s.kind==='rocket'){rr(ctx,-6,-2,11,4,2);fs(ctx,'#c9ccd0',1);ctx.fillStyle='#ffb347';ctx.beginPath();ctx.moveTo(-6,-2);ctx.lineTo(-13-Math.random()*4,0);ctx.lineTo(-6,2);ctx.fill()}
  else if(s.kind==='plasma'){ctx.fillStyle='rgba(160,120,255,.35)';ctx.beginPath();ctx.ellipse(-4,0,12,6,0,0,7);ctx.fill();ctx.fillStyle='#e8dcff';ctx.beginPath();ctx.arc(0,0,4,0,7);ctx.fill()}
  ctx.restore()}}
