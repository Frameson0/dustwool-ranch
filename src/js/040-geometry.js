/* ================= geometry ================= */
function plotOrigin(p){return p.small?[p.ox,p.oy]:[OX+p.i*G,OY+p.j*G]}
function plotAt(x,y){const i=Math.floor((x-OX)/G),j=Math.floor((y-OY)/G);if(i<0||j<0||i>=COLS||j>=ROWS)return null;const lx=x-OX-i*G,ly=y-OY-j*G;if(lx<0||ly<0||lx>=P||ly>=P)return null;return S.plots[j*COLS+i]}
function nb(p,di,dj){const ni=p.i+di,nj=p.j+dj;if(ni<0||nj<0||ni>=COLS||nj>=ROWS)return null;return S.plots[nj*COLS+ni]}
function same(p,di,dj){const n=nb(p,di,dj);return !!(n&&p.type&&n.type===p.type&&n.tier===p.tier&&!PLOTS[p.type].annex)}
function inPlot(p,x,y){const[ox,oy]=plotOrigin(p);return x>=ox&&y>=oy&&x<ox+P&&y<oy+P}
function entryPlot(p){let q=p;while(joined(q,0,1))q=nb(q,0,1);return q}
function startRow(){return Math.max(0,Math.floor((ROWS-2)/2))}
function startCol(){return Math.max(0,Math.floor((COLS-2)/2))}
function kAt(x,y){return x<0||y<0||x>=W||y>=H?0:kind[x+y*W]}
function isBaseK(k){return k===2||k===3||k===5}
function isWallCell(i){return kind[i]===1||kind[i]===4}
function isOut(e){return outOfGrid(e)||kAt(Math.floor(e.x),Math.floor(e.y))===0}
let geoVer=0,wallInfo={cells:[],side:{},inner:{},exposed:{},straight:{}},boxCache=null;
function setupSite(){
  COLS=S.site.cols;ROWS=S.site.rows;W=OX+COLS*G+5;H=OY+ROWS*G+5;
  GATE_Y=OY+(startRow()+1)*G-1-(GAP>>1);S.gates=S.gates||[];S.traps=S.traps||{};
  genDeco();computeKinds();
}
function initPlots(c,r){
  const j0=Math.max(0,Math.floor((r-2)/2)),i0=Math.max(0,Math.floor((c-2)/2)),out=[];
  for(let j=0;j<r;j++)for(let i=0;i<c;i++)out.push({id:j*c+i,i,j,type:null,tier:0,open:(i===i0||i===i0+1)&&(j===j0||j===j0+1)});
  return out;
}
function hash2(x,y,sd){let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(sd,982451653))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function vnoise(x,y,sd){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),a=hash2(xi,yi,sd),b=hash2(xi+1,yi,sd),c=hash2(xi,yi+1,sd),d=hash2(xi+1,yi+1,sd);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y,sd){return vnoise(x,y,sd)*.55+vnoise(x*2.1,y*2.1,sd+11)*.3+vnoise(x*4.3,y*4.3,sd+23)*.15}
function treeChance(x,y,base){const f=fbm(x*.085,y*.085,S.site.seed%99991);return base*clamp((f-.44)*7,0,3.2)}
function hillAt(x,y){return fbm(x*.045,y*.045,(S.site.seed+7)%99991)}
function mtnAt(x,y){const b=biome(),inMap=x>=0&&y>=0&&x<W&&y<H;
  if(b.cave){if(inMap&&kind[x+y*W]!==0)return false;return x>GX+1+(vnoise(y*.18,3.3,S.site.seed%9973)-.5)*5}
  if(inMap||x>=W-1)return false;const th=S.site.biome==='mountain'?.53:S.site.biome==='arid'?.7:.66;
  if(fbm(x*.05,y*.05,(S.site.seed+99)%99991)<th)return false;return polyDist(outerRoad,x+.5,y+.5)>5}
