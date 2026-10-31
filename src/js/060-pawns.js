/* ================= pawns ================= */
function genPawn(bias){
  const sk={},pa={},xp={};
  for(const s of SKILLS){sk[s]=RI(0,7);pa[s]=Math.random()<.2?1:0;xp[s]=0}
  if(bias){sk[bias]=RI(8,13);pa[bias]=Math.random()<.5?2:1}
  const traits=[],keys=Object.keys(TRAITS),nt=Math.random()<.5?1:2;
  while(traits.length<nt){const k=pick(keys);if(traits.includes(k)||traits.some(t=>TRAITS[t].x===k))continue;traits.push(k)}
  const used=new Set((S.cols||[]).map(c=>c.nick));let nick=pick(NICK);for(let k=0;k<12&&used.has(nick);k++)nick=pick(NICK);
  return{id:nid(),name:pick(FIRST),last:pick(LAST),nick,age:RI(19,58),skin:pick(SKIN),hair:pick(HAIRC),hs:RI(0,3),shirt:pick(SHIRTS),
    sk,pa,xp,traits,x:0,y:0,assign:null,carry:null,hold:null,status:'Idle',face:'d',path:[],job:null,wait:0,food:.8,rested:1,buff:1};
}
function homeBonus(c){const b=bedOf(c);if(!b)return 1;let p=S.plots[b.pid];if(!p)return 1;if(isAnnex(p)){p=annexParent(p);if(!p)return 1}const bi=bonusInfo[clusterRoot[p.id]];return Math.max(.7,1+.05*((clusterSize[p.id]||1)-1)+(bi?bi.adjV+bi.home:0))}
function workMult(c,s){
  const ap=typeof c.assign==='number'?S.plots[c.assign]:null,dm=ap&&ap.dmg?1-.5*ap.dmg:1;
  let m=.45+c.sk[s]*.075;
  for(const t of c.traits){const d=TRAITS[t];if(d.m){if(d.m.all)m*=d.m.all;if(d.m[s])m*=d.m[s]}}
  if(c.food<=0)m*=.6;m*=c.rested*(c.buff||1)*homeBonus(c)*dm*(1+bonus('work'));
  return m;
}
function walkSpd(c){let v=3*(1+bonus('walk'));for(const t of c.traits)if(TRAITS[t].walk)v*=TRAITS[t].walk;if(isHauler(c))v*=1+.03*c.sk.hauling;return v}
function isHauler(c){if(c.assign===null||c.assign==='out')return false;const p=plotById(c.assign);return !!(p&&p.type==='storage')}
function haulers(){return S.cols.filter(isHauler)}
function haulCap(c){const p=plotById(c.assign);return Math.round(tierDef(p).carry*(1+.05*c.sk.hauling)*(c.traits.includes('strong')?1.2:1))}
function loadSize(c){return(c.load||[]).reduce((a,l)=>a+l.n,0)}
function addGround(i,n,x,y,pid,lay){const g=S.ground.find(g=>g.x===x&&g.y===y&&g.i===i&&!g.r);if(g)g.n+=n;else S.ground.push({id:nid(),i,n,x,y,pen:pid,r:0,lay:!!lay})}
function dropCell(c,item){
  if(c.assign==='out'){const cands=[[GX-2,GATE_Y+1],[GX-1,GATE_Y+1],[GX-2,GATE_Y]];return pickPile(cands,item,'out')}
  const p=c.assign!==null?plotById(c.assign):null;if(!p||!p.type||p.type==='storage')return null;
  const[ox,oy]=plotOrigin(p),cands=(p.small?[[0,0],[1,0],[0,4],[1,4],[4,0],[4,1]].filter(([x,y])=>x<p.sl.w&&y<p.sl.h):[[4,4],[0,4],[4,3],[0,3],[3,4],[1,4]]).map(([x,y])=>[ox+x,oy+y]).filter(([x,y])=>walkable(x,y));
  return pickPile(cands,item,p.id);
}
function pickPile(cands,item,pid){
  for(const[x,y]of cands)if(S.ground.some(g=>g.x===x&&g.y===y&&g.i===item))return[x,y,pid];
  for(const[x,y]of cands)if(!S.ground.some(g=>g.x===x&&g.y===y))return[x,y,pid];
  return cands.length?[...cands[0],pid]:null;
}
function outOfGrid(c){return c.x<0||c.y<0||c.x>=W||c.y>=H}
function rockAt(x,y){if(!rockM)return false;const cx=Math.floor(x)-RX0,cy=Math.floor(y)-RY0;if(cx<0||cy<0||cx>=RWd||cy>=RHt)return true;return rockM[cx+cy*RWd]===1}
function solidW(cx,cy){if(rockAt(cx,cy))return true;if(cx>=0&&cy>=0&&cx<W&&cy<H){const i=cx+cy*W,k=kind[i];if((k===1||k===4)&&S.wall>=0&&!S.breach[i])return true}return false}
function clearLine(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/.35),tc=Math.floor(x1)+','+Math.floor(y1);for(let k=1;k<n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;if(Math.floor(x)+','+Math.floor(y)===tc)break;if(solidW(Math.floor(x),Math.floor(y)))return false}return true}
function wpath(sx,sy,tx,ty){const W2=RWd,H2=RHt,s0=(Math.floor(sx)-RX0)+(Math.floor(sy)-RY0)*W2,g0=(Math.floor(tx)-RX0)+(Math.floor(ty)-RY0)*W2;if(s0<0||g0<0||s0>=W2*H2||g0>=W2*H2)return null;
  const N=W2*H2,g=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),cl=new Uint8Array(N),hp=[],hf=[];
  const push=(i,f)=>{hp.push(i);hf.push(f);let k=hp.length-1;while(k>0){const p=(k-1)>>1;if(hf[p]<=hf[k])break;[hp[p],hp[k]]=[hp[k],hp[p]];[hf[p],hf[k]]=[hf[k],hf[p]];k=p}};
  const pop=()=>{const top=hp[0],li=hp.pop(),lf=hf.pop();if(hp.length){hp[0]=li;hf[0]=lf;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<hp.length&&hf[l]<hf[m])m=l;if(r<hp.length&&hf[r]<hf[m])m=r;if(m===k)break;[hp[m],hp[k]]=[hp[k],hp[m]];[hf[m],hf[k]]=[hf[k],hf[m]];k=m}}return top};
  const gx=g0%W2,gy=(g0-gx)/W2,h=(x,y)=>Math.hypot(x-gx,y-gy),bl=(x,y)=>{const i=x+y*W2;if(i===g0||i===s0)return false;const ax=x+RX0,ay=y+RY0;if(ax>=0&&ay>=0&&ax<W&&ay<H){const k=kind[ax+ay*W];if((k===1||k===4)&&S.wall>=0&&!S.breach[ax+ay*W])return true}return false},rc=(x,y)=>rockAt(x+RX0,y+RY0)?40:0;
  g[s0]=0;push(s0,h(s0%W2,(s0-s0%W2)/W2));let it=0;
  while(hp.length&&it++<12000){const c=pop();if(c===g0)break;if(cl[c])continue;cl[c]=1;const cx=c%W2,cy=(c-cx)/W2;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W2||ny>=H2||bl(nx,ny))continue;if(dx&&dy&&(bl(cx+dx,cy)||bl(cx,cy+dy)))continue;const ni=nx+ny*W2,ng=g[c]+(dx&&dy?1.414:1)+rc(nx,ny);if(ng<g[ni]){g[ni]=ng;from[ni]=c;push(ni,ng+h(nx,ny))}}}
  if(from[g0]<0)return null;const out=[];let c=g0;while(c!==s0&&c>=0){out.push([c%W2+RX0+.5,Math.floor(c/W2)+RY0+.5]);c=from[c]}out.reverse();if(out.length)out[out.length-1]=[tx,ty];return out}
