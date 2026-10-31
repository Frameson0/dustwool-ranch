/* ================= art helpers: defenses, sandbags, masonry =================
   Shared drawing routines for the wall defenses, lane defenses and the small wall-side buildings. */
function sandbag(g,x,y,a,w,h,tone){g.save();g.translate(x,y);g.rotate(a);const c=tone?'#b3a073':'#c2ae80';
  g.fillStyle='rgba(0,0,0,.22)';rr(g,-w/2+1.5,-h/2+2.5,w,h,h*.45);g.fill();
  const gr=g.createLinearGradient(0,-h/2,0,h/2);gr.addColorStop(0,'#d8c698');gr.addColorStop(.55,c);gr.addColorStop(1,'#8f7e56');rr(g,-w/2,-h/2,w,h,h*.45);g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.3;g.stroke();
  g.strokeStyle='rgba(90,70,40,.55)';g.lineWidth=.9;g.setLineDash([1.5,2]);g.beginPath();g.moveTo(-w/2+3,0);g.lineTo(w/2-3,0);g.stroke();g.setLineDash([]);
  g.strokeStyle='rgba(70,52,28,.7)';g.lineWidth=1.2;g.beginPath();g.moveTo(-w/2+2.5,-h*.3);g.lineTo(-w/2+2.5,h*.3);g.moveTo(w/2-2.5,-h*.3);g.lineTo(w/2-2.5,h*.3);g.stroke();g.restore()}
function sandArc(g,cx,cy,r,a0,a1,n,w,h,rows){for(let row=0;row<(rows||1);row++){const rr0=r-row*h*.8;for(let k=0;k<n;k++){const a=a0+(a1-a0)*(k+.5+(row%2?.5:0))/n;if(row%2&&k===n-1)continue;sandbag(g,cx+Math.cos(a)*rr0,cy+Math.sin(a)*rr0,a+Math.PI/2,w,h,(k+row)%2)}}}
function planks(g,x,y,w,h,vert,c1,c2){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();const n=Math.max(2,Math.round((vert?w:h)/7));for(let k=0;k<n;k++){g.fillStyle=k%2?(c1||'#8a6640'):(c2||'#7a5834');if(vert)g.fillRect(x+k*w/n,y,w/n+.5,h);else g.fillRect(x,y+k*h/n,w,h/n+.5)}
  g.strokeStyle='rgba(40,24,10,.45)';g.lineWidth=.8;for(let k=1;k<n;k++){g.beginPath();if(vert){g.moveTo(x+k*w/n,y);g.lineTo(x+k*w/n,y+h)}else{g.moveTo(x,y+k*h/n);g.lineTo(x+w,y+k*h/n)}g.stroke()}
  g.fillStyle='rgba(40,24,10,.5)';for(let k=0;k<n;k++){const p=(k*37)%7/7;if(vert){g.fillRect(x+k*w/n+w/n/2-.6,y+h*(.2+p*.5),1.2,1.2)}else g.fillRect(x+w*(.2+p*.5),y+k*h/n+h/n/2-.6,1.2,1.2)}g.restore()}
function masonry(g,x,y,w,h,seed,dark){const r=mulberry(seed||1),rows=Math.max(1,Math.round(h/9)),rh=h/rows;g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  for(let j=0;j<rows;j++){let bx=x-(j%2?rh*.9:0);while(bx<x+w){const bw=rh*(1.4+r()*.8),t=r();g.fillStyle=dark?['#6f6a63','#67625b','#77726a'][Math.floor(t*3)]:['#948f86','#8a857c','#9e998f','#837e75'][Math.floor(t*4)];g.fillRect(bx+.6,y+j*rh+.6,bw-1.2,rh-1.2);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(bx+.6,y+j*rh+.6,bw-1.2,1.2);bx+=bw}}
  g.fillStyle='rgba(30,26,22,.45)';for(let j=1;j<rows;j++)g.fillRect(x,y+j*rh-.5,w,1);g.restore()}
