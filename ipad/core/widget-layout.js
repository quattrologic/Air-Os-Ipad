'use strict';
// Layout projections only. Notes, events, media and legacy preferences stay owned by their apps.
(function(root){
 const defaults={music:'large',clock:'small',calendar:'small',weather:'small',battery:'small',reminders:'medium',notes:'medium',photos:'medium'};
 const ids=Object.keys(defaults),sizes=['small','medium','large'];
 function normalize(value,legacy){
  const source=value?.version===2?value:legacy||{},order=[];
  for(const id of [...(Array.isArray(source.order)?source.order:[]),...ids])if(ids.includes(id)&&!order.includes(id))order.push(id);
  const result={version:2,order,sizes:{}};
  for(const id of ids){const size=Object.hasOwn(source.sizes||{},id)?source.sizes[id]:undefined;result.sizes[id]=sizes.includes(size)?size:size==='wide'?'medium':defaults[id];}
  return result;
 }
 function reorder(order,id,target,after=false){const next=order.filter(x=>x!==id),index=next.indexOf(target);if(!order.includes(id)||index<0)return [...order];next.splice(index+(after?1:0),0,id);return next;}
 const api=Object.freeze({normalize,reorder,ids:Object.freeze(ids),sizes:Object.freeze(sizes)});
 if(typeof module==='object'&&module.exports)module.exports=api;else root.airWidgetLayout=api;
})(typeof window==='object'?window:globalThis);
