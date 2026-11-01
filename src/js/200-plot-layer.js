/* ================= plot layer ================= */
const FLOOR={dirt:'#6b5739',wood:'#7b5b39',woodl:'#94714a',stone:'#8a857c',metal:'#6d7377',soil:'#4a3a28',grass:'#6f7a44'};
function buildPlots(){
  const pw=Math.ceil(W*T*LS),ph=Math.ceil(H*T*LS);
  if(!plotCv||plotCv.width!==pw||plotCv.height!==ph){plotCv=document.createElement('canvas');plotCv.width=pw;plotCv.height=ph}
  if(!plotTopCv||plotTopCv.width!==pw||plotTopCv.height!==ph){plotTopCv=document.createElement('canvas');plotTopCv.width=pw;plotTopCv.height=ph}
  const g=plotCv.getContext('2d');g.setTransform(LS,0,0,LS,0,0);g.clearRect(0,0,W*T,H*T);const gt=plotTopCv.getContext('2d');gt.setTransform(LS,0,0,LS,0,0);gt.clearRect(0,0,W*T,H*T);
  doorSegs=[];drawRoads(g);
  for(const p of S.plots)drawPlotBase(g,p);
  for(const p of S.plots)drawPlotProps(g,p);
  drawLanes(g);
  for(const p of built().filter(walled))drawHouseWalls(gt,p);
  drawWallPlots(g);drawStakes(g);drawWalls(gt);computeLights(gt);plotSil=makeSil(plotTopCv,.5);
}
function sandRun(g,x,y,w,h){const horiz=w>=h,n=Math.max(1,Math.round((horiz?w:h)/(T*.42)));for(let row=0;row<2;row++)for(let k=0;k<n-(row?1:0);k++){const f=(k+.5+(row?.5:0))/n,bx=horiz?x+f*w:x+w/2+(row?-1:1)*w*.18,by=horiz?y+h/2+(row?-1:1)*h*.18:y+f*h;sandbag(g,bx,by,horiz?0:Math.PI/2,(horiz?w:h)/n+2,(horiz?h:w)*.5,(k+row)%2)}}
function drawLanes(g){for(const sl of laneCache){const l=S.lanes&&S.lanes[sl.key];if(!l)continue;const x0=sl.x0*T,y0=sl.y0*T;
  if(l.con){rr(g,x0+4,y0+4,sl.w*T-8,sl.h*T-8,8);if(l.type==='wing'){g.fillStyle='rgba(120,95,60,.3)';g.fill()}g.strokeStyle='rgba(240,225,170,.65)';g.setLineDash([6,4]);g.lineWidth=1.6;g.stroke();g.setLineDash([]);continue}
  if(l.type==='wing'){drawWing(g,sl,l);continue}
  if(l.type==='barricade'){if(sl.v){sandRun(g,x0+2,y0+1.22*T,2*T-4,T*.56);sandRun(g,x0+T+2,y0+3.22*T,2*T-4,T*.56)}else{sandRun(g,x0+1.22*T,y0+2,T*.56,2*T-4);sandRun(g,x0+3.22*T,y0+T+2,T*.56,2*T-4)}}
  else if(l.type==='spikes'){const logs=sl.v?[[0,1],[2,1],[0,3],[2,3]]:[[1,0],[1,2],[3,0],[3,2]];for(const[a,b]of logs){const cx=x0+(a+.5)*T,cy=y0+(b+.5)*T;g.strokeStyle=OUT;g.lineWidth=6;g.lineCap='round';g.beginPath();if(sl.v){g.moveTo(cx-T*.45,cy);g.lineTo(cx+T*.45,cy)}else{g.moveTo(cx,cy-T*.45);g.lineTo(cx,cy+T*.45)}g.stroke();g.strokeStyle='#7a5834';g.lineWidth=3.5;g.stroke();
      for(let k=-1;k<=1;k++){const ox2=sl.v?k*T*.3:0,oy2=sl.v?0:k*T*.3,px=cx+ox2,py=cy+oy2;for(const[a,b]of[[-1,-1],[1,1],[1,-1],[-1,1]]){g.strokeStyle=OUT;g.lineWidth=3.6;g.beginPath();g.moveTo(px,py);g.lineTo(px+a*8,py+b*8);g.stroke();g.strokeStyle='#c8a878';g.lineWidth=2;g.stroke();g.fillStyle='#e8dcc0';g.beginPath();g.moveTo(px+a*8.5,py+b*8.5);g.lineTo(px+a*6-b*1.5,py+b*6+a*1.5);g.lineTo(px+a*6+b*1.5,py+b*6-a*1.5);g.closePath();g.fill()}
        g.beginPath();g.arc(px,py,2.2,0,7);fs(g,'#5c4228',1)}}}
  else if(l.type==='post'||l.type==='turret'){const[px2,py2]=lanePostPos(sl),cx=(px2+.5)*T,cy=(py2+.5)*T;g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.arc(cx+2,cy+3,T*.86,0,7);g.fill();
    if(l.type==='turret'){g.beginPath();g.arc(cx,cy,T*.62,0,7);const gr=g.createRadialGradient(cx,cy,2,cx,cy,T*.62);gr.addColorStop(0,'#7d8388');gr.addColorStop(1,'#5a6064');g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.5;g.stroke();g.strokeStyle='rgba(240,200,60,.7)';g.lineWidth=2;g.setLineDash([4,4]);g.beginPath();g.arc(cx,cy,T*.5,0,7);g.stroke();g.setLineDash([])}
    else{planks(g,cx-T*.55,cy-T*.55,T*1.1,T*1.1,sl.v,'#8f6e46','#7b5b39');g.strokeStyle=OUT;g.lineWidth=1.2;g.strokeRect(cx-T*.55,cy-T*.55,T*1.1,T*1.1);ammoBox(g,cx-6,cy+T*.12,12,7);crate(g,cx+T*.12,cy-T*.4,9)}
    const gap=sl.v?Math.PI*.5:0;sandArc(g,cx,cy,T*.8,gap+.45,gap+Math.PI*2-.45,9,13,8.5,l.type==='post'?2:1)}
}}
function drawWing(g,sl,l){const p=S.plots[l.par];if(!p)return;const side=wingSide(sl,p),wl=wingWalled(l),x0=sl.x0*T,y0=sl.y0*T,w=sl.w*T,h=sl.h*T;
  const fl=l.w==='well'?'grass':l.w==='stable'?'dirt':!wl?'dirt':(l.w==='bath'||p.tier>=2?'stone':'wood');
  if(wl)floorTile(g,x0,y0,fl,w,h);else fillRectRound(g,x0+3,y0+3,w-6,h-6,8,fl,'rgba(20,14,8,.35)');
  g.save();g.translate(x0+w/2,y0+h/2);g.rotate({N:0,S:Math.PI,W:-Math.PI/2,E:Math.PI/2}[side]);wingProps(g,l.w,sl,side);g.restore()}
