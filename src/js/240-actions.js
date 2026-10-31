/* ================= actions ================= */
function centerOn(wx,wy){cam.x=wx+sideW()/2/cam.z;cam.y=wy+36/2/cam.z;clampCam()}
/* risky actions need a second tap within 3 s (the button turns red and says so) */
const CONFIRM=new Set(['demolish','demolane','demowp','demoslot','demogate','demotrap','sella','relocate','slotdel','slotload','saveimport','payraid','xback','cancelexp','reject','upgradeall','perk','lodel','cancelcon']);
let armKey=null,armT=0;
function confirmGate(el,a){if(!CONFIRM.has(a)&&!el.dataset.confirm)return true;const key=[a,el.dataset.id,el.dataset.v,el.dataset.s,el.dataset.wid].join('|');
  if(armKey===key&&performance.now()-armT<3000){armKey=null;return true}
  armKey=key;armT=performance.now();if(!el.dataset.lbl)el.dataset.lbl=el.innerHTML;el.classList.add('armed');el.innerHTML=(MOB||isTouch?'Tap':'Click')+' again to confirm';sfx('click');
  setTimeout(()=>{if(el.isConnected&&el.dataset.lbl){el.classList.remove('armed');el.innerHTML=el.dataset.lbl;delete el.dataset.lbl}},3000);return false}
