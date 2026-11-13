'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const dir = path.join(__dirname, '../ipad');
const read = file => fs.readFileSync(path.join(dir, file), 'utf8');

test('PWA assets parse, stay same-origin and do not depend on Electron', () => {
  const html = read('index.html');
  const js = read('app.js');
  const sw = read('sw.js');
  const manifest = JSON.parse(read('manifest.webmanifest'));
  new vm.Script(js);
  new vm.Script(sw);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  for (const file of ['index.html','app.js','styles.css','manifest.webmanifest','air-os-official.png','sw.js']) {
    assert.ok(fs.existsSync(path.join(dir,file)), 'Missing offline asset: ' + file);
  }
  assert.match(html, /href="\.\/manifest\.webmanifest"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(js, /navigator\.serviceWorker\.register\('\.\/sw\.js'/);
  assert.doesNotMatch(html, /<script[^>]+https?:\/\//i);
  assert.doesNotMatch(js, /(?:fetch|XMLHttpRequest)\(['"]https?:\/\//);
  assert.doesNotMatch(js, /ipcRenderer|window\.airOS|require\(['"]electron/);
});

test('every queried element exists in iPad HTML', () => {
  const html = read('index.html');
  const js = read('app.js');
  const matchedIds = [...js.matchAll(/\$\('#([^']+)'\)/g)].map(match => match[1]);
  const uniqueIds = new Set(matchedIds);
  for (const id of uniqueIds) {
    assert.ok(html.includes('id="' + id + '"'), 'Missing HTML element: ' + id);
  }
});

test('Safari navigation receives a non-redirected offline response', async () => {
  const handlers = {}, stores = new Map(), fetched = [], origin = 'https://air-os.example.ts.net/';
  const caches = {async open(name){if(!stores.has(name))stores.set(name,new Map());const m=stores.get(name);return{put:async(u,r)=>m.set(String(u),r.clone()),match:async u=>m.get(String(u))?.clone(),delete:async u=>m.delete(String(u))};},keys:async()=>[...stores.keys()],delete:async n=>stores.delete(n)};
  const self = {registration:{scope:origin},addEventListener:(n,f)=>handlers[n]=f,clients:{claim:async()=>{}},skipWaiting:async()=>{}};
  const files=['index.html','styles.css','app.js','manifest.webmanifest','air-os-official.png','storage.js','desktop.js','apps.js','backup.js','core/security.js'],snapshot=new Map(files.map(f=>[f,fs.readFileSync(path.join(dir,f))])),integrity=Object.fromEntries([...snapshot].map(([f,b])=>[f==='index.html'?'./':'./'+f,{sha256:require('node:crypto').createHash('sha256').update(b).digest('hex'),bytes:b.length}]));
  const context={self,caches,URL,Promise,Response,Headers,AbortController,setTimeout,clearTimeout,crypto:require('node:crypto').webcrypto,fetch:async(u,options)=>{assert.equal(options.redirect,'error');fetched.push(String(u));const name=new URL(u).pathname.slice(1)||'index.html';return new Response(snapshot.get(name),{headers:{'Content-Type':name.endsWith('.html')?'text/html':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'application/octet-stream'}});}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../scripts/templates/ipad-service-worker.js'),'utf8').replace('__VERSION__','air-os-ipad-v5-'+ '0'.repeat(20)).replace('__SHELL__',JSON.stringify(Object.keys(integrity))).replace('__INTEGRITY__',JSON.stringify(integrity)),context);
  let install;handlers.install({waitUntil:p=>install=p});await install;
  const names=await caches.keys();assert.equal(names.length,1,'staging cache is removed only after complete generation publication');
  const cache=await caches.open(names[0]),stored=await cache.match(origin);
  for(const f of ['./styles.css','./app.js','./manifest.webmanifest','./air-os-official.png','./storage.js','./desktop.js','./apps.js','./backup.js'])assert.ok(await cache.match(new URL(f,origin).href),'Offline asset missing: '+f);
  assert.equal(new Set(fetched).size,fetched.length);
  assert.equal(stored.redirected,false);
  context.fetch=async()=>{throw Error('Synthetic offline host');};
  let navigation;handlers.fetch({request:{method:'GET',url:origin,mode:'navigate'},respondWith:p=>navigation=p});
  const offline=await navigation;assert.equal(await offline.text(),snapshot.get('index.html').toString());assert.equal(offline.redirected,false);assert.equal(offline.status,200);
});
