/* ================= station and furniture art =================
   Work stations drawn into the static plot layer. Each fills one tile (bx,by); the worker stands below it. */
function woodTop(g,x,y,w,h,c){rr(g,x,y,w,h,2.5);const gr=g.createLinearGradient(x,y,x,y+h);gr.addColorStop(0,shadeHex(c||'#9a7448',1.12));gr.addColorStop(1,shadeHex(c||'#9a7448',.9));g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.6;g.stroke();
  g.strokeStyle='rgba(60,36,14,.35)';g.lineWidth=.8;for(let k=1;k<4;k++){g.beginPath();g.moveTo(x+3,y+k*h/4);g.bezierCurveTo(x+w*.3,y+k*h/4-1.5,x+w*.6,y+k*h/4+1.5,x+w-3,y+k*h/4);g.stroke()}
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+2,y+h,w-4,2.5)}
function metalBox(g,x,y,w,h,c1,c2,r0){rr(g,x,y,w,h,r0||2);const gr=g.createLinearGradient(x,y,x,y+h);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.5;g.stroke();g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+2,y+1.5,w-4,1.4)}
function barrelTop(g,x,y,r,c){g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x+2,y+3,r,r*.8,0,0,7);g.fill();g.beginPath();g.arc(x,y,r,0,7);fs(g,c||'#7a5834',1.4);g.strokeStyle='#4a4f52';g.lineWidth=1.4;g.beginPath();g.arc(x,y,r*.72,0,7);g.stroke();g.fillStyle='rgba(255,230,190,.25)';g.beginPath();g.arc(x-r*.3,y-r*.3,r*.25,0,7);g.fill()}
function sackTop(g,x,y,c){g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(x+2,y+3,7,5,0,0,7);g.fill();g.beginPath();g.moveTo(x-6,y+5);g.quadraticCurveTo(x-8,y-4,x-3,y-6);g.lineTo(x+3,y-6);g.quadraticCurveTo(x+8,y-4,x+6,y+5);g.closePath();fs(g,c||'#c9b28a',1.2);g.strokeStyle='rgba(80,55,25,.6)';g.lineWidth=1;g.beginPath();g.moveTo(x-3,y-4);g.lineTo(x+3,y-4);g.stroke()}
function plantPot(g,x,y){g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(x+2,y+5,7,3,0,0,7);g.fill();rr(g,x-5,y,10,7,2);fs(g,'#b0603a',1.1);for(const[a,b,c]of[[-4,-4,'#5e8f44'],[3,-5,'#6fa652'],[0,-8,'#7fb85e']]){g.beginPath();g.ellipse(x+a,y+b,4,2.6,a*.2,0,7);fs(g,c,.9)}}
function toolGlyph(g,k,x,y,a){g.save();g.translate(x,y);g.rotate(a||0);g.lineCap='round';
  if(k==='saw'){g.beginPath();g.moveTo(0,0);g.lineTo(11,0);g.lineTo(11,3);g.lineTo(0,4);g.closePath();g.fillStyle='#c4ccd0';g.fill();g.strokeStyle=OUT;g.lineWidth=.8;g.stroke();rr(g,-5,-1,6,6,1.5);g.fillStyle='#8a5a34';g.fill();g.stroke()}
  else if(k==='hammer'){g.strokeStyle='#7a5834';g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.lineTo(10,0);g.stroke();g.fillStyle='#8d969c';g.fillRect(9,-3,4,6)}
  else if(k==='chisel'){g.strokeStyle='#a8b0b4';g.lineWidth=1.4;g.beginPath();g.moveTo(0,0);g.lineTo(6,0);g.stroke();g.strokeStyle='#8a5a34';g.lineWidth=2.2;g.beginPath();g.moveTo(-5,0);g.lineTo(0,0);g.stroke()}
  else if(k==='scissors'){g.strokeStyle='#c4ccd0';g.lineWidth=1.2;g.beginPath();g.moveTo(0,0);g.lineTo(8,3);g.moveTo(0,3);g.lineTo(8,0);g.stroke();g.strokeStyle='#c8382a';g.beginPath();g.arc(-2,-1,1.8,0,7);g.arc(-2,4,1.8,0,7);g.stroke()}
  else if(k==='tongs'){g.strokeStyle='#4f5357';g.lineWidth=1.4;g.beginPath();g.moveTo(0,0);g.lineTo(11,1);g.moveTo(0,2);g.lineTo(11,1);g.stroke()}
  else if(k==='knife'){g.fillStyle='#d6dde1';g.beginPath();g.moveTo(0,-1.5);g.lineTo(9,0);g.lineTo(0,1.5);g.fill();g.fillStyle='#4a3020';g.fillRect(-5,-1.5,5,3)}
  g.restore()}
