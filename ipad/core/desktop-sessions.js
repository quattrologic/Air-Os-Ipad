'use strict';
// Air-OS integration model. InfinityOS Web delegates its windows to WinBox; this
// keeps Air-OS's existing registry rather than copying that second engine.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airDesktopSessions=api;})(typeof window==='object'?window:null,()=>{
 function workspace(value){const n=Number(value);return Number.isInteger(n)&&n>=0&&n<4?n:0;}
 function visible(state,current){return workspace(state.workspace)===workspace(current)&&!state.minimized;}
 function groups(value,allowed){if(!Array.isArray(value)||value.length>16)throw Error('Maximal 16 Fenstergruppen.');const ids=new Set();return value.map(g=>{if(!g||typeof g.id!=='string'||!/^[-a-z0-9]{1,100}$/i.test(g.id)||ids.has(g.id)||typeof g.name!=='string'||!g.name.trim()||g.name.length>80||!Array.isArray(g.apps)||g.apps.length<1||g.apps.length>25)throw Error('Fenstergruppe ungültig.');ids.add(g.id);const apps=[...new Set(g.apps)];if(apps.some(id=>!allowed.includes(id)))throw Error('Unbekannte App in Fenstergruppe.');return{id:g.id,name:g.name.trim(),apps};});}
 function next(ids,current,delta){if(!ids.length)return null;const i=Math.max(0,ids.indexOf(current));return ids[(i+delta+ids.length)%ids.length];}
 return Object.freeze({workspace,visible,groups,next});
});