function freeMove(e,tx,ty,v,dt,stopAt){
  if(hasRock&&Math.hypot(tx-e.x,ty-e.y)>(stopAt||0)+.3&&!clearLine(e.x,e.y,tx,ty)){
    const key=Math.round(tx*2)+','+Math.round(ty*2);if(!e.fp||e.fp.key!==key||e.fp.t<=0){e.fp={key,pts:wpath(e.x,e.y,tx,ty)||[],t:5}}e.fp.t-=dt;const P0=e.fp.pts;
    while(P0.length>1&&Math.hypot(P0[0][0]-e.x,P0[0][1]-e.y)<.35)P0.shift();
    if(P0.length){let k=0;for(let i=Math.min(P0.length-1,8);i>0;i--)if(clearLine(e.x,e.y,P0[i][0],P0[i][1])){k=i;break}const q=P0[k],dx=q[0]-e.x,dy=q[1]-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(v*dt,d);if(Math.abs(dx)>.05)e.face=dx<0?'l':'r';e.path=[];e.x+=dx/d*m;e.y+=dy/d*m;return false}}
  else if(e.fp)e.fp=null;
const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy),st=v*dt,goal=stopAt||0;if(d<=goal+.05)return true;if(Math.abs(dx)>.05)e.face=dx<0?'l':'r';e.path=[];const m=Math.min(st,d-goal);e.x+=dx/d*m;e.y+=dy/d*m;return d-m<=goal+.05}
function bestWeapon(){for(const w of[...RANGED,...MELEE])if(cnt(w)>=1)return w;return null}
function huntJob(c,p){
  if(paused(p)){c.status=pauseText(p);return null}
  if(!c.weapon){const w=bestWeapon();if(!w){c.status='Needs a weapon: craft a bow or spear at a crafting spot';return null}return{t:'arm',st:0}}
  const prey=S.wild.filter(a=>!a.dead&&!a.r);
  if(!prey.length){c.status='Waiting at camp, no game in sight';return null}
  const a=nearest(c,prey,a=>[a.x,a.y]);a.r=c.id;return{t:'hunt',st:0,aid:a.id};
}
function haulJob(c,p){
  const cand=S.ground.filter(g=>!g.r);
  if(!cand.length){c.status='Waiting for goods to haul';return null}
  const g=nearest(c,cand,g=>[g.x,g.y]);g.r=c.id;return{t:'collect',gid:g.id,st:0};
}
function gainXP(c,s,a){a*=(1+bonus('xp'))*BAL.xp;
  if(c.sk[s]>=20)return;
  c.xp[s]+=a*(c.pa[s]===2?2:c.pa[s]===1?1.5:1);
  const need=40*(c.sk[s]+1);
  if(c.xp[s]>=need){c.xp[s]-=need;c.sk[s]++;sfx('level');if(c.sk[s]===10||c.sk[s]===15||c.sk[s]===20)chron('people',`${c.nick} became ${c.sk[s]===20?'a master':c.sk[s]===15?'an expert':'skilled'} at ${SKN[s].toLowerCase()} (${c.sk[s]}).`);msg(`${c.nick}'s ${SKN[s]} skill rose to ${c.sk[s]}.`,'good')}
}
function allBeds(){const out=[];for(const p of built('housing')){const L=layouts[p.id],[ox,oy]=plotOrigin(p);for(const[x,y]of L.beds)out.push({pid:p.id,x:ox+x,y:oy+y})}for(const r in annexRoot)for(const a of annexRoot[r]){if(a.type!=='bunk')continue;const sl=laneCache.find(s=>s.key===a.key),p=S.plots[a.par];if(!sl||!p)continue;const sd=wingSide(sl,p);for(const i of[0,1,3,4]){const[x,y]=wingCell(sl,sd,i,1);out.push({pid:p.id,x,y})}}for(const sl of wpOfType('bunk'))for(const b of bunkBeds(sl))out.push({pid:-1,x:b[0],y:b[1],wp:sl.key});return out}
function bunkBeds(sl){return sl.h>sl.w?[[sl.x0,sl.y0+1],[sl.x0+1,sl.y0+1]]:[[sl.x0+1,sl.y0],[sl.x0+3,sl.y0]]}
const SHELF_P={id:-5,type:'storage',tier:0};
function shelfCells(){const out=[];for(const sl of wpOfType('shelf')){if(sl.h>sl.w){const x=sl.side==='W'?sl.x0:sl.x0+1;for(let y=sl.y0;y<sl.y0+5;y++)out.push([x,y,SHELF_P])}else{const y=sl.side==='N'?sl.y0:sl.y0+1;for(let x=sl.x0;x<sl.x0+5;x++)out.push([x,y,SHELF_P])}}return out}
function kitchenCells(){return cellsOf('kitchen','store')}
function bedOf(c){const i=S.cols.indexOf(c),b=allBeds();return b[i]||null}
function bedCount(){return allBeds().length}
function isNight(){const hr=(S.t%DAY)/DAY*24;return hr>=23||hr<3}
function commons(){return built('commons')[0]||null}
function commonsBuff(){const c=built('commons');let b=1;for(const p of c)b=Math.max(b,tierDef(p).buff*(1+.02*((clusterSize[p.id]||1)-1))+((bonusInfo[clusterRoot[p.id]]||{}).buff||0));return b}