function mapTableProp(g,cx,cy){rr(g,cx-1.6*T,cy-.55*T,3.2*T,1.1*T,5);fs(g,'#7a5834',2);rr(g,cx-1.45*T,cy-.42*T,2.9*T,.84*T,3);g.fillStyle='#e6d6a8';g.fill();g.strokeStyle='rgba(120,80,40,.55)';g.lineWidth=1.2;g.beginPath();g.moveTo(cx-1.3*T,cy);g.bezierCurveTo(cx-.6*T,cy-.4*T,cx,cy+.3*T,cx+1.3*T,cy-.15*T);g.stroke();g.strokeStyle='#5a7a9a';g.beginPath();g.moveTo(cx-.4*T,cy-.4*T);g.quadraticCurveTo(cx-.1*T,cy,cx-.5*T,cy+.4*T);g.stroke();g.fillStyle='#c0392b';for(const[a,b]of[[.6,-.1],[-.9,.1],[.2,.2]]){g.beginPath();g.arc(cx+a*T,cy+b*T,2.6,0,7);g.fill()}g.fillStyle='#8a6640';for(const a of[-1.9,1.9]){g.beginPath();g.arc(cx+a*T,cy,5,0,7);fs(g,'#8a6640',1.4)}}
function wingProps(g,w,sl,side){const X=-2.5*T,Y=-1.5*T;
  switch(w){
    case 'maproom':mapTableProp(g,0,Y+1.5*T);shelfProp(g,X+3,Y+4,T*1.3,T*.5,['#e6d6a8','#c9b28a','#a8643a']);shelfProp(g,X+3.6*T,Y+4,T*1.3,T*.5,['#e6d6a8','#5a7a9a','#c9b28a']);break;
    case 'pantry':shelfProp(g,X+3,Y+2.2*T,2*T-6,T*.7,['#c9b28a','#a8643a','#d8c070']);shelfProp(g,X+3*T+3,Y+2.2*T,2*T-6,T*.7,['#e8e2d0','#8a6a48','#c9a640']);sackProp(g,X+.5*T,Y+1.3*T);sackProp(g,X+.95*T,Y+1.5*T);barrelProp(g,X+4.4*T,Y+1.3*T);barrelProp(g,X+4.0*T,Y+1.55*T);break;
    case 'supply':shelfProp(g,X+3,Y+2.2*T,2*T-6,T*.7,['#b08a5a','#9aa0a4','#8a6640']);shelfProp(g,X+3*T+3,Y+2.2*T,2*T-6,T*.7,['#9aa0a4','#b08a5a','#6d7377']);crateProp(g,X+.2*T,Y+1.1*T,T*.75);crateProp(g,X+1*T,Y+1.25*T,T*.65,'#8a6a48');for(let k=0;k<3;k++){rr(g,X+3.1*T,Y+(1.1+k*.25)*T,T*1.6,T*.18,3);fs(g,k%2?'#9a7448':'#b08a5a',1.2)}break;
    case 'library':for(const xx of[0,3])shelfProp(g,X+xx*T+3,Y+2.2*T,2*T-6,T*.7,['#7a3f36','#3d5a6e','#6e7a3a','#c9a640','#5a4a6e']);rr(g,X+1.7*T,Y+.9*T,T*1.6,T*.8,4);fs(g,'#8a6640',1.8);g.fillStyle='#e8e2d0';g.fillRect(X+1.95*T,Y+1.05*T,10,7);g.fillRect(X+2.6*T,Y+1.1*T,9,6);g.beginPath();g.arc(X+2.5*T,Y+1.95*T,6,0,7);fs(g,'#6e5132',1.2);break;
    case 'granary':{const cx=X+3.9*T,cy=Y+1.6*T;g.beginPath();g.arc(cx,cy,T*.95,0,7);fs(g,'#b8a478',2);g.strokeStyle='rgba(60,40,20,.35)';g.lineWidth=1;for(let r=8;r<T*.9;r+=7){g.beginPath();g.arc(cx,cy,r,0,7);g.stroke()}g.beginPath();g.arc(cx,cy,6,0,7);fs(g,'#8a7a50',1.2);for(const[a,b]of[[.5,1.2],[1,1.4],[.6,2.2],[1.4,2.3],[1.9,1.5],[2.2,2.3]])sackProp(g,X+a*T,Y+b*T,'#d8c890');break}
    case 'well':{const cx=0,cy=Y+1.3*T;g.strokeStyle=OUT;g.lineWidth=5;g.lineCap='round';g.beginPath();for(const[a,b]of[[-.6,-.5],[.6,-.5],[-.6,.5],[.6,.5]]){g.moveTo(cx+a*T,cy+b*T);g.lineTo(cx+a*T*.7,cy)}g.stroke();g.strokeStyle='#7a5834';g.lineWidth=2.6;g.stroke();g.beginPath();g.arc(cx,cy-.1*T,T*.72,0,7);fs(g,'#8a6640',2);g.beginPath();g.arc(cx,cy-.1*T,T*.52,0,7);fs(g,'#5a8aa0',1.2);g.fillStyle='rgba(255,255,255,.3)';E(g,cx-5,cy-.25*T,7,3);g.fill();rr(g,X+.4*T,Y+2.3*T,T*4.2,T*.45,5);fs(g,'#7a5834',1.6);g.fillStyle='#5a8aa0';g.fillRect(X+.55*T,Y+2.38*T,T*3.9,T*.24);break}
    case 'stable':for(let k=0;k<4;k++){const sx=X+(.1+k*1.6)*T;g.strokeStyle=OUT;g.lineWidth=4;g.beginPath();g.moveTo(sx,Y+1.6*T);g.lineTo(sx,Y+2.9*T);g.stroke();g.strokeStyle='#8f6e46';g.lineWidth=2.2;g.stroke();if(k<3){rr(g,sx+6,Y+2.35*T,T*1.1,T*.38,3);fs(g,'#7a5834',1.3);g.fillStyle='#cdb560';g.fillRect(sx+9,Y+2.42*T,T*.9,T*.2)}}for(const[a,b]of[[.4,.8],[1.3,.9],[3.4,.8]]){rr(g,X+a*T,Y+b*T,T*.75,T*.55,3);fs(g,'#cdb560',1.4)}break;
    case 'bunk':{const beds=allBeds();for(const i of[0,1,3,4]){const[ax,ay]=wingCell(sl,side,i,1),idx=beds.findIndex(b=>b.x===ax&&b.y===ay),owner=S.cols[idx],bx=X+i*T,by=Y+T;rr(g,bx+3,by+3,T-6,T*2-6,4);fs(g,'#6e5132',1.8);rr(g,bx+6,by+T*.7,T-12,T*1.15,4);fs(g,owner?owner.shirt:'#6a7480',1.4);rr(g,bx+7,by+7,T-14,9,4);fs(g,'#ece8dc',1.2)}crateProp(g,X+2.15*T,Y+2.1*T,T*.7,'#8a6a48');break}
    case 'bath':for(const xx of[.2,3.1]){rr(g,X+xx*T,Y+1.4*T,T*1.7,T*1.3,10);fs(g,'#d8d0bc',1.8);rr(g,X+xx*T+5,Y+1.4*T+5,T*1.7-10,T*1.3-10,8);g.fillStyle='#6aa0c0';g.fill()}g.fillStyle='rgba(255,255,255,.14)';for(let k=0;k<4;k++){g.beginPath();g.arc(X+(1+k*1)*T,Y+(1.1+(k%2)*.3)*T,5+k,0,7);g.fill()}rr(g,X+2.05*T,Y+2.2*T,T*.9,T*.55,3);fs(g,'#7a5834',1.4);break;
    case 'rec':{rr(g,X+1.2*T,Y+1.05*T,T*2.6,T*1.5,6);fs(g,'#5a3a22',2);rr(g,X+1.4*T,Y+1.25*T,T*2.2,T*1.1,4);g.fillStyle='#3a7a4a';g.fill();for(const[a,b,c]of[[1.8,1.6,'#e8e2d0'],[2.6,1.8,'#c8382a'],[3,1.6,'#e8c040']]){g.beginPath();g.arc(X+a*T,Y+b*T,3.5,0,7);fs(g,c,1)}rr(g,X+.2*T,Y+1.9*T,T*.8,T*.8,3);fs(g,'#8a6640',1.6);g.fillStyle='#e8e2d0';g.fillRect(X+.28*T,Y+1.98*T,T*.3,T*.3);g.fillStyle='#2a2c2e';g.fillRect(X+.6*T,Y+2.3*T,T*.3,T*.3);break}
    case 'dock':shelfProp(g,X+3,Y+2.2*T,2*T-6,T*.7,['#b08a5a','#8a6a48']);crateProp(g,X+.3*T,Y+1.1*T,T*.75);crateProp(g,X+1.15*T,Y+1.2*T,T*.65,'#8a6a48');{const cx=X+3.7*T,cy=Y+1.8*T;rr(g,cx-T*.7,cy-T*.45,T*1.4,T*.9,4);fs(g,'#8a6640',1.8);for(const a of[-.45,.45]){g.beginPath();g.arc(cx+a*T,cy+T*.45,6,0,7);fs(g,'#4a3a28',1.4)}crateProp(g,cx-T*.35,cy-T*.4,T*.6)}break;
  }}
