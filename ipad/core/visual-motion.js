'use strict';
// AIR FLOW extends the existing presentation scheduler. Desktop remains the geometry
// and lifecycle owner; Pro Notch keeps its single, independently sampled surface.
(()=>{
 const active=new Map(),artworkState=new WeakMap(),events=new AbortController(),signal=events.signal;
 const tokens=Object.freeze({
  duration:Object.freeze({window:440,close:300,panel:280,session:540,content:240,artwork:360,flip:360,activate:160,touch:420}),
  easing:Object.freeze({spring:'cubic-bezier(.22,1.12,.36,1)',panel:'cubic-bezier(.22,1,.36,1)',exit:'cubic-bezier(.4,0,.7,.2)'}),
  spring:Object.freeze({stiffness:300,damping:28,mass:1})
 });
 let last=null,completed=0,touch=null,touchPoint=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('pad-reduced-motion');
 const quality=()=>document.documentElement.dataset.quality==='Reduzierte Transparenz'||navigator.connection?.saveData||navigator.deviceMemory>0&&navigator.deviceMemory<=4||navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4?'economy':'full';
 const duration=kind=>reduced()?0:Math.round((tokens.duration[kind]||tokens.duration.content)*(quality()==='economy'?.75:1));
 const box=node=>{if(!node?.isConnected||!node.getClientRects().length)return null;const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};
 const visible=node=>node?.isConnected&&!document.hidden&&!node.closest('[hidden]')&&node.getClientRects().length;
 function cancel(node){const item=active.get(node);if(item){active.delete(node);item.animation.cancel();item.resolve(false);}}
 function animate(node,frames,kind='content',options={}){
  cancel(node);const ms=options.duration??duration(kind);
  if(!visible(node)||reduced()||!ms||!node.animate)return Promise.resolve(true);
  const animation=node.animate(frames,{duration:ms,easing:options.easing||tokens.easing.panel,fill:options.delay?'backwards':'none',delay:options.delay||0});
  last={kind,origin:options.origin||null,duration:ms,target:box(node)};
  return new Promise(resolve=>{
   const item={animation,resolve,kind};active.set(node,item);
   animation.finished.then(()=>{if(active.get(node)!==item)return;active.delete(node);animation.cancel();completed++;resolve(true);},()=>{if(active.get(node)===item){active.delete(node);resolve(false);}});
  });
 }
 // Analytic damped spring, sampled once per transition (no JS frame loop).
 function springProgress(offset){const {stiffness:k,damping:c,mass:m}=tokens.spring,w=Math.sqrt(k/m),z=c/(2*Math.sqrt(k*m)),wd=w*Math.sqrt(1-z*z),t=offset*tokens.duration.window/1000;return offset===1?1:1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));}
 function springFrames(from){return Array.from({length:33},(_,i)=>{const offset=i/32,p=springProgress(offset),q=1-p;return{offset,opacity:Math.min(1,.12+p*.88),transform:`translate(${from.x*q}px,${from.y*q}px) scale(${1+(from.sx-1)*q},${1+(from.sy-1)*q})`};});}
 function adopt(node,animation,kind){cancel(node);return new Promise(resolve=>{const item={animation,resolve,kind};active.set(node,item);animation.finished.then(()=>{if(active.get(node)!==item)return;active.delete(node);completed++;resolve(true);},()=>{if(active.get(node)===item){active.delete(node);resolve(false);}});});}
 function cancelTree(node,keepExit=false){for(const [target,item]of [...active])if((target===node||node?.contains(target))&&(!keepExit||!['close','genie'].includes(item.kind)))cancel(target);}
 function show(node,kind='panel',origin=null){
  const r=box(node);if(!r)return Promise.resolve(true);let frames;
  if(kind==='session')frames=[{opacity:0,translate:'0 18px',scale:'.985'},{opacity:1,translate:'0 0',scale:'1'}];
  else if(kind==='activate')frames=[{opacity:.86},{opacity:1}];
  else if(kind==='window'&&origin?.width>0){const dx=origin.x+origin.width/2-r.x-r.width/2,dy=origin.y+origin.height/2-r.y-r.height/2;
   frames=springFrames({x:dx,y:dy,sx:Math.max(.04,origin.width/r.width),sy:Math.max(.04,origin.height/r.height)});
  }else if(kind==='window')frames=[{opacity:0,translate:'0 18px',scale:'.96'},{opacity:1,translate:'0 0',scale:'1'}];
  else frames=[{opacity:0,translate:'0 8px',scale:'.98'},{opacity:1,translate:'0 0',scale:'1'}];
  const work=animate(node,frames,kind,{origin,easing:kind==='window'&&origin?.width>0?'linear':kind==='window'?tokens.easing.spring:tokens.easing.panel});
  if(kind==='window'){const content=node.querySelector('.pad-window-content');void animate(content,[{opacity:0,translate:'0 6px'},{opacity:1,translate:'0 0'}],'content',{delay:reduced()?0:70});}
  return work;
 }
 function depart(node,target=null){
  if(!box(node))return Promise.resolve(true);const initial=getComputedStyle(node),fromTransform=initial.transform==='none'?'translate(0,0) scale(1)':initial.transform,fromOpacity=Number(initial.opacity)||1;cancel(node);const r=box(node);
  const frames=target?.width>0?[{opacity:fromOpacity,transform:fromTransform},{opacity:0,transform:`translate(${target.x+target.width/2-r.x-r.width/2}px,${target.y+target.height/2-r.y-r.height/2}px) scale(${Math.max(.04,target.width/r.width)},${Math.max(.04,target.height/r.height)})`}]:[{opacity:1,translate:'0 0',scale:'1'},{opacity:0,translate:'0 10px',scale:'.97'}];
  return animate(node,frames,'close',{origin:target,easing:tokens.easing.exit});
 }
 function flip(node,from){const to=box(node);if(!from||!to||!from.width||!to.width)return Promise.resolve(true);return animate(node,[{translate:`${from.x-to.x}px ${from.y-to.y}px`,scale:`${from.width/to.width} ${from.height/to.height}`},{translate:'0 0',scale:'1 1'}],'flip',{easing:tokens.easing.spring});}
 const content=(node,direction=1)=>animate(node,[{opacity:.25,translate:`${direction*12}px 0`},{opacity:1,translate:'0 0'}],'content');
 function artwork(node,url,{image=false,label='Albumcover'}={}){
  if(!node)return;url=url||'';const oldState=artworkState.get(node);if(oldState?.url===url)return;
  const state={url};artworkState.set(node,state);
  let next=document.createElement(image&&url?'img':'span');next.className='air-artwork';next.setAttribute('aria-hidden',String(!image));
  if(image&&url){next.alt=label;next.referrerPolicy='no-referrer';}else next.setAttribute('aria-label',label);
  const install=()=>{
   if(artworkState.get(node)!==state||!node.isConnected)return;
   const previous=[...node.children].find(n=>n.classList.contains('air-artwork'));
   for(const n of [...node.children])if(n!==previous){cancel(n);n.remove();}
   if(!previous)node.textContent='';node.style.backgroundImage='none';node.append(next);
   if(previous){void animate(previous,[{opacity:1,scale:'1'},{opacity:0,scale:'1.025'}],'artwork').then(()=>previous.remove());}
   void animate(next,[{opacity:0,scale:'.975'},{opacity:1,scale:'1'}],'artwork');
  };
  if(!url){next.textContent='♫';install();return;}
  const loader=image?next:new Image();loader.referrerPolicy='no-referrer';loader.src=url;
  if(!image)next.style.backgroundImage='url('+JSON.stringify(url)+')';
  loader.decode().then(install,()=>{if(artworkState.get(node)===state){next=document.createElement('span');next.className='air-artwork';next.setAttribute('aria-hidden','true');next.textContent='♫';install();}});
 }
 function clear(){for(const node of [...active.keys()])cancel(node);}
 function stopTouch(){if(!touch)return;const light=touch;touch=null;touchPoint=null;void animate(light,[{opacity:1},{opacity:0}],'touch').then(()=>light.remove());}
 document.addEventListener('pointerdown',e=>{
  if(e.isPrimary===false||e.button!==0||reduced())return;stopTouch();
  const node=e.target.closest('.pad-dock,.pad-widget,.lock-player,#unlock,.pad-popover,.lg-lock-notice,.pad-titlebar,.s3-settings-main>section');
  if(!node||e.target.closest('input,textarea,select'))return;const r=node.getBoundingClientRect();
  const light=document.createElement('span');light.className='air-touch-light deep-glass-tile';light.setAttribute('aria-hidden','true');
  light.style.setProperty('--touch-x',Math.round(e.clientX-r.left)+'px');light.style.setProperty('--touch-y',Math.round(e.clientY-r.top)+'px');node.append(light);touch=light;touchPoint={id:e.pointerId,x:r.left,y:r.top,at:0};
  void animate(light,[{opacity:0},{opacity:1}],'activate');
 },{passive:true,capture:true,signal});
 document.addEventListener('pointermove',e=>{if(!touch||touchPoint?.id!==e.pointerId||e.timeStamp-touchPoint.at<32)return;touchPoint.at=e.timeStamp;touch.style.setProperty('--touch-x',Math.round(e.clientX-touchPoint.x)+'px');touch.style.setProperty('--touch-y',Math.round(e.clientY-touchPoint.y)+'px');},{passive:true,capture:true,signal});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,stopTouch,{passive:true,signal});
 const policy=()=>{document.documentElement.dataset.airMotion=quality();if(reduced())clear();};
 const observer=new MutationObserver(policy);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-quality']});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',policy,{signal});policy();
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();stopTouch();}},{signal});
 document.addEventListener('air-ipad-session',e=>{clear();if(!e.detail)return;void show(document.querySelector('#desktop'),'session');},{signal});
 window.addEventListener('pagehide',e=>{clear();stopTouch();if(!e.persisted){observer.disconnect();events.abort();}});
 window.airVisualMotion=Object.freeze({adopt,tokens,duration,reduced,quality,animate,show,depart,flip,content,artwork,cancel,cancelTree,springProgress,box,snapshot:()=>({active:active.size,reduced:reduced(),quality:quality(),completed,last})});
})();
