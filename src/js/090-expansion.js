/* ================= expansion ================= */
function lockedAdj(p){return !!p&&!p.open&&[[-1,0],[1,0],[0,-1],[0,1]].some(([a,b])=>{const n=nb(p,a,b);return n&&n.open})}
function openCount(){return S.plots.filter(p=>p.open).length}
function rockPlot(p){if(!p||!biome().cave)return false;const[ox,oy]=plotOrigin(p);return mtnAt(ox+2,oy+2)}
function expandCost(p){const n=openCount(),rk=rockPlot(p)?2.5:1;return{cost:Math.round(50*Math.pow(1.3,Math.max(0,n-4))*rk),mat:{...(S.wall<0?{}:[{},{wood:30},{stone:40},{stone:40,steel:10}][S.wall])}}}
function plotObstacles(p){const[ox,oy]=plotOrigin(p);return S.outside.filter(o=>(o.k==='tree'||o.k==='rock')&&o.x>=ox-GU-3&&o.x<=ox+P+GU+2&&o.y>=oy-GU-3&&o.y<=oy+P+GU+2)}
function startExpansion(p){
  if(S.proj){if(S.proj.pid!==p.id)msg('Your builders are already clearing other land.','bad');return S.proj.pid===p.id}
  if(!lockedAdj(p)){msg('Only land right next to your base can be cleared.','bad');return false}
  const c=expandCost(p);if(!costOk(c)){msg(`Clearing this land needs ${costStr(c)}.`,'bad');return false}
  const rk=rockPlot(p);pay(c);const obs=plotObstacles(p).length;S.proj={pid:p.id,prog:0,need:rk?320:80+obs*9,obs0:obs,paid:c,rock:rk};plotDirty=true;
  if(!S.cols.some(x=>x.assign==='build'))msg('Land marked for clearing. Drag colonists onto it to make them builders.','good');else msg('Your builders head out to clear the new land.','good');
  return true;
}
function cancelExpansion(){if(!S.proj)return;refundCost(S.proj.paid,1);S.proj=null;for(const c of S.cols)if(c.job&&c.job.t==='build')releaseJob(c);plotDirty=true;msg('Clearing cancelled. Costs refunded.')}
function completeExpansion(){
  const p=plotById(S.proj.pid),rk=S.proj.rock;S.proj=null;p.open=true;if(rk){add('stone',90);if(Math.random()<.5)add('steel',12);msg('The builders dug a new chamber out of the rock. 90 stone went to storage.','good')}
  for(const c of S.cols)if(c.job&&c.job.t==='build')releaseJob(c);
  refreshSite();msg(`New land opened up. ${openCount()} plots inside the wall now.`,'good');chron('land',`Cleared new land: ${openCount()} plots.`);
}
function buildJob(c){
  if(!S.proj){c.status='No land to clear. Click wild land next to the base.';return null}
  const p=plotById(S.proj.pid),[ox,oy]=plotOrigin(p),obs=plotObstacles(p).filter(o=>o.x>=ox-GU&&o.x<=ox+P+GU-1&&o.y>=oy-GU&&o.y<=oy+P+GU-1);
  let cell=null;
  if(obs.length&&S.proj.prog<.6){const o=nearest(c,obs,o=>[o.x,o.y]);cell=[o.x+(Math.random()<.5?-1:1),o.y]}
  const rk=S.proj.rock,okc=q=>q&&walkable(q[0],q[1])&&(rk?isBaseK(kAt(q[0],q[1])):kAt(q[0],q[1])===0);
  for(let k=0;k<(rk?60:14)&&!okc(cell);k++)cell=rk?[ox+RI(-GU-4,P+GU+3),oy+RI(-GU-4,P+GU+3)]:[ox+RI(-GU,P+GU-1),oy+RI(-GU,P+GU-1)];
  if(!okc(cell))return null;if(rk)c.status='Digging into the rock';
  return{t:'build',x:cell[0],y:cell[1],st:0,w:R(6,10)};
}

