'use strict';
// Bottom-dock row geometry adapted from Windows Animations (Windhawk, MIT).
// Copyright (c) ReDrag; classic Genie credit Abdullah Masood. MIT text: ../NOTICE.
// Independent Web projection/lifecycle; no native or Apple implementation included.
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;if(root)root.airGenieModel=api;})(typeof window==='object'?window:null,()=>{
 const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{const t=clamp(v);return t*t*(3-2*t);};
 const speeds=Object.freeze({normal:360,fast:240,slow:720});
 const valid=r=>r&&[r.x,r.y,r.width,r.height].every(Number.isFinite)&&r.width>0&&r.height>0;
 function edge(source,target,t,v){
  if(!valid(source)||!valid(target))throw Error('Invalid Genie geometry');
  const p=clamp(t),m=ease(p*1.65-(1-v)*.65),neck=Math.min(target.width,Math.max(12,Math.min(60,source.width*.03))),cx=source.x+source.width/2,tx=target.x+target.width/2,ty=target.y+target.height/2;
  const width=source.width+(neck-source.width)*m;
  return{x:cx+(tx-cx)*m-width/2,y:source.y+source.height*v+(ty-source.y-source.height*v)*m,width};
 }
 function rows(source,target,t,count=32){
  const out=Array.from({length:count+1},(_,i)=>edge(source,target,t,i/count));
  // A maximized PWA window can extend under its floating Dock. Preserve row
  // ordering there, rather than folding the last strips back over their text.
  const first=out[0].y,last=out[count].y;let monotonic=first;
  for(let i=1;i<=count;i++){monotonic=Math.max(monotonic+1e-6,out[i].y);out[i].y=monotonic;}
  const extent=monotonic-first;
  if(extent>0)for(let i=0;i<=count;i++)out[i].y=first+(out[i].y-first)/extent*Math.max(0,last-first);
  return out;
 }
 // Project a rectangular source strip into its two variable-width edge rows.
 // CSS matrix3d uses a homogeneous denominator, so both curved boundaries match.
 function matrix(top,bottom,width,height){
  const ratio=Math.max(.000001,top.width/Math.max(.000001,bottom.width));
  return[top.width/width,0,0,0,(bottom.x*ratio-top.x)/height,(bottom.y*ratio-top.y)/height,0,(ratio-1)/height,0,0,1,0,top.x,top.y,0,1];
 }
 function project(m,x,y){const d=m[3]*x+m[7]*y+m[15];return{x:(m[0]*x+m[4]*y+m[12])/d,y:(m[1]*x+m[5]*y+m[13])/d};}
 return Object.freeze({speeds,valid,edge,rows,matrix,project,ease});
});