function genDeco(){
  deco=new Uint8Array(W*H);const r=mulberry(S.site.seed),b=biome(),[tr,rk,bu]=b.deco;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const q=r();
    const i=Math.floor((x-OX+1)/G),j=Math.floor((y-OY+1)/G),lot=i>=0&&j>=0&&i<COLS&&j<ROWS;
    const T1=lot?Math.max(treeChance(x,y,tr*1.6),.07):treeChance(x,y,tr),R1=lot?Math.max(rk*1.4,.05):rk;
    deco[x+y*W]=q<T1?9:q<T1+R1?2:q<T1+R1+bu?3:0;
  }
}
function gateCells(g){return g.v?[g.x+(g.y-1)*W,g.x+g.y*W,g.x+(g.y+1)*W]:[g.x-1+g.y*W,g.x+g.y*W,g.x+1+g.y*W]}
function nearGate(x,y,d){for(const g of S.gates)for(const c of gateCells(g)){const cx=c%W,cy=(c-cx)/W;if(Math.abs(cx-x)<=d&&Math.abs(cy-y)<=d)return true}return false}
function straightAt(i){
  const b=k=>isBaseK(kind[k]),w=k=>kind[k]===1||kind[k]===4;
  if(w(i-W)&&w(i+W)&&((b(i+1)&&kind[i-1]===0)||(b(i-1)&&kind[i+1]===0)))return'v';
  if(w(i-1)&&w(i+1)&&((b(i+W)&&kind[i-W]===0)||(b(i-W)&&kind[i+W]===0)))return'h';
  return null;
}
function computeKinds(){
  kind=new Uint8Array(W*H);
  const open=S.plots.filter(p=>p.open);
  const fill=(x0,y0,x1,y1,k)=>{for(let y=Math.max(0,y0);y<=Math.min(H-1,y1);y++)for(let x=Math.max(0,x0);x<=Math.min(W-1,x1);x++)kind[x+y*W]=k};
  for(const p of open){const[ox,oy]=plotOrigin(p);fill(ox-GU-2,oy-GU-2,ox+P+GU+1,oy+P+GU+1,5)}
  for(const p of open){const[ox,oy]=plotOrigin(p);fill(ox-GU,oy-GU,ox+P+GU-1,oy+P+GU-1,2)}
  for(const p of open){const[ox,oy]=plotOrigin(p);fill(ox,oy,ox+4,oy+4,3)}
  const wl=[];
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=x+y*W;if(kind[i])continue;
    let hit=false;for(let dy=-1;dy<=1&&!hit;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&isBaseK(kind[i+dx+dy*W])){hit=true;break}
    if(hit)wl.push(i)}
  for(const i of wl)kind[i]=1;
  GX=8;for(let x=0;x<W;x++)if(kind[x+GATE_Y*W]===1){GX=x;break}
  if(S.wall>=0){const mg=S.gates.find(g=>g.main);if(mg){mg.x=GX;mg.y=GATE_Y;mg.v=true}else S.gates.unshift({x:GX,y:GATE_Y,v:true,main:true})}else S.gates=[];
  const keep=[];
  for(const g of S.gates){const cells=gateCells(g),ok=cells.every(i=>i>=0&&i<W*H&&kind[i]===1&&straightAt(i)===(g.v?'v':'h'));
    if(ok||g.main)keep.push(g);else{const c=gateCost();S.silver+=c.cost;for(const k in c.mat)add(k,c.mat[k]);msg('A gate no longer sat on the wall and was taken down (refunded).')}}
  S.gates=keep;
  for(const g of S.gates)for(const i of gateCells(g))kind[i]=4;
  computeWallInfo();geoVer++;boxCache=null;calcRoad();
}
function calcRoad(){const ex=GX-.35,gy=GATE_Y+.5,rq=mulberry(S.site.seed+53),o1=(rq()-.5)*10,o2=(rq()-.5)*7;outerRoad=bez([-PADL-1,gy+o1],[-PADL*.4,gy+o1+o2*.6],[ex-15,gy],[ex,gy],48)}
function allGates(){return S.wall>=0?S.gates:[{x:GX,y:GATE_Y,v:true,main:true}]}
function computeWallInfo(){
  const wi={cells:[],side:{},inner:{},exposed:{},straight:{}};
  for(let i=0;i<W*H;i++){
    if(kind[i]!==1&&kind[i]!==4)continue;
    const x=i%W,y=(i-x)/W;let ix=0,iy=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&isBaseK(kAt(x+dx,y+dy))){ix+=dx;iy+=dy}
    const side=Math.abs(ix)>=Math.abs(iy)?(ix>0?'W':'E'):(iy>0?'N':'S');
    wi.cells.push(i);wi.side[i]=side;wi.straight[i]=straightAt(i);
    const[ox,oy]=OUTV[side];let inn=-1;
    if(isBaseK(kAt(x-ox,y-oy)))inn=(x-ox)+(y-oy)*W;
    else for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]])if(isBaseK(kAt(x+dx,y+dy))){inn=x+dx+(y+dy)*W;break}
    wi.inner[i]=inn;
    let ex=true,cx=x+ox,cy=y+oy;while(cx>=0&&cy>=0&&cx<W&&cy<H){if(kind[cx+cy*W]!==0){ex=false;break}cx+=ox;cy+=oy}
    wi.exposed[i]=ex;
  }
  wallInfo=wi;
}
function baseBox(){
  if(boxCache)return boxCache;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(kind[x+y*W]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  return boxCache={x0,y0,x1:x1+1,y1:y1+1};
}
function nearBase(x,y){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(kAt(x+dx,y+dy)!==0)return true;return false}
function genOutside(){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=x+y*W;if(kind[i]||nearBase(x,y)||polyDist(outerRoad,x+.5,y+.5)<3.2||mtnAt(x,y))continue;const d=deco[i];
    if(d===9)out.push({id:nid(),k:'tree',x,y,g:R(.7,1),mark:false,r:0});else if(d===2)out.push({id:nid(),k:'rock',x,y,mark:false,r:0})}
  return out;
}
let trapMode=null;
function trapOK(i){if(i<0||i>=W*H||kind[i]!==0||S.traps[i])return false;const x=i%W,y=(i-x)/W;for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++){const k=kAt(x+dx,y+dy);if(k===1||k===4)return true}return false}
function placeTrap(x,y,type){if(x<0||y<0||x>=W||y>=H)return false;const i=x+y*W;if(!trapOK(i)){return false}const D=TRAPS[type];if(!costOk(D)){msg(type==='mine'?'No landmines in stock. Make them at a munitions workshop.':`A ${D.n.toLowerCase()} needs ${costStr(D)}.`,'bad');return false}
  pay(D);S.traps[i]={type,ch:D.ch||0,con:{prog:0,need:type==='mine'?2:3}};S.outside=S.outside.filter(o=>!(o.x===x&&o.y===y));return true}
