/* ================= audio: generative music, ambience, effects (Web Audio, no files) ================= */
const SND={ctx:null,on:true,mv:.5,sv:.6,last:{},bar:0,next:0,chordI:0,nextBird:0,nextCricket:0,nextWork:0,acc:0};
try{const p=JSON.parse(localStorage.getItem('dw-audio')||'{}');for(const k of['on','mv','sv'])if(p[k]!==undefined)SND[k]=p[k]}catch(e){}
function sndSave(){try{localStorage.setItem('dw-audio',JSON.stringify({on:SND.on,mv:SND.mv,sv:SND.sv}))}catch(e){}}
function audioInit(){
  if(SND.ctx){if(SND.ctx.state==='suspended'&&!document.hidden)SND.ctx.resume();return}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const c=SND.ctx=new AC();
  const comp=c.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.25;
  SND.master=c.createGain();comp.connect(SND.master);SND.master.connect(c.destination);
  SND.mus=c.createGain();SND.sfx=c.createGain();SND.amb=c.createGain();for(const g of[SND.mus,SND.sfx,SND.amb])g.connect(comp);
  const len=c.sampleRate*2.8,ir=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4)}
  SND.rev=c.createConvolver();SND.rev.buffer=ir;const rg=c.createGain();rg.gain.value=.32;SND.rev.connect(rg);rg.connect(comp);
  const nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;SND.noise=nb;
  const loop=(type,f,q)=>{const s0=c.createBufferSource();s0.buffer=nb;s0.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=c.createGain();g.gain.value=0;s0.connect(fl);fl.connect(g);g.connect(SND.amb);s0.start();return{g,fl}};
  SND.wind=loop('bandpass',420,.7);SND.rain=loop('highpass',1400,.5);SND.rainLo=loop('lowpass',900,.4);SND.river=loop('lowpass',700,.6);
  SND.next=c.currentTime+.3;sndVol();
}
function sndVol(){if(!SND.ctx)return;const t=SND.ctx.currentTime;SND.master.gain.setTargetAtTime(SND.on?1:0,t,.05);SND.mus.gain.setTargetAtTime(SND.mv*.34,t,.1);SND.sfx.gain.setTargetAtTime(SND.sv*.8,t,.05);SND.amb.gain.setTargetAtTime(SND.sv*.6,t,.2)}
document.addEventListener('pointerdown',audioInit,true);document.addEventListener('keydown',audioInit,true);
document.addEventListener('visibilitychange',()=>{if(!SND.ctx)return;if(document.hidden)SND.ctx.suspend();else SND.ctx.resume()});
function voice(o){const c=SND.ctx,t=c.currentTime+(o.at||0),osc=c.createOscillator(),g=c.createGain();osc.type=o.type||'sine';osc.frequency.setValueAtTime(o.f,t);if(o.f2)osc.frequency.exponentialRampToValueAtTime(o.f2,t+(o.glide||o.d));if(o.det)osc.detune.value=o.det;
  let n=osc;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;osc.connect(fl);n=fl}n.connect(g);
  const a=o.a||.005,v=o.v||.2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);if(o.hold)g.gain.setValueAtTime(v,t+a+o.hold);g.gain.exponentialRampToValueAtTime(1e-4,t+a+(o.hold||0)+o.d);
  const out=o.bus||SND.sfx;let dst=g;if(o.pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=o.pan;g.connect(p);dst=p}dst.connect(out);if(o.rev){const s2=c.createGain();s2.gain.value=o.rev;dst.connect(s2);s2.connect(SND.rev)}
  osc.start(t);osc.stop(t+a+(o.hold||0)+o.d+.05)}
function hiss(o){const c=SND.ctx,t=c.currentTime+(o.at||0),s0=c.createBufferSource();s0.buffer=SND.noise;s0.playbackRate.value=o.rate||1;const fl=c.createBiquadFilter();fl.type=o.ft||'bandpass';fl.frequency.setValueAtTime(o.f||1000,t);if(o.f2)fl.frequency.exponentialRampToValueAtTime(o.f2,t+o.d);fl.Q.value=o.q||1;
  const g=c.createGain(),v=o.v||.2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+(o.a||.003));g.gain.exponentialRampToValueAtTime(1e-4,t+(o.a||.003)+o.d);s0.connect(fl);fl.connect(g);
  let dst=g;if(o.pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=o.pan;g.connect(p);dst=p}dst.connect(o.bus||SND.sfx);if(o.rev){const s2=c.createGain();s2.gain.value=o.rev;dst.connect(s2);s2.connect(SND.rev)}
  s0.start(t,Math.random()*1.5);s0.stop(t+(o.a||.003)+o.d+.05)}
