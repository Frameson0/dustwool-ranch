/* ================= gear art: weapons, armor, tools, doors and gates =================
   drawWeapon draws a weapon side-on, pointing along +x with the grip at the origin (32 units = s px).
   The same drawing serves the item icon (tilted) and the weapon in a colonist's hands. */
const WTIP={bow:7,recurve:7,spear:33,steelspear:33,rifle:27,sniper:33,assault:21,lmg:27,charge:24,longsword:27,zweihander:35,monosword:29,warhammer:23};
const WREAR={bow:2,recurve:2,spear:18,steelspear:18,rifle:15,sniper:15,assault:15,lmg:14,charge:12,longsword:10,zweihander:12,monosword:10,warhammer:13};
function wstroke(g,c,w,fill){g.strokeStyle=OUT;g.lineWidth=w+2.2;g.stroke();g.strokeStyle=c;g.lineWidth=w;g.stroke()}
function wpoly(g,pts,fill,lw){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=OUT;g.lineWidth=lw||1.1;g.stroke()}
function drawWeapon(g,w,s){const k=s/32;g.save();g.scale(k,k);g.lineJoin='round';g.lineCap='round';
  switch(w){
    case 'bow':case 'recurve':{const rc=w==='recurve';g.beginPath();if(rc){g.moveTo(-1,-15);g.quadraticCurveTo(2,-14,4,-11);g.quadraticCurveTo(12,0,4,11);g.quadraticCurveTo(2,14,-1,15)}else{g.moveTo(1,-15);g.quadraticCurveTo(13,0,1,15)}wstroke(g,rc?'#6b3f22':'#a8743e',2.6);
      g.strokeStyle='rgba(255,230,180,.35)';g.lineWidth=.8;g.beginPath();if(rc){g.moveTo(5,-9);g.quadraticCurveTo(10.5,0,5,9)}else{g.moveTo(3,-11);g.quadraticCurveTo(10,0,3,11)}g.stroke();
      g.strokeStyle='#ece4cf';g.lineWidth=.8;g.beginPath();g.moveTo(rc?-1:1,-15);g.lineTo(rc?-1:1,15);g.stroke();rr(g,4.5,-3,4,6,1.2);g.fillStyle='#4a3020';g.fill();g.strokeStyle=OUT;g.lineWidth=.8;g.stroke();break}
    case 'spear':case 'steelspear':{const st=w==='steelspear';g.beginPath();g.moveTo(-18,0);g.lineTo(23,0);wstroke(g,'#8a6440',2.4);g.strokeStyle='rgba(255,230,180,.3)';g.lineWidth=.7;g.beginPath();g.moveTo(-16,-.6);g.lineTo(21,-.6);g.stroke();
      g.fillStyle='#5a3a22';for(const x of[-1,2])g.fillRect(x,-1.7,2,3.4);
      if(st){wpoly(g,[[22,0],[25,-3.2],[33,0],[25,3.2]],'#d6dde1');g.strokeStyle='#8a949a';g.lineWidth=.8;g.beginPath();g.moveTo(23,0);g.lineTo(32,0);g.stroke();g.fillStyle='#5f666b';g.fillRect(21,-1.8,2,3.6)}
      else{wpoly(g,[[22,0],[25,-2.8],[32,0],[25,2.8]],'#8f8b80');g.fillStyle='#cfc2a0';g.fillRect(20.5,-1.6,2,3.2)}break}
    case 'rifle':case 'sniper':{const sn=w==='sniper',L=sn?33:27;
      wpoly(g,[[-15,1],[-7,-1.6],[2,-1.6],[2,2.2],[-4,2.2],[-7,4.5],[-15,5.5]],'#8a5a34');g.strokeStyle='rgba(255,220,170,.25)';g.lineWidth=.8;g.beginPath();g.moveTo(-13,1.6);g.lineTo(-7,-.4);g.stroke();
      rr(g,-3,-2.6,10,4.2,1);g.fillStyle='#5b6165';g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
      wpoly(g,[[6,-1.2],[18,-1.2],[18,1.6],[6,1.8]],'#7a4e2c',1);
      g.beginPath();g.moveTo(7,-1.6);g.lineTo(L,-1.6);wstroke(g,'#3b4044',1.6);
      g.beginPath();g.arc(2,-3.4,1.2,0,7);g.fillStyle='#3b4044';g.fill();g.strokeStyle=OUT;g.lineWidth=.6;g.stroke();
      g.strokeStyle=OUT;g.lineWidth=.9;g.beginPath();g.arc(0,2.6,2,0,Math.PI);g.stroke();
      if(sn){rr(g,-2,-7.2,12,3,1.4);g.fillStyle='#2e3236';g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();g.fillStyle='#7fd0ff';g.fillRect(9.4,-6.6,.9,1.8);g.fillStyle='#2e3236';g.fillRect(1,-4.3,1.4,1.4);g.fillRect(6,-4.3,1.4,1.4);
        g.strokeStyle='#3b4044';g.lineWidth=1;g.beginPath();g.moveTo(22,-.6);g.lineTo(20,5);g.moveTo(22,-.6);g.lineTo(25,5);g.stroke()}
      else{g.fillStyle='#3b4044';g.fillRect(25,-3.2,1.2,1.8)}break}
    case 'assault':{wpoly(g,[[-15,-.5],[-6,-1.5],[-6,2.6],[-9,2.6],[-15,4]],'#2f3438');g.fillStyle='#4a5055';g.fillRect(-13,.4,5,1.2);
      rr(g,-6,-3,15,5.6,1);g.fillStyle='#3a4045';g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
      wpoly(g,[[1,2.6],[5,2.6],[6.5,9],[3,9.6]],'#2b2f33');
      rr(g,9,-2.2,8,4,1);g.fillStyle='#4a5055';g.fill();g.strokeStyle=OUT;g.lineWidth=.9;g.stroke();g.fillStyle='#23272a';for(let x=10;x<16;x+=2)g.fillRect(x,-1.4,1,1);
      g.beginPath();g.moveTo(17,-.6);g.lineTo(21,-.6);wstroke(g,'#26292c',1.4);rr(g,-2,-5,5,2,.6);g.fillStyle='#26292c';g.fill();
      g.fillStyle='#5a6066';g.fillRect(-1,-.4,3,1);break}
    case 'lmg':{wpoly(g,[[-14,0],[-6,-2],[-6,3],[-14,5]],'#4a5048');rr(g,-6,-4,18,7.4,1.2);g.fillStyle='#545a52';g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
      rr(g,-1,3.2,8,6.6,1);g.fillStyle='#6b7348';g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();g.fillStyle='#c9a640';g.fillRect(0,5.6,6,1);
      g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();g.moveTo(-1,-4);g.quadraticCurveTo(3,-8.5,7,-4);g.stroke();
      rr(g,12,-2.4,10,4.4,1);g.fillStyle='#3a3f3a';g.fill();g.strokeStyle=OUT;g.lineWidth=.9;g.stroke();g.fillStyle='#1e2220';for(let x=13.5;x<21;x+=2.2)g.fillRect(x,-1.2,1.2,1.8);
      g.beginPath();g.moveTo(22,-.2);g.lineTo(27,-.2);wstroke(g,'#2a2e2a',1.8);g.strokeStyle='#3a3f3a';g.lineWidth=1;g.beginPath();g.moveTo(20,2);g.lineTo(18,8);g.moveTo(20,2);g.lineTo(23,8);g.stroke();break}
    case 'charge':{wpoly(g,[[-12,-1],[-4,-2.5],[-4,3],[-12,4]],'#cfd5d9');wpoly(g,[[-5,-3.4],[14,-3.4],[19,-1.4],[19,1.6],[10,2.8],[-5,2.8]],'#e3e8eb');
      g.fillStyle='#3d444a';g.fillRect(-3,2.8,4,5);g.strokeStyle=OUT;g.lineWidth=.8;g.strokeRect(-3,2.8,4,5);g.fillStyle='#3d444a';g.fillRect(2,-2,12,1.4);
      for(let x=3;x<13;x+=3.2){g.fillStyle='#35d8ff';g.fillRect(x,.2,2,1.4)}g.fillStyle='rgba(53,216,255,.35)';g.fillRect(2,-.4,12,2.6);
      g.beginPath();g.moveTo(19,0);g.lineTo(24,0);wstroke(g,'#5a6268',1.6);g.fillStyle='#7ff0ff';g.beginPath();g.arc(24,0,1.2,0,7);g.fill();break}
    case 'longsword':case 'zweihander':case 'monosword':{const zw=w==='zweihander',mono=w==='monosword',L=zw?35:mono?29:27,gr=zw?11:8;
      g.beginPath();g.moveTo(-gr,0);g.lineTo(0,0);wstroke(g,'#4a3020',2.4);g.strokeStyle='rgba(255,220,170,.35)';g.lineWidth=.6;for(let x=-gr+1;x<0;x+=2){g.beginPath();g.moveTo(x,-1);g.lineTo(x+1,1);g.stroke()}
      g.beginPath();g.arc(-gr-1.2,0,1.8,0,7);g.fillStyle='#b89a4a';g.fill();g.strokeStyle=OUT;g.lineWidth=.8;g.stroke();
      rr(g,-1,zw?-6.5:-5,2.2,zw?13:10,1);g.fillStyle=mono?'#3a4046':'#b89a4a';g.fill();g.strokeStyle=OUT;g.lineWidth=.9;g.stroke();
      const bw=zw?2.4:mono?1.4:2;wpoly(g,[[1.2,-bw],[L-3,-bw*.8],[L,0],[L-3,bw*.8],[1.2,bw]],mono?'#2c3238':'#dfe5e8',1);
      if(mono){g.strokeStyle='#4ee6ff';g.lineWidth=.9;g.beginPath();g.moveTo(2,-bw+.4);g.lineTo(L-2,-bw*.7);g.stroke();g.strokeStyle='rgba(78,230,255,.35)';g.lineWidth=2.4;g.stroke()}
      else{g.strokeStyle='#9aa4aa';g.lineWidth=.7;g.beginPath();g.moveTo(2,0);g.lineTo(L-6,0);g.stroke();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=.6;g.beginPath();g.moveTo(3,-bw+.5);g.lineTo(L-5,-bw*.6);g.stroke()}break}
    case 'warhammer':{g.beginPath();g.moveTo(-13,0);g.lineTo(19,0);wstroke(g,'#6b4a2a',2.2);g.fillStyle='#5f666b';g.fillRect(-4,-1.6,6,3.2);g.fillStyle='#4a3020';g.fillRect(-12,-1.4,6,2.8);
      wpoly(g,[[17,-5.5],[23,-5.5],[23,5.5],[17,5.5]],'#8d969c');wpoly(g,[[23,-2.5],[28,0],[23,2.5]],'#b8c0c4');wpoly(g,[[17,-2],[13,0],[17,2]],'#8d969c');g.fillStyle='rgba(255,255,255,.35)';g.fillRect(18,-5,1.4,10);break}
  }
  g.restore()}
