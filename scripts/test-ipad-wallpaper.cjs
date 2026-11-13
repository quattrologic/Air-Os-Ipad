'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const pw=require(process.env.AIR_PAD_PLAYWRIGHT||'../build/ipad-parity-tests/node_modules/playwright');
const {create}=require('./serve-ipad-secure.cjs');
const {widgetBrowser}=require('./lib/widget-browser.cjs');
(async()=>{
 const server=create({directory:path.resolve('dist/ipad-parity')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port+'/',errors=[];
 let browser,page;const report={status:'running',errors};
 try{
  const engine=process.env.AIR_PAD_ENGINE||'chromium';report.engine=engine;browser=widgetBrowser(pw[engine],{headless:true,...(engine==='chromium'&&process.env.AIR_PAD_CHROMIUM?{executablePath:process.env.AIR_PAD_CHROMIUM}:{})});
  const context=await browser.newContext({viewport:{width:1180,height:820},hasTouch:true});page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const ready=async()=>{await page.waitForFunction(()=>window.airDesktop?.snapshot().ready&&window.airWallpaper);await page.evaluate(()=>airWallpaper.ready);};
  await page.goto(base);await ready();
  // Finish the initial verified installation before reload/settings tests.
  // Otherwise reload may detach its first install before clients.claim().
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await page.evaluate(()=>airWallpaper.current()),'ocean');
  await page.waitForFunction(()=>{const v=document.querySelector('video.air-wallpaper-video');return v.readyState>=2&&!v.paused&&v.currentTime>0;});
  assert.equal(await page.locator('video.air-wallpaper-video').count(),1);
  assert.equal(await page.locator('.lg-lock-wallpaper').evaluate(n=>getComputedStyle(n).filter),'blur(18px)');
  await page.locator('#unlock').tap();await page.waitForFunction(()=>airIPad.sessionOpen());
  assert.equal(await page.locator('.wallpaper video').count(),1);
  assert.equal(await page.locator('.wallpaper').evaluate(n=>getComputedStyle(n).filter),'none');
  await page.evaluate(()=>airDesktop.open('settings'));
  const select=page.getByLabel('Hintergrund',{exact:true});await select.selectOption('yosemite');
  await page.waitForFunction(()=>airWallpaper.current()==='yosemite');
  assert.ok(await page.evaluate(()=>document.querySelector('video.air-wallpaper-video').paused));
  await page.reload();await ready();assert.equal(await page.evaluate(()=>airWallpaper.current()),'yosemite');
  await page.evaluate(()=>airWallpaper.select('ocean'));
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('video.air-wallpaper-video').paused);
  assert.ok(await page.locator('video.air-wallpaper-video').isHidden());
  await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('body').tap({position:{x:20,y:200}});
  await page.waitForFunction(()=>!document.querySelector('video.air-wallpaper-video').paused);
  await page.waitForFunction(()=>navigator.serviceWorker.controller);
  const ranges=async()=>page.evaluate(async()=>{const get=async range=>{const r=await fetch('./assets/ocean-blue.mp4',{headers:{Range:range}});return [r.status,(await r.arrayBuffer()).byteLength,r.headers.get('content-range')];};return [await get('bytes=0-1'),await get('bytes=-32'),await get('bytes=999999999-')];});
  let rows=await ranges();assert.deepEqual(rows.map(r=>r.slice(0,2)),[[206,2],[206,32],[416,0]]);
  server.closeAllConnections?.();await new Promise(r=>server.close(r));rows=await ranges();assert.deepEqual(rows.map(r=>r.slice(0,2)),[[206,2],[206,32],[416,0]]);
  await page.reload();await ready();await page.waitForFunction(()=>document.querySelector('video.air-wallpaper-video').readyState>=2);
  assert.equal(await page.evaluate(()=>airWallpaper.current()),'ocean');
  await page.screenshot({path:'dist/ocean-lockscreen.png'});
  assert.deepEqual(errors,[]);report.status='passed';console.log('PASS: default, video playback, lock blur, sharp desktop, settings, persistence, reduced motion, online/offline ranges and offline reload.');
 }catch(error){report.status='failed';report.error=error.stack;try{report.state=await page.evaluate(async()=>({wallpaper:window.airWallpaper?.current(),offline:document.querySelector('#settings-offline')?.textContent,controller:!!navigator.serviceWorker.controller,registrations:(await navigator.serviceWorker.getRegistrations()).map(r=>({installing:r.installing?.state,waiting:r.waiting?.state,active:r.active?.state})),caches:await caches.keys()}));await page.screenshot({path:'dist/ocean-failure.png'});}catch{}throw error;
 }finally{fs.writeFileSync('dist/ocean-report.json',JSON.stringify(report,null,2)+'\n');await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