/* hydroponic trough: brushed metal tub, nutrient water with a sheen, grow light from tier 1 */
function hydroBasin(g,bx,by,t){g.fillStyle='rgba(0,0,0,.24)';rr(g,bx+3.5,by+6.5,T-5,T-7,5);g.fill();
  rr(g,bx+2,by+4,T-4,T-8,5);const gr=g.createLinearGradient(bx,by+4,bx,by+T-4);gr.addColorStop(0,'#a3acb2');gr.addColorStop(1,'#6a7378');g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.6;g.stroke();
  rr(g,bx+5,by+7,T-10,T-14,3);const w=g.createLinearGradient(bx,by+7,bx,by+T-7);w.addColorStop(0,'#2a5a63');w.addColorStop(1,'#3f8a92');g.fillStyle=w;g.fill();g.strokeStyle='rgba(20,30,34,.6)';g.lineWidth=1;g.stroke();
  g.strokeStyle='rgba(190,240,245,.45)';g.lineWidth=1;g.lineCap='round';g.beginPath();g.moveTo(bx+8,by+9.5);g.lineTo(bx+T-12,by+9.5);g.stroke();
  g.fillStyle='rgba(255,255,255,.22)';g.fillRect(bx+5,by+5,T-10,1.2);
  for(const a of[8,T/2,T-8]){g.beginPath();g.arc(bx+a,by+T-9,1.3,0,7);g.fillStyle='rgba(120,200,140,.55)';g.fill()}
  if(t>=1){rr(g,bx+6,by+.5,T-12,3.2,1.6);fs(g,'#3a3d40',1);g.fillStyle=t>=2?'#f2b8f6':'#e3a8ea';g.fillRect(bx+8,by+1.5,T-16,1.3);g.fillStyle='rgba(235,150,245,.10)';rr(g,bx+3,by+3,T-6,T-6,4);g.fill()}}
function hydroPipes(g,cells,px,py){const rows={};for(const[x,y]of cells)(rows[y]=rows[y]||[]).push(x);g.lineCap='round';
  for(const y in rows){const xs=rows[y],a=Math.min(...xs),b=Math.max(...xs),yy=py+(+y)*T+T-2.5;g.strokeStyle=OUT;g.lineWidth=4;g.beginPath();g.moveTo(px+a*T+6,yy);g.lineTo(px+b*T+T-6,yy);g.stroke();g.strokeStyle='#8d969c';g.lineWidth=2;g.stroke()}}
/* tree nursery bed: mulched mound with a staked sapling (the grown tree itself is drawn as a plant) */
function treeMound(g,cx,cy,t,seed){g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(cx+1.5,cy+2,T*.4,T*.17,0,0,7);g.fill();
  g.beginPath();g.ellipse(cx,cy,T*.38,T*.17,0,0,7);const gr=g.createRadialGradient(cx-3,cy-2,1,cx,cy,T*.4);gr.addColorStop(0,'#6a5038');gr.addColorStop(1,'#3e2e1e');g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.2;g.stroke();
  g.fillStyle='rgba(150,110,70,.55)';for(let k=0;k<5;k++){const a=(seed+k*2.4)%6.28,r=T*(.12+((seed*7+k*3)%5)*.04);g.fillRect(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.42,2,1)}
  if(t>=1){g.strokeStyle='#8a6a48';g.lineWidth=1.4;g.beginPath();g.moveTo(cx+4,cy+1);g.lineTo(cx+4,cy-9);g.stroke();g.strokeStyle='rgba(220,200,150,.8)';g.lineWidth=1;g.beginPath();g.moveTo(cx+4,cy-6);g.lineTo(cx+1,cy-6);g.stroke()}
  if(t>=2){g.strokeStyle='rgba(110,170,210,.5)';g.lineWidth=1;g.beginPath();g.ellipse(cx,cy,T*.3,T*.11,0,0,7);g.stroke()}}
