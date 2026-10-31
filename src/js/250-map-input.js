/* ================= map input ================= */
let pointer=null;
function tileAt(cx,cy){const[wx,wy]=s2w(cx,cy);return[Math.floor(wx/T),Math.floor(wy/T)]}
function colAt(wx,wy){for(const c of S.cols){if(c.sleeping)continue;if(Math.hypot(c.x*T-wx,(c.y-.3)*T-wy)<T*.45)return c}return null}
function entAt(wx,wy){
  const c=colAt(wx,wy);if(c)return{k:'col',id:c.id};
  if(S.orbital){const pp=padPos();if(pp&&Math.hypot(wx/T-pp[0],wy/T-pp[1])<1.3)return{k:'shuttle'}}
  for(const v of S.vis){const r=v.k==='pack'?T*.7:T*.45;if(Math.hypot(v.x*T-wx,(v.y-.3)*T-wy)<r)return{k:'vis',id:v.id}}
  for(const a of S.ani){const r=a.type==='shaggox'?T*.7:T*.4;if(Math.hypot(a.x*T-wx,(a.y-.3)*T-wy)<r)return{k:'ani',id:a.id}}
  for(const a of S.wild){if(Math.hypot(a.x*T-wx,(a.y-.1)*T-wy)<T*.5)return{k:'wild',id:a.id}}
  const x=Math.floor(wx/T),y=Math.floor(wy/T);
  for(const sl of wallSlots())if(Math.hypot(sl.x+.5-wx/T,sl.y+.5-wy/T)<.75)return{k:'slot',id:sl.id};
  {const tk=trapAt(x,y);if(tk!==null)return{k:'trap',key:tk}}
  for(const o of S.outside)if(Math.abs(o.x+.5-wx/T)<.7&&Math.abs(o.y+.2-wy/T)<.8)return{k:'out',id:o.id};
  const k=kAt(x,y);
  if(k===4)return{k:'gate',cell:x+y*W};
  if(k===1){let best=null,bd=2.3;for(const sl of wallSlots()){const d=Math.hypot(sl.x-x,sl.y-y);if(d<bd){bd=d;best=sl}}return best?{k:'slot',id:best.id}:{k:'wall'}}
  if(k===5){const ws=wpAt(x,y);return ws?{k:'wp',key:ws.key}:null}
  if(k===2){const ls=laneAt(x,y);if(ls)return{k:'lane',key:ls.key}}
  const p=plotAt(x,y);if(p&&(p.open||(k===0&&S.proj&&S.proj.pid===p.id)))return{k:'plot',id:p.id};return null;
}
function startColDrag(c,e){dragCol={id:c.id,sx:e.clientX,sy:e.clientY,moved:false,target:null};sel={k:'col',id:c.id}}
function moveColDrag(e){
  if(!dragCol)return;
  if(!dragCol.moved&&Math.hypot(e.clientX-dragCol.sx,e.clientY-dragCol.sy)>6){dragCol.moved=true;const g=$('ghost');g.hidden=false;g.innerHTML=`<img src="${portrait(colById(dragCol.id))}" alt="">`}
  if(dragCol.moved){const g=$('ghost');g.style.left=e.clientX+'px';g.style.top=e.clientY+'px';const onMap=document.elementFromPoint(e.clientX,e.clientY)===cv;const[x,y]=tileAt(e.clientX,e.clientY);let t=null;if(onMap){const sd=sideOfTile(x,y);const k=kAt(x,y),p=plotAt(x,y);if(sd)t='guard';else if(p&&!p.open&&k===0&&S.proj&&S.proj.pid===p.id)t='b:'+p.id;else if(k===0)t='out';else if(k===5){const ws=wpAt(x,y);if(ws&&plotById('w'+ws.key))t='w'+ws.key}else if(p&&p.open&&slots(p))t=p.id}dragCol.target=t;dragCol.onMap=onMap;updateHint()}
}
function endColDrag(){
  if(!dragCol)return;const c=colById(dragCol.id);
  if(dragCol.moved&&c&&dragCol.onMap){const t=dragCol.target;if(typeof t==='string'&&t.startsWith('b:')){const p=plotById(+t.slice(2));if(!S.proj)startExpansion(p);assign(c,'build')}else assign(c,t)}
  $('ghost').hidden=true;dragCol=null;updateUI();
}
cv.addEventListener('contextmenu',e=>e.preventDefault());
const tps=new Map();let pinch=null;
function pinchStart(){const a=[...tps.values()],mx=(a[0].x+a[1].x)/2,my=(a[0].y+a[1].y)/2,[wx,wy]=s2w(mx,my);pinch={d0:Math.max(20,Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)),z0:cam.z,wx,wy};camAnim=null;pointer=null;if(dragCol){dragCol=null;$('ghost').hidden=true}}
cv.addEventListener('pointercancel',e=>{tps.delete(e.pointerId);if(tps.size<2)pinch=null;pointer=null});
cv.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'){tps.set(e.pointerId,{x:e.clientX,y:e.clientY});if(tps.size===2){pinchStart();return}if(tps.size>2)return}
  cv.setPointerCapture(e.pointerId);
  const[wx,wy]=s2w(e.clientX,e.clientY);
  if(e.button===0&&trapMode){const x=Math.floor(wx/T),y=Math.floor(wy/T);pointer={paint:true,last:x+','+y};if(trapMode==='remove')demoTrap(x+y*W);else placeTrap(x,y,trapMode);updateUI();return}
  if(e.button!==0){pointer={pan:true,sx:e.clientX,sy:e.clientY,cx:cam.x,cy:cam.y,moved:true};return}
  const c=colAt(wx,wy);if(c){startColDrag(c,e);updateUI();return}
  pointer={pan:false,sx:e.clientX,sy:e.clientY,cx:cam.x,cy:cam.y,moved:false,wx,wy};
});
cv.addEventListener('pointermove',e=>{
  if(tps.has(e.pointerId)){tps.get(e.pointerId).x=e.clientX;tps.get(e.pointerId).y=e.clientY}
  if(pinch&&tps.size>=2){if(ovMode)return;const a=[...tps.values()],mx=(a[0].x+a[1].x)/2,my=(a[0].y+a[1].y)/2,d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);cam.z=clamp(pinch.z0*d/pinch.d0,.3,2.6);cam.x=pinch.wx-(mx-cw/2)/cam.z;cam.y=pinch.wy-(my-ch/2)/cam.z;clampCam();return}
  if(e.pointerType==='mouse')hover=tileAt(e.clientX,e.clientY);
  if(dragCol){moveColDrag(e);return}
  if(pointer&&pointer.paint){const[x,y]=tileAt(e.clientX,e.clientY),key=x+','+y;if(key!==pointer.last){pointer.last=key;if(trapMode==='remove')demoTrap(x+y*W);else placeTrap(x,y,trapMode)}return}
  if(pointer){const dx=e.clientX-pointer.sx,dy=e.clientY-pointer.sy;if(!pointer.moved&&Math.hypot(dx,dy)>(e.pointerType==='mouse'?5:10))pointer.moved=true;if(pointer.moved){camAnim=null;cam.x=pointer.cx-dx/cam.z;cam.y=pointer.cy-dy/cam.z;clampCam()}}
});
cv.addEventListener('pointerup',e=>{
  if(tps.has(e.pointerId)){tps.delete(e.pointerId);if(pinch){if(tps.size<2)pinch=null;pointer=null;return}}
  if(dragCol){endColDrag();return}
  if(pointer&&pointer.paint){pointer=null;updateUI();return}
  if(pointer&&!pointer.moved&&!pointer.pan&&landMode){const x=Math.floor(pointer.wx/T),y=Math.floor(pointer.wy/T),p=plotAt(x,y);if(p&&lockedAdj(p)){if(startExpansion(p)){landMode=false;sel={k:'plot',id:p.id}}}else msg('Pick one of the highlighted plots next to the base.','bad');updateUI();pointer=null;return}
  if(pointer&&!pointer.moved&&!pointer.pan&&gateMode){tryPlaceGate(Math.floor(pointer.wx/T),Math.floor(pointer.wy/T));updateUI();pointer=null;return}
  if(pointer&&!pointer.moved&&!pointer.pan){
    const hit=entAt(pointer.wx,pointer.wy);sel=hit;if(MOB&&hit){if(tab)tab=null;document.body.classList.remove('sheet-min');const sy=(pointer.wy-cam.y)*cam.z+ch/2;if(sy>ch*.4){camAnim={z:cam.z,x:cam.x,y:cam.y+(sy-ch*.28)/cam.z}}}if(hit&&hit.k==='shuttle'){sel=null;modal={k:'trade',who:'orbital'};renderModal()}
    if(hit&&hit.k==='vis'){const v=S.vis.find(v=>v.id===hit.id);if(v&&v.k==='wanderer'){const l=S.letters.find(l=>l.k==='join');if(l)openLetter(l)}if(v&&v.k==='pack'){v.hop=performance.now();v.em={k:'heart',until:S.t+2}}}
    updateUI();
  }
  pointer=null;
});
cv.addEventListener('pointerleave',()=>{hover=null});
document.addEventListener('pointermove',e=>{if(dragCol&&e.target!==cv)moveColDrag(e)});
document.addEventListener('pointerup',e=>{if(dragCol&&e.target!==cv)endColDrag()});
let pbPend=null;
document.addEventListener('pointermove',e=>{if(!pbPend||e.pointerId!==pbPend.id)return;const dx=e.clientX-pbPend.sx,dy=e.clientY-pbPend.sy;
  if(pbPend.mode==='scroll'){$('pawnbar').scrollLeft=pbPend.sl-dx;return}
  if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){const c=colById(pbPend.cid);pbPend=null;if(c){startColDrag(c,{clientX:pbPend?0:e.clientX,clientY:e.clientY});dragCol.sx=-999;moveColDrag(e);updateUI()}return}
  if(Math.abs(dx)>8)pbPend.mode='scroll'});
