/* ================= drawing: sprites ================= */
function E(g,x,y,rx,ry,rot){g.beginPath();g.ellipse(x,y,Math.abs(rx),Math.abs(ry),rot||0,0,Math.PI*2)}
function fs(g,fill,lw){g.fillStyle=fill;g.fill();if(lw){g.lineWidth=lw;g.strokeStyle=OUT;g.stroke()}}
function blobs(g,list,fill,lw){g.strokeStyle=OUT;g.lineWidth=lw*2;for(const[x,y,r]of list){g.beginPath();g.arc(x,y,r,0,7);g.stroke()}g.fillStyle=fill;for(const[x,y,r]of list){g.beginPath();g.arc(x,y,r,0,7);g.fill()}}
function rr(g,x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r)}
let SUN={dx:0,dy:0,a:0};
function sunAt(hr){if(hr<5.5||hr>18.5)return{dx:0,dy:0,a:0};const ph=clamp((hr-6)/12,0,1),f=1-2*ph,lowk=Math.abs(f),a=.34*clamp(Math.min(hr-5.5,18.5-hr)/1.2,0,1);return{dx:-f*T*(.3+.9*lowk),dy:-T*(.18+.12*lowk),a}}
/* soft contact shadow under the feet, plus a faint cast shadow in the sun's direction */
function pawnShadow(g,cx,fy,s){const live=g===ctx;const gr=g.createRadialGradient(cx,fy,0,cx,fy,s*.22);gr.addColorStop(0,`rgba(0,0,0,${live?.32:.24})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.ellipse(cx,fy,s*.24,s*.085,0,0,7);g.fill();
  if(live&&SUN.a>0&&!g.getTransform().b){const L=Math.min(s*.7,Math.hypot(SUN.dx,SUN.dy)*.5*(s/T)),a=Math.atan2(SUN.dy,SUN.dx);if(L<s*.05)return;const ox=cx+Math.cos(a)*L*.55,oy=fy-s*.03+Math.sin(a)*L*.55;
    g.fillStyle=`rgba(0,0,0,${SUN.a*.17})`;for(const k of[1,.72]){g.beginPath();g.ellipse(ox,oy,L*.5+s*.19*k,s*.15*k,a,0,7);g.fill()}}}
function drawPawn(g,p,cx,cy,s,face,bob){
  p=lookOf(p,p&&p._noHat);const lw=Math.max(1.1,s*.055),so=g===ctx?s/T:0;
  pawnShadow(g,cx,cy+s*.29,s);
  const by=cy+s*.04-(bob||0);
  if(p.pack){rr(g,cx-s*.3,by-s*.2,s*.6,s*.42,s*.1);fs(g,'#6b5034',lw)}
  const det=s>=18,sw=(bob||0)*.9;
  if(det){const fy=cy+s*.27;for(const sd of[-1,1]){E(g,cx+sd*s*.1,fy-(sd>0?sw:-sw)*.5,s*.075,s*.055);fs(g,'#3a2a1c',lw*.8)}}
  E(g,cx,by+s*.07,s*.26,s*.24);fs(g,p.shirt,lw);
  drawOutfit(g,p,cx,by,s,face,lw);
  if(det){g.save();E(g,cx,by+s*.07,s*.26,s*.24);g.clip();const hl=g.createRadialGradient(cx-s*.1,by-s*.06,0,cx-s*.1,by-s*.06,s*.28);hl.addColorStop(0,'rgba(255,255,255,.16)');hl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=hl;g.fillRect(cx-s*.3,by-s*.2,s*.6,s*.5);g.restore();
    if(!p._noHands){for(const sd of[-1,1]){if((face==='l'&&sd>0)||(face==='r'&&sd<0))continue;g.beginPath();g.arc(cx+sd*s*.245,by+s*.13+(sd>0?sw:-sw)*.4,s*.062,0,7);fs(g,p.skin,lw*.8)}}}
  g.fillStyle='rgba(0,0,0,.12)';E(g,cx+s*.06,by+s*.13,s*.16,s*.13);g.fill();
  const hx=cx+(face==='l'?-s*.035:face==='r'?s*.035:0),hy=by-s*.22,r=s*.205;
  if(p.hat==='hood')drawHatBack(g,p,hx,hy,r,lw);
  if(p.hs===1&&face!=='u'){E(g,hx,hy+r*.3,r*1.12,r*1.08);fs(g,p.hair,lw)}
  g.beginPath();g.arc(hx,hy,r,0,7);fs(g,p.skin,lw);
  if(det&&face!=='u'){g.fillStyle='#2a1d14';const ey=hy+r*.12;if(face==='d'){for(const sd of[-1,1]){g.beginPath();g.arc(hx+sd*r*.36,ey,Math.max(.9,r*.11),0,7);g.fill()}g.fillStyle='rgba(230,120,100,.25)';for(const sd of[-1,1]){g.beginPath();g.arc(hx+sd*r*.58,ey+r*.3,r*.14,0,7);g.fill()}}
    else{const sd=face==='l'?-1:1;g.beginPath();g.arc(hx+sd*r*.52,ey,Math.max(.9,r*.11),0,7);g.fill();g.beginPath();g.arc(hx+sd*r*.08,ey,Math.max(.8,r*.09),0,7);g.fill()}}
  if(p.hs!==3){
    if(face==='u'){g.beginPath();g.arc(hx,hy,r*1.03,0,7);fs(g,p.hair,lw)}
    else{const off=face==='l'?r*.18:face==='r'?-r*.18:0;g.beginPath();g.ellipse(hx+off,hy-r*.25,r*1.04,r*.78,0,Math.PI,0);g.closePath();fs(g,p.hair,lw)}
    if(p.hs===2){g.beginPath();g.arc(hx,hy-r*1.05,r*.36,0,7);fs(g,p.hair,lw)}
  }
  if(p.hat&&p.hat!=='none')drawHat(g,p,hx,hy,r,face,lw);
}
function drawSleeper(g,p,bx,by){
  const s=T,lw=1.6;
  g.beginPath();g.arc(bx+s*.5,by+s*.42,s*.19,0,7);fs(g,p.skin,lw);
  if(p.hs!==3){g.beginPath();g.ellipse(bx+s*.5,by+s*.34,s*.2,s*.13,0,Math.PI,0);g.closePath();fs(g,p.hair,lw)}
  rr(g,bx+s*.12,by+s*.66,s*.76,s*1.1,7);fs(g,p.shirt,lw);
  g.fillStyle='rgba(255,255,255,.15)';g.fillRect(bx+s*.16,by+s*.7,s*.68,3);
}
function drawAnimal(g,a,cx,cy,s,bags){
  const d=ANIMALS[a.type],baby=a.age<d.adult,sc=s*(baby?.6:1),lw=Math.max(1,sc*.045);
  g.save();g.translate(cx,cy+s*.3);g.scale(a.face==='l'?-1:1,1);
  g.fillStyle='rgba(0,0,0,.22)';
  if(a.type==='chicken'){
    const k=sc*.55;E(g,0,0,k*.32,k*.1);g.fill();
    g.strokeStyle='#c98a2a';g.lineWidth=lw;g.beginPath();g.moveTo(-k*.05,-k*.14);g.lineTo(-k*.08,0);g.moveTo(k*.08,-k*.14);g.lineTo(k*.1,0);g.stroke();
    g.beginPath();g.moveTo(-k*.25,-k*.35);g.lineTo(-k*.45,-k*.55);g.lineTo(-k*.38,-k*.28);g.closePath();fs(g,'#e7e1d3',lw);
    E(g,0,-k*.3,k*.3,k*.22);fs(g,'#f2eee4',lw);
    g.beginPath();g.arc(k*.24,-k*.55,k*.13,0,7);fs(g,'#f2eee4',lw);
    E(g,k*.22,-k*.7,k*.08,k*.05);fs(g,'#c8382a',lw*.8);
    g.beginPath();g.moveTo(k*.35,-k*.57);g.lineTo(k*.46,-k*.53);g.lineTo(k*.35,-k*.49);g.closePath();fs(g,'#e0a030',lw*.8);
  }else if(a.type==='goat'){
    const k=sc*.9;E(g,0,0,k*.34,k*.09);g.fill();
    g.strokeStyle=OUT;g.lineWidth=lw*2.2;g.lineCap='round';g.beginPath();for(const x of[-.22,-.12,.14,.24]){g.moveTo(k*x,-k*.3);g.lineTo(k*x,0)}g.stroke();
    g.beginPath();g.moveTo(-k*.32,-k*.42);g.lineTo(-k*.44,-k*.55);g.lineTo(-k*.34,-k*.36);g.closePath();fs(g,'#d8d2c4',lw);
    E(g,0,-k*.38,k*.34,k*.17);fs(g,'#ddd6c8',lw);
    g.strokeStyle='#8a7a62';g.lineWidth=lw*2;g.beginPath();g.moveTo(k*.33,-k*.6);g.quadraticCurveTo(k*.22,-k*.78,k*.12,-k*.68);g.stroke();
    E(g,k*.38,-k*.52,k*.13,k*.1,.4);fs(g,'#ddd6c8',lw);
    g.beginPath();g.moveTo(k*.43,-k*.44);g.lineTo(k*.46,-k*.33);g.lineTo(k*.4,-k*.42);g.closePath();fs(g,'#b8ab95',lw*.7);
  }else{
    const k=sc*1.25;E(g,0,0,k*.46,k*.11);g.fill();
    g.fillStyle='#3a2416';for(const x of[-.3,-.15,.12,.27])g.fillRect(k*x-k*.03,-k*.14,k*.06,k*.14);
    blobs(g,[[0,-k*.42,k*.36],[-k*.2,-k*.4,k*.3],[k*.15,-k*.5,k*.3]],'#9c5b33',lw);
    g.beginPath();g.moveTo(-k*.48,-k*.36);for(let i=0;i<=10;i++)g.lineTo(-k*.48+i*k*.095,-k*(i%2?.12:.2));g.lineTo(k*.45,-k*.4);g.closePath();fs(g,'#7a4224',lw);
    g.strokeStyle='rgba(60,30,15,.6)';g.lineWidth=lw;g.beginPath();for(let i=0;i<6;i++){g.moveTo(-k*.3+i*k*.12,-k*.6);g.lineTo(-k*.33+i*k*.12,-k*.38)}g.stroke();
    if(bags){rr(g,-k*.32,-k*.62,k*.28,k*.32,4);fs(g,'#c9a46a',lw);rr(g,k*.0,-k*.66,k*.28,k*.32,4);fs(g,'#8a6a44',lw);g.strokeStyle='#5a3a20';g.lineWidth=lw*1.4;g.beginPath();g.moveTo(-k*.3,-k*.7);g.lineTo(k*.3,-k*.72);g.stroke()}
    E(g,k*.5,-k*.36,k*.17,k*.15);fs(g,'#6e3a1f',lw);
    E(g,k*.6,-k*.3,k*.08,k*.07);fs(g,'#c99a6c',lw*.8);
    g.strokeStyle=OUT;g.lineWidth=lw*3;g.lineCap='round';g.beginPath();g.moveTo(k*.44,-k*.47);g.lineTo(k*.42,-k*.62);g.moveTo(k*.54,-k*.48);g.lineTo(k*.55,-k*.63);g.stroke();
    g.strokeStyle='#ece2c6';g.lineWidth=lw*1.6;g.stroke();
  }
  g.restore();
}
function outward(s){return OUTV[s]}
/* water moat: a one-tile band of water outside every wall side that has the upgrade, bridged at the gates */
let moatCache=null,moatKey='';
function moatTiles(){const key=geoVer+'|'+JSON.stringify(S.wup||{})+'|'+S.gates.length;if(moatKey===key)return moatCache;moatKey=key;const set=new Map(),gateN=new Set();
  for(const i of wallInfo.cells){const sd=wallInfo.side[i];if(!wup(sd,'moat'))continue;const x=i%W,y=(i-x)/W;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const k=nx+ny*W;if(kind[k]!==0)continue;set.set(k,1);if(kind[i]===4&&(dx===0||dy===0))gateN.add(k)}}
  return moatCache={tiles:[...set.keys()],set,gateN}}
function drawMoat(g,now){if(S.wall<0||!S.wup)return;const M=moatTiles();if(!M.tiles.length)return;const has=k=>M.set.has(k);
  g.save();for(const k of M.tiles){const x=k%W,y=(k-x)/W,px=x*T,py=y*T;g.fillStyle='#355f73';g.fillRect(px,py,T,T)}
  for(const k of M.tiles){const x=k%W,y=(k-x)/W,px=x*T,py=y*T;g.fillStyle='rgba(120,180,200,.08)';g.fillRect(px+T*.15,py+T*.15,T*.7,T*.7);
    g.strokeStyle='#5c4a32';g.lineWidth=3;g.beginPath();if(!has(k-W)&&kind[k-W]===0){g.moveTo(px,py+1);g.lineTo(px+T,py+1)}if(!has(k+W)&&kind[k+W]===0){g.moveTo(px,py+T-1);g.lineTo(px+T,py+T-1)}if(!has(k-1)&&kind[k-1]===0){g.moveTo(px+1,py);g.lineTo(px+1,py+T)}if(!has(k+1)&&kind[k+1]===0){g.moveTo(px+T-1,py);g.lineTo(px+T-1,py+T)}g.stroke();
    g.strokeStyle='rgba(30,22,14,.5)';g.lineWidth=1;g.stroke();
    const ph=now/900+x*1.7+y*2.3;g.strokeStyle='rgba(210,235,245,.28)';g.lineWidth=1.2;g.lineCap='round';for(let m=0;m<2;m++){const fx=px+T*(.2+((Math.sin(ph+m*2.1)+1)/2)*.6),fy=py+T*(.3+m*.4);g.beginPath();g.moveTo(fx-4,fy);g.quadraticCurveTo(fx,fy-2,fx+4,fy);g.stroke()}
    if(Math.sin(now/400+x*3.1+y*5.7)>.93){g.fillStyle='rgba(255,255,255,.6)';g.fillRect(px+T*.5,py+T*.45,2,1.2)}}
  for(const k of M.gateN){const x=k%W,y=(k-x)/W,px=x*T,py=y*T,vert=kind[k-1]===4||kind[k+1]===4;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(px+2,py+3,T,T);for(let m=0;m<5;m++){g.fillStyle=m%2?'#8a6640':'#7a5834';if(!vert)g.fillRect(px,py+m*T/5,T,T/5+.5);else g.fillRect(px+m*T/5,py,T/5+.5,T)}g.strokeStyle=OUT;g.lineWidth=1.4;g.strokeRect(px+.5,py+.5,T-1,T-1)}
  g.restore()}
function drawDefense(g,now){drawMoat(g,now);
  for(const k in S.whp){const i=+k;if(!isWallCell(i)||S.breach[i])continue;const f=S.whp[i]/cellMax(i);if(f>=.999)continue;
    const x=i%W,y=(i-x)/W,r=mulberry(i*31+7),n=Math.ceil((1-f)*6);
    g.strokeStyle='rgba(20,14,8,.85)';g.lineWidth=1.8;g.lineCap='round';
    for(let m=0;m<n;m++){const cx=(x+.15+r()*.7)*T,cy=(y+.15+r()*.7)*T;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+(r()-.5)*14,cy+(r()-.5)*14);g.lineTo(cx+(r()-.5)*20,cy+(r()-.5)*20);g.stroke()}
    rr(g,x*T+3,y*T-6,T-6,5,2);g.fillStyle='rgba(0,0,0,.65)';g.fill();g.fillStyle=f>.5?'#c9a640':'#d86a52';g.fillRect(x*T+4,y*T-5,(T-8)*clamp(f,0,1),3)}
  if(S.wall>=0&&S.wup){for(const i of wallInfo.cells){const sd=wallInfo.side[i],u=S.wup[sd];if(!u)continue;const x=i%W,y=(i-x)/W,[ox,oy]=OUTV[sd],cx=(x+.5)*T,cy=(y+.5)*T;
      if(u.batt&&kind[i]===1&&(x+y)%2===0){g.fillStyle=S.wall>=2?'#9a958c':'#8f6e46';g.strokeStyle=OUT;g.lineWidth=1.3;g.beginPath();g.rect(cx+ox*T*.32-6,cy+oy*T*.32-6,12,12);g.fill();g.stroke()}
      if(u.pitch&&kind[i]===1&&(x+y)%3===0){g.fillStyle='rgba(20,16,12,.35)';E(g,cx+ox*T*.85,cy+oy*T*.85,9,6);g.fill()}
      if(u.tower&&kind[i]===1&&!wallInfo.straight[i])drawCornerTower(g,cx,cy,S.wall>=2,i)}}
  for(const gt of S.gates){if(!gt.house)continue;const c=gateCells(gt);for(const i of[c[0],c[2]]){const x=i%W,y=(i-x)/W,cx=(x+.5)*T,cy=(y+.5)*T;g.beginPath();g.rect(cx-T*.48,cy-T*.48,T*.96,T*.96);fs(g,S.wall>=2?'#8a857c':'#7b5b39',2.2);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(cx-T*.3,cy-T*.3,T*.6,T*.6)}}
  for(const sl of wallSlots()){
    const d=S.def[sl.id],cx=(sl.x+.5)*T,cy=(sl.y+.5)*T,[ox,oy]=outward(sl.side);
    if(!d){if((defMode||(sel&&(sel.k==='wall'||sel.k==='slot')))&&!gateMode){g.beginPath();g.arc(cx,cy,10,0,7);g.fillStyle='rgba(20,22,24,.55)';g.fill();g.strokeStyle='rgba(243,231,160,.85)';g.lineWidth=1.6;g.setLineDash([3,3]);g.stroke();g.setLineDash([]);g.fillStyle='#f3e7a0';g.font='700 14px Arimo, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('+',cx,cy+1)}continue}
    if(d.type==='post')drawGuardPost(g,cx,cy,ox,oy);
    else if(d.type==='tower')drawWoodTower(g,cx,cy,ox,oy,now);
    else if(d.type==='stonetower')drawStoneTower(g,cx,cy,ox,oy,sl.x*31+sl.y);
    else{const a=d.ax!==undefined&&raidActive()?Math.atan2(d.ay-sl.y-.5,d.ax-sl.x-.5):Math.atan2(oy,ox);drawTurretArt(g,cx,cy,a,raidActive()&&(d.burst||0)>0,now)}
  }
}
function drawPlotDamage(g){
  for(const p of S.plots){if(!p.type||!(p.dmg>0))continue;const[ox,oy]=plotOrigin(p),r=mulberry(p.id*17+3),n=Math.ceil(p.dmg*10);
    for(let k=0;k<n;k++){const x=(ox+r()*P)*T,y=(oy+r()*P)*T;g.fillStyle='rgba(25,18,12,.45)';E(g,x,y,8+r()*10,5+r()*6,r()*3);g.fill();g.beginPath();g.arc(x+4,y-2,2.5,0,7);fs(g,'#7d786f',1)}}
}
function slash(cx,cy,a,k){ctx.save();ctx.globalAlpha=1-k;ctx.strokeStyle='#f6f2e6';ctx.lineWidth=3*(1-k)+1;ctx.lineCap='round';ctx.beginPath();ctx.arc(cx+Math.cos(a)*10,cy+Math.sin(a)*10-4,16,a-1.1+k*.6,a+1.1*k);ctx.stroke();ctx.restore()}
/* mechanoids: brushed steel plates, dark joints, glowing red optics */
function mechPlate(g,x,y,w,h,r0,c1,c2){const gr=g.createLinearGradient(x,y,x,y+h);gr.addColorStop(0,c1||'#b4bcc4');gr.addColorStop(1,c2||'#6a727a');rr(g,x,y,w,h,r0);g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.4;g.stroke()}
function mechEye(g,x,y,w,h,now,id){const p=.7+.3*Math.sin(now/180+id);g.fillStyle=`rgba(255,70,40,${.25*p})`;g.beginPath();g.ellipse(x,y,w*2.2,h*2.6,0,0,7);g.fill();g.fillStyle=`rgb(255,${Math.round(90+60*p)},60)`;g.fillRect(x-w/2,y-h/2,w,h)}
function drawMech(g,r,cx,cy,now){const s=T*(r.sz||1),dir=r.face==='l'?-1:1,id=r.id||0;
  if(r.dead){g.save();g.translate(cx,cy+s*.15);g.fillStyle='rgba(0,0,0,.25)';E(g,0,s*.18,s*.42,s*.12);g.fill();g.rotate(.5*dir);mechPlate(g,-s*.28,-s*.1,s*.56,s*.24,4,'#6a6f74','#3a3e42');g.restore();g.fillStyle='#2a2a2a';for(const[a,b]of[[-.3,.2],[.25,.1],[.05,.3]]){rr(g,cx+a*s,cy+b*s,s*.12,s*.06,2);g.fill()}
    if(S.raid&&Math.sin(now/300+id)>0){g.fillStyle='rgba(70,70,70,.25)';g.beginPath();g.arc(cx+Math.sin(now/700+id)*3,cy-s*.2-(now/40+id*13)%20,4+((now/40+id*13)%20)*.25,0,7);g.fill()}return}
  const mv=!r.bash&&!(r.cool>0&&r.kind==='archer'),ph=now/(r.mech==='scyther'?90:160)+id,bob=mv?Math.abs(Math.sin(ph))*1.6:0;let wx=r.bash?Math.sin(now/55+id)*2:0;
  if(r.hitAt&&now-r.hitAt<140)wx+=Math.sin((now-r.hitAt)/14)*2.5;
  g.fillStyle='rgba(0,0,0,.22)';E(g,cx,cy+s*.32,s*(r.mech==='centipede'?.62:.3),s*.09);g.fill();
  const x=cx+wx,y=cy-bob;g.save();g.translate(x,y);g.scale(dir,1);
  const leg=(x0,y0,x1,y1,x2,y2,w)=>{g.strokeStyle=OUT;g.lineWidth=w+2.4;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.strokeStyle='#4a5058';g.lineWidth=w;g.stroke()};
  const sw=mv?Math.sin(ph)*s*.08:0;
  switch(r.mech){
    case 'scyther':{leg(-s*.06,s*.02,-s*.12+sw,s*.18,-s*.08+sw,s*.32,2.4);leg(s*.06,s*.02,s*.12-sw,s*.18,s*.08-sw,s*.32,2.4);
      mechPlate(g,-s*.13,-s*.2,s*.26,s*.26,s*.08);g.fillStyle='#3e444a';g.fillRect(-s*.13,-s*.04,s*.26,s*.03);
      mechPlate(g,-s*.07,-s*.36,s*.18,s*.14,s*.05);mechEye(g,s*.05,-s*.29,s*.08,2,now,id);
      const at=r.atkT&&now-r.atkT<260?Math.sin((now-r.atkT)/260*Math.PI):0;
      for(const sd of[-1,1]){g.save();g.translate(s*.04*sd,-s*.12);g.rotate((sd<0?-.9:-.4)-at*1.4+Math.sin(ph)*.1);g.strokeStyle=OUT;g.lineWidth=3.4;g.beginPath();g.moveTo(0,0);g.lineTo(s*.16,0);g.stroke();g.strokeStyle='#5a6068';g.lineWidth=2;g.stroke();
        g.beginPath();g.moveTo(s*.14,-2);g.quadraticCurveTo(s*.42,-s*.08,s*.5,s*.02);g.quadraticCurveTo(s*.36,-s*.01,s*.14,3);g.closePath();g.fillStyle='#e6ecf0';g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();g.restore()}break}
    case 'lancer':{leg(-s*.07,s*.04,-s*.1+sw,s*.18,-s*.08+sw,s*.32,2.6);leg(s*.07,s*.04,s*.1-sw,s*.18,s*.08-sw,s*.32,2.6);
      mechPlate(g,-s*.17,-s*.22,s*.34,s*.3,s*.07);mechPlate(g,-s*.22,-s*.22,s*.12,s*.1,3,'#9aa2aa','#5a626a');mechPlate(g,s*.1,-s*.22,s*.12,s*.1,3,'#9aa2aa','#5a626a');
      g.fillStyle='#3e444a';g.fillRect(-s*.1,-s*.06,s*.2,s*.04);mechPlate(g,-s*.09,-s*.4,s*.18,s*.17,s*.06);mechEye(g,s*.03,-s*.32,s*.12,2.2,now,id);
      g.strokeStyle=OUT;g.lineWidth=5;g.beginPath();g.moveTo(-s*.02,-s*.1);g.lineTo(s*.52,-s*.16);g.stroke();g.strokeStyle='#6a727a';g.lineWidth=3;g.stroke();g.fillStyle=r.cool>0&&r.cool<.25?'#7ff0ff':'#3ac8e8';g.beginPath();g.arc(s*.52,-s*.16,2.2,0,7);g.fill();break}
    case 'pikeman':{for(const[a,b]of[[-.2,-.1],[-.08,.08],[.08,-.08],[.2,.1]]){const k=mv?Math.sin(ph+a*9)*s*.04:0;leg(a*s*.6,0,a*s*1.5+k,s*.06,a*s*1.3+k,s*.3,2.2)}
      mechPlate(g,-s*.2,-s*.18,s*.4,s*.22,s*.1);mechPlate(g,-s*.06,-s*.3,s*.16,s*.13,s*.05);mechEye(g,s*.05,-s*.24,s*.07,2,now,id);
      g.strokeStyle=OUT;g.lineWidth=4.5;g.beginPath();g.moveTo(-s*.1,-s*.14);g.lineTo(s*.62,-s*.26);g.stroke();g.strokeStyle='#8a9098';g.lineWidth=2.4;g.stroke();g.fillStyle='#4a5058';g.fillRect(s*.1,-s*.24,s*.14,s*.07);break}
    case 'centipede':{const n=4;for(let k=n-1;k>=0;k--){const sx=-s*.42+k*s*.26,sy=Math.sin(ph-k*.9)*(mv?1.5:0);for(const sd of[-1,1]){g.strokeStyle='#3e444a';g.lineWidth=2;g.beginPath();g.moveTo(sx,sy+s*.08);g.lineTo(sx+Math.sin(ph+k+sd)*2,sy+s*.24);g.stroke()}
        mechPlate(g,sx-s*.15,sy-s*.16,s*.3,s*.28,s*.1,k===n-1?'#c0c6cc':'#a8b0b8','#5a626a');g.fillStyle='rgba(30,34,38,.55)';g.fillRect(sx-s*.12,sy-s*.02,s*.24,s*.025)}
      const hx=-s*.42+(n-1)*s*.26;mechEye(g,hx+s*.1,-s*.06,s*.06,2,now,id);mechEye(g,hx+s*.1,s*.02,s*.06,2,now,id+1);
      g.save();g.translate(hx-s*.02,-s*.2);mechPlate(g,-s*.1,-s*.08,s*.2,s*.12,3,'#7a8288','#4a5258');g.strokeStyle=OUT;g.lineWidth=5;g.beginPath();g.moveTo(s*.05,-s*.03);g.lineTo(s*.36,-s*.05);g.stroke();g.strokeStyle='#5a626a';g.lineWidth=3;g.stroke();
      if(r.cool>0&&r.cool<.06){g.fillStyle='#ffe08a';g.beginPath();g.arc(s*.38,-s*.05,3.5,0,7);g.fill()}g.restore();break}
    case 'termite':{for(const a of[-.22,-.08,.08,.22]){const k=mv?Math.sin(ph+a*12)*s*.03:0;leg(a*s,s*.04,a*s*1.3+k,s*.16,a*s*1.2+k,s*.3,3)}
      mechPlate(g,-s*.3,-s*.2,s*.6,s*.32,s*.12,'#b8a888','#6a5c48');g.fillStyle='rgba(40,30,20,.35)';for(let k=0;k<3;k++)g.fillRect(-s*.22+k*s*.16,-s*.14,s*.08,s*.22);
      mechEye(g,s*.22,-s*.08,s*.06,2.2,now,id);g.strokeStyle=OUT;g.lineWidth=7;g.beginPath();g.moveTo(s*.1,-s*.16);g.lineTo(s*.42,-s*.22);g.stroke();g.strokeStyle='#6a5c48';g.lineWidth=4.5;g.stroke();
      g.beginPath();g.arc(s*.44,-s*.22,4,0,7);g.fillStyle='#2a2420';g.fill();break}
  }
  g.restore()}
function drawRaider(r,now){if(r.engine){drawEngine(r,now);return}
  const cx=r.x*T,cy=r.y*T-T*.12;
  if(r.boss&&!r.dead){const bw=T*1.6,bx=cx-bw/2,byy=cy-T*(r.sz||1)*.9;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(bx-1,byy-1,bw+2,6);ctx.fillStyle='#d84a3a';ctx.fillRect(bx,byy,bw*Math.max(0,r.hp/r.max),4)}
  if(r.mech){drawMech(ctx,r,cx,cy,now);return}
  if(r.bug){drawBug(r,cx,cy,now);return}
  if(r.dead){ctx.save();ctx.globalAlpha=.75;ctx.translate(cx,cy+T*.2);ctx.rotate(Math.PI/2);drawPawn(ctx,r.look,0,0,T*.85,'d',0);ctx.restore();return}
  const moving=!r.bash&&!(r.cool>0&&r.kind==='archer'),bob=moving?Math.abs(Math.sin(now/100+r.id))*2:0,fac=r.fac||'tribal';let wx=r.bash?Math.sin(now/60+r.id)*2.2:0;
  if(r.atkT&&now-r.atkT<260){const k=(now-r.atkT)/260,l=Math.sin(k*Math.PI)*7;wx+=Math.cos(r.atkA)*l;slash(cx,cy,r.atkA,k)}
  if(r.hitAt&&now-r.hitAt<140)wx+=Math.sin((now-r.hitAt)/14)*2.5;
  const SZ=T*.88*(r.sz||1);drawPawn(ctx,r.look,cx+wx,cy,SZ,r.face,bob);
  if(r.v==='heavy'){for(const sd of[-1,1]){E(ctx,cx+wx+sd*SZ*.24,cy+SZ*.04-bob-SZ*.02,SZ*.1,SZ*.08);fs(ctx,fac==='tribal'?'#6b3a2a':'#4f535a',1.3)}if(fac==='tribal'){ctx.strokeStyle='rgba(200,40,30,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx+wx-SZ*.12,cy-SZ*.02);ctx.lineTo(cx+wx+SZ*.12,cy+SZ*.1);ctx.stroke()}}
  if(r.v==='light'&&fac!=='space'){ctx.fillStyle='rgba(60,70,50,.9)';E(ctx,cx+wx,cy+SZ*.04-bob-SZ*.06,SZ*.2,SZ*.06);ctx.fill()}
  const by=cy+SZ*.04-bob,hy=by-SZ*.22,hx=cx+wx+(r.face==='l'?-T*.03:r.face==='r'?T*.03:0);
  if(fac==='space'){E(ctx,cx+wx,by+T*.06,T*.24,T*.2);ctx.fillStyle='rgba(50,54,62,.95)';ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.3;ctx.stroke();for(const sd of[-1,1]){E(ctx,cx+wx+sd*T*.2,by-T*.02,T*.08,T*.06);fs(ctx,'#4a4f58',1.2)}
    ctx.beginPath();ctx.arc(hx,hy,T*.2,0,7);fs(ctx,'#2a2e34',1.6);if(r.face!=='u'){rr(ctx,hx-T*.13+(r.face==='l'?-2:r.face==='r'?2:0),hy-T*.05,T*.26,T*.08,3);ctx.fillStyle='#5fe0f0';ctx.fill()}}
  else if(fac==='industrial'){ctx.beginPath();ctx.ellipse(hx,hy-T*.04,T*.2,T*.15,0,Math.PI,0);ctx.closePath();fs(ctx,'#5f6450',1.4);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(hx-T*.2,hy-T*.05,T*.4,2.5)}
  else{ctx.strokeStyle='#b8322a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(hx,hy,T*.17,Math.PI*1.05,Math.PI*1.95);ctx.stroke();ctx.strokeStyle=OUT;ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(hx+T*.1,hy-T*.12);ctx.lineTo(hx+T*.18,hy-T*.38);ctx.stroke();ctx.strokeStyle='#e8dcc0';ctx.lineWidth=2;ctx.stroke()}
  ctx.save();ctx.translate(cx+wx+(r.face==='l'?-T*.26:T*.26),cy+T*.06);ctx.scale(r.face==='l'?-1:1,1);
  if(r.kind==='archer'){
    if(fac==='tribal'){ctx.scale(-1,1);drawItem(ctx,'bow',0,0,T*.45)}
    else if(fac==='industrial')drawItem(ctx,'rifle',0,0,T*.55);
    else{ctx.rotate(-.35);rr(ctx,-T*.3,-3,T*.6,7,2);fs(ctx,'#2a2e34',1.4);ctx.fillStyle='#5fe0f0';ctx.fillRect(-T*.05,-1.5,T*.25,2.5)}}
  else if(fac==='space'){ctx.strokeStyle=OUT;ctx.lineWidth=4.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-3,6);ctx.lineTo(8,-13);ctx.stroke();ctx.strokeStyle='#cfe6ee';ctx.lineWidth=2.5;ctx.stroke()}
  else if(fac==='industrial'){ctx.strokeStyle=OUT;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-3,6);ctx.lineTo(5,-6);ctx.stroke();ctx.strokeStyle='#6f7478';ctx.lineWidth=3;ctx.stroke()}
  else{ctx.strokeStyle=OUT;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-4,6);ctx.lineTo(6,-10);ctx.stroke();ctx.strokeStyle='#6e4a2a';ctx.lineWidth=3;ctx.stroke()}
  ctx.restore();
  if(r.loot)drawItem(ctx,r.loot.i,cx,cy-T*.55,T*.38);
  if(r.hp<r.max){rr(ctx,cx-10,cy-T*.62,20,4,2);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fill();ctx.fillStyle='#d86a52';ctx.fillRect(cx-9.5,cy-T*.62+.5,19*clamp(r.hp/r.max,0,1),3)}
}
function drawWild(g,a,cx,cy){
  const w=WILD[a.type],s=T,lw=1.3;
  g.save();g.translate(cx,cy);
  if(a.dead){g.rotate(Math.PI/2*(a.face==='l'?-1:1));g.globalAlpha=.9}
  g.scale(a.face==='l'?-1:1,1);
  g.fillStyle='rgba(0,0,0,.2)';if(!a.dead){E(g,0,0,s*.36*w.size+4,s*.09);g.fill()}
  if(a.type==='hare'){
    E(g,0,-s*.14,s*.18,s*.12);fs(g,'#9a8468',lw);E(g,-s*.17,-s*.16,s*.05,s*.05);fs(g,'#f2eee4',1);
    E(g,s*.16,-s*.22,s*.08,s*.07);fs(g,'#9a8468',lw);for(const k of[-1,1]){E(g,s*.14+k*2,-s*.38,s*.03,s*.1,k*.2);fs(g,'#8a755a',lw)}
  }else if(a.type==='deer'){
    g.strokeStyle=OUT;g.lineWidth=3;g.lineCap='round';g.beginPath();for(const x of[-.2,-.1,.12,.2]){g.moveTo(s*x,-s*.3);g.lineTo(s*x,0)}g.stroke();g.strokeStyle='#6e4426';g.lineWidth=1.6;g.stroke();
    E(g,0,-s*.38,s*.3,s*.15);fs(g,'#9a6238',lw);g.fillStyle='#e8d8c0';E(g,0,-s*.3,s*.18,s*.05);g.fill();
    g.beginPath();g.moveTo(s*.2,-s*.44);g.lineTo(s*.32,-s*.66);g.lineTo(s*.4,-s*.6);g.lineTo(s*.3,-s*.4);g.closePath();fs(g,'#9a6238',lw);
    E(g,s*.38,-s*.66,s*.1,s*.07,.3);fs(g,'#9a6238',lw);
    g.strokeStyle='#d8c8a8';g.lineWidth=1.8;g.beginPath();g.moveTo(s*.34,-s*.72);g.lineTo(s*.28,-s*.9);g.lineTo(s*.22,-s*.96);g.moveTo(s*.29,-s*.85);g.lineTo(s*.36,-s*.92);g.moveTo(s*.4,-s*.72);g.lineTo(s*.44,-s*.88);g.stroke();
    E(g,-s*.3,-s*.42,s*.05,s*.04);fs(g,'#f2eee4',1);
  }else{
    g.fillStyle='#2e2620';for(const x of[-.2,-.08,.1,.2])g.fillRect(s*x-2,-s*.14,4,s*.14);
    E(g,0,-s*.3,s*.32,s*.17);fs(g,'#4f4034',lw);g.strokeStyle='rgba(20,14,10,.6)';g.lineWidth=1;g.beginPath();for(let k=0;k<7;k++){g.moveTo(-s*.2+k*s*.06,-s*.45);g.lineTo(-s*.22+k*s*.06,-s*.38)}g.stroke();
    E(g,s*.32,-s*.26,s*.13,s*.1);fs(g,'#4f4034',lw);E(g,s*.44,-s*.24,s*.05,s*.05);fs(g,'#a07a6a',1);g.strokeStyle='#f2eee4';g.lineWidth=1.6;g.beginPath();g.moveTo(s*.4,-s*.2);g.quadraticCurveTo(s*.46,-s*.16,s*.46,-s*.28);g.stroke();
  }
  g.restore();
}
function drawItem(g,i,cx,cy,s){
  const lw=Math.max(1,s*.05);
  switch(i){
    case 'potato':for(const[x,y]of[[-.16,.08],[.15,.1],[0,-.1],[.06,.22],[-.04,.04]]){E(g,cx+x*s,cy+y*s,s*.15,s*.11,x);fs(g,'#b48a52',lw)}break;
    case 'rice':E(g,cx,cy+s*.08,s*.32,s*.2);fs(g,'#d9cfa8',lw);E(g,cx,cy,s*.24,s*.13);fs(g,'#ece6cf',lw*.7);break;
    case 'corn':for(const[x,r]of[[-.12,-.3],[.12,.3]]){E(g,cx+x*s,cy,s*.1,s*.3,r);fs(g,'#e6c34a',lw);E(g,cx+x*s-Math.sin(r)*s*.24,cy+s*.24,s*.08,s*.1,r);fs(g,'#7d9a3c',lw*.8)}break;
    case 'hay':rr(g,cx-s*.32,cy-s*.2,s*.64,s*.42,s*.1);fs(g,'#cdb560',lw);g.strokeStyle='rgba(110,90,30,.6)';g.lineWidth=lw*.8;g.beginPath();for(let k=-2;k<=2;k++){g.moveTo(cx+k*s*.12,cy-s*.18);g.lineTo(cx+k*s*.12+s*.03,cy+s*.2)}g.stroke();g.fillStyle='#7a5a2a';g.fillRect(cx-s*.03,cy-s*.2,s*.06,s*.42);break;
    case 'cotton':blobs(g,[[cx-s*.14,cy+s*.05,s*.14],[cx+s*.13,cy+s*.06,s*.14],[cx,cy-s*.1,s*.15],[cx,cy+s*.15,s*.12]],'#f3f1ea',lw);break;
    case 'egg':for(const[x,y]of[[-.13,.06],[.13,.08],[0,-.08]]){E(g,cx+x*s,cy+y*s,s*.11,s*.14);fs(g,'#efe2c4',lw)}break;
    case 'milk':rr(g,cx-s*.18,cy-s*.12,s*.36,s*.38,s*.09);fs(g,'#f1efe6',lw);rr(g,cx-s*.09,cy-s*.28,s*.18,s*.18,s*.05);fs(g,'#f1efe6',lw);g.fillStyle='#5f86a8';g.fillRect(cx-s*.18+lw/2,cy+s*.02,s*.36-lw,s*.08);break;
    case 'wool':blobs(g,[[cx-s*.12,cy+s*.04,s*.16],[cx+s*.12,cy+s*.05,s*.15],[cx,cy-s*.1,s*.15]],'#a8643a',lw);g.strokeStyle='rgba(70,35,15,.7)';g.lineWidth=lw;for(const[x,y]of[[-.12,.04],[.12,.05],[0,-.1]]){g.beginPath();g.arc(cx+x*s,cy+y*s,s*.06,0,4.5);g.stroke()}break;
    case 'wood':for(const[y,l]of[[.14,.3],[0,.32],[-.14,.28]]){rr(g,cx-s*l,cy+y*s-s*.07,s*l*2,s*.14,s*.07);fs(g,'#8a5f36',lw);E(g,cx+s*l-s*.03,cy+y*s,s*.05,s*.065);fs(g,'#c9a06a',lw*.7)}break;
    case 'stone':for(const[x,y]of[[-.15,.1],[.15,.1],[0,-.1]]){g.beginPath();g.rect(cx+x*s-s*.14,cy+y*s-s*.1,s*.28,s*.2);fs(g,'#9a958d',lw);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(cx+x*s-s*.12,cy+y*s-s*.08,s*.24,s*.05)}break;
    case 'comp':{g.save();g.translate(cx,cy);g.beginPath();for(let k=0;k<16;k++){const a=k/16*Math.PI*2,r=k%2?s*.22:s*.3;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();fs(g,'#a9aeb3',lw);g.beginPath();g.arc(0,0,s*.1,0,7);fs(g,'#5f6a72',lw);g.fillStyle='#d8b04a';g.fillRect(-s*.03,-s*.3,s*.06,s*.08);g.restore();break}
    case 'meal':E(g,cx,cy+s*.05,s*.32,s*.22);fs(g,'#c7c3b8',lw);E(g,cx,cy+s*.03,s*.2,s*.12);fs(g,'#8a6438',lw*.6);g.fillStyle='#6f9a3c';g.beginPath();g.arc(cx+s*.08,cy,s*.05,0,7);g.fill();g.fillStyle='#e0c060';g.beginPath();g.arc(cx-s*.08,cy+s*.04,s*.045,0,7);g.fill();break;
    case 'finemeal':E(g,cx,cy+s*.05,s*.32,s*.22);fs(g,'#dcd6c8',lw);E(g,cx,cy+s*.03,s*.22,s*.13);fs(g,'#a8643a',lw*.6);g.fillStyle='#f2eee4';E(g,cx-s*.07,cy,s*.07,s*.05);g.fill();g.fillStyle='#e8c457';g.beginPath();g.arc(cx-s*.07,cy,s*.03,0,7);g.fill();g.fillStyle='#6f9a3c';g.beginPath();g.arc(cx+s*.09,cy-s*.01,s*.05,0,7);g.fill();break;
    case 'cheese':g.beginPath();g.moveTo(cx-s*.3,cy+s*.2);g.lineTo(cx+s*.3,cy+s*.2);g.lineTo(cx+s*.3,cy-s*.05);g.lineTo(cx-s*.3,cy+s*.02);g.closePath();fs(g,'#e8c457',lw);g.beginPath();g.moveTo(cx-s*.3,cy+s*.02);g.lineTo(cx+s*.3,cy-s*.05);g.lineTo(cx+s*.1,cy-s*.2);g.closePath();fs(g,'#f2d77a',lw);break;
    case 'parka':g.beginPath();g.moveTo(cx-s*.14,cy-s*.28);g.lineTo(cx+s*.14,cy-s*.28);g.lineTo(cx+s*.34,cy-s*.1);g.lineTo(cx+s*.28,cy+s*.04);g.lineTo(cx+s*.2,cy);g.lineTo(cx+s*.2,cy+s*.3);g.lineTo(cx-s*.2,cy+s*.3);g.lineTo(cx-s*.2,cy);g.lineTo(cx-s*.28,cy+s*.04);g.lineTo(cx-s*.34,cy-s*.1);g.closePath();fs(g,'#8f5d38',lw);g.strokeStyle='#5a3820';g.lineWidth=lw;g.beginPath();g.moveTo(cx,cy-s*.22);g.lineTo(cx,cy+s*.28);g.stroke();E(g,cx,cy-s*.27,s*.15,s*.06);fs(g,'#e6dcc4',lw*.8);break;
    case 'seed':g.beginPath();g.moveTo(cx-s*.24,cy+s*.26);g.lineTo(cx-s*.2,cy-s*.12);g.lineTo(cx+s*.2,cy-s*.12);g.lineTo(cx+s*.24,cy+s*.26);g.closePath();fs(g,'#c8b088',lw);E(g,cx,cy-s*.13,s*.2,s*.06);fs(g,'#a88f68',lw*.8);g.strokeStyle='#5f8a35';g.lineWidth=lw*1.6;g.beginPath();g.moveTo(cx,cy-s*.14);g.lineTo(cx,cy-s*.32);g.stroke();break;
    case 'meat':rr(g,cx-s*.26,cy-s*.16,s*.5,s*.34,s*.14);fs(g,'#b5544a',lw);g.fillStyle='#e8b0a0';E(g,cx-s*.06,cy-s*.02,s*.12,s*.06);g.fill();g.strokeStyle=OUT;g.lineWidth=lw*2.6;g.lineCap='round';g.beginPath();g.moveTo(cx+s*.18,cy+s*.08);g.lineTo(cx+s*.32,cy+s*.22);g.stroke();g.strokeStyle='#f2eee4';g.lineWidth=lw*1.4;g.stroke();break;
    case 'leather':g.beginPath();g.moveTo(cx-s*.3,cy-s*.18);g.quadraticCurveTo(cx,cy-s*.3,cx+s*.3,cy-s*.18);g.lineTo(cx+s*.26,cy+s*.2);g.quadraticCurveTo(cx,cy+s*.3,cx-s*.26,cy+s*.2);g.closePath();fs(g,'#a8784a',lw);g.strokeStyle='rgba(80,50,25,.5)';g.lineWidth=lw*.8;g.setLineDash([2,2]);rr(g,cx-s*.2,cy-s*.12,s*.4,s*.26,s*.06);g.stroke();g.setLineDash([]);break;
    case 'steel':for(const[x,y]of[[-.13,.1],[.13,.1],[0,-.08]]){g.beginPath();g.moveTo(cx+(x-.14)*s,cy+(y+.08)*s);g.lineTo(cx+(x-.1)*s,cy+(y-.07)*s);g.lineTo(cx+(x+.1)*s,cy+(y-.07)*s);g.lineTo(cx+(x+.14)*s,cy+(y+.08)*s);g.closePath();fs(g,'#a9b0b6',lw);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(cx+(x-.08)*s,cy+(y-.05)*s,s*.16,s*.03)}break;
    case 'bow':case 'recurve':case 'spear':case 'steelspear':case 'rifle':case 'assault':case 'sniper':case 'lmg':case 'charge':case 'longsword':case 'zweihander':case 'monosword':case 'warhammer':weaponIcon(g,i,cx,cy,s);break;
    case 'chemfuel':rr(g,cx-s*.2,cy-s*.22,s*.4,s*.46,s*.06);fs(g,'#b8322a',lw);rr(g,cx+s*.02,cy-s*.32,s*.12,s*.1,s*.02);fs(g,'#3a3d40',lw*.8);g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=lw;g.beginPath();g.moveTo(cx-s*.12,cy-s*.12);g.lineTo(cx+s*.12,cy+s*.14);g.moveTo(cx+s*.12,cy-s*.12);g.lineTo(cx-s*.12,cy+s*.14);g.stroke();break;
    case 'shell':for(const dx of[-.12,.12]){rr(g,cx+dx*s-s*.08,cy-s*.12,s*.16,s*.36,s*.03);fs(g,'#c9a640',lw);g.beginPath();g.moveTo(cx+dx*s-s*.08,cy-s*.12);g.quadraticCurveTo(cx+dx*s,cy-s*.36,cx+dx*s+s*.08,cy-s*.12);g.closePath();fs(g,'#5f6448',lw)}break;
    case 'mine':E(g,cx,cy+s*.04,s*.3,s*.18);fs(g,'#5f6448',lw);E(g,cx,cy,s*.16,s*.09);fs(g,'#4a4f38',lw*.8);g.fillStyle='#c8382a';g.beginPath();g.arc(cx,cy-s*.02,s*.04,0,7);g.fill();break;
    case 'plasteel':for(const[x,y]of[[-.13,.1],[.13,.1],[0,-.08]]){g.beginPath();g.moveTo(cx+(x-.14)*s,cy+(y+.08)*s);g.lineTo(cx+(x-.1)*s,cy+(y-.07)*s);g.lineTo(cx+(x+.1)*s,cy+(y-.07)*s);g.lineTo(cx+(x+.14)*s,cy+(y+.08)*s);g.closePath();fs(g,'#a8c4d0',lw);g.fillStyle='rgba(255,255,255,.45)';g.fillRect(cx+(x-.08)*s,cy+(y-.05)*s,s*.16,s*.03)}break;
    case 'acomp':{g.save();g.translate(cx,cy);g.beginPath();for(let k=0;k<16;k++){const a=k/16*Math.PI*2,r=k%2?s*.22:s*.3;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();fs(g,'#c9ced3',lw);g.beginPath();g.arc(0,0,s*.12,0,7);fs(g,'#3d6ab0',lw);g.fillStyle='#9ee6ff';g.beginPath();g.arc(0,0,s*.05,0,7);g.fill();g.restore();break}
    case 'datadisk':{rr(g,cx-s*.26,cy-s*.26,s*.52,s*.52,s*.06);fs(g,'#3a3f48',lw);g.beginPath();g.arc(cx,cy,s*.17,0,7);fs(g,'#9ab0c8',lw*.8);g.beginPath();g.arc(cx,cy,s*.05,0,7);g.fillStyle='#3a3f48';g.fill();g.fillStyle='#c9a640';g.fillRect(cx-s*.2,cy-s*.24,s*.14,s*.06);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=lw*.6;g.beginPath();g.arc(cx,cy,s*.11,-2.4,-1.2);g.stroke();break}
    case 'mechpart':{g.save();g.translate(cx,cy);for(let k=0;k<8;k++){g.rotate(Math.PI/4);g.fillStyle='#7a8088';g.fillRect(-s*.05,-s*.3,s*.1,s*.1)}g.restore();g.beginPath();g.arc(cx,cy,s*.22,0,7);fs(g,'#8a9098',lw);g.beginPath();g.arc(cx,cy,s*.08,0,7);fs(g,'#c0392b',lw*.7);g.strokeStyle='#4a5058';g.lineWidth=lw;g.beginPath();g.moveTo(cx+s*.1,cy+s*.12);g.lineTo(cx+s*.3,cy+s*.3);g.stroke();break}
    case 'seeds':{rr(g,cx-s*.2,cy-s*.24,s*.4,s*.48,s*.08);fs(g,'#c9b28a',lw);g.strokeStyle='rgba(80,50,20,.6)';g.lineWidth=lw*.8;g.beginPath();g.moveTo(cx-s*.2,cy-s*.12);g.lineTo(cx+s*.2,cy-s*.12);g.stroke();for(const[a,b]of[[-.08,.02],[.06,.06],[-.02,.14],[.1,-.02]]){E(g,cx+a*s,cy+b*s,s*.045,s*.065);fs(g,'#6a8a3a',lw*.5)}break}
    case 'schem':rr(g,cx-s*.28,cy-s*.2,s*.56,s*.4,s*.04);fs(g,'#3d6ab0',lw);g.strokeStyle='rgba(220,240,255,.8)';g.lineWidth=lw*.8;g.beginPath();g.moveTo(cx-s*.2,cy-s*.08);g.lineTo(cx,cy-s*.08);g.lineTo(cx,cy+s*.1);g.moveTo(cx+s*.06,cy-s*.12);g.lineTo(cx+s*.2,cy-s*.12);g.lineTo(cx+s*.2,cy+s*.12);g.stroke();g.beginPath();g.arc(cx-s*.12,cy+s*.06,s*.05,0,7);g.stroke();break;
    case 'woodarmor':case 'leatherarmor':case 'flakvest':case 'plate':case 'recon':case 'marine':armorIcon(g,i,cx,cy,s);break;
    case 'marinehelm':case 'advhelmet':case 'helmet':helmIcon(g,i,cx,cy,s);break;
    case 'duster':g.beginPath();g.moveTo(cx-s*.12,cy-s*.3);g.lineTo(cx+s*.12,cy-s*.3);g.lineTo(cx+s*.3,cy-s*.12);g.lineTo(cx+s*.24,cy+s*.34);g.lineTo(cx-s*.24,cy+s*.34);g.lineTo(cx-s*.3,cy-s*.12);g.closePath();fs(g,'#7a5434',lw);g.strokeStyle='#4a3020';g.lineWidth=lw;g.beginPath();g.moveTo(cx,cy-s*.26);g.lineTo(cx,cy+s*.34);g.stroke();break;
    case 'silver':for(const[x,y]of[[-.12,.12],[.12,.12],[0,-.04]]){E(g,cx+x*s,cy+y*s,s*.16,s*.08);fs(g,'#c9ccd0',lw);E(g,cx+x*s,cy+y*s-s*.05,s*.16,s*.08);fs(g,'#e2e5e8',lw)}break;
  }
}
function drawPlant(g,c,gr,cx,cy){
  const s=T,b=cy+s*.38,k=.3+.7*gr,lw=1.2;
  g.save();g.lineCap='round';{const sw=(Math.sin(performance.now()/950+cx*.045+cy*.02)*.09+Math.sin(performance.now()/380+cx)*.025)*k*WIND;g.translate(cx,b);g.transform(1,0,sw,1,0,0);g.translate(-cx,-b)}
  if(c==='potato'){
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.3,r=s*.17*k;E(g,cx+Math.cos(a)*r,b-s*.2*k+Math.sin(a)*r*.6,s*.13*k,s*.08*k,a);fs(g,gr>=1?'#6b8f3e':'#58803a',lw)}
    E(g,cx,b-s*.22*k,s*.1*k,s*.08*k);fs(g,'#6f9a45',lw);
  }else if(c==='rice'||c==='haygrass'){
    const col=c==='rice'?(gr>=1?'#cdb85a':'#7ea44a'):(gr>=1?'#a9b85a':'#8fae4a');
    const bl=[[-.18,-.1],[-.08,-.03],[0,.02],[.09,.06],[.18,.12],[-.13,.09]];
    g.strokeStyle=OUT;g.lineWidth=4;g.beginPath();for(const[x,l]of bl){g.moveTo(cx+x*s,b);g.lineTo(cx+x*1.5*s,b-s*(.42+l)*k)}g.stroke();
    g.strokeStyle=col;g.lineWidth=2;g.stroke();
    if(c==='rice'&&gr>.7){g.fillStyle='#e3cc6a';for(const[x,l]of bl){E(g,cx+x*1.5*s,b-s*(.42+l)*k,2.2,3.5);g.fill()}}
  }else if(c==='corn'){
    const h=s*1.05*k;
    g.strokeStyle=OUT;g.lineWidth=5;g.beginPath();g.moveTo(cx,b);g.lineTo(cx,b-h);g.stroke();g.strokeStyle='#7c9a3e';g.lineWidth=3;g.stroke();
    for(let i=0;i<3;i++){const y=b-h*(.3+i*.22),d=i%2?1:-1;E(g,cx+d*s*.15*k,y,s*.17*k,s*.05*k,d*.5);fs(g,'#6f913a',lw)}
    if(gr>.6){E(g,cx+s*.07,b-h*.55,s*.06,s*.14*k,.15);fs(g,gr>=1?'#e6c34a':'#c9c070',lw)}
  }else if(c==='tree'){
    if(gr<.25){g.strokeStyle='#6a8a3a';g.lineWidth=2;g.beginPath();g.moveTo(cx,b);g.lineTo(cx,b-s*.35);g.stroke();E(g,cx+4,b-s*.32,4,2.5,-.4);fs(g,'#6f9a3c',1)}
    else{const sc=.35+.65*gr,r=mulberry(Math.floor(cx*7+cy*13));rr(g,cx-2.5*sc,b-s*.45*sc,5*sc,s*.45*sc,2);g.fillStyle='#4a3420';g.fill();const parts=[];for(let k=0;k<4;k++)parts.push([cx+(r()-.5)*s*.6*sc,b-s*.6*sc+(r()-.5)*s*.4*sc,s*(.2+r()*.1)*sc]);blobs(g,parts,gr>=1?'#3f5c2c':'#4f6c34',1.3);g.fillStyle='rgba(140,170,90,.25)';for(const[x2,y2,q]of parts){g.beginPath();g.arc(x2-q*.25,y2-q*.3,q*.45,0,7);g.fill()}}
  }else if(c==='cotton'){
    blobs(g,[[cx-s*.12*k,b-s*.2*k,s*.13*k],[cx+s*.12*k,b-s*.22*k,s*.13*k],[cx,b-s*.34*k,s*.14*k]],'#55783a',lw);
    if(gr>.6){const n=gr>=1?5:3;for(let i=0;i<n;i++){g.beginPath();g.arc(cx+Math.cos(i*1.3)*s*.15,b-s*.25+Math.sin(i*1.3)*s*.1,s*.055,0,7);fs(g,'#f6f4ee',lw)}}
  }
  g.restore();
}
function drawTree(g,o,now){
  const cx=o.x*T+T/2,cy=o.y*T+T/2,sc=o.g<.15?0:.35+.65*o.g;
  if(sc===0){E(g,cx,cy+8,7,4);fs(g,'#7a5a36',1.5);E(g,cx,cy+7,4,2.2);fs(g,'#c9a06a',1);return}
  const r=mulberry(o.id*7+3),sway=(Math.sin(now/1150+o.x*.35+o.y*.1)*1.9+Math.sin(now/430+o.id)*.6)*sc*WIND;
  g.fillStyle=`rgba(0,0,0,${.1+SUN.a*.55})`;E(g,cx+SUN.dx*.9*sc+sway*.5,cy+2+SUN.dy*.7*sc,T*.46*sc,T*.3*sc);g.fill();
  rr(g,cx-3,cy,6,14,2);g.fillStyle='#4a3420';g.fill();g.strokeStyle=OUT;g.lineWidth=1.5;g.stroke();
  const b=biome(),parts=[];for(let k=0;k<5;k++)parts.push([cx+(r()-.5)*T*.7*sc+sway,cy-T*.25*sc+(r()-.5)*T*.5*sc,T*(.24+r()*.12)*sc]);
  const tc=treeCols(b,o.id%3);blobs(g,parts,tc[0],1.5);
  g.save();g.beginPath();for(const[x2,y2,q]of parts){g.moveTo(x2+q,y2);g.arc(x2,y2,q,0,7)}g.clip();g.fillStyle='rgba(10,30,10,.22)';for(const[x2,y2,q]of parts){g.beginPath();g.arc(x2+q*.35,y2+q*.45,q*.8,0,7);g.fill()}g.restore();
  g.fillStyle=tc[1];for(const[x2,y2,q]of parts){g.beginPath();g.arc(x2-q*.25,y2-q*.3,q*.45,0,7);g.fill()}
  g.fillStyle='rgba(255,255,230,.16)';for(const[x2,y2,q]of parts){g.beginPath();g.arc(x2-q*.38,y2-q*.42,q*.18,0,7);g.fill()}
  if(sc>.6){g.fillStyle='rgba(20,40,15,.35)';for(let k=0;k<4;k++){const[x2,y2,q]=parts[k];g.fillRect(x2+(r()-.5)*q,y2+(r()-.2)*q*.8,1.6,1.6)}}
}
function drawChunk(g,o,now){
  const cx=o.x*T+T/2,cy=o.y*T+T/2,age=S.t-o.land;
  if(age<2){const h=1-age/2;g.fillStyle=`rgba(0,0,0,${.35*(1-h)})`;E(g,cx,cy+6,T*.8*(1-h*.5),T*.3*(1-h*.5));g.fill();
    g.save();g.translate(cx-h*120,cy-h*300);g.fillStyle='rgba(255,170,70,.7)';E(g,-10*h-6,-14*h-6,10,22,-.6);g.fill();drawDebris(g,o,0,0);g.restore();return}
  g.fillStyle='rgba(40,30,20,.35)';E(g,cx,cy+4,T*.9,T*.45);g.fill();
  drawDebris(g,o,cx,cy);
  if(age<40){for(let k=0;k<3;k++){const t=((now/1000+k*.7)%2)/2;g.fillStyle=`rgba(90,90,90,${.35*(1-t)})`;g.beginPath();g.arc(cx+Math.sin(k+t*3)*5,cy-8-t*30,4+t*8,0,7);g.fill()}}
}
function drawDebris(g,o,cx,cy){
  const r=mulberry(o.seed||1);g.save();g.translate(cx,cy);
  for(let k=0;k<4;k++){g.save();g.rotate((r()-.5)*1.4);g.translate((r()-.5)*14,(r()-.5)*10);g.beginPath();g.moveTo(-10,-5);g.lineTo(8+r()*6,-7);g.lineTo(12,4);g.lineTo(-6,8);g.closePath();fs(g,k%2?'#8a8e92':'#6f7478',1.6);g.restore()}
  g.fillStyle='#d8b04a';g.fillRect(-3,-2,6,3);g.restore();
}
function drawBubble(g,x,y,k,now){
  if(k==='smoke'||k==='beer')return;
  g.save();g.translate(x,y);
  rr(g,-13,-22,26,17,8);g.fillStyle='rgba(250,248,240,.95)';g.fill();g.strokeStyle=OUT;g.lineWidth=1.4;g.stroke();
  g.beginPath();g.moveTo(-3,-5.5);g.lineTo(0,1);g.lineTo(3,-5.5);g.fillStyle='rgba(250,248,240,.95)';g.fill();g.stroke();
  g.fillStyle='rgba(250,248,240,.95)';g.fillRect(-2.4,-6.5,4.8,2);
  if(k==='chat'){g.strokeStyle='#3a3530';g.lineWidth=1.3;g.lineCap='round';g.beginPath();for(let i=0;i<2;i++){const yy=-17+i*6;g.moveTo(-8,yy);for(let s=0;s<6;s++)g.lineTo(-8+s*3+1.5,yy+(s%2?-2:1.5)+Math.sin(now/200+i)*.5)}g.stroke()}
  else if(k==='heart'){g.fillStyle='#c8382a';g.beginPath();g.moveTo(0,-8);g.bezierCurveTo(-9,-14,-5,-21,0,-16);g.bezierCurveTo(5,-21,9,-14,0,-8);g.fill()}
  else if(k==='ha'){g.fillStyle='#3a3530';g.font='700 10px Arimo, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('ha ha',0,-13.5)}
  else if(k==='note'){g.fillStyle='#3a3530';g.strokeStyle='#3a3530';g.lineWidth=1.4;const bob=Math.sin(now/180)*1.2;E(g,-4,-10+bob,2.6,2);g.fill();E(g,4,-12+bob,2.6,2);g.fill();g.beginPath();g.moveTo(-1.6,-10+bob);g.lineTo(-1.6,-19+bob);g.lineTo(6.4,-21+bob);g.lineTo(6.4,-12+bob);g.stroke()}
  else if(k==='cards'){for(const[x,r,c]of[[-4,-.25,'#f2eee4'],[0,0,'#f2eee4'],[4,.25,'#f2eee4']]){g.save();g.translate(x,-13);g.rotate(r);g.fillStyle=c;g.fillRect(-3,-5,6,9);g.strokeStyle='#3a3530';g.lineWidth=1;g.strokeRect(-3,-5,6,9);g.restore()}g.fillStyle='#c8382a';g.beginPath();g.arc(0,-13,1.4,0,7);g.fill()}
  else if(k==='cheer'){g.fillStyle='#d8a030';g.font='700 13px Arimo, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('$',0,-13)}
  else{g.fillStyle='#3a3530';g.font='700 12px Arimo, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(k,0,-13)}
  g.restore();
}