function weaponIcon(g,w,cx,cy,s){g.save();g.translate(cx,cy);const bow=w==='bow'||w==='recurve';if(bow){const sc=s*.9/32;g.translate(-5*sc,0);drawWeapon(g,w,32*sc)}else{g.rotate(-.62);const a=-WREAR[w],b=WTIP[w],sc=s*1.08/(b-a);g.translate(-(a+b)/2*sc,0);drawWeapon(g,w,32*sc)}g.restore()}
/* armor: icons and on the body */
const ARMOR_COL={woodarmor:['#a37a4a','#7a5834'],leatherarmor:['#9c6b40','#6e4628'],flakvest:['#5f6b48','#434c33'],plate:['#b9c0c5','#7f878d'],recon:['#4b5862','#2f3a42'],marine:['#5b6874','#38424b']};
function torsoPath(g,cx,cy,s,bulk){const w=s*(.27+bulk*.05),h=s*.3;g.beginPath();g.moveTo(cx-w*.45,cy-h);g.quadraticCurveTo(cx,cy-h+s*.1,cx+w*.45,cy-h);g.lineTo(cx+w,cy-h*.75);g.lineTo(cx+w*.85,cy+h*.2);g.lineTo(cx+w*.7,cy+h);g.lineTo(cx-w*.7,cy+h);g.lineTo(cx-w*.85,cy+h*.2);g.lineTo(cx-w,cy-h*.75);g.closePath()}
function armorIcon(g,a,cx,cy,s){const[c1,c2]=ARMOR_COL[a],lw=Math.max(1,s*.045),bulk=a==='marine'?1:a==='plate'||a==='recon'?.5:0;
  torsoPath(g,cx,cy+s*.02,s,bulk);const gr=g.createLinearGradient(cx-s*.3,cy-s*.3,cx+s*.3,cy+s*.3);gr.addColorStop(0,shadeHex(c1,1.12));gr.addColorStop(1,c1);g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=lw;g.stroke();
  g.save();torsoPath(g,cx,cy+s*.02,s,bulk);g.clip();
  if(a==='woodarmor'){g.strokeStyle='rgba(50,30,12,.5)';g.lineWidth=lw*.8;for(const x of[-.12,0,.12]){g.beginPath();g.moveTo(cx+x*s,cy-s*.3);g.lineTo(cx+x*s,cy+s*.34);g.stroke()}g.strokeStyle='#d2b07a';g.lineWidth=lw*1.4;g.beginPath();g.moveTo(cx-s*.24,cy-s*.22);g.lineTo(cx+s*.24,cy+s*.2);g.stroke()}
  else if(a==='leatherarmor'){g.strokeStyle='rgba(240,210,160,.6)';g.lineWidth=lw*.7;g.setLineDash([lw*1.4,lw*1.4]);g.beginPath();g.moveTo(cx-s*.18,cy-s*.2);g.lineTo(cx-s*.16,cy+s*.3);g.moveTo(cx+s*.18,cy-s*.2);g.lineTo(cx+s*.16,cy+s*.3);g.stroke();g.setLineDash([]);g.fillStyle=c2;g.fillRect(cx-s*.3,cy+s*.08,s*.6,s*.07);g.fillStyle='#d8b860';g.fillRect(cx-s*.04,cy+s*.07,s*.08,s*.09)}
  else if(a==='flakvest'){g.fillStyle=c2;for(const x of[-.15,.03])for(const y of[.04,.18]){rr(g,cx+x*s,cy+y*s,s*.12,s*.1,lw);g.fill()}g.fillStyle='#2f3524';g.fillRect(cx-s*.3,cy-s*.06,s*.6,s*.04)}
  else if(a==='plate'){g.fillStyle='rgba(255,255,255,.35)';g.fillRect(cx-s*.02,cy-s*.26,s*.04,s*.56);g.strokeStyle=c2;g.lineWidth=lw;for(const y of[.12,.22]){g.beginPath();g.moveTo(cx-s*.3,cy+y*s);g.lineTo(cx+s*.3,cy+y*s);g.stroke()}}
  else if(a==='recon'){g.fillStyle=c2;g.fillRect(cx-s*.3,cy-s*.04,s*.6,s*.08);g.fillStyle='#4ee6ff';g.fillRect(cx-s*.16,cy-s*.02,s*.32,s*.03);g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=lw;g.beginPath();g.moveTo(cx-s*.2,cy-s*.22);g.lineTo(cx-s*.05,cy-s*.1);g.stroke()}
  else if(a==='marine'){g.fillStyle=c2;rr(g,cx-s*.14,cy-s*.12,s*.28,s*.2,lw*2);g.fill();g.fillStyle='#4ee6ff';g.beginPath();g.arc(cx,cy-s*.02,s*.05,0,7);g.fill();g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=lw;g.beginPath();g.moveTo(cx-s*.26,cy+s*.24);g.lineTo(cx+s*.26,cy+s*.24);g.stroke()}
  g.restore();
  if(a==='plate'||a==='recon'||a==='marine'){const pr=a==='marine'?.13:.1;for(const sd of[-1,1]){E(g,cx+sd*s*.3,cy-s*.2,s*pr,s*pr*.8);fs(g,c2,lw)}}}
