/* ================= UI ================= */
function msg(text,kind_){if(kind_==='bad')sfx('error');if(S&&kind_!=='bad'&&!opt('t_'+msgCat(text)))return;msgs.push({text,kind:kind_||'',t:performance.now()});if(msgs.length>6)msgs.shift()}
function letter(k,title,text,data){S.letters.push({id:nid(),k,title,text,data:data||{},t:S.t});if(k!=='raid')sfx('letter')}
const LCOL={event:'#d89a52',raid:'#d86a52',raidend:'#c9a640',info:'#9aa6b0',trade:'#8fc46a',orbital:'#b48ad8',join:'#6aa0d8',contract:'#d8b14a',chunk:'#7fc8d8'};
function letterSvg(c){return`<svg viewBox="0 0 38 28" aria-hidden="true"><rect x="1" y="1" width="36" height="26" rx="4" fill="${c}" stroke="#15120e" stroke-width="2"/><path d="M3 4 L19 16 L35 4" fill="none" stroke="#15120e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
const FLAME=c=>`<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M6 1 C8 4 11 6 10 10 C9 13 3 13 2 10 C1 7 4 6 4 3 C5 5 6 5 6 1Z" fill="${c}" stroke="#15120e" stroke-width="1"/></svg>`;
function setHTML(el,html){if(el._h===html)return;const a=document.activeElement;if(a&&(a.tagName==='SELECT'||a.tagName==='INPUT')&&el.contains(a))return;el._h=html;el.innerHTML=html}
function bar(p,cls){return`<div class="bar ${cls||''}"><i style="width:${clamp(p,0,1)*100}%"></i></div>`}
const WXN={clear:'Clear',rain:'Rain',snow:'Snow',storm:'Thunderstorm'};
function wxName(){const w=S.wx||{k:'clear'};return w.k==='storm'&&w.cold?'Snowstorm':WXN[w.k]}
function tickWeather(dt){if(!S.wx)S.wx={k:'clear',until:S.t+DAY*.4};const se=seasonIdx();
  if(S.lastSe===undefined)S.lastSe=se;if(se!==S.lastSe){S.lastSe=se;chron('season',`${['Spring','Summer','Autumn','Winter'][se]} of year ${Math.floor(S.t/DAY/60)+1} began.`);if(!offlineSim){const t=['Spring has come','Summer','Autumn','Winter is here'][se],d=['Crops grow 10% faster in spring.','Long warm days.','Leaves turn and crops slow down a little (−10%).','Outdoor crops grow at about half speed until spring. Hydroponics are not affected. Stock up on food.'][se];letter('info',t,d)}}
  if(S.t<S.wx.until)return;const b=S.site.biome,cold=b==='tundra'||(se===3&&b!=='arid');
  const pool=b==='arid'?['clear','clear','clear','clear','storm']:cold?['clear','snow','snow','clear','storm']:se===2?['clear','rain','rain','storm','clear']:se===0?['clear','rain','clear','rain','storm']:['clear','clear','clear','rain','storm'];
  const k=pick(pool);S.wx={k,until:S.t+DAY*(k==='clear'?R(.5,1.3):R(.25,.7)),cold};if(!offlineSim&&k!=='clear')msg(k==='storm'?(cold?'A snowstorm rolls in.':'A thunderstorm is coming.'):k==='rain'?'It starts to rain. Crops like it.':'Snow begins to fall.','')}
function seasonGrow(p){if(!p||p.type==='hydro')return 1;const gb=1+bonus('grow');if(S.mods&&S.mods.length)return seasonGrow0(p)*modMul('grow')*gb;return seasonGrow0(p)*gb}
function seasonGrow0(p){const se=seasonIdx(),b=S.site.biome;let m=[1.1,1,.9,b==='tundra'?.35:b==='arid'?.9:.55][se];if(S.wx&&S.wx.k==='rain')m*=1.15;return m}
function dateStr(){const d=Math.floor(S.t/DAY),season=['Spring','Summer','Fall','Winter'][Math.floor(d/15)%4];return`Day ${d%15+1} of ${season}, year ${Math.floor(d/60)+1}`}
function rateStr(r){const net=r.p-r.c;if(Math.abs(r.p)<.05&&Math.abs(r.c)<.05)return'<span class="dim">—</span>';return`<span class="${net>=0?'good':'bad'}" title="+${fmt1(r.p)} made, −${fmt1(r.c)} used per minute">${net>=0?'+':'−'}${fmt1(Math.abs(net))}/min</span>`}

function billsHTML(p){const L=bills(p),avail=BILLS[p.type].filter(k=>{const r=RECIPES[k];return true});
  let h=`<div class="bills"><div class="between"><b>Bills</b><span class="dim" style="font-size:11.5px">top to bottom: workers take the first bill that can run</span></div>`;
  L.forEach((b,i)=>{const r=RECIPES[b.r],why=billWhy(p,b),prog=b.mode==='count'?`${b.done||0}/${b.n} made`:b.mode==='until'?`${fmt(cnt(r.out))}/${b.n} in stock`:`${b.done||0} made`;
    h+=`<div class="bill ${b.off?'off':''}"><img src="${icon(r.out)}" alt=""><div class="bmain"><div class="between"><b>${esc(r.n)}</b><span class="dim">${prog}</span></div>
      <div class="row" style="gap:5px"><select data-chg="billmode" data-id="${p.id}" data-v="${b.id}" aria-label="Bill mode"><option value="until" ${b.mode==='until'?'selected':''}>Until in stock</option><option value="count" ${b.mode==='count'?'selected':''}>Make</option><option value="forever" ${b.mode==='forever'?'selected':''}>Forever</option></select>${b.mode!=='forever'?`<input type="number" min="1" step="1" value="${b.n}" data-chg="billn" data-id="${p.id}" data-v="${b.id}" aria-label="Amount">`:''}
      <span class="bbtn"><button data-act="billmv" data-id="${p.id}" data-v="${b.id}:-1" ${i===0?'disabled':''} aria-label="Move up">▲</button><button data-act="billmv" data-id="${p.id}" data-v="${b.id}:1" ${i===L.length-1?'disabled':''} aria-label="Move down">▼</button><button data-act="billoff" data-id="${p.id}" data-v="${b.id}" aria-label="${b.off?'Resume':'Suspend'}">${b.off?'▶':'❚❚'}</button><button data-act="billdel" data-id="${p.id}" data-v="${b.id}" aria-label="Delete bill">✕</button></span></div>
      <div class="bwhy ${why&&!/Target|Done/.test(why)?'warn':'dim'}">${why?esc(why):'Running · '+esc(r.d)}</div></div></div>`});
  if(!L.length)h+='<div class="dim" style="font-size:12px">No bills yet.</div>';
  h+=`<label class="row"><span class="lbl">Add bill</span><select data-chg="billadd" data-id="${p.id}"><option value="">Choose a recipe…</option>${avail.map(k=>{const r=RECIPES[k],lock=r.req&&!done(r.req),tl=(r.tier||0)>p.tier;return`<option value="${k}" ${lock||tl?'disabled':''}>${r.n} (${r.d})${lock?' · research '+reqName(r.req):tl?' · tier '+(r.tier+1):''}</option>`}).join('')}</select></label>`;
  const cap=rackCap(p);if(cap){const st=p.stock||{},ks=Object.keys(st).filter(i=>st[i]>0);h+=`<div class="dim" style="font-size:12px">Input racks ${rackUsed(p)}/${cap}: ${ks.length?ks.map(i=>st[i]+' '+ITEMS[i].n.toLowerCase()).join(', '):'empty'}. Crafters stock them on each trip to storage.${ks.length?' <button data-act="rackempty" data-id="'+p.id+'" style="padding:1px 7px;font-size:11px">Empty</button>':''}</div>`}
  else if(CRAFT_TYPES.includes(p.type)&&!p.small)h+=`<div class="dim" style="font-size:11.5px">Tier 2 adds input racks: ingredients wait next to the benches.</div>`;
  return h+'</div>'}
function swatches(list,cur,act,field,id){return`<span class="sw">${list.map(c=>`<button class="swc ${c===cur?'on':''}" style="background:${c}" data-act="${act}" data-id="${id}" data-v="${field}:${c}" aria-label="${c}"></button>`).join('')}</span>`}
function custHTML(){const c=colById(modal.id);if(!c)return'<p>Colonist gone.</p>';const L=loadoutOf(c),uni=L&&L.uni;
  let h=`<div class="between"><h3>${esc(colName(c))}</h3><button data-act="close" aria-label="Close">✕</button></div><div class="cust"><div class="cprev"><img src="${portrait(c)}" alt=""><small class="dim">${uni?'Wearing the '+esc(L.n)+' uniform':'Own clothes'}</small></div><div class="cfields">`;
  h+=`<label class="row"><span class="lbl">Nickname</span><input type="text" maxlength="14" value="${esc(c.nick)}" data-chg="cname" data-id="${c.id}" data-v="nick"></label>
  <label class="row"><span class="lbl">First name</span><input type="text" maxlength="16" value="${esc(c.name)}" data-chg="cname" data-id="${c.id}" data-v="name"></label>
  <label class="row"><span class="lbl">Last name</span><input type="text" maxlength="18" value="${esc(c.last)}" data-chg="cname" data-id="${c.id}" data-v="last"></label>`;
  h+=`<div class="row"><span class="lbl">Skin</span>${swatches(SKIN,c.skin,'cset','skin',c.id)}</div><div class="row"><span class="lbl">Hair</span>${swatches(HAIRC,c.hair,'cset','hair',c.id)}</div>
  <div class="row"><span class="lbl">Hairstyle</span><span class="sw">${['Short','Long','Bun','Bald'].map((n,i)=>`<button class="chip ${c.hs===i?'on':''}" data-act="cset" data-id="${c.id}" data-v="hs:${i}">${n}</button>`).join('')}</span></div>
  <label class="row"><span class="lbl">Clothes</span><select data-chg="cout" data-id="${c.id}" data-v="outfit">${Object.keys(OUTFITS).map(k=>`<option value="${k}" ${(c.outfit||'plain')===k?'selected':''}>${OUTFITS[k]}</option>`).join('')}</select></label>
  <div class="row"><span class="lbl">Main colour</span>${swatches(PALETTE,c.shirt,'cset','shirt',c.id)}</div><div class="row"><span class="lbl">Trim</span>${swatches(PALETTE,c.trim||'#2e3424','cset','trim',c.id)}</div>
  <label class="row"><span class="lbl">Hat</span><select data-chg="cout" data-id="${c.id}" data-v="hat">${Object.keys(HATS).map(k=>`<option value="${k}" ${(c.hat||'none')===k?'selected':''}>${HATS[k]}</option>`).join('')}</select></label>
  <label class="row"><span class="lbl">Loadout</span><select data-chg="colo" data-id="${c.id}">${S.loadouts.map(l=>`<option value="${l.id}" ${L&&L.id===l.id?'selected':''}>${esc(l.n)}${l.uni?' (uniform)':''}</option>`).join('')}</select></label>
  ${uni?'<div class="dim" style="font-size:12px">The loadout puts this colonist in a uniform, which covers clothes and hat. Pick a loadout without uniform to show their own clothes.</div>':''}`;
  return h+`</div></div><div class="row"><button data-act="close">Done</button><button data-act="tab" data-v="gear">Edit loadouts</button></div>`}
function loadoutHTML(){let h=`<div class="between"><h3>Loadouts</h3><button data-act="lonew">+ New loadout</button></div><div class="dim" style="font-size:12px">A loadout decides what a colonist carries into a fight and wears every day, and can dress them in a uniform. Guards and militia follow it; “wear armor at work” makes everyone with that loadout keep armor on.</div>`;
  for(const L of S.loadouts){const who=S.cols.filter(c=>loadoutOf(c)===L);
    h+=`<div class="lo"><div class="lohead"><img src="${loPreview(L)}" alt=""><input type="text" maxlength="20" value="${esc(L.n)}" data-chg="loset" data-id="${L.id}" data-v="n" aria-label="Loadout name"><span class="bbtn"><button data-act="lodup" data-id="${L.id}" title="Duplicate">⧉</button>${S.loadouts.length>1?`<button data-act="lodel" data-id="${L.id}" title="Delete">✕</button>`:''}</span></div>
      <div class="logrid"><label><span>Weapons</span><select data-chg="loset" data-id="${L.id}" data-v="weapon">${Object.keys(LO_WEAPON).map(k=>`<option value="${k}" ${L.weapon===k?'selected':''}>${LO_WEAPON[k]}</option>`).join('')}</select></label>
      <label><span>Armor</span><select data-chg="loset" data-id="${L.id}" data-v="armor">${Object.keys(LO_ARMOR).map(k=>`<option value="${k}" ${L.armor===k?'selected':''}>${LO_ARMOR[k]}</option>`).join('')}</select></label>
      <label class="chk"><input type="checkbox" data-chg="loset" data-id="${L.id}" data-v="helmet" ${L.helmet?'checked':''}> Helmet</label><label class="chk"><input type="checkbox" data-chg="loset" data-id="${L.id}" data-v="always" ${L.always?'checked':''}> Wear armor at work</label>
      <label class="chk"><input type="checkbox" data-chg="loset" data-id="${L.id}" data-v="uni" ${L.uni?'checked':''}> Uniform</label></div>
      ${L.uni?`<div class="logrid"><label><span>Clothes</span><select data-chg="loset" data-id="${L.id}" data-v="outfit">${Object.keys(OUTFITS).map(k=>`<option value="${k}" ${L.outfit===k?'selected':''}>${OUTFITS[k]}</option>`).join('')}</select></label><label><span>Hat</span><select data-chg="loset" data-id="${L.id}" data-v="hat">${Object.keys(HATS).map(k=>`<option value="${k}" ${L.hat===k?'selected':''}>${HATS[k]}</option>`).join('')}</select></label></div>
      <div class="row"><span class="lbl">Main</span>${swatches(PALETTE,L.c1,'loclr',  'c1',L.id)}</div><div class="row"><span class="lbl">Trim</span>${swatches(PALETTE,L.c2,'loclr','c2',L.id)}</div>`:''}
      <div class="chips">${S.cols.map(c=>`<button class="chip ${loadoutOf(c)===L?'on':''}" data-act="loassign" data-id="${c.id}" data-v="${L.id}"><img src="${portrait(c)}" alt="" style="width:18px;height:18px;vertical-align:middle"> ${esc(c.nick)}</button>`).join('')}</div>
      <div class="dim" style="font-size:11.5px">${who.length?who.length+' colonist'+(who.length>1?'s':''):'Nobody'} · tap a name to give them this loadout</div></div>`}
  return h}
const loPrevCache={};
function loPreview(L){const k=JSON.stringify([L.uni,L.outfit,L.c1,L.c2,L.hat,L.armor,L.helmet]);if(loPrevCache[L.id]&&loPrevCache[L.id].k===k)return loPrevCache[L.id].u;const cv=document.createElement('canvas');cv.width=cv.height=72;const g=cv.getContext('2d'),m={id:-1,skin:'#e3b98f',hair:'#4a2f1a',hs:0,shirt:'#8a7458',trim:'#5a3e2a',outfit:'plain',hat:'none'};const look=L.uni?{...m,shirt:L.c1,trim:L.c2,outfit:L.outfit,hat:L.helmet?'none':L.hat}:m;drawPawn(g,look,36,40,56,'d',0);if(L.helmet){g.beginPath();g.ellipse(36+0,40+56*.04-56*.22-56*.04,56*.22,56*.17,0,Math.PI,0);g.closePath();fs(g,'#9aa0a6',1.4)}const u=cv.toDataURL();loPrevCache[L.id]={k,u};return u}
function uiSide(){
  const b=biome(),hr=Math.floor((S.t%DAY)/DAY*24);
  const ic=['<svg viewBox="0 0 12 12"><rect x="2" y="1" width="3" height="10" rx="1"/><rect x="7" y="1" width="3" height="10" rx="1"/></svg>','<svg viewBox="0 0 12 12"><path d="M2 1 L11 6 L2 11Z"/></svg>','<svg viewBox="0 0 20 12"><path d="M1 1 L9 6 L1 11Z M10 1 L18 6 L10 11Z"/></svg>','<svg viewBox="0 0 28 12"><path d="M1 1 L9 6 L1 11Z M10 1 L18 6 L10 11Z M19 1 L27 6 L19 11Z"/></svg>'];
  const names=['Pause','Normal speed','Fast','Superfast'];
  const nextCar=S.trader?`Caravan at the gate (${fmtTime(S.trader.until-S.t)})`:done('traderoutes')?`Next caravan in ${fmtTime(S.nextCaravan-S.t)}`:'Next caravan: unknown';
  const req=S.requests.filter(r=>!r.arrived).sort((a,b)=>a.at-b.at)[0];
  let h=`<div class="sect site"><div class="between"><b>${esc(S.site.name)}</b><button data-act="side" style="padding:2px 8px" aria-label="Hide overview">✕</button></div><div class="dim">${b.n} · ${COLS}×${ROWS} plots${S.renown?` · renown ${S.renown}`:''}</div><div class="dim" style="font-size:12px">Era ${era()+1}: <b>${ERAS[era()]}</b></div>
  <div class="num">${dateStr()} · ${String(hr).padStart(2,'0')}h · <span class="dim">${wxName()}</span></div>
  <div class="spd">${ic.map((s,i)=>`<button data-act="speed" data-v="${i}" class="${S.speed===i?'on':''}" title="${names[i]} (${i===0?'Space':'key '+i})" aria-label="${names[i]}">${s}</button>`).join('')}</div>
  ${S.raid?`<div class="bad" style="font-size:12px">${S.raid.phase==='warn'?`${RFAC[S.raid.fac||'tribal'].n} (${S.raid.total}) from the ${S.raid.sides.map(x=>SIDEN[x]).join(' + ')} in ${fmtTime(S.raid.at-S.t)}`:`Raid: ${aliveRaiders().length} ${S.raid.fac==='insect'?'insectoids':'raiders'} left`}</div>${S.raid.phase==='warn'&&S.raid.demand?`<button data-act="payraid" ${S.silver<S.raid.demand&&!S.test?'disabled':''}>Pay ${fmt(S.raid.demand)} silver tribute</button>`:''}`:''}<div class="dim" style="font-size:12px">${nextCar}${req?`<br>${esc(req.f)} wants ${req.n} ${ITEMS[req.i].n.toLowerCase()} in ${fmtDays(req.at-S.t)}`:''}</div></div>`;
  h+=`<div class="scroll"><div class="sect"><h4>Economy</h4><div class="eco">`;
  const sr=rates('silver');
  h+=`<img src="${icon('silver')}" alt=""><span>Silver</span><span class="n">${fmt(S.silver)}</span><span class="rate">${sr.p>.05?`<span class="good">+${fmt1(sr.p)}/min</span>`:'<span class="dim">—</span>'}</span>`;
  for(const i in ITEMS){const n=Math.floor(cnt(i)),r=rates(i);if(n<=0&&r.p<.05&&r.c<.05)continue;h+=`<img src="${icon(i)}" alt=""><span>${ITEMS[i].n}</span><span class="n">${fmt(n)}</span><span class="rate">${rateStr(r)}</span>`}
  h+=`</div>`;
  const used=stockUsed(),cap=stockCap(),beds=bedCount(),pile=S.ground.reduce((a,g)=>a+g.n,0);
  let nut=0;for(const i in ITEMS)if(ITEMS[i].food)nut+=cnt(i)*ITEMS[i].food;
  const days=S.cols.length?nut/S.cols.length:0;
  h+=`<div class="row" style="gap:6px 12px;font-size:12px"><span class="${used>=cap?'bad':''}">Storage <b class="num">${fmt(used)}/${fmt(cap)}</b></span><span class="${S.cols.length>beds?'bad':''}">Beds <b class="num">${S.cols.length}/${beds}</b></span><span class="${days<1?'bad':days<3?'warn':''}">Food <b class="num">${days.toFixed(1)}</b> days</span>${pile?`<span class="${haulers().length?'':'warn'}">At pickup piles <b class="num">${fmt(pile)}</b></span>`:''}</div>`;
  if(S.pw&&(S.pw.prod||S.pw.use)){const pw=S.pw,net=pw.prod-pw.use;h+=`<div class="row" style="font-size:12px;gap:6px 12px"><span class="${S.pwrOK===false?'bad':net<0?'warn':''}">Power <b class="num">${fmt(pw.prod)} W</b> made · <b class="num">${fmt(pw.use)} W</b> used</span>${pw.store?`<span>Battery <b class="num">${Math.round((S.batt||0)/pw.store*100)}%</b></span>`:''}${S.pwrOK===false?'<span class="bad">Power out</span>':''}</div>`}
  h+=`<div class="dim" style="font-size:12px">Seeds owned: ${Object.keys(CROPS).filter(owns).map(k=>CROPS[k].n).join(', ')}</div>`;
  h+=`</div><div class="sect"><h4>Base</h4>`;
  const wn=WALLS[S.wall+1];
  h+=`<div class="grp"><div class="gh" data-act="selwall"><span class="chev">▸</span><span>${wallName()}<small>${S.wallCon?`Building ${WALLS[S.wallCon.tier].n.toLowerCase()} · ${etaStr(S.wallCon)}`:S.wall<0?'<span class="warn">Dig a trench before the first raid</span>':`Wall · tier ${S.wall+1} of ${WALLS.length}`}</small></span>${S.wallCon?'<span class="dim" style="font-size:11px">…</span>':wn?`<button data-act="wallup" ${(wn.req&&!done(wn.req))||!costOk(wn)?'disabled':''} title="${esc(costStr(wn))}">${S.wall<0?'Dig':'▲'} ${wn.cost}</button>`:'<span class="dim" style="font-size:11px">Max</span>'}</div></div>`;
  {const cs=conSites().filter(x=>x.id[0]!=='t');if(cs.length)h+=`<div class="${hasConstructors()||S.cols.some(c=>c.assign===null)?'dim':'warn'}" style="font-size:12px">Construction: ${cs.map(x=>`${esc(x.name)} ${Math.round(x.con.prog*100)}% (${etaStr(x.con)})`).join(' · ')}${hasConstructors()?'':S.cols.some(c=>c.assign===null)?' · idle colonists are building':' · nobody is free to build. Unassign someone or build a builder’s yard.'}</div>`}
  {const pend=roadPending().length,rt=S.roadTarget||0,names=['dirt paths','wood plank paths','stone tile paths'];h+=`<div class="row" style="justify-content:space-between"><span class="dim" style="font-size:12px">Paths: ${names[rt]}${pend?` · ${pend} tile${pend>1?'s':''} still to pave${cnt(roadMat(Math.min(2,rt)))<1&&!S.test?' <span class="bad">(no '+roadMat(Math.min(2,rt))+')</span>':''}`:''}</span>${rt<2?`<button data-act="roadup" style="padding:2px 8px;font-size:12px" title="Builders pave every path in the base, tile by tile">Pave with ${rt===0?'planks':'stone'}</button>`:''}</div>`}
  h+=`<div class="row" style="justify-content:space-between"><span class="dim" style="font-size:12px">Clear more land</span><button data-act="landmode" style="padding:2px 8px;font-size:12px" ${S.proj?'disabled':''}>${landMode?'Cancel':'Pick land · '+expandCost().cost}</button></div>`;
  h+=`<div class="dim" style="font-size:12px">Land: ${openCount()} of ${COLS*ROWS} plots inside the wall${S.proj?` · clearing ${Math.round(S.proj.prog*100)}% (${S.cols.filter(c=>c.assign==='build').length} builders)`:''}</div>`;
  const bl=built();
  if(!bl.length)h+=`<div class="dim">Nothing built yet. Click an empty plot on the map.</div>`;
  for(const type of Object.keys(PLOTS)){
    const list=bl.filter(p=>p.type===type);if(!list.length)continue;
    const open=openGroups.has(type),ws=list.reduce((a,p)=>a+slots(p),0),wn2=list.reduce((a,p)=>a+workersOf(p.id).length,0);
    const sub=[`${list.length} plot${list.length>1?'s':''}`];if(ws)sub.push(`${wn2}/${ws} workers`);
    if(type==='housing')sub.push(`${list.reduce((a,p)=>a+layouts[p.id].beds.length,0)} beds`);
    if(type==='pen')sub.push(`${list.reduce((a,p)=>a+penUsed(p),0)}/${list.reduce((a,p)=>a+penCap(p),0)} space`);
    h+=`<div class="grp ${open?'open':''}"><div class="gh" data-act="grp" data-v="${type}"><span class="chev">▸</span><span>${PLOTS[type].n}<small>${sub.join(' · ')}</small></span><span></span></div>`;
    if(open){
      h+=`<div class="gb">`;
      const roots=[...new Set(list.map(p=>clusterRoot[p.id]))];
      for(const r of roots){
        const grp=list.filter(p=>clusterRoot[p.id]===r),p=grp[0],n=upgradeCost(p),lock=n&&n.req&&!done(n.req);
        for(const q of grp){
          const n1=upgradeCost(q),s2=[];if(paused(q))s2.push('<span class="warn">paused</span>');if(slots(q))s2.push(`${workersOf(q.id).length}/${slots(q)} workers`);if(q.type==='farm'||q.type==='hydro')s2.push(CROPS[q.crop].n);
          if(grp.length>1&&q===grp[0])s2.push(`joined ×${grp.length} (+${Math.round((clusterBonus(q)-1)*100)}%)`);
          if(q.con)s2.unshift(`<span class="warn">upgrading ${Math.round(q.con.prog*100)}%</span>`);
          h+=`<div class="plotrow"><span class="nm" data-act="selplot" data-id="${q.id}">${plotName(q)}<small>${s2.join(' · ')}</small></span>${q.con?'<span class="dim" style="font-size:11px">…</span>':n1?`<button data-act="upgrade" data-id="${q.id}" ${lock||!costOk(n1)?'disabled':''} title="${esc(lock?'Needs research: '+reqName(n1.req):costStr(n1))}">▲ ${n1.cost}</button>`:'<span class="dim" style="font-size:11px">Max</span>'}</div>`;
        }
        if(grp.length>1&&n&&!grp.some(q=>q.con)){const tot={cost:n.cost*grp.length,mat:{}};for(const k in n.mat||{})tot.mat[k]=n.mat[k]*grp.length;h+=`<div class="plotrow"><span class="dim" style="font-size:12px">All ${grp.length} joined plots</span><button data-act="upgradeall" data-id="${p.id}" ${lock||!costOk(tot)?'disabled':''} title="${esc(costStr(n,grp.length))}">▲ all ${fmt(n.cost*grp.length)}</button></div>`}
      }
      h+=`</div>`;
    }
    h+=`</div>`;
  }
  h+=`</div></div>`;
  setHTML($('side'),h);
}
let pbMin=false;try{pbMin=localStorage.getItem('dw-pbmin')==='1'}catch(e){}
function pwState(c){return c.downed?'down':c.sleeping?'sleep':(c.militia||(S.raid&&fighter(c)))?'fight':(c.assign===null||/^(Idle|Wander|Relax)/.test(c.status||''))?'idle':'work'}
function uiPawnbar(){
  let h='';const dense=MOB||S.cols.length>10;
  if(MOB){const idle=S.cols.filter(c=>pwState(c)==='idle').length,down=S.cols.filter(c=>c.downed).length;h+=`<button class="pwt" data-act="pbmin" aria-label="${pbMin?'Show':'Hide'} colonists">${pbMin?'▸':'▾'} ${S.cols.length}${pbMin&&down?` <b class="bad">${down} down</b>`:pbMin&&idle?` <span class="warn">${idle} idle</span>`:''}</button>`}
  document.getElementById('pawnbar').classList.toggle('min',MOB&&pbMin);
  if(!(MOB&&pbMin))for(const c of S.cols)h+=`<div class="pw${dense?' dense st-'+pwState(c):''}${sel&&sel.k==='col'&&sel.id===c.id?' sel':''}" data-pid="${c.id}" title="${esc(colName(c))} · ${esc(shortJob(c))}: drag onto a plot or outside"><img src="${portrait(c)}" alt=""><span>${esc(c.nick)}</span><i>${esc(shortJob(c))}</i></div>`;
  const free=bedCount()-S.cols.length;
  if(MOB&&pbMin){}else if(MOB&&free<0)h+=`<div class="pw empty dense" style="color:var(--bad)">${-free}<br>no bed</div>`;else if(MOB){}else if(free>0)h+=`<div class="pw empty">${free} free bed${free>1?'s':''}</div>`;
  else if(free<0)h+=`<div class="pw empty" style="color:var(--bad)">${-free} without bed</div>`;
  setHTML($('pawnbar'),h);
}
function shortJob(c){if(c.downed)return'Down';if(c.sleeping)return'Sleeping';if(c.militia)return'Militia';if(c.assign===null)return'Idle';if(c.assign==='out')return'Gatherer';if(c.assign==='build')return'Land clearer';if(c.job&&c.job.t==='con'&&!isConstructor(c))return'Building';if(isGuard(c))return'Guard';const p=plotById(c.assign);return p&&p.type?plotName(p):'Idle'}
function uiMsgs(){const now=performance.now();msgs=msgs.filter(m=>now-m.t<9000);{const me=$('msgs');me.style.top=MOB&&!tutEl.hidden&&innerHeight>=520?(tutEl.offsetTop+tutEl.offsetHeight+8)+'px':''}const shown=MOB?msgs.slice(-3):msgs;setHTML($('msgs'),shown.map(m=>{const a=now-m.t;return`<div class="${m.kind}${a<420?' new':''}" style="opacity:${a>7000?.25:1}${a<420?`;animation-delay:-${Math.round(a)}ms`:''}">${esc(m.text)}</div>`}).join(''))}
const lSeen={};
function letterClearable(l){return !(l.k==='join'||(l.k==='raid'&&S.raid&&S.raid.phase==='warn'&&l.data&&l.data.pirate))}
function uiLetters(){const now=performance.now(),nc=S.letters.filter(letterClearable).length;setHTML($('letters'),(nc>=2?`<button class="lclear" data-act="lclear">Clear all (${nc}) ✕</button>`:'')+S.letters.slice(-8).map(l=>{if(!lSeen[l.id])lSeen[l.id]=now;const a=now-lSeen[l.id];return`<button class="letter${a<600?' new':''}" style="${a<600?`animation-delay:-${Math.round(a)}ms`:''}" data-act="letter" data-id="${l.id}"><span>${esc(l.title)}</span>${letterSvg(LCOL[l.k])}</button>`}).join(''))}

let lastSelKey='',lastTab=null;
let shDrag=null;
for(const id of['inspect','panel']){const e0=document.getElementById(id);if(!e0)continue;
  e0.addEventListener('pointerdown',e=>{if(!MOB)return;const r=e0.getBoundingClientRect();if(e.clientY-r.top<24&&!e.target.closest('button,select,input')){shDrag={y:e.clientY};e.preventDefault()}});}
document.addEventListener('pointerup',e=>{if(!shDrag)return;const dy=e.clientY-shDrag.y;shDrag=null;const b=document.body;if(dy>25)b.classList.add('sheet-min');else if(dy<-25)b.classList.remove('sheet-min');else b.classList.toggle('sheet-min')});
function popEl(el){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}
function uiInspect(){
  const el=$('inspect');document.body.classList.toggle('sheet-open',!!sel||!!tab);
  if(!sel){el.hidden=true;el._h='';lastSelKey='';return}
  {const k=sel.k+':'+(sel.id??sel.key??sel.cell??'');if(k!==lastSelKey){lastSelKey=k;if(MOB&&tab){tab=null;uiPanel()}popEl(el);document.body.classList.remove('sheet-min')}}
  let h='';
  const close=`<button data-act="desel" aria-label="Close">✕</button>`;
  if(sel.k==='col'){
    const c=colById(sel.id);if(!c){sel=null;return}
    h+=`<div class="row" style="flex-wrap:nowrap"><img class="portrait" src="${portrait(c)}" alt=""><div style="min-width:0;flex:1"><h3>${esc(colName(c))} <button class="ibtn" data-act="ccust" data-id="${c.id}" title="Rename and customize" aria-label="Rename and customize">✎</button></h3><div class="dim">Age ${c.age} · ${esc((loadoutOf(c)||{n:'—'}).n)} loadout</div><div class="chips" style="margin-top:4px">${c.traits.map(t=>`<span class="chip" data-tip="${esc('<b>'+TRAITS[t].n+'</b><br>'+TRAITS[t].d+(TRAITS[t].x&&TRAITS[TRAITS[t].x]?'<br><span class="dim">Never together with '+TRAITS[TRAITS[t].x].n+'</span>':''))}">${TRAITS[t].n}</span>`).join('')}</div></div><span class="row colnav" style="gap:4px;flex:none;align-self:flex-start">${S.cols.length>1?`<button data-act="colstep" data-v="-1" aria-label="Previous colonist" title="Previous colonist">‹</button><button data-act="colstep" data-v="1" aria-label="Next colonist" title="Next colonist">›</button>`:''}${close}</span></div>`;
    h+=`<div>${esc(c.status)}${c.carry?` · carrying ${c.carry.n} ${ITEMS[c.carry.i].n.toLowerCase()}`:''}</div>`;
    h+=`<div class="row" style="font-size:12px"><span class="${c.food<=0?'bad':''}">Food ${Math.round(c.food*100)}%</span><span class="${c.rested<1?'warn':''}">${c.rested<1?'Slept rough (−15%)':'Well rested'}</span>${(c.buff||1)>1?`<span class="good">Ate at a table (+${Math.round((c.buff-1)*100)}%)</span>`:''}<span>${bedOf(c)?'Has a bed':'<span class="bad">No bed</span>'}</span>${c.weapon||c.melee?`<span>Armed: ${[c.weapon,c.melee].filter(Boolean).map(w=>ITEMS[w].n.toLowerCase()).join(' + ')}</span>`:''}</div>`;
    h+=`<label class="row"><span class="lbl">Works at</span><select id="assign-${c.id}" data-chg="assign" data-id="${c.id}">${assignOptions(c)}</select></label>`;
    h+=`<div style="display:flex;flex-direction:column;gap:3px">`;
    for(const s of SKILLS){const p=c.pa[s];h+=`<div class="skill"><span>${SKN[s]}</span><span>${p?FLAME(p===2?'#e8902a':'#d8b14a'):''}</span><span class="lv">${c.sk[s]}</span>${bar(c.sk[s]/20)}</div>`}
    h+=`</div>`;
  }else if(sel.k==='ani'){
    const a=aniById(sel.id);if(!a){sel=null;return}const d=ANIMALS[a.type],adult=a.age>=d.adult;
    h+=`<div class="between"><h3>${d.n}${adult?'':' (young)'}</h3>${close}</div>`;
    if(adult)h+=`<div class="row"><span style="min-width:110px">${ITEMS[d.prod].n}</span>${bar(a.p,'green')}</div>`;else h+=`<div class="row"><span style="min-width:110px">Growing up</span>${bar(a.age/d.adult,'blue')}</div>`;
    h+=`<div>${a.hun<2?'Fed with hay':'<span class="bad">Hungry, grazing. Production slowed.</span>'}</div><div class="dim">Eats ${d.eat} hay/min. Yields ${d.pcount} ${ITEMS[d.prod].n.toLowerCase()} every ${fmtTime(d.ptime)}.</div>`;
  }else if(sel.k==='vis'){
    const v=S.vis.find(v=>v.id===sel.id);if(!v){sel=null;return}
    if(v.k==='pack')h+=`<div class="between"><h3>Pack shaggox</h3>${close}</div><div>Carries the caravan's goods. Seems to like you.</div>${S.trader?'<div class="row"><button data-act="trade" data-v="caravan">Trade</button></div>':''}`;
    else{h+=`<div class="between"><h3>${esc(colName(v.look))}</h3>${close}</div>`;
      if(v.k==='caravan')h+=`<div>Trader with the ${esc(S.trader?S.trader.name:'')} caravan.</div>${S.trader?'<div class="row"><button data-act="trade" data-v="caravan">Trade</button></div>':''}`;
      else h+=`<div>Wants to join your colony.</div><div class="row"><button data-act="accept">Accept</button><button data-act="reject">Turn away</button></div>`}
  }else if(sel.k==='out'){
    const o=S.outside.find(o=>o.id===sel.id);if(!o){sel=null;return}
    const gs=workersOf('out').length;
    if(o.k==='rock')h+=`<div class="between"><h3>Rock</h3>${close}</div><div class="dim">A gatherer can break it into 6 to 10 stone blocks. Rocks do not come back.</div>`;
    else if(o.k==='tree')h+=`<div class="between"><h3>Tree</h3>${close}</div><div class="row"><span style="min-width:90px">${o.g>=1?'Fully grown':'Regrowing'}</span>${bar(o.g,'green')}</div><div class="dim">Yields about 18 wood. Grows back in ${fmtDays(2*DAY)}. A marked tree is chopped again every time it regrows.</div>`;
    else h+=`<div class="between"><h3>Ship chunk</h3>${close}</div><div class="dim">Twisted hull plating. Salvaging yields 2 to 4 components.</div>`;
    if(o.k==='tree')h+=`<label class="row"><span class="lbl">Chop until</span><input type="number" min="0" step="10" id="woodlimit" data-chg="woodlimit" value="${S.woodLimit??''}" placeholder="no limit" aria-label="Wood limit"><span>wood in storage</span></label>`;
    h+=`<div class="row"><button data-act="mark" data-id="${o.id}">${o.mark?'Unmark':o.k==='tree'?'Mark for chopping':o.k==='rock'?'Mark for breaking':'Mark for salvage'}</button>${o.k==='tree'?`<button data-act="markall">Mark all trees</button>${S.outside.some(t=>t.k==='tree'&&t.mark)?`<button data-act="unmarkall">Unmark all</button>`:''}`:o.k==='rock'?`<button data-act="markrocks">Mark all rocks</button>`:''}</div>`;
    h+=`<div class="${gs?'dim':'warn'}" style="font-size:12px">${gs?`${gs} gatherer${gs>1?'s':''} working outside.`:'No gatherers. Drag a colonist onto the land outside the wall.'}</div>`;
  }else if(sel.k==='wild'){
    const a=S.wild.find(a=>a.id===sel.id);if(!a){sel=null;return}const w=WILD[a.type],hs=workersOf(null).length;
    h+=`<div class="between"><h3>${w.n}${a.dead?' (dead)':''}</h3>${close}</div><div class="dim">Wild. A hunter yields about ${w.meat} meat and ${w.leather} leather from it.</div><div class="dim" style="font-size:12px">${built('hunting').length?'Hunters pick their own targets.':'Build a hunter\u2019s camp and give the hunter a bow or spear.'}</div>`;
  }else if(sel.k==='slot'){
    const sl=slotById(sel.id);if(!sl){sel=null;return}const d=S.def[sl.id];
    {const hp=cellHP(sl.cell),mx=cellMax(sl.cell);h+=`<div class="between"><h3>${d?DEF[d.type].n:'Wall section'}</h3>${close}</div><div class="dim" style="font-size:12px">${S.wall<0?'No wall yet: dig a trench first.':`${WALLS[S.wall].n}, ${SIDEN[sl.side]} side · ${S.breach[sl.cell]?'<span class="bad">breached</span>':Math.round(hp/mx*100)+'% health'}`}</div><div class="row" style="gap:6px">${S.wall>=0?`<button data-act="slotgate" data-s="${sl.id}">Place a gate here</button>`:''}<button data-act="selwall">Wall, gates and land</button></div>`}
    if(!d){h+=`<h4 class="bcat">Build a defense here</h4><div class="build">`;
      for(const type of['post','tower','turret']){const D=DEF[type],lock=D.req&&!done(D.req);h+=`<button data-act="buildslot" data-v="${type}" data-s="${sl.id}" ${lock||!costOk(D)?'disabled':''}><b>${D.n}</b><small>${lock?'Needs research: '+reqName(D.req):esc(costStr(D))+' \u00b7 '+D.d}</small></button>`}
      h+=`</div>`}
    else{const D=DEF[d.type];h+=`<div class="dim">${D.d} ${D.cap?`Holds ${D.cap} guard${D.cap>1?'s':''} \u00b7 +${D.range} range \u00b7 ${Math.round(D.cover*100)}% cover`:`Range ${D.range} \u00b7 ${D.dmg} damage per shot`}.</div>`;
      h+=`<div class="row">${d.type==='tower'?`<button data-act="upslot" data-s="${sl.id}" ${(DEF.stonetower.req&&!done(DEF.stonetower.req))||!costOk(DEF.stonetower)?'disabled':''}>Upgrade to stone tower \u00b7 ${esc(costStr(DEF.stonetower))}</button>`:''}<button data-act="demoslot" data-s="${sl.id}">Tear down</button></div>`}
    h+=wupHTML(sl.side);
  }else if(sel.k==='lane'){
    const sl=laneCache.find(s=>s.key===sel.key);if(!sl){sel=null;return}const l=S.lanes[sl.key];
    if(!l){h+=`<div class="between"><h3>Lane between plots</h3>${close}</div><div class="dim">The gap between two plots. Raiders who break in run through these lanes to reach your storage and buildings, so you can block, spike or guard them. A building next to it can also grow a wing into it.</div>`;
      {const wo=wingOptions(sl);if(wo.length){h+=`<h4 class="bcat">Wings</h4><div class="build">`;for(const[w,par]of wo){const c=wingCost(w);h+=`<button data-act="buildwing" data-v="${w}" data-s="${sl.key}" data-id="${par.id}" ${!costOk(c)?'disabled':''}><b>${WINGS[w].n} <span style="font-weight:400;opacity:.75">→ ${esc(plotName(par))}</span></b><small>${esc(costStr(c))} · ${esc(WINGS[w].d)}</small></button>`}h+=`</div><h4 class="bcat">Defenses</h4>`}}
      h+=`<div class="build">`;
      for(const type in LANES){const D=LANES[type],lock=D.req&&!done(D.req);h+=`<button data-act="buildlane" data-v="${type}" data-s="${sl.key}" ${lock||!costOk(D)?'disabled':''}><b>${D.n}</b><small>${lock?'Needs research: '+reqName(D.req):esc(costStr(D))+' \u00b7 '+D.d}</small></button>`}h+=`</div>`}
    else if(l.con){const D={n:laneName(l)};h+=`<div class="between"><h3>${D.n}</h3>${close}</div><div class="dim">Under construction · ${etaStr(l.con)}</div><div class="row">${bar(l.con.prog,'green')}<span class="num dim">${Math.round(l.con.prog*100)}%</span></div><div class="row"><button data-act="demolane" data-s="${sl.key}">Cancel (full refund)</button></div>`}
    else if(l.type==='wing'){const W0=WINGS[l.w],par=S.plots[l.par];h+=`<div class="between"><h3>${W0.n}</h3>${close}</div><div class="dim">${esc(W0.d)}</div><div>Wing of the ${esc(par?plotName(par).toLowerCase():'building')}.</div>${l.w==='maproom'&&!l.con?`<div class="row"><button class="primary" data-act="xplan">Plan an expedition</button></div>`:''}${l.w==='bunk'?`<div>Sleeping here: ${esc(allBeds().map((b,i)=>b.pid===l.par&&laneAt(b.x,b.y)===sl?S.cols[i]:null).filter(Boolean).map(c=>c.nick).join(', ')||'nobody yet')}</div>`:''}<div class="row"><button data-act="demolane" data-s="${sl.key}">Tear down (refund half)</button>${par?`<button data-act="selplot" data-id="${par.id}">Show building</button>`:''}</div>`}
    else{const D=LANES[l.type],who=S.cols.find(c=>c.lpost===sl.key);h+=`<div class="between"><h3>${D.n}</h3>${close}</div><div class="dim">${D.d}</div>${l.type==='post'?`<div>${who?esc(who.nick)+' holds this post.':'Empty until raiders get inside the walls.'}</div>`:''}<div class="row"><button data-act="demolane" data-s="${sl.key}">Tear down (refund half)</button></div>`}
  }else if(sel.k==='wp'){
    const ws=wpSlots().find(s=>s.key===sel.key);if(!ws){sel=null;return}const w=S.wp[ws.key];
    if(!w){h+=`<div class="between"><h3>Wall-side plot</h3>${close}</div><div class="dim">A small plot along the inside of the ${SIDEN[ws.side]} wall, for small buildings: defense, a few beds, shelves, a cooking fire or a workbench.</div><div>`;
      h+=`</div>`;for(const[cn,types]of WP_CATS){h+=`<h4 class="bcat">${cn}</h4><div class="build">`;for(const type of types){const D=WPLOTS[type],lock=D.req&&!done(D.req),dup=type==='tradespot'&&hasTradeSpot();h+=`<button data-act="buildwp" data-v="${type}" data-s="${ws.key}" ${lock||dup||!costOk(D)?'disabled':''}><b>${D.n}</b><small>${lock?'Needs research: '+reqName(D.req):dup?'You already have one':esc(costStr(D))+' \u00b7 '+D.d}</small></button>`}h+=`</div>`}}
    else if(w.con){const D=WPLOTS[w.type];h+=`<div class="between"><h3>${D.n}</h3>${close}</div><div class="dim">Under construction · ${etaStr(w.con)}</div><div class="row">${bar(w.con.prog,'green')}<span class="num dim">${Math.round(w.con.prog*100)}%</span></div><div class="row"><button data-act="demowp" data-s="${ws.key}">Cancel</button></div>`}
    else{const D=WPLOTS[w.type];h+=`<div class="between"><h3>${D.n}</h3>${close}</div><div class="dim">${D.d}</div>`;
      if(w.type==='armory'){const g=Object.keys(ITEMS).filter(i=>isGear(i)&&cnt(i)>=1);h+=`<div>${g.length?g.map(i=>`${fmt(cnt(i))} ${ITEMS[i].n.toLowerCase()}`).join(' \u00b7 '):'<span class="warn">No weapons or armor. Craft them at a crafting spot or smithy.</span>'}</div>`}
      if(w.type==='tradespot')h+=`<div>${S.trader?`The ${esc(S.trader.name)} caravan is here.`:'No caravan right now.'} Auto-trade rules are set in the Trade tab.</div><div class="row"><button data-act="tab" data-v="trade">Open trade settings</button></div>`;
      if(WPLOTS[w.type].work){const o=plotById('w'+ws.key);if(o){const ws2=workersOf(o.id);h+=billsHTML(o).replace(/data-id="(w[^"]*)"/g,'data-wid="$1"');
        h+=`<div>Worker ${ws2.length}/1: ${ws2.length?esc(ws2[0].nick):'<span class="dim">drag a colonist here</span>'}</div>`}}
      if(w.type==='bunk')h+=`<div>Sleeping here: ${esc(allBeds().map((b,i)=>b.wp===ws.key?S.cols[i]:null).filter(Boolean).map(c=>c.nick).join(', ')||'nobody yet')}</div>`;
      if(w.type==='shelf')h+=`<div class="dim">Adds ${shelfCells().filter(c=>c[0]>=ws.x0&&c[0]<ws.x0+ws.w&&c[1]>=ws.y0&&c[1]<ws.y0+ws.h).length*30} storage space.</div>`;
      if(w.type==='mortar')h+=`<div class="dim">Fires about every 7 seconds at raiders up to 34 tiles away; each shot uses one mortar shell and hits everyone within 3 tiles.</div><div class="${cnt('shell')?'':'warn'}">Shells in stock: ${fmt(cnt('shell'))}${cnt('shell')?'':' · make them at a munitions workshop (research Artillery)'}</div>`;
      h+=`<div class="row"><button data-act="demowp" data-s="${ws.key}">Take down (refund half)</button></div>`}
  }else if(sel.k==='trap'){
    const t=S.traps[sel.key];if(!t){sel=null;return}const D=TRAPS[t.type];
    h+=`<div class="between"><h3>${D.n}</h3>${close}</div><div class="dim">${D.d}</div>${t.con?`<div class="row">${bar(t.con.prog,'green')}<span class="num dim">being set up</span></div>`:t.type==='spikes'?`<div class="${t.ch>0?'':'warn'}">${t.ch>0?t.ch+' of '+D.ch+' uses left':'Sprung. A builder resets it after the raid.'}</div>`:''}<div class="row"><button data-act="demotrap" data-s="${sel.key}">Remove</button><button data-act="tab" data-v="defense">Place more traps</button></div>`;
  }else if(sel.k==='gate'){
    const g=S.gates.find(g=>gateCells(g).includes(sel.cell));if(!g){sel=null;return}const hp=gateCells(g).map(i=>S.breach[i]?'breached':Math.round(cellHP(i)/cellMax(i)*100)+'%');
    h+=`<div class="between"><h3>${g.main?'Main gate':'Gate'}</h3>${close}</div><div class="dim">${g.main?'Caravans, visitors and the road arrive here.':'Colonists use it as a shortcut to the land outside.'} Raiders cannot walk through gates, but gates break sooner than the wall (60% of its strength).</div><div style="font-size:12px">Gate sections: ${hp.join(', ')}</div>`;
    {const c=wupCost('house');h+=g.house?'<div class="good" style="font-size:12px">Gatehouse with portcullis: this gate holds twice as much.</div>':`<div class="row"><button data-act="gatehouse" data-v="${sel.cell}" ${S.wall<0||!costOk(c)?'disabled':''}>Build a gatehouse · ${esc(costStr(c))}</button></div><div class="dim" style="font-size:11.5px">A portcullis and two small towers: the gate holds twice as much damage.</div>`}
    if(!g.main)h+=`<div class="row"><button data-act="demogate" data-v="${sel.cell}">Wall it up (refund half)</button></div>`;
  }else if(sel.k==='wall'){
    const w=S.wall<0?{n:'No wall yet',d:'The dashed line shows where the wall will run. Without a wall raiders just walk in. A trench is cheap and gives you a bridge in the west.'}:WALLS[S.wall],n=S.wallCon?null:WALLS[S.wall+1];
    if(S.wallCon)h+=`<div class="proj"><b>Building the ${WALLS[S.wallCon.tier].n.toLowerCase()}</b><div class="row">${bar(S.wallCon.prog,'green')}<span class="num dim">${Math.round(S.wallCon.prog*100)}%</span></div><div class="dim" style="font-size:12px">${etaStr(S.wallCon)}</div></div>`;
    if(S.wall<0)h+=`<div class="between"><h3>${w.n}</h3>${close}</div><div class="dim">${w.d}</div><div class="row"><button data-act="landmode" ${S.proj?'disabled':''}>${landMode?'Cancel':'Clear new land'}</button><span class="dim" style="font-size:12px">${S.proj?'Builders are already clearing land.':esc(costStr(expandCost()))}</span></div>`;
    else h+=`<div class="between"><h3>${w.n}</h3>${close}</div><div class="dim">${w.d}</div><div style="font-size:12px">Caravans arrive ${Math.round(S.wall*8)}% more often. Every wall section holds ${wallMax()} damage, gates ${Math.round(wallMax()*.6)}. ${SIDES.filter(sd=>sideCells(sd).length).map(sd=>{const hh=sideHealth(sd);return SIDEN[sd]+' '+(hh.b?hh.b+' breach'+(hh.b>1?'es':''):Math.round(hh.f*100)+'%')}).join(', ')}. Drag colonists onto the wall to make them guards.</div><div class="row"><button data-act="gatemode">${gateMode?'Cancel gate placement':'Place a gate'}</button><span class="dim" style="font-size:12px">${esc(costStr(gateCost()))}</span></div>`;
    h+=`<div class="row"><button data-act="landmode" ${S.proj?'disabled':''}>${landMode?'Cancel':'Clear new land'}</button><span class="dim" style="font-size:12px">${S.proj?'Builders are already clearing land.':esc(costStr(expandCost()))+' · '+openCount()+' of '+COLS*ROWS+' plots cleared'}</span></div>`;
    if(n)h+=`<div class="row"><button data-act="wallup" ${(n.req&&!done(n.req))||!costOk(n)?'disabled':''}>${S.wall<0?'Dig a':'Upgrade to'} ${S.wall<0?n.n.toLowerCase():n.n}</button></div><div style="font-size:12px">${costHTML(n)}${n.req&&!done(n.req)?` · <span class="bad">needs research: ${reqName(n.req)}</span>`:''}</div>`;
  }else if(sel.k==='plot'){
    const p=plotById(sel.id);if(!p){sel=null;return}
    if(!p.open){
      h+=`<div class="between"><h3>Wild land</h3>${close}</div>`;
      const obs=plotObstacles(p),nt=obs.filter(o=>o.k==='tree').length,nr=obs.length-nt,bs=S.cols.filter(c=>c.assign==='build');
      if(S.proj&&S.proj.pid===p.id){h+=`<div>${S.proj.prog<.6?'Builders are felling trees, breaking rocks and leveling the ground.':'Builders are extending the '+WALLS[S.wall].n.toLowerCase()+' around the new land.'}</div><div class="row">${bar(S.proj.prog,'green')}<span class="num dim">${Math.round(S.proj.prog*100)}%</span></div><div class="dim" style="font-size:12px">${etaStr(S.proj)}</div><div class="${bs.length||hasConstructors()?'':'warn'}">${bs.length?'Builders: '+esc(bs.map(c=>c.nick).join(', ')):'No builders. Drag colonists onto this land.'}</div><div class="row"><button data-act="cancelexp">Cancel (full refund)</button></div>`}
      else if(lockedAdj(p)){const c=expandCost(p);if(rockPlot(p))h+=`<div class="warn" style="font-size:12px">Solid rock: digging takes about four times as long and costs more, but yields stone.</div>`;h+=`<div class="dim">Builders fell the trees, break the rocks, level the ground and extend the wall around this land. The wood and stone go to storage.</div><div style="font-size:12px">${nt} trees · ${nr} rocks · cost ${costHTML(c)}</div>${(()=>{const lost=wpSlots().filter(s=>S.wp[s.key]&&s.pid>=0&&nb(plotById(s.pid),...{W:[-1,0],E:[1,0],N:[0,-1],S:[0,1]}[s.side])===p);return lost.length?`<div class="warn" style="font-size:12px">The ${lost.map(s=>WPLOTS[S.wp[s.key].type].n.toLowerCase()).join(' and ')} on this edge will be removed (refunded).</div>`:''})()}<div class="row"><button data-act="expand" data-id="${p.id}" ${S.proj||!costOk(c)?'disabled':''}>Clear this land</button>${S.proj?'<span class="dim" style="font-size:12px">Builders are busy with other land.</span>':''}</div><div class="dim" style="font-size:12px">${bs.length?bs.length+' builder'+(bs.length>1?'s':'')+' ready.':'Then drag colonists onto it to make them builders.'}</div>`}
      else h+=`<div class="dim">Too far from the base. Clear the land next to it first.</div>`;
    }else if(p.con&&!p.type){
      const d=PLOTS[p.con.type].tiers[0];h+=`<div class="between"><h3>${d.n}</h3>${close}</div><div class="dim">Under construction.${hasConstructors()?' Your builders are on it.':S.cols.some(c=>c.assign===null)?' Idle colonists build it.':' Nobody is free to build: unassign a colonist or set up a builder’s yard.'}</div><div class="row">${bar(p.con.prog,'green')}<span class="num dim">${Math.round(p.con.prog*100)}%</span></div><div class="dim" style="font-size:12px">${etaStr(p.con)}</div><div class="row"><button data-act="cancelcon" data-id="${p.id}">Cancel (full refund)</button></div>`;
    }else if(!p.type){
      h+=`<div class="between"><h3>Empty plot</h3>${close}</div><div class="dim">Choose what to build. Same type and tier next door joins up (+15% per plot). <span style="color:#e6d27a">★</span> shows bonuses from the neighbours here. Buildings with wings can later grow a wing into one of the lanes around them.</div>`;
      for(const[cn,types]of BUILD_CATS){const list=types.filter(t=>PLOTS[t]).sort((a,b)=>(!!canBuildType(a))-(!!canBuildType(b)));h+=`<h4 class="bcat">${cn}</h4><div class="build">`;
        for(const type of list){const t0=PLOTS[type].tiers[0],why=canBuildType(type),pv=why?[]:adjPreview(p,type),wn=annexesFor(type);
          const pvs=pv.map(e=>`<span style="color:${e.v>0?'#e6d27a':'#e08a6a'}">★ ${e.v>0?'+':''}${Math.round(e.v*100)}% ${esc(e.why)}</span>`).join(' ');
          h+=`<button data-act="build" data-v="${type}" data-id="${p.id}" ${why||!costOk(t0)?'disabled':''} title="${esc(why||PLOTS[type].d)}"><b>${t0.n}</b><small>${why?esc(why):`${pvs?pvs+'<br>':''}${esc(costStr(t0))} · ${esc(PLOTS[type].d)}${wn.length?`<br><span style="color:#c9d6a0">Wings: ${wn.map(a=>esc(WINGS[a].n)).join(', ')}</span>`:''}`}</small></button>`}
        h+=`</div>`}
    }else{
      const d=tierDef(p),n=upgradeCost(p),cb=clusterBonus(p),ws=workersOf(p.id),grp=connected(p);
      h+=`<div class="between"><h3>${d.n}</h3>${close}</div><div class="dim">${PLOTS[p.type].n} · tier ${p.tier+1} of ${PLOTS[p.type].tiers.length}${grp.length>1?` · joined with ${grp.length-1} more (+${Math.round((cb-1)*100)}%)`:''}</div>`;
      if(isAnnex(p)){const q=annexParent(p);h+=`<div>${esc(PLOTS[p.type].d)}</div><div class="${q?'dim':'warn'}">${q?'Wing of the '+esc(plotName(q).toLowerCase())+'.':'Not attached: needs a '+PLOTS[p.type].of.map(t=>PLOTS[t].n.toLowerCase()).join(' or ')+' right next to it, with no '+PLOTS[p.type].n.toLowerCase()+' yet.'}</div>`;
        if(p.type==='bunk'){const res=allBeds().map((b,i)=>b.pid===p.id?S.cols[i]:null).filter(Boolean);h+=`<div>${layouts[p.id].beds.length} beds · sleeping here: ${res.length?esc(res.map(c=>c.nick).join(', ')):'nobody yet'}</div>`}}
      else{const bi=bonusInfo[clusterRoot[p.id]];if(bi){const parts=bi.adj.map(e=>`<span style="color:${e.v>0?'#e6d27a':'#e08a6a'}">${e.v>0?'+':''}${Math.round(e.v*100)}% ${esc(e.why)}</span>`);if(parts.length)h+=`<div style="font-size:12px">Neighbours: ${parts.join(' · ')}</div>`;
        const wn=annexesFor(p.type);if(wn.length){const have=bi.annex.map(a=>a.type);h+=`<div style="font-size:12px">Wings: ${wn.map(a=>have.includes(a)?`<b>${WINGS[a].n} ✓</b>`:`<span class="dim">${WINGS[a].n}</span>`).join(' · ')}</div>${wn.some(a=>!have.includes(a))?'<div class="dim" style="font-size:11.5px">Wings go into the lanes around this building. Click a highlighted lane.</div>':''}`}}}
      if(p.type==='housing'){const res=allBeds().map((b,i)=>b.pid===p.id?S.cols[i]:null).filter(Boolean);h+=`<div>${layouts[p.id].beds.length} beds · residents: ${res.length?esc(res.map(c=>c.nick).join(', ')):'none'}</div>`}
      if(p.type==='farm'||p.type==='hydro'){
        const cells=cropCells(p);let sown=0,ripe=0;for(const[x,y]of cells){const q=S.plants[x+','+y];if(q){sown++;if(q.g>=1)ripe++}}
        let gm=d.grow*cb*(done('fertilizer')?1.25:1)*seasonGrow(p);if(p.type==='farm'){const bg=biome().grow;gm*=bg<1&&p.tier>=1?1:bg}
        h+=`<label class="row"><span class="lbl">Crop</span><select id="crop-${p.id}" data-chg="crop" data-id="${p.id}">${Object.keys(CROPS).map(k=>{const c=CROPS[k],lock=!owns(k);return`<option value="${k}" ${p.crop===k?'selected':''} ${lock?'disabled':''}>${c.n}${lock?' (buy seeds)':''} · ${fmtTime(c.grow/gm)} · yield ${c.yield}</option>`}).join('')}</select></label>`;
        if(grp.length>1)h+=`<div class="row"><button data-act="cropall" data-id="${p.id}">Grow ${CROPS[p.crop].n.toLowerCase()} on all ${grp.length} joined plots</button></div>`;
        h+=`<div class="row"><span style="min-width:110px">Sown ${sown}/${cells.length}</span>${bar(sown/cells.length,'green')}</div><div class="row"><span style="min-width:110px">Ready ${ripe}</span>${bar(ripe/Math.max(1,sown))}</div>`;
        h+=`<div>Growth speed ${Math.round(gm*100)}% · ${cells.length} crop cells</div>`;
        const missing=Object.keys(CROPS).filter(k=>!owns(k)&&(!CROPS[k].req||done(CROPS[k].req)));
        if(missing.length)h+=`<div class="dim" style="font-size:12px">Buy more seed types from caravans: ${missing.map(k=>`${CROPS[k].n} ${CROPS[k].unlock}`).join(' · ')}</div>`;
      }
      if(p.type==='pen'){
        const used=penUsed(p),cap=penCap(p);h+=`<div class="row"><span style="min-width:110px">Space ${used}/${cap}</span>${bar(used/cap,'blue')}</div>`;
        const counts={};for(const a of S.ani)if(a.pen===p.id)counts[a.type]=(counts[a.type]||0)+1;
        h+=`<div>${Object.keys(counts).length?Object.keys(counts).map(t=>`${counts[t]} ${(counts[t]>1?ANIMALS[t].pl:ANIMALS[t].n).toLowerCase()}`).join(', '):'No animals yet. Buy some from a trader.'}</div>`;
        if(!ws.length)h+=`<div class="warn">No rancher: products pile up and animals will not breed.</div>`;
        for(const t in counts){const a=ANIMALS[t],ad=S.ani.filter(x=>x.pen===p.id&&x.type===t&&x.age>=a.adult).length;if(ad>=2)h+=`<div class="row"><span style="min-width:110px">${a.n} breeding</span>${bar((p.breed&&p.breed[t]||0)/a.gest,'green')}</div>`}
      }
      if(BILLS[p.type]){
        h+=billsHTML(p);
        h+=`<div class="dim" style="font-size:12px">Work speed ${Math.round(d.speed*cb*100)}% · uses the ${SKN[RECIPES[p.bill].sk]} skill.</div>`;
      }
      if(p.type==='hunting'){const ws2=workersOf(p.id),alive=S.wild.filter(a=>!a.dead).length,wl=['rifle','recurve','bow','steelspear','spear'].filter(w=>cnt(w)>0);h+=`<div>${alive} wild animals roam outside the walls · butchering uses the Cooking skill, aiming uses Shooting.</div><div class="${wl.length||ws2.some(c=>c.weapon)?'dim':'warn'}" style="font-size:12px">${ws2.map(c=>c.nick+': '+(c.weapon?ITEMS[c.weapon].n.toLowerCase():'unarmed')).join(' · ')||'No hunter yet.'}${wl.length?' · in storage: '+wl.map(w=>cnt(w)+' '+ITEMS[w].n.toLowerCase()).join(', '):' · no weapons in storage. Craft a short bow or spear at a crafting spot.'}</div>`}
      if(p.type==='treefarm')h+=`<div>${cropCells(p).length} trees · each yields about ${CROPS.tree.yield} wood · growth ${Math.round(tierDef(p).grow*clusterBonus(p)*100)}%</div>`;
      if(p.type==='quarry'){const os=quarryOres(p);h+=`<label class="row"><span class="lbl">Dig for</span><select id="qprod-${p.id}" data-chg="qprod" data-id="${p.id}" ${os.length<2?'disabled':''}>${os.map(o=>`<option value="${o}" ${quarryOre(p)===o?'selected':''}>${ITEMS[o].n}</option>`).join('')}</select>${os.length<2?'<span class="dim" style="font-size:11.5px">Deep mines (tier 3, research Deep mining) also dig steel</span>':''}</label>`}
      if(p.type==='quarry')h+=`<div class="dim">Cut speed ${Math.round(d.speed*cb*100)}% · uses the Mining skill. About 7 stone blocks per cut.</div>`;
      if(LIMIT_TYPES.includes(p.type)&&!BILLS[p.type]){const li=limitItem(p),on=hasLimit(p);
        h+=`<div class="proj"><label class="row"><span class="lbl">Work until</span><input type="number" min="0" step="5" id="limit-${p.id}" data-chg="limit" data-id="${p.id}" value="${on?p.limit:''}" placeholder="no limit" aria-label="Stock limit"><span>${ITEMS[li].n.toLowerCase()} in storage</span></label><div style="font-size:12px" class="${paused(p)?'warn':'dim'}">${paused(p)?pauseText(p)+'. Work resumes below the limit.':on?`Working: ${fmt(cnt(li))} of ${p.limit} in stock.`:'Leave empty to work without a limit.'}${grp.length>1?' Applies to all joined plots.':''}</div></div>`}
      {const d0=PLOTS[p.type].tiers[p.tier];if(d0.power)h+=`<div class="${S.pwrOK===false?'bad':'dim'}">Uses ${d0.power} W of power.${S.pwrOK===false?' No power right now: it works like the tier below.':''}</div>`;if(p.type==='solar')h+=`<div>Makes up to ${d0.prod} W in daylight (now ${fmt(d0.prod*(S.pw?S.pw.sun:1))} W).</div>`;if(p.type==='burner')h+=`<div>Makes ${d0.prod} W day and night while it has wood or chemfuel. Burns ${d0.fuel} wood per minute.</div>`;if(p.type==='battery')h+=`<div>Stores ${fmt(d0.store)} power. All batteries: ${fmt(S.batt||0)} of ${fmt(S.pw?S.pw.store:0)}.</div>`;
        if(['solar','burner','battery'].includes(p.type)&&S.pw)h+=`<div class="dim" style="font-size:12px">Colony: ${fmt(S.pw.prod)} W made, ${fmt(S.pw.use)} W used.</div>`}
      if(p.type==='construction')h+=`<div>Builders work ${Math.round(d.speed*cb*100)}% faster here · uses the Construction skill. Without builders, idle colonists build.</div>`;
      if(p.type==='commons')h+=`<div>Colonists who eat here work ${Math.round((commonsBuff()-1)*100)}% faster until their next meal. Fine meals add 5%. Meals are stored here.</div>`;
      if(p.type==='research'){const cur=RESEARCH.find(r=>r.id===S.research.cur);h+=`<div>${cur?cur.n:'No project'}</div>${cur?`<div class="row">${bar((S.research.prog[cur.id]||0)/cur.cost,'blue')}<span class="num dim">${fmt(S.research.prog[cur.id]||0)}/${cur.cost}</span></div>`:''}`}
      if(p.type==='storage')h+=`<div>Capacity ${fmt(layouts[p.id].store.length*d.per*cb*(biome().storage||1))} items · haulers carry ${d.cart}, up to ${d.carry} goods (+5% per Hauling level)</div><div class="dim" style="font-size:12px">With at least one hauler, other workers drop their goods on a pickup pile at their plot and get back to work sooner.</div>`;
      if(p.type==='comms')h+=`<div>${S.orbital?`${esc(S.orbital.name)} in orbit for ${fmtTime(S.orbital.until-S.t)}.`:'No orbital trader in range.'}</div><div class="row">${S.orbital?'<button data-act="trade" data-v="orbital">Trade</button>':''}<button data-act="tab" data-v="contracts">Orders</button></div>`;
      if(slots(p))h+=`<div>Workers ${ws.length}/${slots(p)}: ${ws.length?esc(ws.map(c=>c.nick).join(', ')):'<span class="dim">drag a colonist here</span>'}</div>`;
      if(p.con)h+=`<div class="proj"><b>Upgrading to ${PLOTS[p.type].tiers[p.con.tier].n}</b><div class="row">${bar(p.con.prog,'green')}<span class="num dim">${Math.round(p.con.prog*100)}%</span></div><div class="dim" style="font-size:12px">${etaStr(p.con)}</div><div class="row"><button data-act="cancelcon" data-id="${p.id}">Cancel upgrade (full refund)</button></div></div>`;
      if(n&&!p.con){
        const lock=n.req&&!done(n.req);
        h+=`<div class="proj"><div class="between"><b>Upgrade to ${n.n}</b>${lock?`<span class="bad" style="font-size:12px">needs research: ${reqName(n.req)}</span>`:''}</div><div class="dim" style="font-size:12px">${upgradeText(p,n)}</div><div style="font-size:12px">${costHTML(n)}</div><div class="row"><button data-act="upgrade" data-id="${p.id}" ${lock||!costOk(n)?'disabled':''}>Upgrade this plot</button>`;
        if(grp.length>1){const tot={cost:n.cost*grp.length,mat:{}};for(const k in n.mat||{})tot.mat[k]=n.mat[k]*grp.length;h+=`<button data-act="upgradeall" data-id="${p.id}" ${lock||!costOk(tot)?'disabled':''} title="${esc(costStr(n,grp.length))}">Upgrade all ${grp.length} joined</button>`}
        h+=`</div>${grp.length>1?'<div class="dim" style="font-size:11.5px">Upgrading one plot alone splits it from the others until they match again.</div>':''}</div>`;
      }
      h+=`<div class="row"><button data-act="demolish" data-id="${p.id}">Demolish (refund ${Math.floor((p.spent||0)/2)})</button></div>`;
    }
  }
  el.hidden=false;setHTML(el,h);
}
function upgradeText(p,n){
  const d=tierDef(p);
  switch(p.type){case 'housing':return`${d.beds} → ${n.beds} beds per plot${n.power?', needs '+n.power+' W power':''}`;case 'treefarm':return`Growth ${Math.round(d.grow*100)}% → ${Math.round(n.grow*100)}%, more trees`;case 'farm':case 'hydro':return`Growth ${Math.round(d.grow*100)}% → ${Math.round(n.grow*100)}%, more crop cells${n.note?' ('+n.note.toLowerCase()+')':''}${n.yield?', +25% yield':''}`;
    case 'pen':return`Space ${d.cap} → ${n.cap}${n.prod?', more products':''}${n.power?', needs '+n.power+' W power':''}`;
    case 'solar':return`${d.prod} → ${n.prod} W in daylight`;case 'burner':return`${d.prod} → ${n.prod} W day and night, burns ${n.fuel} wood per minute`;case 'battery':return`Stores ${fmt(d.store)} → ${fmt(n.store)} power`;
    case 'weaponsmith':case 'armorsmith':{const un=BILLS[p.type].filter(k=>(RECIPES[k].tier||0)===p.tier+1).map(k=>ITEMS[RECIPES[k].out].n.toLowerCase());return`Speed ${Math.round(d.speed*100)}% → ${Math.round(n.speed*100)}%${un.length?', unlocks '+un.join(', '):''}${n.power?', needs '+n.power+' W power':''}`}
    case 'quarry':return`Speed ${Math.round(d.speed*100)}% → ${Math.round(n.speed*100)}%${n.ores?', digs '+n.ores.filter(o=>o!=='plasteel'||S.site.biome==='mountain'||S.site.biome==='tundra'||S.site.biome==='cave').join(' and '):''}${n.power?', needs '+n.power+' W power':''}`;case 'storage':return`${d.per} → ${n.per} items per cell, haulers use ${n.cart} (${d.carry} → ${n.carry} goods per trip), +1 hauler slot`;case 'commons':return`Meal bonus +${Math.round((d.buff-1)*100)}% → +${Math.round((n.buff-1)*100)}%, more seats`;default:return(d.speed?`Speed ${Math.round(d.speed*100)}% → ${Math.round(n.speed*100)}%`:'')+(n.power?`, needs ${n.power} W power`:'')+(slots(p)&&p.tier<2?', +1 worker slot':'')}
}
function assignOptions(c){
  let o=`<option value="">Idle</option><option value="out" ${c.assign==='out'?'selected':''}>Gather outside (${workersOf('out').length})</option><option value="build" ${c.assign==='build'?'selected':''}>Clear land (${workersOf('build').length})</option>`;
  o+=`<option value="guard" ${isGuard(c)?'selected':''}>Guard the wall (${S.cols.filter(isGuard).length})</option>`;
  for(const o2 of wpWorkPlots()){const full=workersOf(o2.id).filter(x=>x!==c).length>=1;o+=`<option value="${o2.id}" ${c.assign===o2.id?'selected':''} ${full&&c.assign!==o2.id?'disabled':''}>${esc(plotName(o2))} (wall, ${workersOf(o2.id).length}/1)</option>`}
  for(const p of S.plots)if(slots(p)){const full=workersOf(p.id).filter(x=>x!==c).length>=slots(p);o+=`<option value="${p.id}" ${c.assign===p.id?'selected':''} ${full&&c.assign!==p.id?'disabled':''}>${esc(plotLabel(p))} (${workersOf(p.id).length}/${slots(p)})</option>`}
  return o;
}