function pluck(f,v,at,bus,pan,d){voice({f,type:'triangle',v,a:.004,d:d||1.4,lp:Math.min(5000,f*5),at,bus,pan,rev:.35});voice({f:f*2,type:'sine',v:v*.25,a:.003,d:(d||1.4)*.4,at,bus,pan})}
const SFXGAP={click:.04,arrow:.11,gun:.07,charge:.09,hit:.08,metal:.1,swish:.12,error:.4,place:.15,coin:.12,done:.3,letter:.5,hammer:.25,chop:.3,pick:.3,rustle:.4,bench:.35,boom:.15};
function sfx(name,x,y,o){if(!SND.ctx||!SND.on||offlineSim||SND.ctx.state!=='running')return;const now=SND.ctx.currentTime,gap=SFXGAP[name]||0;if(gap&&now-(SND.last[name]||0)<gap)return;SND.last[name]=now;
  let vol=1,pan=0;if(x!==undefined){const sx=(x*T-cam.x)*cam.z+cw/2,sy=(y*T-cam.y)*cam.z+ch/2,m=Math.max(cw,ch)*.25;if(sx<-m||sx>cw+m||sy<-m||sy>ch+m)return;pan=clamp((sx-cw/2)/(cw/2),-1,1)*.55;vol=clamp(.45+cam.z*.5,.45,1.15)}
  const V=v=>v*vol;
  switch(name){
    case 'click':voice({f:1350,f2:950,d:.045,v:.045,type:'sine'});break;
    case 'error':voice({f:260,f2:190,d:.16,v:.05,type:'square',lp:900});break;
    case 'place':hiss({f:650,q:3,d:.07,v:.12});voice({f:170,f2:120,d:.12,v:.12,type:'triangle',at:.005});hiss({f:650,q:3,d:.06,v:.08,at:.11});break;
    case 'done':pluck(1174.7,V(.07),0,SND.sfx,pan,1.2);pluck(1760,V(.06),.11,SND.sfx,pan,1.4);break;
    case 'letter':hiss({ft:'highpass',f:3000,d:.14,v:.035});voice({f:1318.5,d:.9,v:.04,type:'sine',at:.06,rev:.4});break;
    case 'coin':voice({f:2093,d:.16,v:.04,type:'triangle'});voice({f:2637,d:.22,v:.035,type:'triangle',at:.06});break;
    case 'arrow':voice({f:210,f2:130,d:.12,v:V(.05),type:'triangle',pan});hiss({ft:'highpass',f:2500,d:.09,v:V(.025),pan,at:.02});break;
    case 'gun':hiss({f:1300,q:.8,d:.09,v:V(.11),pan});voice({f:95,f2:50,d:.1,v:V(.09),type:'sine',pan});break;
    case 'charge':voice({f:1100,f2:280,d:.13,v:V(.04),type:'square',lp:2600,pan});break;
    case 'hit':hiss({ft:'lowpass',f:700,d:.07,v:V(.08),pan});break;
    case 'metal':voice({f:2300+Math.random()*400,d:.12,v:V(.025),type:'triangle',pan});hiss({ft:'highpass',f:4000,d:.04,v:V(.03),pan});break;
    case 'swish':hiss({f:700,f2:2600,q:2,d:.15,v:V(.05),pan});break;
    case 'boom':hiss({ft:'lowpass',f:500,f2:120,d:1.3,v:V(.28),pan,rev:.3});voice({f:62,f2:32,d:.9,v:V(.25),type:'sine',pan});break;
    case 'breach':hiss({ft:'lowpass',f:900,f2:150,d:.9,v:V(.2),pan,rev:.3});voice({f:80,f2:40,d:.6,v:V(.18),pan});break;
    case 'horn':for(const[f,at]of[[220,0],[293.7,.55]])voice({f,type:'sawtooth',lp:850,a:.25,hold:.35,d:.9,v:.05,at,rev:.6});break;
    case 'drums':for(let k=0;k<3;k++){voice({f:70,f2:42,d:.35,v:.16,at:k*.42});hiss({ft:'lowpass',f:300,d:.15,v:.08,at:k*.42})}break;
    case 'victory':[587.3,740,880,1174.7].forEach((f,k)=>pluck(f,.06,k*.13,SND.sfx,0,1.6));break;
    case 'level':[880,1108.7,1318.5].forEach((f,k)=>pluck(f,.045,k*.07,SND.sfx,0,.9));break;
    case 'thunder':hiss({ft:'lowpass',f:380,f2:90,a:.05,d:3.2,v:.22,rev:.5,at:(o&&o.delay)||0,rate:.6});hiss({ft:'highpass',f:1800,d:.25,v:.06,at:(o&&o.delay)||0});break;
    case 'hammer':voice({f:900,d:.05,v:V(.03),type:'triangle',pan});hiss({f:1800,q:4,d:.04,v:V(.035),pan});break;
    case 'chop':hiss({f:450,q:2,d:.09,v:V(.05),pan});voice({f:140,f2:100,d:.08,v:V(.04),type:'triangle',pan});break;
    case 'pick':voice({f:1500+Math.random()*300,d:.08,v:V(.03),type:'triangle',pan});hiss({ft:'highpass',f:3000,d:.05,v:V(.025),pan});break;
    case 'rustle':hiss({f:2600,q:.6,d:.25,v:V(.02),pan,a:.05});break;
    case 'bench':voice({f:520,d:.06,v:V(.025),type:'triangle',pan});break;
    case 'depart':[293.7,440,587.3].forEach((f,k)=>voice({f,type:'sine',a:1.2,hold:1,d:2.5,v:.035,at:k*.1,bus:SND.mus,rev:.6}));break;
  }}