function helmIcon(g,h,cx,cy,s){const lw=Math.max(1,s*.045);
  if(h==='marinehelm'){g.beginPath();g.arc(cx,cy,s*.28,0,7);const gr=g.createRadialGradient(cx-s*.1,cy-s*.1,1,cx,cy,s*.3);gr.addColorStop(0,'#6a7682');gr.addColorStop(1,'#323b43');g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=lw;g.stroke();rr(g,cx-s*.2,cy-s*.06,s*.4,s*.12,s*.05);g.fillStyle='#4ee6ff';g.fill();g.strokeStyle=OUT;g.lineWidth=lw*.8;g.stroke();g.fillStyle='#2a3036';for(const x of[-.1,0,.1])g.fillRect(cx+x*s-1,cy+s*.14,2,s*.07);return}
  const adv=h==='advhelmet',col=adv?'#6f777e':'#a3aab0';g.beginPath();g.moveTo(cx-s*.3,cy+s*.1);g.quadraticCurveTo(cx-s*.28,cy-s*.28,cx,cy-s*.28);g.quadraticCurveTo(cx+s*.28,cy-s*.28,cx+s*.3,cy+s*.1);g.closePath();const gr=g.createLinearGradient(cx,cy-s*.3,cx,cy+s*.1);gr.addColorStop(0,shadeHex(col,1.2));gr.addColorStop(1,col);g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=lw;g.stroke();
  g.beginPath();g.ellipse(cx,cy+s*.1,s*.36,s*.06,0,0,7);fs(g,shadeHex(col,.85),lw);
  if(adv){g.fillStyle='#1c2024';g.fillRect(cx-s*.2,cy-s*.06,s*.4,s*.07);g.fillStyle='rgba(120,220,255,.6)';g.fillRect(cx-s*.16,cy-s*.05,s*.12,s*.025)}else{g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(cx-s*.1,cy-s*.16,s*.06,s*.03,-.6,0,7);g.fill()}}
