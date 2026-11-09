'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function worker({failure=null,scope='https://private.example/Air-OS/'}={}){
 const handlers={},stores=new Map(),source=new Map([['./','<!doctype html><title>Checked Air-OS</title>'],['./app.js','globalThis.checked=true;'],['./styles.css','body{color:white}']]),integrity=Object.fromEntries([...source].map(([p,s])=>[p,{sha256:crypto.createHash('sha256').update(s).digest('hex'),bytes:Buffer.byteLength(s)}]));
 const caches={async open(n){if(!stores.has(n))stores.set(n,new Map());const rows=stores.get(n);return{put:async(u,r)=>rows.set(String(u),r.clone()),match:async u=>rows.get(String(u))?.clone(),delete:async u=>rows.delete(String(u)),keys:async()=>[...rows.keys()]};},keys:async()=>[...stores.keys()],delete:async n=>stores.delete(n)};
 const clients=[{id:'main',type:'window',url:scope,postMessage:m=>messages.push({id:'main',...m})},{id:'other',type:'window',url:scope,postMessage:m=>messages.push({id:'other',...m})}],messages=[],requests=[];let skip=0,now=Date.now();
 const self={registration:{scope},addEventListener:(t,f)=>handlers[t]=f,skipWaiting:async()=>skip++,clients:{claim:async()=>{},get:async id=>clients.find(c=>c.id===id),matchAll:async()=>[...clients]}};
 const context={self,caches,URL,Promise,Response,AbortController,setTimeout,clearTimeout,crypto:crypto.webcrypto,Date:class extends Date{static now(){return now;}},fetch:async(u,options)=>{requests.push({url:String(u),options});if(options.redirect!=='error'||options.cache!=='no-store')throw Error('Worker fetch must reject redirects and HTTP cache reuse.');const p=new URL(u).pathname.slice(new URL(scope).pathname.length),key=p?'./'+p:'./';let r=new Response(source.get(key),{headers:{'Content-Type':key==='./'?'text/html':key.endsWith('.js')?'text/javascript':'text/css'}});if(failure)r=await failure(key,r);return r;}};
 const template=fs.readFileSync(path.join(__dirname,'../templates/ipad-service-worker.js'),'utf8');vm.runInNewContext(template.replace('__VERSION__','air-os-ipad-v5-'+ 'f'.repeat(20)).replace('__SHELL__',JSON.stringify([...source.keys()])).replace('__INTEGRITY__',JSON.stringify(integrity)),context);
 const event=async(type,fields)=>{let pending;handlers[type]({...fields,waitUntil:p=>pending=p,respondWith:p=>pending=p});return await pending;};
 return{event,context,source,caches,stores,clients,messages,requests,setNow:n=>now=n,skips:()=>skip,version:'air-os-ipad-'+encodeURIComponent(scope)+'-air-os-ipad-v5-'+ 'f'.repeat(20)};
}
module.exports={worker};
