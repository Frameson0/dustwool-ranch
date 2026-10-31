/* ================= random events (storyteller) ================= */
const STORY={calm:{f:.55,neg:.35,n:'Calm'},normal:{f:1,neg:.6,n:'Normal'},hard:{f:1.6,neg:.95,n:'Harsh'}};
function modMul(k){let m=1;S.mods=(S.mods||[]).filter(x=>x.until>S.t);for(const x of S.mods)if(x.k===k)m*=x.v;return m}
function addMod(k,v,days,n){S.mods=S.mods||[];S.mods.push({k,v,until:S.t+DAY*days,n})}
function evRand(a){return a[Math.floor(Math.random()*a.length)]}
const EVENTS=[
  {id:'meteor',w:1,good:1,ok:()=>true,go(){const n=RI(30,70),st=RI(30,60);add('steel',n);add('stone',st);const b=baseBox();if(!offlineSim)boomFx(b.x0-RI(4,8),(b.y0+b.y1)/2+R(-6,6));return['Meteorite',`A meteorite slammed into the ground outside the wall. Your colonists hauled ${n} steel and ${st} stone out of the crater.`]}},
  {id:'pods',w:1,good:1,ok:()=>true,go(){const pool=[['meal',RI(15,30)],['comp',RI(3,6)],['steel',RI(20,40)],['wood',RI(40,80)],['leather',RI(10,25)],['finemeal',RI(8,16)]],got=[];for(let k=0;k<3;k++){const[i,n]=evRand(pool);add(i,n);got.push(`${n} ${ITEMS[i].n.toLowerCase()}`)}return['Cargo pods',`Cargo pods from a wrecked ship fell near the colony: ${got.join(', ')}.`]}},
  {id:'harvest',w:.8,good:1,ok:()=>built('farm').length>0&&seasonIdx()!==3,go(){addMod('grow',1.5,1,'Bumper crop');return['Bumper crop','Perfect weather: crops grow 50% faster for a day.']}},
  {id:'inspire',w:.8,good:1,ok:()=>S.cols.length>0,go(){const c=evRand(S.cols),sk=evRand(SKILLS.filter(k=>c.sk[k]<20));if(!sk)return null;c.sk[sk]++;chron('people',`${c.nick} had a flash of inspiration in ${SKN[sk].toLowerCase()}.`);return['Inspiration',`${c.nick} had a flash of inspiration: ${SKN[sk]} rose to ${c.sk[sk]}.`]}},
  {id:'gift',w:.7,good:1,ok:()=>true,go(){const n=RI(80,250);S.silver+=n;return['Grateful travelers',`Travelers your caravans once helped left ${n} silver at the gate.`]}},
  {id:'herd',w:.6,good:1,ok:()=>true,go(){for(let k=0;k<4;k++)spawnWild(true);return['Migrating herd','A herd of wild animals wandered into the area. Good hunting.']}},
  {id:'blight',w:1,good:0,ok:()=>Object.keys(S.plants).length>8&&seasonIdx()!==3,go(){const ks=Object.keys(S.plants).filter(k=>{const p=S.plots[S.plants[k].pid];return p&&p.type==='farm'});let n=0;for(const k of ks)if(Math.random()<.3){delete S.plants[k];n++}if(!n)return null;return['Crop blight',`A blight swept through the fields. ${n} plants withered.`]}},
  {id:'sick',w:.7,good:0,ok:()=>S.ani.length>=3,go(){const a=evRand(S.ani);S.ani=S.ani.filter(x=>x!==a);return['Animal sickness',`A ${ANIMALS[a.type].n.toLowerCase()} caught a fever and died.`]}},
  {id:'heat',w:.8,good:0,ok:()=>seasonIdx()===1&&S.site.biome!=='tundra',go(){addMod('grow',.5,1,'Heat wave');return['Heat wave','Scorching heat: outdoor crops grow at half speed for a day.']}},
  {id:'cold',w:.8,good:0,ok:()=>(seasonIdx()===2||seasonIdx()===3)&&S.site.biome!=='arid',go(){addMod('grow',.5,1,'Cold snap');return['Cold snap','A sudden frost: outdoor crops grow at half speed for a day.']}},
  {id:'fire',w:.7,good:0,ok:()=>built().filter(walled).length>0,go(){const p=evRand(built().filter(walled));{const[ox,oy]=plotOrigin(p);ignite(ox+2,oy+2);ignite(ox+1,oy+3)}p.dmg=Math.min(1,(p.dmg||0)+.6);plotDirty=true;if(!offlineSim){const[ox,oy]=plotOrigin(p);for(let k=0;k<12;k++)fx.push({k:'dust',x:ox+R(0,5),y:oy+R(0,5),z:.5,vx:R(-.2,.2),vy:-.4,vz:0,t:0,life:2,sz:10})}return['Fire!',`A fire broke out in the ${plotName(p).toLowerCase()}. Put it out before it spreads, then repair the damage.`]}},
  {id:'thief',w:.8,good:0,ok:()=>S.silver>100,go(){const g=S.cols.filter(isGuard).length;if(g&&S.wall>=0){const n=RI(30,90);S.silver+=n;chron('raid','The guards caught a thief at night.');return['Thief caught',`A thief tried to slip over the wall at night. Your guards caught him and kept the ${n} silver he carried.`]}const n=Math.min(300,Math.round(S.silver*.12));S.silver-=n;return['Thief',`A thief crept into the colony at night and made off with ${n} silver. Guards on the wall would have stopped him.`]}},
  {id:'scouts',w:.6,good:0,ok:()=>!S.raid&&S.t>4*DAY,go(){startRaid(RI(3,5),['W'],40,false,'tribal');return null}},
  {id:'refugee',w:.7,good:2,ok:()=>!S.raid,choice:[['Take them in','yes'],['Turn them away','no']],txt:['A wounded refugee','A wounded refugee stumbles to the gate. Raiders are on their trail. Take them in and you gain a colonist, but the raiders will follow.']},
  {id:'scholar',w:.6,good:2,ok:()=>S.silver>=400,choice:[['Buy for 400 silver','yes'],['No thanks','no']],txt:['A traveling scholar','A traveling scholar offers a rare schematic for 400 silver. Some research needs schematics.']},
  {id:'crate',w:.6,good:2,ok:()=>!S.raid,choice:[['Open it','yes'],['Leave it','no']],txt:['A sealed crate','Your gatherers found a sealed crate half buried outside the wall. It could hold anything.']},
  {id:'beggar',w:.6,good:2,ok:()=>cnt('meal')>=10,choice:[['Give 10 meals','yes'],['Refuse','no']],txt:['A sick traveler','A sick traveler begs for food at the gate.']},
];
function evChoose(id,ch,quiet){const E=EVENTS.find(e=>e.id===id);if(!E)return;let t='';
  if(id==='refugee'&&ch==='yes'){const c=genPawn();c.x=GX-1.5;c.y=GATE_Y+.5;Object.assign(c,{path:[],job:null,assign:null,carry:null,hold:null,wait:0,food:.6,rested:1,buff:1,hp:55});S.cols.push(c);chron('people',`${colName(c)}, a refugee, joined the colony.`);startRaid(RI(4,7),['W'],60,false,'tribal');t=`${c.nick} joined the colony. Their pursuers are coming.`}
  else if(id==='scholar'&&ch==='yes'){if(S.silver>=400){S.silver-=400;add('schem',1);t='You bought the schematic.'}else t='Not enough silver.'}
  else if(id==='crate'&&ch==='yes'){if(Math.random()<.65){const n=RI(3,6),st=RI(20,40),sv=RI(80,200);add('comp',n);add('steel',st);S.silver+=sv;t=`Inside: ${n} components, ${st} steel and ${sv} silver.`}else{startRaid(RI(4,6),['W'],20,false,'insect');t='Insectoid eggs! A swarm hatched and comes for the colony.'}}
  else if(id==='beggar'&&ch==='yes'){take('meal',10);S.story=S.story||{next:S.t+DAY,tension:0};S.story.owed={at:S.t+DAY*R(1,2)};t='The traveler thanks you and limps away.'}
  if(t&&!quiet)msg(t,'');chron('event',`${E.txt[0]}: ${t||'nothing happened.'}`)}