function shadeHex(h,f){h=h.replace('#','');const n=[0,2,4].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(h.slice(i,i+2),16)*f))));return'#'+n.map(v=>v.toString(16).padStart(2,'0')).join('')}
function drawBodyArmor(g,a,cx,by,face,s){const[c1,c2]=ARMOR_COL[a]||ARMOR_COL.woodarmor,back=face==='u',bulk=a==='marine'?1.12:a==='plate'||a==='recon'?1.05:1,bx=cx,bcy=by+s*.08,rx=s*.235*bulk,ry=s*.2*bulk;
  g.beginPath();g.ellipse(bx,bcy,rx,ry,0,0,7);const gr=g.createLinearGradient(bx-rx,bcy-ry,bx+rx,bcy+ry);gr.addColorStop(0,shadeHex(c1,1.15));gr.addColorStop(1,c1);g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.3;g.stroke();
  g.save();g.beginPath();g.ellipse(bx,bcy,rx,ry,0,0,7);g.clip();
  if(a==='woodarmor'){g.strokeStyle='rgba(50,30,12,.45)';g.lineWidth=1;for(const x of[-.08,0,.08]){g.beginPath();g.moveTo(bx+x*s,bcy-ry);g.lineTo(bx+x*s,bcy+ry);g.stroke()}g.strokeStyle='#d2b07a';g.lineWidth=1.6;g.beginPath();g.moveTo(bx-rx,bcy-ry*.6);g.lineTo(bx+rx,bcy+ry*.6);g.stroke()}
  else if(a==='leatherarmor'){g.strokeStyle='rgba(240,210,160,.55)';g.lineWidth=.8;g.setLineDash([1.6,1.6]);g.beginPath();g.ellipse(bx,bcy,rx*.78,ry*.74,0,0,7);g.stroke();g.setLineDash([]);g.fillStyle=c2;g.fillRect(bx-rx,bcy+ry*.25,rx*2,2.6);if(!back){g.fillStyle='#d8b860';g.fillRect(bx-1.6,bcy+ry*.2,3.2,3.4)}}
  else if(a==='flakvest'){g.fillStyle=c2;if(!back)for(const sd of[-1,1]){rr(g,bx+sd*s*.1-3,bcy+s*.02,6,5,1.2);g.fill()}g.fillStyle='#2f3524';g.fillRect(bx-rx,bcy-ry*.55,rx*2,2)}
  else if(a==='plate'){g.fillStyle='rgba(255,255,255,.38)';g.fillRect(bx-s*.06,bcy-ry,2.2,ry*2);g.strokeStyle=c2;g.lineWidth=1;for(const k of[.35,.65]){g.beginPath();g.moveTo(bx-rx,bcy-ry+ry*2*k);g.lineTo(bx+rx,bcy-ry+ry*2*k);g.stroke()}}
  else if(a==='recon'){g.fillStyle=c2;g.fillRect(bx-rx,bcy-2,rx*2,4);if(!back){g.fillStyle='#4ee6ff';g.fillRect(bx-s*.08,bcy-1,s*.16,1.6)}}
  else if(a==='marine'){if(!back){g.fillStyle=c2;rr(g,bx-s*.09,bcy-s*.08,s*.18,s*.12,2);g.fill();g.fillStyle='#4ee6ff';g.beginPath();g.arc(bx,bcy-s*.02,1.8,0,7);g.fill()}g.fillStyle='rgba(255,255,255,.15)';g.fillRect(bx-rx,bcy-ry*.5,rx*2,1.4)}
  g.restore();
  if(a==='plate'||a==='recon'||a==='marine'){const pr=a==='marine'?.11:.085;for(const sd of[-1,1]){E(g,bx+sd*rx*.95,bcy-ry*.55,s*pr,s*pr*.72);const g2=g.createLinearGradient(0,bcy-ry,0,bcy);g2.addColorStop(0,shadeHex(c2,1.35));g2.addColorStop(1,c2);g.fillStyle=g2;g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke()}}}
