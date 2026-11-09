'use strict';
// Presentation scheduler only; desktop.js remains the lifecycle/geometry owner.
// InfinityOS winOpen curve + MacShell SPopUp OutCubic/OutQuint timings adapted to WAAPI.
(()=>{
 const active=new Map(),events=new AbortController(),signal=events.signal;let last=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('pad-reduced-motion');
 const curves={open:'cubic-bezier(.34,1.56,.64,1)',panel:'cubic-bezier(.22,1,.36,1)',exit:'cubic-bezier(.32,0,.67,0)'};
 const box=node=>{if(!node?.isConnected)return null;const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};
 function cancel(node){const item=active.get(node);if(item){active.delete(node);item.animation.cancel();item.resolve(false);}}
 function run(node,frames,duration,easing,kind,origin=null){cancel(node);if(!node?.isConnected||document.hidden||reduced()||!node.animate)return Promise.resolve(true);
  const animation=node.animate(frames,{duration,easing,fill:'none'});last={kind,origin,duration,target:box(node)};
  return new Promise(resolve=>{const item={animation,resolve,kind};active.set(node,item);animation.finished.then(()=>{if(active.get(node)!==item)return;active.delete(node);animation.cancel();resolve(true);window.airDesktopGlass?.refresh();},()=>{if(active.get(node)===item){active.delete(node);resolve(false);}});});
 }
 function show(node,kind='panel',origin=null){const rect=box(node);if(!rect)return Promise.resolve(true);let frames;
  if(kind==='session')frames=[{opacity:0,translate:'0 10px'},{opacity:1,translate:'0 0'}];
  else if(kind==='activate')frames=[{opacity:.86},{opacity:1}];
  else if(kind==='window'&&origin?.width>0){const dx=origin.x+origin.width/2-rect.x-rect.width/2,dy=origin.y+origin.height/2-rect.y-rect.height/2,sx=Math.max(.08,Math.min(1,origin.width/rect.width)),sy=Math.max(.08,Math.min(1,origin.height/rect.height));frames=[{opacity:.1,transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`,borderRadius:'20px'},{opacity:1,transform:'translate(0,0) scale(1)',borderRadius:getComputedStyle(node).borderRadius}];}
  else if(node.id==='notch-panel'){frames=[{opacity:0,transform:'translateX(-50%) translateY(-6px) scale(.90,.80)'},{opacity:1,transform:'translateX(-50%) translateY(0) scale(1)'}];}
  else if(kind==='window')frames=[{opacity:0,transform:'translateY(18px) scale(.96)'},{opacity:1,transform:'translateY(0) scale(1)'}];
  else frames=[{opacity:0,translate:'0 8px',scale:'.97'},{opacity:1,translate:'0 0',scale:'1'}];
  return run(node,frames,kind==='session'?650:kind==='window'?280:220,kind==='session'?'cubic-bezier(.23,1,.32,1)':kind==='window'?curves.open:curves.panel,kind,origin);
 }
 function depart(node,target=null){const r=box(node);if(!r)return Promise.resolve(true);if(!target)return run(node,[{opacity:1,translate:'0 0',scale:'1'},{opacity:0,translate:'0 10px',scale:'.97'}],170,curves.exit,'close');const dx=target?target.x+target.width/2-r.x-r.width/2:0,dy=target?target.y+target.height/2-r.y-r.height/2:10;
  return run(node,[{opacity:1,transform:'translate(0,0) scale(1)'},{opacity:0,transform:`translate(${dx}px,${dy}px) scale(${target?Math.max(.06,target.width/r.width):.97},${target?Math.max(.06,target.height/r.height):.97})`}],170,curves.exit,'close',target);
 }
 function clear(){for(const node of [...active.keys()])cancel(node);}
 const observer=new MutationObserver(()=>{if(reduced())clear();});observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();},{signal});
 document.addEventListener('air-ipad-session',e=>{clear();void show(document.querySelector(e.detail?'#desktop':'#lockscreen'),'session');},{signal});
 // Pro Notch owns its one surface timeline; desktop motion never animates that surface.
 window.addEventListener('pagehide',e=>{clear();if(!e.persisted){observer.disconnect();events.abort();}});
 window.airVisualMotion=Object.freeze({show,depart,cancel,box,snapshot:()=>({active:active.size,reduced:reduced(),last})});
})();