function demoTrap(key){const t=S.traps[key];if(!t)return;if(t.type!=='mine'||t.con)refundCost(TRAPS[t.type],t.con?1:.5);delete S.traps[key];if(sel&&sel.k==='trap'&&sel.key==key)sel=null}
function drawTraps(){
  const b=baseBox(),bcx=(b.x0+b.x1)/2,bcy=(b.y0+b.y1)/2;
  for(const k in S.traps){const t=S.traps[k],i=+k,x=i%W,y=(i-x)/W,cx=(x+.5)*T,cy=(y+.5)*T;
    if(t.con){rr(ctx,x*T+4,y*T+4,T-8,T-8,5);ctx.strokeStyle='rgba(240,225,170,.75)';ctx.setLineDash([4,3]);ctx.lineWidth=1.5;ctx.stroke();ctx.setLineDash([]);continue}
    if(t.type==='pit'){rr(ctx,x*T+3,y*T+3,T-6,T-6,6);fs(ctx,'#3a2c1e',1.4);ctx.strokeStyle='#8a6a44';ctx.lineWidth=2;ctx.beginPath();for(let m=0;m<3;m++){ctx.moveTo(x*T+6,y*T+8+m*8);ctx.lineTo(x*T+T-6,y*T+6+m*8+3)}ctx.stroke();ctx.fillStyle='rgba(110,140,60,.5)';E(ctx,cx-5,cy+2,5,3);ctx.fill()}
    else if(t.type==='mine'){E(ctx,cx,cy+3,8,4);ctx.fillStyle='rgba(70,60,40,.5)';ctx.fill();ctx.beginPath();ctx.arc(cx,cy,6,0,7);fs(ctx,'#5f6448',1.4);ctx.fillStyle='#c8382a';ctx.beginPath();ctx.arc(cx,cy-1,1.8,0,7);ctx.fill()}
    else{const a=Math.atan2(cy/T-bcy,cx/T-bcx),up=t.ch>0;for(let m=-1;m<=1;m++){const bx=cx-Math.sin(a)*m*8,by=cy+Math.cos(a)*m*8;ctx.save();ctx.translate(bx,by);ctx.rotate(a+(up?0:Math.PI/2.4));ctx.strokeStyle=OUT;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(up?9:6,0);ctx.stroke();ctx.strokeStyle='#b08a5a';ctx.lineWidth=2.2;ctx.stroke();ctx.restore()}
      if(!up){ctx.font='700 9px Arimo, Arial, sans-serif';ctx.textAlign='center';ctx.fillStyle='#e8b04a';ctx.fillText('sprung',cx,y*T+2)}}
  }
  if(trapMode&&hover){const i=hover[0]+hover[1]*W,ok=trapMode==='remove'?!!S.traps[i]:trapOK(i);rr(ctx,hover[0]*T+2,hover[1]*T+2,T-4,T-4,6);ctx.fillStyle=ok?'rgba(140,220,110,.4)':'rgba(230,100,80,.35)';ctx.fill()}
}
function trapAt(x,y){return x>=0&&y>=0&&x<W&&y<H&&S.traps[x+y*W]?x+y*W:null}
let wpCache=null,wpKey=-1;
function wpSlots(){
  if(wpKey===geoVer&&wpCache)return wpCache;wpKey=geoVer;const out=[],gates=allGates();
  const gcells=new Set();for(const g of gates)for(const c of gateCells(g))gcells.add(c);
  const allBand=(x0,y0,w,h)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(kAt(x,y)!==5)return false;return true};
  const overlaps=(x0,y0,w,h)=>out.some(o=>x0<o.x0+o.w&&o.x0<x0+w&&y0<o.y0+o.h&&o.y0<y0+h);
  const nearG=(x0,y0,w,h)=>{for(let y=y0-1;y<=y0+h;y++)for(let x=x0-1;x<=x0+w;x++)if(x>=0&&y>=0&&x<W&&y<H&&gcells.has(x+y*W))return true;return false};
  for(const g of gates){const sd=wallInfo.side[g.x+g.y*W];if(!sd)continue;const[ox,oy]=OUTV[sd];
    for(const dir of[-1,1]){let x0,y0,w,h;
      if(g.v){x0=Math.min(g.x-ox,g.x-2*ox);w=2;h=5;y0=dir<0?g.y-7:g.y+3}else{y0=Math.min(g.y-oy,g.y-2*oy);h=2;w=5;x0=dir<0?g.x-7:g.x+3}
      if(!allBand(x0,y0,w,h)||overlaps(x0,y0,w,h))continue;
      out.push({key:'g'+(g.x+g.y*W)+(dir<0?'a':'b'),pid:-1,side:sd,x0,y0,w,h})}}
  for(const p of S.plots){if(!p.open)continue;const[ox,oy]=plotOrigin(p);
    for(const[sd,di,dj,x0,y0,w,h]of[['W',-1,0,ox-GU-2,oy,2,5],['E',1,0,ox+P+GU,oy,2,5],['N',0,-1,ox,oy-GU-2,5,2],['S',0,1,ox,oy+P+GU,5,2]]){
      const n=nb(p,di,dj);if(n&&n.open)continue;
      if(!allBand(x0,y0,w,h)||overlaps(x0,y0,w,h)||nearG(x0,y0,w,h))continue;
      out.push({key:p.id+sd,pid:p.id,side:sd,x0,y0,w,h});
    }}
  return wpCache=out;
}
function wpAt(x,y){return wpSlots().find(s=>x>=s.x0&&x<s.x0+s.w&&y>=s.y0&&y<s.y0+s.h)||null}
function wpOfType(t){return wpSlots().filter(s=>S.wp[s.key]&&S.wp[s.key].type===t&&!S.wp[s.key].con)}
function armories(){return wpOfType('armory')}
function hasTradeSpot(){return wpOfType('tradespot').length>0}
function refundCost(d,f){S.silver+=Math.floor((d.cost||0)*f);for(const k in d.mat||{})add(k,Math.floor(d.mat[k]*f))}
function refreshSite(){
  computeKinds();
  const ids=new Set(wallSlots().map(s=>s.id));
  for(const id in S.def)if(!ids.has(id)){refundCost(DEF[S.def[id].type],1);delete S.def[id];msg('A wall defense had to come down for the new wall. Costs refunded.')}
  const keys=new Set(wpSlots().map(s=>s.key));
  for(const k in S.wp)if(!keys.has(k)){refundCost(WPLOTS[S.wp[k].type],1);delete S.wp[k];msg('A wall-side plot is no longer next to the wall and was removed. Costs refunded.')}
  for(const k in S.whp)if(!isWallCell(+k))delete S.whp[k];
  for(const k in S.breach)if(!isWallCell(+k))delete S.breach[k];
  S.outside=S.outside.filter(o=>kAt(o.x,o.y)===0&&(o.k==='chunk'||polyDist(outerRoad,o.x+.5,o.y+.5)>=3)&&!(biome().cave&&mtnAt(o.x,o.y)));
  for(const k in S.traps)if(!/^\d+$/.test(k)||kind[+k]!==0){const t=S.traps[k];if(TRAPS[t.type])refundCost(TRAPS[t.type],1);delete S.traps[k]}
  for(const c of S.cols){c.stationKey=null;c.post=null;c.repT=null}
  rebuildBlocked();buildStatic();unstick();plotDirty=true;
}

