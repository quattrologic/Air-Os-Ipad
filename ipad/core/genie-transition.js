'use strict';
// AIR FLOW-owned projective DOM strips. Captures stay in this document, exist
// only during a transition and never enter storage, logs, a worker or the network.
(()=>{
 const model=airGenieModel,motion=airVisualMotion,live=new Map(),events=new AbortController(),signal=events.signal;
 const properties=('display position box-sizing float clear flex flex-direction flex-wrap flex-grow flex-shrink flex-basis justify-content align-items align-content align-self order grid-template-columns grid-template-rows grid-column grid-row gap row-gap column-gap width height min-width min-height max-width max-height top right bottom left margin padding border border-radius border-top border-right border-bottom border-left background background-color background-image background-position background-size background-repeat background-clip color font font-family font-size font-weight font-style line-height letter-spacing text-align text-indent text-transform text-decoration white-space word-break overflow-wrap vertical-align overflow overflow-x overflow-y object-fit object-position opacity transform transform-origin box-shadow text-shadow appearance -webkit-appearance -webkit-text-fill-color -webkit-text-stroke -webkit-line-clamp -webkit-box-orient fill stroke stroke-width mask -webkit-mask filter visibility z-index list-style table-layout border-collapse border-spacing direction writing-mode').split(' ');
 let speed='normal',disposed=false,total=0,cancelled=0,fallbacks=0,last=null;
 const rect=n=>motion.box(n),duration=()=>model.speeds[speed]||model.speeds.normal;
 const caps=()=>motion.quality()==='economy'?16:24;
 function freeze(node){
  if([...node.querySelectorAll('iframe,object,embed')].some(n=>!n.hidden&&getComputedStyle(n).display!=='none'))throw Error('embedded-content');
  const originals=[node,...node.querySelectorAll('*')];if(originals.length>500)throw Error('complex-content');
  const copy=node.cloneNode(true),copies=[copy,...copy.querySelectorAll('*')],scroll=[];
  for(let i=0;i<originals.length;i++){
   const original=originals[i];let clone=copies[i];if(i&&!copy.contains(clone))continue;
   if(/^(SCRIPT|STYLE|LINK|AUDIO|IFRAME|OBJECT|EMBED)$/.test(original.tagName)||original.matches('.air-touch-light')){clone.remove();continue;}
   const style=getComputedStyle(original);if(i&&(style.display==='none'||original.hidden)){clone.remove();continue;}
   const frozen=properties.map(p=>p+':'+style.getPropertyValue(p)+'!important;').join('');clone.style.cssText=frozen;
   clone.style.setProperty('animation','none','important');clone.style.setProperty('transition','none','important');clone.style.setProperty('pointer-events','none','important');clone.style.setProperty('caret-color','transparent','important');clone.style.setProperty('backdrop-filter','none','important');clone.style.setProperty('-webkit-backdrop-filter','none','important');
   for(const attr of [...clone.attributes])if(attr.name==='id'||attr.name==='name'||attr.name==='autofocus'||attr.name.startsWith('on')||attr.name==='form')clone.removeAttribute(attr.name);
   if(original.tagName==='CANVAS'||original.tagName==='VIDEO'){
    if(original.tagName==='CANVAS'&&!original.getContext('2d'))throw Error('gpu-canvas');
    if(original.tagName==='VIDEO'&&original.readyState<2)throw Error('video-not-ready');
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.min(1920,original.width||original.videoWidth||original.clientWidth));canvas.height=Math.max(1,Math.round(canvas.width*(original.height||original.videoHeight||original.clientHeight)/Math.max(1,original.width||original.videoWidth||original.clientWidth)));
    if(canvas.width*canvas.height>2200000)throw Error('large-canvas');canvas.getContext('2d').drawImage(original,0,0,canvas.width,canvas.height);
    const img=document.createElement('img');img.src=canvas.toDataURL('image/png');img.alt='';img.style.cssText=clone.style.cssText;clone.replaceWith(img);clone=img;canvas.width=canvas.height=0;
   }
   if(original.tagName==='IMG'&&(!original.complete||!original.naturalWidth))throw Error('image-not-ready');
   if(original.tagName==='INPUT'){clone.value=original.value;clone.setAttribute('value',original.value);clone.checked=original.checked;if(original.checked)clone.setAttribute('checked','');else clone.removeAttribute('checked');}
   if(original.tagName==='TEXTAREA'){clone.value=original.value;clone.textContent=original.value;}
   if(original.tagName==='SELECT')for(let k=0;k<original.options.length;k++){clone.options[k].selected=original.options[k].selected;if(original.options[k].selected)clone.options[k].setAttribute('selected','');else clone.options[k].removeAttribute('selected');}
   if(original.scrollTop||original.scrollLeft){clone.dataset.genieScroll=scroll.length;scroll.push([original.scrollLeft,original.scrollTop]);}
  }
  copy.className='air-genie-copy';for(const name of ['data-app','data-pad-mounted','data-workspace','data-minimized','data-legacy','data-dirty'])copy.removeAttribute(name);copy.removeAttribute('hidden');copy.inert=true;copy.setAttribute('aria-hidden','true');copy.removeAttribute('tabindex');
  Object.assign(copy.style,{position:'absolute',left:'0',top:'0',right:'auto',bottom:'auto',margin:'0',width:node.offsetWidth+'px',height:node.offsetHeight+'px',maxWidth:'none',maxHeight:'none',transform:'none',translate:'none',scale:'none',opacity:'1',visibility:'visible',contain:'layout paint style'});
  return{copy,scroll,nodes:originals.length};
 }
 function restoreVisibility(effect){if(effect.visibility)effect.node.style.setProperty('visibility',effect.visibility,effect.visibilityPriority);else effect.node.style.removeProperty('visibility');delete effect.node.dataset.genieActive;}
 function release(effect){
  clearTimeout(effect.retargetJob);for(const animation of effect.animations||[])animation.cancel();effect.animations=[];effect.observer?.disconnect();effect.layer.remove();effect.strips.length=0;effect.copy=null;live.delete(effect.node);restoreVisibility(effect);
 }
 function finish(effect,aborted=false){
  if(!live.has(effect.node))return;last={direction:effect.end===1?'minimize':'restore',backend:effect.projection==='affine-clipped'?'affine-clipped-dom-strips':'projective-dom-strips',projection:effect.projection,source:effect.source,target:effect.target,rows:effect.count,keyframes:effect.keyframeCount,captureMs:effect.captureMs,buildMs:effect.buildMs,timelineDuration:effect.duration,reversals:effect.reversals,aborted};
  release(effect);if(aborted){cancelled++;effect.reject(Error('Genie cancelled'));}else effect.resolve();
 }
 function progress(effect){return Math.max(0,Math.min(1,Number(effect.master?.currentTime??effect.p*effect.duration)/effect.duration));}
 function targetAt(effect,p){if(!effect.anchor)return effect.target;const {at,from,to}=effect.anchor,range=p<at?at:1-at,q=model.ease(range>1e-6?Math.abs(p-at)/range:1);return Object.fromEntries(['x','y','width','height'].map(k=>[k,from[k]+(to[k]-from[k])*q]));}
 function timeline(effect,p){
  const from=progress(effect);if(p===undefined)p=from;
  const offsets=[...new Set([0,1,p,...Array.from({length:33},(_,i)=>i/32)])].sort((a,b)=>a-b),tracks=Array.from({length:effect.count},()=>[]),height=effect.source.height/effect.count;
  for(const offset of offsets){const points=model.rows(effect.source,targetAt(effect,offset),offset,effect.count);for(let i=0;i<effect.count;i++)tracks[i].push({offset,...(effect.projection==='affine-clipped'?model.clippedRow(points[i],points[i+1],effect.source.width,height):{transform:model.cssTransform(points[i],points[i+1],effect.source.width,height)})});}
  for(const a of effect.animations||[])a.cancel();effect.animations=[];
  const master=effect.layer.animate([{offset:0,opacity:1},{offset:.8,opacity:1},{offset:1,opacity:0}],{duration:effect.duration,easing:'linear',fill:'both'});effect.master=master;effect.animations.push(master);
  for(let i=0;i<effect.count;i++)effect.animations.push(effect.strips[i].animate(tracks[i],{duration:effect.duration,easing:'linear',fill:'both'}));
  for(const animation of effect.animations){animation.pause();animation.currentTime=p*effect.duration;animation.playbackRate=effect.end===1?1:-1;animation.play();}
  effect.keyframeCount=offsets.length;const lease=++effect.timelineLease;master.finished.then(()=>{if(!live.has(effect.node)||lease!==effect.timelineLease)return;effect.target=targetAt(effect,effect.end);finish(effect);},()=>{});
 }
 function queueRetarget(effect){
  if(effect.retargetJob)return;effect.retargetJob=setTimeout(()=>{effect.retargetJob=null;if(!live.has(effect.node))return;const next=rect(effect.targetNode);if(!next)return;const p=progress(effect),current=targetAt(effect,p);if(['x','y','width','height'].every(k=>Math.abs(current[k]-next[k])<.25))return;effect.anchor={at:p,from:{...current},to:next};effect.target=current;timeline(effect,p);},48);
 }
 function create(node,targetNode,source,target,restore){
  const began=performance.now(),snapshot=freeze(node),count=caps(),layer=document.createElement('div');layer.className='air-genie-layer deep-glass-tile';layer.setAttribute('aria-hidden','true');layer.inert=true;
  Object.assign(layer.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'1900',overflow:'visible',contain:'layout style'});
  const effect={node,targetNode,source,target:{...target},goal:null,count,projection:motion.quality()==='economy'?'affine-clipped':'projective',strips:[],copy:snapshot.copy,layer,p:restore?1:0,end:restore?0:1,duration:duration(),animations:[],master:null,timelineLease:0,keyframeCount:0,anchor:null,reversals:0,retargetJob:null,visibility:node.style.getPropertyValue('visibility'),visibilityPriority:node.style.getPropertyPriority('visibility'),captureMs:performance.now()-began};
  effect.finished=new Promise((resolve,reject)=>{effect.resolve=resolve;effect.reject=reject;});effect.cancel=()=>finish(effect,true);
  for(let i=0;i<count;i++){
   const strip=document.createElement('div');strip.className='air-genie-strip';const clone=snapshot.copy.cloneNode(true);
   Object.assign(strip.style,{position:'absolute',left:'0',top:'0',width:source.width+'px',height:source.height/count+1+'px',overflow:'hidden',contain:'strict',transformOrigin:'0 0',willChange:'transform'});
   clone.style.top=-source.height*i/count+'px';strip.append(clone);layer.append(strip);effect.strips.push(strip);
  }
  // Insert once, then restore all captured scroll offsets before hiding the real
  // window. No layout measurement or DOM construction occurs in the frame loop.
  document.body.append(layer);for(const element of layer.querySelectorAll('[data-genie-scroll]')){const pos=snapshot.scroll[Number(element.dataset.genieScroll)];element.scrollLeft=pos[0];element.scrollTop=pos[1];}
  effect.buildMs=performance.now()-began;live.set(node,effect);timeline(effect,effect.p);node.style.setProperty('visibility','hidden','important');node.dataset.genieActive='true';
  if(targetNode){effect.observer=new ResizeObserver(()=>queueRetarget(effect));effect.observer.observe(targetNode);const dock=targetNode.closest('.pad-dock');if(dock)effect.observer.observe(dock);}
  effect.buildMs=performance.now()-began;total++;effect.owned=motion.adopt(node,effect,'genie');return effect.owned;
 }
 async function transition(node,targetNode,restore=false){
  const current=live.get(node);
  if(current){const next=restore?0:1;if(current.end!==next){current.end=next;current.reversals++;for(const animation of current.animations)animation.reverse();}return current.owned;}
  const source=rect(node),target=rect(targetNode);
  let reason='';if(disposed||!source)reason='unavailable';else if(motion.reduced()||document.hidden)reason='reduced-or-hidden';else if(!target||target.width<1||target.y>=innerHeight||target.x>=innerWidth||target.x+target.width<=0)reason='no-visible-dock-icon';else if(!(motion.quality()==='economy'?CSS.supports('clip-path','polygon(0 0,100% 0,100% 100%,0 100%)'):CSS.supports('transform','perspective(1000px) rotateX(.1rad) scaleY(1)')))reason='unsupported-projective-transform';else if(live.size>=2||navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=2||source.width*source.height>2400000)reason='resource-budget';
  if(!reason){try{return await create(node,targetNode,source,target,restore);}catch(error){reason='capture-'+(error.name==='SecurityError'?'protected-content':['complex-content','embedded-content','gpu-canvas','video-not-ready','large-canvas','image-not-ready'].includes(error.message)?error.message:'unavailable');const effect=live.get(node);if(effect)finish(effect,true);}}
  fallbacks++;last={backend:'fallback',reason,direction:restore?'restore':'minimize'};
  if(reason==='reduced-or-hidden'||reason==='unavailable')return true;
  return restore?motion.show(node,'window',target):motion.depart(node,target);
 }
 function retarget(){for(const effect of live.values())queueRetarget(effect);}
 function clear(){for(const node of [...live.keys()])motion.cancel(node);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();},{signal});document.addEventListener('air-ipad-session',e=>{if(!e.detail)clear();},{signal});document.addEventListener('air-workspace-changed',clear,{signal});
 window.addEventListener('resize',clear,{signal});window.visualViewport?.addEventListener('resize',clear,{signal});
 window.addEventListener('pagehide',e=>{clear();if(!e.persisted){disposed=true;events.abort();}},{signal});
 const ready=()=>window.airDesktop?.ready.then(async()=>{const saved=await airStore.setting('genie-speed','normal');if(['normal','fast','slow'].includes(saved))speed=saved;}).catch(()=>{speed='normal';});document.addEventListener('DOMContentLoaded',ready,{once:true,signal});
 window.airGenie=Object.freeze({transition,retarget,has:node=>live.has(node),clear,setSpeed:async value=>{if(!['normal','fast','slow'].includes(value))throw Error('Unknown Genie speed');speed=value;await airStore.setSetting('genie-speed',value);},snapshot:()=>({active:live.size,temporaryStrips:[...live.values()].reduce((n,e)=>n+e.strips.length,0),total,cancelled,fallbacks,speed,last,running:[...live.values()].map(e=>({progress:progress(e),end:e.end,rows:e.count,projection:e.projection,source:e.source,target:targetAt(e,progress(e)),reversals:e.reversals}))})});
})();