const CHI={start:'⚑',build:'⌂',land:'▦',research:'✦',people:'☺',raid:'⚔',season:'❀',move:'➜',event:'!',exp:'⛺',boss:'☠',legacy:'★'};
function storyHTML(){const t=Math.min(1,(S.story&&S.story.tension||0)/1.2),lv=STORY[opt('story')]||STORY.normal,m=(S.mods||[]).filter(x=>x.until>S.t);return`<div class="storybar"><span>Storyteller: <b>${lv.n}</b></span><span class="tens" title="Tension: rises after bad events and raids, calms over time. High tension holds back bad events."><i style="width:${Math.round(t*100)}%;background:${t>.66?'#d86a52':t>.33?'#d8b14a':'#8fc46a'}"></i></span><span class="dim">${t>.66?'Tense':t>.33?'Uneasy':'Calm'}</span>${m.map(x=>`<span class="chip">${esc(x.n)} · ${Math.ceil((x.until-S.t)/DAY*24)}h</span>`).join('')}</div>`}
function chronHTML(){const L=(S.chron||[]).slice().reverse();if(!L.length)return storyHTML()+'<div class="dim">Nothing recorded yet.</div>';let h=storyHTML()+'<div class="chron">',lastD=-1;
  for(const e of L.slice(0,200)){const d=Math.floor(e.t/DAY);if(d!==lastD){lastD=d;const se=['Spring','Summer','Fall','Winter'][Math.floor(d/15)%4];h+=`<h4>Year ${Math.floor(d/60)+1} · ${se} ${d%15+1}${e.site?' · '+esc(e.site):''}</h4>`}h+=`<div class="ce ce-${e.k}"><i>${CHI[e.k]||'•'}</i><span>${esc(e.x)}</span></div>`}
  return h+'</div>'}