function drawHelm(g,h,hx,hy,face,s){
  if(h==='marinehelm'){g.beginPath();g.arc(hx,hy,s*.225,0,7);const gr=g.createRadialGradient(hx-s*.07,hy-s*.08,1,hx,hy,s*.24);gr.addColorStop(0,'#69757f');gr.addColorStop(1,'#323b43');g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.5;g.stroke();
    if(face!=='u'){const o=face==='l'?-2.5:face==='r'?2.5:0;rr(g,hx-s*.14+o,hy-s*.05,s*.28,s*.08,3);g.fillStyle='#4ee6ff';g.fill();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(hx-s*.1+o,hy-s*.04,s*.06,1.2)}return}
  const adv=h==='advhelmet',col=adv?'#6f777e':'#a3aab0';g.beginPath();g.ellipse(hx,hy-s*.04,s*.225,s*.18,0,Math.PI,0);g.closePath();const gr=g.createLinearGradient(hx,hy-s*.22,hx,hy);gr.addColorStop(0,shadeHex(col,1.22));gr.addColorStop(1,col);g.fillStyle=gr;g.fill();g.strokeStyle=OUT;g.lineWidth=1.4;g.stroke();
  g.beginPath();g.ellipse(hx,hy-s*.04,s*.25,s*.045,0,0,7);fs(g,shadeHex(col,.85),1.1);
  if(adv&&face!=='u'){const o=face==='l'?-2:face==='r'?2:0;g.fillStyle='rgba(20,24,28,.9)';g.fillRect(hx-s*.15+o,hy-s*.1,s*.3,3);g.fillStyle='rgba(120,220,255,.7)';g.fillRect(hx-s*.12+o,hy-s*.095,s*.08,1.2)}
  if(!adv){g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(hx-s*.08,hy-s*.15,s*.05,s*.022,-.5,0,7);g.fill()}}