function crate(g,x,y,s,col){rr(g,x,y,s,s,2);fs(g,col||'#9a7448',1.2);g.strokeStyle='rgba(50,30,12,.6)';g.lineWidth=1;g.beginPath();g.moveTo(x+2,y+2);g.lineTo(x+s-2,y+s-2);g.moveTo(x+s-2,y+2);g.lineTo(x+2,y+s-2);g.stroke();g.strokeRect(x+1.5,y+1.5,s-3,s-3)}
function ammoBox(g,x,y,w,h){rr(g,x,y,w,h,1.5);fs(g,'#5f6b4a',1.2);g.fillStyle='#c9a640';g.fillRect(x+3,y+h*.42,w-6,1.6);g.fillStyle='#3e4632';g.fillRect(x+w/2-2,y-1,4,2)}
/* wall slot defenses, drawn every frame */
function drawGuardPost(g,cx,cy,ox,oy){const base=Math.atan2(oy,ox);
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.arc(cx+2,cy+3,T*.62,0,7);g.fill();
  planks(g,cx-T*.42,cy-T*.42,T*.84,T*.84,!!ox,'#8f6e46','#7b5b39');g.strokeStyle=OUT;g.lineWidth=1.2;g.strokeRect(cx-T*.42,cy-T*.42,T*.84,T*.84);
  sandArc(g,cx,cy,T*.52,base-1.55,base+1.55,6,12,7.5,2);
  ammoBox(g,cx-ox*T*.18-oy*T*.2-5,cy-oy*T*.18+ox*T*.2-3,10,6)}
function drawWoodTower(g,cx,cy,ox,oy,now){const s2=T*.82,hgt=7;
  g.fillStyle='rgba(0,0,0,.28)';g.fillRect(cx-s2+hgt,cy-s2+hgt+2,s2*2,s2*2);
  g.strokeStyle='#3d2c1a';g.lineWidth=4;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){g.beginPath();g.moveTo(cx+a*s2*.8,cy+b*s2*.8);g.lineTo(cx+a*s2*.8+hgt*.8,cy+b*s2*.8+hgt);g.stroke()}
  planks(g,cx-s2,cy-s2,s2*2,s2*2,!ox,'#9a7448','#86643e');g.strokeStyle=OUT;g.lineWidth=2;g.strokeRect(cx-s2,cy-s2,s2*2,s2*2);
  g.strokeStyle=OUT;g.lineWidth=5;g.lineCap='round';g.beginPath();g.rect(cx-s2+3,cy-s2+3,s2*2-6,s2*2-6);g.stroke();g.strokeStyle='#6b4a2a';g.lineWidth=3;g.stroke();
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1],[-1,0],[1,0]]){g.beginPath();g.arc(cx+a*(s2-3),cy+b*(s2-3),3.4,0,7);fs(g,'#5c4228',1.2);g.fillStyle='#c9a06a';g.beginPath();g.arc(cx+a*(s2-3),cy+b*(s2-3),1.4,0,7);g.fill()}
  const hx=cx-ox*(s2-5),hy=cy-oy*(s2-5);g.fillStyle='#2a1d12';g.fillRect(hx-4,hy-4,8,8);g.strokeStyle='#c9a06a';g.lineWidth=1;for(let k=-3;k<=3;k+=2){g.beginPath();g.moveTo(hx-4,hy+k);g.lineTo(hx+4,hy+k);g.stroke()}
  const fx=cx+(ox?0:s2-3)*1+(ox?ox*(s2-3):0),fy=cy+(oy?oy*(s2-3):-(s2-3));torch(g,cx+(oy?s2-3:-(s2-3)*0),cy-(s2-3))}
function drawStoneTower(g,cx,cy,ox,oy,id){const s2=T*.86,hgt=9;
  g.fillStyle='rgba(0,0,0,.32)';g.fillRect(cx-s2+hgt,cy-s2+hgt,s2*2,s2*2);
  masonry(g,cx-s2,cy-s2,s2*2,s2*2,id*13+5);g.strokeStyle=OUT;g.lineWidth=2.4;g.strokeRect(cx-s2,cy-s2,s2*2,s2*2);
  g.fillStyle='#5e5952';g.fillRect(cx-s2+7,cy-s2+7,s2*2-14,s2*2-14);masonry(g,cx-s2+8,cy-s2+8,s2*2-16,s2*2-16,id*7+3,true);g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1.5;g.strokeRect(cx-s2+7,cy-s2+7,s2*2-14,s2*2-14);
  const n=4;for(let side=0;side<4;side++)for(let k=0;k<n;k++){if(k%2)continue;const f=(k+.5)/n,mx=side<2?cx-s2+f*s2*2:side===2?cx-s2:cx+s2-7,my=side===0?cy-s2:side===1?cy+s2-7:cy-s2+f*s2*2;const mw=side<2?s2*2/n:7,mh=side<2?7:s2*2/n;g.fillStyle='#a39e94';g.fillRect(side<2?mx-mw/2:mx,side<2?my:my-mh/2,mw,mh);g.strokeStyle=OUT;g.lineWidth=1.2;g.strokeRect(side<2?mx-mw/2:mx,side<2?my:my-mh/2,mw,mh)}
  g.strokeStyle='#5a3e22';g.lineWidth=2;g.beginPath();g.moveTo(cx+s2-10,cy-s2+10);g.lineTo(cx+s2-10,cy-s2-6);g.stroke();g.fillStyle='#9a3b2e';g.beginPath();g.moveTo(cx+s2-10,cy-s2-6);g.lineTo(cx+s2+2,cy-s2-2);g.lineTo(cx+s2-10,cy-s2+2);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke()}