function drawStation(g,p,bx,by,t){const ty=p.type,cx=bx+T/2,cy=by+T/2;
  switch(ty){
    case 'kitchen':{if(t===0)return false;rr(g,bx+1,by+2,T-2,T-4,3);const gr=g.createLinearGradient(bx,by,bx,by+T);gr.addColorStop(0,'#55595c');gr.addColorStop(1,'#34373a');g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.8;g.stroke();
      for(const[a,b]of[[9,10],[23,10]]){g.beginPath();g.arc(bx+a,by+b,5,0,7);fs(g,'#1e2022',1);g.strokeStyle='rgba(255,120,40,.55)';g.lineWidth=1;g.beginPath();g.arc(bx+a,by+b,3.2,0,7);g.stroke()}
      g.beginPath();g.arc(bx+23,by+10,5.6,0,7);fs(g,'#8d969c',1.2);g.fillStyle='rgba(200,170,110,.85)';g.beginPath();g.arc(bx+23,by+10,4,0,7);g.fill();
      rr(g,bx+5,by+18,T-10,9,2);g.fillStyle='#26282a';g.fill();g.fillStyle=t>=2?'rgba(255,140,50,.7)':'rgba(255,140,50,.45)';g.fillRect(bx+8,by+21,T-16,3);g.fillStyle='#c9a640';g.fillRect(bx+T/2-4,by+18.5,8,1.5);
      if(t>=3){g.fillStyle='#7fd07f';g.beginPath();g.arc(bx+T-5,by+5,1.4,0,7);g.fill()}return true}
    case 'workshop':{if(t===0)return false;woodTop(g,bx+1,by+5,T-2,T-11,'#9a7448');metalBox(g,bx+2,by+7,8,7,'#8d969c','#5d6266',1.5);toolGlyph(g,'saw',bx+14,by+10,.1);toolGlyph(g,'hammer',bx+12,by+19,-.2);toolGlyph(g,'chisel',bx+24,by+18,.6);
      g.fillStyle='rgba(230,200,150,.8)';for(const[a,b]of[[6,22],[9,24],[27,9]])g.fillRect(bx+a,by+b,2,1);if(t>=3){g.beginPath();g.arc(bx+25,by+11,4.5,0,7);fs(g,'#c4ccd0',1);g.strokeStyle='#5d6266';g.lineWidth=.8;for(let k=0;k<6;k++){const a=k*1.05;g.beginPath();g.moveTo(bx+25,by+11);g.lineTo(bx+25+Math.cos(a)*4.5,by+11+Math.sin(a)*4.5);g.stroke()}}return true}
    case 'tailor':{woodTop(g,bx+1,by+5,T-2,T-11,'#a8825a');for(const[k,c]of[[0,'#5a6f80'],[1,'#a8443a'],[2,'#e8e2d0']]){const y=by+8+k*5;rr(g,bx+3,y,12,4.5,2.2);fs(g,t>=1||k<2?c:'#c9b28a',.9);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(bx+4,y+.8,10,1)}
      toolGlyph(g,'scissors',bx+19,by+19);g.beginPath();g.arc(bx+25,by+10,3.2,0,7);fs(g,'#c8382a',1);g.beginPath();g.arc(bx+25,by+10,1.2,0,7);g.fillStyle='#e8e2d0';g.fill();
      if(t>=2){metalBox(g,bx+17,by+6,10,7,'#3d4246','#24272a',2);g.strokeStyle='#c9a640';g.lineWidth=1;g.beginPath();g.moveTo(bx+19,by+9.5);g.lineTo(bx+25,by+9.5);g.stroke()}return true}
    case 'weaponsmith':case 'armorsmith':{g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(cx+2,by+T-5,11,4,0,0,7);g.fill();g.beginPath();g.ellipse(cx,by+T-8,9,5,0,0,7);fs(g,'#7a5834',1.4);g.strokeStyle='rgba(50,30,12,.5)';g.lineWidth=.8;g.beginPath();g.ellipse(cx,by+T-8,6,3.2,0,0,7);g.stroke();
      g.beginPath();g.moveTo(bx+4,by+11);g.lineTo(bx+28,by+11);g.quadraticCurveTo(bx+26,by+14,bx+22,by+16);g.lineTo(bx+20,by+22);g.lineTo(bx+12,by+22);g.lineTo(bx+10,by+16);g.quadraticCurveTo(bx+6,by+14,bx+4,by+11);g.closePath();const gr=g.createLinearGradient(bx,by+9,bx,by+22);gr.addColorStop(0,'#7b8186');gr.addColorStop(1,'#3a3e42');g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.6;g.stroke();g.fillStyle='rgba(255,255,255,.3)';g.fillRect(bx+8,by+11.5,16,1.5);
      toolGlyph(g,'tongs',bx+3,by+5,.15);if(ty==='armorsmith'){g.beginPath();g.ellipse(bx+T-6,by+6,4.5,3.5,0,0,7);fs(g,'#a3aab0',1)}if(t>=2){g.beginPath();g.arc(bx+T-4,by+T-6,4,0,7);fs(g,'#b8b2a2',1.2);g.beginPath();g.arc(bx+T-4,by+T-6,1.2,0,7);g.fillStyle='#4a4f52';g.fill()}return true}
    case 'refinery':{metalBox(g,bx+2,by+4,T-12,T-8,'#9aa2a8','#5d6266',8);g.fillStyle='#4a4f52';for(const[a,b]of[[6,7],[14,7],[6,T-8],[14,T-8]]){g.beginPath();g.arc(bx+a,by+b,1,0,7);g.fill()}
      g.beginPath();g.arc(bx+11,by+T/2,4.5,0,7);fs(g,'#e8e2d0',1);g.strokeStyle='#b8322a';g.lineWidth=1.2;g.beginPath();g.moveTo(bx+11,by+T/2);g.lineTo(bx+13.5,by+T/2-2.5);g.stroke();
      g.strokeStyle=OUT;g.lineWidth=4;g.beginPath();g.moveTo(bx+T-10,by+10);g.lineTo(bx+T-3,by+10);g.lineTo(bx+T-3,by+T-6);g.stroke();g.strokeStyle='#8d969c';g.lineWidth=2.2;g.stroke();barrelTop(g,bx+T-5,by+T-5,5,'#b8322a');return true}
    case 'munitions':{woodTop(g,bx+1,by+5,T-2,T-11,'#6b6a52');for(let k=0;k<4;k++){rr(g,bx+4+k*5.5,by+8,4,10,1.5);fs(g,'#c9a640',.9);g.fillStyle='#8a6a30';g.fillRect(bx+4+k*5.5,by+15,4,1.2)}
      barrelTop(g,bx+T-7,by+T-9,5,'#5f6448');g.fillStyle='#e8c040';for(let k=0;k<4;k++){g.save();g.beginPath();g.rect(bx+2,by+T-6,14,3);g.clip();g.fillRect(bx+2+k*4,by+T-6,2,3);g.restore()}return true}
    case 'fabrication':{metalBox(g,bx+1,by+2,T-2,T-6,'#5d6266','#3a3e42',3);rr(g,bx+5,by+5,T-10,9,2);g.fillStyle='#0f1a1c';g.fill();g.fillStyle='#4ee6c8';g.fillRect(bx+7,by+7,(T-14)*.7,1.6);g.fillRect(bx+7,by+10,(T-14)*.45,1.6);
      for(const[k,c]of[[0,'#d8b04a'],[1,'#8fc46a'],[2,'#d86a52']]){g.fillStyle=c;g.beginPath();g.arc(bx+8+k*6,by+T-8,1.8,0,7);g.fill()}g.strokeStyle=OUT;g.lineWidth=3.5;g.beginPath();g.moveTo(bx+T-6,by+T-6);g.lineTo(bx+T-3,by+T-14);g.lineTo(bx+T-9,by+T-17);g.stroke();g.strokeStyle='#e0a030';g.lineWidth=2;g.stroke();return true}
    case 'research':{woodTop(g,bx+1,by+5,T-2,T-11,'#8a6a48');g.save();g.translate(bx+11,by+14);g.rotate(-.12);g.fillStyle='#efeadc';g.fillRect(-7,-5,14,10);g.strokeStyle=OUT;g.lineWidth=.9;g.strokeRect(-7,-5,14,10);g.strokeStyle='rgba(60,50,40,.45)';g.lineWidth=.7;for(let k=-2;k<=2;k+=2){g.beginPath();g.moveTo(-5,k);g.lineTo(5,k);g.stroke()}g.restore();
      g.strokeStyle='#f2eee4';g.lineWidth=1.2;g.beginPath();g.moveTo(bx+16,by+20);g.lineTo(bx+21,by+13);g.stroke();
      if(t>=1){g.beginPath();g.arc(bx+25,by+11,4.2,0,7);fs(g,'#4a7aa8',1);g.strokeStyle='#8fc46a';g.lineWidth=1.2;g.beginPath();g.arc(bx+25,by+11,4.2,-1,.6);g.stroke()}else{g.fillStyle='#e8c060';g.beginPath();g.arc(bx+25,by+10,2.4,0,7);g.fill()}
      if(t>=3){metalBox(g,bx+19,by+15,10,7,'#3d4246','#24272a',1.5);g.fillStyle='#4ee6c8';g.fillRect(bx+21,by+17,6,2)}return true}
    case 'hunting':{woodTop(g,bx+1,by+5,T-2,T-11,'#8a6440');g.fillStyle='rgba(140,50,40,.35)';g.beginPath();g.ellipse(cx,cy,8,4,0,0,7);g.fill();rr(g,cx-6,cy-3,10,6,3);fs(g,'#b5544a',.9);g.fillStyle='#f0e0d0';g.fillRect(cx-4,cy-1,6,1.2);toolGlyph(g,'knife',bx+5,by+10,.3);return true}
    case 'construction':{g.strokeStyle=OUT;g.lineWidth=3.6;g.lineCap='round';for(const x of[7,T-7]){g.beginPath();g.moveTo(bx+x-4,by+T-4);g.lineTo(bx+x,by+10);g.lineTo(bx+x+4,by+T-4);g.stroke()}g.strokeStyle='#8a6440';g.lineWidth=2;for(const x of[7,T-7]){g.beginPath();g.moveTo(bx+x-4,by+T-4);g.lineTo(bx+x,by+10);g.lineTo(bx+x+4,by+T-4);g.stroke()}
      rr(g,bx+1,by+7,T-2,6,1.5);fs(g,'#c4a070',1.3);g.strokeStyle='rgba(80,50,20,.4)';g.lineWidth=.7;g.beginPath();g.moveTo(bx+4,by+10);g.lineTo(bx+T-4,by+10);g.stroke();toolGlyph(g,'saw',bx+10,by+16,-.3);return true}
  }
  return false}