/* held weapons: aim at the target, recoil and muzzle flash; melee weapons swing */
function drawHeld(g,e,w,cx,cy,bob,now,fighting){const melee=MELEE.includes(w),side=e.face==='l'?-1:1;let hx=cx+side*T*.22,hy=cy+T*.1-bob;if(e.face==='u'){hx=cx+T*.18;hy=cy}
  const atk=e.atkT&&now-e.atkT<300?(now-e.atkT)/300:-1;let a;
  if(melee){if(atk>=0){a=(e.atkA||0)-1.5+atk*2.8}else a=side>0?-1.15:Math.PI+1.15;if(e.face==='u'&&atk<0)a=-1.7}
  else{a=fighting&&e.aimA!==undefined?e.aimA:(side>0?.6:Math.PI-.6);if(!fighting&&e.face==='d')a=1.15;if(!fighting&&e.face==='u')a=-1.25}
  const bow=w==='bow'||w==='recurve';g.save();g.translate(hx,hy);g.rotate(a);if(Math.cos(a)<-.01)g.scale(1,-1);
  let rec=0;if(!melee&&e.shotT&&now-e.shotT<100)rec=-3.2*(1-(now-e.shotT)/100);g.translate(rec,0);
  drawWeapon(g,w,T*.9);
  if(bow&&fighting){const dr=e.aim||0;g.strokeStyle='#ece4cf';g.lineWidth=.9;g.beginPath();g.moveTo(.6,-13.4*.9*T/32);g.lineTo(-dr*6,0);g.lineTo(.6,13.4*.9*T/32);g.stroke();g.strokeStyle='#7a5834';g.lineWidth=1.4;g.beginPath();g.moveTo(-dr*6,0);g.lineTo(T*.5,0);g.stroke()}
  if(!melee&&!bow&&e.shotT&&now-e.shotT<70){const tx=WTIP[w]*T*.9/32;g.fillStyle='#ffe58a';g.beginPath();g.moveTo(tx,0);g.lineTo(tx+4,-3.5);g.lineTo(tx+10,0);g.lineTo(tx+4,3.5);g.closePath();g.fill();g.fillStyle='#fff8d8';g.beginPath();g.arc(tx+2,0,1.8,0,7);g.fill()}
  g.beginPath();g.arc(0,0,T*.062,0,7);fs(g,e.skin,1);if(!melee&&!bow){g.beginPath();g.arc(T*.3,1,T*.055,0,7);fs(g,e.skin,1)}
  g.restore()}
/* work tools and their motions */
function workKind(e){if(e.fireJob)return{t:'beater',m:'beat'};const j=e.job;if(!j)return null;
  switch(j.t){case 'craft':{const p=plotById(j.pid),ty=p&&p.type;return ty==='kitchen'?{t:'spoon',m:'stir'}:ty==='tailor'?{t:'needle',m:'sew'}:(ty==='refinery'||ty==='fabrication'||ty==='munitions')?{t:'wrench',m:'twist'}:{t:'hammer',m:'strike',p:620,spark:ty==='weaponsmith'||ty==='armorsmith'}}
    case 'mine':return{t:'pick',m:'strike',p:760,spark:true};case 'con':case 'repair':return{t:'hammer',m:'strike',p:560};
    case 'harvest':return{t:'sickle',m:'sweep'};case 'sow':return{t:'seedbag',m:'toss'};case 'tend':return{t:'bucket',m:'hold'};case 'research':return{t:'quill',m:'sew'};
    case 'gather':{const o=S.outside.find(o=>o.id===j.oid);return o&&o.k==='tree'?{t:'axe',m:'strike',p:700}:o&&o.k==='rock'?{t:'pick',m:'strike',p:760,spark:true}:{t:'wrench',m:'twist'}}}
  return null}
