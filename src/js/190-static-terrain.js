/* ================= static terrain ================= */
function rgb(c,j){return`rgb(${c[0]+j|0},${c[1]+j|0},${c[2]+j|0})`}
const PADL=30,PADR=22,PADT=18,PADB=18;
let LS=1,LSmax=1,rockM=null,hasRock=false,RX0=0,RY0=0,RWd=0,RHt=0,RIV=null,rvW=2,seasonDrawn=-1,WIND=1;
let outerRoad=[],gateT=0;
function polyDist(pts,x,y){let best=1e9;for(let i=0;i<pts.length-1;i++){const[ax,ay]=pts[i],[bx,by]=pts[i+1],dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy||1;let t=((x-ax)*dx+(y-ay)*dy)/l;t=clamp(t,0,1);const d=Math.hypot(ax+dx*t-x,ay+dy*t-y);if(d<best)best=d}return best}
function bez(p0,p1,p2,p3,n){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]])}return o}
function mixc(a,b,k){return[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*k))}
function seasonIdx(){return Math.floor(S.t/DAY/15)%4}
function treeCols(b,alt){const se=seasonIdx();if(b.out2==='sand')return['#6a7a3a','rgba(140,170,90,.28)'];
  if(b.out2==='snow'||se===3)return[alt===1?'#3a5040':'#3d5546','rgba(244,247,250,.72)'];
  if(se===2)return[['#a8642a','#c08a2e','#8a5226'][alt],'rgba(250,200,110,.3)'];
  if(se===0)return[alt===1?'#4f7a34':'#5a8a38',alt===2?'rgba(250,200,220,.55)':'rgba(170,210,120,.3)'];
  return[alt===1?'#3f5c2c':'#4a6630','rgba(140,170,90,.28)']}
