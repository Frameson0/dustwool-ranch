/* ================= state ================= */
let S=null;
let W=0,H=0,COLS=0,ROWS=0,GATE_Y=0,GX=8;
let kind,blocked,deco,roadTier,owned,region,doorSet,staticCv,plotCv,plotDirty=true,staticTopCv,staticSil,plotTopCv,plotSil;
let clusterSize={},clusterRoot={},layouts={},routes=[],wpMask=null;
const sowRes=new Map(),openGroups=new Set();
let wsort=null,logv='chron',strng=24,ships=[],msgs=[],sel=null,tab=null,modal=null,resetArm=false,rcat='all',tcat='all';
let cam={x:0,y:0,z:1};
const flowH=[];let flowCur={},flowT0=0;

function nid(){return S.id++}
function cnt(i){return S.items[i]||0}
function add(i,n){S.items[i]=(S.items[i]||0)+n}
function take(i,n){S.items[i]=Math.max(0,cnt(i)-n)}
function done(r){return !!S.research.done[r]}
function owns(c){return c==='tree'||!!S.unlocked[c]}
function biome(){return BIOMES[S.site.biome]}
function plotById(id){return typeof id==='string'?(id[0]==='w'?wpPlot(id):undefined):S.plots[id]}
const wpObjCache={};
function wpPlot(id){const key=id.slice(1),w=S.wp&&S.wp[key];if(!w||w.con)return null;const D=WPLOTS[w.type];if(!D||!D.work)return null;const sl=wpSlots().find(s=>s.key===key);if(!sl)return null;
  let o=wpObjCache[id];if(!o||o.w!==w){o={id,w,tier:0,small:true,dmg:0,get type(){return D.work},get bill(){return w.bill},set bill(v){w.bill=v},get limit(){return w.limit},set limit(v){w.limit=v},get bills(){return w.bills},set bills(v){w.bills=v},get stock(){return null}};wpObjCache[id]=o}
  o.sl=sl;o.ox=sl.x0;o.oy=sl.y0;return o}
function wpWorkPlots(){const out=[];for(const sl of wpSlots()){const o=plotById('w'+sl.key);if(o)out.push(o)}return out}
function built(t){return S.plots.filter(p=>p.type&&(!t||p.type===t))}
function hasComms(){return built('comms').length>0}
function colById(id){return S.cols.find(c=>c.id===id)}
function aniById(id){return S.ani.find(a=>a.id===id)}
function colName(c){return `${c.name} '${c.nick}' ${c.last}`}
const tdCache={};
function tierDef(p){const ts=PLOTS[p.type].tiers,d=ts[p.tier];if(!d.power||p.tier===0||S.pwrOK!==false)return d;const k=p.type+p.tier;if(!tdCache[k])tdCache[k]=Object.assign({},ts[p.tier-1],{n:d.n,beds:d.beds,cap:d.cap,per:d.per,carry:d.carry,cart:d.cart,ores:ts[p.tier-1].ores,unpowered:true});return tdCache[k]}
function powerStats(){let prod=0,use=0,store=0,fuel=0;const hr=(S.t%DAY)/DAY*24,sun=hr<6||hr>=20?0:hr<8?(hr-6)/2:hr>=18?(20-hr)/2:1;
  for(const p of built()){const d=PLOTS[p.type].tiers[p.tier];if(p.type==='solar')prod+=d.prod*sun*(p.dmg?1-p.dmg*.5:1);else if(p.type==='burner'){if(cnt('wood')>=1||cnt('chemfuel')>=1){prod+=d.prod;fuel+=d.fuel}}else if(p.type==='battery')store+=d.store;if(d.power)use+=d.power}
  return{prod,use,store,fuel,sun}}
