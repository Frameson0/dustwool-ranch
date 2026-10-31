/* ================= expeditions ================= */
const DESTS={
  grove:{n:'Green hollow',d:'A quiet valley full of game, timber and rare seeds. Low risk.',far:1.2,stay:1,risk:.5,theme:'grove',req:0,loot:[['seeds',1,3],['meat',20,45],['leather',8,20],['wood',40,90],['cotton',15,35]]},
  ruins:{n:'Sunken ruins',d:'Collapsed old-world buildings. Data disks, steel and components.',far:1.6,stay:1.1,risk:1,theme:'ruin',req:0,loot:[['datadisk',1,2],['steel',20,50],['comp',2,5],['silver',60,160]]},
  outpost:{n:'Abandoned outpost',d:'A fortified camp, left in a hurry. Weapons, armor and shells, but scavengers prowl.',far:2,stay:1.2,risk:1.5,theme:'outpost',req:1,loot:[['datadisk',0,1],['mechpart',1,2],['rifle',0,2],['flakvest',0,1],['shell',2,6],['steel',30,60],['silver',100,250]]},
  wreck:{n:'Crashed starship',d:'A ship broke apart in the hills. Mech parts, plasteel and advanced components, guarded by dormant mechs.',far:2.6,stay:1.5,risk:2.2,theme:'wreck',req:2,loot:[['mechpart',3,6],['plasteel',20,50],['acomp',1,3],['comp',4,8],['charge',0,1]],relic:.25},
  lair:{n:'Behemoth tracks',d:'Tracks as big as a wagon lead into the badlands. Something huge sleeps there. Waking it brings it to your walls, and with it a great trophy.',far:2.4,stay:.8,risk:1.8,theme:'lair',req:3,loot:[['silver',150,300],['leather',20,40]]},
  vault:{n:'Ancient vault',d:'A sealed bunker deep in the mountains. Tech schematics, relics and old-world armor.',far:3.2,stay:1.6,risk:2.7,theme:'vault',req:4,loot:[['datadisk',2,3],['schem',1,2],['acomp',2,4],['marine',0,1],['silver',300,600]],relic:.5},
};
const XTH={grove:{far:'#6f8a5e',mid:'#58764a',gnd:'#7a7048',pr:['tree','tree','bush','rock']},ruin:{far:'#7d806a',mid:'#6a6c58',gnd:'#857258',pr:['rock','bush','pillar','tree']},outpost:{far:'#8a7c62',mid:'#766a50',gnd:'#8e7650',pr:['rock','bush','stake','tree']},
  wreck:{far:'#7a7466',mid:'#6a6250',gnd:'#8a7456',pr:['rock','scrap','bush','rock']},lair:{far:'#8a6e58',mid:'#6e5444',gnd:'#8a6a4c',pr:['rock','bone','rock','bush']},vault:{far:'#7a8090',mid:'#5e6470',gnd:'#77705e',pr:['rock','rock','pine','pine']}};
const XMAX=2;
function mapRoom(any){for(const k in S.lanes||{}){const l=S.lanes[k];if(l.type==='wing'&&l.w==='maproom'&&(any||!l.con))return k}return S.plots.some(p=>p.type==='maproom'&&(any||!p.con))?'plot':null}
function xPow(c){const w=c.weapon&&WEAPONS[c.weapon];return(4+c.sk.shooting*.8+(w?4+w.range/5:0)+(c.melee?3:0)+(ARMORV[c.armor]||0)*8+(c.helmet?2:0))*Math.max(.25,(c.hp??100)/100)}
function partyPow(e){return e.party.reduce((a,c)=>a+xPow(c),0)*(1+((S.legacy&&S.legacy.perks&&S.legacy.perks.scout)||0)*.15)}
function xNeed(dk,n){const D=DESTS[dk];return Math.ceil((D.far*2+D.stay)*1.5*n)}
function xLog(e,x,k){e.log.push({t:Math.round(S.t),x,k:k||''});if(e.log.length>40)e.log.shift()}
function xHurt(e,c,dmg,why){c.hp=(c.hp??100)-dmg;if(c.hp<=0&&opt('hardcore')){e.party=e.party.filter(o=>o!==c);xLog(e,`${c.nick} died: ${why}.`,'bad');chron('people',`${colName(c)} died on the expedition to the ${DESTS[e.dest].n.toLowerCase()}.`);letter('info',`${c.nick} is dead`,`${colName(c)} died on the expedition to the ${DESTS[e.dest].n.toLowerCase()}: ${why}.`);unequip(c);stat('deaths');return}
  if(c.hp<10){c.hp=10;c.recover=1}else if(c.hp<35)c.recover=1}