document.addEventListener('pointerup',e=>{if(!pbPend||e.pointerId!==pbPend.id)return;const p0=pbPend;pbPend=null;if(p0.mode!=='scroll'){const c=colById(p0.cid);if(c){const now=performance.now();if(p0.el._last&&now-p0.el._last<350)centerOn(c.x*T,c.y*T);p0.el._last=now;sel={k:'col',id:c.id};updateUI()}}});
$('pawnbar').addEventListener('pointerdown',e=>{
  const el=e.target.closest('.pw[data-pid]');if(!el||e.button!==0)return;e.preventDefault();
  if(e.pointerType!=='mouse'){pbPend={id:e.pointerId,cid:+el.dataset.pid,sx:e.clientX,sy:e.clientY,sl:$('pawnbar').scrollLeft,el,mode:null};return}
  const c=colById(+el.dataset.pid);if(!c)return;
  const now=performance.now();if(el._last&&now-el._last<350)centerOn(c.x*T,c.y*T);el._last=now;
  startColDrag(c,e);updateUI();
});
cv.addEventListener('wheel',e=>{
  e.preventDefault();const[wx,wy]=s2w(e.clientX,e.clientY);
  if(ovMode||camAnim)return;cam.z=clamp(cam.z*Math.pow(1.0015,-e.deltaY),.45,2.6);
  const[nx,ny]=s2w(e.clientX,e.clientY);cam.x+=wx-nx;cam.y+=wy-ny;clampCam();
},{passive:false});
const keys={};
addEventListener('keydown',e=>{
  if(cine){if(e.key==='Escape'||e.key===' '||e.key==='Enter'){e.preventDefault();cineSkip()}return}
  if(e.target.tagName==='SELECT'||e.target.tagName==='INPUT')return;
  if(e.code==='Space'){e.preventDefault();if(S.speed===0)S.speed=S._last||1;else{S._last=S.speed;S.speed=0}updateUI()}
  else if(e.key==='1'||e.key==='2'||e.key==='3'){S.speed=+e.key;updateUI()}
  else if(e.key==='m'||e.key==='M'){toggleOverview();updateUI()}
  else if(e.key==='Escape'){if(trapMode)trapMode=null;else if(landMode)landMode=false;else if(gateMode)gateMode=false;else if(modal)closeModal();else if(tab)tab=null;else sel=null;updateUI()}
  keys[e.key.toLowerCase()]=true;
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
let ovMode=false,camAnim=null;
function ovTarget(){const sw=sideW(),bw=(W+PADL*.7+PADR*.75)*T,bh=(H+PADT*1.2)*T,z=clamp(Math.min((cw-sw-20)/bw,(ch-80)/bh),.12,.6);const wx=(W+PADR*.75-PADL*.7)/2*T,wy=H*T/2;return{z,x:wx+sw/2/z,y:wy+36/2/z}}
function normTarget(){if(MOB){const b=baseBox(),top=56,bot=118,x0=b.x0-1,x1=b.x1+1,y0=b.y0-.5,y1=b.y1+.5,z=clamp(Math.min((cw-12)/((x1-x0)*T),(ch-top-bot)/((y1-y0)*T)),.3,1.4);return{z,x:(x0+x1)/2*T,y:(y0+y1)/2*T+(bot-top)/2/z}}const b=baseBox(),sw=sideW(),x0=b.x0-6,x1=b.x1+.8,y0=b.y0-.8,y1=b.y1+.8,z=clamp(Math.min((cw-sw-20)/((x1-x0)*T),(ch-150)/((y1-y0)*T)),.45,1.5);return{z,x:(x0+x1)/2*T+sw/2/z,y:(y0+y1)/2*T+36/2/z}}
function toggleOverview(){ovMode=!ovMode;if(ovMode){camAnim=ovTarget()}else camAnim=defMode?defTarget():normTarget()}
function clampCam(){
  if(camAnim)return;
  const sw=sideW(),ox=sw/2/cam.z,oy=36/2/cam.z;
  let vx=cam.x-ox,vy=cam.y-oy;
  vx=clamp(vx,-PADL*T*.85,(W+PADR*.85)*T);vy=clamp(vy,-PADT*T*.85,(H+PADB*.85)*T);
  cam.x=vx+ox;cam.y=vy+oy;
}
function fitCam(){ovMode=false;camAnim=null;const t=normTarget();cam.z=t.z;cam.x=t.x;cam.y=t.y;clampCam()}