function rebuildBlocked(){
  blocked=new Uint8Array(W*H);owned=new Int32Array(W*H).fill(-1);region=new Int32Array(W*H);doorSet=new Set();
  for(let i=0;i<W*H;i++){if(kind[i]===1&&S.wall>=0&&!(S.breach&&S.breach[i]))blocked[i]=1}
  if(biome().cave)for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(kind[x+y*W]===0&&mtnAt(x,y))blocked[x+y*W]=1;
  wpMask=new Uint8Array(W*H);for(const sl of wpSlots())for(let y=sl.y0;y<sl.y0+sl.h;y++)for(let x=sl.x0;x<sl.x0+sl.w;x++)wpMask[x+y*W]=1;
  computeClusters();computeAnnex();computeRegRoot();
  layouts={};
  for(const p of S.plots){
    if(!p.type)continue;const L=layout(p);layouts[p.id]=L;const[ox,oy]=plotOrigin(p);
    for(const[x,y]of L.block)blocked[ox+x+(oy+y)*W]=1;
    for(const[x,y]of L.strip)owned[ox+x+(oy+y)*W]=p.id;
  }
  for(const o of wpWorkPlots()){const sl=o.sl,v=sl.h>sl.w,st=v?(sl.side==='W'?[0,2,1,2]:[1,2,0,2]):(sl.side==='N'?[2,0,2,1]:[2,1,2,0]);layouts[o.id]={block:[],beds:[],crops:[],stations:[st],store:[],strip:[],seats:[]};if(!o.w.bill)o.w.bill=BILLS[o.type][0]}
  for(const p of built().filter(walled)){
    const rid=regRoot[p.id]+1,[ox,oy]=plotOrigin(p);
    const yd=new Set((layouts[p.id].yard||[]).map(c=>c+''));
    for(let y=0;y<P;y++)for(let x=0;x<P;x++)if(!yd.has(x+','+y))region[ox+x+(oy+y)*W]=rid;
    for(const[x,y]of layouts[p.id].strip)region[ox+x+(oy+y)*W]=rid;
  }
  computeLanes();computeDoors();computeBonuses();
  computeRoads();plotDirty=true;if(!laneSim&&S.cols)unstick();
}
function walled(p){return p.type==='housing'||(p.tier>=1&&!['farm','pen','treefarm','solar','comms'].includes(p.type))}
function walkable(x,y){return x>=0&&y>=0&&x<W&&y<H&&!blocked[x+y*W]}
function edgeOK(a,b){return region[a]===region[b]||doorSet.has(a+','+b)}

