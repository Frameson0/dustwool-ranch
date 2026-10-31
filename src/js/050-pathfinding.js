/* ================= pathfinding ================= */
function cellCost(i){if(owned[i]>=0)return 3;const k=kind[i];if(k===5)return 1;if(k===2){const t=roadTier?roadTier[i]:-1;return t<0?1:[.9,.8,.7][t]}if(k===3)return 3;return 1.4}
function findPath(sx,sy,tx,ty,raw){
  sx=clamp(sx,0,W-1);sy=clamp(sy,0,H-1);
  if(sx===tx&&sy===ty)return[];
  if(!walkable(tx,ty))return null;
  const N=W*H,g=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),cl=new Uint8Array(N);
  const heap=[],hf=[];
  const push=(i,f)=>{heap.push(i);hf.push(f);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(hf[p]<=hf[k])break;[heap[p],heap[k]]=[heap[k],heap[p]];[hf[p],hf[k]]=[hf[k],hf[p]];k=p}};
  const pop=()=>{const top=heap[0],li=heap.pop(),lf=hf.pop();if(heap.length){heap[0]=li;hf[0]=lf;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&hf[l]<hf[m])m=l;if(r<heap.length&&hf[r]<hf[m])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];[hf[m],hf[k]]=[hf[k],hf[m]];k=m}}return top};
  const hc=(x,y)=>{const dx=Math.abs(x-tx),dy=Math.abs(y-ty);return(Math.max(dx,dy)+.414*Math.min(dx,dy))*.7};
  const s=sx+sy*W,goal=tx+ty*W;g[s]=0;push(s,hc(sx,sy));
  let it=0;
  while(heap.length&&it++<9000){
    const cur=pop();if(cur===goal)break;if(cl[cur])continue;cl[cur]=1;
    const cx=cur%W,cy=(cur-cx)/W;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;
      if(!walkable(nx,ny))continue;
      const ni=nx+ny*W;if(rMode&&kind[ni]===4&&!S.breach[ni])continue;
      if(dx&&dy){if(raw)continue;const a=cx+dx+cy*W,b=cx+ny*W;if(!walkable(cx+dx,cy)||!walkable(cx,ny))continue;if(region[cur]!==region[ni]||region[cur]!==region[a]||region[cur]!==region[b])continue}
      else if(!edgeOK(cur,ni))continue;
      const c=raw?(wpMask&&wpMask[ni]?9:(kind[ni]===3||owned[ni]>=0)?3:(kind[ni]===2||kind[ni]===5)?1:1.4):cellCost(ni)+(wpMask&&wpMask[ni]?1:0),ng=g[cur]+c*(dx&&dy?1.414:1);
      if(ng<g[ni]){g[ni]=ng;from[ni]=cur;push(ni,ng+hc(nx,ny))}
    }
  }
  if(from[goal]<0)return null;
  const path=[];let c=goal;while(c!==s&&c>=0){path.push([c%W,Math.floor(c/W)]);c=from[c]}
  return path.reverse();
}
function computeRoads(){
  roadTier=new Int8Array(W*H).fill(-1);routes=[];S.road=S.road||{};
  const homes=built('housing'),others=built().filter(p=>p.type!=='housing');
  const seen=new Set(),gx=GX+1.15;
  const addR=(src,dst,startPt,endPt)=>{
    const key=src+'>'+dst;if(seen.has(key))return;seen.add(key);
    const path=findPath(src[0],src[1],dst[0],dst[1],true);if(!path)return;
    routes.push({cells:[src,...path],sp:startPt,ep:endPt});
  };
  const gate=[GX+1,GATE_Y];
  const entries=new Map();
  for(const p of built())entries.set(p.id,plotEntry(p));
  for(const h of homes){const e=entries.get(h.id);addR(gate,e.cell,[gx,GATE_Y+.5],e.pt)}
  for(const p of others){
    const e=entries.get(p.id);let src=gate,sp=[gx,GATE_Y+.5];
    if(homes.length){let bd=1e9;for(const h of homes){const he=entries.get(h.id),d=Math.abs(he.cell[0]-e.cell[0])+Math.abs(he.cell[1]-e.cell[1]);if(d<bd){bd=d;src=he.cell;sp=he.pt}}}
    addR(src,e.cell,sp,e.pt);
  }
  for(const g of S.gates){if(g.main)continue;const inn=wallInfo.inner[g.x+g.y*W];if(inn===undefined||inn<0)continue;
    const src=[inn%W,Math.floor(inn/W)];let best=null,bd=1e9;
    for(const r of routes)for(const[cx,cy]of r.cells){const k=kAt(cx,cy);if((k!==2&&k!==5)||!walkable(cx,cy))continue;const d=Math.abs(cx-src[0])+Math.abs(cy-src[1]);if(d<bd){bd=d;best=[cx,cy]}}
    const dst=best||gate,[ox,oy]=OUTV[gateSide(g)];
    addR(src,dst,[g.x+.5-ox*.6,g.y+.5-oy*.6],[dst[0]+.5,dst[1]+.5]);
  }
  const used=new Set();
  for(const r of routes)for(const[x,y]of r.cells){const i=x+y*W;if((kind[i]===2||kind[i]===5)&&owned[i]<0){used.add(i);if(S.road[i]===undefined)S.road[i]=S.roadMig?(S.roadTarget||0):0;roadTier[i]=S.road[i]}}
  for(const k in S.road)if(!used.has(+k))delete S.road[k];
  if(S.roadCon&&!used.has(S.roadCon.cell))S.roadCon=null;
  gateT=S.road[(GX+1)+GATE_Y*W]??0;if(S.roadMig&&routes.length)delete S.roadMig;
}
function routeRuns(r){
  const P=[r.sp,...r.cells.map(([x,y])=>[x+.5,y+.5]),r.ep].filter(Boolean),off=r.sp?1:0;
  const tierAt=k=>{const ci=clamp(k-off,0,r.cells.length-1),[x,y]=r.cells[ci],t=roadTier[x+y*W];return t<0?0:t};
  const runs=[];let cur=null;
  for(let k=0;k<P.length-1;k++){const t=Math.min(tierAt(k),tierAt(k+1));if(!cur||cur.t!==t){cur={t,pts:[P[k]]};runs.push(cur)}cur.pts.push(P[k+1])}
  for(const ru of runs)ru.pts=simplify(ru.pts);return runs;
}
function roadPending(){const out=[];for(const k in S.road)if(S.road[k]<(S.roadTarget||0))out.push(+k);return out}
function roadMat(t){return t===1?'wood':'stone'}
function roadUpgrade(){if((S.roadTarget||0)>=2)return;S.roadTarget=(S.roadTarget||0)+1;msg(`Paths will be paved with ${S.roadTarget===1?'wood planks (1 wood per tile)':'stone tiles (1 stone per tile)'}. Builders get to it.`,'good')}
function simplify(pts){
  if(pts.length<3)return pts;const out=[pts[0]];
  for(let i=1;i<pts.length-1;i++){const a=out[out.length-1],b=pts[i],c=pts[i+1];const cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(Math.abs(cr)>1e-6)out.push(b)}
  out.push(pts[pts.length-1]);return out;
}
function stepMove(e,dt,v){
  let d=v*dt;
  while(d>0&&e.path&&e.path.length){
    const[tx,ty]=e.path[0],gx=tx+.5,gy=ty+.5,dx=gx-e.x,dy=gy-e.y,dist=Math.hypot(dx,dy);
    if(Math.abs(dx)>.05)e.face=dx<0?'l':'r';else if(Math.abs(dy)>.05)e.face=dy<0?'u':'d';
    const ci=Math.floor(e.x)+Math.floor(e.y)*W,rt=roadTier&&ci>=0&&ci<roadTier.length?roadTier[ci]:-1,boost=rt>=0?1+.15*(rt+1):1,step=d*boost;
    if(dist<=step){e.x=gx;e.y=gy;e.path.shift();d-=dist/boost}else{e.x+=dx/dist*step;e.y+=dy/dist*step;d=0}
  }
  if(e.path&&!e.path.length&&e.face!=='l'&&e.face!=='r')e.face='d';
}
let rMode=false;
function rGoTo(e,tx,ty){rMode=true;const ok=goTo(e,tx,ty);rMode=false;return ok}
function goTo(e,tx,ty){const p=findPath(Math.floor(e.x),Math.floor(e.y),tx,ty);if(p===null)return false;e.path=p;return true}

