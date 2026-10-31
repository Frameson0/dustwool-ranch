/* ================= config: version and balance =================
   VERSION: 1.0.x for small updates, 1.x for bigger ones.
   BAL holds the pacing knobs. Data tables in 010-constants keep their base values;
   applyBalance() (015-balance.js) scales them once at start-up, so tuning happens here only. */
const VERSION='1.0.0';
const BAL={
  research:2.8,      // research point cost multiplier
  build:1.35,        // silver cost of plots, wings, lanes, wall plots, defenses
  mats:1.25,         // material cost of the same
  sell:.85,          // what traders pay for your goods
  crop:.9,           // crop yield
  xp:.75,            // skill learning speed
  join:1.5,          // time between wanderers asking to join
  raidPatience:1.6,  // how long raiders keep fighting before they give up
  raidFlee:.75,      // share of a raid that must fall before the rest flee
};