function drawLanesLive(){const ins=raidActive();for(const sl of laneCache){const l=S.lanes&&S.lanes[sl.key];
    if(!l){if(defMode||(hover&&laneAt(hover[0],hover[1])===sl)){rr(ctx,sl.x0*T+4,sl.y0*T+4,sl.w*T-8,sl.h*T-8,8);ctx.strokeStyle=hover&&laneAt(hover[0],hover[1])===sl?'rgba(243,231,160,.85)':'rgba(243,231,160,.3)';ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.stroke();ctx.setLineDash([]);if(defMode){ctx.fillStyle='rgba(243,231,160,.45)';ctx.font='700 16px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('+',(sl.x0+sl.w/2)*T,(sl.y0+sl.h/2)*T)}}continue}
    if(l.con||l.type!=='turret')continue;const[px2,py2]=lanePostPos(sl),cx=(px2+.5)*T,cy=(py2+.5)*T,a=l.ax!==undefined&&ins?Math.atan2(l.ay-py2-.5,l.ax-px2-.5):-Math.PI/2;
    drawTurretArt(ctx,cx,cy,a,ins&&(l.burst||0)>0,performance.now(),true)}}
function drawWingHints(){if(!sel||sel.k!=='plot'||defMode)return;const p0=plotById(sel.id);if(!p0||!p0.type||p0.small||!annexAvail(p0).length)return;const ids=new Set(connected(p0).map(q=>q.id));
  for(const sl of laneCache){if(S.lanes[sl.key]||!(ids.has(sl.a)||ids.has(sl.b)))continue;rr(ctx,sl.x0*T+3,sl.y0*T+3,sl.w*T-6,sl.h*T-6,6);ctx.fillStyle='rgba(243,231,160,.1)';ctx.fill();ctx.strokeStyle='rgba(243,231,160,.75)';ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.stroke();ctx.setLineDash([]);
    const tx=(sl.x0+sl.w/2)*T,ty=(sl.y0+sl.h/2)*T;ctx.font='700 11px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.strokeText('+ wing',tx,ty);ctx.fillStyle='#f3e7a0';ctx.fillText('+ wing',tx,ty)}}
function routePath(g,pts){
  g.beginPath();g.moveTo(pts[0][0]*T,pts[0][1]*T);
  for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i],c=pts[i+1];const r=Math.min(T*.9,Math.hypot(b[0]-a[0],b[1]-a[1])*T/2,Math.hypot(c[0]-b[0],c[1]-b[1])*T/2);g.arcTo(b[0]*T,b[1]*T,c[0]*T,c[1]*T,r)}
  const l=pts[pts.length-1];g.lineTo(l[0]*T,l[1]*T);
}
function drawRoads(g){const all=[];for(const r of routes)all.push(...routeRuns(r));for(let t=0;t<=2;t++)drawRoadSet(g,all.filter(x=>x.t===t),t)}
function drawOuterRoad(g,t){g.save();g.lineJoin='round';g.lineCap='round';const st=(w,c)=>{routePath(g,outerRoad);g.strokeStyle=c;g.lineWidth=w;g.stroke()};
  st(122,'rgba(70,52,30,.06)');st(100,'rgba(78,58,34,.09)');
  if(t===0){st(78,'rgba(104,80,50,.36)');st(64,'rgba(112,88,56,.3)');st(36,'rgba(70,52,30,.2)');st(26,'rgba(112,88,56,.32)');g.setLineDash([3,9]);st(5,'rgba(120,140,70,.2)');g.setLineDash([])}
  else drawRoadSet(g,[{pts:outerRoad}],t,3);
  g.restore()}
function drawRoadSet(g,rs,t,wm){
  g.lineJoin='round';
  {if(!rs.length)return;
    const w=[16,19,21][t]*(wm||1);
    g.lineCap=t===0?'round':'butt';
    for(const r of rs){routePath(g,r.pts);g.strokeStyle=t===0?'rgba(50,36,20,.35)':OUT;g.lineWidth=w+(t===0?6:4);g.setLineDash([]);g.stroke()}
    for(const r of rs){routePath(g,r.pts);g.strokeStyle=t===0?'#6d5436':t===1?'#8f6c45':'#8f8b84';g.lineWidth=w;g.stroke()}
    for(const r of rs){routePath(g,r.pts);
      if(t===0){g.strokeStyle='rgba(30,20,10,.22)';g.lineWidth=w*.55;g.setLineDash([2,9]);g.stroke();g.strokeStyle='rgba(200,170,120,.12)';g.lineWidth=w*.25;g.setLineDash([]);g.stroke()}
      else if(t===1){g.strokeStyle='rgba(45,26,10,.6)';g.lineWidth=w;g.setLineDash([2,6]);g.stroke();g.strokeStyle='rgba(255,220,170,.1)';g.lineWidth=w*.3;g.setLineDash([]);g.stroke()}
      else{g.strokeStyle='rgba(40,40,40,.35)';g.lineWidth=w;g.setLineDash([1.5,9]);g.stroke();g.lineWidth=1.2;g.setLineDash([]);g.stroke();g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=w*.7;g.setLineDash([7,4]);g.stroke()}
      g.setLineDash([]);
    }
  }
}
function floorTile(g,px,py,type,w,h){
  w=w||T;h=h||T;g.fillStyle=FLOOR[type];g.fillRect(px,py,w,h);
  if(type==='wood'||type==='woodl'){g.strokeStyle='rgba(40,25,10,.4)';g.lineWidth=1;for(let y=0;y<h;y+=8){g.beginPath();g.moveTo(px,py+y+.5);g.lineTo(px+w,py+y+.5);g.stroke();for(let x=((y/8)%4)*8;x<w;x+=32){g.beginPath();g.moveTo(px+x+.5,py+y);g.lineTo(px+x+.5,py+y+8);g.stroke()}}}
  else if(type==='stone'){g.strokeStyle='rgba(30,30,30,.3)';g.lineWidth=1;for(let y=0;y<h;y+=T/2){g.beginPath();g.moveTo(px,py+y);g.lineTo(px+w,py+y);g.stroke();for(let x=((y/(T/2))%2)*T/2;x<w;x+=T){g.beginPath();g.moveTo(px+x,py+y);g.lineTo(px+x,py+y+T/2);g.stroke()}}}
  else if(type==='metal'){g.strokeStyle='rgba(20,20,20,.3)';g.lineWidth=1;for(let y=0;y<h;y+=T)for(let x=0;x<w;x+=T)g.strokeRect(px+x+.5,py+y+.5,T-1,T-1)}
  else if(type==='soil'){g.strokeStyle='rgba(20,12,6,.4)';g.lineWidth=1.2;for(let y=6;y<h;y+=10){g.beginPath();g.moveTo(px+2,py+y);g.lineTo(px+w-2,py+y);g.stroke()}}
  else if(type==='grass'){g.strokeStyle='rgba(150,170,90,.45)';g.lineWidth=1.2;g.lineCap='round';for(let k=0;k<w*h/180;k++){const gx=px+((k*37)%w),gy=py+6+((k*53)%Math.max(1,h-6));g.beginPath();g.moveTo(gx,gy);g.lineTo(gx+2,gy-5);g.stroke()}}
}
function joinRect(p,pad){
  const[ox,oy]=plotOrigin(p),Rn=joined(p,1,0),Ln=joined(p,-1,0),Tn=joined(p,0,-1),Bn=joined(p,0,1);
  const x=ox*T+(Ln?0:pad),y=oy*T+(Tn?0:pad),x2=(ox+P+(Rn?GAP:0))*T-(Rn?0:pad),y2=(oy+P+(Bn?GAP:0))*T-(Bn?0:pad);
  const rad=10;return{x,y,w:x2-x,h:y2-y,radii:[(Ln||Tn)?0:rad,(Rn||Tn)?0:rad,(Rn||Bn)?0:rad,(Ln||Bn)?0:rad],Rn,Bn,Ln,Tn};
}
function fillJoined(g,p,type,pad,rounded,outline){
  const j=joinRect(p,pad);
  g.save();g.beginPath();if(rounded)g.roundRect(j.x,j.y,j.w,j.h,j.radii);else g.rect(j.x,j.y,j.w,j.h);g.clip();floorTile(g,j.x,j.y,type,j.w,j.h);g.restore();
  if(outline){g.beginPath();if(rounded)g.roundRect(j.x,j.y,j.w,j.h,j.radii);else g.rect(j.x,j.y,j.w,j.h);g.strokeStyle=outline;g.lineWidth=2;g.stroke()}
  return j;
}
function drawPlotBase(g,p){
  const[ox,oy]=plotOrigin(p),px=ox*T,py=oy*T,S5=P*T;
  if(!p.type&&p.con){rr(g,px+4,py+4,S5-8,S5-8,12);g.fillStyle='rgba(120,95,60,.35)';g.fill();g.strokeStyle='rgba(240,225,170,.55)';g.setLineDash([8,5]);g.lineWidth=2;g.stroke();g.setLineDash([]);for(let k=0;k<3;k++){rr(g,px+T*(1+k*.2),py+T*(3.6+k*.15),T*2.2,T*.2,3);fs(g,k%2?'#9a7448':'#b08a5a',1.2)}return}
  if(!p.type){if(!p.open)return;rr(g,px+4,py+4,S5-8,S5-8,12);g.strokeStyle='rgba(240,235,210,.22)';g.setLineDash([6,6]);g.lineWidth=1.5;g.stroke();g.setLineDash([]);return}
  const t=p.tier;
  switch(p.type){
    case 'housing':{
      const j=joinRect(p,0);floorTile(g,j.x,j.y,t===0?'dirt':t===1?'wood':'woodl',j.w,j.h);
      if(t===0){g.fillStyle='rgba(200,180,90,.25)';for(let k=0;k<26;k++)g.fillRect(j.x+((k*37)%j.w),j.y+((k*53)%j.h),5,1.5)}
      if(t===2){rr(g,px+T*1.3,py+T*2.1,T*2.4,T*.8,6);fs(g,'#7a3f36',1.5)}
      break;}
    case 'farm':
      if(t===0){const j=joinRect(p,4);rr(g,j.x,j.y,j.w,j.h,j.radii);g.save();g.clip();floorTile(g,j.x,j.y,'grass',j.w,j.h);g.restore();
        const Ln=same(p,-1,0),Tn=same(p,0,-1),sR=same(p,1,0),sB=same(p,0,1),x0=Ln?px:px+T*.5,y0=Tn?py:py+T*.5,x1=sR?px+G*T:px+4.5*T,y1=sB?py+G*T:py+4.5*T;
        g.save();rr(g,x0,y0,x1-x0,y1-y0,[Ln||Tn?0:8,sR||Tn?0:8,sR||sB?0:8,Ln||sB?0:8]);g.clip();floorTile(g,x0,y0,'soil',x1-x0,y1-y0);g.restore();
      }else fillJoined(g,p,'soil',3,true,'rgba(30,20,10,.45)');
      break;
    case 'hydro':fillJoined(g,p,'metal',2,false,'rgba(20,20,20,.5)');break;
    case 'pen':fillJoined(g,p,'grass',3,true);break;
    case 'treefarm':fillJoined(g,p,'grass',3,true,'rgba(30,40,20,.35)');break;
    case 'kitchen':case 'workshop':case 'tailor':case 'weaponsmith':case 'armorsmith':case 'hunting':case 'research':case 'quarry':case 'construction':case 'refinery':case 'munitions':case 'fabrication':{
      const fl=(p.type==='fabrication'||p.type==='munitions')?'metal':p.type==='refinery'?'stone':p.type==='quarry'||p.type==='hunting'||(p.type==='construction'&&t===0)?'dirt':p.type==='tailor'?'wood':(p.type==='weaponsmith'||p.type==='armorsmith')?(t===0?'dirt':'stone'):t===0?(p.type==='research'?'wood':'dirt'):p.type==='kitchen'?'stone':'wood';
      fillJoined(g,p,fl,2,fl==='dirt','rgba(20,14,8,.4)');break;}
    case 'commons':if(t===0)fillJoined(g,p,'grass',2,true,'rgba(20,14,8,.35)');else{const j=joinRect(p,0);floorTile(g,j.x,j.y,t===1?'wood':'stone',j.w,j.h)}break;
    case 'storage':if(t===0)fillJoined(g,p,'dirt',2,true,'rgba(225,180,90,.6)');else{const j=joinRect(p,0);floorTile(g,j.x,j.y,t===1?'wood':'stone',j.w,j.h)}break;
    case 'comms':fillJoined(g,p,'stone',2,false,'rgba(20,14,8,.4)');break;
    case 'solar':fillJoined(g,p,'dirt',2,true,'rgba(20,14,8,.35)');break;
    case 'burner':fillJoined(g,p,t?'stone':'dirt',2,!t,'rgba(20,14,8,.4)');break;
    case 'battery':fillJoined(g,p,'metal',2,false,'rgba(20,20,20,.5)');break;
    default:if(isAnnex(p))drawAnnexBase(g,p);
  }
}
function drawHouseWalls(g,p){
  const[ox,oy]=plotOrigin(p),sp=p,t=sp.tier,rid=region[ox+oy*W];
  const stone=sp.type==='housing'?t===2:t>=2,col=stone?'#8c877f':(sp.type==='housing'&&t===0)?'#7a5a3a':'#8f6e46',th=stone?6:5;
  const cells=[];for(let y=0;y<P;y++)for(let x=0;x<P;x++)cells.push([ox+x,oy+y]);for(const[x,y]of layouts[p.id].strip)cells.push([ox+x,oy+y]);for(const[x,y]of wingCells[p.id]||[])if(region[x+y*W]===rid)cells.push([x,y]);
  const segs=[];
  for(const[x,y]of cells){const i=x+y*W;
    for(const[dx,dy,side]of[[0,-1,'t'],[0,1,'b'],[-1,0,'l'],[1,0,'r']]){
      const nx=x+dx,ny=y+dy,ni=nx+ny*W;if(nx>=0&&ny>=0&&nx<W&&ny<H&&region[ni]===rid)continue;
      if(doorSet.has(i+','+ni))continue;
      const px=x*T,py=y*T;segs.push(side==='t'?[px,py,px+T,py]:side==='b'?[px,py+T,px+T,py+T]:side==='l'?[px,py,px,py+T]:[px+T,py,px+T,py+T]);
    }
  }
  g.lineCap='square';
  g.strokeStyle=OUT;g.lineWidth=th+3;g.beginPath();for(const s of segs){g.moveTo(s[0],s[1]);g.lineTo(s[2],s[3])}g.stroke();
  g.strokeStyle=col;g.lineWidth=th;g.stroke();
  if(!stone){g.strokeStyle='rgba(40,25,10,.35)';g.lineWidth=1;g.setLineDash([3,5]);g.stroke();g.setLineDash([])}
  const mine=new Set(cells.map(([x,y])=>x+y*W));
  for(const[a,b]of doorList){if(!mine.has(a))continue;const ax=a%W,ay=(a-ax)/W,bx=b%W,by=(b-bx)/W;g.fillStyle='rgba(40,28,16,.55)';
    if(ay!==by){const ey=Math.max(ay,by)*T;g.fillRect(ax*T+3,ey-1.5,T-6,3);doorSegs.push({key:a+','+b,hx:ax+3/T,hy:ey/T,base:0,sw:by>ay?-1:1,cx:ax+.5,cy:ey/T})}
    else{const ex=Math.max(ax,bx)*T;g.fillRect(ex-1.5,ay*T+3,3,T-6);doorSegs.push({key:a+','+b,hx:ex/T,hy:ay+3/T,base:Math.PI/2,sw:bx>ax?1:-1,cx:ex/T,cy:ay+.5})}}
}
function drawAnnexBase(g,p){const w=walled(p),q=annexParent(p),t=q?q.tier:0;
  if(p.type==='well'){fillJoined(g,p,'grass',3,true,'rgba(30,40,20,.35)');return}
  if(w){const j=joinRect(p,0);floorTile(g,j.x,j.y,p.type==='stable'?'dirt':p.type==='bath'||t>=2?'stone':'wood',j.w,j.h);return}
  fillJoined(g,p,p.type==='stable'||p.type==='granary'?'dirt':'wood',3,true,'rgba(20,14,8,.4)')}
function shelfProp(g,x,y,w,h,cols){rr(g,x,y,w,h,3);fs(g,'#6e5132',1.8);const n=Math.max(2,Math.floor(w/9));for(let k=0;k<n;k++){g.fillStyle=cols[k%cols.length];g.fillRect(x+3+k*(w-6)/n,y+3,(w-6)/n-2,h*.38);g.fillRect(x+3+((k+1)%n)*(w-6)/n,y+h*.52,(w-6)/n-2,h*.36)}}
function crateProp(g,x,y,s,c){rr(g,x,y,s,s,2);fs(g,c||'#9a7448',1.6);g.strokeStyle='rgba(40,25,10,.55)';g.lineWidth=1.2;g.beginPath();g.moveTo(x+2,y+2);g.lineTo(x+s-2,y+s-2);g.moveTo(x+s-2,y+2);g.lineTo(x+2,y+s-2);g.stroke()}
function sackProp(g,x,y,c){E(g,x,y,7,8);fs(g,c||'#c9b28a',1.4);g.strokeStyle='rgba(60,40,20,.6)';g.lineWidth=1.2;g.beginPath();g.moveTo(x-3,y-6);g.lineTo(x+3,y-6);g.stroke()}
function barrelProp(g,x,y){g.beginPath();g.arc(x,y,7.5,0,7);fs(g,'#7a5834',1.6);g.strokeStyle='#4a4f52';g.lineWidth=1.5;g.beginPath();g.arc(x,y,5,0,7);g.stroke()}
function drawAnnexProps(g,p){const[ox,oy]=plotOrigin(p),px=ox*T,py=oy*T,L=layouts[p.id];
  switch(p.type){
    case 'maproom':mapTableProp(g,px+2.5*T,py+2.5*T);break;
    case 'pantry':shelfProp(g,px+3,py+4,2*T-6,T-8,['#c9b28a','#a8643a','#d8c070']);shelfProp(g,px+3*T+3,py+4,2*T-6,T-8,['#e8e2d0','#8a6a48','#c9a640']);for(const[a,b]of[[.6,3.6],[1,3.9],[.5,4.3]])sackProp(g,px+a*T,py+b*T);barrelProp(g,px+4.2*T,py+3.8*T);barrelProp(g,px+4.4*T,py+4.4*T);break;
    case 'supply':shelfProp(g,px+3,py+4,2*T-6,T-8,['#b08a5a','#9aa0a4','#8a6640']);shelfProp(g,px+3*T+3,py+4,2*T-6,T-8,['#9aa0a4','#b08a5a','#6d7377']);crateProp(g,px+.3*T,py+3.3*T,T*.8);crateProp(g,px+1.2*T,py+3.5*T,T*.7,'#8a6a48');for(let k=0;k<3;k++){rr(g,px+3.1*T,py+(3.2+k*.25)*T,T*1.6,T*.18,3);fs(g,k%2?'#9a7448':'#b08a5a',1.2)}break;
    case 'library':for(const yy of[0,2])for(const xx of[0,3])shelfProp(g,px+xx*T+3,py+yy*T+4,2*T-6,T-8,['#7a3f36','#3d5a6e','#6e7a3a','#c9a640','#5a4a6e']);rr(g,px+1.6*T,py+3.4*T,T*1.8,T*.9,4);fs(g,'#8a6640',1.8);g.fillStyle='#e8e2d0';g.fillRect(px+1.9*T,py+3.6*T,10,7);g.fillRect(px+2.6*T,py+3.65*T,9,6);break;
    case 'granary':{const cx=px+4*T,cy=py+T;g.beginPath();g.arc(cx,cy,T*.95,0,7);fs(g,'#b8a478',2);g.strokeStyle='rgba(60,40,20,.35)';g.lineWidth=1;for(let r=8;r<T*.9;r+=7){g.beginPath();g.arc(cx,cy,r,0,7);g.stroke()}g.beginPath();g.arc(cx,cy,6,0,7);fs(g,'#8a7a50',1.2);for(const[a,b]of[[.6,.7],[1.1,.9],[.7,1.4],[1.4,1.5],[.5,3.6],[1,3.8],[1.6,3.6],[.8,4.3]])sackProp(g,px+a*T,py+b*T,'#d8c890');break}
    case 'well':{const cx=px+2.5*T,cy=py+1.6*T;g.fillStyle='rgba(0,0,0,.18)';E(g,cx+6,cy+T*.9,T*1.1,T*.35);g.fill();g.strokeStyle=OUT;g.lineWidth=5;g.lineCap='round';g.beginPath();for(const[a,b]of[[-.7,-.3],[.7,-.3],[-.7,.9],[.7,.9]]){g.moveTo(cx+a*T,cy+b*T);g.lineTo(cx+a*T*.8,cy-.1*T)}g.stroke();g.strokeStyle='#7a5834';g.lineWidth=2.6;g.stroke();g.beginPath();g.arc(cx,cy-.15*T,T*.85,0,7);fs(g,'#8a6640',2);g.beginPath();g.arc(cx,cy-.15*T,T*.62,0,7);fs(g,'#5a8aa0',1.2);g.fillStyle='rgba(255,255,255,.3)';E(g,cx-6,cy-.3*T,8,3);g.fill();
      rr(g,px+.6*T,py+3.7*T,T*3.8,T*.5,5);fs(g,'#7a5834',1.6);g.fillStyle='#5a8aa0';g.fillRect(px+.75*T,py+3.8*T,T*3.5,T*.28);g.strokeStyle='rgba(90,150,200,.5)';g.lineWidth=3;g.beginPath();g.moveTo(cx,cy+T*.7);g.lineTo(cx,py+3.7*T);g.stroke();break}
    case 'stable':for(let k=0;k<3;k++){const sx=px+(.15+k*1.6)*T;g.strokeStyle=OUT;g.lineWidth=4;g.beginPath();g.moveTo(sx,py+.2*T);g.lineTo(sx,py+2*T);g.stroke();g.strokeStyle='#8f6e46';g.lineWidth=2.2;g.stroke();rr(g,sx+5,py+1.4*T,T*1.1,T*.4,3);fs(g,'#7a5834',1.3);g.fillStyle='#cdb560';g.fillRect(sx+8,py+1.47*T,T*.9,T*.22)}
      for(const[a,b]of[[.4,3.4],[1.2,3.5],[.8,4.2]]){rr(g,px+a*T,py+b*T,T*.75,T*.55,3);fs(g,'#cdb560',1.4);g.strokeStyle='rgba(120,90,30,.6)';g.lineWidth=1;g.beginPath();g.moveTo(px+a*T+3,py+b*T+T*.27);g.lineTo(px+a*T+T*.72,py+b*T+T*.27);g.stroke()}break;
    case 'bunk':{const beds=allBeds();for(const[x,y]of L.beds){const bx=px+x*T,by=py+y*T,idx=beds.findIndex(b=>b.x===ox+x&&b.y===oy+y),owner=S.cols[idx];rr(g,bx+3,by+3,T-6,T*2-6,4);fs(g,'#6e5132',1.8);rr(g,bx+6,by+T*.7,T-12,T*1.15,4);fs(g,owner?owner.shirt:'#6a7480',1.4);rr(g,bx+7,by+7,T-14,9,4);fs(g,'#ece8dc',1.2)}crateProp(g,px+2.1*T,py+.3*T,T*.8,'#8a6a48');break}
    case 'bath':for(const xx of[0,4]){const bx=px+xx*T;rr(g,bx+3,py+3,T-6,T-6,8);fs(g,'#d8d0bc',1.8);rr(g,bx+7,py+7,T-14,T-14,6);g.fillStyle='#6aa0c0';g.fill()}rr(g,px+1.5*T,py+3.5*T,T*2,T*.7,4);fs(g,'#7a5834',1.5);for(let k=0;k<3;k++){g.fillStyle=['#e8e2d0','#c9a640','#8aa6c0'][k];g.fillRect(px+1.7*T+k*20,py+3.62*T,14,T*.45)}g.fillStyle='rgba(255,255,255,.12)';for(let k=0;k<5;k++){g.beginPath();g.arc(px+(1+k*.7)*T,py+(1.2+(k%2)*.4)*T,6+k,0,7);g.fill()}break;
    case 'rec':{rr(g,px+1.2*T,py+.6*T,T*2.6,T*1.5,6);fs(g,'#5a3a22',2);rr(g,px+1.4*T,py+.8*T,T*2.2,T*1.1,4);g.fillStyle='#3a7a4a';g.fill();for(const[a,b,c]of[[1.8,1.1,'#e8e2d0'],[2.6,1.3,'#c8382a'],[3,1.1,'#e8c040']]){g.beginPath();g.arc(px+a*T,py+b*T,3.5,0,7);fs(g,c,1)}rr(g,px+.8*T,py+2.8*T,T*3.4,T*1.6,10);g.fillStyle='rgba(140,60,50,.45)';g.fill();rr(g,px+.4*T,py+3.4*T,T*.9,T*.9,3);fs(g,'#8a6640',1.6);g.fillStyle='#e8e2d0';g.fillRect(px+.5*T,py+3.5*T,T*.35,T*.35);g.fillStyle='#2a2c2e';g.fillRect(px+.85*T,py+3.85*T,T*.35,T*.35);break}
    case 'dock':shelfProp(g,px+3,py+4,2*T-6,T-8,['#b08a5a','#8a6a48']);shelfProp(g,px+3*T+3,py+4,2*T-6,T-8,['#9a7448','#b08a5a']);crateProp(g,px+.4*T,py+2.2*T,T*.8);crateProp(g,px+1.3*T,py+2.3*T,T*.7,'#8a6a48');crateProp(g,px+.6*T,py+3.1*T,T*.75);{const cx=px+3.6*T,cy=py+3.3*T;rr(g,cx-T*.7,cy-T*.45,T*1.4,T*.9,4);fs(g,'#8a6640',1.8);for(const a of[-.45,.45]){g.beginPath();g.arc(cx+a*T,cy+T*.45,6,0,7);fs(g,'#4a3a28',1.4)}crateProp(g,cx-T*.4,cy-T*.4,T*.6)}break;
  }
  if(!annexParent(p)){g.save();g.font='700 11px Arimo, Arial, sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText('not attached',px+2.5*T,py+2.6*T);g.fillStyle='#e8a070';g.fillText('not attached',px+2.5*T,py+2.6*T);g.restore()}
}
function rackProp(g,x,y){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x+5,y+T-7,T-8,4);rr(g,x+3,y+4,T-6,T-9,2);fs(g,'#7a5834',1.6);g.strokeStyle='rgba(40,25,10,.55)';g.lineWidth=1.2;for(const k of[.36,.66]){g.beginPath();g.moveTo(x+4,y+T*k);g.lineTo(x+T-4,y+T*k);g.stroke()}g.fillStyle='#5a3e22';g.fillRect(x+3,y+4,2,T-9);g.fillRect(x+T-5,y+4,2,T-9)}
function drawPlotProps(g,p){
  if(!p.type)return;
  if(isAnnex(p)){drawAnnexProps(g,p);return}
  const[ox,oy]=plotOrigin(p),px=ox*T,py=oy*T,S5=P*T,L=layouts[p.id],t=p.tier;
  if(L&&L.rack&&p.type!=='kitchen')for(const[x,y]of L.rack)rackProp(g,px+x*T,py+y*T);
  if(L&&CRAFT_TYPES.concat(['research','hunting','construction']).includes(p.type))plotDecor(g,p,px,py,L,t);
  switch(p.type){
    case 'housing':{
      const beds=allBeds();
      L.beds.forEach(([x,y])=>{
        const bx=px+x*T,by=py+y*T,idx=beds.findIndex(b=>b.x===ox+x&&b.y===oy+y),owner=S.cols[idx];
        if(t===0){rr(g,bx+5,by+4,T-10,T*2-10,7);fs(g,owner?owner.shirt:'#6f6a5e',1.5);E(g,bx+T/2,by+11,8,4.5);fs(g,'#d8d0bc',1.2)}
        else{rr(g,bx+3,by+3,T-6,T*2-6,4);fs(g,t===2?'#8a6a48':'#6e5132',1.8);rr(g,bx+6,by+T*.7,T-12,T*1.15,4);fs(g,owner?owner.shirt:'#6a7480',1.4);rr(g,bx+7,by+7,T-14,9,4);fs(g,'#ece8dc',1.2)}
      });
      break;}
    case 'farm':{
      if(t>=1){g.strokeStyle='rgba(90,150,200,.55)';g.lineWidth=3;g.lineCap='round';for(let y=0;y<P;y++){g.beginPath();g.moveTo(px+5,py+y*T+T-3);g.lineTo(px+S5-5,py+y*T+T-3);g.stroke()}g.strokeStyle='rgba(170,215,240,.45)';g.lineWidth=1;g.stroke()}
      if(t===2){const cx=px+2.5*T,cy=py+2.5*T;g.strokeStyle=OUT;g.lineWidth=4;g.beginPath();g.moveTo(cx,cy+12);g.lineTo(cx,cy-10);g.moveTo(cx-11,cy-4);g.lineTo(cx+11,cy-4);g.stroke();g.strokeStyle='#8a6440';g.lineWidth=2.2;g.stroke();g.beginPath();g.arc(cx,cy-12,5,0,7);fs(g,'#d8c08a',1.3);g.beginPath();g.moveTo(cx-8,cy-14);g.lineTo(cx+8,cy-14);g.lineTo(cx,cy-21);g.closePath();fs(g,'#b8942a',1.2);rr(g,cx-6,cy-6,12,10,2);fs(g,'#7a5a8a',1.2)}
      if(t>=2){const j=joinRect(p,3),fc='#9a7a4e';g.strokeStyle=OUT;g.lineWidth=5;g.beginPath();g.roundRect(j.x,j.y,j.w,j.h,j.radii);g.stroke();g.strokeStyle=fc;g.lineWidth=2.4;g.stroke();const n=Math.round(j.w/T);for(let k=0;k<=n;k++){for(const yy of[j.y,j.y+j.h]){rr(g,j.x+j.w*k/n-3,yy-3,6,6,2);fs(g,'#6e5132',1.2)}}}
      if(t===3){const cx=px+2.5*T,cy=py+2.5*T;E(g,cx,cy,T*.36,T*.36);fs(g,'#7d8388',2);E(g,cx,cy,T*.13,T*.13);fs(g,'#5c86a8',1.5);g.strokeStyle='rgba(120,180,230,.35)';g.lineWidth=1;g.lineCap='round';for(let k=0;k<8;k++){const a=k/8*Math.PI*2;g.beginPath();g.moveTo(cx+Math.cos(a)*T*.45,cy+Math.sin(a)*T*.45);g.lineTo(cx+Math.cos(a)*T*1.1,cy+Math.sin(a)*T*1.1);g.stroke()}}
      break;}
    case 'hydro':hydroPipes(g,L.crops,px,py);for(const[x,y]of L.crops)hydroBasin(g,px+x*T,py+y*T,t);g.fillStyle='rgba(230,140,240,.06)';g.fillRect(px,py,S5,S5);break;
    case 'pen':{
      if(t>=1){rr(g,px+3.3*T,py+3.9*T,T*1.4,T*.8,5);fs(g,'#7a5a36',1.6);rr(g,px+3.4*T,py+4*T,T*1.2,T*.5,4);g.fillStyle='#cdb560';g.fill()}
      if(t===2){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(px+7,py+9,T*2,T*1.7);rr(g,px+4,py+4,T*2,T*1.6,3);fs(g,'#8a3f2c',2);g.strokeStyle='rgba(40,15,8,.5)';g.lineWidth=1;for(let k=1;k<5;k++){g.beginPath();g.moveTo(px+4,py+4+k*T*.32);g.lineTo(px+4+T*2,py+4+k*T*.32);g.stroke()}}
      const fc=t===0?'#8f6e46':t===1?'#9a7a4e':'#a0805a',j=joinRect(p,3);
      const seg=(x1,y1,x2,y2,gate)=>{g.lineCap='round';const draw=(a,b,c,d)=>{g.strokeStyle=OUT;g.lineWidth=5;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();g.strokeStyle=fc;g.lineWidth=2.6;g.stroke()};
        if(gate){const mx=px+2.5*T;draw(x1,y1,mx-T*.55,y2);draw(mx+T*.55,y1,x2,y2)}else draw(x1,y1,x2,y2);
        const n=Math.max(1,Math.round(Math.hypot(x2-x1,y2-y1)/T));for(let k=0;k<=n;k++){const qx=x1+(x2-x1)*k/n,qy=y1+(y2-y1)*k/n;if(gate&&Math.abs(qx-(px+2.5*T))<T*.6)continue;rr(g,qx-3.5,qy-3.5,7,7,2);fs(g,'#6e5132',1.4)}};
      const x0=px+3,y0=py+3,x1=px+S5-3,y1=py+S5-3;
      if(!j.Tn)seg(j.Ln?px:x0,y0,j.Rn?px+G*T:x1,y0);
      if(!j.Bn)seg(j.Ln?px:x0,y1,j.Rn?px+G*T:x1,y1,true);
      if(!j.Ln)seg(x0,j.Tn?py:y0,x0,j.Bn?py+G*T:y1);
      if(!j.Rn)seg(x1,j.Tn?py:y0,x1,j.Bn?py+G*T:y1);
      break;}
    case 'treefarm':for(const[x,y]of L.crops)treeMound(g,px+x*T+T/2,py+y*T+T*.72,t,x*7+y*13);break;
    case 'kitchen':case 'workshop':case 'tailor':case 'weaponsmith':case 'armorsmith':case 'hunting':case 'research':case 'quarry':case 'construction':case 'refinery':case 'munitions':case 'fabrication':{
      if(p.type==='construction'){for(let k=0;k<3;k++){rr(g,px+(.3+k*.25)*T,py+(3.4+k*.12)*T,T*2.2,T*.22,3);fs(g,k%2?'#9a7448':'#b08a5a',1.3)}g.beginPath();g.rect(px+3.3*T,py+3.3*T,T*1.2,T*1.2);fs(g,'#8a857c',1.8);g.fillStyle='rgba(255,255,255,.15)';g.fillRect(px+3.4*T,py+3.4*T,T,4)}
      if(p.type==='hunting'){for(let k=0;k<2;k++){const rx=px+(.3+k*1.3)*T,ry=py+3.3*T;g.strokeStyle=OUT;g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(rx,ry);g.lineTo(rx,ry+T*1.4);g.moveTo(rx+T*1.1,ry);g.lineTo(rx+T*1.1,ry+T*1.4);g.moveTo(rx-3,ry+3);g.lineTo(rx+T*1.1+3,ry+3);g.stroke();g.strokeStyle='#7a5834';g.lineWidth=2.2;g.stroke();g.beginPath();g.moveTo(rx+4,ry+5);g.quadraticCurveTo(rx+T*.55,ry+T*.3,rx+T*1.05,ry+5);g.lineTo(rx+T*.95,ry+T*1.1);g.quadraticCurveTo(rx+T*.55,ry+T*1.25,rx+T*.15,ry+T*1.1);g.closePath();fs(g,k?'#9a6a42':'#b08a5a',1.4)}}
      if(p.type==='quarry'){const cx=px+2.5*T,cy=py+3*T;E(g,cx,cy,T*1.8,T*1.2);fs(g,'#5f5a52',2);E(g,cx,cy+4,T*1.3,T*.8);fs(g,'#4a463f',1.5);g.fillStyle='rgba(255,255,255,.1)';for(let k=0;k<6;k++)g.fillRect(cx-T+((k*23)%(2*T)),cy-10+((k*17)%20),5,3)}
      for(const[x,y]of L.stations){
        const bx=px+x*T,by=py+y*T;if(drawStation(g,p,bx,by,t))continue;
        if(p.type==='kitchen'){
          if(t===0){const cx=bx+T/2,cy=by+T/2;g.fillStyle='rgba(30,20,12,.35)';E(g,cx,cy,T*.9,T*.7);g.fill();for(let k=0;k<10;k++){const a=k/10*Math.PI*2;g.beginPath();g.arc(cx+Math.cos(a)*15,cy+Math.sin(a)*13,4.5,0,7);fs(g,k%2?'#7d786f':'#8a857c',1.2)}g.strokeStyle=OUT;g.lineWidth=3.5;g.lineCap='round';g.beginPath();g.moveTo(cx-20,cy+10);g.lineTo(cx-16,cy-16);g.moveTo(cx+20,cy+10);g.lineTo(cx+16,cy-16);g.moveTo(cx-18,cy-14);g.lineTo(cx+18,cy-14);g.stroke();g.strokeStyle='#6e5132';g.lineWidth=2;g.stroke();E(g,cx,cy-6,7,5);fs(g,'#3f4245',1.4);g.beginPath();g.arc(cx,cy+3,6,0,7);fs(g,'#e08a3a',1);g.fillStyle='#f3d070';g.beginPath();g.arc(bx+T/2,by+T/2,3,0,7);g.fill()}
          else{rr(g,bx+2,by+2,T-4,T-4,3);fs(g,'#3f4245',2);for(const[a,b]of[[10,10],[22,10],[10,22],[22,22]]){g.beginPath();g.arc(bx+a,by+b,4,0,7);fs(g,'#26282a',1)}g.fillStyle='#c9a640';g.fillRect(bx+6,by+T-6,T-12,2)}
        }else if(p.type==='workshop'){
          if(t===0){rr(g,bx+3,by+3,T-6,T-6,6);g.strokeStyle='rgba(240,230,190,.6)';g.lineWidth=2;g.setLineDash([4,3]);g.stroke();g.setLineDash([]);E(g,bx+T/2,by+T/2,7,5);fs(g,'#a8643a',1.2)}
          else{g.beginPath();g.rect(bx+1,by+4,T-2,T-8);fs(g,'#8a6640',2);rr(g,bx+6,by+9,8,4,1);fs(g,'#9aa0a4',1);E(g,bx+22,by+16,5,4);fs(g,'#a8643a',1)}
        }else if(p.type==='tailor'){
          g.beginPath();g.rect(bx+1,by+4,T-2,T-8);fs(g,'#8a6640',2);rr(g,bx+4,by+8,14,9,3);fs(g,t>=1?'#5a6f80':'#c9b28a',1.2);g.beginPath();g.arc(bx+24,by+12,3.5,0,7);fs(g,'#a8643a',1);g.beginPath();g.arc(bx+24,by+21,3.5,0,7);fs(g,'#e8e2d0',1);
        }else if(p.type==='weaponsmith'||p.type==='armorsmith'){
          g.beginPath();g.moveTo(bx+5,by+12);g.lineTo(bx+27,by+12);g.lineTo(bx+23,by+18);g.lineTo(bx+20,by+18);g.lineTo(bx+20,by+26);g.lineTo(bx+12,by+26);g.lineTo(bx+12,by+18);g.lineTo(bx+9,by+18);g.closePath();fs(g,'#4f5357',2);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(bx+8,by+13,16,2);
          if(p.type==='armorsmith'){E(g,bx+T*.82,by+4,5,4);fs(g,'#9aa0a6',1.2)}
        }else if(p.type==='refinery'){
          E(g,bx+T/2,by+T*.45,T*.4,T*.4);fs(g,'#7a8086',2);E(g,bx+T/2,by+T*.45,T*.24,T*.24);fs(g,'#b8322a',1.2);g.strokeStyle=OUT;g.lineWidth=3;g.beginPath();g.moveTo(bx+T*.9,by+T*.45);g.lineTo(bx+T*1.15,by+T*.45);g.stroke();g.strokeStyle='#9aa0a4';g.lineWidth=1.6;g.stroke();
        }else if(p.type==='munitions'){
          g.beginPath();g.rect(bx+1,by+4,T-2,T-8);fs(g,'#5f6448',2);for(let k=0;k<3;k++){rr(g,bx+5+k*8,by+8,5,12,1);fs(g,'#c9a640',1)}
        }else if(p.type==='fabrication'){
          rr(g,bx+1,by+2,T-2,T-4,3);fs(g,'#4f5357',2);g.fillStyle='#7fe0d0';g.fillRect(bx+6,by+6,T-12,7);g.fillStyle='#d8b04a';g.fillRect(bx+6,by+T-10,5,4);g.fillStyle='#8fc46a';g.fillRect(bx+13,by+T-10,5,4);
        }else if(p.type==='construction'){
          g.strokeStyle=OUT;g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(bx+5,by+T-4);g.lineTo(bx+10,by+8);g.moveTo(bx+T-5,by+T-4);g.lineTo(bx+T-10,by+8);g.stroke();g.strokeStyle='#8a6440';g.lineWidth=2.2;g.stroke();rr(g,bx+2,by+7,T-4,7,2);fs(g,'#b08a5a',1.4);g.strokeStyle='#6f7478';g.lineWidth=2.5;g.beginPath();g.moveTo(bx+T*.6,by+5);g.lineTo(bx+T*.85,by+17);g.stroke();rr(g,bx+T*.5,by+2,T*.25,6,1);fs(g,'#5f6468',1)
        }else if(p.type==='hunting'){
          g.beginPath();g.rect(bx+1,by+5,T-2,T-10);fs(g,'#8a6640',2);g.fillStyle='rgba(150,60,50,.35)';E(g,bx+T/2,by+T/2,8,4);g.fill();g.strokeStyle='#c9ced3';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(bx+6,by+10);g.lineTo(bx+13,by+13);g.stroke();
        }else if(p.type==='research'){
          g.beginPath();g.rect(bx+1,by+4,T-2,T-8);fs(g,'#9a7a52',2);g.save();g.translate(bx+11,by+15);g.rotate(-.15);g.fillStyle='#efeadc';g.fillRect(-6,-5,12,10);g.strokeStyle=OUT;g.lineWidth=1;g.strokeRect(-6,-5,12,10);g.restore();
          if(t>=1){rr(g,bx+19,by+8,8,7,2);fs(g,'#4a5a6a',1.2)}
        }else{g.beginPath();for(let k=0;k<7;k++){const a=k/7*Math.PI*2,q=T*(.36+((k*13)%5)*.03);g.lineTo(bx+T/2+Math.cos(a)*q,by+T/2+Math.sin(a)*q*.85)}g.closePath();fs(g,'#8a857c',2);g.strokeStyle='rgba(30,30,30,.5)';g.lineWidth=1;g.beginPath();g.moveTo(bx+8,by+12);g.lineTo(bx+20,by+18);g.stroke()}
      }
      if(p.type==='research'&&t>=1){for(let x=0;x<P;x++){const bx=px+x*T,by=py+4*T;g.beginPath();g.rect(bx+2,by+16,T-4,T-18);fs(g,'#6e5132',1.5);for(let k=0;k<4;k++){g.fillStyle=['#7a3f36','#3f5a6e','#5f7a3a','#b08a3a'][k];g.fillRect(bx+5+k*6,by+18,4,10)}}}
      if(p.type==='kitchen'&&t>=1){rr(g,px+1.2*T,py+3.3*T,2.6*T,T*1.1,4);fs(g,'#8a6640',2)}
      if(p.type==='kitchen'){for(const[x,y]of L.store){const bx=px+x*T,by=py+y*T;if(t===0){E(g,bx+T/2,by+T*.55,T*.38,T*.3);fs(g,'#b08a5a',1.5);g.strokeStyle='rgba(80,55,25,.6)';g.lineWidth=1;g.beginPath();g.ellipse(bx+T/2,by+T*.55,T*.26,T*.18,0,0,7);g.stroke()}else{g.beginPath();g.rect(bx+3,by+3,T-6,T-6);fs(g,'#7a5834',1.6);g.strokeStyle='rgba(40,24,10,.5)';g.lineWidth=1;g.beginPath();g.moveTo(bx+3,by+T/2);g.lineTo(bx+T-3,by+T/2);g.stroke()}}
        if(t===0){for(const[x,y]of[[1,2],[3,2]]){const bx=px+x*T,by=py+y*T;rr(g,bx+6,by+8,T-12,T-16,5);fs(g,'#8a6440',1.4);g.fillStyle='rgba(201,160,106,.7)';E(g,bx+T/2,by+T/2-1,T*.22,3);g.fill()}
          const rx=px+1.1*T,ry=py+.25*T;g.strokeStyle=OUT;g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(rx,ry+T*.9);g.lineTo(rx,ry);g.moveTo(rx+T*2.8,ry+T*.9);g.lineTo(rx+T*2.8,ry);g.moveTo(rx-2,ry+3);g.lineTo(rx+T*2.8+2,ry+3);g.stroke();g.strokeStyle='#7a5834';g.lineWidth=1.8;g.stroke();
          for(let k=0;k<5;k++){const hx=rx+12+k*T*.5;g.strokeStyle='rgba(60,40,20,.8)';g.lineWidth=1;g.beginPath();g.moveTo(hx,ry+3);g.lineTo(hx,ry+9);g.stroke();E(g,hx,ry+15,4,7);fs(g,k%2?'#a8443a':'#8a5a2a',1)}
          const cbx=px+4*T,cby=py+2*T;E(g,cbx+T/2,cby+T/2,T*.3,T*.26);fs(g,'#9a7448',1.5);g.fillStyle='rgba(200,170,120,.6)';E(g,cbx+T/2,cby+T/2-2,T*.2,T*.14);g.fill();g.strokeStyle='#c9ced3';g.lineWidth=2;g.beginPath();g.moveTo(cbx+T*.45,cby+T*.4);g.lineTo(cbx+T*.62,cby+T*.25);g.stroke()}}
      if(p.type==='weaponsmith'||p.type==='armorsmith'){const fx=px+3.6*T,fy=py+3.4*T;rr(g,fx,fy,T*1.2,T*1.2,4);fs(g,'#5f5a52',2);rr(g,fx+6,fy+6,T*1.2-12,T*1.2-12,3);fs(g,'#e08a3a',1.2);g.fillStyle='#f3d070';g.beginPath();g.arc(fx+T*.6,fy+T*.6,4,0,7);g.fill();if(p.type==='armorsmith'){const mx=px+.6*T,my=py+3.5*T;g.strokeStyle=OUT;g.lineWidth=3;g.beginPath();g.moveTo(mx+T*.4,my+T*1.3);g.lineTo(mx+T*.4,my+T*.4);g.stroke();rr(g,mx+T*.1,my+T*.3,T*.6,T*.6,5);fs(g,'#9aa0a6',1.5);g.beginPath();g.arc(mx+T*.4,my+T*.2,T*.15,0,7);fs(g,'#8a8f94',1.2)}}
      if(p.type==='tailor'&&t>=1){const rx=px+.5*T,ry=py+3.55*T;woodTop(g,rx,ry,T*4,T*.95,'#7a5834');for(let k=0;k<6;k++){const c=['#a8643a','#f3f1ea','#5a6f80','#8a6aa0','#c9a640','#6b7f4a'][k],x=rx+6+k*T*.62;rr(g,x,ry+4,T*.5,T*.75,4);const gr=g.createLinearGradient(x,0,x+T*.5,0);gr.addColorStop(0,shadeHex(c,.8));gr.addColorStop(.45,shadeHex(c,1.15));gr.addColorStop(1,shadeHex(c,.75));g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=.7;g.beginPath();g.moveTo(x+2,ry+T*.45);g.lineTo(x+T*.5-2,ry+T*.45);g.stroke()}}
      if(p.type==='quarry'&&t>=1){g.beginPath();g.rect(px+3.6*T,py+3.4*T,T*1.2,T*1.2);fs(g,'#6f6a63',2);g.fillStyle='#c9a640';g.fillRect(px+3.7*T,py+3.9*T,T,3)}
      break;}
    case 'commons':{
      if(t===0){const cx=px+2.5*T,cy=py+2.5*T;for(let k=0;k<8;k++){const a=k/8*Math.PI*2;g.beginPath();g.arc(cx+Math.cos(a)*13,cy+Math.sin(a)*13,4.5,0,7);fs(g,'#7d786f',1.2)}g.beginPath();g.arc(cx,cy,7,0,7);fs(g,'#e08a3a',1);g.fillStyle='#f3d070';g.beginPath();g.arc(cx,cy,3.5,0,7);g.fill();
        for(const[x,y]of L.seats){E(g,px+x*T+T/2,py+y*T+T/2,9,6);fs(g,'#8a6440',1.4);E(g,px+x*T+T/2,py+y*T+T/2-1,6,3.5);fs(g,'#c9a06a',1)}}
      else{for(const[x,y]of L.block){rr(g,px+x*T+2,py+y*T+3,T-4,T-6,3);fs(g,t===1?'#8a6640':'#7a6a5a',2)}for(const[x,y]of L.seats){rr(g,px+x*T+9,py+y*T+9,T-18,T-18,4);fs(g,'#6e5132',1.3)}}
      for(const[x,y]of L.store){rr(g,px+x*T+3,py+y*T+3,T-6,T-6,t===0?6:2);g.strokeStyle='rgba(225,180,90,.5)';g.lineWidth=1.5;g.stroke()}
      break;}
    case 'storage':
      if(t>=1)for(const[x,y]of L.store){g.strokeStyle='rgba(60,40,20,.5)';g.lineWidth=2;g.strokeRect(px+x*T+3,py+y*T+3,T-6,T-6)}
      break;
    case 'solar':{const n=t===0?2:t===1?4:t===2?6:8;for(let k=0;k<n;k++){const col=k%2,row=Math.floor(k/2),x0=px+(.3+col*2.3)*T,y0=py+(.3+row*(4.4/Math.ceil(n/2)))*T,ww=T*2.1,hh=T*(4.4/Math.ceil(n/2))-6;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x0+4,y0+5,ww,hh);rr(g,x0,y0,ww,hh,2);fs(g,'#26405a',1.6);g.strokeStyle='rgba(140,190,230,.35)';g.lineWidth=1;g.beginPath();for(let m=1;m<4;m++){g.moveTo(x0+ww*m/4,y0);g.lineTo(x0+ww*m/4,y0+hh)}g.moveTo(x0,y0+hh/2);g.lineTo(x0+ww,y0+hh/2);g.stroke();g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x0+2,y0+2,ww*.4,3)}break}
    case 'burner':{const n=t>=2?2:1;for(let k=0;k<n;k++){const x0=px+(.6+k*2.1)*T,y0=py+.8*T;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x0+5,y0+6,T*1.8,T*2);rr(g,x0,y0,T*1.8,T*2,4);fs(g,'#5f5a52',2);rr(g,x0+8,y0+T*1.1,T*1.8-16,T*.6,3);fs(g,'#e08a3a',1.2);g.fillStyle='#f3d070';g.fillRect(x0+12,y0+T*1.25,T*1.8-24,4);g.beginPath();g.arc(x0+T*1.4,y0+8,6,0,7);fs(g,'#3a3d40',1.4)}
      for(let k=0;k<4;k++){rr(g,px+(.6+k*.25)*T,py+(3.5+k*.15)*T,T*2.4,T*.22,3);fs(g,k%2?'#8a5f36':'#9a6a3a',1.2)}break}
    case 'battery':{const n=t+2;for(let k=0;k<n;k++){const x0=px+(.4+(k%3)*1.5)*T,y0=py+(.5+Math.floor(k/3)*2.2)*T;rr(g,x0,y0,T*1.2,T*1.7,4);fs(g,'#3f4447',2);rr(g,x0+5,y0+6,T*1.2-10,T*1.7-12,2);fs(g,'#1e2124',1);g.fillStyle='#8fc46a';g.fillRect(x0+8,y0+T*.9,T*1.2-16,T*.6);rr(g,x0+T*.4,y0-4,T*.4,6,2);fs(g,'#9aa0a4',1)}break}
    case 'comms':{
      const qx=px+1.9*T,qy=py+1.9*T,qs=T*3;g.fillStyle='#7d7a74';g.fillRect(qx,qy,qs,qs);g.strokeStyle=OUT;g.lineWidth=2;g.strokeRect(qx,qy,qs,qs);
      g.save();g.beginPath();g.rect(qx,qy,qs,qs);g.clip();for(let k=-6;k<12;k++){g.fillStyle=k%2?'#2a2a2a':'#d8b04a';g.beginPath();g.moveTo(qx+k*10,qy);g.lineTo(qx+k*10+10,qy);g.lineTo(qx+k*10-qs+10,qy+qs);g.lineTo(qx+k*10-qs,qy+qs);g.closePath();g.fill()}g.restore();
      g.fillStyle='#8c8984';g.fillRect(qx+6,qy+6,qs-12,qs-12);g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;for(let k=1;k<3;k++){g.beginPath();g.moveTo(qx+6+k*(qs-12)/3,qy+6);g.lineTo(qx+6+k*(qs-12)/3,qy+qs-6);g.moveTo(qx+6,qy+6+k*(qs-12)/3);g.lineTo(qx+qs-6,qy+6+k*(qs-12)/3);g.stroke()}
      const pc=qx+qs/2,pcy=qy+qs/2;g.strokeStyle='#e8c84a';g.lineWidth=3;g.beginPath();g.arc(pc,pcy,qs*.32,0,7);g.stroke();g.fillStyle='#e8c84a';g.font='900 26px Arimo, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('H',pc,pcy+1);
      for(const[a,b]of[[0,0],[1,0],[0,1],[1,1]]){g.beginPath();g.arc(qx+8+a*(qs-16),qy+8+b*(qs-16),3,0,7);fs(g,'#c8382a',1)}
      const tx=px+1.5*T,ty=py+1.5*T;g.fillStyle='rgba(0,0,0,.25)';E(g,tx+6,ty+10,T*.75,T*.35);g.fill();
      g.lineCap='round';g.strokeStyle=OUT;g.lineWidth=5;g.beginPath();for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){g.moveTo(tx+a*T*.5,ty+b*T*.5);g.lineTo(tx+a*T*.12,ty+b*T*.12)}g.stroke();g.strokeStyle='#9aa0a4';g.lineWidth=2.6;g.stroke();
      g.beginPath();g.rect(tx-T*.5,ty-T*.5,T,T);g.strokeStyle='#9aa0a4';g.lineWidth=1.4;g.stroke();g.beginPath();g.moveTo(tx-T*.5,ty-T*.5);g.lineTo(tx+T*.5,ty+T*.5);g.moveTo(tx+T*.5,ty-T*.5);g.lineTo(tx-T*.5,ty+T*.5);g.stroke();
      g.beginPath();g.arc(tx,ty,T*.2,0,7);fs(g,'#c9ced3',1.6);g.save();g.translate(tx,ty);g.rotate(-.6);E(g,0,-T*.05,T*.42,T*.22);fs(g,'#e2e5e8',1.6);E(g,0,-T*.05,T*.18,T*.09);fs(g,'#b8bec4',1);g.strokeStyle=OUT;g.lineWidth=2;g.beginPath();g.moveTo(0,-T*.05);g.lineTo(0,-T*.32);g.stroke();g.beginPath();g.arc(0,-T*.34,3,0,7);fs(g,'#c8382a',1);g.restore();
      rr(g,px+.2*T,py+3.2*T,T*1.5,T*1.5,4);fs(g,'#5c6268',2);g.fillStyle='#7fe0d0';g.fillRect(px+.4*T,py+3.4*T,T*1.1,T*.35);g.fillStyle='rgba(255,255,255,.1)';g.fillRect(px+.3*T,py+3.3*T,T*1.3,4);
      break;}
  }
}

