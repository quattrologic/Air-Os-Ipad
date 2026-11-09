/* MIT Rickky2026: MacDock.qml row/c0/refLeft/cosine; Spring.qml integrator;
 * PlayerWidget.qml reference-unit composition. Pins/limits: third_party/tahoe7/. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airMacShell7=api;})(typeof window==='object'?window:null,()=>{
 function step(s,target,dt,response=.30,damping=1,epsilon=.001){dt=Math.min(Math.max(dt,0),.05);const w=2*Math.PI/Math.max(response,.02),k=w*w,c=2*damping*w,n=Math.max(1,Math.ceil(dt/.004)),h=dt/n;let x=s.value,v=s.velocity;for(let i=0;i<n;i++){v+=(k*(target-x)-c*v)*h;x+=v*h;}const done=Math.abs(target-x)<epsilon&&Math.abs(v)<epsilon*10;return{value:done?target:x,velocity:done?0:v,done};}
 function dock(count,viewport,mx=null,strength=0,requested=52,magnification=1.7){
  const available=Math.max(180,viewport-28),capacity=Math.max(3,Math.floor((available-91)/38)),paged=count>capacity,n=Math.min(count,capacity),extra=20+Math.max(0,n-1)*6+(n>1?15:0)+(paged?68:0);
  const size=Math.min(requested,Math.max(24,(available-extra)/(n+1.85))),baseW=n*size+Math.max(0,n-1)*6+(n>1?15:0),refLeft=(viewport-baseW)/2;
  let x=0;const cells=[];for(let i=0;i<n;i++){const c0=i*(size+6)+(i>0?15:0)+size/2,dist=Math.abs((mx??-1e6)-refLeft-c0),R=(size+6)*2.6,f=dist<R?.5*(1+Math.cos(Math.PI*dist/R)):0,scale=1+(magnification-1)*f*Math.max(0,Math.min(1,strength)),width=size*scale;cells.push({x,width,icon:width*.99,scale,c0});x+=width+(i<n-1?6:0)+(i===0&&n>1?15:0);}
  const width=Math.min(available,x+20+(paged?68:0));return{cells,width,size,height:size+17,paged,capacity:n,refLeft};
 }
 function player(width,height,size){const small=size==='small',large=size==='large',k=.8*(small?width/202:large?width/446:height/202),wr=width/k,hr=height/k,mx=23,artS=small?110:large?hr-218:hr-142;return{k,titleFont:small?21:24,artistFont:small?18:21,smallPlay:{x:wr-mx-46,y:23,size:46},art:{x:large?(wr-artS)/2:mx,y:23,size:Math.max(20,artS)},textX:small?mx:large?mx:mx+artS+18,titleCY:small?hr-60:large?hr-165:23+artS/2-16,subCY:small?hr-31:large?hr-137.5:23+artS/2+16,barCY:hr-95.5,timeCY:hr-75.2,ctlCY:hr-44};}
 function preset(){return{desktopWidgets:true,widgetSet:['clock','calendar','notes','reminders','music'],widgetLayout:{clock:{size:'small',style:'dial'},calendar:{size:'small',style:'digital'},notes:{size:'small',style:'digital'},reminders:{size:'small',style:'digital'},music:{size:'medium',style:'digital'}},widgetPositions:{clock:{x:21,y:56},calendar:{x:228,y:56},notes:{x:21,y:258},reminders:{x:228,y:258},music:{x:21,y:460}}};}
 // Air-OS compatibility: backups created before R7 implicitly used the original scale1.
 function restoreReference(backup){return backup?{widgetScale:1,...structuredClone(backup)}:null;}
 return Object.freeze({step,dock,player,preset,restoreReference});
});
