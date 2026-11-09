'use strict';
// MacShell MIT, 0-ss, commit 1bdb51870b621100fd2709f66c8f8e00ab17b9c4.
// ClockWidget.qml tickGeo: ray / rounded-rectangle intersection, adapted from QML to JS.
(()=>{function ticks(W,H){const u=Math.min(W,H)/158,inset=9*u,L=5.6*u,hw=W/2-inset,hh=H/2-inset,cr=Math.max(4*u,28*u-inset),cx=hw-cr,cy=hh-cr,out=[];for(let i=0;i<60;i++){const th=i*Math.PI/30,dx=Math.sin(th),dy=-Math.cos(th),ax=Math.abs(dx),ay=Math.abs(dy);let t=Math.min(ax>1e-9?hw/ax:1e9,ay>1e-9?hh/ay:1e9),px=ax*t,py=ay*t;if(px>cx&&py>cy){const b=ax*cx+ay*cy,c=cx*cx+cy*cy-cr*cr;t=b+Math.sqrt(Math.max(0,b*b-c));px=ax*t;py=ay*t;}const ex=dx<0?-px:px,ey=dy<0?-py:py;out.push({x:W/2+ex-dx*L/2,y:H/2+ey-dy*L/2,a:Math.atan2(dx,-dy)*180/Math.PI,length:L});}return out;}window.airMacClock=Object.freeze({ticks});})();
