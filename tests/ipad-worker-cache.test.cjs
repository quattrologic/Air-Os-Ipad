'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const body=Buffer.from('Synthetic complete source archive bytes.');
function worker(response=()=>new Response(body,{headers:{'Content-Type':'application/zip','Content-Length':String(body.length)}})){
 const calls=[],integrity=Object.fromEntries(['./source/source.zip','./app.js'].map(p=>[p,{bytes:body.length,sha256:crypto.createHash('sha256').update(body).digest('hex')}]));
 const source=fs.readFileSync(path.join(__dirname,'../scripts/templates/ipad-service-worker.js'),'utf8').replaceAll('__VERSION__','fixture').replace('__SHELL__',JSON.stringify(Object.keys(integrity))).replace('__INTEGRITY__',JSON.stringify(integrity));
 const context=vm.createContext({self:{registration:{scope:'https://fixture.invalid/private/'},addEventListener(){}},URL,Response,Headers,AbortController,crypto:crypto.webcrypto,setTimeout,clearTimeout,fetch:async(url,options)=>{calls.push({url,options});return response();}});
 vm.runInContext(source+';globalThis.probe={fetchChecked,checkedResponse,verified};',context);
 return{...context.probe,calls};
}
test('offline staging and publication retain exactly the approved source bytes without another network read',async()=>{
 const w=worker(),staged=await w.fetchChecked('./source/source.zip'),published=await w.checkedResponse(staged,'./source/source.zip');
 assert.deepEqual(Buffer.from(await published.arrayBuffer()),body);assert.equal(published.headers.get('Content-Type'),'application/zip');assert.equal(published.status,200);assert.equal(w.calls.length,1);
 assert.equal(w.calls[0].url,'https://fixture.invalid/private/source/source.zip');assert.equal(w.calls[0].options.redirect,'error');assert.equal(w.calls[0].options.credentials,'same-origin');assert.equal(w.calls[0].options.cache,'no-store');
});
test('both cache-write phases reject corruption, oversized bodies, wrong script MIME and redirected responses',async()=>{
 const w=worker();
 for(const response of [new Response(Buffer.alloc(body.length,42)),new Response(Buffer.alloc(body.length+1,42)),new Response(body.subarray(1)),new Response(body,{status:503})])await assert.rejects(w.checkedResponse(response,'./source/source.zip'),/Integrität/);
 await assert.rejects(w.checkedResponse(new Response(body,{headers:{'Content-Type':'text/html'}}),'./app.js'),/Integrität/);
 const redirected=new Response(body);Object.defineProperty(redirected,'redirected',{value:true});await assert.rejects(w.checkedResponse(redirected,'./source/source.zip'),/Integrität/);
 const staged=await w.fetchChecked('./source/source.zip');assert.equal(await w.verified(staged,'./source/source.zip'),true);
 await assert.rejects(w.checkedResponse(new Response(Buffer.alloc(body.length,9)),'./source/source.zip'),/Integrität/);
});

test('decoded cache responses declare their verified length rather than stale wire encoding',async()=>{
 const w=worker(()=>new Response(body,{headers:{'Content-Type':'application/zip','Content-Encoding':'gzip','Content-Length':'3'}})),response=await w.fetchChecked('./source/source.zip');
 assert.equal(response.headers.get('Content-Encoding'),null);assert.equal(response.headers.get('Content-Length'),String(body.length));assert.deepEqual(Buffer.from(await response.arrayBuffer()),body);
});