function sparkSVG(vals,col,fmtf){if(vals.length<2)return'<div class="dim" style="font-size:12px">Not enough data yet: one point per in-game hour.</div>';const W0=300,H0=70,mn=Math.min(...vals),mx=Math.max(...vals),rg=mx-mn||1,pts=vals.map((v,i)=>`${(i/(vals.length-1)*W0).toFixed(1)},${(H0-4-(v-mn)/rg*(H0-10)).toFixed(1)}`).join(' ');
  return`<svg class="spark" viewBox="0 0 ${W0} ${H0}" preserveAspectRatio="none" role="img" aria-label="chart"><polyline points="0,${H0} ${pts} ${W0},${H0}" fill="${col}" fill-opacity=".14" stroke="none"/><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><div class="spk"><span>low ${fmtf(mn)}</span><span>high ${fmtf(mx)}</span></div>`}
function statsHTML(){const H0=(S.hist||[]).slice(strng?-strng:0),last=H0[H0.length-1];let h=`<div class="chips">${[[24,'Last day'],[360,'Season'],[0,'All']].map(([v,l])=>`<button class="chip${strng===v?' ok':''}" data-act="strng" data-v="${v}">${l}</button>`).join('')}</div>`;
  const card=(t,k,col,f)=>`<div class="stc"><div class="between"><b>${t}</b><span class="num">${last?f(last[k]):'–'}</span></div>${sparkSVG(H0.map(x=>x[k]),col,f)}</div>`;
  h+=`<div class="stg">${card('Colony wealth','w','#e6d27a',fmt)}${card('Silver','s','#c9d6a0',fmt)}${card('Food in stock','f','#8fc46a',fmt)}${card('Colonists','c','#8ab4d8',v=>v)}</div>`;
  const P={},U={};for(const x of H0){for(const k in x.p)P[k]=(P[k]||0)+x.p[k];for(const k in x.u)U[k]=(U[k]||0)+x.u[k]}
  const hrs=Math.max(1,H0.length),keys=[...new Set([...Object.keys(P),...Object.keys(U)])].filter(k=>ITEMS[k]).sort((a,b)=>((P[b]||0)+(U[b]||0))-((P[a]||0)+(U[a]||0)));
  if(keys.length){h+=`<h4>Production per day</h4><div class="tablewrap"><table><thead><tr><th>Good</th><th class="n">Made</th><th class="n">Used</th><th class="n">Net</th><th>Stock</th></tr></thead><tbody>`;
    for(const k of keys.slice(0,24)){const pd=(P[k]||0)/hrs*24,ud=(U[k]||0)/hrs*24,net=pd-ud,st=cnt(k),days=net<0?st/(-net):Infinity;
      h+=`<tr><td><img src="${icon(k)}" alt=""> ${ITEMS[k].n}</td><td class="n">${fmt(Math.round(pd))}</td><td class="n">${fmt(Math.round(ud))}</td><td class="n ${net<-.5?'bad':net>.5?'good':''}">${net>0?'+':''}${fmt(Math.round(net))}</td><td class="${days<3?'bad':days<8?'warn':'dim'}">${fmt(Math.floor(st))}${days<20?` · ${days<1?'gone in hours':'lasts '+days.toFixed(1)+' d'}`:''}</td></tr>`}
    h+=`</tbody></table></div>`;
    const low=keys.filter(k=>{const net=((P[k]||0)-(U[k]||0))/hrs*24;return net<-.5&&cnt(k)/(-net)<5});if(low.length)h+=`<div class="warn" style="font-size:12px">Running low: ${low.map(k=>ITEMS[k].n.toLowerCase()).join(', ')}.</div>`}
  const st=S.stats||{};h+=`<div class="dim" style="font-size:12px">Raids: ${st.raids||0} (${st.raidsWon||0} repelled) · expeditions: ${st.exps||0} · bosses defeated: ${st.bosses||0} · moves: ${S.reloc||0}</div>`;
  return h}