function layout(p){
  const t=p.tier,L={block:[],beds:[],crops:[],stations:[],store:[],strip:[],seats:[]};
  const Rn=same(p,1,0),Bn=same(p,0,1),Cn=Rn&&Bn&&same(p,1,1),aR=!Rn&&ajn(p,1,0),aB=!Bn&&ajn(p,0,1),GXS=[];for(let k=P;k<G;k++)GXS.push(k);
  L.jstrip=[];
  if(Rn)for(let y=0;y<P;y++)for(const k of GXS)L.jstrip.push([k,y]);
  if(Bn)for(let x=0;x<P;x++)for(const k of GXS)L.jstrip.push([x,k]);
  if(Cn)for(const a of GXS)for(const b of GXS)L.jstrip.push([a,b]);
  L.strip=L.jstrip.slice();
  if(aR)for(let y=0;y<P;y++)for(const k of GXS)L.strip.push([k,y]);
  if(aB)for(let x=0;x<P;x++)for(const k of GXS)L.strip.push([x,k]);
  switch(p.type){
    case 'housing':{
      const order=[[0,0],[4,0],[2,0],[1,0],[3,0],[0,3],[4,3],[1,3],[3,3]];
      L.beds=order.slice(0,tierDef(p).beds);
      if(Rn)L.beds.push([MID,0],[MID,3]);
      break;}
    case 'farm':{
      if(t===0){for(let y=1;y<4;y++)for(let x=1;x<4;x++)L.crops.push([x,y]);if(Rn)for(let y=1;y<4;y++)for(const k of GXS)L.crops.push([k,y]);if(Bn)for(let x=1;x<4;x++)for(const k of GXS)L.crops.push([x,k])}
      else{for(let y=0;y<P;y++)for(let x=0;x<P;x++)if(t===1||!(x===2&&y===2))L.crops.push([x,y]);if(t>=2)L.block.push([2,2]);for(const c of L.jstrip)L.crops.push(c)}
      break;}
    case 'treefarm':{const pts=t===0?[[1,1],[3,1],[2,2],[1,3],[3,3]]:[[0,0],[2,0],[4,0],[1,1],[3,1],[0,2],[2,2],[4,2],[1,3],[3,3],[0,4],[4,4]];for(const c of pts)L.crops.push(c);if(Rn)L.crops.push([MID,1],[MID,3]);if(Bn)L.crops.push([1,MID],[3,MID]);break}
    case 'hydro':{const rows=t===0?[1,3]:[0,2,4];for(const y of rows){for(let x=0;x<P;x++)L.crops.push([x,y]);if(Rn)for(const k of GXS)L.crops.push([k,y])}break}
    case 'kitchen':case 'workshop':case 'tailor':case 'weaponsmith':case 'armorsmith':case 'hunting':case 'research':case 'quarry':case 'construction':case 'refinery':case 'munitions':case 'fabrication':{
      const st=t===0?[[2,2]]:t===1?[[1,1],[3,1]]:[[0,1],[2,1],[4,1]];
      for(const[x,y]of st){L.stations.push([x,y,x,y+1]);L.block.push([x,y])}
      if(p.type==='kitchen')L.store=t===0?[[0,0],[4,0],[0,4],[4,4]]:[[0,3],[0,4],[4,3],[4,4]];
      if(t>=1&&CRAFT_TYPES.includes(p.type))L.rack=p.type==='kitchen'?[[0,4],[4,4]]:[[0,4],[4,4]];break}
    case 'commons':{
      if(t===0){L.block.push([2,2]);L.seats=[[1,2],[3,2],[2,1],[2,3],[1,1],[3,3]];L.store=[[0,0],[4,0],[0,4],[4,4]]}
      else{const tables=t===1?[[1,1],[3,1]]:[[1,1],[3,1],[1,3],[3,3]];for(const c of tables)L.block.push(c);L.seats=t===1?[[1,0],[3,0],[1,2],[3,2]]:[[1,0],[3,0],[1,2],[3,2],[1,4],[3,4]];L.store=[[4,0],[4,1],[4,2],[4,3],[4,4]]}
      break;}
    case 'storage':for(let y=0;y<P;y++)for(let x=0;x<P;x++)L.store.push([x,y]);for(const c of L.jstrip)L.store.push(c);break;
    case 'comms':L.block.push([1,1]);break;
    case 'bunk':L.beds=[[0,0],[1,0],[3,0],[4,0]];break;
    case 'pantry':case 'supply':case 'dock':L.block.push([0,0],[1,0],[3,0],[4,0]);break;
    case 'library':L.block.push([0,0],[1,0],[3,0],[4,0],[0,2],[1,2],[3,2],[4,2]);break;
    case 'granary':L.block.push([3,0],[4,0],[3,1],[4,1]);break;
    case 'well':L.block.push([2,1]);break;
    case 'bath':L.block.push([0,0],[4,0]);break;
    case 'rec':L.block.push([2,1]);break;
    case 'maproom':L.block.push([1,1],[2,1],[3,1]);break;
  }
  if((t>=1||p.type==='housing')&&walled(p)&&PLOTS[p.type]&&!PLOTS[p.type].annex&&!p.small&&p.type!=='storage')L.yard=plotShape(p,L);
  return L;
}
/* building footprints: walled plots drop a corner or two (L, T and notched shapes) when nothing inside needs those cells.
   The cut cells become an open yard; walls follow the shape. Sides joined to a neighbour stay full. */