function xLoot(e,k,n){n=Math.round(n);if(n<=0)return'';e.loot[k]=(e.loot[k]||0)+n;return k==='silver'?`${n} silver`:`${n} ${ITEMS[k].n.toLowerCase()}`}
function xTurn(e,why){if(e.phase==='back')return;e.phase='back';e.dir=-1;xLog(e,why,'');sfx('letter')}
function startExp(dk,ids,meals){const D=DESTS[dk];if(!D||S.exps.length>=XMAX)return false;const party=S.cols.filter(c=>ids.includes(c.id));if(!party.length||party.length>4||party.length>=S.cols.length)return false;meals=Math.min(meals,Math.floor(cnt('meal')));if(meals>0)take('meal',meals);
  for(const c of party){releaseJob(c);Object.assign(c,{path:[],job:null,carry:null,wait:0,lpost:null});if(sel&&sel.k==='col'&&sel.id===c.id)sel=null}
  S.cols=S.cols.filter(c=>!party.includes(c));
  const e={id:nid(),dest:dk,party,meals,x:0,dir:1,phase:'out',stay:0,t:0,loot:{},log:[],enc:DAY*R(.15,.3),slow:0,choice:null,fx:null,min:false};for(const o of S.exps)o.min=true;
  xLog(e,`${party.map(c=>c.nick).join(', ')} set out for the ${D.n.toLowerCase()} with ${meals} meals.`);S.exps.push(e);chron('exp',`${party.map(c=>c.nick).join(', ')} set out for the ${D.n.toLowerCase()}.`);stat('exps');sfx('caravan');return true}
const XENC={
  road:[['raiders',3],['animals',2],['cache',2],['storm',1],['trader',1],['stranger',.4],['quiet',3]],
  site:[['search',5],['guards',2],['trap',1.2],['locked',1]]};
function xFight(e,diff,foe){const p=partyPow(e),D0=diff*(5+3*e.party.length)*R(.6,1.4),win=Math.random()<p/(p+D0);e.fx={k:foe,t:S.t,win};
  for(const c of e.party.slice()){gainXP(c,'shooting',3);xHurt(e,c,win?R(0,14):R(15,45),foe==='mech'?'cut down by a mech':foe==='beast'?'mauled by an animal':'shot in an ambush')}
  return win}
function runEnc(e){const D=DESTS[e.dest],tab=XENC[e.phase==='site'?'site':'road'];let tw=0;for(const x of tab)tw+=x[1];let q=Math.random()*tw,k='quiet';for(const x of tab){q-=x[1];if(q<=0){k=x[0];break}}
  const lt=()=>{const L=D.loot[RI(0,D.loot.length-1)];return xLoot(e,L[0],R(L[1],L[2]+.99)*.5)};
  if(k==='raiders'){const foe=e.dest==='wreck'?'mech':'raider';const w=xFight(e,D.risk,foe);if(w){const a=xLoot(e,'silver',R(20,60)*D.risk),b=Math.random()<.4?xLoot(e,evRand(['rifle','steelspear','leatherarmor','helmet']),1):'';xLog(e,`${foe==='mech'?'A mech patrol':'Raiders'} ambushed the party. Driven off! Took ${[a,b].filter(Boolean).join(' and ')}.`,'good')}else{for(const i in e.loot)e.loot[i]=Math.floor(e.loot[i]*.7);xLog(e,`${foe==='mech'?'Mechs':'Raiders'} ambushed the party and won. Some loot was lost.`,'bad')}}
  else if(k==='animals'){const w=xFight(e,D.risk*.6,'beast');xLog(e,w?`A pack of wild animals attacked. The party fought them off and butchered them: ${xLoot(e,'meat',R(15,35))}.`:'A pack of wild animals attacked. The party fled, bloodied.',w?'good':'bad')}
  else if(k==='cache'){e.fx={k:'cache',t:S.t};const a=lt();xLog(e,a?`Found a hidden cache by the road: ${a}.`:'Found an empty cache.',a?'good':'')}
  else if(k==='storm'){e.slow=e.t+DAY*.3;e.fx={k:'storm',t:S.t};xLog(e,'A storm rolled in. The party slows to a crawl.','')}
  else if(k==='trader'){const n=Math.min(e.party.length*2,10);e.meals+=n;xLog(e,`Met a lone trader and swapped stories for ${n} meals.`,'good');e.fx={k:'trader',t:S.t}}
  else if(k==='stranger'){e.choice={k:'stranger',until:e.t+DAY*.25,title:'A stranger on the road',text:'A lone wanderer asks to travel with the party and join your colony.',opts:[['Let them join','yes'],['Send them away','no']],def:'no'}}
  else if(k==='search'){const a=lt(),b=Math.random()<.4?lt():'';e.fx={k:'search',t:S.t};xLog(e,`Searched the ${D.n.toLowerCase()}: ${[a,b].filter(Boolean).join(', ')||'nothing useful'}.`,a?'good':'');for(const c of e.party)gainXP(c,'mining',1)
    if(D.relic&&Math.random()<D.relic*.35&&!e.relic){const r=pickRelic();if(r){e.relic=r;xLog(e,`Found a relic: ${RELICS[r].n}!`,'good')}}}
  else if(k==='guards'){const foe=e.dest==='wreck'||e.dest==='vault'?'mech':e.dest==='lair'||e.dest==='grove'?'beast':'raider';const w=xFight(e,D.risk*1.2,foe);xLog(e,w?`Guardians defended the site and fell. Behind them: ${lt()||'dust'}, ${lt()||'more dust'}.`:'Guardians drove the party back. They lick their wounds.',w?'good':'bad')}
  else if(k==='trap'){const c=evRand(e.party);xHurt(e,c,R(10,30),'killed by an old trap');xLog(e,`${c.nick} set off an old trap.`,'bad')}
  else if(k==='locked'){e.choice={k:'locked',until:e.t+DAY*.25,title:'A locked strongroom',text:'A heavy door, rusted shut. Forcing it takes time and could bring the roof down.',opts:[['Force it open','force'],['Leave it','leave']],def:'leave'}}
  else xLog(e,evRand(['A quiet stretch of road.','The party made good time.','Nothing but wind and dust.','They passed an old, burned-out wagon.']),'')}