function saveSlotKey(n){return SAVE_KEY+'-slot'+n}
function slotMeta(n){try{const r=localStorage.getItem(saveSlotKey(n));return r?JSON.parse(r).meta:null}catch(e){return null}}
function slotsHTML(){let h='<div class="slots">';for(let n=1;n<=3;n++){const m=slotMeta(n);h+=`<div class="slot">${m&&m.thumb?`<img src="${m.thumb}" alt="">`:'<div class="slot-e">empty</div>'}<div class="slot-t"><b>Slot ${n}</b><small>${m?`${esc(m.name)} · day ${m.day} · ${m.cols} colonists<br>${new Date(m.at).toLocaleString()}`:'Nothing saved'}</small></div><div class="slot-b"><button data-act="slotsave" data-v="${n}">Save</button>${m?`<button data-act="slotload" data-v="${n}">Load</button><button data-act="slotdel" data-v="${n}" aria-label="Delete slot ${n}">✕</button>`:''}</div></div>`}
  return h+`</div><div class="row"><button data-act="saveexport">Export save file</button><button data-act="saveimport">Import save file</button></div><div class="dim" style="font-size:11.5px">The game also autosaves every 15 seconds. Export a file to move your colony to another device.</div>`}
function saveSlot(n){save();let thumb='';try{const c=document.createElement('canvas');c.width=160;c.height=90;const g=c.getContext('2d'),r=Math.min(cv.width/160,cv.height/90);g.drawImage(cv,(cv.width-160*r)/2,(cv.height-90*r)/2,160*r,90*r,0,0,160,90);thumb=c.toDataURL('image/jpeg',.6)}catch(e){}
  try{localStorage.setItem(saveSlotKey(n),JSON.stringify({meta:{name:S.site.name,day:Math.floor(S.t/DAY)+1,cols:S.cols.length,at:Date.now(),thumb},data:serialize()}));msg(`Saved to slot ${n}.`,'good')}catch(e){msg('Not enough browser storage to save there.','bad')}}
