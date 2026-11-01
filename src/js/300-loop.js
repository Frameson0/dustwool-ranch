/* ================= loop ================= */
let last=performance.now(),uiAcc=0,saveAcc=0;
let errN=0,goodFrames=0,crashShown=false;
function frame(now){try{frameBody(now);errN=Math.max(0,errN-.05);goodFrames++;if(goodFrames===3)bootVerify()}catch(e){errN++;console.error(e);if(errN>4&&!crashShown){crashShown=true;bootFail('The game hit an error while drawing.',e)}}requestAnimationFrame(frame)}
function frameBody(now){
  const rdt=Math.min(.1,(now-last)/1000);last=now;
  if(camAnim){const k=1-Math.exp(-rdt*7);cam.z+=(camAnim.z-cam.z)*k;cam.x+=(camAnim.x-cam.x)*k;cam.y+=(camAnim.y-cam.y)*k;if(Math.abs(camAnim.z-cam.z)<.002&&Math.abs(camAnim.x-cam.x)<1&&Math.abs(camAnim.y-cam.y)<1){cam.z=camAnim.z;cam.x=camAnim.x;cam.y=camAnim.y;camAnim=null;clampCam()}}
  if(cine)cineUpdate(rdt);
  let gdt=(cine&&!cine.swapped)?0:rdt*[0,1,3,6][S.speed];while(gdt>0){const d=Math.min(.1,gdt);tick(d,false);gdt-=d}
  const pan=420*rdt/cam.z;let mv=false;
  if(keys['w']||keys['arrowup']){cam.y-=pan;mv=true}if(keys['s']||keys['arrowdown']){cam.y+=pan;mv=true}if(keys['a']||keys['arrowleft']){cam.x-=pan;mv=true}if(keys['d']||keys['arrowright']){cam.x+=pan;mv=true}
  if(mv){camAnim=null;clampCam()}
  render(rdt);try{gfxFrame(now,rdt)}catch(e){console.error(e);GFX.set.on=0;if(GFX.cv)GFX.cv.style.display='none'}audioFrame(rdt);drawExpWins(now);
  uiAcc+=rdt;if(uiAcc>.25){uiAcc=0;updateUI()}
  saveAcc+=rdt;if(saveAcc>15){saveAcc=0;save()}
}
const tipEl=document.createElement('div');tipEl.id='tip';tipEl.hidden=true;document.body.appendChild(tipEl);
document.addEventListener('pointerover',e=>{const el=e.target&&e.target.closest?e.target.closest('[data-tip]'):null;if(!el){tipEl.hidden=true;return}tipEl.innerHTML=el.dataset.tip;tipEl.hidden=false;const r=el.getBoundingClientRect(),h=tipEl.offsetHeight,w=tipEl.offsetWidth;tipEl.style.left=clamp(r.left,8,innerWidth-w-8)+'px';tipEl.style.top=(r.bottom+6+h>innerHeight?r.top-h-6:r.bottom+6)+'px'});
document.addEventListener('pointerdown',e=>{const el=e.target&&e.target.closest?e.target.closest('[data-tip]'):null;if(el&&e.pointerType!=='mouse'){tipEl.innerHTML=el.dataset.tip;tipEl.hidden=false;const r=el.getBoundingClientRect(),h=tipEl.offsetHeight,w=tipEl.offsetWidth;tipEl.style.left=clamp(r.left,8,innerWidth-w-8)+'px';tipEl.style.top=(r.top-h-6<8?r.bottom+6:r.top-h-6)+'px';return}tipEl.hidden=true},true);
const tutEl=document.createElement('div');tutEl.id='tut';tutEl.className='ov pane';tutEl.hidden=true;document.body.appendChild(tutEl);
function anyPlanned(t){return S.plots.some(p=>p.type===t||(p.con&&p.con.type===t))}
function freeStart(){return S.plots.find(p=>p.open&&!p.type&&!p.con)}
const TUT=[
  {t:'Welcome to Dustwool Ranch',b:()=>isTouch?'Three colonists and four cleared plots in the wilds. Drag with one finger to look around and pinch to zoom. Tap things to inspect them. This short guide walks you through the start. You can skip it any time.':'Three colonists and four cleared plots in the wilds. Drag the map (or use WASD) to look around and scroll to zoom. This short guide walks you through the start. You can skip it any time.',next:true},
  {t:'Plan a home',b:'Click one of the empty plots in the middle of the base.',done:()=>sel&&sel.k==='plot'&&plotById(sel.id)&&plotById(sel.id).open&&!plotById(sel.id).type,map:()=>({plot:freeStart()})},
  {t:'Beds first',b:'Pick <b>Makeshift barracks</b> in the list. Without beds colonists sleep rough and work slower.',done:()=>anyPlanned('housing'),dom:'[data-act="build"][data-v="housing"]',map:()=>({plot:freeStart()})},
  {t:'Food',b:'Click another empty plot and build a <b>Basic farm</b>. You start with potato seeds.',done:()=>anyPlanned('farm'),dom:'[data-act="build"][data-v="farm"]',map:()=>({plot:freeStart()})},
  {t:'A place for goods',b:'Build a <b>Stockpile</b> on a third plot. Harvests, wood and loot are stored there.',done:()=>anyPlanned('storage'),dom:'[data-act="build"][data-v="storage"]',map:()=>({plot:freeStart()})},
  {t:'Idle hands build',b:()=>`Colonists without a job build what you planned. Speed time up with the buttons ${MOB?'at the top':'at the top right'} and watch the plots go up.`,done:()=>built('housing').length&&built('farm').length&&built('storage').length,dom:'[data-act="speed"][data-v="2"]'},
  {t:'Hand out jobs',b:()=>`Drag a colonist portrait from the ${MOB?'bar at the bottom':'top bar'} onto the farm. They become a farmer and sow and harvest it.`,done:()=>S.cols.some(c=>{const p=typeof c.assign==='number'&&plotById(c.assign);return p&&p.type==='farm'}),dom:'#pawnbar',map:()=>({plot:built('farm')[0]})},
  {t:'Cooking',b:'Raw potatoes make poor food. Build a <b>Cooking fire</b> on the last free plot and drag a colonist there to cook meals.',done:()=>anyPlanned('kitchen'),dom:'[data-act="build"][data-v="kitchen"]',map:()=>({plot:freeStart()})},
  {t:'Dig in',b:'Raiders come after a few days. Click the dashed line around the base and dig a <b>trench</b>. It also gives you a gate in the west.',done:()=>S.wall>=0||!!S.wallCon,dom:'[data-act="wallup"]',map:()=>({wall:true})},
  {t:'Wood from outside',b:'Click a tree outside the base and mark it for chopping, or use <b>Mark all trees</b>. Idle colonists and gatherers bring the wood in.',done:()=>S.outside.some(o=>o.k==='tree'&&o.mark),dom:'[data-act="markall"]'},
  {t:'Research',b:'Open the <b>Research</b> tab at the bottom. A research corner and a researcher unlock new buildings, tiers and gear.',done:()=>tab==='research',dom:'#tab-research'},
  {t:'Growing the base',b:'Click wild land next to the base to clear it. Same buildings side by side join up, <span style="color:#e6d27a">★</span> shows neighbour bonuses, and the lanes between plots take wings (click a building to see where) or barricades and guard posts.',next:true},
  {t:'You are set',b:'Drag colonists onto the wall to make them guards, trade with caravans at the gate, and one day pack up and move to a bigger site from the World tab. Good luck!',next:true},
];
let tutKey='',tutOkT=0;
function updateTut(){const T0=S.tut;if(!T0||T0.done||cine){tutEl.hidden=true;document.querySelectorAll('.tut-hl').forEach(e=>e.classList.remove('tut-hl'));return}
  let st=TUT[T0.i];while(st&&!st.next&&st.done&&st.done()){T0.i++;tutOkT=performance.now();st=TUT[T0.i]}
  if(!st){T0.done=true;tutEl.hidden=true;msg('Tutorial finished.','good');return}
  const k=T0.i+'';const ok=performance.now()-tutOkT<1600;
  setHTML(tutEl,`<div class="between"><h4>Guide · ${T0.i+1}/${TUT.length}</h4><div class="dots">${TUT.map((_,i)=>`<i class="${i<T0.i?'d':i===T0.i?'c':''}"></i>`).join('')}</div></div>${ok&&T0.i>0?'<div class="ok">✓ Done</div>':''}<h3>${st.t}</h3><div>${typeof st.b==='function'?st.b():st.b}</div><div class="row" style="justify-content:flex-end">${st.next?`<button data-act="tutnext">${T0.i===TUT.length-1?'Finish':'Next'}</button>`:''}<button data-act="tutskip" style="opacity:.75">Skip guide</button></div>`);
  tutEl.hidden=false;if(k!==tutKey){tutKey=k;popEl(tutEl)}
  document.querySelectorAll('.tut-hl').forEach(e=>e.classList.remove('tut-hl'));if(st.dom)document.querySelectorAll(st.dom).forEach(e=>e.classList.add('tut-hl'))}
