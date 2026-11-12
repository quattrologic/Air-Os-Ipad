'use strict';
// Match the existing WebKit audio/blob gate: real isolated persistent profiles.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
function widgetBrowser(type,launchOptions={}){
 const contexts=new Set(),profiles=[];
 return {async newContext(options={}){const profile=fs.mkdtempSync(path.join(os.tmpdir(),'air-widget-browser-'));profiles.push(profile);const context=await type.launchPersistentContext(profile,{...launchOptions,...options});contexts.add(context);context.on('close',()=>contexts.delete(context));return context;},async close(){for(const context of contexts)await context.close();for(const profile of profiles)fs.rmSync(profile,{recursive:true,force:true});}};
}
module.exports={widgetBrowser};