function drawTool(g,t){const s=T;const handle=(l,c)=>{g.beginPath();g.moveTo(0,0);g.lineTo(l,0);g.strokeStyle=OUT;g.lineWidth=4;g.stroke();g.strokeStyle=c||'#8a6440';g.lineWidth=2.2;g.stroke()};g.lineCap='round';g.lineJoin='round';
  switch(t){case 'hammer':handle(s*.34);rr(g,s*.3,-s*.1,s*.12,s*.2,1.5);g.fillStyle='#8d969c';g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();g.fillStyle='rgba(255,255,255,.4)';g.fillRect(s*.31,-s*.09,s*.03,s*.18);break;
    case 'pick':handle(s*.38);g.beginPath();g.moveTo(s*.36,-s*.17);g.quadraticCurveTo(s*.45,0,s*.36,s*.17);g.strokeStyle=OUT;g.lineWidth=4.2;g.stroke();g.strokeStyle='#9aa2a8';g.lineWidth=2.4;g.stroke();break;
    case 'axe':handle(s*.38);wpoly(g,[[s*.28,-s*.03],[s*.4,-s*.14],[s*.45,-s*.01],[s*.4,s*.1],[s*.28,s*.05]],'#a3abb0');g.strokeStyle='#e8eef0';g.lineWidth=1;g.beginPath();g.moveTo(s*.41,-s*.12);g.lineTo(s*.445,-s*.01);g.stroke();break;
    case 'sickle':handle(s*.14,'#7a5834');g.beginPath();g.moveTo(s*.14,0);g.quadraticCurveTo(s*.42,-s*.04,s*.32,-s*.26);g.strokeStyle=OUT;g.lineWidth=3.6;g.stroke();g.strokeStyle='#c8d0d4';g.lineWidth=2;g.stroke();break;
    case 'spoon':handle(s*.36,'#c9a06a');E(g,s*.4,0,s*.06,s*.04);fs(g,'#c9a06a',1);break;
    case 'needle':g.beginPath();g.moveTo(0,0);g.lineTo(s*.16,0);g.strokeStyle='#d8dde0';g.lineWidth=1.2;g.stroke();g.strokeStyle='#c8382a';g.lineWidth=.8;g.beginPath();g.moveTo(s*.15,0);g.quadraticCurveTo(s*.2,s*.12,s*.06,s*.16);g.stroke();break;
    case 'wrench':handle(s*.28,'#8d969c');g.beginPath();g.arc(s*.32,0,s*.06,.6,5.7);g.strokeStyle=OUT;g.lineWidth=4;g.stroke();g.strokeStyle='#8d969c';g.lineWidth=2.4;g.stroke();break;
    case 'beater':handle(s*.32);E(g,s*.4,0,s*.1,s*.07,.3);fs(g,'#6b6f5a',1.1);break;
    case 'seedbag':E(g,s*.04,s*.04,s*.09,s*.08);fs(g,'#c9b28a',1);g.fillStyle='#6a8a3a';g.fillRect(s*.02,-s*.04,2,2);break;
    case 'bucket':rr(g,-s*.05,s*.02,s*.14,s*.14,2);fs(g,'#8a6a48',1);g.strokeStyle=OUT;g.lineWidth=1;g.beginPath();g.arc(s*.02,s*.02,s*.07,Math.PI,0);g.stroke();break;
    case 'quill':g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(s*.12,-s*.08,s*.24,-s*.04);g.quadraticCurveTo(s*.12,0,0,0);g.fillStyle='#f2eee4';g.fill();g.strokeStyle=OUT;g.lineWidth=.8;g.stroke();break}}
function drawWorkTool(g,e,cx,cy,now){const k=workKind(e);if(!k)return false;const side=e.face==='l'?-1:1,up=e.face==='u';let hx=cx+side*T*.22,hy=cy+T*.1;if(up){hx=cx+T*.16;hy=cy-T*.04}
  const P0=k.p||600,ph=((now/P0)+e.id*.37)%1;let a;
  switch(k.m){case 'strike':a=ph<.22?-1.9+ph/.22*2.3:.4-(ph-.22)/.78*2.3;break;case 'stir':a=.9+Math.sin(now/260+e.id)*.4;break;case 'sweep':a=.3+Math.sin(now/230+e.id)*.8;break;case 'twist':a=.2+Math.sin(now/170+e.id)*.6;break;case 'sew':a=-.4+Math.sin(now/140+e.id)*.25;break;case 'beat':a=Math.sin(now/110+e.id)*1.1;break;case 'toss':a=.6+Math.max(0,Math.sin(now/300+e.id))*.9;break;default:a=.9}
  if(up)a-=.7;g.save();g.translate(hx,hy);g.scale(side,1);g.rotate(a);drawTool(g,k.t);g.beginPath();g.arc(0,0,T*.062,0,7);fs(g,e.skin,1);g.restore();
  if(k.spark&&ph>.2&&ph<.32){const r=T*.4,px=hx+side*Math.cos(a)*r,py=hy+Math.sin(a)*r;g.strokeStyle='#ffd36a';g.lineWidth=1.3;g.beginPath();for(let i=0;i<5;i++){const aa=i*1.25+now*.01;g.moveTo(px,py);g.lineTo(px+Math.cos(aa)*6,py+Math.sin(aa)*6)}g.stroke()}
  if(k.m==='stir'&&Math.sin(now/500+e.id)>.6){g.fillStyle='rgba(240,240,240,.35)';g.beginPath();g.arc(hx+side*T*.38,hy-T*.2-(now/40%10),3,0,7);g.fill()}
  return true}