function loadGameStr(str,label){const backup=serialize();try{const d=JSON.parse(str);d.lastSave=Date.now();if(!loadFrom(JSON.stringify(d)))throw new Error('unknown save version');buildStatic();plotDirty=true;sel=null;tab=null;closeModal();fitCam();save();msg(`${label||'Save'} loaded.`,'good');return true}catch(e){console.error(e);try{loadFrom(backup);buildStatic();plotDirty=true}catch(e2){}msg('That save could not be loaded.','bad');return false}}
function exportSave(){const raw=serialize(),name=`dustwool-${(S.site.name||'colony').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-day${Math.floor(S.t/DAY)+1}.json`;
  if(window.claude&&window.claude.downloads&&window.claude.downloads.save){try{window.claude.downloads.save({filename:name,content:raw,mimeType:'application/json'});return}catch(e){}}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([raw],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function importSave(){const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';inp.onchange=()=>{const f=inp.files&&inp.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>loadGameStr(String(rd.result),'Save file');rd.readAsText(f)};inp.click()}
function wupHTML(side){if(S.wall<0)return'';let h=`<h4 class="bcat">${SIDEN[side][0].toUpperCase()+SIDEN[side].slice(1)} wall upgrades</h4><div class="build">`;
  for(const k in WUP){const has=wup(side,k),c=wupCost(k);h+=`<button data-act="wup" data-v="${k}" data-s="${side}" ${has||!costOk(c)?'disabled':''}><b>${WUP[k].n}${has?' ✓':''}</b><small>${has?'Built':esc(costStr(c))+' · '+WUP[k].d}</small></button>`}
  return h+'</div>'}
function uiPanel(){
  const el=$('panel');document.body.classList.toggle('panel-open',!!tab);
  for(const t of['work','research','trade','contracts','defense','log','world','menu'])$('tab-'+t).classList.toggle('on',tab===t);
  if(!tab){el.hidden=true;el._h='';lastTab=null;return}
  if(tab!==lastTab){lastTab=tab;popEl(el);document.body.classList.remove('sheet-min')}
  let h='';
  if(tab==='work'){
    const SK3={plants:'Pla',animals:'Ani',cooking:'Coo',crafting:'Cra',construction:'Con',mining:'Min',hauling:'Hau',shooting:'Sho',intellectual:'Int'};
    const list=S.cols.slice();if(wsort&&wsort!=='name')list.sort((a,b)=>b.sk[wsort]-a.sk[wsort]||(b.pa[wsort]||0)-(a.pa[wsort]||0));else if(wsort==='name')list.sort((a,b)=>a.nick.localeCompare(b.nick));
    h+=`<h3>Work</h3><div class="dim" style="font-size:12px">Tap a skill to rank colonists by it. Pick a job from the menu or drag a colonist onto a plot.</div>`;
    h+=`<div class="wk"><div class="wk-head"><button class="wk-n${wsort==='name'?' on':''}" data-act="wsort" data-v="name">Name${wsort==='name'?' ▴':''}</button><div class="wk-g">${SKILLS.map(sk=>`<button class="${wsort===sk?'on':''}" data-act="wsort" data-v="${sk}" title="${SKN[sk]}">${SK3[sk]}${wsort===sk?'▾':''}</button>`).join('')}</div></div>`;
    for(const c of list){h+=`<div class="wk-row"><div class="wk-top"><img src="${portrait(c)}" alt=""><b data-act="selcol" data-id="${c.id}">${esc(c.nick)}</b><select id="wassign-${c.id}" data-chg="assign" data-id="${c.id}" aria-label="Job for ${esc(c.nick)}">${assignOptions(c)}</select></div><div class="wk-g">${SKILLS.map(sk=>{const v=c.sk[sk],pa=c.pa[sk]||0;return`<span class="${wsort===sk?'on':''}" style="--f:${Math.min(100,v*5)}%" title="${SKN[sk]} ${v}${pa?(pa===2?', major passion':', minor passion'):''}">${v}${pa?`<i>${pa===2?'••':'•'}</i>`:''}</span>`}).join('')}</div></div>`}
    h+=`</div><div class="dim" style="font-size:11.5px">• minor passion, •• major passion: the skill grows faster.</div>`;
  }else if(tab==='log'){
    h+=`<div class="between"><h3>${logv==='chron'?'Chronicle':logv==='legacy'?'Legacy':'Statistics'}</h3><span class="chips"><button class="chip${logv==='chron'?' ok':''}" data-act="logv" data-v="chron">Chronicle</button><button class="chip${logv==='stats'?' ok':''}" data-act="logv" data-v="stats">Stats</button><button class="chip${logv==='legacy'?' ok':''}" data-act="logv" data-v="legacy">Legacy${S.legacy&&S.legacy.pts?' · '+S.legacy.pts:''}</button></span></div>`;
    if(logv==='chron')h+=chronHTML();else if(logv==='legacy')h+=legacyHTML();else h+=statsHTML();
  }else if(tab==='research'){
    const rs=S.cols.filter(c=>{const p=c.assign!=='out'&&c.assign!==null?plotById(c.assign):null;return p&&p.type==='research'});
    h+=`<div class="between"><h3>Research</h3><span class="dim">${rs.length?'Researching: '+esc(rs.map(c=>c.nick).join(', ')):'Nobody researches. Build a research corner.'}</span></div>`;
    h+=`<div class="chips">${['all',...Object.keys(RCATN)].map(k=>`<button class="chip${rcat===k?' ok':''}" data-act="rcat" data-v="${k}">${k==='all'?'All':RCATN[k]}</button>`).join('')}</div>`;
    for(const ck of Object.keys(RCATN)){if(rcat!=='all'&&rcat!==ck)continue;const list=RESEARCH.filter(r=>r.cat===ck);h+=`<h4 style="margin-top:2px">${RCATN[ck]} <span class="dim" style="letter-spacing:0">${list.filter(r=>done(r.id)).length}/${list.length}</span></h4>`;
    for(const r of list){const dn=done(r.id),cur=S.research.cur===r.id,p=(S.research.prog[r.id]||0)/r.cost;
      const eraOK=!r.era||era()>=r.era,preOK=!r.pre||done(r.pre),paid=!r.items||(S.research.paid&&S.research.paid[r.id]),canPay=researchCanPay(r);
      const needTxt=[!eraOK?`Needs the ${ERAS[r.era]} era: move to a new site`:'',!preOK?'Needs research: '+reqName(r.pre):'',r.items&&!paid?'costs '+Object.keys(r.items).map(k=>`<span class="${cnt(k)>=r.items[k]?'good':'bad'}">${r.items[k]} ${ITEMS[k].n.toLowerCase()}</span>`).join(' + '):''].filter(Boolean).join(' · ');
      h+=`<div class="proj ${cur?'cur':''} ${dn?'done':''}"><div class="between"><b>${r.n}</b><span class="dim num">${dn?'Done':fmt(S.research.prog[r.id]||0)+' / '+r.cost}</span></div><div class="dim">${r.d}</div>${needTxt&&!dn?`<div style="font-size:12px">${needTxt}</div>`:''}${dn?'':`<div class="row">${bar(p,'blue')}${cur?'<span style="color:var(--hi)">Current</span>':`<button data-act="research" data-v="${r.id}" ${!preOK||(!paid&&!canPay)?'disabled':''}>${!paid&&r.items?'Pay and research':'Research'}</button>`}</div>`}</div>`}}
  }else if(tab==='trade'){
    h+=`<h3>Trade</h3>`;
    h+=S.trader?`<div class="between"><span>Caravan from ${esc(S.trader.name)} at the gate · leaves in ${fmtTime(S.trader.until-S.t)}</span><button data-act="trade" data-v="caravan">Trade</button></div>`:`<div class="dim">${done('traderoutes')?`Next caravan in about ${fmtTime(S.nextCaravan-S.t)}.`:'Research Trade routes to know when the next caravan arrives.'}</div>`;
    h+=S.orbital?`<div class="between"><span>${esc(S.orbital.name)} in orbit · leaves in ${fmtTime(S.orbital.until-S.t)}</span><button data-act="trade" data-v="orbital">Trade</button></div>`:`<div class="dim">${hasComms()?`Next orbital trader in about ${fmtTime(S.nextOrbital-S.t)}.`:'Orbital traders need a comms tower.'}</div>`;
    const ts=hasTradeSpot();
    h+=`<h4 style="margin-top:4px">Auto-trade</h4><div class="${ts?'dim':'warn'}">${ts?'Sell everything above "keep", buy materials up to "buy up to". Runs with every trader that shows up, while they stay.':'Auto-trade needs a trade spot: build one on a small wall-side plot along the inside of the wall. You can set the rules already.'}</div>`;
    h+=`<div class="row"><div class="chips">${['all',...Object.keys(ICATN)].map(k=>`<button class="chip${tcat===k?' ok':''}" data-act="tcat" data-v="${k}">${k==='all'?'All goods':ICATN[k]}</button>`).join('')}</div><label class="row" style="gap:6px;margin-left:auto;font-size:12px"><span class="lbl">Silver reserve</span><input type="number" min="0" step="50" id="reserve" data-chg="reserve" value="${S.buyReserve??200}" aria-label="Silver reserve for auto-buying"></label></div>`;
    for(const ck of Object.keys(ICATN)){if(tcat!=='all'&&tcat!==ck)continue;
      h+=`<h4 style="margin-top:2px">${ICATN[ck]}</h4><div class="tablewrap"><table><thead><tr><th>Good</th><th>Stock</th><th>Value</th><th>Keep</th><th>Buy up to</th><th></th></tr></thead><tbody>`;
      for(const i of ICAT[ck]){const k=S.autoSell[i],on=k!==undefined&&k!==null&&k!=='',b=S.autoBuy[i],bon=b!==undefined&&b!==null&&b!=='',buy=BUYABLE.includes(i);
        h+=`<tr><td><img src="${icon(i)}" alt=""> ${ITEMS[i].n}</td><td class="n">${fmt(cnt(i))}</td><td class="n dim">${ITEMS[i].v}</td><td><input type="number" min="0" step="10" id="keep-${i}" data-chg="keep" data-v="${i}" value="${on?k:''}" placeholder="never" aria-label="Keep ${ITEMS[i].n}"></td><td>${buy?`<input type="number" min="0" step="10" id="buy-${i}" data-chg="buyupto" data-v="${i}" value="${bon?b:''}" placeholder="never" aria-label="Buy ${ITEMS[i].n} up to">`:'<span class="dim" style="font-size:11px">not sold</span>'}</td><td class="dim" style="font-size:11.5px">${on&&cnt(i)>k?`sells ${fmt(cnt(i)-k)}`:bon&&cnt(i)<b?`buys ${fmt(b-cnt(i))}`:''}</td></tr>`}
      h+=`</tbody></table></div>`}
  }else if(tab==='contracts'){
    h+=`<h3>Caravan requests</h3>`;
    const rq=S.requests;
    if(!rq.length)h+=`<div class="dim">No requests yet. Factions sometimes announce a caravan days ahead and ask for a specific good at a premium.</div>`;
    else{h+=`<div class="tablewrap"><table><thead><tr><th>Faction</th><th>Wants</th><th>Pays</th><th>Arrives</th></tr></thead><tbody>`;
      for(const r of rq)h+=`<tr><td>${esc(r.f)}</td><td><img src="${icon(r.i)}" alt=""> ${r.n} ${ITEMS[r.i].n.toLowerCase()} <span class="${cnt(r.i)>=r.n?'good':'dim'}">(have ${fmt(cnt(r.i))})</span></td><td class="n">${Math.round(r.mult*100)}% · ${fmt(r.n*ITEMS[r.i].v*r.mult*(1+.1*S.renown))} + ${r.schem||1} schematic${(r.schem||1)>1?'s':''}</td><td class="n">${r.arrived?'at the gate':'in '+fmtDays(r.at-S.t)}</td></tr>`;
      h+=`</tbody></table></div>`}
    h+=`<h3 style="margin-top:6px">Dropship contracts</h3>`;
    if(!hasComms())h+=`<div class="dim">Research Long-range comms and build a comms tower. Factions then post orders here that pay 170% of value.</div>`;
    else if(!S.contracts.length)h+=`<div class="dim">No open contracts. The next one arrives in about ${fmtTime(S.nextContract-S.t)}.</div>`;
    else{h+=`<div class="tablewrap"><table><thead><tr><th>Faction</th><th>Order</th><th>Pays</th><th>Expires</th><th></th></tr></thead><tbody>`;
      for(const k of S.contracts)h+=`<tr><td>${esc(k.f)}</td><td><img src="${icon(k.i)}" alt=""> ${k.n} ${ITEMS[k.i].n.toLowerCase()} <span class="dim">(have ${fmt(cnt(k.i))})</span></td><td class="n">${fmt(k.reward)}</td><td class="n">${fmtTime(k.until-S.t)}</td><td><button data-act="ship" data-v="${k.id}" ${cnt(k.i)<k.n?'disabled':''}>Ship</button></td></tr>`;
      h+=`</tbody></table></div>`}
  }else if(tab==='defense'){
    const R0=S.raid,al=aliveRaiders();
    h+=`<div class="between"><h3>Defense</h3><span class="row" style="gap:6px"><button data-act="gatemode" title="Place an extra gate on a straight stretch of wall">${gateMode?'Cancel gate':'Place gate'}</button><button data-act="militia" title="When a raid is much bigger than your guards, up to six workers take up arms. If raiders break through, everyone who can fights, with bare fists if needed.">${S.militia?'Militia: on':'Militia: off'}</button>${R0&&R0.phase==='warn'&&R0.demand?`<button data-act="payraid" ${S.silver<R0.demand&&!S.test?'disabled':''}>Pay ${fmt(R0.demand)}</button>`:''}<button data-act="testraid" ${R0?'disabled':''}>Test raid</button></span></div>`;
    h+=`<div class="${R0?'bad':'dim'}">${!R0?'No raiders in sight. Raids grow with your wealth and come with a warning.':R0.phase==='warn'?`${R0.total} ${RFAC[R0.fac||'tribal'].n.toLowerCase()} of the ${R0.f} arrive from the ${R0.sides.map(s=>SIDEN[s]).join(' and ')} in ${fmtTime(R0.at-S.t)}.${R0.demand?` They demand ${fmt(R0.demand)} silver.`:''}`:`Raid in progress: ${al.length} raiders left, ${R0.killed} down${R0.flee?', they are fleeing':''}.`}</div>`;
    const gs=S.cols.filter(isGuard);
    h+=`<div>Guards: <b>${gs.length}</b>${gs.length?' ('+esc(gs.map(c=>c.nick).join(', '))+')':''} <span class="longhelp"> · they patrol the whole wall and move to wherever raiders attack. Each guard carries a ranged and a melee weapon; near a breach they switch to melee.</span></div>`;
    h+=`<div class="tablewrap"><table><thead><tr><th>Wall</th><th>Posts</th><th>Health</th></tr></thead><tbody>`;
    for(const sd of SIDES){if(!sideCells(sd).length)continue;const ps=postPositions(sd).length,tu=wallSlots().filter(sl=>sl.side===sd&&S.def[sl.id]&&S.def[sl.id].type==='turret').length,sh=sideHealth(sd),hp=sh.f;
      h+=`<tr><td>${SIDEN[sd][0].toUpperCase()+SIDEN[sd].slice(1)}</td><td class="n">${ps}${tu?` +${tu} turret${tu>1?'s':''}`:''}</td><td class="n ${sh.b||hp<.3?'bad':hp<.8?'warn':''}">${S.wall<0?'no wall':sh.b?sh.b+' breach'+(sh.b>1?'es':''):Math.round(hp*100)+'%'}</td></tr>`}
    h+=`</tbody></table></div>`;
    const arm=[...RANGED,...MELEE,...BODYA,...HELMA].filter(i=>cnt(i)>0);
    h+=`<div><b>Weapons and armor:</b> <span class="shorthelp">${arm.length?arm.length+' kinds, '+fmt(arm.reduce((t,i)=>t+cnt(i),0))+' items':'<span class="warn">none in stock</span>'}</span><span class="longhelp">${arm.length?arm.map(i=>`${fmt(cnt(i))} ${ITEMS[i].n.toLowerCase()}`).join(' \u00b7 '):'<span class="warn">none in stock</span>'}${armories().length?'':' <span class="dim">· build an armory on a wall-side plot to keep gear out of storage</span>'}</span></div>`;
    h+=`<div class="row" style="gap:5px"><b>Traps</b>${Object.keys(TRAPS).map(k=>`<button data-act="trapmode" data-v="${k}" class="${trapMode===k?'on':''}" style="${trapMode===k?'border-color:var(--hi);color:var(--hi)':''}">${TRAPS[k].n}${k==='mine'?' ('+fmt(cnt('mine'))+')':''}</button>`).join('')}<button data-act="trapmode" data-v="remove" style="${trapMode==='remove'?'border-color:var(--hi);color:var(--hi)':''}">Remove</button></div><div class="dim" style="font-size:12px">${trapMode?'Click or drag over the ground within 8 tiles outside the wall. Esc stops.':'Pick a trap, then click or drag outside the wall to place it. Builders set them up.'} Spikes ${esc(costStr(TRAPS.spikes))} · pit ${esc(costStr(TRAPS.pit))} · mine uses 1 landmine.</div>`;
    h+=`<div style="font-size:12px">Traps placed: ${Object.keys(S.traps).length} · gates: ${S.gates.length} · wall-side plots: ${Object.keys(S.wp).length}/${wpSlots().length} built · ${wpOfType('mortar').length} mortar${wpOfType('mortar').length===1?'':'s'}</div>`;
    h+=`<div class="dim longhelp" style="font-size:12px">Tap any wall section to build a guard post, watchtower or auto-turret there, or to place a gate. Drag a colonist onto the wall to make them a guard. Guards take the best ranged and melee weapon and the best armor. Click a + on the wall to build a guard post, watchtower or auto-turret. Click the dashed boxes along the inside of the wall for an armory, a trade spot or a mortar pit, and the small marks outside the wall for traps. Raiders pick a wall section or gate and hammer it until it breaks. Guards and idle colonists repair damaged sections afterwards.</div>`;
  }else if(tab==='gear'){h+=loadoutHTML();
  }else if(tab==='world'){
    const o=relocOffer(),tr=trader(o.via);
    h+=`<h3>Move on</h3><p class="dim" style="margin:0">Buy transport from a trader to move your colonists to a bigger site. Food, components, research, seed stock and silver come along. Everything else is sold. Each move adds renown: traders pay 10% more.</p>`;
    h+=`<div class="proj"><div class="between"><b>${o.n}</b><span class="dim">from ${o.via==='caravan'?'a caravan':'an orbital trader'}</span></div><div class="chips">`;
    h+=`<span class="chip ${S.silver>=o.silver?'ok':'no'}">${fmt(S.silver)}/${fmt(o.silver)} silver</span>`;
    for(const i in o.items)h+=`<span class="chip ${cnt(i)>=o.items[i]?'ok':'no'}">${fmt(cnt(i))}/${o.items[i]} ${ITEMS[i].n.toLowerCase()}</span>`;
    h+=`<span class="chip ${tr?'ok':'no'}">${tr?(o.via==='caravan'?'Caravan at the gate':'Trader in orbit'):(o.via==='caravan'?'Wait for a caravan':hasComms()?'Wait for an orbital trader':'Needs a comms tower')}</span></div>`;
    h+=`<div class="row"><button data-act="choosebiome" ${canRelocate()?'':'disabled'}>Buy ${o.n.toLowerCase()} and choose a site</button></div></div>`;
    h+=`<div class="dim">Several settlements at once are planned for a later version.</div>`;
  }else if(tab==='menu'){
    h+=`<div class="between"><h3>Dustwool Ranch</h3><span class="ver">v${VERSION}</span></div><div class="dim">Progress saves in this browser.</div>
    <div><b>Controls</b><br>Click an empty plot to build · drag a colonist onto a plot, or onto the land outside to gather<br>Click trees, rocks and ship chunks outside to mark them · click the wall to upgrade it or place gates<br>Click wild land next to the base to clear it, then drag colonists onto it<br>Planned buildings are built by a builder’s yard, or by idle colonists if you have none<br>Drag the map to pan (any mode) · mouse wheel zooms · WASD or arrows pan · Space pauses · 1, 2, 3 set the speed</div>
    <div class="proj"><div class="between"><b>Test mode</b><button data-act="test">${S.test?'Turn off':'Turn on'}</button></div><div class="dim" style="font-size:12px">Unlimited silver and goods, everything costs nothing. It changes this colony for good, so start a new colony afterwards for a clean run.</div>${S.test?`<div class="row" style="gap:5px"><button data-act="tcon">Finish construction</button><button data-act="tres">All research</button><button data-act="tland">Clear all land</button><button data-act="tcol">Add colonist</button><button data-act="twand">Wanderer</button><button data-act="tcar">Caravan</button><button data-act="torb">Orbital trader</button><button data-act="traid" data-v="small">Small raid</button><button data-act="traid" data-v="big">Big raid</button><button data-act="traid" data-v="small" data-f="tribal">Tribals</button><button data-act="traid" data-v="small" data-f="industrial">Pirates</button><button data-act="traid" data-v="small" data-f="space">Space pirates</button><button data-act="traid" data-v="small" data-f="insect">Insectoids</button><button data-act="tday">Skip a day</button></div>`:''}</div>
    ${isStandalone?'':`<div class="row"><button data-act="install">${installEvt?'Install as app':'How to install as an app'}</button></div>`}
    <h4>Saves</h4>${slotsHTML()}
    ${gfxMenuHTML()}
    <h4>Storyteller</h4>
    <label class="row"><span class="lbl">Events</span><select data-chg="opt" data-v="story">${Object.keys(STORY).map(k=>`<option value="${k}" ${opt('story')===k?'selected':''}>${STORY[k].n}</option>`).join('')}</select></label>
    <label class="row"><input type="checkbox" data-chg="opt" data-v="hardcore" ${opt('hardcore')?'checked':''}> Hardcore: colonists can die on expeditions and against bosses</label>
    <h4>Notifications</h4>
    <div class="chips">${[['t_build','Building'],['t_trade','Trade'],['t_skill','Skills'],['t_weather','Weather'],['t_raid','Raids'],['t_colony','Colony']].map(([k,l])=>`<label class="chip" style="cursor:pointer"><input type="checkbox" data-chg="opt" data-v="${k}" ${opt(k)?'checked':''}> ${l}</label>`).join('')}</div>
    <label class="row"><input type="checkbox" data-chg="opt" data-v="pauseRaid" ${opt('pauseRaid')?'checked':''}> Pause when a raid is announced</label>
    <label class="row"><input type="checkbox" data-chg="opt" data-v="pauseEvent" ${opt('pauseEvent')?'checked':''}> Pause on events that need a decision</label>
    <div class="dim" style="font-size:11.5px">Unticked categories hide their pop-up messages. Letters and warnings still arrive.</div>
    <h4>Sound</h4>
    <label class="row"><input type="checkbox" data-chg="snd" ${SND.on?'checked':''}> Sound on</label>
    <label class="row"><span class="lbl">Music</span><input type="range" min="0" max="100" value="${Math.round(SND.mv*100)}" data-chg="mvol" aria-label="Music volume" style="flex:1"></label>
    <label class="row"><span class="lbl">Effects</span><input type="range" min="0" max="100" value="${Math.round(SND.sv*100)}" data-chg="svol" aria-label="Effects volume" style="flex:1"></label>
    <div class="row"><button data-act="tutreset">Restart guide</button></div>
    <div class="row"><button data-act="save">Save now</button>${resetArm?'<button data-act="reset2" style="border-color:var(--bad);color:var(--bad)">Yes, start over</button><button data-act="reset0">Keep playing</button>':'<button data-act="reset1">Start a new colony</button>'}</div>
    <div class="dim">Harvests ${fmt(S.stats.harvests||0)} · crafted ${fmt(S.stats.crafted||0)} · animals born ${fmt(S.stats.born||0)} · silver earned ${fmt(S.stats.earned||0)} · moves ${S.reloc}</div>`;
  }
  el.hidden=false;setHTML(el,h);
}

function renderModal(){
  const wrap=$('modalwrap'),el=$('modal');
  if(!modal){wrap.hidden=true;el._h='';return}
  el.classList.toggle('narrow',modal.k==='letter'||modal.k==='away');
  let h='';
  if(modal.k==='letter'){
    const l=modal.l;
    h+=`<h3>${esc(l.title)}</h3><p>${esc(l.text)}</p><div class="row">`;
    if(l.k==='join'){const full=S.cols.length>=bedCount();h+=`<button data-act="accept" ${full?'disabled':''}>Accept</button><button data-act="reject">Turn away</button><button data-act="close">Decide later</button>${full?'<span class="bad">Needs a free bed. Build or upgrade housing.</span>':''}`}
    else if(l.k==='trade'||l.k==='orbital')h+=`${trader(l.data.who)?`<button data-act="trade" data-v="${l.data.who}">Open trade</button>`:''}<button data-act="dismiss" data-id="${l.id}">Close</button>`;
    else if(l.k==='event'&&l.data.choices&&!l.data.done)h+=l.data.choices.map((c,i)=>`<button data-act="evc" data-id="${l.id}" data-v="${c[1]}">${esc(c[0])}</button>`).join('');
    else if(l.k==='raid')h+=`${S.raid&&S.raid.phase==='warn'&&S.raid.demand?`<button data-act="payraid" ${S.silver<S.raid.demand&&!S.test?'disabled':''}>Pay ${fmt(S.raid.demand)} silver</button>`:''}<button data-act="tab" data-v="defense">Open defense</button><button data-act="dismiss" data-id="${l.id}">Close</button>`;
    else if(l.k==='contract')h+=`<button data-act="tab" data-v="contracts">Open orders</button><button data-act="dismiss" data-id="${l.id}">Close</button>`;
    else if(l.k==='chunk'){const o=S.outside.find(o=>o.k==='chunk'&&!o.mark);h+=`${o?`<button data-act="markchunks" data-id="${l.id}">Mark all chunks for salvage</button>`:''}<button data-act="dismiss" data-id="${l.id}">Close</button>`}
    else h+=`<button data-act="dismiss" data-id="${l.id}">OK</button>`;
    h+=`</div>`;
  }else if(modal.k==='trade'){
    const tr=trader(modal.who);if(!tr){modal=null;renderModal();return}
    const pm=priceMul(tr);
    h+=`<div class="between"><h3>${modal.who==='orbital'?'Orbital trader ':'Caravan from '}${esc(tr.name)}</h3><button data-act="close" aria-label="Close">✕</button></div>
    <div class="row"><img src="${icon('silver')}" alt="" style="width:20px"><b class="num">${fmt(S.silver)}</b> silver<span class="dim">· leaves in ${fmtTime(tr.until-S.t)} · pays ${Math.round(pm*100)}% of value</span></div>`;
    if(tr.req){const r=S.requests.find(r=>r.id===tr.req);if(r)h+=`<div class="req"><b>Their request: ${r.n} ${ITEMS[r.i].n.toLowerCase()}</b><div class="row"><span>You have ${fmt(cnt(r.i))}. They pay ${fmt(r.n*ITEMS[r.i].v*r.mult*(1+.1*S.renown))} silver (${Math.round(r.mult*100)}%).</span><button data-act="fulfill" ${cnt(r.i)<r.n?'disabled':''}>Hand over</button></div></div>`}
    h+=`<div class="cols2"><div><h4>Sell goods</h4><div class="tablewrap"><table><tbody>`;
    let any=false;
    for(const i in ITEMS){const n=Math.floor(cnt(i));if(n<=0)continue;any=true;h+=`<tr><td><img src="${icon(i)}" alt=""> ${ITEMS[i].n}</td><td class="n">${fmt(n)}</td><td class="n dim">${(ITEMS[i].v*pm).toFixed(2)}</td><td><span class="row" style="flex-wrap:nowrap;gap:3px"><button data-act="sell" data-v="${i}" data-n="10">10</button><button data-act="sell" data-v="${i}" data-n="999999">All</button></span></td></tr>`}
    if(!any)h+=`<tr><td class="dim">Nothing in storage.</td></tr>`;
    h+=`</tbody></table></div><h4 style="margin-top:10px">Sell animals</h4><div class="tablewrap"><table><tbody>`;
    let anyA=false;for(const t in ANIMALS){const n=S.ani.filter(a=>a.type===t&&a.age>=ANIMALS[t].adult).length;if(!n)continue;anyA=true;h+=`<tr><td>${ANIMALS[t].n}</td><td class="n">${n} adult</td><td class="n dim">${fmt(ANIMALS[t].price*.75*pm)}</td><td><button data-act="sella" data-v="${t}">Sell 1</button></td></tr>`}
    if(!anyA)h+=`<tr><td class="dim">No adult animals.</td></tr>`;
    h+=`</tbody></table></div></div><div><h4>Seed stock</h4><div class="dim" style="font-size:11.5px;margin:4px 0">Buy a seed type once and your farms grow it for good.</div><div class="tablewrap"><table><tbody>`;
    for(const k of tr.stock.seeds){const c=CROPS[k],have=owns(k);h+=`<tr><td><img src="${icon('seed')}" alt=""> ${c.n}</td><td class="dim" style="font-size:11.5px">${fmtTime(c.grow)} · yield ${c.yield}</td><td class="n">${have?'':c.unlock}</td><td>${have?'<span class="good" style="font-size:12px">Owned</span>':`<button data-act="buys" data-v="${k}" ${S.silver<c.unlock?'disabled':''}>Buy</button>`}</td></tr>`}
    h+=`</tbody></table></div><h4 style="margin-top:10px">Buy materials</h4><div class="tablewrap"><table><tbody>`;
    for(const i in tr.stock.goods){const n=tr.stock.goods[i];if(!n)continue;h+=`<tr><td><img src="${icon(i)}" alt=""> ${ITEMS[i].n}</td><td class="n dim">${n} left</td><td class="n">${(ITEMS[i].v*1.4).toFixed(1)} ea</td><td><span class="row" style="flex-wrap:nowrap;gap:3px"><button data-act="buyg" data-v="${i}" data-n="${i==='comp'?1:10}">${i==='comp'?1:10}</button><button data-act="buyg" data-v="${i}" data-n="999999">All</button></span></td></tr>`}
    h+=`</tbody></table></div><h4 style="margin-top:10px">Buy animals</h4><div class="tablewrap"><table><tbody>`;
    for(const t in tr.stock.animals){const n=tr.stock.animals[t],d=ANIMALS[t];h+=`<tr><td>${d.n}<div class="dim" style="font-size:11px">${d.space} space · ${d.pcount} ${ITEMS[d.prod].n.toLowerCase()} / ${fmtTime(d.ptime)}</div></td><td class="n dim">${n} left</td><td class="n">${d.price}</td><td><button data-act="buya" data-v="${t}" ${n<=0?'disabled':''}>Buy</button></td></tr>`}
    h+=`</tbody></table></div>`;
    {const pc=promoCost();h+=`<h4 style="margin-top:10px">Spread the word</h4><div class="row" style="flex-wrap:nowrap"><span class="dim" style="font-size:12px">${tr.promo?'They will tell travellers about you.':`Pay ${pc} silver and they tell travellers about your colony. A skilled wanderer soon turns up at the gate.`}</span><button data-act="promo" ${tr.promo||S.silver<pc?'disabled':''}>${tr.promo?'Paid':'Pay '+pc}</button></div>`}
    const o=relocOffer();if(o.via===modal.who)h+=`<h4 style="margin-top:10px">Transport</h4><div class="row"><span>${o.n}</span><button data-act="choosebiome" ${canRelocate()?'':'disabled'}>Buy</button><span class="dim">see World tab</span></div>`;
    h+=`</div></div>`;
  }else if(modal.k==='biome'){
    const o=relocOffer();
    h+=`<div class="between"><h3>Where to?</h3><button data-act="close" aria-label="Close">✕</button></div><p class="dim">${o.n}: ${fmt(o.silver)} silver and ${Object.keys(o.items).map(i=>o.items[i]+' '+ITEMS[i].n.toLowerCase()).join(', ')}. Pick who comes along (${o.seats||4} seats) and the biome of your next site. Research and relics stay with you, and this site earns <b class="good">+${legacyEarn()} legacy points</b>. The move starts <b>Era ${Math.min(ERAS.length,S.reloc+2)}: ${ERAS[Math.min(ERAS.length-1,S.reloc+1)]}</b>${eraUnlocks(S.reloc+1).length?`, which unlocks ${eraUnlocks(S.reloc+1).join(', ')}`:''}.</p><div class="chips">${S.cols.map(c=>`<button class="chip${modal.pick.has(c.id)?' ok':''}" data-act="pickcol" data-v="${c.id}">${modal.pick.has(c.id)?'✓ ':''}${esc(c.nick)}</button>`).join('')}</div><div class="dim" style="font-size:12px">${modal.pick.size}/${o.seats||4} seats taken. Colonists left behind stay here.</div><div class="biomes">`;
    for(const bk in BIOMES){if(bk==='temperate')continue;const b=BIOMES[bk],[c,r]=siteSize(bk,S.reloc+1),pal=b.pal;
      h+=`<div class="biome"><div class="swatch" style="background:linear-gradient(90deg,${rgb(pal.out,0)},${rgb(pal.in,0)} 60%,${rgb(pal.alt,0)})"></div><b>${b.n}</b><div class="dim">${c}×${r} plots (${c*r})</div><ul>${b.pros.map(x=>`<li class="good">${x}</li>`).join('')}${b.cons.map(x=>`<li class="bad">${x}</li>`).join('')}</ul><button data-act="relocate" data-v="${bk}">Settle here</button></div>`}
    h+=`</div>`;
  }else if(modal.k==='cust'){h+=custHTML();
  }else if(modal.k==='exped'){h+=xplanHTML();
  }else if(modal.k==='install'){
    const inFrame=(()=>{try{return window.top!==window}catch(e){return true}})();
    h+=`<div class="between"><h3>Install Dustwool Ranch</h3><button data-act="close" aria-label="Close">✕</button></div>`;
    if(inFrame)h+=`<p>This copy runs inside claude.ai and cannot be installed. Open the game at <b>frameson0.github.io/dustwool-ranch</b> in Chrome and install it from there.</p>`;
    else h+=`<p><b>Android, Chrome:</b> tap the ⋮ menu at the top right and choose <b>Install app</b> (on some phones <b>Add to Home screen</b>, then <b>Install</b>). If it is missing, reload the page once and wait a few seconds.</p><p><b>iPhone, Safari:</b> tap Share and choose <b>Add to Home Screen</b>.</p><p><b>Desktop Chrome or Edge:</b> click the install icon at the right end of the address bar.</p><p class="dim">Your save stays in this browser's storage. Clearing the browser data deletes it, so export a backup first.</p>`;
    h+=`<div class="row"><button data-act="close">OK</button></div>`;
  }else if(modal.k==='away'){
    h+=`<h3>While you were away</h3><p>Your colonists kept working for ${fmtTime(modal.sec)}${modal.capped?' (the first 4 hours count)':''}.</p>`;
    h+=modal.lines.length?`<div class="tablewrap"><table><tbody>${modal.lines.map(([i,n,d])=>`<tr><td><img src="${icon(i)}" alt=""> ${n}</td><td class="n ${d>0?'good':'bad'}">${d>0?'+':''}${fmt(d)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="dim">Nothing changed much.</p>';
    if(modal.notes&&modal.notes.length)h+=modal.notes.map(n=>`<p class="warn">${esc(n)}</p>`).join('');
    h+=`<div class="row"><button data-act="close">Back to the ranch</button></div>`;
  }
  wrap.hidden=false;setHTML(el,h);
}
function closeModal(){modal=null;renderModal()}
function openLetter(l){modal={k:'letter',l};renderModal()}
function updateHint(){
  const el=$('hint');
  if(trapMode&&!(dragCol&&dragCol.moved)){el.hidden=false;setHTML(el,trapMode==='remove'?'Click traps to remove them. Esc stops.':`Placing ${TRAPS[trapMode].n.toLowerCase()}s: click or drag outside the wall. Esc stops.`);return}
  if(landMode&&!(dragCol&&dragCol.moved)){el.hidden=false;setHTML(el,`Pick a highlighted plot to clear (${esc(costStr(expandCost()))}). Builders fell the trees, break the rocks and extend the wall. Esc cancels.`);return}
  if(gateMode&&!(dragCol&&dragCol.moved)){el.hidden=false;setHTML(el,`Click a straight stretch of wall to place a gate (${esc(costStr(gateCost()))}). Esc cancels.`);return}
  if(dragCol&&dragCol.moved){el.hidden=false;setHTML(el,typeof dragCol.target==='string'&&dragCol.target.startsWith('b:')?'Release to make them a builder: they clear this land and extend the wall':dragCol.target==='out'?'Release to make them a gatherer outside the wall':dragCol.target==='guard'?'Release to make them a guard: they patrol the wall and move to wherever raiders attack':dragCol.target!==null?'Release to work at '+esc(assignTargetName(dragCol.target)):'Drop on a work plot, a storage plot (hauler) or the land outside. Elsewhere unassigns.')}
  else el.hidden=true;
}
function uiOvBtn(){const b=$('ovbtn');b.classList.toggle('on',ovMode);setHTML(b,ovMode?'<svg viewBox="0 0 16 16"><path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/></svg>Back to the base':'<svg viewBox="0 0 16 16"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/></svg>Surroundings')}
const HIC=['<svg viewBox="0 0 12 12"><rect x="2" y="1" width="3" height="10" rx="1"/><rect x="7" y="1" width="3" height="10" rx="1"/></svg>','<svg viewBox="0 0 12 12"><path d="M2 1 L11 6 L2 11Z"/></svg>','<svg viewBox="0 0 20 12"><path d="M1 1 L9 6 L1 11Z M10 1 L18 6 L10 11Z"/></svg>','<svg viewBox="0 0 28 12"><path d="M1 1 L8 6 L1 11Z M9 1 L16 6 L9 11Z M17 1 L24 6 L17 11Z"/></svg>'];
function uiHud(){if(!MOB)return;const d=Math.floor(S.t/DAY),se=['Spring','Summer','Fall','Winter'][Math.floor(d/15)%4],hr=Math.floor((S.t%DAY)/DAY*24);
  const st=S.raid?`<small class="bad">${S.raid.phase==='warn'?'Raid in '+fmtTime(S.raid.at-S.t):'Raid: '+aliveRaiders().length+' left'}</small>`:`<small>${wxName()} · ${esc(S.site.name)}</small>`;
  setHTML($('mhud'),`<div class="dt"><b>Day ${d%15+1} ${se} · ${String(hr).padStart(2,'0')}h</b>${st}</div><span class="sv">${fmt(S.silver)}</span><div class="spd">${HIC.map((ic,i)=>`<button data-act="speed" data-v="${i}" class="${S.speed===i?'on':''}" aria-label="Speed ${i}">${ic}</button>`).join('')}</div>${installEvt&&!isStandalone?'<button class="mb" data-act="install" aria-label="Install app"><svg viewBox="0 0 12 12"><path d="M5 1h2v5h2L6 9 3 6h2z"/><rect x="1.5" y="10" width="9" height="1.4" rx=".7"/></svg></button>':''}<button class="mb" data-act="side" aria-label="Overview"><svg viewBox="0 0 12 12"><rect x="1" y="2" width="10" height="1.6" rx=".8"/><rect x="1" y="5.2" width="10" height="1.6" rx=".8"/><rect x="1" y="8.4" width="10" height="1.6" rx=".8"/></svg></button>`)}
let raidKey='';
function uiRaid(){const el=$('raidcard'),R0=S.raid;if(!R0||cine||(R0.phase==='active'&&!R0.flee&&false)){el.hidden=true;raidKey='';return}
  const F=RFAC[R0.fac||'tribal'],cm=R0.comp||[],ct=k=>cm.filter(x=>x.v===k).length,ca=cm.filter(x=>x.kind==='archer').length;
  let h='';if(R0.phase==='warn'){h+=`<div class="between"><b class="bad">${F.n} · ${R0.total}</b><span class="num">${fmtTime(R0.at-S.t)}</span></div>`;
    const TC=TACTICS[R0.tac||'rush'];h+=`<div style="font-size:12px"><b>Tactic: ${TC.n}</b> · <span class="dim">${TC.d}</span></div>`;
    if(R0.siege&&R0.siege.length){const ec={};for(const e of R0.siege)ec[e]=(ec[e]||0)+1;h+=`<div style="font-size:12px" class="warn">Siege engines: ${Object.keys(ec).map(k=>ec[k]+' '+ENGINES[k].n.toLowerCase()+(ec[k]>1?'s':'')).join(', ')}</div>`}
    if(F.mech){const mc={};for(const x of cm)mc[x.mech]=(mc[x.mech]||0)+1;h+=`<div style="font-size:12px">${esc(R0.f)} from the ${R0.sides.map(x=>SIDEN[x]).join(' and ')} · ${Object.keys(mc).map(k=>mc[k]+' '+MECH[k].n.toLowerCase()+(mc[k]>1?'s':'')).join(', ')}</div>`}else
    h+=`<div style="font-size:12px">${esc(R0.f)} from the ${R0.sides.map(x=>SIDEN[x]).join(' and ')} · ${ct('light')} light, ${ct('std')} standard, ${ct('heavy')} heavy${F.insect?'':` · ${ca} ${R0.fac==='tribal'?'archers':'shooters'}, ${cm.length-ca} melee`}</div>`;
    h+=`<div class="row" style="gap:5px">${S.speed===0?'<button data-act="rplay">▶ Resume</button>':''}<button data-act="ralarm" ${R0.alarm?'disabled':''}>${R0.alarm?'Alarm raised':'Raise the alarm'}</button><button data-act="rrecall">${R0.recall?'Back to work':'Everyone inside'}</button>${Object.keys(S.traps).length?`<button data-act="rtraps" ${R0.traps?'disabled':''}>Re-arm traps</button>`:''}${R0.demand?`<button data-act="payraid" ${S.silver<R0.demand&&!S.test?'disabled':''}>Pay ${fmt(R0.demand)}</button>`:''}<button data-act="tab" data-v="defense">Defense</button></div>`}
  else{const al=aliveRaiders().filter(r=>!r.engine).length,eng=aliveRaiders().filter(r=>r.engine&&!r.idle).length,wv=aliveRaiders().filter(r=>r.hold).length;h+=`<div class="between"><b class="bad">${R0.boss?esc(R0.boss.n):F.n}</b><span>${al} left · ${R0.killed} down${eng?' · '+eng+' engine'+(eng>1?'s':'')+' firing':''}${R0.flee?' · fleeing':''}</span></div>`;
    {const st=(R0.tac==='siege'||R0.tac==='skirmish')&&!R0.go?(R0.tac==='siege'?(R0.bomb?'Shelling the wall, then they storm…':'Gathering out of range…'):'Their shooters are sniping…'):wv?`${R0.tac==='flank'?'Second group':'Main army'} (${wv}) in ${fmtTime(Math.max(0,R0.start+(R0.waveT||35)-S.t))}`:'';if(st)h+=`<div class="dim" style="font-size:12px">${TACTICS[R0.tac].n}: ${st}</div>`}
    if(R0.boss){const bt=R0.raiders.find(r=>r.boss);if(bt)h+=`<div class="bossbar"><i style="width:${Math.max(0,bt.hp/bt.max*100)}%"></i><span>${esc(R0.boss.n)}</span></div>`}}
  setHTML(el,h);el.hidden=false;if(R0.id+R0.phase!==raidKey){raidKey=R0.id+R0.phase;popEl(el)}}
function updateUI(){updateTut();uiRaid();uiExp();uiHud();uiOvBtn();uiSide();uiPawnbar();uiMsgs();uiLetters();uiInspect();uiPanel();updateHint();if(modal&&modal.k==='trade')renderModal()}

