/* ================= new game / save ================= */
function newGame(){
  S={v:5,id:1000,lanes:{},tut:{i:0},siteT:0,t:DAY*.3,silver:400,items:{meal:12,wood:20,bow:3,spear:3},unlocked:{potato:true},gates:[],wp:{},proj:null,whp:{},autoBuy:{},buyReserve:200,
    cols:[],ani:[],plots:[],plants:{},ground:[],vis:[],letters:[],contracts:[],requests:[],outside:[],wild:[],def:{},squads:{W:{load:'ranged',hold:false},N:{load:'ranged',hold:false},E:{load:'ranged',hold:false},S:{load:'ranged',hold:false}},militia:true,breach:{},raid:null,nextRaid:DAY*4.5,
    research:{done:{},cur:'traderoutes',prog:{}},trader:null,orbital:null,wanderer:null,wall:-1,wallCon:null,traps:{},
    site:{biome:'temperate',cols:5,rows:4,seed:RI(1,1e9),name:'Dustwool'},reloc:0,renown:0,
    nextCaravan:DAY*.3+60,nextWanderer:DAY*.3+160,nextOrbital:1e12,nextContract:1e12,nextChunk:DAY*.3+90,nextRequest:DAY*1.2,autoSell:{},stats:{},lastSave:Date.now(),speed:1};
  S.plots=initPlots(5,4);S.chron=[];S.opt={};
  setupSite();S.outside=genOutside();rebuildBlocked();for(let k=0;k<wildCap();k++)spawnWild(false);
  const biases=['plants','animals','cooking'];
  for(let k=0;k<3;k++){const c=genPawn(biases[k]);c.x=GX+3.5+k;c.y=GATE_Y+.5;S.cols.push(c)}
  flowT0=S.t;chron('start','Three colonists settled at Dustwool in the temperate scrubland.');
  letter('info','Welcome to Dustwool Ranch',`Three colonists stand on four cleared plots in the middle of the wilds. Click an empty plot to plan a building: start with makeshift barracks, a basic farm and a stockpile. Idle colonists build what you plan; later a builder’s yard takes over. Dig a cheap trench (Base list in the sidebar) before the first raiders show up: it also gives you the bridge in the west. To grow the base, click the wild land next to it and drag colonists there: as builders they fell trees, break rocks and extend the wall around it. You start with three bows and three spears in storage. Drag a colonist onto a farm, ranch, kitchen or workshop to put them to work, or onto the land outside the wall to make them a gatherer. Click trees outside to mark them for chopping. You start with potato seeds; other seeds are bought once from a trader and then grow forever. Plots of the same type and tier next to each other join up and work better. When you can afford a wagon convoy from a caravan, move on to a bigger site (World tab).`);
}
function serialize(){return JSON.stringify(S,(k,v)=>(k==='job'||k==='post'||k==='path'||k==='hold'||k==='look'||k==='bub'||k==='em')?undefined:v)}
function save(){S.lastSave=Date.now();try{localStorage.setItem(SAVE_KEY,serialize())}catch(e){}}
function loadFrom(str){
  const d=JSON.parse(str);if(!d||(d.v!==3&&d.v!==4&&d.v!==5))return false;
  const mig=d.v===3;S=d;S.unlocked=S.unlocked||{potato:true};S.wild=S.wild||[];S.def=S.def||{};S.squads=S.squads||{W:{load:'ranged',hold:false},N:{load:'ranged',hold:false},E:{load:'ranged',hold:false},S:{load:'ranged',hold:false}};if(S.militia===undefined)S.militia=true;if(S.nextRaid===undefined)S.nextRaid=S.t+DAY*2;
  if(mig){S.v=4;for(const p of S.plots)p.open=true;
    for(const id in S.def){const D=DEF[S.def[id].type];if(D)refundCost(D,1)}S.def={};
    const sh=e=>{if(e.x>=8)e.x+=2;e.y+=5};for(const c of S.cols)sh(c);for(const a of S.ani)sh(a);for(const g of S.ground)sh(g);for(const a of S.wild)a.y+=5;
    const np={};for(const k in S.plants){const[x,y]=k.split(',').map(Number);np[(x+2)+','+(y+5)]=S.plants[k]}S.plants=np;
    S.raid=null;delete S.wallHP;S.breach={};S.whp={};S.outside=(S.outside||[]).filter(o=>o.k==='chunk').map(o=>({...o,y:o.y+5}));S.regen=true}
  if(S.v===4){S.v=5;const mx=x=>{const i=Math.floor((x-12)/6),l=x-12-i*6;return 12+i*8+(l<5?l:5+(l-5)*3)},my=y=>{const j=Math.floor((y-6)/6),l=y-6-j*6;return 8+j*8+(l<5?l:5+(l-5)*3)},mv=e=>{e.x=mx(e.x);e.y=my(e.y)};
    for(const c of S.cols)mv(c);for(const a of S.ani)mv(a);for(const g of S.ground||[])mv(g);for(const a of S.wild||[])mv(a);
    const np={};for(const k in S.plants){const[x,y]=k.split(',').map(Number);np[Math.round(mx(x))+','+Math.round(my(y))]=S.plants[k]}S.plants=np;
    for(const k in S.traps||{}){const t=S.traps[k];if(TRAPS[t.type])refundCost(TRAPS[t.type],1)}S.traps={};
    for(const id in S.def||{}){const D=DEF[S.def[id].type];if(D)refundCost(D,1)}S.def={};
    for(const k in S.wp||{})if(k[0]==='g'){if(WPLOTS[S.wp[k].type])refundCost(WPLOTS[S.wp[k].type],1);delete S.wp[k]}
    S.gates=(S.gates||[]).filter(g=>{if(g.main)return true;refundCost(gateCost(),1);return false});
    S.road={};S.roadMig=true;S.roadCon=null;S.whp={};S.breach={};S.raid=null;S.outside=(S.outside||[]).filter(o=>o.k==='chunk').map(o=>(mv(o),o.x=Math.round(o.x),o.y=Math.round(o.y),o));S.regen=true;S.lanes={};
    S.letters=S.letters||[];S.migMsg=true}
  S.lanes=S.lanes||{};ensureState2();if(S.tut===undefined)S.tut={done:true};
  S.gates=S.gates||[];S.wp=S.wp||{};S.whp=S.whp||{};S.breach=S.breach||{};S.autoBuy=S.autoBuy||{};if(S.buyReserve===undefined)S.buyReserve=200;if(S.proj===undefined)S.proj=null;S.road=S.road||{};if(S.roadTarget===undefined)S.roadTarget=0;S.traps=S.traps||{};for(const k in S.traps)if(!/^\d+$/.test(k)){const t=S.traps[k];if(t&&TRAPS[t.type])refundCost(TRAPS[t.type],1);delete S.traps[k]}if(S.wallCon===undefined)S.wallCon=null;
  if(S.raid&&S.raid.raiders&&S.raid.raiders.some(r=>r.tc===undefined))S.raid=null;
  for(const c of S.cols){c.hp=c.hp??100;c.post=null;c.stationKey=null;c.cover=false;c.coverTried=false;c.repT=null;c.needArm=false;if(typeof c.assign==='string'&&c.assign.startsWith('g:'))c.assign='guard';if(c.militia){if(c.milM&&c.melee){S.items[c.melee]=(S.items[c.melee]||0)+1;c.melee=null}c.milM=false;if(c.milW&&c.weapon){S.items[c.weapon]=(S.items[c.weapon]||0)+1;c.weapon=null}if(c.milA&&c.armor){S.items[c.armor]=(S.items[c.armor]||0)+1;c.armor=null}c.militia=false;c.milW=false;c.milA=false}}
  for(const p of S.plots){if(p.con&&!PLOTS[p.con.type]){refundCost(p.con.paid,1);delete p.con}if(p.type&&!PLOTS[p.type]){if(WINGS[p.type])refundCost(wingCost(p.type),1);p.type=null;p.tier=0;p.spent=0;delete p.par}}
  for(const p of S.plots){if(p.type==='workshop'&&p.tier>1){p.type='tailor';p.tier=2}if(BILLS[p.type]&&!BILLS[p.type].includes(p.bill))p.bill=BILLS[p.type][0]}setupSite();if(S.regen){S.outside=S.outside.concat(genOutside());delete S.regen}rebuildBlocked();cleanPlants();
  for(const c of S.cols){c.path=[];c.job=null;c.wait=0;c.sleeping=false;c.hunting=false;if(c.carcass){add('meat',20);add('leather',6);c.carcass=null}if(c.carry2){add(c.carry2.i,c.carry2.n);c.carry2=null}if(outOfGrid(c)){c.x=GX-2.5;c.y=GATE_Y+.5}if(c.carry){add(c.carry.i,c.carry.n);c.carry=null}if(c.load){for(const l of c.load)add(l.i,l.n);c.load=[]}for(const k of SKILLS){if(c.sk[k]===undefined){c.sk[k]=RI(0,6);c.pa[k]=0;c.xp[k]=0}}}
  for(const k in S.plants)S.plants[k].r=0;
  for(const o of S.outside)o.r=0;
  for(const a of S.ani){a.r=0;a.path=[];const p=plotById(a.pen);if(p){const[ox,oy]=plotOrigin(p);if(!inPlot(p,Math.floor(a.x),Math.floor(a.y))){a.x=ox+2.5;a.y=oy+2.5}}}
  for(const g of S.ground)g.r=0;
  S.vis=[];
  if(S.trader)spawnCaravanPawns(true);
  if(S.wanderer){const p=S.wanderer.p;S.vis.push({k:'wanderer',id:p.id,look:p,x:GX-1.5,y:GATE_Y-.5,path:[],face:'r',emT:3})}
  for(const o of S.outside)o.r=0;
  flowT0=S.t;unstick();
  if(S.migMsg){delete S.migMsg;letter('info','More room between plots','Your base was laid out again with wider lanes between the plots. Walls, gates, traps and wall defenses that no longer fit were refunded. New: wings for buildings, neighbour bonuses, and barricades or guard posts in the lanes between plots.')}
  return true;
}
async function catchUp(){return; /* offline progress disabled: nothing happens while the game is closed */
}
async function catchUpOld(){
  if(S.raid&&S.raid.phase==='active'){offlineSim=true;autoResolve();offlineSim=false}
  const away=(Date.now()-(S.lastSave||Date.now()))/1000;
  if(away<30)return;
  const sec=Math.min(away,4*3600);
  const before={silver:S.silver,items:{...S.items},ani:S.ani.length};
  offlineSim=true;awayNotes=[];{const n=Math.ceil(sec/.5);let t0=performance.now();for(let i=0;i<n;i++){tick(.5,true);if(performance.now()-t0>45){offlineSim=false;bootStep(`Catching up on ${fmtTime(sec)} away`,.72+.2*i/n);await nextFrame();offlineSim=true;t0=performance.now()}}}offlineSim=false;
  S.vis=S.vis.filter(v=>!v.leaving);
  for(const v of S.vis){if(v.walk){v.walk=null;if(v.home){v.x=v.home[0]+.5;v.y=v.home[1]+.5}}if(v.path&&v.path.length){const l=v.path[v.path.length-1];v.x=l[0]+.5;v.y=l[1]+.5;v.path=[]}}
  const lines=[];
  const ds=S.silver-before.silver;if(Math.abs(ds)>=1)lines.push(['silver','Silver',ds]);
  for(const i in ITEMS){const d=Math.floor(cnt(i))-Math.floor(before.items[i]||0);if(d)lines.push([i,ITEMS[i].n,d])}
  const da=S.ani.length-before.ani;if(da)lines.push(['egg','Animals',da]);
  modal={k:'away',sec:away,capped:away>sec,lines,notes:awayNotes.slice()};renderModal();
}

