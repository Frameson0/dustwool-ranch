/* ================= storage ================= */
function cellsOf(type,key){const out=[];for(const p of built(type)){const[ox,oy]=plotOrigin(p);for(const[x,y]of layouts[p.id][key])out.push([ox+x,oy+y,p])}return out}
function storeCells(){return cellsOf('storage','store').concat(shelfCells())}
function tableCells(){return cellsOf('commons','store')}
function stockCap(){if(S.test)return 1e9;let c=0;for(const p of built('storage'))c+=layouts[p.id].store.length*tierDef(p).per*clusterBonus(p);c+=tableCells().length*25+kitchenCells().length*25+shelfCells().length*30;for(const r in bonusInfo)c+=bonusInfo[r].store;return Math.floor(c*(biome().storage||1))}
function stockUsed(){let s=0;const ar=armories().length>0;for(const k in S.items){if(ar&&isGear(k))continue;s+=Math.floor(S.items[k])}return s}
function armSpot(){const a=armories()[0];if(a)return[a.x0+Math.floor(a.w/2),a.y0+Math.floor(a.h/2)];const st=storeCells()[0];return st?[st[0],st[1]]:null}
function haulTargets(item){if(ITEMS[item].table){const t=tableCells();if(t.length)return t}if(KFOOD.includes(item)){const k=kitchenCells();if(k.length)return k}return storeCells()}