const SCALE=[293.66,329.63,369.99,440,493.88];
const CH_DAY=[[146.83,220,293.66,369.99],[123.47,185,246.94,293.66],[98,146.83,196,246.94],[110,164.81,220,277.18]];
const CH_RAID=[[146.83,220,293.66,349.23],[116.54,174.61,233.08,293.66],[130.81,196,261.63,329.63],[110,164.81,220,261.63]];
function musicTick(){const c=SND.ctx,beat=.92;if(SND.next<c.currentTime)SND.next=c.currentTime+.05;
  while(SND.next<c.currentTime+1.2){const t0=SND.next-c.currentTime,raid=!!(S&&S.raid),hr=S?(S.t%DAY)/DAY*24:12,night=hr<5||hr>=21,chs=raid?CH_RAID:CH_DAY,ch=chs[SND.bar%4];
    for(const f of ch.slice(1))voice({f,type:'sine',a:1.6,hold:beat*2.2,d:1.8,v:night?.022:.03,at:t0,bus:SND.mus,det:(Math.random()-.5)*8,rev:.5});
    voice({f:ch[0]/2,type:'triangle',a:.05,d:beat*3,v:.05,at:t0,bus:SND.mus,lp:400});
    const dens=raid?.25:night?.16:.3;
    for(let k=0;k<8;k++){if(Math.random()>dens)continue;const f=Math.random()<.6?ch[1+Math.floor(Math.random()*3)]*2:SCALE[Math.floor(Math.random()*5)]*(Math.random()<.3?2:1);pluck(f,(night?.035:.05)*(.7+Math.random()*.5),t0+k*beat/2+(Math.random()-.5)*.03,SND.mus,(Math.random()-.5)*.6,1.8)}
    if(raid)for(let k=0;k<4;k++){voice({f:62,f2:44,d:.3,v:.07,at:t0+k*beat,bus:SND.mus});if(k%2)hiss({ft:'lowpass',f:260,d:.12,v:.03,at:t0+k*beat,bus:SND.mus})}
    SND.bar++;SND.next+=beat*4}}
function audioFrame(rdt){if(!SND.ctx||SND.ctx.state!=='running')return;SND.acc+=rdt;if(SND.acc<.25)return;const dt=SND.acc;SND.acc=0;
  if(SND.mv>0)musicTick();const c=SND.ctx,t=c.currentTime,w=S.wx?S.wx.k:'clear',cold=!!(S.wx&&S.wx.cold),rain=(w==='rain'||w==='storm')&&!cold;
  SND.wind.g.gain.setTargetAtTime(.025+(WIND-1)*.05+(w==='storm'?.05:0),t,1.5);SND.wind.fl.frequency.setTargetAtTime(300+WIND*160+Math.sin(t*.3)*80,t,.8);
  SND.rain.g.gain.setTargetAtTime(rain?(w==='storm'?.09:.05):0,t,2);SND.rainLo.g.gain.setTargetAtTime(rain?(w==='storm'?.12:.06):0,t,2);
  let rv=0;if(RIV&&!RIV.frozen&&!RIV.dry){const p=RIV.pts[Math.floor(RIV.pts.length/2)],d=Math.abs(cam.x/T-p[0]);rv=clamp(1-d/(22/cam.z),0,1)*.07}SND.river.g.gain.setTargetAtTime(rv,t,.6);
  const hr=(S.t%DAY)/DAY*24,se=seasonIdx(),out=biome().out2==='grass'||biome().out2==='snow',quiet=cine||S.raid;
  if(!quiet&&out&&!rain&&hr>=6&&hr<19&&se!==3&&t>SND.nextBird){SND.nextBird=t+R(3,9);const f0=R(2400,4200),n=RI(2,4),pn=R(-.7,.7);for(let k=0;k<n;k++)voice({f:f0*(1+k*.05),f2:f0*R(1.1,1.35),glide:.07,d:.09,v:.012,at:k*R(.09,.14),bus:SND.amb,pan:pn,rev:.3})}
  if(!quiet&&out&&!rain&&(hr>=20.5||hr<4.5)&&se!==3&&t>SND.nextCricket){SND.nextCricket=t+R(.8,2.2);const pn=R(-.6,.6);for(let k=0;k<3;k++)voice({f:4400,d:.03,v:.008,at:k*.06,bus:SND.amb,pan:pn,type:'sine'})}
  if(!cine&&t>SND.nextWork){SND.nextWork=t+R(.35,.7);const cand=S.cols.filter(c0=>c0.working&&c0.job&&!(c0.path&&c0.path.length));if(cand.length){const c0=pick(cand),j=c0.job.t,s0=j==='con'||j==='build'||j==='repair'?'hammer':j==='gather'?'chop':j==='mine'?'pick':j==='harvest'||j==='sow'||j==='pick'?'rustle':j==='craft'?'bench':null;if(s0)sfx(s0,c0.x,c0.y)}}}