function xChoose(e,v){const c0=e.choice;if(!c0)return;e.choice=null;const D=DESTS[e.dest];
  if(c0.k==='stranger'){if(v==='yes'){const c=genPawn();Object.assign(c,{path:[],job:null,assign:null,carry:null,hold:null,wait:0,food:.6,rested:1,buff:1,hp:80});e.party.push(c);xLog(e,`${c.nick} joined the party.`,'good');chron('people',`${colName(c)} joined an expedition on the road.`)}else xLog(e,'The stranger walked on alone.','')}
  else if(c0.k==='locked'){if(v==='force'){if(Math.random()<.7){const L=D.loot;const a=L.map(x=>xLoot(e,x[0],R(x[1],x[2]+.99)*.6)).filter(Boolean);xLog(e,`They forced the door. Inside: ${a.join(', ')||'nothing'}.`,'good')}else{const c=evRand(e.party);xHurt(e,c,R(25,50),'crushed by a collapsing roof');xLog(e,`The roof came down on ${c.nick}.`,'bad')}}else xLog(e,'They left the strongroom alone.','')}
  else if(c0.k==='lair'){if(v==='wake'){S.bossQ={k:'behemoth',at:S.t+DAY*R(.6,.9)};xLoot(e,'leather',30);xLog(e,'They woke the behemoth. It roared and turned toward the colony. Run!','bad');chron('boss','An expedition woke the behemoth. It is coming.');letter('info','The behemoth is awake',`Your expedition woke the behemoth in the badlands. It will reach the walls in about a day. Prepare.`);e.stay=99*DAY}else xLog(e,'They backed away from the sleeping giant.','')}}
function tickExp(dt){if(!S.exps||!S.exps.length)return;for(const e of S.exps.slice()){const D=DESTS[e.dest];e.t+=dt;
  e.meals-=dt/DAY*1.5*e.party.length;if(e.meals<0){e.meals=0;for(const c of e.party.slice())xHurt(e,c,dt/DAY*25,'starved');if(!e.starve){e.starve=1;xLog(e,'Out of food. The party is starving.','bad');xTurn(e,'They turn for home.')}}
  if(e.choice&&e.t>e.choice.until)xChoose(e,e.choice.def);
  const sp=dt/(D.far*DAY)*(e.slow>e.t?.4:1)*(1+bonus('travel'));
  if(e.phase==='out'){e.x+=sp;if(e.x>=1){e.x=1;e.phase='site';e.stay=0;xLog(e,`Arrived at the ${D.n.toLowerCase()}.`,'good');e.enc=e.t+DAY*R(.05,.12);if(e.dest==='lair')e.choice={k:'lair',until:e.t+DAY*.3,title:'The behemoth sleeps',text:'A beast the size of a barn sleeps in a hollow of bones. Wake it and it will march on your colony. If your walls hold, its hide and trophy are yours.',opts:[['Wake it','wake'],['Sneak away','leave']],def:'leave'}}}
  else if(e.phase==='site'){e.stay+=dt;if(e.stay>=D.stay*DAY)xTurn(e,'Packs are full. Heading home.')}
  else if(e.phase==='back'){e.x-=sp;if(e.x<=0){finishExp(e);continue}}
  if(e.party.length&&e.party.every(c=>(c.hp??100)<35)&&e.phase!=='back')xTurn(e,'Everyone is hurt. They turn back.');
  if(!e.party.length){S.exps=S.exps.filter(o=>o!==e);chron('exp',`The expedition to the ${D.n.toLowerCase()} was lost.`);letter('info','Expedition lost',`No one came back from the ${D.n.toLowerCase()}.`);continue}
  if(!e.choice&&e.t>=e.enc){runEnc(e);e.enc=e.t+DAY*(e.phase==='site'?R(.12,.25):R(.18,.4))}}}
