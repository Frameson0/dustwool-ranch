/* ================= utils ================= */
const R=(a,b)=>a+Math.random()*(b-a), RI=(a,b)=>Math.floor(R(a,b+1)), pick=a=>a[Math.floor(Math.random()*a.length)];
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Math.floor(n).toLocaleString('en-US');
const fmt1=n=>Math.abs(n)>=10?Math.round(n).toLocaleString('en-US'):(Math.round(n*10)/10).toString();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function fmtTime(s){s=Math.max(0,Math.round(s));if(s>=3600)return Math.floor(s/3600)+'h '+Math.floor(s%3600/60)+'m';if(s>=60)return Math.floor(s/60)+'m '+(s%60)+'s';return s+'s'}
function fmtDays(s){const d=s/DAY;return d>=1?d.toFixed(1)+' days':Math.round(d*24)+' hours'}

