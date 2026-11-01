#!/usr/bin/env python3
"""Build Dustwool Ranch from src/ modules.
Outputs:
  game.html      - standalone single file (also used for the claude.ai artifact)
  index.html     - same game wrapped with PWA meta, manifest and service worker (GitHub Pages)
Usage: python3 tools/build.py [--check]
"""
import os,sys,glob,subprocess,re
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(ROOT,'src')
def rd(p): return open(p,encoding='utf-8').read()
def build():
    css=''.join(rd(f) for f in sorted(glob.glob(SRC+'/css/*.css')))
    js=''.join(rd(f) for f in sorted(glob.glob(SRC+'/js/*.js')))
    ver=re.search(r"const VERSION='([^']+)'",js)
    game=rd(SRC+'/head.html')+'<style>\n'+css+'</style>\n'+rd(SRC+'/body.html')+'<script>\n'+js+'</script>\n'
    return game,js,(ver.group(1) if ver else '?')
PWA_HEAD='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Dustwool Ranch - a semi-idle colony builder in the browser.">
<meta name="theme-color" content="#22262a">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Dustwool">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
'''
PWA_TAIL='''
<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))</script>
</html>
'''
if __name__=='__main__':
    game,js,ver=build()
    # duplicate top-level names silently override each other in one script: refuse to build
    names={}
    for n,line in enumerate(js.split('\n'),1):
        m=re.match(r'(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(',line) or re.match(r'(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=',line)
        if m: names.setdefault(m.group(1),[]).append(n)
    dup={k:v for k,v in names.items() if len(v)>1}
    if dup:
        print('DUPLICATE top-level names:',', '.join(f'{k} (lines {v})' for k,v in dup.items()));sys.exit(2)
    open(os.path.join(ROOT,'game.html'),'w',encoding='utf-8').write(game)
    open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8').write(PWA_HEAD+game+PWA_TAIL)
    # keep the service worker cache name in step with the version
    sw=os.path.join(ROOT,'sw.js')
    if os.path.exists(sw):
        t=rd(sw);t2=re.sub(r"dustwool-[^'\"]+","dustwool-"+ver,t,count=1)
        if t2!=t: open(sw,'w').write(t2)
    if '--check' in sys.argv:
        tmp='/tmp/dustwool-check.js';open(tmp,'w').write(js)
        r=subprocess.run(['node','--check',tmp],capture_output=True,text=True)
        if r.returncode: print(r.stderr);sys.exit(1)
    print('built',ver,len(game),'bytes')