function staticTree(g,cx,cy,r,b){
  rr(g,cx-3,cy,6,14,2);g.fillStyle='#4a3420';g.fill();g.strokeStyle=OUT;g.lineWidth=1.5;g.stroke();
  const parts=[];for(let k=0;k<5;k++)parts.push([cx+(r()-.5)*T*.7,cy-T*.25+(r()-.5)*T*.5,T*(.24+r()*.12)]);
  const tc=treeCols(b,Math.floor(r()*3));blobs(g,parts,tc[0],1.5);
  g.fillStyle=tc[1];for(const[x2,y2,q]of parts){g.beginPath();g.arc(x2-q*.25,y2-q*.3,q*.45,0,7);g.fill()}
}
function staticRock(g,cx,cy,q0,r,col){g.beginPath();for(let k=0;k<7;k++){const a=k/7*Math.PI*2,q=q0*(.75+r()*.3);g.lineTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q*.8)}g.closePath();fs(g,col,2);g.fillStyle='rgba(255,255,255,.12)';E(g,cx-q0*.2,cy-q0*.25,q0*.4,q0*.25);g.fill()}
function buildStatic(){
  seasonDrawn=seasonIdx();const se=seasonDrawn,snowy=se===3&&(b0=>b0.out2==='grass'||b0.out2==='rock')(biome());
  const b=biome(),pal=b.pal,r=mulberry(S.site.seed+7),TW=W+PADL+PADR,TH=H+PADT+PADB;
  {const lim=isTouch?7e6:1.6e7,ns=Math.min(LSmax,1,Math.sqrt(lim/(TW*T*TH*T)));if(Math.abs(ns-LS)>1e-3){LS=ns;plotDirty=true}}
  staticCv=document.createElement('canvas');staticCv.width=Math.ceil(TW*T*LS);staticCv.height=Math.ceil(TH*T*LS);staticCv._w=TW*T;staticCv._h=TH*T;
  const g=staticCv.getContext('2d'),g0=g;g.scale(LS,LS);
  const inMap=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const kAt=(x,y)=>inMap(x,y)?kind[x+y*W]:0;
  // one shared ground: per-cell colour, smoothly upscaled, same for map and surroundings
  const low=document.createElement('canvas');low.width=TW;low.height=TH;const lg=low.getContext('2d');
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const k=kAt(x-PADL,y-PADT),base=k===0?(r()<.25?pal.alt:pal.out):k===2?pal.gut:(r()<.2?pal.alt:pal.in);let sh=0;if(k===0){const X=x-PADL,Y=y-PADT,h0=hillAt(X,Y);sh=(hillAt(X-1.5,Y-1.5)-hillAt(X+1.5,Y+1.5))*-150+(h0-.5)*12}let bc=base;if(snowy)bc=mixc(base,[222,227,230],k===0?.66:.42);else if(se===2&&b.out2==='grass'&&k===0)bc=mixc(base,[150,118,66],.32);else if(se===0&&b.out2==='grass'&&k===0)bc=mixc(base,[110,130,60],.15);lg.fillStyle=rgb(bc,(r()-.5)*14+sh);lg.fillRect(x,y,1,1)}
  g.imageSmoothingEnabled=true;g.drawImage(low,0,0,TW*T,TH*T);
  g.save();g.translate(PADL*T,PADT*T);
  for(let y=-PADT;y<H+PADB;y++)for(let x=-PADL;x<W+PADR;x++){
    const k=kAt(x,y),px=x*T,py=y*T;
    for(let n=0;n<5;n++){g.fillStyle=r()<.5?'rgba(0,0,0,.12)':'rgba(255,255,255,.07)';g.beginPath();g.arc(px+r()*T,py+r()*T,.8+r()*1.6,0,7);g.fill()}
    if(k!==0)continue;
    if(snowy){if(r()<.4){g.fillStyle='rgba(250,252,255,.45)';E(g,px+r()*T,py+r()*T,5+r()*8,2+r()*4);g.fill()}}
    else if(b.out2==='grass'){g.strokeStyle=se===2?'rgba(190,150,80,.45)':'rgba(150,165,85,.5)';g.lineWidth=1.3;g.lineCap='round';for(let n=0;n<4;n++){const gx=px+r()*T,gy=py+r()*T;g.beginPath();g.moveTo(gx,gy);g.lineTo(gx+(r()-.5)*4,gy-4-r()*3);g.stroke()}}
    else if(b.out2==='snow'){if(r()<.5){g.fillStyle='rgba(240,244,248,.5)';E(g,px+r()*T,py+r()*T,6+r()*8,3+r()*5);g.fill()}}
    else if(b.out2==='sand'){g.strokeStyle='rgba(120,90,50,.25)';g.lineWidth=1;g.beginPath();g.arc(px+r()*T,py+T,10+r()*10,3.6,5.8);g.stroke()}
  }
  // caravan road from the west (drawn live so it matches the path at the gate)
  const road=outerRoad;
  // water or cliffs beyond the east wall
  const rv=mulberry(S.site.seed+31),a1=1.2+rv()*2.8,f1=.12+rv()*.14,p1=rv()*7,a2=2+rv()*4,f2=.03+rv()*.05,p2=rv()*7,slope=(rv()-.5)*.22,bx=W+PADR*(.4+rv()*.25),rw=1.7+rv()*1.2,f3=.07+rv()*.08,p3=rv()*7,river=[];for(let y=-PADT-2;y<=H+PADB+2;y+=.5)river.push([clamp(bx+Math.sin(y*f1+p1)*a1+Math.sin(y*f2+p2)*a2+slope*(y-H/2),W+3.5,W+PADR-3),y]);
  RIV=null;
  if(b.out2!=='rock'){
    const half=river.map(([x,y])=>rw*.5*(1+.42*Math.sin(y*f3+p3)+.16*Math.sin(y*.37+p1)));
    const nrm=river.map((p,i)=>{const a=river[Math.max(0,i-1)],c=river[Math.min(river.length-1,i+1)],dx=c[0]-a[0],dy=c[1]-a[1],l=Math.hypot(dx,dy)||1;return[-dy/l,dx/l]});
    const edge=(k,add)=>river.map(([x,y],i)=>[x+nrm[i][0]*(half[i]*k+add),y+nrm[i][1]*(half[i]*k+add)]);
    const poly=(k,add,fill)=>{const L=edge(-k,-add),Rr=edge(k,add).reverse();g.beginPath();[...L,...Rr].forEach(([x,y],i)=>i?g.lineTo(x*T,y*T):g.moveTo(x*T,y*T));g.closePath();g.fillStyle=fill;g.fill()};
    const frozen=b.out2==='snow'||snowy,dry=b.out2==='sand',water=frozen?['#a9c4ce','#dbe8ee']:dry?['#9a7a52','#b08e62']:['#3e6a78','#5b8c99'];
    poly(1,1.1,'rgba(120,100,60,.22)');poly(1,.55,frozen?'rgba(230,236,240,.5)':'rgba(140,120,80,.3)');poly(1,.16,'rgba(40,30,20,.5)');poly(1,0,water[0]);poly(.5,0,frozen?'rgba(240,248,252,.4)':'rgba(90,140,155,.35)');
    if(frozen){g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1;for(let i=4;i<river.length-4;i+=7){const[x,y]=river[i],n=nrm[i],o=(rv()-.5)*half[i];g.beginPath();g.moveTo((x+n[0]*o)*T,(y+n[1]*o)*T);g.lineTo((x+n[0]*o)*T+(rv()-.5)*20,(y+n[1]*o)*T+8+rv()*10);g.stroke()}}
    for(let i=0;i<river.length;i+=3)if(rv()<.35){const[x,y]=river[i],n=nrm[i],sd=rv()<.5?-1:1,o=sd*(half[i]+.25);g.beginPath();g.arc((x+n[0]*o)*T,(y+n[1]*o)*T,3+rv()*4,0,7);g.fillStyle=frozen?'rgba(240,244,248,.7)':'rgba(130,125,115,.8)';g.fill()}
    RIV={pts:river,nrm,half,frozen,dry,lanes:[-.62,-.25,.1,.45,.7].map(k=>edge(k,0)),fish:Array.from({length:8},(_,i)=>({s0:rv(),sp:(rv()<.7?1:-1)*(.006+rv()*.01),lat:(rv()-.5)*1.1,ph:rv()*9}))};
  }
  rvW=rw;
  // deco: in-map rocks/bushes, plus the same kinds of things in the wild around it
  const[tr,rk,bu]=b.deco,items=[];
  for(let y=-PADT;y<H+PADB;y++)for(let x=-PADL;x<W+PADR;x++){
    if(inMap(x,y)){const d=deco[x+y*W];if(d===3&&kind[x+y*W]===0&&!nearBase(x,y))items.push([x,y,d]);continue}
    if(x<0&&polyDist(road,x+.5,y+.5)<3.4)continue;
    if(b.out2!=='rock'&&polyDist(river,x+.5,y+.5)<rw*.75+1.4)continue;if(mtnAt(x,y))continue;
    const q=r();
    if(b.out2==='rock'&&q<.16)items.push([x,y,4]);
    else{const tc=treeChance(x,y,tr*1.4),bc=bu*(.5+treeChance(x,y,1)*.5);if(q<tc)items.push([x,y,1]);else if(q<tc+rk)items.push([x,y,2]);else if(q<tc+rk+bc)items.push([x,y,3])}
  }
  items.sort((a,c)=>a[1]-c[1]);
  staticTopCv=document.createElement('canvas');staticTopCv.width=Math.ceil(TW*T*LS);staticTopCv.height=Math.ceil(TH*T*LS);staticTopCv._w=TW*T;staticTopCv._h=TH*T;const gt0=staticTopCv.getContext('2d');gt0.scale(LS,LS);gt0.translate(PADL*T,PADT*T);
  {const rocks=[];RX0=-PADL;RY0=-PADT;RWd=W+PADL+PADR;RHt=H+PADT+PADB;rockM=new Uint8Array(RWd*RHt);for(let y=-PADT;y<H+PADB;y++)for(let x=-PADL;x<W+PADR;x++)if(mtnAt(x,y)){rocks.push([x,y]);rockM[(x-RX0)+(y-RY0)*RWd]=1}hasRock=rocks.length>0;if(hasRock&&S.wild)for(const a of S.wild){if(!rockAt(a.x,a.y))continue;let best=null,bd=1e9;for(let dy=-12;dy<=12;dy++)for(let dx=-12;dx<=12;dx++){const x=Math.floor(a.x)+dx,y=Math.floor(a.y)+dy;if(x>-2||rockAt(x,y))continue;const dd=dx*dx+dy*dy;if(dd<bd){bd=dd;best=[x+.5,y+.5]}}if(best){a.x=a.tx=best[0];a.y=a.ty=best[1]}else a.dead=true}
    if(rocks.length){const q=mulberry(S.site.seed+77),M=new Set(rocks.map(([x,y])=>x+','+y)),isR=(x,y)=>M.has(x+','+y);
      blobs(gt0,rocks.map(([x,y])=>[x*T+T/2+(q()-.5)*7,y*T+T/2+(q()-.5)*7,T*.76]),'#46433f',2.4);
      for(const[x,y]of rocks){const h=hillAt(x*1.7,y*1.7);gt0.fillStyle=h>.5?`rgba(255,250,240,${(h-.5)*.45})`:`rgba(0,0,0,${(.5-h)*.5})`;gt0.fillRect(x*T,y*T,T,T);
        if(q()<.5){gt0.fillStyle='rgba(30,28,26,.35)';gt0.beginPath();const cx=x*T+q()*T,cy=y*T+q()*T;gt0.moveTo(cx,cy);gt0.lineTo(cx+6+q()*8,cy+2+q()*4);gt0.lineTo(cx+2,cy+7+q()*5);gt0.fill()}
        if(!isR(x,y-1)){gt0.fillStyle='rgba(205,200,190,.28)';gt0.fillRect(x*T+3,y*T+1,T-6,6)}
        if(!isR(x,y+1)){gt0.fillStyle='rgba(0,0,0,.22)';gt0.fillRect(x*T+2,y*T+T-7,T-4,6)}
        if(snowy&&q()<.55){gt0.fillStyle='rgba(245,248,252,.55)';E(gt0,x*T+q()*T,y*T+q()*T,6+q()*9,3+q()*4);gt0.fill()}}
      if(b.cave){const R2=rocks.filter(([x,y])=>x>=0&&y>=0&&x<W&&y<H);for(const[x,y]of R2)if(q()<.05){gt0.fillStyle='rgba(120,170,200,.35)';gt0.beginPath();gt0.arc(x*T+q()*T,y*T+q()*T,2.5,0,7);gt0.fill()}}}}
  for(const[x,y,d]of items){
    const cx=x*T+T/2,cy=y*T+T/2,g=d===3?g0:gt0;
    if(d===1)staticTree(g,cx,cy,r,b);
    else if(d===2)staticRock(g,cx,cy,T*(.3+r()*.15),r,b.out2==='rock'?'#6f6a63':'#88837a');
    else if(d===4)staticRock(g,cx,cy,T*(.7+r()*.9),r,r()<.5?'#5f5a54':'#6d6862');
    else blobs(g,[[cx-5,cy+2,6],[cx+5,cy+3,6],[cx,cy-3,7]],b.out2==='sand'?'#8a8a4a':'#5a7334',1.2);
  }
  g.restore();staticSil=makeSil(staticTopCv,.5);
}
let shCv=null,shKey='';
function plotShadow(){const k=Math.round(SUN.dx*2)+','+Math.round(SUN.dy*2)+','+silVer;if(shCv&&shKey===k)return shCv;shKey=k;
  if(!shCv||shCv.width!==plotSil.width||shCv.height!==plotSil.height){shCv=document.createElement('canvas');shCv.width=plotSil.width;shCv.height=plotSil.height}
  const g=shCv.getContext('2d');g.clearRect(0,0,shCv.width,shCv.height);const n=7,L=.42*.5;for(let i=1;i<=n;i++)g.drawImage(plotSil,SUN.dx*L*LS*i/n,SUN.dy*L*LS*i/n);
  g.globalCompositeOperation='destination-out';g.drawImage(plotSil,0,0);g.globalCompositeOperation='source-over';return shCv}