function finishExp(e){const D=DESTS[e.dest];S.exps=S.exps.filter(o=>o!==e);const got=[];for(const k in e.loot){const n=e.loot[k];if(n<=0)continue;if(k==='silver')S.silver+=n;else add(k,n);got.push(k==='silver'?`${n} silver`:`${n} ${ITEMS[k].n.toLowerCase()}`)}
  if(e.meals>=1)add('meal',Math.floor(e.meals));
  for(const c of e.party){c.x=GX-1.5;c.y=GATE_Y+.5+R(-.4,.4);c.path=[];c.job=null;S.cols.push(c)}
  if(e.relic)gainRelic(e.relic,`found by the expedition to the ${D.n.toLowerCase()}`);
  S.expDone=(S.expDone||0)+1;const nm=e.party.map(c=>c.nick).join(', ');
  chron('exp',`${nm} came back from the ${D.n.toLowerCase()}${got.length?' with '+got.join(', '):''}.`);letter('info','Expedition home',`${nm} came back from the ${D.n.toLowerCase()}.${got.length?' They brought '+got.join(', ')+'.':' They came back empty-handed.'}${e.relic?' And a relic: '+RELICS[e.relic].n+'.':''}`);sfx('caravan')}
/* --- expedition window --- */
function vn1(x,s){const i=Math.floor(x),f=x-i,h=n=>{const v=Math.sin(n*127.1+s*311.7)*43758.5453;return v-Math.floor(v)},u=f*f*(3-2*f);return h(i)*(1-u)+h(i+1)*u}
function mixC(a,b,t){const p=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)],A=p(a),B=p(b);return`rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`}
function xFoe(g,x,y,s,k){g.fillStyle='rgba(0,0,0,.25)';E(g,x,y+s*.32,s*.25,s*.07);g.fill();
  if(k==='beast'){E(g,x,y+s*.05,s*.42,s*.22);fs(g,'#6e5236',1.6);g.beginPath();g.arc(x-s*.38,y-s*.08,s*.16,0,7);fs(g,'#6e5236',1.6);g.fillStyle='#ffd27a';g.fillRect(x-s*.45,y-s*.12,2,2);return}
  if(k==='mech'){rr(g,x-s*.2,y-s*.3,s*.4,s*.5,4);fs(g,'#5a6168',1.6);g.fillStyle='#ff5a3a';g.fillRect(x-s*.12,y-s*.2,s*.24,3);g.strokeStyle=OUT;g.lineWidth=3;g.beginPath();g.moveTo(x-s*.12,y+s*.2);g.lineTo(x-s*.18,y+s*.34);g.moveTo(x+s*.12,y+s*.2);g.lineTo(x+s*.18,y+s*.34);g.stroke();return}
  if(k==='trader'){E(g,x,y,s*.2,s*.26);fs(g,'#4a6e8a',1.6);g.beginPath();g.arc(x,y-s*.3,s*.13,0,7);fs(g,'#d8b08a',1.4);rr(g,x+s*.15,y-s*.15,s*.22,s*.3,3);fs(g,'#8a6640',1.4);return}
  E(g,x,y,s*.2,s*.26);fs(g,'#7a3a32',1.6);g.beginPath();g.arc(x,y-s*.3,s*.13,0,7);fs(g,'#c8946a',1.4);g.strokeStyle='#3a2a1a';g.lineWidth=2.5;g.beginPath();g.moveTo(x-s*.1,y-s*.05);g.lineTo(x-s*.42,y-s*.12);g.stroke()}
