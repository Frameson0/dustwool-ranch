/* ================= icons ================= */
const iconCache={},portCache={};
function icon(i){if(iconCache[i])return iconCache[i];const c=document.createElement('canvas');c.width=c.height=48;drawItem(c.getContext('2d'),i,24,24,40);return iconCache[i]=c.toDataURL()}
function portrait(p){if(portCache[p.id])return portCache[p.id];const c=document.createElement('canvas');c.width=c.height=96;drawPawn(c.getContext('2d'),p,48,54,74,'d',0);return portCache[p.id]=c.toDataURL()}