const SHAPES=[[[0,0],[0,1],[4,0],[4,1]],[[3,0],[4,0],[3,1],[4,1]],[[0,3],[1,3],[0,4],[1,4]],[[0,0],[1,0],[0,1],[1,1]],[[3,3],[4,3],[3,4],[4,4]],[[0,3],[0,4],[4,3],[4,4]],[[0,0],[0,1],[0,2]],[[4,2],[4,3],[4,4]],[[0,0],[1,0],[2,0]]];
function plotShape(p,L){const used=new Set();const u=(x,y)=>used.add(x+','+y);
  for(const k of['block','crops','store','seats','beds','rack'])for(const c of L[k]||[])u(c[0],c[1]);for(const b of L.beds)u(b[0],b[1]+1);for(const st of L.stations)st.forEach((v,i)=>{if(i%2===0)u(st[i],st[i+1])});
  const jn={N:same(p,0,-1),S:same(p,0,1),W:same(p,-1,0),E:same(p,1,0)};
  const ok=cut=>cut.every(([x,y])=>!used.has(x+','+y)&&!(jn.N&&y===0)&&!(jn.S&&y===4)&&!(jn.W&&x===0)&&!(jn.E&&x===4)&&!(x===2&&y===4));
  const n=SHAPES.length,s0=(p.id*7+p.tier*3)%n;for(let k=0;k<n;k++){const c=SHAPES[(s0+k)%n];if(ok(c))return c.map(q=>q.slice())}return[]}
function computeClusters(){
  clusterSize={};clusterRoot={};const seen=new Set();
  for(const p of S.plots){
    if(!p.type||seen.has(p.id))continue;
    const comp=[],q=[p];seen.add(p.id);
    while(q.length){const c=q.pop();comp.push(c);for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=nb(c,di,dj);if(n&&same(c,di,dj)&&!seen.has(n.id)){seen.add(n.id);q.push(n)}}}
    const root=Math.min(...comp.map(c=>c.id));
    for(const c of comp){clusterSize[c.id]=comp.length;clusterRoot[c.id]=root}
  }
}
let reachArr=null,annexRoot={},regRoot={},bonusInfo={},wingCells={},doorList=[],regDoor={},reachOK=true,laneCache=[];
function isAnnex(p){return false}
function annexParent(a){return null}
function computeAnnex(){}
function ajn(){return false}
function joined(p,di,dj){return same(p,di,dj)}
function annexesFor(type){return ANNEX_TYPES.filter(a=>WINGS[a].of.includes(type))}
function wingCost(w){return WINGS[w].tiers[0]}
function laneDef(l){return l.type==='wing'?wingCost(l.w):LANES[l.type]}
function laneName(l){return l.type==='wing'?WINGS[l.w].n:LANES[l.type].n}
function clusterHasWing(n,w){const r=clusterRoot[n.id];for(const k in S.lanes||{}){const l=S.lanes[k];if(l.type==='wing'&&l.w===w&&S.plots[l.par]&&S.plots[l.par].type&&clusterRoot[l.par]===r)return true}return false}
function annexAvail(p){return annexesFor(p.type).filter(a=>!clusterHasWing(p,a))}
function wingOptions(sl){const out=[];if(S.lanes[sl.key])return out;for(const id of[sl.a,sl.b]){const p=S.plots[id];if(!p||!p.type)continue;for(const w of annexAvail(p))out.push([w,p])}return out}
function computeRegRoot(){regRoot={};const seen=new Set();for(const p of built()){if(seen.has(p.id))continue;const comp=[],q=[p];seen.add(p.id);while(q.length){const c=q.pop();comp.push(c);for(const[di,dj]of DIR4){const n=nb(c,di,dj);if(n&&!seen.has(n.id)&&joined(c,di,dj)){seen.add(n.id);q.push(n)}}}const r=Math.min(...comp.map(c=>c.id));for(const c of comp)regRoot[c.id]=r}}
function adjFor(type,nt){const out=[];for(const[ts,v,why]of ADJ[type]||[]){const hit=ts.filter(t=>nt.has(t));if(hit.length)out.push({v,why,with:hit})}return out}
function nbTypes(list,self){const st=new Set();for(const q of list)for(const[di,dj]of DIR4){const n=nb(q,di,dj);if(n&&n.type&&n.type!==self)st.add(n.type)}return st}
function adjPreview(p,type){return adjFor(type,nbTypes([p],type))}
function computeBonuses(){bonusInfo={};for(const p of built()){const r=clusterRoot[p.id];if(bonusInfo[r])continue;const comp=S.plots.filter(q=>q.type&&clusterRoot[q.id]===r);
  const adj=adjFor(p.type,nbTypes(comp,p.type));let a=0;for(const e of adj)a+=e.v;a=clamp(a,-.3,.4);
  const ax=annexRoot[r]||[];let sp=0,store=0,home=0,buff=0;for(const x of ax){const A=WINGS[x.type];sp+=A.spd||0;store+=A.store||0;home+=A.home||0;buff+=A.buff||0}
  bonusInfo[r]={adj,adjV:a,annex:ax,spd:sp,store,home,buff,mul:(1+a)*(1+sp)}}}