function xProp(g,k,x,y,s){
  if(k==='tree'||k==='pine'){g.fillStyle='#5a4028';g.fillRect(x-2,y-s*.5,4,s*.5);g.beginPath();if(k==='pine'){g.moveTo(x,y-s*1.4);g.lineTo(x+s*.38,y-s*.4);g.lineTo(x-s*.38,y-s*.4);g.closePath();fs(g,'#3e5e42',1.4)}else{g.arc(x,y-s*.75,s*.36,0,7);fs(g,'#4e7444',1.4)}return}
  if(k==='bush'){E(g,x,y-s*.12,s*.26,s*.14);fs(g,'#5e7a48',1.2);return}
  if(k==='rock'){g.beginPath();g.moveTo(x-s*.3,y);g.lineTo(x-s*.18,y-s*.26);g.lineTo(x+s*.12,y-s*.3);g.lineTo(x+s*.32,y);g.closePath();fs(g,'#8a8a82',1.4);return}
  if(k==='pillar'){rr(g,x-s*.12,y-s*.9,s*.24,s*.9,2);fs(g,'#a8a294',1.4);return}
  if(k==='stake'){g.strokeStyle='#6a4a2a';g.lineWidth=3;g.beginPath();g.moveTo(x,y);g.lineTo(x+4,y-s*.6);g.stroke();return}
  if(k==='scrap'){g.beginPath();g.moveTo(x-s*.3,y);g.lineTo(x-s*.1,y-s*.3);g.lineTo(x+s*.25,y-s*.12);g.lineTo(x+s*.3,y);g.closePath();fs(g,'#6d7377',1.4);return}
  if(k==='bone'){g.strokeStyle='#e8e0cc';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(x-s*.25,y-2);g.quadraticCurveTo(x,y-s*.4,x+s*.25,y-2);g.stroke();return}}
function xLandmark(g,th,x,y,s,now){
  if(th==='home'){g.fillStyle='#8a7a62';for(let k=0;k<5;k++){rr(g,x-s*1.2+k*s*.5,y-s*.9,s*.42,s*.9,2);fs(g,'#9a8a6c',1.6)}rr(g,x-s*.2,y-s*.6,s*.4,s*.6,2);fs(g,'#5a4028',1.6);return}
  if(th==='grove'){E(g,x,y-4,s*.9,s*.16);fs(g,'#5a8aa8',1.4);for(const[a,b]of[[-1,1.3],[.9,1.6],[-.2,1.9]])xProp(g,'tree',x+a*s,y-6,s*b);return}
  if(th==='ruin'){for(const[a,hh]of[[-1,1.2],[-.5,.6],[.3,1.5],[.9,.9]]){rr(g,x+a*s-s*.15,y-s*hh,s*.3,s*hh,2);fs(g,'#a8a294',1.6)}rr(g,x-s*.6,y-s*1.6,s*1.2,s*.2,2);fs(g,'#b8b2a2',1.6);return}
  if(th==='outpost'){for(let k=-4;k<=4;k++){g.beginPath();g.moveTo(x+k*s*.2-s*.08,y);g.lineTo(x+k*s*.2-s*.08,y-s*.8);g.lineTo(x+k*s*.2,y-s*.95);g.lineTo(x+k*s*.2+s*.08,y-s*.8);g.lineTo(x+k*s*.2+s*.08,y);fs(g,'#7a5834',1.2)}rr(g,x+s*.5,y-s*1.7,s*.5,s*.4,2);fs(g,'#6a4a2a',1.4);g.fillStyle='#6a4a2a';g.fillRect(x+s*.55,y-s*1.3,3,s*1.3);g.fillRect(x+s*.92,y-s*1.3,3,s*1.3);g.fillStyle='#b03a2a';g.fillRect(x+s*.75,y-s*2.2,s*.3,s*.18);return}
  if(th==='wreck'){g.save();g.translate(x,y-s*.3);g.rotate(-.18);rr(g,-s*1.4,-s*.4,s*2.8,s*.8,s*.35);fs(g,'#8a9098',2);g.fillStyle='#4a5058';g.fillRect(-s*.6,-s*.15,s*.25,s*.15);g.fillRect(-s*.2,-s*.15,s*.25,s*.15);g.restore();for(let k=0;k<4;k++){const t=(now/2000+k/4)%1;g.fillStyle=`rgba(80,80,80,${.35*(1-t)})`;g.beginPath();g.arc(x+s*.9+t*s*.4,y-s*.8-t*s*1.6,s*.15+t*s*.3,0,7);g.fill()}return}
  if(th==='lair'){g.beginPath();g.moveTo(x-s*1.6,y);g.quadraticCurveTo(x-s*1.2,y-s*1.8,x,y-s*1.9);g.quadraticCurveTo(x+s*1.3,y-s*1.8,x+s*1.6,y);fs(g,'#6e5444',2);g.beginPath();g.ellipse(x,y,s*.7,s*.9,0,Math.PI,0);g.fillStyle='#1a120c';g.fill();const bl=(now%4000)<180?0:1;if(bl){g.fillStyle='#ffb84a';g.fillRect(x-s*.25,y-s*.5,4,3);g.fillRect(x+s*.15,y-s*.5,4,3)}xProp(g,'bone',x-s*1,y,s*.8);return}
  if(th==='vault'){g.beginPath();g.moveTo(x-s*2,y);g.lineTo(x-s*.6,y-s*2.2);g.lineTo(x+s*.4,y-s*1.6);g.lineTo(x+s*1.2,y-s*2.4);g.lineTo(x+s*2.2,y);fs(g,'#6a7080',2);g.beginPath();g.arc(x,y-s*.5,s*.5,Math.PI,0);g.lineTo(x+s*.5,y);g.lineTo(x-s*.5,y);g.closePath();fs(g,'#9aa0a8',2);g.beginPath();g.arc(x,y-s*.45,s*.2,0,7);fs(g,'#c9a640',1.4)}}