let silVer=0;
function makeSil(src,sc){silVer++;const c=document.createElement('canvas');c.width=Math.ceil(src.width*sc);c.height=Math.ceil(src.height*sc);const g=c.getContext('2d');g.drawImage(src,0,0,c.width,c.height);g.globalCompositeOperation='source-in';g.fillStyle='#000';g.fillRect(0,0,c.width,c.height);return c}
function drawWalls(g){
  const t=S.wall,b=biome(),cells=wallInfo.cells;
  if(t<0){g.save();g.beginPath();for(const i of cells){const x=i%W,y=(i-x)/W;for(const[dx,dy]of[[1,0],[0,1]]){const j=i+dx+dy*W;if(isWallCell(j)){g.moveTo((x+.5)*T,(y+.5)*T);g.lineTo((x+.5+dx)*T,(y+.5+dy)*T)}}}g.strokeStyle='rgba(240,225,170,.32)';g.lineWidth=3;g.setLineDash([6,8]);g.lineCap='round';g.stroke();g.restore();
    for(const i of cells){if(!S.wallCon||i%5)continue;const x=i%W,y=(i-x)/W;g.strokeStyle=OUT;g.lineWidth=4;g.beginPath();g.moveTo((x+.5)*T,(y+.7)*T);g.lineTo((x+.5)*T,(y+.2)*T);g.stroke();g.strokeStyle='#b08a5a';g.lineWidth=2;g.stroke()}
    return}
  const solid=i=>kind[i]===1&&!S.breach[i],conn=i=>solid(i)||kind[i]===4;
  const segs=[],dots=[],centers=[];
  for(const i of cells){if(!solid(i))continue;const x=i%W,y=(i-x)/W,cx=(x+.5)*T,cy=(y+.5)*T;let n=0;centers.push([cx,cy,i]);
    for(const[dx,dy]of[[1,0],[0,1],[-1,0],[0,-1]]){const j=i+dx+dy*W;if(!conn(j))continue;n++;
      if(kind[j]===4)segs.push([cx,cy,cx+dx*T*.5,cy+dy*T*.5]);else if(dx>0||dy>0)segs.push([cx,cy,cx+dx*T,cy+dy*T])}
    if(!n)dots.push([cx,cy])}
  const path=()=>{g.beginPath();for(const s of segs){g.moveTo(s[0],s[1]);g.lineTo(s[2],s[3])}for(const[x,y]of dots){g.moveTo(x-.5,y);g.lineTo(x+.5,y)}};
  g.save();
  if(t===0){
    g.lineCap='round';g.lineJoin='round';path();
    g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=T*1.02;g.stroke();
    g.strokeStyle='#6b5739';g.lineWidth=T*.9;g.stroke();
    g.strokeStyle='#3d2f20';g.lineWidth=T*.6;g.stroke();
    g.strokeStyle='rgba(20,14,8,.5)';g.lineWidth=T*.2;g.setLineDash([4,10]);g.stroke();g.setLineDash([]);
  }else if(t===1){
    g.lineCap='round';g.lineJoin='round';path();
    
    g.strokeStyle='#5c4228';g.lineWidth=T*.18;g.stroke();
    const logs=centers.map(([x,y])=>[x,y]);
    for(const s of segs){const len=Math.hypot(s[2]-s[0],s[3]-s[1]),n=Math.max(1,Math.round(len/(T*.42)));for(let k=1;k<n;k++){const f=k/n;logs.push([s[0]+(s[2]-s[0])*f,s[1]+(s[3]-s[1])*f])}}
    logs.sort((a,c)=>a[1]-c[1]);
    for(const[x,y]of logs){g.beginPath();g.arc(x,y,T*.24,0,7);fs(g,'#8a6440',2);g.beginPath();g.arc(x,y,T*.11,0,7);fs(g,'#c9a06a',1);g.strokeStyle='rgba(60,35,15,.6)';g.lineWidth=1;g.beginPath();g.arc(x,y,T*.17,0,5);g.stroke()}
    for(const[cx,cy,i]of centers){if(wallInfo.straight[i])continue;g.beginPath();g.arc(cx,cy,T*.34,0,7);fs(g,'#7a5834',2);g.beginPath();g.arc(cx,cy,T*.16,0,7);fs(g,'#c9a06a',1)}
  }else{
    g.lineCap='square';g.lineJoin='miter';path();
    
    g.strokeStyle=OUT;g.lineWidth=T+3;g.stroke();
    g.strokeStyle=b.out2==='rock'?'#77726b':'#8c877f';g.lineWidth=T-2;g.stroke();
    g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=T-10;g.stroke();
    g.lineCap='butt';g.strokeStyle='rgba(0,0,0,.24)';g.lineWidth=T-2;g.setLineDash([1.2,T/2-1.2]);g.stroke();g.setLineDash([]);
    g.strokeStyle='rgba(0,0,0,.14)';g.lineWidth=1;g.stroke();
    for(const[cx,cy,i]of centers){if(!wallInfo.straight[i])continue;const x=i%W,y=(i-x)/W,sd=wallInfo.side[i],[ox,oy]=OUTV[sd]||[0,0],horiz=!!oy;masonry(g,cx-T/2+1,cy-T/2+1,T-2,T-2,i*7+3);
      g.fillStyle='rgba(0,0,0,.18)';if(horiz)g.fillRect(cx-T/2,cy+(oy>0?-T/2:T/2-4),T,4);else g.fillRect(cx+(ox>0?-T/2:T/2-4),cy-T/2,4,T);
      if((x+y)%2===0){const mw=horiz?T*.5:T*.3,mh=horiz?T*.3:T*.5,mx=cx+ox*T*.32-mw/2,my=cy+oy*T*.32-mh/2;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(mx+2,my+2,mw,mh);g.fillStyle=t===3?'#8a857c':'#a09b91';g.fillRect(mx,my,mw,mh);g.strokeStyle=OUT;g.lineWidth=1.2;g.strokeRect(mx,my,mw,mh);g.fillStyle='rgba(255,255,255,.15)';g.fillRect(mx,my,mw,1.5)}
      if(t===3&&(x+y)%3===0){g.fillStyle='#4f5357';if(horiz)g.fillRect(cx-2,cy-T/2+1,4,T-2);else g.fillRect(cx-T/2+1,cy-2,T-2,4);g.fillStyle='#c9ccd0';for(const k of[-.32,.32]){g.beginPath();g.arc(horiz?cx:cx+k*T,horiz?cy+k*T:cy,1.3,0,7);g.fill()}}}
    for(const[cx,cy,i]of centers){if(wallInfo.straight[i])continue;const x0=cx-T/2,y0=cy-T/2;g.beginPath();g.rect(x0-5,y0-5,T+10,T+10);fs(g,t===3?'#6f6a63':'#7d786f',2.5);g.fillStyle='rgba(255,255,255,.1)';g.fillRect(x0-1,y0-1,T+2,5);if(t===3){g.fillStyle='#3a3d40';g.fillRect(cx-3,cy-3,6,6)}}
  }
  g.restore();
  for(const gt of S.gates)drawGate(g,gt);
  for(const k in S.breach){const i=+k;if(!isWallCell(i))continue;const x=i%W,y=(i-x)/W,r=mulberry(i*7+1),cx=(x+.5)*T,cy=(y+.5)*T;
    E(g,cx,cy,T*.62,T*.5);g.fillStyle='rgba(40,30,20,.75)';g.fill();
    const col=t===0?'#6b5739':t===1?'#8a6440':'#8c877f';
    for(let m=0;m<7;m++){const a=r()*7,d=r()*T*.5;if(t===1){g.save();g.translate(cx+Math.cos(a)*d,cy+Math.sin(a)*d);g.rotate(r()*3);rr(g,-7,-2.5,14,5,2);fs(g,col,1.2);g.restore()}else{g.beginPath();g.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,2.5+r()*3.5,0,7);fs(g,col,1.2)}}}
}
function drawGate(g,gt){
  const side=gateSide(gt),ang={W:0,E:Math.PI,N:Math.PI/2,S:-Math.PI/2}[side],t=S.wall;
  g.save();g.translate((gt.x+.5)*T,(gt.y+.5)*T);g.rotate(ang);
  const gx=-T/2,gy=-1.5*T,gh=3*T;
  if(t===0){
    rr(g,gx+3,gy-6,T-6,gh+12,6);g.fillStyle='#3d2f20';g.fill();
    const bx=gx-12,bw=T+24,by=gy+8,bh=gh-16;
    g.fillStyle='rgba(0,0,0,.3)';g.fillRect(bx+3,by+5,bw,bh);
    for(let x=bx;x<bx+bw;x+=7){g.fillStyle=((x-bx)/7|0)%2?'#8a6640':'#7a5834';g.fillRect(x,by,6,bh);g.strokeStyle='rgba(40,24,10,.6)';g.lineWidth=1;g.strokeRect(x+.5,by+.5,5,bh-1)}
    g.strokeStyle=OUT;g.lineWidth=2;g.strokeRect(bx,by,bw,bh);
    for(const yy of[by-2,by+bh+2]){g.strokeStyle=OUT;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(bx-2,yy);g.lineTo(bx+bw+2,yy);g.stroke();g.strokeStyle='#9a7448';g.lineWidth=3;g.stroke();for(const px of[bx,bx+bw/2,bx+bw]){g.beginPath();g.arc(px,yy,3.5,0,7);fs(g,'#6b4a2a',1.5)}}
  }else{
    const post=t===1?'#6b4a2a':t===2?'#6f6a63':'#4f5357',leaf=t===3?'#5f6468':'#8f6e46';
    g.fillStyle='#5c4632';g.fillRect(gx+2,gy,T-4,gh);
    for(const[yy,rot]of[[gy,-.55],[gy+gh,.55]]){g.save();g.translate(gx+T,yy);g.rotate(rot);g.fillStyle=leaf;g.fillRect(0,-4,T*1.4,8);g.strokeStyle=OUT;g.lineWidth=2;g.strokeRect(0,-4,T*1.4,8);g.restore()}
    rr(g,gx-6,gy-10,T+12,10,t===1?4:1);fs(g,post,2);rr(g,gx-6,gy+gh,T+12,10,t===1?4:1);fs(g,post,2);
  }
  g.restore();
}
function drawWallPlots(g){
  for(const s of wpSlots()){const w=S.wp[s.key],px=s.x0*T,py=s.y0*T,pw=s.w*T,ph=s.h*T,vert=s.h>s.w,[ox,oy]=OUTV[s.side];
    if(w&&w.con){rr(g,px+4,py+4,pw-8,ph-8,8);g.fillStyle='rgba(120,95,60,.35)';g.fill();g.strokeStyle='rgba(240,225,170,.55)';g.setLineDash([6,4]);g.lineWidth=1.6;g.stroke();g.setLineDash([]);continue}
    if(!w){rr(g,px+4,py+4,pw-8,ph-8,8);g.strokeStyle='rgba(240,235,210,.15)';g.setLineDash([5,5]);g.lineWidth=1.3;g.stroke();g.setLineDash([]);continue}
    if(w.type==='armory'){
      g.save();rr(g,px+2,py+2,pw-4,ph-4,3);g.clip();floorTile(g,px,py,'wood',pw,ph);g.restore();rr(g,px+2,py+2,pw-4,ph-4,3);g.strokeStyle='rgba(20,14,8,.55)';g.lineWidth=2;g.stroke();
      for(const r of armoryRacks(s)){rr(g,r.x,r.y,r.w,r.h,3);fs(g,'#6e5132',1.6);g.strokeStyle='rgba(30,18,8,.5)';g.lineWidth=1;g.beginPath();for(const sp of r.spots){if(vert){g.moveTo(r.x,sp[1]+T/2);g.lineTo(r.x+r.w,sp[1]+T/2)}else{g.moveTo(sp[0]+T/2,r.y);g.lineTo(sp[0]+T/2,r.y+r.h)}}g.stroke()}
    }else if(w.type==='tradespot'){
      fillRectRound(g,px+3,py+3,pw-6,ph-6,8,'dirt','rgba(20,14,8,.4)');
      const rx=vert?px+T*.35:px+T*1.3,ry=vert?py+T*1.3:py+T*.35,rw=vert?pw-T*.7:pw-T*2.6,rh=vert?ph-T*2.6:ph-T*.7;
      rr(g,rx,ry,rw,rh,5);fs(g,'#8a3f2c',1.6);rr(g,rx+5,ry+5,rw-10,rh-10,3);g.strokeStyle='#c9a640';g.lineWidth=2;g.stroke();g.fillStyle='rgba(240,220,160,.3)';for(let k=0;k<4;k++){E(g,rx+rw/2+(vert?0:(k-1.5)*rw*.2),ry+rh/2+(vert?(k-1.5)*rh*.2:0),4,4);g.fill()}
      const sx=vert?px+4:px+4,sy=vert?py+4:py+4,sw=vert?pw-8:T*1.1,sh=vert?T*1.1:ph-8;
      rr(g,sx,sy,sw,sh,3);fs(g,'#8a6640',1.8);for(let k=0;k<2;k++){rr(g,sx+4+(vert?k*T*.8:0),sy+4+(vert?0:k*T*.8),T*.5,T*.45,2);fs(g,k?'#9a7448':'#b08a5a',1.2)}
      g.save();rr(g,sx-3,sy-3,sw+6,sh+6,4);g.clip();for(let k=0;k<12;k++){g.fillStyle=k%2?'#efe6d0':'#c9a640';if(vert)g.fillRect(sx-3+k*(sw+6)/12,sy-3,(sw+6)/12+.5,T*.42);else g.fillRect(sx-3,sy-3+k*(sh+6)/12,T*.42,(sh+6)/12+.5)}g.restore();
      g.strokeStyle=OUT;g.lineWidth=1.5;if(vert){g.strokeRect(sx-3,sy-3,sw+6,T*.42)}else g.strokeRect(sx-3,sy-3,T*.42,sh+6);
      const end=vert?[px+pw-T*.8,py+ph-T*.85]:[px+pw-T*.85,py+ph-T*.8];rr(g,end[0],end[1],T*.55,T*.5,3);fs(g,'#9a7448',1.4);g.strokeStyle='rgba(40,24,10,.5)';g.lineWidth=1;g.beginPath();g.moveTo(end[0],end[1]+T*.25);g.lineTo(end[0]+T*.55,end[1]+T*.25);g.stroke();
    }else if(w.type==='barracks'){
      g.save();rr(g,px+2,py+2,pw-4,ph-4,3);g.clip();floorTile(g,px,py,'dirt',pw,ph);g.restore();rr(g,px+2,py+2,pw-4,ph-4,3);g.strokeStyle='rgba(20,14,8,.5)';g.lineWidth=2;g.stroke();
      const along=(k)=>vert?[px+pw/2,py+(k+.5)*T]:[px+(k+.5)*T,py+ph/2];
      {const[tx,ty]=along(0);g.strokeStyle=OUT;g.lineWidth=4;g.beginPath();g.moveTo(tx,ty+10);g.lineTo(tx,ty-4);g.stroke();g.strokeStyle='#7a5834';g.lineWidth=2;g.stroke();g.beginPath();g.arc(tx,ty-6,9,0,7);fs(g,'#d8c890',1.6);g.beginPath();g.arc(tx,ty-6,5.5,0,7);g.strokeStyle='#c8382a';g.lineWidth=2;g.stroke();g.fillStyle='#c8382a';g.beginPath();g.arc(tx,ty-6,2,0,7);g.fill()}
      {const[tx,ty]=along(4);g.strokeStyle=OUT;g.lineWidth=4;g.beginPath();g.moveTo(tx,ty-10);g.lineTo(tx,ty+10);g.moveTo(tx-8,ty-3);g.lineTo(tx+8,ty-3);g.stroke();g.strokeStyle='#cdb560';g.lineWidth=2.4;g.stroke();g.beginPath();g.arc(tx,ty-12,4.5,0,7);fs(g,'#cdb560',1.2)}
      {const[tx,ty]=along(2);rr(g,tx-T*.4,ty-T*.4,T*.8,T*.8,3);fs(g,'#6e5132',1.6);g.strokeStyle='#9aa0a4';g.lineWidth=2;g.beginPath();for(let k=-1;k<=1;k++){g.moveTo(tx+k*7,ty-T*.3);g.lineTo(tx+k*7,ty+T*.3)}g.stroke()}
    }else if(w.type==='bunk'){
      g.save();rr(g,px+2,py+2,pw-4,ph-4,3);g.clip();floorTile(g,px,py,'wood',pw,ph);g.restore();rr(g,px+2,py+2,pw-4,ph-4,3);g.strokeStyle='rgba(20,14,8,.55)';g.lineWidth=2;g.stroke();
      const beds=allBeds();for(const[bx0,by0]of bunkBeds(s)){const bx=bx0*T,by=by0*T,idx=beds.findIndex(b=>b.x===bx0&&b.y===by0),owner=S.cols[idx];rr(g,bx+3,by+3,T-6,T*2-6,4);fs(g,'#6e5132',1.8);rr(g,bx+6,by+T*.7,T-12,T*1.15,4);fs(g,owner?owner.shirt:'#6a7480',1.4);rr(g,bx+7,by+7,T-14,9,4);fs(g,'#ece8dc',1.2)}
    }else if(w.type==='shelf'){
      fillRectRound(g,px+3,py+3,pw-6,ph-6,6,'dirt','rgba(20,14,8,.35)');for(const[x,y]of shelfCells().filter(c=>c[0]>=s.x0&&c[0]<s.x0+s.w&&c[1]>=s.y0&&c[1]<s.y0+s.h)){g.beginPath();g.rect(x*T+2,y*T+2,T-4,T-4);fs(g,'#7a5834',1.6);g.strokeStyle='rgba(40,24,10,.5)';g.lineWidth=1;g.beginPath();g.moveTo(x*T+3,y*T+T/2);g.lineTo(x*T+T-3,y*T+T/2);g.stroke()}
    }else if(w.type==='campfire'||w.type==='bench'){
      fillRectRound(g,px+3,py+3,pw-6,ph-6,8,w.type==='bench'?'wood':'dirt','rgba(20,14,8,.4)');const L=layouts['w'+s.key];if(L){const[sx,sy]=L.stations[0],cx=(s.x0+sx+.5)*T,cy=(s.y0+sy+.5)*T;
        if(w.type==='campfire'){for(let k=0;k<8;k++){const a=k/8*Math.PI*2;g.beginPath();g.arc(cx+Math.cos(a)*11,cy+Math.sin(a)*11,4,0,7);fs(g,'#7d786f',1.2)}g.beginPath();g.arc(cx,cy,6,0,7);fs(g,'#e08a3a',1);g.fillStyle='#f3d070';g.beginPath();g.arc(cx,cy,3,0,7);g.fill();
          for(const[dx,dy]of v2(s)){rr(g,cx+dx*T-9,cy+dy*T-7,18,14,4);fs(g,'#b08a5a',1.3);g.fillStyle='rgba(60,40,20,.4)';g.fillRect(cx+dx*T-7,cy+dy*T-2,14,2)}}
        else{g.beginPath();g.rect(cx-T/2+1,cy-T/2+4,T-2,T-8);fs(g,'#8a6640',2);rr(g,cx-10,cy-6,8,4,1);fs(g,'#9aa0a4',1);E(g,cx+6,cy,5,4);fs(g,'#a8643a',1)}}
    }
    if(w&&!w.con&&['armory','barracks','bunk','shelf','bench'].includes(w.type))wpWalls(g,s);
    if(w.type==='mortar'){
      fillRectRound(g,px+3,py+3,pw-6,ph-6,8,'dirt','rgba(20,14,8,.4)');
      const cx=px+pw/2,cy=py+ph/2;E(g,cx,cy,T*.75,T*.75);g.fillStyle='rgba(30,22,14,.6)';g.fill();
      for(let k=0;k<11;k++){const a=k/11*Math.PI*2,x=cx+Math.cos(a)*T*.78,y=cy+Math.sin(a)*T*.78;g.save();g.translate(x,y);g.rotate(a+Math.PI/2);rr(g,-7,-4,14,8,3);fs(g,'#b8a27a',1.3);g.restore()}
      for(let k=0;k<2;k++){const bx=vert?cx-T*.35+k*T*.4:px+T*.2+k*(pw-T*.9),by=vert?py+T*.2+k*(ph-T*.9):cy-T*.3;rr(g,bx,by,T*.5,T*.42,2);fs(g,'#5f6b4a',1.3);g.fillStyle='#c9a640';g.fillRect(bx+4,by+T*.18,T*.5-8,2)}
    }
  }
}
function v2(s){return s.h>s.w?[[0,-1.5],[0,1.5]]:[[-1.5,0],[1.5,0]]}
function fillRectRound(g,x,y,w,h,r,type,outline){g.save();rr(g,x,y,w,h,r);g.clip();floorTile(g,x,y,type,w,h);g.restore();if(outline){rr(g,x,y,w,h,r);g.strokeStyle=outline;g.lineWidth=2;g.stroke()}}
function armoryRacks(s){const px=s.x0*T,py=s.y0*T,pw=s.w*T,ph=s.h*T,vert=s.h>s.w,out=[];
  for(let k=0;k<2;k++){if(vert){const x=px+(k?pw-T*.66:T*.2);out.push({x,y:py+6,w:T*.46,h:ph-12,spots:[0,1,2,3,4].map(m=>[x-T*.27,py+m*T])})}else{const y=py+(k?ph-T*.66:T*.2);out.push({x:px+6,y,w:pw-12,h:T*.46,spots:[0,1,2,3,4].map(m=>[px+m*T,y-T*.27])})}}
  return out}
