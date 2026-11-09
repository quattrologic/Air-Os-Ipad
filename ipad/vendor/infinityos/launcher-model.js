'use strict';
/* Adapted from InfinityOS script.js::openMenu, a6584135cbcad837d57484211119451bbb2d8fb2.
 * AGPL-3.0, Infinity-Systems-UA contributors. Multi-category filtering is an Air-OS extension.
 * This consumes registry entries; it owns no apps or persistent records. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.airLauncherModel=api;})(typeof window==='object'?window:null,()=>{
 function groups(apps,query='',category='Alle Gruppen',strict=false){
  const result=new Map(),q=String(query).trim().toLocaleLowerCase();
  apps.forEach(app=>{if(!app||typeof app.id!=='string'||typeof app.name!=='string')return;
   const key=app.launcherCategory||app.category||'System';
   if(category!=='Alle Gruppen'&&(strict?category!==key:category!==key&&category!==app.category))return;
   if(q&&!app.name.toLocaleLowerCase().includes(q)&&!key.toLocaleLowerCase().includes(q))return;
   if(!result.has(key))result.set(key,[]);result.get(key).push(app);
  });return [...result].map(([name,apps])=>({name,apps}));
 }
 return Object.freeze({groups});
});
