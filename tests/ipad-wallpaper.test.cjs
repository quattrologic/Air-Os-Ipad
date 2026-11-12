'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const sw=fs.readFileSync(path.join(root,'scripts/templates/ipad-service-worker.js'),'utf8');
const source=sw.slice(sw.indexOf('async function mediaRange('),sw.indexOf("self.addEventListener('fetch'"));
const range=vm.runInNewContext(source+';mediaRange',{Response});
test('verified offline MP4 ranges support Safari probes, suffixes and unsatisfiable requests',async()=>{
 const bytes=Uint8Array.from({length:256},(_,i)=>i);
 for(const [header,status,length,first]of [['bytes=0-1',206,2,0],['bytes=100-',206,156,100],['bytes=-16',206,16,240],['bytes=250-999',206,6,250],['bytes=256-',416,0],['bytes=5-2',416,0],['bytes=-0',416,0],['bytes=0-1,5-6',416,0],['broken',416,0]]){
  const r=await range(new Response(bytes),new Request('https://example.test/',{headers:{Range:header}}),'./assets/ocean-blue.mp4');assert.equal(r.status,status,header);const body=new Uint8Array(await r.arrayBuffer());assert.equal(body.length,length,header);if(length)assert.equal(body[0],first);if(status===206)assert.equal(r.headers.get('content-type'),'video/mp4');
 }
 const full=new Response(bytes);assert.equal(await range(full,new Request('https://example.test/'),'./assets/ocean-blue.mp4'),full);
});
test('wallpaper persists selection, uses one decoder, pauses for motion and resumes after BFCache',async()=>{
 class Target extends EventTarget{constructor(){super();this.dataset={};this.classList={contains:()=>false};this.style={setProperty(){}};}append(n){n.parentNode=this;}}
 const doc=new Target(),html=new Target(),desktop=new Target(),lock=new Target(),motion=new Target(),win=new Target();motion.matches=false;doc.documentElement=html;doc.hidden=false;let opened=false,stored,video,creates=0;
 doc.querySelector=s=>s==='.wallpaper'?desktop:lock;
 doc.createElement=()=>{creates++;video=new Target();video.paused=true;video.hidden=false;const attrs={};video.setAttribute=(k,v)=>attrs[k]=v;video.hasAttribute=k=>k==='src'?!!video.src:k in attrs;video.removeAttribute=k=>{if(k==='src')video.src='';};video.load=()=>{};video.play=()=>{video.paused=false;return Promise.resolve();};video.pause=()=>video.paused=true;video.remove=()=>video.parentNode=null;return video;};
 const store={setting:async()=>stored??'ocean',setSetting:async(k,v)=>{stored=v;}};
 const observer=class{observe(){}disconnect(){}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'ipad/core/wallpaper.js'),'utf8'),{window:win,document:doc,matchMedia:()=>motion,MutationObserver:observer,AbortController,Event,airStore:store});
 await win.airWallpaper.ready;assert.equal(win.airWallpaper.current(),'ocean');assert.equal(creates,1);assert.equal(video.parentNode,lock);assert.equal(video.paused,false);
 win.airIPad={sessionOpen:()=>opened};opened=true;doc.dispatchEvent(new Event('air-ipad-session'));assert.equal(video.parentNode,desktop);
 await win.airWallpaper.select('yosemite');assert.equal(stored,'yosemite');assert.equal(video.paused,true);assert.equal(video.hidden,true);
 await assert.rejects(win.airWallpaper.select('https://evil.test/video.mp4'));assert.equal(stored,'yosemite');
 await win.airWallpaper.select('ocean');motion.matches=true;motion.dispatchEvent(new Event('change'));assert.equal(video.paused,true);motion.matches=false;motion.dispatchEvent(new Event('change'));assert.equal(video.paused,false);
 const hide=new Event('pagehide');hide.persisted=true;win.dispatchEvent(hide);assert.equal(video.paused,true);win.dispatchEvent(new Event('pageshow'));assert.equal(video.paused,false);
 doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(video.paused,true);doc.dispatchEvent(new Event('air-profile-changing'));assert.equal(video.parentNode,null);assert.equal(video.src,'');
});