function drawArmoryLive(){
  const gear=Object.keys(ITEMS).filter(i=>isGear(i)&&cnt(i)>=1);let gi=0;
  for(const s of armories())for(const r of armoryRacks(s))for(const sp of r.spots){if(gi>=gear.length)return;const i=gear[gi++];drawItem(ctx,i,sp[0]+T/2,sp[1]+T/2,T*.62);stackLabel(sp[0]/T,sp[1]/T,Math.floor(cnt(i)))}
}
function drawMortarLive(now){
  for(const s of wpOfType('mortar')){const st=S.wp[s.key],cx=(s.x0+s.w/2)*T,cy=(s.y0+s.h/2)*T,a=st.ang??Math.atan2(OUTV[s.side][1],OUTV[s.side][0]);
    ctx.beginPath();ctx.arc(cx,cy,T*.3,0,7);fs(ctx,'#5a5f62',2);ctx.save();ctx.translate(cx,cy);ctx.rotate(a);rr(ctx,-4,-6,T*.62,12,4);fs(ctx,'#4f5357',2);ctx.beginPath();ctx.arc(T*.58,0,5,0,7);fs(ctx,'#2a2c2e',1.2);ctx.restore()}
}
function drawStains(){if(!stains.length)return;stains=stains.filter(s=>S.t-s.t<45);for(const st of stains){const a=clamp(1-(S.t-st.t)/45,0,1)*.55,r=mulberry(st.seed);ctx.globalAlpha=a;ctx.fillStyle=st.col;for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(st.x*T+(r()-.5)*st.r*2,st.y*T+(r()-.5)*st.r,st.r*(.4+r()*.6),0,7);ctx.fill()}}ctx.globalAlpha=1}
let lights=[],glowCv=null;
function glowSprite(){if(glowCv)return glowCv;glowCv=document.createElement('canvas');glowCv.width=glowCv.height=128;const g=glowCv.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,205,130,1)');gr.addColorStop(.3,'rgba(255,170,80,.5)');gr.addColorStop(1,'rgba(255,140,50,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return glowCv}
function lampPost(g,x,y){g.strokeStyle=OUT;g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(x,y+6);g.lineTo(x,y-10);g.stroke();g.strokeStyle='#5c4228';g.lineWidth=2;g.stroke();rr(g,x-4,y-17,8,8,2);fs(g,'#e8c060',1.4)}
function torch(g,x,y){g.strokeStyle=OUT;g.lineWidth=3.5;g.lineCap='round';g.beginPath();g.moveTo(x,y+5);g.lineTo(x,y-5);g.stroke();g.strokeStyle='#7a5834';g.lineWidth=2;g.stroke();g.fillStyle='#e8903a';g.beginPath();g.arc(x,y-7,3.2,0,7);g.fill();g.fillStyle='#f6d070';g.beginPath();g.arc(x,y-7.5,1.6,0,7);g.fill()}
function computeLights(g){
  lights=[];
  const along=(pts,step,off,r)=>{let acc=step*.5;for(let i=0;i<pts.length-1;i++){const[ax,ay]=pts[i],[bx,by]=pts[i+1],l=Math.hypot(bx-ax,by-ay);if(!l)continue;const nx=-(by-ay)/l,ny=(bx-ax)/l;let d=acc;while(d<l){const x=ax+(bx-ax)*d/l+nx*off,y=ay+(by-ay)*d/l+ny*off;if(kAt(Math.floor(x),Math.floor(y))!==3){lights.push({x,y,r,lamp:true});lampPost(g,x*T,y*T)}d+=step}acc=d-l}};
  for(const r of routes)for(const ru of routeRuns(r))if(ru.t>=1)along(ru.pts,4,.62,2.6);
  if(gateT>=1)along(outerRoad.filter(p=>p[0]>-2&&p[0]<GX),4.5,.7,2.6);
  if(S.wall>=1){for(const i of wallInfo.cells){if(kind[i]!==1||S.breach[i])continue;const x=i%W,y=(i-x)/W,st=wallInfo.straight[i];if(st&&(x+y)%6!==0)continue;if(!st&&!(wallInfo.cells.length<200||(x+y)%2===0))continue;const n=wallInfo.inner[i];if(n<0)continue;const ix=n%W,iy=Math.floor(n/W),lx=x+.5+(ix-x)*.38,ly=y+.5+(iy-y)*.38;lights.push({x:lx,y:ly-.15,r:2.2,f:true});torch(g,lx*T,ly*T)}
    for(const gt of S.gates){const c=gateCells(gt);for(const i of[c[0],c[2]]){const x=i%W,y=(i-x)/W;lights.push({x:x+.5,y:y+.5,r:2.4,f:true})}}}
  for(const p of built()){const[ox,oy]=plotOrigin(p);
    if(p.type==='housing'&&p.tier>=1)lights.push({x:ox+2.5,y:oy+2.4,r:3.2,a:.8});
    if(p.type==='commons'){lights.push({x:ox+2.5,y:oy+2.5,r:p.tier?3.4:3,f:!p.tier})}
    if(p.type==='kitchen'&&p.tier===0){for(const st of layouts[p.id].stations)lights.push({x:ox+st[0]+.5,y:oy+st[1]+.5,r:2.6,f:true})}
    if((p.type==='research'||p.type==='storage'||p.type==='tailor'||p.type==='kitchen')&&p.tier>=1)lights.push({x:ox+2.5,y:oy+2.5,r:2.6,a:.6})}
  for(const o of wpWorkPlots())if(o.type==='kitchen'){const st=layouts[o.id]&&layouts[o.id].stations[0];if(st)lights.push({x:o.ox+st[0]+.5,y:o.oy+st[1]+.5,r:2.3,f:true})}
  for(const sl of wpOfType('bunk'))lights.push({x:sl.x0+sl.w/2,y:sl.y0+sl.h/2,r:2,a:.6});
}
let lightCv=null;
function drawLights(dark,now){
  const fl0=S.fires?Object.values(S.fires).map(f=>({x:f.x+.5,y:f.y+.4,r:2.2+f.i*1.4,f:true,a:Math.min(1,f.i)})):[];const LL=fl0.length?lights.concat(fl0):lights;if(!LL.length)return;const gs=glowSprite();if(!lightCv)lightCv=document.createElement('canvas');if(lightCv.width!==cv.width||lightCv.height!==cv.height){lightCv.width=cv.width;lightCv.height=cv.height}
  const lg=lightCv.getContext('2d');lg.setTransform(1,0,0,1,0,0);lg.globalCompositeOperation='source-over';lg.globalAlpha=1;lg.clearRect(0,0,lightCv.width,lightCv.height);lg.setTransform(DPR,0,0,DPR,0,0);lg.translate(cw/2,ch/2);lg.scale(cam.z,cam.z);lg.translate(-cam.x,-cam.y);lg.globalCompositeOperation='lighten';
  for(const l of LL){const fl=l.f?.85+.15*Math.sin(now/110+l.x*7+l.y*3):1,r=l.r*T;lg.globalAlpha=clamp(fl*(l.a||1),0,1);lg.drawImage(gs,l.x*T-r,l.y*T-r,r*2,r*2)}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=clamp(dark*.62,0,1);ctx.drawImage(lightCv,0,0);ctx.restore();
  ctx.save();ctx.translate(cw/2,ch/2);ctx.scale(cam.z,cam.z);ctx.translate(-cam.x,-cam.y);ctx.globalAlpha=clamp(dark,0,1);ctx.fillStyle='#fff2c0';for(const l of lights)if(l.lamp){ctx.beginPath();ctx.arc(l.x*T,l.y*T-13,2.6,0,7);ctx.fill()}ctx.restore();ctx.globalAlpha=1}
