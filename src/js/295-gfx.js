/* ================= enhanced graphics: WebGL2 post-processing =================
   The game still draws everything with Canvas 2D. When WebGL2 is available, each frame that canvas is
   uploaded as a texture and finished by a small shader pipeline on the GPU:
   bloom on fire, lamps and muzzle flashes; heat haze above fires; a tilt-shift miniature focus when zoomed in;
   filmic contrast, vignette and grain. If WebGL2 is missing, the context is lost or frames get slow,
   it switches itself off and the plain canvas shows through. Settings are per device (localStorage). */
const GFX={ok:false,gl:null,cv:null,prog:{},tex:null,fb:[],w:0,h:0,slow:0,t0:performance.now(),set:{on:1,tilt:1,film:1,bloom:1,clouds:1}};
let GFXD=0;
try{const s=JSON.parse(localStorage.getItem('dw-gfx')||'null');if(s)Object.assign(GFX.set,s)}catch(e){}
function gfxSave(){try{localStorage.setItem('dw-gfx',JSON.stringify(GFX.set))}catch(e){}}
const GFX_VS=`#version 300 es
in vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const GFX_DOWN=`#version 300 es
precision mediump float;in vec2 uv;out vec4 o;uniform sampler2D t;uniform vec2 px;uniform float thr;
void main(){vec3 s=(texture(t,uv+px*vec2(-1.,-1.)).rgb+texture(t,uv+px*vec2(1.,-1.)).rgb+texture(t,uv+px*vec2(-1.,1.)).rgb+texture(t,uv+px*vec2(1.,1.)).rgb)*.25;
 if(thr<0.){o=vec4(s,1.);return;}float l=max(s.r,max(s.g,s.b));float warm=clamp((s.r-s.b)*1.6,0.,1.);float k=smoothstep(thr,thr+.22,l)*mix(.55,1.25,warm);o=vec4(s*k,1.);}`;
const GFX_BLUR=`#version 300 es
precision mediump float;in vec2 uv;out vec4 o;uniform sampler2D t;uniform vec2 dir;
void main(){vec3 c=texture(t,uv).rgb*.2270;c+=(texture(t,uv+dir*1.3846).rgb+texture(t,uv-dir*1.3846).rgb)*.3162;c+=(texture(t,uv+dir*3.2308).rgb+texture(t,uv-dir*3.2308).rgb)*.0703;o=vec4(c,1.);}`;
const GFX_COMP=`#version 300 es
precision highp float;in vec2 uv;out vec4 o;uniform sampler2D scene,bloom,soft;uniform float time,bloomK,tilt,film,aspect,cloud;uniform vec4 fires[16];uniform int nf;uniform vec2 res,view;uniform vec4 camv;uniform vec2 coff;
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float h2(vec2 i){return hash(mod(i,256.));}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 u=uv;
 for(int i=0;i<16;i++){if(i>=nf)break;vec4 f=fires[i];vec2 d=(u-f.xy)*vec2(aspect,1.);float above=smoothstep(-.01,.06,u.y-f.y);float k=exp(-dot(d,d)/(f.z*f.z))*above*f.w;
  u.x+=sin(time*7.+u.y*140.+float(i))*.0022*k;u.y+=cos(time*5.3+u.x*110.)*.0014*k;}
 vec3 c=texture(scene,u).rgb;
 float ty=abs(uv.y-.5)*2.;float tb=smoothstep(.38,1.,ty)*tilt;c=mix(c,texture(soft,u).rgb,tb);
 if(film>0.){vec2 q=uv-.5;float ca=dot(q,q)*.003*film;c.r=mix(c.r,texture(scene,u+q*ca*2.).r,.5);c.b=mix(c.b,texture(scene,u-q*ca*2.).b,.5);}
 if(cloud>0.){vec2 w=(vec2(uv.x,1.-uv.y)*view-view*.5)/camv.z+camv.xy;w/=camv.w*15.;w+=coff;
  float n=vnoise(w)*.62+vnoise(w*2.13+7.3)*.38;float cs=smoothstep(.5,.78,n)*cloud;c*=mix(vec3(1.),vec3(.8,.84,.93),cs);}
 vec3 bl=texture(bloom,u).rgb;c+=bl*bloomK;
 float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.08);
 vec3 sh=vec3(.985,1.,1.03),hi=vec3(1.03,1.,.96);c*=mix(sh,hi,smoothstep(.15,.75,l));
 c=mix(c,c*c*(3.-2.*c),.12);
 float m=max(c.r,max(c.g,c.b));const float K=.82;if(m>K){float mm=K+(1.-K)*(1.-exp(-(m-K)/(1.-K)));c*=mm/m;}
 if(film>0.){vec2 q=uv-.5;c*=1.-dot(q,q)*.38*film;c+=(hash(uv*res+fract(time))-.5)*.018*film;}
 o=vec4(clamp(c,0.,1.),1.);}`;
function gfxShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
function gfxProg(gl,fs){const p=gl.createProgram();gl.attachShader(p,gfxShader(gl,gl.VERTEX_SHADER,GFX_VS));gl.attachShader(p,gfxShader(gl,gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,'p');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  const u={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name.replace('[0]','')]=gl.getUniformLocation(p,a.name)}return{p,u}}
function gfxTex(gl,w,h){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);if(w)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);return t}
function gfxFB(gl,w,h){const t=gfxTex(gl,w,h),f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return{t,f,w,h}}
function gfxInit(){if(GFX.cv)return GFX.ok;const c=document.createElement('canvas');c.id='gfx';c.setAttribute('aria-hidden','true');GFX.cv=c;
  try{const gl=c.getContext('webgl2',{alpha:false,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});if(!gl)throw new Error('no webgl2');GFX.gl=gl;
    GFX.prog.down=gfxProg(gl,GFX_DOWN);GFX.prog.blur=gfxProg(gl,GFX_BLUR);GFX.prog.comp=gfxProg(gl,GFX_COMP);
    const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    GFX.tex=gfxTex(gl,0,0);c.addEventListener('webglcontextlost',e=>{e.preventDefault();GFX.ok=false;c.style.display='none'});
    cv.parentNode.insertBefore(c,cv.nextSibling);GFX.ok=true}catch(e){console.warn('Enhanced graphics unavailable:',e.message);GFX.ok=false}
  return GFX.ok}
function gfxSize(gl){const W2=cv.width,H2=cv.height;if(GFX.w===W2&&GFX.h===H2)return;GFX.w=W2;GFX.h=H2;GFX.cv.width=W2;GFX.cv.height=H2;
  for(const f of GFX.fb){gl.deleteTexture(f.t);gl.deleteFramebuffer(f.f)}const q=Math.max(1,Math.round(W2/4)),r=Math.max(1,Math.round(H2/4)),q2=Math.max(1,Math.round(W2/8)),r2=Math.max(1,Math.round(H2/8));
  GFX.fb=[gfxFB(gl,q,r),gfxFB(gl,q,r),gfxFB(gl,q2,r2),gfxFB(gl,q2,r2),gfxFB(gl,q,r),gfxFB(gl,q,r)]}
function gfxPass(gl,P,target,w,h,tex,set){gl.bindFramebuffer(gl.FRAMEBUFFER,target?target.f:null);gl.viewport(0,0,w,h);gl.useProgram(P.p);let unit=0;for(const k in tex){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex[k]);gl.uniform1i(P.u[k],unit);unit++}if(set)set(P.u);gl.drawArrays(gl.TRIANGLES,0,3)}
function gfxCloud(){const w=S.wx?S.wx.k:'clear';return(1-GFXD)*(w==='clear'?.55:w==='rain'?.9:w==='storm'?1:.7)*(S.site&&S.site.biome==='arid'?.7:1)}
function gfxActive(){return GFX.set.on&&GFX.ok&&!document.hidden}
function gfxFrame(now,rdt){if(!GFX.set.on){if(GFX.cv)GFX.cv.style.display='none';return}if(!gfxInit()){return}const gl=GFX.gl;if(gl.isContextLost()){GFX.cv.style.display='none';return}
  GFX.cv.style.display='block';gfxSize(gl);
  gl.bindTexture(gl.TEXTURE_2D,GFX.tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);
  const[A,B,C,D,E,F]=GFX.fb,thr=.86-.34*GFXD,P=GFX.prog;
  gfxPass(gl,P.down,A,A.w,A.h,{t:GFX.tex},u=>{gl.uniform2f(u.px,1/GFX.w*2,1/GFX.h*2);gl.uniform1f(u.thr,thr)});
  gfxPass(gl,P.blur,B,B.w,B.h,{t:A.t},u=>gl.uniform2f(u.dir,1/A.w,0));gfxPass(gl,P.blur,A,A.w,A.h,{t:B.t},u=>gl.uniform2f(u.dir,0,1/A.h));
  gfxPass(gl,P.blur,B,B.w,B.h,{t:A.t},u=>gl.uniform2f(u.dir,2.2/A.w,0));gfxPass(gl,P.blur,A,A.w,A.h,{t:B.t},u=>gl.uniform2f(u.dir,0,2.2/A.h));
  const tilt=GFX.set.tilt?clamp((cam.z-1.15)/1.2,0,1)*.9:0;
  if(tilt>0){gfxPass(gl,P.down,E,E.w,E.h,{t:GFX.tex},u=>{gl.uniform2f(u.px,1/GFX.w*2,1/GFX.h*2);gl.uniform1f(u.thr,-1)});gfxPass(gl,P.blur,F,F.w,F.h,{t:E.t},u=>gl.uniform2f(u.dir,1.5/E.w,0));gfxPass(gl,P.blur,E,E.w,E.h,{t:F.t},u=>gl.uniform2f(u.dir,0,1.5/E.h))}
  const fires=[];if(S.fires)for(const k in S.fires){const f=S.fires[k],sx=((f.x+.5)*T-cam.x)*cam.z+cw/2,sy=((f.y+.4)*T-cam.y)*cam.z+ch/2;if(sx<-80||sy<-80||sx>cw+80||sy>ch+80)continue;fires.push(sx/cw,1-sy/ch,.035*cam.z,Math.min(1,f.i));if(fires.length>=64)break}
  const fa=new Float32Array(64);fa.set(fires.slice(0,64));const bk=GFX.set.bloom?(.36+.4*GFXD):0;
  gfxPass(gl,P.comp,null,GFX.w,GFX.h,{scene:GFX.tex,bloom:A.t,soft:E.t},u=>{const tt=(now-GFX.t0)/1000;gl.uniform1f(u.time,tt%3600);gl.uniform2f(u.coff,(tt*.011)%256,(tt*.004)%256);gl.uniform1f(u.bloomK,bk);gl.uniform1f(u.tilt,tilt);gl.uniform1f(u.film,GFX.set.film?1:0);gl.uniform1f(u.aspect,cw/ch);gl.uniform2f(u.res,GFX.w,GFX.h);gl.uniform2f(u.view,cw,ch);gl.uniform4f(u.camv,cam.x,cam.y,cam.z,T);gl.uniform1f(u.cloud,GFX.set.clouds?gfxCloud():0);gl.uniform4fv(u.fires,fa);gl.uniform1i(u.nf,fires.length/4)});
  if(rdt>1/24){GFX.slow+=rdt;if(GFX.slow>4){GFX.set.on=0;gfxSave();GFX.cv.style.display='none';msg('Enhanced graphics switched off to keep the game smooth. You can turn them back on in the menu.','warn')}}else GFX.slow=Math.max(0,GFX.slow-rdt*.5)}
function gfxMenuHTML(){const ok=GFX.ok||(!GFX.cv&&!!window.WebGL2RenderingContext);return`<h4>Graphics</h4>
  <label class="row"><input type="checkbox" data-chg="gfx" data-v="on" ${GFX.set.on?'checked':''} ${ok?'':'disabled'}> Enhanced graphics (WebGL2)${ok?'':' · <span class="dim">not supported here</span>'}</label>
  <label class="row"><input type="checkbox" data-chg="gfx" data-v="tilt" ${GFX.set.tilt?'checked':''}> Tilt-shift focus when zoomed in</label>
  <label class="row"><input type="checkbox" data-chg="gfx" data-v="film" ${GFX.set.film?'checked':''}> Film look (vignette, grain)</label>
  <label class="row"><input type="checkbox" data-chg="gfx" data-v="bloom" ${GFX.set.bloom?'checked':''}> Glow on lights and fire</label>
  <label class="row"><input type="checkbox" data-chg="gfx" data-v="clouds" ${GFX.set.clouds?'checked':''}> Drifting cloud shadows</label>`}