function drawExpScene(cv,e,now){const D=DESTS[e.dest],TH=XTH[D.theme],dpr=Math.min(2,devicePixelRatio||1),w=cv.clientWidth|0,h=cv.clientHeight|0;if(!w||!h)return;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  const hr=(S.t%DAY)/DAY,lt=clamp((.5-.5*Math.cos(hr*Math.PI*2))*1.7-.3,0,1),dusk=clamp(1-Math.abs(lt-.45)*3,0,1)*.6;
  const sk=g.createLinearGradient(0,0,0,h);sk.addColorStop(0,mixC('#0c1222','#78a8cc',lt));sk.addColorStop(1,mixC(mixC('#1c2236','#e4dcc0',lt).replace(/rgb\((\d+),(\d+),(\d+)\)/,(m,a,b,c)=>'#'+[a,b,c].map(v=>(+v).toString(16).padStart(2,'0')).join('')),'#e8a070',dusk));g.fillStyle=sk;g.fillRect(0,0,w,h);
  {const a=hr*Math.PI*2-Math.PI/2,sx=w*.5+Math.cos(a)*w*.42,sy=h*.62+Math.sin(a)*h*.5;if(sy<h*.6){g.beginPath();g.arc(sx,sy,lt>.15?9:7,0,7);g.fillStyle=lt>.15?'#fff2c0':'#d8dce8';g.fill()}const ma=a+Math.PI,mx=w*.5+Math.cos(ma)*w*.42,my=h*.62+Math.sin(ma)*h*.5;if(my<h*.6&&lt<.3){g.beginPath();g.arc(mx,my,6,0,7);g.fillStyle='#d8dce8';g.fill()}
    if(lt<.35){g.fillStyle=`rgba(255,255,255,${(.35-lt)*1.6})`;for(let k=0;k<30;k++)g.fillRect((k*97.3)%w,(k*41.7)%(h*.5),1.2,1.2)}}
  const L=D.far*1800,off=e.x*L,gy=h*.78;
  for(const[par,col,amp,base,sd]of[[.12,TH.far,26,.5,1],[.35,TH.mid,20,.62,2]]){g.beginPath();g.moveTo(0,h);for(let x=0;x<=w+6;x+=6){const y=h*base-vn1((x+off*par)/80,sd)*amp-vn1((x+off*par)/23,sd+5)*amp*.3;g.lineTo(x,y)}g.lineTo(w,h);g.closePath();g.fillStyle=mixC(TH.far===col?'#7a8088':'#5a6058','#000000',0).replace('rgb','rgb');g.fillStyle=col;g.fill()}
  g.fillStyle=TH.gnd;g.fillRect(0,gy,w,h-gy);g.fillStyle='rgba(255,240,200,.18)';g.fillRect(0,gy+10,w,6);
  const step=64,k0=Math.floor((off-60)/step);
  for(let k=k0;k<k0+w/step+3;k++){const r=vn1(k*7.7,3);if(r<.35)continue;const px=k*step-off+(r*40-20),pr=TH.pr[Math.floor(r*997)%TH.pr.length];xProp(g,pr,px,gy+2+(r*13%1)*4,22+r*14)}
  xLandmark(g,'home',w*.12-off,gy+3,26,now);xLandmark(g,D.theme,L+w*.72-off,gy+3,30,now);
  const fx=e.fx&&S.t-e.fx.t<10?e.fx:null,mv=(e.phase!=='site')&&S.speed>0&&!e.choice,face=e.dir>0?'r':'l';
  e.party.forEach((c,i)=>{let px,py=gy+2,b=0;if(e.phase==='site'){px=w*.42+i*30+Math.sin(now/1500+i*2)*6;b=Math.abs(Math.sin(now/300+i))*1.5}else{px=e.dir>0?w*.36-i*28:w*.36+i*28;b=mv?Math.abs(Math.sin(now/130+i*1.3))*2.6:0}
    drawPawn(g,c,px,py-13,38,e.phase==='site'?(Math.sin(now/1500+i*2)>0?'r':'l'):face,b);
    if((c.hp??100)<35){g.fillStyle='#d86a52';g.fillRect(px-1.5,py-34,3,6);g.fillRect(px-4.5,py-32.5,9,3)}});
  if(fx){const t=(S.t-fx.t)/10,ex=w*.78-t*w*.05;
    if(fx.k==='raider'||fx.k==='mech'||fx.k==='beast'){for(let k=0;k<3;k++)xFoe(g,ex+k*22,gy-8+k%2*4,30,fx.k);if(t<.6&&Math.floor(now/90)%2){g.strokeStyle='#ffe08a';g.lineWidth=1.5;g.beginPath();g.moveTo(w*.38,gy-18);g.lineTo(ex-10,gy-16);g.stroke()}}
    else if(fx.k==='trader')xFoe(g,w*.62,gy-8,30,'trader');
    else if(fx.k==='cache'||fx.k==='search'){const cx=fx.k==='cache'?w*.5:w*.6;rr(g,cx-9,gy-12,18,12,2);fs(g,'#8a6640',1.4);g.fillStyle=`rgba(255,220,120,${.5+.5*Math.sin(now/200)})`;g.beginPath();g.arc(cx,gy-16,4,0,7);g.fill()}
    if(fx.k==='storm'||e.slow>e.t){g.strokeStyle='rgba(200,215,235,.45)';g.lineWidth=1;g.beginPath();for(let k=0;k<50;k++){const rx=(k*53+now*.6)%w,ry=(k*31+now*.9)%h;g.moveTo(rx,ry);g.lineTo(rx-4,ry+10)}g.stroke()}}
  if(e.choice){const px=w*.36;g.fillStyle='#f0c050';g.font='bold 18px system-ui';g.textAlign='center';g.fillText('!',px,gy-46-Math.abs(Math.sin(now/250))*4)}
  if(lt<.6){g.fillStyle=`rgba(12,18,40,${(.6-lt)*.6})`;g.fillRect(0,0,w,h)}
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,h-5,w,5);g.fillStyle='#d8b14a';g.fillRect(0,h-5,w*e.x,5)}
function xEta(e){const D=DESTS[e.dest];let s=e.phase==='out'?(1-e.x)*D.far*DAY+D.stay*DAY+D.far*DAY:e.phase==='site'?Math.max(0,D.stay*DAY-e.stay)+D.far*DAY:e.x*D.far*DAY;return s}
function xHours(sec){const hh=Math.ceil(sec/DAY*24);return hh>=24?`${Math.floor(hh/24)}d ${hh%24}h`:`${hh}h`}
function uiExp(){const box=$('expwins');if(!box)return;if(!S.exps)ensureState2();const L=S.exps||[];for(const el of[...box.children])if(!L.some(e=>String(e.id)===el.dataset.eid))el.remove();
  for(const e of L){let el=box.querySelector(`[data-eid="${e.id}"]`);if(!el){el=document.createElement('div');el.className='expw pane';el.dataset.eid=e.id;el.innerHTML='<div class="xh"></div><canvas></canvas><div class="xb"></div>';box.appendChild(el);popEl(el)}
    el.classList.toggle('min',!!e.min);el.classList.toggle('alert',!!e.choice);const D=DESTS[e.dest],ph=e.phase==='out'?'On the road':e.phase==='site'?'Exploring':'Heading home';
    setHTML(el.querySelector('.xh'),`<b>${esc(D.n)}</b><span class="dim">${ph} · ${xHours(xEta(e))} left${e.choice?' · <span class="warn">needs you</span>':''}</span><span class="xbar"><i style="width:${Math.round((e.phase==='out'?e.x*.4:e.phase==='site'?.4+.2*Math.min(1,e.stay/(D.stay*DAY)):.6+.4*(1-e.x))*100)}%"></i></span><button data-act="xmin" data-id="${e.id}" aria-label="${e.min?'Expand':'Minimize'}">${e.min?'▴':'▾'}</button>`);
    if(e.min){el.querySelector('.xb')._h='';continue}
    let b=`<div class="xparty">${e.party.map(c=>`<span class="xp"><img src="${portrait(c)}" alt=""><span><b>${esc(c.nick)}</b><span class="hpb"><i style="width:${Math.max(0,c.hp??100)}%;background:${(c.hp??100)<35?'#d86a52':'#8fc46a'}"></i></span></span></span>`).join('')}<span class="dim xs">${Math.floor(e.meals)} meals${Object.keys(e.loot).length?' · carrying '+Object.entries(e.loot).filter(x=>x[1]>0).map(([k,n])=>k==='silver'?n+' silver':n+' '+ITEMS[k].n.toLowerCase()).join(', '):''}</span></div>`;
    if(e.choice)b+=`<div class="xch"><b>${esc(e.choice.title)}</b><div>${esc(e.choice.text)}</div><div class="row" style="gap:6px">${e.choice.opts.map(o=>`<button data-act="xch" data-id="${e.id}" data-v="${o[1]}">${esc(o[0])}</button>`).join('')}</div></div>`;
    b+=`<div class="xlog">${e.log.slice(-4).reverse().map(l=>`<div class="${l.k}">${esc(l.x)}</div>`).join('')}</div>`;
    if(e.phase!=='back')b+=`<div class="row"><button data-act="xback" data-id="${e.id}">Turn back</button></div>`;
    setHTML(el.querySelector('.xb'),b)}}