function drawTutMap(now){const T0=S.tut;if(!T0||T0.done||cine)return;const st=TUT[T0.i];if(!st||!st.map)return;const m=st.map();if(!m)return;const a=.55+.45*Math.sin(now/260);
  ctx.save();ctx.strokeStyle=`rgba(243,231,160,${a})`;ctx.lineWidth=3;ctx.setLineDash([10,6]);ctx.lineDashOffset=-now/40;
  if(m.plot){const[ox,oy]=plotOrigin(m.plot);rr(ctx,ox*T-6,oy*T-6,P*T+12,P*T+12,14);ctx.stroke()}
  if(m.wall){const b=baseBox();rr(ctx,b.x0*T-6,b.y0*T-6,(b.x1-b.x0)*T+12,(b.y1-b.y0)*T+12,16);ctx.stroke()}
  ctx.restore()}
const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));
function bootStep(m,f){const e=document.getElementById('bootmsg'),fi=document.getElementById('bootfill');if(e)e.textContent=m;if(fi&&f!==undefined)fi.style.width=Math.round(f*100)+'%'}
function bootHide(){const b=document.getElementById('boot');if(!b||b.classList.contains('out'))return;bootStep('Ready',1);b.classList.add('out');setTimeout(()=>{b.hidden=true},700)}
function bootFail(what,err){const b=document.getElementById('boot');if(!b)return;b.hidden=false;b.classList.remove('out');document.getElementById('booterr').hidden=false;
  document.getElementById('booterrtxt').textContent=what+'\n\n'+String(err&&(err.stack||err.message)||err||'').slice(0,900);bootStep('Something went wrong')}