/* small decor in free corners of work buildings */
function plotDecor(g,p,px,py,L,t){if(t<1||p.small)return;const busy=new Set([...(L.stations||[]).map(s=>s[0]+','+s[1]),...(L.rack||[]).map(s=>s[0]+','+s[1]),...(L.block||[]).map(s=>s[0]+','+s[1]),...(L.store||[]).map(s=>s[0]+','+s[1]),...(L.seats||[]).map(s=>s[0]+','+s[1])]);
  const r=mulberry(p.id*29+t);const spots=[[0,0],[4,0]].filter(([x,y])=>!busy.has(x+','+y));for(const[x,y]of spots){const k=Math.floor(r()*4),bx=px+x*T+T/2,by=py+y*T+T/2;
    if(k===0)barrelTop(g,bx,by,7,'#7a5834');else if(k===1){crate(g,bx-8,by-8,14,'#9a7448');sackTop(g,bx+6,by+6)}else if(k===2)plantPot(g,bx,by);else{sackTop(g,bx-4,by);sackTop(g,bx+5,by+3,'#b8a070')}}}
/* corner towers (wall upgrade): squat towers with a shingled roof (wood) or crenellated stone top */
function drawCornerTower(g,cx,cy,stone,id){const s=T*.78;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx+7,cy+9,s*1.05,s*.9,0,0,7);g.fill();
  if(!stone){g.beginPath();g.arc(cx,cy,s,0,7);const gr=g.createRadialGradient(cx-6,cy-6,2,cx,cy,s);gr.addColorStop(0,'#9a7448');gr.addColorStop(1,'#6b4a2a');g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=2.2;g.stroke();
    for(let k=0;k<16;k++){const a=k/16*Math.PI*2;g.strokeStyle='rgba(40,24,10,.45)';g.lineWidth=1;g.beginPath();g.moveTo(cx+Math.cos(a)*s*.25,cy+Math.sin(a)*s*.25);g.lineTo(cx+Math.cos(a)*s*.96,cy+Math.sin(a)*s*.96);g.stroke()}
    for(let ring=1;ring<4;ring++){g.strokeStyle='rgba(40,24,10,.35)';g.lineWidth=1;g.beginPath();g.arc(cx,cy,s*ring/4,0,7);g.stroke()}
    g.beginPath();g.arc(cx,cy,4,0,7);fs(g,'#5c4228',1.2);g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.moveTo(cx,cy-4);g.lineTo(cx,cy-16);g.stroke();g.fillStyle='#a8443a';g.beginPath();g.moveTo(cx,cy-16);g.lineTo(cx+9,cy-13);g.lineTo(cx,cy-10);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=.8;g.stroke();return}
  rr(g,cx-s,cy-s,s*2,s*2,3);g.save();g.clip();masonry(g,cx-s,cy-s,s*2,s*2,id*11+3);g.restore();g.strokeStyle=OUT;g.lineWidth=2.4;rr(g,cx-s,cy-s,s*2,s*2,3);g.stroke();
  const ins=s*.62;g.fillStyle='#5e5952';g.fillRect(cx-ins,cy-ins,ins*2,ins*2);masonry(g,cx-ins+1,cy-ins+1,ins*2-2,ins*2-2,id*5+1,true);g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=1.4;g.strokeRect(cx-ins,cy-ins,ins*2,ins*2);
  const m=s*.42;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1],[-1,0],[1,0]]){const x=cx+a*(s-m*.55),y=cy+b*(s-m*.55);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x-m/2+2,y-m/2+2,m,m);g.fillStyle='#a39e94';g.fillRect(x-m/2,y-m/2,m,m);g.strokeStyle=OUT;g.lineWidth=1.2;g.strokeRect(x-m/2,y-m/2,m,m);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x-m/2,y-m/2,m,1.5)}
  g.fillStyle='#3a3e42';g.beginPath();g.arc(cx,cy,3,0,7);g.fill();g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx,cy-18);g.stroke();g.fillStyle='#9a3b2e';g.beginPath();g.moveTo(cx,cy-18);g.quadraticCurveTo(cx+6,cy-19,cx+11,cy-15);g.quadraticCurveTo(cx+6,cy-13,cx,cy-12);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=.8;g.stroke()}
