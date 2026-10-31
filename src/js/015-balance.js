/* ================= balance pass =================
   Scales the base data tables by the BAL knobs from 005-config.js. Runs once, right after the tables exist. */
(function applyBalance(){
  const sc=o=>{if(!o)return;if(o.cost)o.cost=Math.round(o.cost*BAL.build);if(o.mat)for(const k in o.mat)o.mat[k]=Math.ceil(o.mat[k]*BAL.mats)};
  for(const k in PLOTS)PLOTS[k].tiers.forEach(sc);
  for(const k in WINGS)WINGS[k].tiers.forEach(sc);
  for(const k in LANES)sc(LANES[k]);for(const k in WPLOTS)sc(WPLOTS[k]);WALLS.forEach(sc);
  for(const r of RESEARCH)r.cost=Math.round(r.cost*BAL.research);
  for(const k in CROPS)CROPS[k].yield=Math.max(1,Math.round(CROPS[k].yield*BAL.crop));
})();
const ERAS=['Frontier','Settlement','Industry','Starfaring'];
function era(){return Math.min(ERAS.length-1,S&&S.reloc||0)}