function act(el){
  audioInit();
  const a=el.dataset.act,v=el.dataset.v,id=el.dataset.id!==undefined?+el.dataset.id:null;
  if(!confirmGate(el,a))return;sfx('click');
  switch(a){
    case 'tab':{const inModal=!!el.closest('#modal,#inspect'),prev=tab;tab=tab===v&&!inModal?null:v;
      if(tab==='defense'&&prev!=='defense'){defMode=true;ovMode=false;camAnim=defTarget()}
      else if(prev==='defense'&&tab!=='defense'&&!raidActive()){defMode=false;autoDef=false;camAnim=normTarget()}resetArm=false;if(el.closest('#modal'))closeModal();break}
    case 'side':document.body.classList.toggle('side-hidden');clampCam();break;
    case 'ovmode':toggleOverview();break;
    case 'speed':S.speed=+v;break;
    case 'desel':sel=null;break;
    case 'grp':if(openGroups.has(v))openGroups.delete(v);else openGroups.add(v);break;
    case 'selplot':{sel={k:'plot',id};const[ox,oy]=plotOrigin(plotById(id));centerOn((ox+2.5)*T,(oy+2.5)*T);break}
    case 'selwall':sel={k:'wall'};break;
    case 'landmode':landMode=!landMode&&!S.proj;gateMode=false;if(landMode){sel=null;if(!ovMode&&!defMode)camAnim=defTarget()}break;
    case 'gatemode':landMode=false;gateMode=!gateMode;if(gateMode&&!defMode&&!ovMode){}break;
    case 'demogate':removeGate(+v);break;
    case 'buildwp':buildWP(el.dataset.s,v);break;
    case 'demowp':demolishWP(el.dataset.s);break;
    case 'expand':startExpansion(plotById(id));break;
    case 'cancelexp':cancelExpansion();break;
    case 'roadup':roadUpgrade();break;
    case 'cancelcon':cancelCon(plotById(id));break;
    case 'trapmode':trapMode=trapMode===v?null:v;gateMode=false;landMode=false;break;
    case 'demotrap':demoTrap(el.dataset.s);break;
    case 'promo':promote(trader(modal.who));renderModal();break;
    case 'test':S.test=!S.test;msg(S.test?'Test mode on: unlimited silver and goods.':'Test mode off.','warn');break;
    case 'tcon':for(let k=0;k<60;k++){const cs=conSites();if(!cs.length)break;finishSite(cs[0].id)}if(S.proj)completeExpansion();break;
    case 'tres':for(const r of RESEARCH)S.research.done[r.id]=true;S.research.cur=null;msg('All research done.','good');break;
    case 'twand':if(!S.wanderer)arriveWanderer();break;
    case 'tcar':if(!S.trader)arriveCaravan();break;
    case 'torb':if(!S.orbital)arriveOrbital();break;
    case 'traid':if(!S.raid){const pl=raidPlan(v==='big'?2.5:.6);startRaid(pl.count,v==='big'?['W','N']:['W'],15,false,el.dataset.f||pl.fac)}break;
    case 'payraid':payRaid();closeModal();break;
    case 'tday':for(let k=0;k<DAY/.5;k++)tick(.5,false);msg('Skipped a day.');break;
    case 'tland':for(const p of S.plots)p.open=true;S.proj=null;refreshSite();msg('All land cleared.','good');break;
    case 'tcol':{const c=genPawn(pick(SKILLS));c.x=GX+2.5;c.y=GATE_Y+.5;S.cols.push(c);msg(`${c.nick} appeared.`);break}
    case 'rcat':rcat=v;break;
    case 'tcat':tcat=v;break;
    case 'markrocks':for(const o of S.outside)if(o.k==='rock')o.mark=true;msg('All rocks marked for breaking.','good');break;
    case 'wallup':upgradeWall();break;
    case 'testraid':if(!S.raid){const pl=raidPlan(.5);startRaid(Math.max(6,Math.min(30,pl.count)),['W'],10,true,pl.fac);msg('Test raid on its way.','warn')}break;
    case 'militia':S.militia=!S.militia;break;
    case 'squadhold':S.squads[v].hold=!S.squads[v].hold;for(const c of S.cols)c.stationKey=null;break;
    case 'buildslot':buildSlot(el.dataset.s,v);break;
    case 'upslot':{const D=DEF.stonetower;if(D.req&&!done(D.req)){msg('Needs research: '+reqName(D.req)+' first.','bad');break}if(!costOk(D)){msg(`Needs ${costStr(D)}.`,'bad');break}pay(D);S.def[el.dataset.s]={type:'stonetower'};msg('Stone tower built.','good');break}
    case 'demoslot':{const d=S.def[el.dataset.s];if(d){const D=DEF[d.type];S.silver+=Math.floor((D.cost||0)/2);delete S.def[el.dataset.s];for(const c of S.cols)c.stationKey=null;sel=null;msg(`${D.n} torn down.`)}break}
    case 'letter':{const l=S.letters.find(l=>l.id===id);if(l)openLetter(l);break}
    case 'lclear':{for(const l of S.letters)if(l.k==='event'&&!l.data.done&&letterClearable(l)){l.data.done=true;evChoose(l.data.ev,'no',true)}S.letters=S.letters.filter(l=>!letterClearable(l));if(modal&&modal.k==='letter')closeModal();break}
    case 'dismiss':S.letters=S.letters.filter(l=>l.id!==id);closeModal();break;
    case 'close':closeModal();break;
    case 'accept':acceptWanderer();closeModal();break;
    case 'reject':wandererLeaves();closeModal();break;
    case 'trade':{S.letters=S.letters.filter(l=>!((l.k==='trade'||l.k==='orbital')&&l.data.who===v));modal={k:'trade',who:v};renderModal();break}
    case 'sell':sfx('coin');sell(v,+el.dataset.n,trader(modal.who));renderModal();break;
    case 'sella':sfx('coin');sellAnimal(v,trader(modal.who));renderModal();break;
    case 'buys':sfx('coin');buySeeds(v);renderModal();break;
    case 'buyg':sfx('coin');buyGoods(v,+el.dataset.n,trader(modal.who));renderModal();break;
    case 'buya':sfx('coin');buyAnimal(v,trader(modal.who));renderModal();break;
    case 'fulfill':fulfillRequest();renderModal();break;
    case 'research':startResearch(v);break;
    case 'ship':shipContract(+v);break;
    case 'build':buildPlot(plotById(id),v);break;
    case 'install':if(installEvt){const ev=installEvt;installEvt=null;ev.prompt();ev.userChoice.then(r=>{if(r.outcome!=='accepted')installEvt=ev;updateUI()}).catch(()=>{})}else{modal={k:'install'};renderModal()}break;
    case 'slotgate':{const sl=slotById(el.dataset.s);if(sl){if(tryPlaceGate(sl.x,sl.y))sel=null}break}
    case 'selwall':sel={k:'wall'};break;
    case 'colstep':{const L=S.cols;if(!L.length)break;let i=L.findIndex(c=>sel&&sel.k==='col'&&c.id===sel.id);i=(i+(+v)+L.length)%L.length;sel={k:'col',id:L[i].id};centerOn(L[i].x*T,L[i].y*T+(MOB&&innerHeight>=520?ch*.2/cam.z:0));break}
    case 'wsort':wsort=wsort===v?null:v;break;
    case 'selcol':{const c=colById(id);if(c){sel={k:'col',id:c.id};centerOn(c.x*T,c.y*T+(MOB&&innerHeight>=520?ch*.2/cam.z:0))}break}
    case 'logv':logv=v;break;
    case 'strng':strng=+v;break;
    case 'slotsave':saveSlot(+v);break;
    case 'slotload':{try{const r=JSON.parse(localStorage.getItem(saveSlotKey(+v)));if(r)loadGameStr(r.data,'Slot '+v)}catch(e){msg('That slot could not be read.','bad')}break}
    case 'slotdel':try{localStorage.removeItem(saveSlotKey(+v))}catch(e){}break;
    case 'saveexport':exportSave();break;
    case 'saveimport':importSave();break;
    case 'wup':buildWup(el.dataset.s,v);break;
    case 'gatehouse':{const g=S.gates.find(g=>gateCells(g).includes(+v));if(g&&!g.house){const c=wupCost('house');if(costOk(c)){pay(c);g.house=1;sfx('done');chron('build','Built a gatehouse with a portcullis.');msg('Gatehouse built.','good')}else msg(`Needs ${costStr(c)}.`,'bad')}break}
    case 'ralarm':if(S.raid){const m=S.militia;S.militia=true;militiaUp(true);S.militia=m;S.raid.alarm=true;msg('Alarm! Everyone grabs a weapon.','warn')}break;
    case 'rrecall':if(S.raid){S.raid.recall=!S.raid.recall;msg(S.raid.recall?'Everyone comes inside the walls.':'Workers go back to work.','')}break;
    case 'rtraps':if(S.raid){S.raid.traps=true;msg('Builders re-arm the traps first.','')}break;
    case 'rplay':S.speed=Math.max(1,S.speed);break;
    case 'evc':{const l=S.letters.find(x=>x.id===id);if(l&&!l.data.done){l.data.done=true;evChoose(l.data.ev,v);S.letters=S.letters.filter(x=>x!==l)}closeModal();break}
    case 'xplan':modal={k:'exped',pick:new Set(),dest:null,meals:null};renderModal();break;
    case 'xdest':if(modal&&modal.k==='exped'){modal.dest=v;modal.meals=null;renderModal()}break;
    case 'xpick':if(modal&&modal.k==='exped'){const P=modal.pick;if(P.has(id))P.delete(id);else if(P.size<4)P.add(id);modal.meals=null;renderModal()}break;
    case 'xmeal':if(modal&&modal.k==='exped'){modal.meals=clamp((modal.meals||0)+(+v),0,Math.floor(cnt('meal')));renderModal()}break;
    case 'xgo':if(modal&&modal.k==='exped'&&modal.dest){if(startExp(modal.dest,[...modal.pick],modal.meals||0))closeModal()}break;
    case 'xmin':{const e=S.exps.find(x=>x.id===id);if(e){e.min=!e.min;if(MOB&&!e.min)for(const o of S.exps)if(o!==e)o.min=true}break}
    case 'xback':{const e=S.exps.find(x=>x.id===id);if(e)xTurn(e,'You called them home.');break}
    case 'xch':{const e=S.exps.find(x=>x.id===id);if(e&&e.choice)xChoose(e,v);break}
    case 'perk':{const L=S.legacy,P=PERKS[v];if(P&&perkOpen(v)&&(L.perks[v]||0)<P.max&&L.pts>=perkCost(v)){L.pts-=perkCost(v);L.perks[v]=(L.perks[v]||0)+1;chron('legacy',`Perk: ${P.n} ${L.perks[v]}.`);sfx('victory')}break}
    case 'billmv':case 'billoff':case 'billdel':case 'rackempty':{const p=plotById(el.dataset.wid||id);if(!p)break;const L=bills(p);
      if(a==='rackempty'){rackReturn(p);break}
      const[bid,dd]=String(v).split(':'),i=L.findIndex(b=>b.id===+bid);if(i<0)break;
      if(a==='billmv'){const j=i+(+dd);if(j>=0&&j<L.length){const t=L[i];L[i]=L[j];L[j]=t}}else if(a==='billoff')L[i].off=!L[i].off;else{for(const c of S.cols)if(c.job&&c.job.bid===L[i].id&&c.job.st<2)releaseJob(c);L.splice(i,1)}break}
    case 'ccust':modal={k:'cust',id};renderModal();break;
    case 'cset':{const c=colById(id);if(c){const[f,val]=String(v).split(':');c[f]=f==='hs'?+val:val;delete portCache[c.id];renderModal()}break}
    case 'lonew':{S.loId=(S.loId||10)+1;S.loadouts.push({id:S.loId,n:'Loadout '+S.loadouts.length,weapon:'best',armor:'best',helmet:1,always:0,uni:0,outfit:'uniform',c1:'#5a6f80',c2:'#2e3a4a',hat:'none'});break}
    case 'lodup':{const L=S.loadouts.find(l=>l.id===id);if(L){S.loId=(S.loId||10)+1;S.loadouts.push({...L,id:S.loId,n:L.n+' copy'})}break}
    case 'lodel':{if(S.loadouts.length<2)break;S.loadouts=S.loadouts.filter(l=>l.id!==id);for(const c of S.cols)if(c.lo===id)c.lo=S.loadouts[0].id;dropPortraits();break}
    case 'loclr':{const L=S.loadouts.find(l=>l.id===id);if(L){const[f,val]=String(v).split(':');L[f]=val;dropPortraits()}break}
    case 'loassign':{const c=colById(id);if(c){c.lo=+v;c.eqT=0;delete portCache[c.id]}break}
    case 'pbmin':pbMin=!pbMin;try{localStorage.setItem('dw-pbmin',pbMin?'1':'0')}catch(e){}break;
    case 'tutnext':if(S.tut){S.tut.i++;tutOkT=0}break;
    case 'tutskip':if(S.tut)S.tut.done=true;msg('Guide skipped. You can restart it from the menu.');break;
    case 'tutreset':S.tut={i:0};tab=null;break;
    case 'buildlane':buildLane(el.dataset.s,v);break;
    case 'buildwing':buildWing(el.dataset.s,v,id);break;
    case 'demolane':demoLane(el.dataset.s);break;
    case 'upgrade':upgradePlots([plotById(id)]);break;
    case 'upgradeall':upgradePlots(connected(plotById(id)));break;
    case 'cropall':{const p=plotById(id);for(const q of connected(p))q.crop=p.crop;break}
    case 'demolish':demolish(plotById(id));break;
    case 'mark':{const o=S.outside.find(o=>o.id===id);if(o){o.mark=!o.mark;if(!o.mark&&o.r){const c=colById(o.r);if(c)releaseJob(c)}}break}
    case 'unmarkall':for(const o of S.outside)if(o.k==='tree'&&o.mark){o.mark=false;if(o.r){const c=colById(o.r);if(c)releaseJob(c);o.r=0}}msg('All trees unmarked.');break;
    case 'markall':for(const o of S.outside)if(o.k==='tree')o.mark=true;msg('All trees marked for chopping.','good');break;
    case 'markchunks':for(const o of S.outside)if(o.k==='chunk')o.mark=true;S.letters=S.letters.filter(l=>l.id!==id);closeModal();msg('Ship chunks marked for salvage.','good');break;
    case 'choosebiome':if(canRelocate()){const seats=relocOffer().seats||4,best=S.cols.slice().sort((a,b)=>SKILLS.reduce((t,k)=>t+b.sk[k],0)-SKILLS.reduce((t,k)=>t+a.sk[k],0)).slice(0,seats);modal={k:'biome',pick:new Set(best.map(c=>c.id))};renderModal()}break;
    case 'pickcol':{const cid=+v,seats=relocOffer().seats||4;if(modal.pick.has(cid))modal.pick.delete(cid);else if(modal.pick.size<seats)modal.pick.add(cid);else msg(`Only ${seats} seats.`,'bad');renderModal();break}
    case 'relocate':startCine(v);break;
    case 'save':save();msg('Saved.','good');break;
    case 'reset1':resetArm=true;break;
    case 'reset0':resetArm=false;break;
    case 'reset2':resetArm=false;try{localStorage.removeItem(SAVE_KEY)}catch(e){}for(const k in portCache)delete portCache[k];newGame();buildStatic();sel=null;tab=null;fitCam();msg('A new colony begins.','good');break;
  }
  updateUI();
}
document.addEventListener('pointerdown',e=>{if(e.button!==0)return;const el=e.target.closest('[data-act]');if(!el||el.disabled)return;e.preventDefault();act(el)});
document.addEventListener('click',e=>{if(e.detail!==0)return;const el=e.target.closest('[data-act]');if(el&&!el.disabled)act(el)});
document.addEventListener('change',e=>{
  const el=e.target;if(!el.dataset||!el.dataset.chg)return;const id=el.dataset.wid||+el.dataset.id;
  if(el.dataset.chg==='assign'){const c=colById(id);if(c)assign(c,el.value===''?null:(el.value==='out'||el.value==='build'||el.value==='guard'||el.value[0]==='w')?el.value:+el.value)}
  if(el.dataset.chg==='crop'){const p=plotById(id);if(p){p.crop=el.value;for(const[x,y]of cropCells(p)){const k=x+','+y,q=S.plants[k];if(q&&q.g<.05&&!q.r)delete S.plants[k]}}}
  if(el.dataset.chg==='cname'){const c=colById(id),f=el.dataset.v,val=el.value.trim().slice(0,18);if(c&&val){c[f]=val;if(f==='nick')msg(`Renamed to ${val}.`,'good')}if(modal)renderModal()}
  if(el.dataset.chg==='cout'){const c=colById(id);if(c){c[el.dataset.v]=el.value;delete portCache[c.id];renderModal()}}
  if(el.dataset.chg==='colo'){const c=colById(id);if(c){c.lo=+el.value;c.eqT=0;delete portCache[c.id];renderModal()}}
  if(el.dataset.chg==='loset'){const L=S.loadouts.find(l=>l.id===id),f=el.dataset.v;if(L){L[f]=el.type==='checkbox'?(el.checked?1:0):el.type==='text'?(el.value.trim().slice(0,20)||L.n):el.value;for(const c of S.cols)c.eqT=0;dropPortraits()}}
  if(el.dataset.chg==='billadd'&&el.value){const p=plotById(id);if(p){bills(p).push({id:nid(),r:el.value,mode:'until',n:10,done:0});el.value=''}}
  if(el.dataset.chg==='billmode'){const p=plotById(id),b=p&&bills(p).find(x=>x.id===+el.dataset.v);if(b){b.mode=el.value;if(el.value==='count')b.done=0}}
  if(el.dataset.chg==='billn'){const p=plotById(id),b=p&&bills(p).find(x=>x.id===+el.dataset.v);if(b){b.n=Math.max(1,Math.floor(+el.value)||1)}}
  if(el.dataset.chg==='bill'){const p=plotById(id);if(p){p.bill=el.value;for(const c of workersOf(p.id))if(c.job&&c.job.t==='craft'&&c.job.st<2)releaseJob(c)}}
  if(el.dataset.chg==='limit'){const p=plotById(id);if(p){const val=el.value.trim(),v=val===''?null:Math.max(0,Math.floor(+val)||0);for(const q of connected(p))q.limit=v}}
  if(el.dataset.chg==='qprod'){const p=plotById(id);if(p){for(const q of connected(p))q.prod=el.value;for(const c of workersOf(p.id))if(c.job&&c.job.t==='mine')releaseJob(c)}}
  if(el.dataset.chg==='woodlimit'){const val=el.value.trim();S.woodLimit=val===''?null:Math.max(0,Math.floor(+val)||0)}
  if(el.dataset.chg==='squadload'){S.squads[el.dataset.v].load=el.value;for(const c of S.cols)if(isGuard(c)&&guardSide(c)===el.dataset.v){c.eqT=0;if(c.weapon&&!(el.value==='melee'?MELEE:RANGED).includes(c.weapon)){add(c.weapon,1);c.weapon=null}}}
  if(el.dataset.chg==='buyupto'){const i=el.dataset.v,val=el.value.trim();if(val==='')delete S.autoBuy[i];else S.autoBuy[i]=Math.max(0,Math.floor(+val)||0);if(S.trader)autoTrade(S.trader);if(S.orbital)autoTrade(S.orbital)}
  if(el.dataset.chg==='snd'){audioInit();SND.on=el.checked;sndVol();sndSave()}
  if(el.dataset.chg==='mvol'){audioInit();SND.mv=(+el.value)/100;sndVol();sndSave()}
  if(el.dataset.chg==='svol'){audioInit();SND.sv=(+el.value)/100;sndVol();sndSave();sfx('done')}
  if(el.dataset.chg==='opt'){S.opt=S.opt||{};S.opt[el.dataset.v]=el.type==='checkbox'?(el.checked?1:0):el.value}
  if(el.dataset.chg==='reserve'){S.buyReserve=Math.max(0,Math.floor(+el.value)||0)}
  if(el.dataset.chg==='keep'){const i=el.dataset.v,val=el.value.trim();if(val==='')delete S.autoSell[i];else S.autoSell[i]=Math.max(0,Math.floor(+val)||0);if(S.trader)autoTrade(S.trader);if(S.orbital)autoTrade(S.orbital)}
  el.blur();updateUI();
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT')e.target.blur()});
$('modalwrap').addEventListener('pointerdown',e=>{if(e.target.id==='modalwrap')closeModal()});

