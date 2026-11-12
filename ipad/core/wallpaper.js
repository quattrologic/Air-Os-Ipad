'use strict';
// One muted decoder shared by lockscreen and desktop; local, verified assets only.
(() => {
 const root=document.documentElement, desktop=document.querySelector('.wallpaper'), lock=document.querySelector('.lg-lock-wallpaper');
 const choices=Object.freeze({ocean:{label:'Ocean Blue · Bewegt',poster:'./assets/ocean-blue.jpg'},yosemite:{label:'Yosemite · Bisheriger Hintergrund',poster:'./assets/yosemite-morning.png'}});
 const video=document.createElement('video');video.className='air-wallpaper-video';video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.setAttribute('playsinline','');video.setAttribute('muted','');video.setAttribute('aria-hidden','true');video.tabIndex=-1;video.preload='none';video.poster=choices.ocean.poster;
 const events=new AbortController(),{signal}=events,motion=matchMedia('(prefers-reduced-motion: reduce)');
 let selected='ocean',suspended=false,disposed=false,readEpoch=0,playEpoch=0;
 const reduced=()=>motion.matches||root.classList.contains('pad-reduced-motion');
 function sync(){
  if(disposed)return;
  const host=window.airIPad?.sessionOpen()?desktop:lock;
  if(video.parentNode!==host)host.append(video);
  const active=selected==='ocean'&&!document.hidden&&!suspended&&!reduced(),epoch=++playEpoch;
  if(!active){video.pause();video.hidden=true;return;}
  if(!video.hasAttribute('src')){video.src='./assets/ocean-blue.mp4';video.load();}
  video.hidden=false;
  if(video.paused)void video.play().catch(()=>{if(epoch===playEpoch)video.hidden=true;});
 }
 function apply(id){selected=Object.hasOwn(choices,id)?id:'ocean';root.dataset.wallpaper=selected;root.style.setProperty('--system-wallpaper','url("'+choices[selected].poster+'")');sync();document.dispatchEvent(new Event('air-wallpaper-changed'));document.dispatchEvent(new Event('air-settings-changed'));}
 async function read(){const epoch=++readEpoch;try{const id=await airStore.setting('wallpaper-v1','ocean');if(epoch===readEpoch&&!disposed&&id!==selected)apply(id);}catch{/* Keep a usable default if storage is unavailable. */}}
 async function select(id){if(!Object.hasOwn(choices,id))throw Error('Unbekannter Hintergrund.');await airStore.setSetting('wallpaper-v1',id);if(!disposed)apply(id);}
 const ready=read();apply(selected);
 for(const name of ['air-ipad-session','visibilitychange'])document.addEventListener(name,sync,{signal});
 document.addEventListener('pointerdown',sync,{passive:true,signal});motion.addEventListener('change',sync,{signal});
 document.addEventListener('air-data-changed',e=>{if(['setting','all'].includes(e.detail))void read();},{signal});
 document.addEventListener('air-system-changed',e=>{suspended=e.detail?.power?.suspended===true;sync();},{signal});
 const observer=new MutationObserver(sync);observer.observe(root,{attributes:true,attributeFilter:['class']});
 function dispose(){disposed=true;readEpoch++;playEpoch++;video.pause();video.removeAttribute('src');video.load();video.remove();observer.disconnect();events.abort();}
 document.addEventListener('air-profile-changing',dispose,{once:true,signal});
 window.addEventListener('pagehide',e=>{if(e.persisted){suspended=true;sync();}else dispose();},{signal});
 window.addEventListener('pageshow',()=>{suspended=false;sync();},{signal});
 window.airWallpaper=Object.freeze({ready,choices,select,current:()=>selected,poster:()=>choices[selected].poster});
})();