/* building doors: open when someone passes */
let doorSegs=[];const doorOpen=new Map();
function drawDoorsLive(now,dt){if(!doorSegs.length)return;const ents2=S.cols.concat(S.vis||[]);
  for(const d of doorSegs){let near=false;for(const e of ents2){if(Math.abs(e.x-d.cx)<.95&&Math.abs(e.y-d.cy)<.95){near=true;break}}let o=doorOpen.get(d.key)||0;o+=(near?1:-1)*dt*6;o=clamp(o,0,1);doorOpen.set(d.key,o);
    const L=T-6,ang=o*1.45*d.sw;ctx.save();ctx.translate(d.hx*T,d.hy*T);ctx.rotate(d.base+ang);rr(ctx,0,-2.6,L,5.2,1.5);ctx.fillStyle='#6b4a2a';ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.3;ctx.stroke();ctx.fillStyle='rgba(255,220,170,.22)';ctx.fillRect(2,-2,L-4,1.2);ctx.fillStyle='#d8b860';ctx.beginPath();ctx.arc(L-4,0,1.2,0,7);ctx.fill();ctx.restore()}}
/* gates: the leaves swing shut when a raid comes and open for colonists */
function gateTarget(gt){if(!S.raid)return 0;const c=gateCells(gt);const gx=gt.x+.5,gy=gt.y+.5;for(const e of S.cols){if(e.downed)continue;const pl=e.path&&e.path.length?e.path[e.path.length-1]:null,wants=isOut(e)||(pl&&kAt(pl[0],pl[1])===0);if(wants&&Math.hypot(e.x-gx,e.y-gy)<3.2){let rn=false;for(const r of aliveRaiders())if(Math.hypot(r.x-gx,r.y-gy)<4){rn=true;break}if(!rn)return 0}}return 1}
function drawGatesLive(now,dt){if(S.wall<1)return;for(const gt of S.gates){const tg=gateTarget(gt);gt.cl=clamp((gt.cl||0)+(tg?1:-1)*dt*1.6,0,1);const c=gt.cl,ez=c*c*(3-2*c),side=gateSide(gt),ang={W:0,E:Math.PI,N:Math.PI/2,S:-Math.PI/2}[side],t=S.wall;
    const leaf=t===3?'#5f6468':'#8f6e46',band=t>=2?'#4f5357':'#5c4228';ctx.save();ctx.translate((gt.x+.5)*T,(gt.y+.5)*T);ctx.rotate(ang);const gx=-T/2,gy=-1.5*T,gh=3*T,L=gh/2-1;
    for(const[yy,a0,a1]of[[gy,-.55,Math.PI/2],[gy+gh,.55,-Math.PI/2]]){ctx.save();ctx.translate(gx+T*.62,yy);ctx.rotate(a0+(a1-a0)*ez);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(2,0,L,9);rr(ctx,0,-5,L,10,2);ctx.fillStyle=leaf;ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=2;ctx.stroke();
      ctx.strokeStyle='rgba(40,25,10,.45)';ctx.lineWidth=1;for(let x=8;x<L;x+=8){ctx.beginPath();ctx.moveTo(x,-5);ctx.lineTo(x,5);ctx.stroke()}ctx.fillStyle=band;ctx.fillRect(4,-5,3,10);ctx.fillRect(L-8,-5,3,10);ctx.fillStyle='#c9ccd0';for(const x of[5.5,L-6.5]){ctx.beginPath();ctx.arc(x,0,1.1,0,7);ctx.fill()}ctx.restore()}
    if(c>.97){ctx.save();ctx.translate(gx+T*.62,0);rr(ctx,-3,-T*.45,6,T*.9,2);ctx.fillStyle=band;ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=1.3;ctx.stroke();ctx.restore()}
    ctx.restore()}}
