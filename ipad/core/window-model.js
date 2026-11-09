'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airPadWindowMath=api;})(typeof window==='object'?window:null,function(){
 function bounds(value,area){const width=Math.min(area.width,Math.max(Math.min(320,area.width),Number(value.width)||600)),height=Math.min(area.height,Math.max(Math.min(240,area.height),Number(value.height)||480));return{x:Math.max(0,Math.min(area.width-width,Number(value.x)||0)),y:Math.max(0,Math.min(area.height-height,Number(value.y)||0)),width,height};}
 function snapped(side,area){if(side==='maximized'||area.width<640)return{x:0,y:0,width:area.width,height:area.height};const width=Math.floor(area.width/2);return {x:side==='right'?width:0,y:0,width:side==='right'?area.width-width:width,height:area.height};}
 return Object.freeze({bounds,snapped});
});