function drawTurretArt(g,cx,cy,a,firing,now,small){const k=small?.78:1;
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(cx+2,cy+3,14*k,0,7);g.fill();
  g.beginPath();for(let i=0;i<8;i++){const t=i/8*Math.PI*2+Math.PI/8;g.lineTo(cx+Math.cos(t)*14*k,cy+Math.sin(t)*14*k)}g.closePath();const gr=g.createRadialGradient(cx-4,cy-4,1,cx,cy,15*k);gr.addColorStop(0,'#9aa0a6');gr.addColorStop(1,'#4f5559');g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.6;g.stroke();
  g.fillStyle='#2e3236';for(let i=0;i<8;i++){const t=i/8*Math.PI*2+Math.PI/8;g.beginPath();g.arc(cx+Math.cos(t)*11*k,cy+Math.sin(t)*11*k,1.1,0,7);g.fill()}
  g.save();g.translate(cx,cy);g.rotate(a);
  for(const sd of[-3.2,3.2]){const rec=firing&&Math.floor(now/40)%2?-2:0;rr(g,4+rec,sd*k-1.8,17*k,3.6,1.2);fs(g,'#2f3337',1.1);g.fillStyle='#1a1c1e';g.fillRect(19*k+rec,sd*k-1.2,2,2.4)}
  rr(g,-9*k,-8*k,16*k,16*k,4);const g2=g.createLinearGradient(0,-8*k,0,8*k);g2.addColorStop(0,'#8a9096');g2.addColorStop(1,'#565c61');g.fillStyle=g2;g.fill();g.strokeStyle=OUT;g.lineWidth=1.4;g.stroke();
  rr(g,-11*k,-5*k,5*k,10*k,1.5);fs(g,'#5f6b4a',1);g.fillStyle='#c9a640';g.fillRect(-10*k,-1,3*k,2);
  g.fillStyle=firing?'#ff6a3a':'#7fd07f';g.beginPath();g.arc(2*k,-4.5*k,1.6,0,7);g.fill();
  if(firing&&Math.floor(now/50)%2){g.fillStyle='rgba(255,220,120,.9)';for(const sd of[-3.2,3.2]){g.beginPath();g.moveTo(21*k,sd*k);g.lineTo(28*k,sd*k-3);g.lineTo(26*k,sd*k);g.lineTo(28*k,sd*k+3);g.closePath();g.fill()}}
  g.restore()}
/* small wall-side buildings get walls on the open sides, with a doorway in the middle */
function wpWalls(g,s){const t=Math.max(S.wall,1),stone=S.wall>=2,col=stone?'#8c877f':'#8f6e46',th=stone?6:5,[ox,oy]=OUTV[s.side],x0=s.x0*T,y0=s.y0*T,x1=x0+s.w*T,y1=y0+s.h*T,vert=s.h>s.w,segs=[];
  if(vert){const ix=ox<0?x1:x0,mid=y0+Math.floor(s.h/2)*T;segs.push([ix,y0,ix,mid],[ix,mid+T,ix,y1],[x0,y0,x1,y0],[x0,y1,x1,y1])}
  else{const iy=oy<0?y1:y0,mid=x0+Math.floor(s.w/2)*T;segs.push([x0,iy,mid,iy],[mid+T,iy,x1,iy],[x0,y0,x0,y1],[x1,y0,x1,y1])}
  g.lineCap='square';g.strokeStyle=OUT;g.lineWidth=th+3;g.beginPath();for(const q of segs){g.moveTo(q[0],q[1]);g.lineTo(q[2],q[3])}g.stroke();g.strokeStyle=col;g.lineWidth=th;g.stroke();
  if(!stone){g.strokeStyle='rgba(40,25,10,.35)';g.lineWidth=1;g.setLineDash([3,5]);g.stroke();g.setLineDash([])}else{g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=1.5;g.stroke()}
  g.fillStyle='#5c4228';g.strokeStyle=OUT;g.lineWidth=1.3;if(vert){const ix=ox<0?x1:x0,mid=y0+Math.floor(s.h/2)*T;g.fillRect(ix-3,mid+3,6,T-6);g.strokeRect(ix-3,mid+3,6,T-6)}else{const iy=oy<0?y1:y0,mid=x0+Math.floor(s.w/2)*T;g.fillRect(mid+3,iy-3,T-6,6);g.strokeRect(mid+3,iy-3,T-6,6)}}