/* ---- lanes between plots: defenses or wings ---- */
function laneSlotsCalc(){const out=[];for(const p of S.plots){if(!p.open)continue;const[ox,oy]=plotOrigin(p);
  const e=nb(p,1,0);if(e&&e.open&&!joined(p,1,0))out.push({key:'h'+p.id,x0:ox+P,y0:oy,w:GAP,h:P,v:true,a:p.id,b:e.id});
  const d=nb(p,0,1);if(d&&d.open&&!joined(p,0,1))out.push({key:'v'+p.id,x0:ox,y0:oy+P,w:P,h:GAP,v:false,a:p.id,b:d.id})}return out}
function laneAt(x,y){return laneCache.find(s=>x>=s.x0&&x<s.x0+s.w&&y>=s.y0&&y<s.y0+s.h)||null}
function laneBlockCells(sl,type){if(type==='barricade')return sl.v?[[0,1],[1,1],[1,3],[2,3]]:[[1,0],[1,1],[3,1],[3,2]];if(type==='turret')return sl.v?[[1,2]]:[[2,1]];return[]}
function lanePostPos(sl){return sl.v?[sl.x0+1,sl.y0+2]:[sl.x0+2,sl.y0+1]}
function wingWalled(l){const W0=WINGS[l.w],p=S.plots[l.par];return W0.wall==='par'?!!(p&&p.type&&walled(p)):!!W0.wall}
function wingSide(sl,par){return sl.v?(par.id===sl.a?'W':'E'):(par.id===sl.a?'N':'S')}
function wingCell(sl,sd,i,j){return sd==='N'?[sl.x0+i,sl.y0+j]:sd==='S'?[sl.x0+4-i,sl.y0+2-j]:sd==='W'?[sl.x0+j,sl.y0+4-i]:[sl.x0+2-j,sl.y0+i]}
let laneSim=false;
function computeLanes(){S.lanes=S.lanes||{};laneCache=laneSlotsCalc();const keys=new Set(laneCache.map(s=>s.key));wingCells={};annexRoot={};
  const drop=(k,why)=>{const l=S.lanes[k],D=l.type==='wing'?(WINGS[l.w]?wingCost(l.w):null):LANES[l.type];if(D)refundCost(D,1);delete S.lanes[k];for(const c of S.cols)if(c.lpost===k)c.lpost=null;msg(why)};
  for(const k in S.lanes)if(!keys.has(k))drop(k,S.lanes[k].type==='wing'?'A wing had to come down because the plots next to it changed. Costs refunded.':'A lane defense had to make way for a joined building. Costs refunded.');
  const taken={};
  for(const sl of laneCache){const l=S.lanes[sl.key];if(!l)continue;
    if(l.type==='wing'){const p=S.plots[l.par],W0=WINGS[l.w];
      if(!W0||!p||(p.id!==sl.a&&p.id!==sl.b)||!p.type||!W0.of.includes(p.type)||taken[clusterRoot[p.id]+':'+l.w]){drop(sl.key,'A wing lost its building and was taken down. Costs refunded.');continue}
      taken[clusterRoot[p.id]+':'+l.w]=1;if(l.con&&!laneSim)continue;
      (annexRoot[clusterRoot[p.id]]=annexRoot[clusterRoot[p.id]]||[]).push({type:l.w,key:sl.key,par:p.id});
      const wl=wingWalled(l),rid=wl?regRoot[p.id]+1:0,cells=(wingCells[p.id]=wingCells[p.id]||[]);
      for(let y=sl.y0;y<sl.y0+sl.h;y++)for(let x=sl.x0;x<sl.x0+sl.w;x++){const i=x+y*W;owned[i]=p.id;if(wl)region[i]=rid;cells.push([x,y])}
      continue}
    if(l.con)continue;for(const[x,y]of laneBlockCells(sl,l.type))blocked[sl.x0+x+(sl.y0+y)*W]=1}}