function bootWire(){const on=(id,f)=>{const e=document.getElementById(id);if(e)e.addEventListener('click',f)};
  on('bootreload',()=>location.reload());
  on('bootgo',()=>{document.getElementById('booterr').hidden=true;bootHide()});
  on('bootbak',()=>{let raw=null;try{raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem(SAVE_KEY+'-backup')}catch(e){}if(!raw&&S)try{raw=serialize()}catch(e){}if(!raw){alert('No save found.');return}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([raw],{type:'application/json'}));a.download='dustwool-save-backup.json';document.body.appendChild(a);a.click();a.remove()});
  on('bootfresh',()=>{if(!confirm('Start a new colony? The old save is kept as a backup in this browser.'))return;try{const raw=localStorage.getItem(SAVE_KEY);if(raw)localStorage.setItem(SAVE_KEY+'-backup',raw);localStorage.removeItem(SAVE_KEY)}catch(e){}location.reload()})}
function bootVerify(){let ok=true;try{const d=ctx.getImageData(cv.width>>1,cv.height>>1,1,1).data;ok=!(d[3]===0||(d[0]+d[1]+d[2]<4))}catch(e){ok=true}
  if(ok){bootHide();return}
  if(LSmax>.4){LSmax=Math.max(.4,LS*.6);DPR=Math.min(DPR,1.5);resize();buildStatic();plotDirty=true;goodFrames=0;bootStep('Adjusting graphics for this device',.97);return}
  bootHide();msg('The map could not be drawn fully on this device. Try reloading.','bad')}
async function start(data){
  bootWire();
  try{
    bootStep('Checking your device',.05);
    if(!ctx)throw new Error('This browser cannot draw the game (no 2D canvas).');
    let storeOK=true;try{localStorage.setItem('dw-probe','1');localStorage.removeItem('dw-probe')}catch(e){storeOK=false}
    resize();setMob();if(innerWidth<700)document.body.classList.add('side-hidden');
    await nextFrame();
    bootStep('Loading fonts',.15);
    try{if(document.fonts&&document.fonts.ready)await Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,2500))])}catch(e){}
    bootStep('Loading your colony',.3);await nextFrame();
    let loaded=false,loadErr=null;
    const src=(data&&data.save)||(()=>{try{return localStorage.getItem(SAVE_KEY)}catch(e){return null}})();
    if(src){try{loaded=loadFrom(src)}catch(e){loaded=false;loadErr=e}}
    if(src&&!loaded){try{localStorage.setItem(SAVE_KEY+'-backup',src)}catch(e){}}
    if(!loaded)newGame();
    bootStep('Drawing the world',.5);await nextFrame();
    buildStatic();
    {let tries=0;while(tries<2){let okc=true;try{const sg=staticCv.getContext('2d'),d=sg.getImageData(staticCv.width>>1,staticCv.height>>1,1,1).data;okc=d[3]>0}catch(e){okc=true}if(okc)break;LSmax=Math.max(.35,LS*.6);buildStatic();tries++}}
    bootStep('Building the base',.65);await nextFrame();
    buildPlots();plotDirty=false;updateUI();fitCam();
    if(loaded&&!(data&&data.save)){await catchUp()}
    updateUI();
    if(src&&!loaded)letter('info','Save could not be loaded',`Your old save could not be opened${loadErr?' ('+String(loadErr.message||loadErr).slice(0,120)+')':''}, so a new colony started. The old save is kept as a backup in this browser; the start screen can download it.`);
    if(!storeOK)msg('This browser blocks storage: progress will not be saved.','bad');
    bootStep('Starting',.95);
  }catch(e){bootFail('The game could not start.',e);console.error(e);return}
  requestAnimationFrame(t=>{last=t;frame(t)});
}
addEventListener('resize',()=>{resize();clampCam()});
addEventListener('beforeunload',save);
let hiddenAt=0;document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=performance.now();save()}else if(S&&staticCv&&performance.now()-hiddenAt>3000){try{buildStatic();plotDirty=true}catch(e){console.error(e)}}});
cv.addEventListener('contextrestored',()=>{if(S){buildStatic();plotDirty=true}});
window.claude?.hot?.snapshot?.(()=>({save:serialize()}));
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
})();