function drawExpWins(now){const box=$('expwins');if(!box||!S.exps||!S.exps.length)return;for(const e of S.exps){if(e.min)continue;const el=box.querySelector(`[data-eid="${e.id}"] canvas`);if(el)drawExpScene(el,e,now)}}
function xplanHTML(){if(!S.exps)ensureState2();const m=modal,mr=mapRoom();let h=`<div class="between"><h3>Plan an expedition</h3><button data-act="close" aria-label="Close">✕</button></div>`;
  if(!mr)return h+`<p>Build a <b>Map room</b> first: a wing next to the commons, a house or the research building.</p><div class="row"><button data-act="close">OK</button></div>`;
  if(S.exps.length>=XMAX)h+=`<p class="warn">Two expeditions are already out. Wait for one to come home.</p>`;
  const done=S.expDone||0;h+='<div class="xdests">';
  for(const k in DESTS){const D=DESTS[k],lock=done<D.req;h+=`<button class="xdest ${m.dest===k?'on':''}" data-act="xdest" data-v="${k}" ${lock?'disabled':''}><b>${esc(D.n)}</b><small>${lock?`Unlocks after ${D.req} expedition${D.req>1?'s':''}`:esc(D.d)}</small><small class="dim">${(D.far*2+D.stay).toFixed(1)} days · risk ${'●'.repeat(Math.round(D.risk*2))}${'○'.repeat(Math.max(0,6-Math.round(D.risk*2)))}</small></button>`}
  h+='</div>';
  const pick=m.pick;h+=`<h4>Party (up to 4, one must stay home)</h4><div class="chips">${S.cols.map(c=>`<button class="chip ${pick.has(c.id)?'on':''}" data-act="xpick" data-id="${c.id}"><img src="${portrait(c)}" alt="" style="width:20px;height:20px;vertical-align:middle"> ${esc(c.nick)} <small class="dim">${Math.round(xPow(c))}</small></button>`).join('')}</div>`;
  const n=pick.size;if(m.dest&&n){const need=xNeed(m.dest,n);if(m.meals==null)m.meals=Math.min(need,Math.floor(cnt('meal')));
    const p=[...pick].map(id=>S.cols.find(c=>c.id===id)).filter(Boolean).reduce((a,c)=>a+xPow(c),0),D=DESTS[m.dest],d0=D.risk*(5+3*n);
    h+=`<h4>Supplies</h4><div class="row" style="gap:6px;align-items:center"><button data-act="xmeal" data-v="-5">−5</button><b>${m.meals} meals</b><button data-act="xmeal" data-v="5">+5</button><span class="dim" style="font-size:12px">${Math.floor(cnt('meal'))} in storage · ${need} for the whole trip</span></div>${m.meals<need?'<div class="warn" style="font-size:12px">Not enough food for the whole trip: they will starve on the way home.</div>':''}
    <div style="font-size:12.5px">Party strength <b>${Math.round(p)}</b> vs. danger <b>${Math.round(d0)}</b> · ${p>d0*1.3?'<span class="good">should be fine</span>':p>d0*.8?'<span class="warn">risky</span>':'<span class="bad">very dangerous</span>'}${opt('hardcore')?' · <span class="bad">Hardcore: colonists can die</span>':' · injuries only, nobody dies'}</div>`}
  h+=`<div class="row"><button class="primary" data-act="xgo" ${!m.dest||!n||S.exps.length>=XMAX||n>=S.cols.length?'disabled':''}>Set out</button><button data-act="close">Cancel</button></div>`;return h}