function computeDoors(){doorList=[];regDoor={};reachOK=true;
  const N=W*H,reach=reachArr=new Uint8Array(N),q=[],s0=(GX+1)+GATE_Y*W;
  if(!blocked[s0]&&!region[s0]){reach[s0]=1;q.push(s0)}
  while(q.length){const c=q.pop(),cx=c%W,cy=(c-cx)/W;for(const[dx,dy]of DIR4){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=nx+ny*W;if(reach[ni]||blocked[ni]||region[ni])continue;reach[ni]=1;q.push(ni)}}
  const add=(a,b)=>{doorSet.add(a+','+b);doorSet.add(b+','+a);doorList.push([a,b])};
  let strict=true;const ok=(a,b)=>b>=0&&b<N&&!region[b]&&reach[b]&&!blocked[b]&&!blocked[a]&&(!strict||owned[b]<0);
  const regs={};for(const p of built().filter(walled)){const rid=regRoot[p.id]+1;(regs[rid]=regs[rid]||[]).push(p)}
  const cand=(p,sd)=>{const[ox,oy]=plotOrigin(p);return sd==='S'?[ox+2+(oy+P-1)*W,ox+2+(oy+P)*W]:sd==='W'?[ox+(oy+2)*W,ox-1+(oy+2)*W]:sd==='E'?[ox+P-1+(oy+2)*W,ox+P+(oy+2)*W]:[ox+2+oy*W,ox+2+(oy-1)*W]};
  for(const k in regs){const rid=+k,ps=regs[k].sort((a,b)=>a.id-b.id);let first=null;
    for(const p of ps){const[a,b]=cand(p,'S');if(region[a]===rid&&ok(a,b)){add(a,b);if(!first)first=[a,b]}}
    if(!first)for(const sd of['W','E','N']){for(const p of ps){const[a,b]=cand(p,sd);if(region[a]===rid&&ok(a,b)){add(a,b);first=[a,b];break}}if(first)break}
    for(const pass of[1,2]){if(first)break;strict=pass===1;outer:for(let i=0;i<N;i++){if(region[i]!==rid||blocked[i])continue;const x=i%W,y=(i-x)/W;for(const[dx,dy]of DIR4){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const b2=nx+ny*W;if(ok(i,b2)){add(i,b2);first=[i,b2];break outer}}}}strict=true;
    if(first)regDoor[rid]=first;else reachOK=false}
  for(const p of S.plots){if(!p.open||(p.type&&walled(p)))continue;const[ox,oy]=plotOrigin(p);let r=false;for(let y=oy;y<oy+P&&!r;y++)for(let x=ox;x<ox+P;x++)if(reach[x+y*W]){r=true;break}if(!r)reachOK=false}
}
function plotEntry(p){const[ox,oy]=plotOrigin(p);if(walled(p)){const d=regDoor[regRoot[p.id]+1];if(d){const a=d[0],b=d[1];return{cell:[b%W,Math.floor(b/W)],pt:[(a%W+b%W)/2+.5,(Math.floor(a/W)+Math.floor(b/W))/2+.5]}}}
  const cand=[[ox+2,oy+P],[ox+2,oy-1],[ox-1,oy+2],[ox+P,oy+2],[ox+1,oy+P],[ox+3,oy+P],[ox+1,oy-1],[ox+3,oy-1],[ox-1,oy+1],[ox-1,oy+3],[ox+P,oy+1],[ox+P,oy+3]],good=(x,y,st)=>x>=0&&y>=0&&x<W&&y<H&&walkable(x,y)&&!region[x+y*W]&&(!reachArr||reachArr[x+y*W])&&(!st||owned[x+y*W]<0);
  for(const st of[true,false])for(const[x,y]of cand)if(good(x,y,st))return{cell:[x,y],pt:[x+.5,y+.5]};return{cell:[ox+2,oy+2],pt:[ox+2.5,oy+2.5]}}
function buildLane(key,type){const D=LANES[type];if(!D||S.lanes[key]||!laneCache.some(s=>s.key===key))return;if(D.req&&!done(D.req)){msg('Needs research: '+reqName(D.req)+' first.','bad');return}if(!costOk(D)){msg(`Needs ${costStr(D)}.`,'bad');return}
  pay(D);S.lanes[key]={type,con:{prog:0,need:type==='turret'?conNeed(1):conNeed(0)}};rebuildBlocked();msg(`${D.n} planned.${conWho()}`,'good')}
function buildWing(key,w,pid){const sl=laneCache.find(s=>s.key===key),p=S.plots[pid],W0=WINGS[w];if(!sl||S.lanes[key]||!p||!p.type||!W0||(pid!==sl.a&&pid!==sl.b))return;
  if(!W0.of.includes(p.type)||clusterHasWing(p,w)){msg('This building already has that wing.','bad');return}
  if(w==='maproom'&&mapRoom(true)){msg('The colony already has a map room.','bad');return}
  const c=wingCost(w);if(!costOk(c)){msg(`Needs ${costStr(c)}.`,'bad');return}
  laneSim=true;rebuildBlocked();const before=reachOK;S.lanes[key]={type:'wing',w,par:pid};rebuildBlocked();const after=reachOK;delete S.lanes[key];laneSim=false;rebuildBlocked();
  if(before&&!after){msg('A wing there would cut off part of the base. Pick another lane.','bad');return}
  pay(c);S.lanes[key]={type:'wing',w,par:pid,con:{prog:0,need:conNeed(0)}};rebuildBlocked();msg(`${W0.n} planned.${conWho()}`,'good')}
function demoLane(key){const l=S.lanes[key];if(!l)return;refundCost(laneDef(l),l.con?1:.5);delete S.lanes[key];for(const c of S.cols)if(c.lpost===key)c.lpost=null;rebuildBlocked();unstick();sel=null;msg(`${laneName(l)} taken down.`)}
function lanePostFor(c){const ins=aliveRaiders().filter(r=>r.inside);if(!ins.length)return null;let best=null,bd=20;
  for(const sl of laneCache){const l=S.lanes[sl.key];if(!l||l.con||l.type!=='post')continue;if(S.cols.some(o=>o!==c&&o.lpost===sl.key&&fighter(o)))continue;const[px2,py2]=lanePostPos(sl);if(!ins.some(r=>Math.hypot(r.x-px2,r.y-py2)<12))continue;const d=Math.hypot(px2+.5-c.x,py2+.5-c.y)-(c.lpost===sl.key?6:0);if(d<bd){bd=d;best=sl}}return best}
function nearestInside(x,y,range){let best=null,bd=range;for(const r of aliveRaiders()){if(!r.inside)continue;const d=Math.hypot(r.x-x,r.y-y);if(d<bd){bd=d;best=r}}return best}
function connected(p){if(p.small)return[p];return S.plots.filter(q=>q.type&&clusterRoot[q.id]===clusterRoot[p.id])}