function drawConstruction(){
  const lab=(t,x,y)=>{ctx.font='600 11px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(t,x,y);ctx.fillStyle='#f0efe6';ctx.fillText(t,x,y)};
  const barAt=(x,y,w,f)=>{rr(ctx,x,y,w,9,4);ctx.fillStyle='rgba(10,10,10,.75)';ctx.fill();rr(ctx,x+2,y+2,Math.max(.1,(w-4)*clamp(f,0,1)),5,3);ctx.fillStyle='#8fc46a';ctx.fill()};
  for(const p of S.plots){if(!p.con)continue;const[ox,oy]=plotOrigin(p),px=ox*T,py=oy*T,S5=P*T;
    ctx.strokeStyle=OUT;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();for(const[x,y]of[[px+6,py+6],[px+S5-6,py+6],[px+6,py+S5-6],[px+S5-6,py+S5-6]]){ctx.moveTo(x,y+8);ctx.lineTo(x,y-14)}ctx.stroke();ctx.strokeStyle='#b08a5a';ctx.lineWidth=3;ctx.stroke();
    ctx.strokeStyle='rgba(176,138,90,.85)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(px+6,py-6);ctx.lineTo(px+S5-6,py-6);ctx.moveTo(px+6,py+S5-18);ctx.lineTo(px+S5-6,py+S5-18);ctx.stroke();
    barAt(px+T*.6,py+T*2.1,T*3.8,p.con.prog);lab(p.type?'Upgrading':'Building',px+S5/2,py+T*2.05);ctx.textBaseline='top';ctx.font='600 10px Arimo, Arial, sans-serif';ctx.strokeText(etaStr(p.con),px+S5/2,py+T*2.1+11);ctx.fillStyle=p.con.rt>1e-4?'#f3e7a0':'#e8b04a';ctx.fillText(etaStr(p.con),px+S5/2,py+T*2.1+11)}
  for(const p of built()){const d0=PLOTS[p.type].tiers[p.tier];if(!d0.power)continue;const[ox,oy]=plotOrigin(p),x=(ox+P)*T-12,y=oy*T+12;ctx.beginPath();ctx.arc(x,y,8,0,7);fs(ctx,S.pwrOK===false?'#7a2a22':'#2e3236',1.3);ctx.fillStyle=S.pwrOK===false?'#ff8a70':'#f3d070';ctx.beginPath();ctx.moveTo(x+1,y-6);ctx.lineTo(x-4,y+1);ctx.lineTo(x,y+1);ctx.lineTo(x-1,y+6);ctx.lineTo(x+4,y-1);ctx.lineTo(x,y-1);ctx.closePath();ctx.fill()}
  for(const sl of wpSlots()){const w=S.wp[sl.key];if(!w||!w.con)continue;barAt(sl.x0*T+4,(sl.y0+sl.h/2)*T-4,sl.w*T-8,w.con.prog);ctx.font='600 10px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';const tx=etaStr(w.con).replace(' left','');ctx.strokeText(tx,(sl.x0+sl.w/2)*T,(sl.y0+sl.h/2)*T+7);ctx.fillStyle='#f3e7a0';ctx.fillText(tx,(sl.x0+sl.w/2)*T,(sl.y0+sl.h/2)*T+7)}
  if(S.roadCon){const i=S.roadCon.cell,x=i%W,y=(i-x)/W;barAt(x*T+2,y*T-8,T-4,S.roadCon.prog)}
}
function drawStakes(g){
  for(const p of S.plots){if(p.open)continue;const pr=S.proj&&S.proj.pid===p.id;if(!pr)continue;
    const[ox,oy]=plotOrigin(p);let bx0=1e9,by0=1e9,bx1=-1,by1=-1;for(let y=oy;y<oy+P;y++)for(let x=ox;x<ox+P;x++)if(kAt(x,y)===0&&!nearBase(x,y)){bx0=Math.min(bx0,x);by0=Math.min(by0,y);bx1=Math.max(bx1,x);by1=Math.max(by1,y)}
    if(bx1<0)continue;const x0=bx0*T+5,y0=by0*T+5,x1=(bx1+1)*T-5,y1=(by1+1)*T-5;
    if(pr){g.strokeStyle='rgba(240,225,170,.75)';g.lineWidth=1.5;g.setLineDash([6,4]);g.strokeRect(x0,y0,x1-x0,y1-y0);g.setLineDash([])}
    for(const[x,y]of[[x0,y0],[x1,y0],[x0,y1],[x1,y1]]){g.strokeStyle=OUT;g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(x,y+6);g.lineTo(x,y-7);g.stroke();g.strokeStyle='#b08a5a';g.lineWidth=2.2;g.stroke();g.fillStyle=pr?'#d86a52':'#e0c060';g.beginPath();g.moveTo(x,y-7);g.lineTo(x+8,y-4.5);g.lineTo(x,y-2);g.closePath();g.fill()}}
}
function drawRock(g,o){const r=mulberry(o.id*13+5),cx=o.x*T+T/2,cy=o.y*T+T/2;g.fillStyle=`rgba(0,0,0,${.1+SUN.a*.45})`;E(g,cx+3+SUN.dx*.4,cy+7+SUN.dy*.3,T*.4,T*.14);g.fill();staticRock(g,cx,cy,T*(.3+r()*.12),r,biome().out2==='rock'?'#6f6a63':'#88837a')}
function drawFx(rdt){
  for(const p of fx){p.t+=rdt;
    if(p.k!=='dust'&&p.k!=='flash'){p.vz-=9.8*rdt;p.z+=p.vz*rdt;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.5;p.vy*=.5}}
    p.x+=p.vx*rdt;p.y+=p.vy*rdt;p.vx*=.985;p.vy*=.985;
    const a=clamp(1-p.t/p.life,0,1),sx=p.x*T,sy=(p.y-p.z)*T;
    if(p.k==='spark'){ctx.strokeStyle=`rgba(255,${200+Math.random()*50|0},110,${a})`;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx-p.vx*4,sy-p.vy*4+p.vz*3);ctx.lineTo(sx,sy);ctx.stroke()}
    else if(p.k==='dirt'){ctx.fillStyle=`rgba(80,62,40,${a})`;ctx.beginPath();ctx.arc(sx,sy,p.sz,0,7);ctx.fill()}
    else if(p.k==='blood'){ctx.globalAlpha=a;ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(sx,sy,p.sz,0,7);ctx.fill();ctx.globalAlpha=1}
    else if(p.k==='crit'){const k=p.t/p.life,cx=p.x*T,cy=p.y*T;ctx.save();ctx.translate(cx,cy);ctx.globalAlpha=1-k;ctx.strokeStyle='#fff6c8';ctx.lineWidth=3*(1-k)+1;ctx.beginPath();ctx.arc(0,0,8+k*30,0,7);ctx.stroke();ctx.rotate(p.rot+k*.6);ctx.strokeStyle='#ffd24a';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();for(let m=0;m<8;m++){const an=m/8*Math.PI*2,r1=6+k*18,r2=r1+10*(1-k)+4;ctx.moveTo(Math.cos(an)*r1,Math.sin(an)*r1);ctx.lineTo(Math.cos(an)*r2,Math.sin(an)*r2)}ctx.stroke();ctx.rotate(-(p.rot+k*.6));ctx.font='900 14px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3.5;ctx.strokeStyle='rgba(60,20,0,.9)';ctx.strokeText('CRIT!',0,-18-k*16);ctx.fillStyle='#ffe066';ctx.fillText('CRIT!',0,-18-k*16);ctx.restore();ctx.globalAlpha=1}
    else if(p.k==='chip'){ctx.save();ctx.translate(sx,sy);ctx.rotate(p.rot+p.t*8);ctx.fillStyle=`rgba(201,160,106,${a})`;ctx.fillRect(-p.sz*1.6,-p.sz*.4,p.sz*3.2,p.sz*.8);ctx.restore()}
    else if(p.k==='stone'){ctx.save();ctx.translate(sx,sy);ctx.rotate(p.rot+p.t*5);ctx.fillStyle=`rgba(150,145,138,${a})`;ctx.fillRect(-p.sz,-p.sz*.8,p.sz*2,p.sz*1.6);ctx.restore()}
    else if(p.k==='dust'){ctx.fillStyle=`rgba(120,110,95,${a*.22})`;ctx.beginPath();ctx.arc(sx,sy,p.sz*(.7+p.t*.8),0,7);ctx.fill()}
    else if(p.k==='flash'){ctx.fillStyle=`rgba(255,220,140,${a*.8})`;ctx.beginPath();ctx.arc(sx,sy,p.sz*(.6+p.t*2),0,7);ctx.fill()}
  }
  fx=fx.filter(p=>p.t<p.life);
  for(const sh of shells){const k=clamp(sh.t/sh.dur,0,1),x=sh.x1+(sh.x2-sh.x1)*k,y=sh.y1+(sh.y2-sh.y1)*k,h=Math.sin(k*Math.PI)*5;
    ctx.fillStyle='rgba(0,0,0,.25)';E(ctx,x*T,y*T,5,2.5);ctx.fill();ctx.beginPath();ctx.arc(x*T,(y-h)*T,4,0,7);fs(ctx,'#2a2c2e',1)}
}

