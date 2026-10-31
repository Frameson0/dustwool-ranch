/* ================= constants & defs ================= */
const T=32,P=5,G=8,GAP=G-P,GU=(G-P+1)>>1,MID=P+((G-P)>>1),OX=12,OY=8,DAY=300;
const DIR4=[[1,0],[-1,0],[0,1],[0,-1]];
const OUT='#15120e';
const SAVE_KEY='dustwool-ranch-save-v3';

const ITEMS={
  potato:{n:'Potatoes',v:1.1,food:.05},rice:{n:'Rice',v:1.0,food:.05},corn:{n:'Corn',v:1.3,food:.05},hay:{n:'Hay',v:.5},
  cotton:{n:'Cotton',v:1.5},egg:{n:'Eggs',v:1.6,food:.06},milk:{n:'Milk',v:2.0},wool:{n:'Shaggox wool',v:2.6},
  wood:{n:'Wood',v:1.2},stone:{n:'Stone blocks',v:1.5},comp:{n:'Components',v:30},
  meat:{n:'Raw meat',v:1.4,food:.05},leather:{n:'Leather',v:2.4},steel:{n:'Steel',v:2.8},
  meal:{n:'Simple meal',v:16,food:.9,table:true},finemeal:{n:'Fine meal',v:28,food:1.1,table:true},cheese:{n:'Cheese wheel',v:42},
  parka:{n:'Wool parka',v:125},duster:{n:'Leather duster',v:140},
  bow:{n:'Short bow',v:30,weapon:true},spear:{n:'Wooden spear',v:22,weapon:true},recurve:{n:'Recurve bow',v:75,weapon:true},steelspear:{n:'Steel spear',v:70,weapon:true},rifle:{n:'Bolt-action rifle',v:260,weapon:true},
  woodarmor:{n:'Wooden chest plate',v:40,armor:true},leatherarmor:{n:'Leather armor',v:120,armor:true},helmet:{n:'Steel helmet',v:90,armor:true},flakvest:{n:'Flak vest',v:240,armor:true},
  assault:{n:'Assault rifle',v:420,weapon:true},sniper:{n:'Sniper rifle',v:560,weapon:true},lmg:{n:'Light machine gun',v:780,weapon:true},charge:{n:'Charge rifle',v:1400,weapon:true},
  longsword:{n:'Longsword',v:220,weapon:true},warhammer:{n:'Warhammer',v:340,weapon:true},zweihander:{n:'Zweihander',v:520,weapon:true},monosword:{n:'Monosword',v:1300,weapon:true},
  plate:{n:'Plate armor',v:480,armor:true},advhelmet:{n:'Advanced helmet',v:260,armor:true},recon:{n:'Recon armor',v:900,armor:true},marine:{n:'Marine armor',v:1800,armor:true},marinehelm:{n:'Marine helmet',v:700,armor:true},
  chemfuel:{n:'Chemfuel',v:2.4},shell:{n:'Mortar shell',v:30},mine:{n:'Landmine',v:28},plasteel:{n:'Plasteel',v:9},acomp:{n:'Advanced components',v:180},schem:{n:'Tech schematics',v:250},datadisk:{n:'Data disk',v:60},mechpart:{n:'Mech parts',v:45},seeds:{n:'Rare seeds',v:25},
};
const ICAT={food:['potato','rice','corn','egg','milk','meat','meal','finemeal','cheese'],mat:['hay','cotton','wool','leather','wood','stone','steel','chemfuel','plasteel','comp','acomp','schem','datadisk','mechpart','seeds'],gear:['parka','duster','bow','spear','recurve','steelspear','rifle','assault','sniper','lmg','charge','longsword','warhammer','zweihander','monosword','woodarmor','leatherarmor','helmet','flakvest','plate','advhelmet','recon','marine','marinehelm'],mil:['shell','mine']};
const ICATN={food:'Food',mat:'Materials',gear:'Apparel & gear',mil:'Munitions'};
const BUYABLE=['wood','stone','steel','leather','comp','chemfuel','plasteel'];
function isGear(i){return !!(ITEMS[i]&&(ITEMS[i].weapon||ITEMS[i].armor))}
const WEAPONS={charge:{range:24,acc:.25,aim:1},lmg:{range:20,acc:.05,aim:.45,burst:true},sniper:{range:32,acc:.35,aim:3.2},assault:{range:21,acc:.12,aim:.8},rifle:{range:26,acc:.2,aim:2.5},recurve:{range:17,acc:.08,aim:1.1},bow:{range:14,acc:0,aim:1.25},monosword:{range:1.6,acc:.4,aim:1},zweihander:{range:1.6,acc:.3,aim:1.4},warhammer:{range:1.6,acc:.25,aim:1.3},longsword:{range:1.6,acc:.3,aim:1.1},steelspear:{range:1.6,acc:.25,aim:1.3},spear:{range:1.6,acc:.15,aim:1.5}};
const WILD={hare:{n:'Hare',meat:6,leather:2,speed:.9,size:.5},deer:{n:'Deer',meat:24,leather:8,speed:.7,size:1},boar:{n:'Wild boar',meat:30,leather:10,speed:.6,size:1}};
const CROPS={
  potato:{n:'Potatoes',item:'potato',grow:70,yield:8,unlock:0},
  haygrass:{n:'Haygrass',item:'hay',grow:55,yield:14,unlock:35},
  rice:{n:'Rice',item:'rice',grow:48,yield:6,unlock:60},
  corn:{n:'Corn',item:'corn',grow:140,yield:20,unlock:120},
  cotton:{n:'Cotton',item:'cotton',grow:100,yield:10,unlock:180,req:'cotton'},
  tree:{n:'Trees',item:'wood',grow:200,yield:24,unlock:0,hidden:true},
};
const ANIMALS={
  chicken:{n:'Chicken',pl:'Chickens',space:2,eat:.4,prod:'egg',ptime:55,pcount:1,ground:true,adult:120,gest:110,price:35,speed:1.6,work:'Collecting eggs from'},
  goat:{n:'Goat',pl:'Goats',space:4,eat:1.5,prod:'milk',ptime:80,pcount:7,adult:200,gest:200,price:110,speed:1.4,work:'Milking'},
  shaggox:{n:'Shaggox',pl:'Shaggoxen',space:8,eat:3,prod:'wool',ptime:160,pcount:28,adult:300,gest:320,price:320,speed:1.1,work:'Shearing'},
};
const RECIPES={
  meal:{n:'Cook simple meals',out:'meal',outN:1,in:[{any:['potato','rice','corn','egg','meat'],n:6}],work:8,sk:'cooking',d:'6 vegetables, eggs or meat'},
  finemeal:{n:'Cook fine meals',out:'finemeal',outN:1,in:[{any:['potato','rice','corn'],n:4},{any:['egg','milk','meat'],n:3}],work:12,sk:'cooking',d:'4 vegetables + 3 eggs, milk or meat'},
  cheese:{n:'Make cheese wheels',out:'cheese',outN:1,in:[{any:['milk'],n:10}],work:12,sk:'cooking',req:'cheese',d:'10 milk'},
  parka:{n:'Tailor wool parkas',out:'parka',outN:1,in:[{any:['wool','cotton'],n:30}],work:24,sk:'crafting',req:'tailoring',d:'30 wool or cotton'},
  duster:{n:'Sew leather dusters',out:'duster',outN:1,in:[{any:['leather'],n:25}],work:22,sk:'crafting',d:'25 leather'},
  bow:{n:'Make short bows',out:'bow',outN:1,in:[{any:['wood'],n:20}],work:12,sk:'crafting',d:'20 wood'},
  spear:{n:'Make wooden spears',out:'spear',outN:1,in:[{any:['wood'],n:15},{any:['stone'],n:5}],work:10,sk:'crafting',d:'15 wood + 5 stone'},
  woodarmor:{n:'Make wooden chest plates',out:'woodarmor',outN:1,in:[{any:['wood'],n:35}],work:16,sk:'crafting',d:'35 wood'},
  recurve:{n:'Forge recurve bows',out:'recurve',outN:1,in:[{any:['wood'],n:25},{any:['leather'],n:6}],work:18,sk:'crafting',d:'25 wood + 6 leather'},
  steelspear:{n:'Forge steel spears',out:'steelspear',outN:1,in:[{any:['steel'],n:15},{any:['wood'],n:8}],work:16,sk:'crafting',d:'15 steel + 8 wood'},
  rifle:{n:'Build bolt-action rifles',out:'rifle',outN:1,in:[{any:['steel'],n:40},{any:['wood'],n:10},{any:['comp'],n:1}],work:36,sk:'crafting',d:'40 steel + 10 wood + 1 component'},
  assault:{n:'Build assault rifles',out:'assault',outN:1,in:[{any:['steel'],n:50},{any:['comp'],n:3}],work:44,sk:'crafting',tier:1,req:'advsmith',d:'50 steel + 3 components'},
  longsword:{n:'Forge longswords',out:'longsword',outN:1,in:[{any:['steel'],n:30},{any:['wood'],n:5}],work:26,sk:'crafting',tier:1,d:'30 steel + 5 wood'},
  sniper:{n:'Build sniper rifles',out:'sniper',outN:1,in:[{any:['steel'],n:60},{any:['comp'],n:4}],work:55,sk:'crafting',tier:2,req:'machining',d:'60 steel + 4 components'},
  warhammer:{n:'Forge warhammers',out:'warhammer',outN:1,in:[{any:['steel'],n:45}],work:30,sk:'crafting',tier:2,req:'machining',d:'45 steel'},
  lmg:{n:'Build light machine guns',out:'lmg',outN:1,in:[{any:['steel'],n:80},{any:['comp'],n:6}],work:70,sk:'crafting',tier:3,req:'machining',d:'80 steel + 6 components'},
  zweihander:{n:'Forge zweihanders',out:'zweihander',outN:1,in:[{any:['steel'],n:60},{any:['plasteel'],n:10}],work:44,sk:'crafting',tier:3,req:'machining',d:'60 steel + 10 plasteel'},
  charge:{n:'Fabricate charge rifles',out:'charge',outN:1,in:[{any:['plasteel'],n:40},{any:['acomp'],n:2},{any:['comp'],n:4}],work:90,sk:'crafting',tier:4,req:'advfab',d:'40 plasteel + 2 advanced comp. + 4 comp.'},
  monosword:{n:'Fabricate monoswords',out:'monosword',outN:1,in:[{any:['plasteel'],n:30},{any:['acomp'],n:1}],work:70,sk:'crafting',tier:4,req:'advfab',d:'30 plasteel + 1 advanced component'},
  plate:{n:'Forge plate armor',out:'plate',outN:1,in:[{any:['steel'],n:60}],work:44,sk:'crafting',tier:2,req:'machining',d:'60 steel'},
  advhelmet:{n:'Make advanced helmets',out:'advhelmet',outN:1,in:[{any:['steel'],n:30},{any:['comp'],n:2}],work:32,sk:'crafting',tier:2,req:'machining',d:'30 steel + 2 components'},
  recon:{n:'Make recon armor',out:'recon',outN:1,in:[{any:['plasteel'],n:30},{any:['steel'],n:30},{any:['comp'],n:4}],work:70,sk:'crafting',tier:3,req:'machining',d:'30 plasteel + 30 steel + 4 comp.'},
  marine:{n:'Fabricate marine armor',out:'marine',outN:1,in:[{any:['plasteel'],n:60},{any:['acomp'],n:2},{any:['comp'],n:6}],work:110,sk:'crafting',tier:4,req:'advfab',d:'60 plasteel + 2 adv. comp. + 6 comp.'},
  marinehelm:{n:'Fabricate marine helmets',out:'marinehelm',outN:1,in:[{any:['plasteel'],n:30},{any:['acomp'],n:1}],work:60,sk:'crafting',tier:4,req:'advfab',d:'30 plasteel + 1 advanced component'},
  chemfuel:{n:'Refine chemfuel from wood',out:'chemfuel',outN:6,in:[{any:['wood'],n:20}],work:14,sk:'crafting',d:'20 wood → 6 chemfuel'},
  chemhay:{n:'Refine chemfuel from hay',out:'chemfuel',outN:5,in:[{any:['hay'],n:30}],work:14,sk:'crafting',d:'30 hay → 5 chemfuel'},
  shell:{n:'Make mortar shells',out:'shell',outN:2,in:[{any:['steel'],n:8},{any:['chemfuel'],n:5}],work:16,sk:'crafting',d:'8 steel + 5 chemfuel → 2 shells'},
  mine:{n:'Make landmines',out:'mine',outN:1,in:[{any:['steel'],n:6},{any:['chemfuel'],n:4}],work:14,sk:'crafting',d:'6 steel + 4 chemfuel'},
  comp:{n:'Fabricate components',out:'comp',outN:1,in:[{any:['steel'],n:15},{any:['chemfuel'],n:2}],work:34,sk:'crafting',d:'15 steel + 2 chemfuel'},
  acomp:{n:'Fabricate advanced components',out:'acomp',outN:1,in:[{any:['comp'],n:2},{any:['plasteel'],n:10},{any:['chemfuel'],n:4}],work:60,sk:'crafting',tier:1,req:'advfab',d:'2 comp. + 10 plasteel + 4 chemfuel'},
  leatherarmor:{n:'Make leather armor',out:'leatherarmor',outN:1,in:[{any:['leather'],n:30}],work:22,sk:'crafting',d:'30 leather'},
  helmet:{n:'Forge steel helmets',out:'helmet',outN:1,in:[{any:['steel'],n:25}],work:20,sk:'crafting',d:'25 steel'},
  flakvest:{n:'Build flak vests',out:'flakvest',outN:1,in:[{any:['steel'],n:30},{any:['comp'],n:3}],work:40,sk:'crafting',tier:1,req:'advsmith',d:'30 steel + 3 components'},
};
const RESEARCH=[
  {id:'traderoutes',cat:'eco',n:'Trade routes',cost:180,d:'Shows when the next caravan will arrive.'},
  {id:'cotton',cat:'farm',n:'Cotton cultivation',cost:250,items:{seeds:1},d:'Traders start selling cotton seeds.'},
  {id:'tailoring',cat:'craft',n:'Tailoring',cost:350,d:'Tailors can make parkas from wool or cotton. Parkas are needed to move on.'},
  {id:'forestry',cat:'farm',n:'Forestry',cost:400,d:'Unlocks the tree farm plot: wood without leaving the walls.'},
  {id:'smithing',cat:'craft',n:'Smithing',cost:450,d:'Unlocks the weaponsmith and armorsmith plots: recurve bows, steel spears, bolt-action rifles, leather armor.'},
  {id:'cheese',cat:'craft',n:'Cheesemaking',cost:400,d:'Kitchens turn milk into cheese wheels.'},
  {id:'racks',cat:'eco',n:'Storage racks',cost:450,d:'Unlocks the Warehouse storage upgrade.'},
  {id:'breeding',cat:'farm',n:'Selective breeding',cost:500,d:'Animals breed twice as fast.'},
  {id:'fertilizer',cat:'farm',n:'Soil fertilization',cost:650,items:{seeds:2},d:'Crops grow 25% faster. Unlocks the fenced farm.'},
  {id:'hydroponics',cat:'farm',n:'Hydroponics',cost:600,era:1,items:{seeds:3,datadisk:1},d:'Grow crops in nutrient basins. Ignores biome and works underground.'},
  {id:'chemistry',cat:'craft',n:'Chemistry',cost:550,items:{datadisk:1},d:'Unlocks the refinery: chemfuel from wood or hay. Chemfuel feeds generators, munitions and fabrication.'},
  {id:'comms',cat:'eco',n:'Long-range comms',cost:800,era:1,items:{datadisk:2},d:'Comms tower with a landing pad: orbital traders land at your colony and dropships take contracts.'},
  {id:'masonry',cat:'def',n:'Fortification',cost:700,items:{datadisk:1},d:'Unlocks the reinforced wall and stone towers.'},
  {id:'advsmith',cat:'craft',n:'Advanced smithing',cost:900,pre:'smithing',items:{datadisk:1},d:'Second forge tier: assault rifles, longswords and flak vests.'},
  {id:'deepmining',cat:'eco',n:'Deep mining',cost:850,era:1,items:{datadisk:1},d:'Deep mines (quarry tier 3) can dig steel. Mining rigs in mountains and tundra also find plasteel.'},
  {id:'electricity',cat:'eco',n:'Electricity',cost:1000,pre:'chemistry',era:1,items:{datadisk:2},d:'Solar panels, burner generators and batteries. Every tier 4 building runs on power.'},
  {id:'turrets',cat:'def',n:'Auto-turrets',cost:1000,pre:'electricity',era:1,items:{mechpart:4},d:'Build auto-turrets on the wall. They hose raiders with bullets on their own.'},
  {id:'artillery',cat:'def',n:'Artillery',cost:1100,pre:'chemistry',era:1,items:{datadisk:1,mechpart:2},d:'Mortar pits on the wall-side plots and the munitions workshop for shells and landmines.'},
  {id:'machining',cat:'craft',n:'Machining',cost:1400,pre:'advsmith',era:1,items:{schem:1,datadisk:2},d:'Third forge tier: sniper rifles, warhammers, plate armor. Needs tech schematics from caravan requests.'},
  {id:'fabrication',cat:'craft',n:'Fabrication',cost:1600,pre:'electricity',era:2,items:{schem:2,mechpart:6},d:'The fabrication workshop builds components from steel and chemfuel. Needs tech schematics from caravan requests.'},
  {id:'advfab',cat:'craft',n:'Advanced fabrication',cost:3000,pre:'fabrication',era:2,items:{schem:3,plasteel:20,mechpart:8,datadisk:3},d:'Top forge tier: charge rifles, monoswords, marine armor and advanced components. Plasteel comes from orbital traders or deep mines in mountains and tundra.'},
];
const BUILD_CATS=[['Living',['housing','commons','storage']],['Food',['farm','kitchen','pen','hunting','hydro','treefarm']],['Production',['workshop','quarry','tailor','weaponsmith','armorsmith','refinery','munitions','fabrication']],['Power',['solar','burner','battery']],['Colony',['construction','research','comms']]];
const WP_CATS=[['Defense',['armory','barracks','mortar']],['Living',['bunk','shelf']],['Work',['campfire','bench']],['Trade',['tradespot']]];
const KFOOD=['potato','rice','corn','egg','milk','meat'];
const RCATN={eco:'Economy',farm:'Farming & animals',craft:'Crafting',def:'Defense'};
const WORK_TYPES=['refinery','munitions','fabrication','construction','farm','hydro','pen','kitchen','workshop','tailor','weaponsmith','armorsmith','hunting','treefarm','research','quarry','storage'];
const CRAFT_TYPES=['kitchen','workshop','tailor','weaponsmith','armorsmith','refinery','munitions','fabrication'];
const GROW_TYPES=['farm','hydro','treefarm'];
const PLOTS={
  housing:{n:'Housing',d:'Beds for colonists. Joined houses share walls and gain beds.',tiers:[
    {n:'Makeshift barracks',cost:60,beds:3},{n:'Shabby colonist homes',cost:140,mat:{wood:40},beds:5},{n:'Basic homes',cost:300,mat:{stone:60},beds:7},{n:'Modern homes',cost:650,mat:{steel:40,comp:3},beds:9,req:'electricity',power:80}]},
  farm:{n:'Farms',d:'Colonists sow and harvest crops.',tiers:[
    {n:'Basic farm',cost:50,grow:1},{n:'Irrigated farm',cost:180,mat:{stone:30},grow:1.25,note:'Irrigation channels'},{n:'Fenced farm',cost:380,mat:{wood:60},grow:1.4,yield:1.15,req:'fertilizer',note:'Fence and scarecrow'},{n:'Sprinkler farm',cost:750,mat:{steel:30,comp:4},grow:1.7,yield:1.3,req:'electricity',power:120,note:'Sprinklers'}]},
  hydro:{n:'Hydroponics',d:'Crops in nutrient basins. Unaffected by biome.',tiers:[
    {n:'Hydroponics bay',cost:340,mat:{comp:3},grow:1.4,req:'hydroponics'},{n:'Hydroponics complex',cost:650,mat:{comp:5},grow:1.7},{n:'Hydroponics array',cost:900,mat:{steel:40,comp:5},grow:1.9},{n:'Grow lab',cost:1300,mat:{steel:60,comp:8},grow:2.3,req:'electricity',power:220}]},
  pen:{n:'Ranches',d:'Animals live here. A rancher collects products and lets them breed.',tiers:[
    {n:'Animal pen',cost:40,cap:10},{n:'Fenced paddock',cost:160,mat:{wood:40},cap:20},{n:'Barn',cost:420,mat:{wood:80},cap:30,prod:1.25},{n:'Climate barn',cost:850,mat:{steel:40,comp:4},cap:40,prod:1.45,req:'electricity',power:120}]},
  kitchen:{n:'Kitchens',d:'Cooks meals and cheese. Raw food is stored in its baskets.',tiers:[
    {n:'Cooking fire',cost:60,speed:1},{n:'Kitchen',cost:220,mat:{stone:30},speed:1.4},{n:'Galley kitchen',cost:480,mat:{stone:60,comp:2},speed:1.8},{n:'Electric kitchen',cost:850,mat:{steel:40,comp:4},speed:2.3,req:'electricity',power:150}]},
  commons:{n:'Commons',d:'Colonists eat here and meals are stored here. Eating at a table gives a work bonus.',tiers:[
    {n:'Campfire circle',cost:50,buff:1.05},{n:'Dining hall',cost:220,mat:{wood:50},buff:1.08},{n:'Mess hall',cost:480,mat:{stone:60},buff:1.12},{n:'Recreation hall',cost:900,mat:{steel:40,comp:4},buff:1.17,req:'electricity',power:120}]},
  workshop:{n:'Crafting spots',d:'Basic gear: short bows, wooden spears, wooden chest plates.',tiers:[
    {n:'Crafting spot',cost:60,speed:1},{n:'Craft bench',cost:200,mat:{wood:30},speed:1.4},{n:'Workshop',cost:420,mat:{wood:60,steel:10},speed:1.8},{n:'Machine workshop',cost:800,mat:{steel:40,comp:4},speed:2.3,req:'electricity',power:150}]},
  tailor:{n:'Tailors',d:'Parkas from wool or cotton, dusters from leather.',tiers:[
    {n:'Tailor bench',cost:120,mat:{wood:20},speed:1},{n:'Tailor shop',cost:300,mat:{wood:40},speed:1.4},{n:'Tailor’s hall',cost:560,mat:{wood:60,comp:2},speed:1.8},{n:'Electric tailoring',cost:900,mat:{steel:40,comp:4},speed:2.3,req:'electricity',power:120}]},
  weaponsmith:{n:'Weaponsmiths',d:'Each forge tier unlocks better weapons: rifles and steel spears, then assault rifles, snipers, machine guns and finally charge rifles and monoswords.',tiers:[
    {n:'Smithy',cost:220,mat:{stone:40},speed:1,req:'smithing'},{n:'Weapon forge',cost:520,mat:{stone:60,steel:20},speed:1.3,req:'advsmith'},{n:'Machining forge',cost:900,mat:{steel:60,comp:3},speed:1.6,req:'machining'},{n:'Gun factory',cost:1400,mat:{steel:80,comp:6},speed:1.9,req:'electricity',power:250},{n:'Advanced fabricator',cost:2400,mat:{steel:100,comp:10,plasteel:40},speed:2.2,req:'advfab',power:400}]},
  armorsmith:{n:'Armorsmiths',d:'Each forge tier unlocks better armor: leather and helmets, then flak vests, plate, recon and marine armor.',tiers:[
    {n:'Armor bench',cost:220,mat:{stone:40},speed:1,req:'smithing'},{n:'Armory forge',cost:520,mat:{stone:60,steel:20},speed:1.3,req:'advsmith'},{n:'Plating forge',cost:900,mat:{steel:60,comp:3},speed:1.6,req:'machining'},{n:'Composite works',cost:1400,mat:{steel:80,comp:6},speed:1.9,req:'electricity',power:250},{n:'Advanced fabricator',cost:2400,mat:{steel:100,comp:10,plasteel:40},speed:2.2,req:'advfab',power:400}]},
  hunting:{n:'Hunting',d:'A hunter takes a weapon from storage, hunts wild animals outside and butchers them here.',tiers:[
    {n:'Hunter’s camp',cost:80,speed:1},{n:'Hunting lodge',cost:260,mat:{wood:50},speed:1.4},{n:'Hunting outpost',cost:480,mat:{stone:40,steel:10},speed:1.7},{n:'Meat locker lodge',cost:800,mat:{steel:30,comp:3},speed:2,req:'electricity',power:100}]},
  treefarm:{n:'Tree farms',d:'Grows trees for wood inside the walls.',tiers:[
    {n:'Tree nursery',cost:150,grow:1,req:'forestry'},{n:'Managed woodlot',cost:380,mat:{stone:20},grow:1.4},{n:'Forestry station',cost:600,mat:{stone:40,steel:10},grow:1.7},{n:'Tree plantation',cost:950,mat:{steel:30,comp:4},grow:2.1,req:'electricity',power:120}]},
  construction:{n:'Builders',d:'Builders put up everything you plan, pave paths, reset traps, clear land and repair walls and plots, even during raids. Uses the Construction skill.',tiers:[
    {n:'Builder’s yard',cost:60,speed:1},{n:'Construction office',cost:220,mat:{wood:40},speed:1.3},{n:'Engineering depot',cost:450,mat:{stone:60,steel:10},speed:1.6},{n:'Engineering works',cost:850,mat:{steel:40,comp:4},speed:2,req:'electricity',power:120}]},
  quarry:{n:'Quarries',d:'Miners cut stone blocks. Deep mines also dig steel; mining rigs in mountains and tundra find plasteel.',tiers:[
    {n:'Quarry pit',cost:120,speed:1},{n:'Stone cutter',cost:360,mat:{wood:40},speed:1.4},{n:'Deep mine',cost:700,mat:{stone:60,steel:20},speed:1.6,req:'deepmining',ores:['steel']},{n:'Mining rig',cost:1200,mat:{steel:60,comp:6},speed:2,req:'electricity',power:250,ores:['steel','plasteel']}]},
  research:{n:'Research',d:'Researchers unlock new technology.',tiers:[
    {n:'Research corner',cost:100,speed:1},{n:'Research lab',cost:360,mat:{comp:3},speed:1.4},{n:'Research complex',cost:700,mat:{stone:60,comp:5},speed:1.7},{n:'Hi-tech lab',cost:1200,mat:{steel:60,comp:8},speed:2.1,req:'electricity',power:200}]},
  storage:{n:'Storage',d:'Goods are stored here. Drag a colonist here to make them a hauler. Joined storage shares space.',tiers:[
    {n:'Stockpile',cost:20,per:30,carry:25,cart:'by hand'},{n:'Shelved storage',cost:150,mat:{wood:40},per:60,carry:50,cart:'hand carts'},{n:'Warehouse',cost:400,mat:{stone:80},per:110,req:'racks',carry:90,cart:'pack wagons'},{n:'Logistics depot',cost:800,mat:{steel:50,comp:4},per:170,carry:140,cart:'motor carts',req:'electricity',power:100}]},
  refinery:{n:'Refineries',d:'Refines wood or hay into chemfuel for generators, munitions and fabrication.',tiers:[
    {n:'Chemfuel refinery',cost:240,mat:{steel:20},speed:1,req:'chemistry'},{n:'Biofuel plant',cost:450,mat:{steel:30},speed:1.4},{n:'Chemical plant',cost:750,mat:{steel:40,comp:3},speed:1.8},{n:'Industrial refinery',cost:1100,mat:{steel:60,comp:5},speed:2.3,req:'electricity',power:180}]},
  munitions:{n:'Munitions workshops',d:'Mortar shells and landmines from steel and chemfuel.',tiers:[
    {n:'Munitions bench',cost:300,mat:{steel:30},speed:1,req:'artillery'},{n:'Munitions workshop',cost:520,mat:{steel:40,comp:2},speed:1.4},{n:'Ordnance shop',cost:800,mat:{steel:60,comp:4},speed:1.8},{n:'Ordnance factory',cost:1200,mat:{steel:80,comp:6},speed:2.3,req:'electricity',power:200}]},
  fabrication:{n:'Fabrication',d:'Builds components from steel and chemfuel, later advanced components.',tiers:[
    {n:'Fabrication bench',cost:500,mat:{steel:60,comp:4},speed:1,req:'fabrication'},{n:'Fabrication workshop',cost:800,mat:{steel:80,comp:6},speed:1.4},{n:'Fabrication hall',cost:1200,mat:{steel:100,comp:8},speed:1.8},{n:'Fabrication plant',cost:1800,mat:{steel:140,comp:10},speed:2.3,req:'electricity',power:300}]},
  solar:{n:'Solar power',d:'Solar panels make power during the day.',tiers:[
    {n:'Solar panel',cost:260,mat:{steel:30,comp:2},prod:300,req:'electricity'},{n:'Solar array',cost:480,mat:{steel:50,comp:3},prod:600},{n:'Solar field',cost:780,mat:{steel:70,comp:5},prod:1000},{n:'Advanced solar field',cost:1200,mat:{steel:90,comp:8},prod:1500}]},
  burner:{n:'Burner generators',d:'Burn wood, or chemfuel when wood runs out, for steady power day and night.',tiers:[
    {n:'Wood burner',cost:220,mat:{steel:30,comp:2},prod:500,fuel:.9,req:'electricity'},{n:'Burner generator',cost:420,mat:{steel:50,comp:3},prod:900,fuel:1.4},{n:'Twin burner',cost:700,mat:{steel:70,comp:5},prod:1400,fuel:1.9},{n:'Steam plant',cost:1100,mat:{steel:90,comp:8},prod:2000,fuel:2.4}]},
  battery:{n:'Batteries',d:'Store spare power for the night and for peaks.',tiers:[
    {n:'Battery bank',cost:200,mat:{steel:30,comp:2},store:1500,req:'electricity'},{n:'Battery room',cost:380,mat:{steel:50,comp:3},store:3500},{n:'Power cellar',cost:650,mat:{steel:70,comp:5},store:6000},{n:'Capacitor vault',cost:1000,mat:{steel:90,comp:8},store:10000}]},
  comms:{n:'Comms',d:'Calls orbital traders, which land on its pad, and receives dropship contracts.',tiers:[{n:'Comms tower',cost:350,mat:{comp:5,steel:20},req:'comms'}]},
};
const WINGS={
  pantry:{n:'Pantry',annex:true,of:['kitchen'],wall:'par',spd:.15,store:150,d:'Shelves of sacks and jars. +15% cooking speed, +150 storage.',tiers:[{n:'Pantry',cost:90,mat:{wood:30}}]},
  supply:{n:'Supply room',annex:true,of:['workshop','tailor','weaponsmith','armorsmith','refinery','munitions','fabrication','construction','hunting','quarry'],wall:'par',spd:.2,store:100,d:'Racks of materials right by the benches. +20% work speed, +100 storage.',tiers:[{n:'Supply room',cost:120,mat:{wood:40}}]},
  library:{n:'Library',annex:true,of:['research'],wall:'par',spd:.35,d:'Books, data slates and a reading table. +35% research speed.',tiers:[{n:'Library',cost:200,mat:{wood:50}}]},
  granary:{n:'Granary',annex:true,of:['farm','hydro','treefarm'],wall:'par',spd:.1,store:150,d:'A grain store with a small silo. +10% growth, +150 storage.',tiers:[{n:'Granary',cost:120,mat:{wood:40}}]},
  well:{n:'Water tower',annex:true,of:['farm','treefarm'],wall:false,spd:.25,d:'A well with a raised tank that waters the fields. +25% growth.',tiers:[{n:'Water tower',cost:100,mat:{wood:30,stone:10}}]},
  stable:{n:'Stable',annex:true,of:['pen'],wall:'par',spd:.25,d:'Stalls, troughs and hay. +25% animal space and products.',tiers:[{n:'Stable',cost:110,mat:{wood:40}}]},
  bunk:{n:'Bunk wing',annex:true,of:['housing'],wall:'par',d:'Four more beds, sharing the house’s bonuses.',tiers:[{n:'Bunk wing',cost:90,mat:{wood:30}}]},
  bath:{n:'Bathhouse',annex:true,of:['housing'],wall:'par',home:.1,d:'Hot tubs. Colonists living in the house work 10% faster.',tiers:[{n:'Bathhouse',cost:150,mat:{wood:20,stone:30}}]},
  rec:{n:'Rec room',annex:true,of:['commons'],wall:'par',buff:.04,d:'Games and a billiard table. The meal bonus is 4% stronger.',tiers:[{n:'Rec room',cost:160,mat:{wood:40}}]},
  maproom:{n:'Map room',annex:true,of:['commons','housing','research'],wall:'par',d:'A big table with hand-drawn maps of the region. Plan expeditions from here. One per colony.',tiers:[{n:'Map room',cost:180,mat:{wood:40,stone:20}}]},
  dock:{n:'Loading dock',annex:true,of:['storage'],wall:'par',spd:.3,d:'A loading bay with a cart. +30% space for the whole storage.',tiers:[{n:'Loading dock',cost:100,mat:{wood:40}}]},
};
const ANNEX_TYPES=Object.keys(WINGS);
const ADJ={
  kitchen:[[['farm','hydro','pen'],.1,'fresh ingredients'],[['commons'],.1,'serves the hall directly']],
  hunting:[[['kitchen'],.1,'butchers next to the kitchen']],
  workshop:[[['storage'],.1,'materials at hand']],
  tailor:[[['storage'],.1,'materials at hand'],[['pen'],.1,'wool and leather close by']],
  weaponsmith:[[['storage'],.1,'materials at hand'],[['quarry'],.1,'steel from the mine']],
  armorsmith:[[['storage'],.1,'materials at hand'],[['quarry'],.1,'steel from the mine']],
  refinery:[[['treefarm','farm'],.1,'fuel crops close by']],
  munitions:[[['refinery'],.15,'chemfuel piped in']],
  fabrication:[[['refinery'],.15,'chemfuel piped in'],[['storage'],.1,'materials at hand']],
  research:[[['commons'],.05,'ideas over lunch'],[['quarry','weaponsmith','armorsmith','burner'],-.15,'noise']],
  farm:[[['pen'],.1,'manure']],
  pen:[[['farm'],.1,'fodder close by']],
  construction:[[['storage'],.1,'materials at hand'],[['quarry','treefarm'],.1,'stone and wood close by']],
  quarry:[[['construction'],.1,'builders haul the blocks']],
  housing:[[['commons'],.05,'close to the hall'],[['weaponsmith','armorsmith','quarry','burner','munitions'],-.08,'noise at night']],
};
const LANES={
  barricade:{n:'Barricade',cost:25,mat:{wood:20},d:'Two staggered sandbag walls. Raiders inside the walls must zig-zag through at half speed. Colonists can still pass.'},
  spikes:{n:'Spike barrier',cost:35,mat:{wood:30},d:'Sharpened stakes along the lane. Raiders running through get hurt and slowed.'},
  post:{n:'Guard post',cost:45,mat:{wood:30},d:'A sandbag nest. Once raiders are inside the walls, a ranged fighter takes it: +3 range, +15% accuracy.'},
  turret:{n:'Turret nest',cost:320,mat:{steel:25,comp:4},req:'turrets',d:'An auto-turret that fires bursts at raiders inside the walls.'},
};
const WPLOTS={
  armory:{n:'Armory',cost:80,mat:{wood:30},d:'Racks for weapons and armor. Gear kept here takes no storage space. Militia and hunters arm themselves here.'},
  tradespot:{n:'Trade spot',cost:60,mat:{wood:20},d:'A covered stall for visiting traders. Unlocks auto-selling and auto-buying. During a raid caravans shelter here instead of leaving.'},
  bunk:{n:'Bunkhouse',cost:50,mat:{wood:25},d:'Two bunks along the wall. They count as beds.'},
  shelf:{n:'Storage shelves',cost:30,mat:{wood:20},d:'Five shelf spaces along the wall, 30 goods each.'},
  campfire:{n:'Cooking fire',cost:40,work:'kitchen',d:'A small cooking fire for one cook. Same bills as a kitchen.'},
  bench:{n:'Workbench',cost:45,mat:{wood:15},work:'workshop',d:'A small bench for one crafter: bows, spears, wooden chest plates.'},
  barracks:{n:'Guard barracks',cost:120,mat:{wood:50},d:'Off-duty guards stay here and train their shooting on target dummies. When raiders come they run to their wall posts.'},
  mortar:{n:'Mortar pit',cost:350,mat:{steel:30,comp:2},req:'artillery',d:'Lobs shells at raiders outside the wall during a raid.'},
};
const TRAPS={
  spikes:{n:'Spike trap',cost:6,mat:{wood:5},ch:4,d:'Sharpened stakes. Each raider who runs over them gets hurt. Four uses, then a builder resets it for 5 wood.'},
  pit:{n:'Pit trap',cost:8,mat:{wood:4},d:'A covered pit. Raiders crossing it crawl along at a third of their speed, right under your guns.'},
  mine:{n:'Landmine',cost:0,mat:{mine:1},d:'Explodes under the first raider, hurting everyone close by. Uses one landmine from the munitions workshop.'},
};
const WALLS=[
  {n:'Trench',cost:30,d:'A dug ditch with a plank bridge over it.'},
  {n:'Wooden palisade',cost:150,mat:{wood:60},d:'Sharpened logs. Caravans feel safer stopping here.'},
  {n:'Stone wall',cost:400,mat:{stone:120},d:'Solid stone blocks.'},
  {n:'Reinforced wall',cost:900,mat:{stone:100,comp:10},req:'masonry',d:'Stone with steel bands and lookouts.'},
];
const BILLS={kitchen:['meal','finemeal','cheese'],workshop:['bow','spear','woodarmor'],tailor:['parka','duster'],weaponsmith:['recurve','steelspear','rifle','assault','longsword','sniper','warhammer','lmg','zweihander','charge','monosword'],armorsmith:['leatherarmor','helmet','flakvest','plate','advhelmet','recon','marine','marinehelm'],refinery:['chemfuel','chemhay'],munitions:['shell','mine'],fabrication:['comp','acomp']};
const BIOMES={
  temperate:{n:'Temperate scrubland',size:[5,4],grow:1,pros:['Mild, nothing gets in your way'],cons:['Small site'],pal:{in:[112,93,66],out:[96,103,58],alt:[82,67,48],gut:[104,88,62]},deco:[.09,.025,.06],out2:'grass'},
  forest:{n:'Lush forest valley',size:[6,5],grow:1.25,hay:.7,caravan:1.3,pros:['Crops grow 25% faster','Animals graze: 30% less hay','Many trees outside'],cons:['Caravans 30% less often'],pal:{in:[94,82,56],out:[66,90,46],alt:[74,64,44],gut:[88,78,54]},deco:[.2,.02,.1],out2:'grass'},
  arid:{n:'Arid steppe',size:[7,5],grow:.6,caravan:.5,price:1.1,pros:['Caravans twice as often','Traders pay 10% more','Large site'],cons:['Basic farms grow 40% slower (irrigation fixes it)','Few trees'],pal:{in:[170,134,90],out:[184,152,104],alt:[150,116,76],gut:[160,126,86]},deco:[.03,.05,.05],out2:'sand'},
  tundra:{n:'Boreal tundra',size:[6,6],grow:.7,hay:1.2,wool:1.5,pros:['Shaggox wool +50%','Tall site','Mining rigs find plasteel'],cons:['Crops grow 30% slower','Animals eat 20% more hay'],pal:{in:[124,120,106],out:[176,180,174],alt:[108,104,92],gut:[118,114,102]},deco:[.08,.04,.03],out2:'snow'},
  cave:{n:'Mountain cave',size:[6,5],grow:.8,storage:1.3,research:1.1,caravan:.8,cave:true,pros:['Raiders can only come from the west','Storage +30%','Mining rigs find plasteel','Digging out land yields stone'],cons:['New land must be dug out of the rock: slow and costly','Crops grow 20% slower (little light)','Caravans 20% less often'],pal:{in:[124,110,90],out:[104,100,84],alt:[108,96,78],gut:[116,104,86]},deco:[.07,.08,.04],out2:'rock'},
  mountain:{n:'Mountain hollow',size:[7,6],nofarm:true,storage:1.5,research:1.2,caravan:1.5,pros:['Largest site','Storage +50%','Research +20%','Mining rigs find plasteel'],cons:['No soil: only hydroponics grows crops','Caravans 50% less often'],pal:{in:[88,84,80],out:[104,100,94],alt:[72,69,66],gut:[96,92,88]},deco:[.02,.22,.01],out2:'rock'},
};
const SKILLS=['plants','animals','cooking','crafting','construction','mining','hauling','shooting','intellectual'];
const SKN={plants:'Plants',animals:'Animals',cooking:'Cooking',crafting:'Crafting',construction:'Construction',mining:'Mining',hauling:'Hauling',shooting:'Shooting',intellectual:'Intellectual'};
const TRAITS={
  green:{n:'Green thumb',d:'+25% plant work speed',m:{plants:1.25}},
  whisper:{n:'Animal whisperer',d:'+25% animal work speed',m:{animals:1.25}},
  chef:{n:'Born cook',d:'+25% cooking speed',m:{cooking:1.25}},
  indus:{n:'Industrious',d:'+20% speed at all work',m:{all:1.2},x:'lazy'},
  lazy:{n:'Lazy',d:'-20% speed at all work',m:{all:.8},x:'indus'},
  fast:{n:'Fast walker',d:'+30% walking speed',walk:1.3,x:'slow'},
  slow:{n:'Slowpoke',d:'-20% walking speed',walk:.8,x:'fast'},
  book:{n:'Bookworm',d:'+25% research speed',m:{intellectual:1.25}},
  steady:{n:'Steady hands',d:'+25% crafting speed',m:{crafting:1.25}},
  strong:{n:'Strong back',d:'+25% mining and gathering speed',m:{mining:1.25}},
  sharp:{n:'Sharp eye',d:'+25% aiming speed',m:{shooting:1.25}},
};
const FIRST=['Mara','Tobin','Elsk','Rhea','Dov','Ilse','Kesh','Wren','Anouk','Brann','Cato','Yuna','Pell','Oda','Saul','Fenna','Jory','Lio','Nessa','Ruk','Hal','Signe','Teo','Bex'];
const LAST=['Harlow','Vey','Quist','Dunmore','Ashby','Korr','Lindqvist','Marsh','Okafor','Brisk','Tamsin','Vale','Holt','Sarno','Fenwick','Adair'];
const NICK=['Dusty','Patch','Clover','Sprocket','Mudlark','Tinker','Bramble','Rook','Sunny','Grit','Hops','Moss','Tallow','Pip','Flint','Burr','Wick','Juniper','Nettle','Sable'];
const SKIN=['#f1d3b3','#e3b98f','#c9935f','#a8703f','#7d4f2b','#f5dcc4'];
const HAIRC=['#2b1d12','#4a2f1a','#7a4a22','#b07a3a','#d8b46a','#8c8c86','#1c1c1c','#9a3b1e'];
const SHIRTS=['#6b7f4a','#7a5a3a','#5a6f80','#8a7458','#6d4f5f','#4f6b62','#94704a','#5f5f6e','#8b5a4a'];
const FACTIONS=['Ferrin Hold','Coldwater Pact','Ashen Guild','Saltmarsh Kin','Tallgrass League'];
const ORBITAL=['The Gilded Hen','Quiet Margin','Ninth Lantern','Bright Ledger'];
const SITE_NAMES=['Dustwool','Hollow Creek','Ninefold','Brackenrest','Saltgrass','Oldmere','Kettle Rise','Lanternfield'];

