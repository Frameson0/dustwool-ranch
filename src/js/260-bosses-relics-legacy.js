/* ================= bosses, relics, legacy ================= */
const RELICS={
  horn:{n:'Behemoth horn',d:'Raiders arrive with 10% less health.',fx:{raidhp:-.1},boss:1},
  core:{n:'Mech core',d:'Colonists work 8% faster.',fx:{work:.08},boss:1},
  crown:{n:'Warlord’s crown',d:'Traders pay 10% better prices.',fx:{trade:.1},boss:1},
  idol:{n:'Jade idol',d:'Crops and trees grow 10% faster.',fx:{grow:.1}},
  compass:{n:'Star compass',d:'Expeditions travel 20% faster.',fx:{travel:.2}},
  tome:{n:'Archotech tome',d:'Research 20% faster.',fx:{research:.2}},
  charm:{n:'Runner’s charm',d:'Colonists walk 10% faster.',fx:{walk:.1}},
};
const PERKS={
  green:{n:'Green thumb',d:'+8% crop growth per level.',max:3,row:0,fx:{grow:.08}},
  trade:{n:'Silver tongue',d:'+5% trade prices per level.',max:3,row:0,fx:{trade:.05}},
  work:{n:'Hard workers',d:'+4% work speed per level.',max:3,row:0,fx:{work:.04}},
  scout:{n:'Pathfinders',d:'Expedition parties are 15% stronger and 10% faster per level.',max:3,row:1,fx:{travel:.1}},
  walls:{n:'Stonemasons',d:'Raiders arrive with 5% less health per level.',max:3,row:1,fx:{raidhp:-.05}},
  learn:{n:'Scholars',d:'+10% research per level.',max:3,row:1,fx:{research:.1}},
  cache:{n:'Founders’ cache',d:'Each move brings 300 extra silver and 20 meals per level.',max:3,row:2},
  vet:{n:'Veterans',d:'Colonists learn 15% faster per level.',max:3,row:2,fx:{xp:.15}},
};
function perkCost(k){const l=(S.legacy.perks[k]||0);return PERKS[k].row+2+l*2}
function perkOpen(k){const r=PERKS[k].row;if(!r)return true;let n=0;for(const q in PERKS)if(PERKS[q].row===r-1)n+=S.legacy.perks[q]||0;return n>=3}
function bonus(k){if(!S||!S.legacy)return 0;let b=0;for(const r of S.relics||[]){const R0=RELICS[r];if(R0&&R0.fx[k])b+=R0.fx[k]}for(const p in S.legacy.perks){const P=PERKS[p];if(P&&P.fx&&P.fx[k])b+=P.fx[k]*S.legacy.perks[p]}return b}
function pickRelic(){const own=new Set(S.relics||[]),pool=Object.keys(RELICS).filter(k=>!RELICS[k].boss&&!own.has(k));return pool.length?evRand(pool):null}
function gainRelic(k,how){if(!RELICS[k]||(S.relics||[]).includes(k))return;S.relics.push(k);chron('legacy',`Relic: ${RELICS[k].n}, ${how}. ${RELICS[k].d}`);letter('info',`Relic: ${RELICS[k].n}`,`${RELICS[k].n}, ${how}, now stands in your relic monument. ${RELICS[k].d} Relics stay with the colony when you move.`);sfx('victory')}
const BOSSES={
  mech:{n:'Mech cluster',t:'Centipede war mech',fac:'mech',esc:6,hp:9,sz:2.1,armor:.5,kind:'archer',relic:'core',loot:{plasteel:60,acomp:4,comp:10},intro:'A mech cluster crashed from orbit. Its centipede war mech is marching on the colony.'},
  warlord:{n:'The Warlord',t:'Warlord of the Ashen Tribe',fac:'tribal',esc:14,hp:11,sz:1.7,armor:.25,kind:'melee',relic:'crown',loot:{zweihander:1,plate:1},intro:'The warlord has united the tribes and leads a war band against your walls.'},
  behemoth:{n:'The Behemoth',t:'Ancient behemoth',fac:'insect',esc:4,hp:26,sz:2.6,armor:.3,kind:'melee',relic:'horn',loot:{leather:80,meat:120},intro:'The behemoth your expedition woke has reached the colony.'},
};
function startBoss(k){const B=BOSSES[k];if(!B||S.raid)return false;const sd=pick(['W','N','E','S'].filter(x=>sideCells(x).length));startRaid(B.esc+1,[sd||'W'],90,false,B.fac);const R0=S.raid;R0.boss={k,n:B.t};R0.f=B.n;R0.comp[R0.comp.length-1]={v:'heavy',kind:B.kind,mech:B.fac==='mech'?'centipede':undefined};
  letter('info',B.n,B.intro+' Its leader is far tougher than any raider. Kill it to claim a unique relic.');chron('boss',B.intro);return true}