function tickStory(dt){S.story=S.story||{next:S.t+DAY*R(.8,1.5),tension:0};const st=S.story,lv=STORY[opt('story')]||STORY.normal;
  st.tension=Math.max(0,st.tension-dt/DAY*.25);
  if(st.owed&&S.t>=st.owed.at){st.owed=null;const n=RI(200,350);S.silver+=n;letter('info','A debt repaid',`The sick traveler you fed came back, healthy, with ${n} silver to say thanks.`);chron('event','The traveler you fed came back with a gift.')}
  for(const l of S.letters)if(l.k==='event'&&!l.data.done&&S.t-l.t>DAY){l.data.done=true;evChoose(l.data.ev,'no',true)}
  if(S.t<st.next||S.t<2*DAY||raidActive())return;st.next=S.t+DAY/lv.f*R(.6,1.4);
  const pool=EVENTS.filter(e=>e.ok()&&(e.good!==0||st.tension<lv.neg));let tw=0;for(const e of pool)tw+=e.w;let q=Math.random()*tw,E=null;for(const e of pool){q-=e.w;if(q<=0){E=e;break}}if(!E)return;
  if(E.choice){const l={id:nid(),k:'event',title:E.txt[0],text:E.txt[1],data:{ev:E.id,choices:E.choice},t:S.t};S.letters.push(l);sfx('letter');if(!offlineSim){if(opt('pauseEvent'))S.speed=0;}st.tension+=.15;return}
  const r=E.go();if(!r)return;letter('info',r[0],r[1]);chron('event',r[1]);st.tension+=E.good?-.1:.45}