function tickPower(dt){
  const ps=powerStats();S.pw=ps;if(!ps.use&&!ps.prod){S.pwrOK=true;S.batt=Math.min(S.batt||0,ps.store);return}
  for(const p of built('burner')){const d=tierDef(p),need=d.fuel/60*dt;p.fuelAcc=(p.fuelAcc||0)+need;while(p.fuelAcc>=1){p.fuelAcc-=1;if(cnt('wood')>=1){take('wood',1);flow('wood',-1)}else if(cnt('chemfuel')>=1){take('chemfuel',.34);flow('chemfuel',-.34)}}}
  const net=ps.prod-ps.use;S.batt=clamp((S.batt||0)+net*dt/60,0,ps.store);
  const was=S.pwrOK!==false;S.pwrOK=net>=0||S.batt>0;if(was!==S.pwrOK&&!offlineSim){msg(S.pwrOK?'Power is back.':'Power is out! Tier 4 buildings run like tier 3 until there is enough power.',S.pwrOK?'good':'bad');plotDirty=true}
}
function plotName(p){return p.small?WPLOTS[p.w.type].n:p.type?tierDef(p).n:'Empty plot'}
function slots(p){return p.type&&WORK_TYPES.includes(p.type)?Math.min(3,p.tier+1):0}
function workersOf(id){return S.cols.filter(c=>c.assign===id)}
function clusterBonus(p){if(!p||p.small||!p.type||isAnnex(p))return 1;const n=clusterSize[p.id]||1,b=bonusInfo[clusterRoot[p.id]];return Math.min(1.6,1+.15*(n-1))*(b?b.mul:1)}
function chron(k,x){if(!S)return;S.chron=S.chron||[];S.chron.push({t:Math.round(S.t),k,x,site:S.site?S.site.name:''});if(S.chron.length>500)S.chron.splice(0,S.chron.length-500)}
function stat(k,n){if(!S)return;S.stats=S.stats||{};S.stats[k]=(S.stats[k]||0)+(n===undefined?1:n)}
function foodStock(){let f=0;for(const i in S.items){const d=ITEMS[i];if(d&&(d.food||i==='meal'||i==='finemeal'||i==='cheese'))f+=cnt(i)}return Math.round(f)}
function ensureState2(){if(!S.loadouts){S.loadouts=defaultLoadouts();S.loId=10}S.exps=S.exps||[];S.expDone=S.expDone||0;S.relics=S.relics||[];S.legacy=S.legacy||{pts:0,perks:{},spent:0,runs:0}}
function sampleStats(){S.hist=S.hist||[];S.hist.push({t:Math.round(S.t),w:Math.round(raidWealth()),s:Math.round(S.silver),f:foodStock(),c:S.cols.length,p:S.hacc||{},u:S.hcon||{}});S.hacc={};S.hcon={};if(S.hist.length>720)S.hist.splice(0,S.hist.length-720)}
function opt(k){S.opt=S.opt||{};const D={pauseRaid:1,pauseEvent:0,story:'normal',hardcore:0,t_build:1,t_trade:1,t_skill:1,t_weather:1,t_raid:1,t_colony:1};return S.opt[k]===undefined?D[k]:S.opt[k]}
function msgCat(t){return /skill rose/.test(t)?'skill':/rain|snow|storm|thunder/i.test(t)?'weather':/raid|raider|breach|militia|gunship|insectoid|pirate/i.test(t)?'raid':/sold|bought|caravan|trader|orbital|silver for/i.test(t)?'trade':/finished|planned|built|upgrade|cleared|dug|taken down|demolish/i.test(t)?'build':'colony'}
function flow(k,n){if(!n)return;if(S){if(n>0){S.hacc=S.hacc||{};S.hacc[k]=(S.hacc[k]||0)+n}else{S.hcon=S.hcon||{};S.hcon[k]=(S.hcon[k]||0)-n}}const o=flowCur[k]||(flowCur[k]={p:0,c:0});if(n>0)o.p+=n;else o.c-=n}
function rates(k){let p=0,c=0,t=S.t-flowT0;for(const b of flowH){t+=10;if(b[k]){p+=b[k].p;c+=b[k].c}}if(flowCur[k]){p+=flowCur[k].p;c+=flowCur[k].c}t=Math.max(20,t);return{p:p/t*60,c:c/t*60}}
function priceMul(tr){return tr.mul*(biome().price||1)*(1+.1*S.renown+bonus('trade'))}
function costOk(d){if(S.test)return true;if(S.silver<(d.cost||0))return false;for(const k in d.mat||{})if(cnt(k)<d.mat[k])return false;return true}
function pay(d){if(S.test)return;S.silver-=d.cost||0;for(const k in d.mat||{})take(k,d.mat[k])}
function costStr(d,mult){mult=mult||1;const parts=[`${fmt((d.cost||0)*mult)} silver`];for(const k in d.mat||{})parts.push(`${d.mat[k]*mult} ${ITEMS[k].n.toLowerCase()}`);return parts.join(' + ')}
function costHTML(d,mult){mult=mult||1;const parts=[`<span class="${S.silver>=(d.cost||0)*mult?'':'bad'}">${fmt((d.cost||0)*mult)} silver</span>`];for(const k in d.mat||{})parts.push(`<span class="${cnt(k)>=d.mat[k]*mult?'':'bad'}">${d.mat[k]*mult} ${ITEMS[k].n.toLowerCase()}</span>`);return parts.join(' + ')}
function reqName(r){return RESEARCH.find(x=>x.id===r).n}
function reqLabel(r){return'Needs research: '+reqName(r)}