function makeBoss(r,R0){const B=BOSSES[R0.boss.k];r.boss=true;r.v='heavy';if(B.fac==='mech'){r.mech='centipede';r.range=11;r.burst=true;r.shot='bullet'}r.hp=r.max=r.max*B.hp;r.sz=B.sz;r.armor=B.armor;r.kind=B.kind;if(B.fac==='insect'){r.bug='megaspider';r.behemoth=true}r.spd*=.7;bossBanner(B.t,B.n)}
function bossDead(R0){const b=R0.raiders.find(r=>r.boss);return b?b.dead:false}
function bossReward(R0){const B=BOSSES[R0.boss.k];S.bossesBeat=S.bossesBeat||[];if(!S.bossesBeat.includes(R0.boss.k))S.bossesBeat.push(R0.boss.k);stat('bosses');const got=[];for(const i in B.loot){add(i,B.loot[i]);got.push(`${B.loot[i]} ${ITEMS[i].n.toLowerCase()}`)}
  chron('boss',`${B.t} fell at the walls of ${S.site.name}.`);letter('info',`${B.t} defeated`,`${B.t} is dead. Your colonists stripped it: ${got.join(', ')}.`);gainRelic(B.relic,`taken from ${B.t.toLowerCase()}`)}
function bossFallen(R0){if(!opt('hardcore'))return;for(const c of S.cols.slice()){if((c.downed||(c.hp??100)<12)&&Math.random()<.35){releaseJob(c);unequip(c);S.cols=S.cols.filter(o=>o!==c);if(sel&&sel.k==='col'&&sel.id===c.id)sel=null;chron('people',`${colName(c)} died fighting ${BOSSES[R0.boss.k].t.toLowerCase()}.`);letter('info',`${c.nick} is dead`,`${colName(c)} fell in the fight against ${BOSSES[R0.boss.k].t.toLowerCase()} and did not get up again.`);stat('deaths')}}}
function tickBoss(dt){if(S.raid)return;if(S.bossQ&&S.t>=S.bossQ.at){const k=S.bossQ.k;S.bossQ=null;startBoss(k);return}
  const d=S.t/DAY;if(d<60)return;if(!S.bossNext){S.bossNext=S.t+DAY*R(3,7);return}
  if(S.t>=S.bossNext){const beat=S.bossesBeat||[],pool=['mech','warlord'].filter(k=>!beat.includes(k));startBoss(pool.length?evRand(pool):evRand(['mech','warlord']));S.bossNext=S.t+DAY*R(18,28)}}
function bossBanner(t,n){if(offlineSim)return;const el=$('bossintro');if(!el)return;el.innerHTML=`<small>${esc(n)}</small><b>${esc(t)}</b>`;el.hidden=false;el.classList.remove('go');void el.offsetWidth;el.classList.add('go');sfx('drums');clearTimeout(el._t);el._t=setTimeout(()=>{el.hidden=true},4200)}
function legacyEarn(){const L=S.legacy,sn=L.snap||{},st=S.stats||{},d=(S.t-(S.siteT||0))/DAY;return Math.max(1,Math.floor(d/8)+((st.raidsWon||0)-(sn.raidsWon||0))+((st.exps||0)-(sn.exps||0))+4*((st.bosses||0)-(sn.bosses||0))+Math.min(12,Math.floor(raidWealth()/6000)))}
function legacyHTML(){const L=S.legacy;let h=`<div class="dim" style="font-size:12px">Every time the colony moves on, its story becomes legacy. You earn legacy points for days survived, raids won, expeditions, bosses and wealth at this site, and spend them on perks that last for the rest of the game.</div>`;
  h+=`<div class="row" style="gap:14px"><div><b style="font-size:20px">${L.pts}</b> <span class="dim">legacy points</span></div><div class="dim">Moving now earns <b class="good">+${legacyEarn()}</b></div><div class="dim">${L.runs} move${L.runs===1?'':'s'} so far</div></div>`;
  h+=`<h4>Perks</h4><div class="perks">`;for(const r of[0,1,2]){h+=`<div class="prow">`;for(const k in PERKS){const P=PERKS[k];if(P.row!==r)continue;const l=L.perks[k]||0,op=perkOpen(k),c=perkCost(k),mx=l>=P.max;
    h+=`<button class="perk ${l?'has':''}" data-act="perk" data-v="${k}" ${!op||mx||L.pts<c?'disabled':''}><b>${P.n}</b><small>${P.d}</small><span class="pips">${'●'.repeat(l)}${'○'.repeat(P.max-l)}</span><small class="dim">${!op?'Needs 3 levels in the row above':mx?'Maxed':`${c} points`}</small></button>`}h+='</div>'}h+='</div>';
  h+=`<h4>Relic monument</h4>`;const R0=S.relics||[];h+=R0.length?`<div class="relics">${R0.map(k=>`<div class="relic"><span class="rgem">◆</span><b>${RELICS[k].n}</b><small>${RELICS[k].d}</small></div>`).join('')}</div>`:'<div class="dim" style="font-size:12px">No relics yet. Bosses drop them, and expeditions to the starship and the vault can find them.</div>';
  const left=Object.keys(RELICS).filter(k=>!R0.includes(k)).length;if(R0.length&&left)h+=`<div class="dim" style="font-size:12px">${left} more relic${left>1?'s':''} out there.</div>`;return h}

