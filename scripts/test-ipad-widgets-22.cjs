'use strict';
// Real PWA; isolated native files and explicitly mocked, consented Spotify API.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const pw=require('../build/ipad-parity-tests/node_modules/playwright');
const {create}=require('./serve-ipad-secure.cjs'),{widgetBrowser}=require('./lib/widget-browser.cjs');
(async()=>{
 const engine=process.env.AIR_PAD_ENGINE||'chromium',out=path.resolve(process.env.WIDGETS22_OUTPUT||'dist/widgets-22-'+engine);
 fs.mkdirSync(out,{recursive:true});
 const report={engine,physicalIPad:false,synthetic:true,timezone:'Europe/Berlin',checks:[],errors:[],screens:[],sizes:[]};
 const server=create({directory:path.resolve('dist/ipad-parity')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser,context,page,mode='playing',second=false;const calls=[];
 const check=(name,ok)=>{assert.ok(ok,name);report.checks.push(name);console.log('PASS',name);};
 const track=()=>({id:second?'2222222222222222222222':'1111111111111111111111',type:'track',name:second?'NIGHT SWIM':'BLUE HORIZON',artists:[{name:'Air · API-Test'}],duration_ms:180000,album:{images:[{width:320,url:'https://i.scdn.co/image/widget22'}]}});
 const quiet=async()=>page.waitForFunction(()=>!airVisualMotion.snapshot().active&&!airProNotch.snapshot().active&&!airDesktop.dockMaterial.snapshot().pending);
 const ready=async()=>{await page.waitForFunction(()=>window.airWidgets&&window.airSpotify&&window.airProNotch&&airDesktop.snapshot().ready);await page.evaluate(()=>Promise.all([airSpotify.ready,airPlaybackMetadata.ready]));};
 const unlock=async()=>{await page.locator('#unlock').tap();await page.waitForFunction(()=>airWidgets.snapshot().active);await quiet();};
 const shot=async(name,selector)=>{await quiet();await page.mouse.move(5,220);await(selector?page.locator(selector):page).screenshot({path:path.join(out,name+'.png')});report.screens.push(name+'.png');};
 const connect=async()=>{const auth=new URL(await page.evaluate(()=>airSpotify.begin(true)));await page.evaluate(async state=>{const u=new URL(location.href);u.search=new URLSearchParams({code:'SYNTHETIC_CODE',state});history.replaceState(null,'',u);await airSpotify.callback();},auth.searchParams.get('state'));await page.waitForFunction(()=>!airSpotify.snapshot().busy);};
 // The route callback also crosses the browser/Node boundary. Wait for its
 // actual request before testing idle: otherwise an idle sample can precede
 // dispatch of the newly due timer on the official CI browsers.
 const readAfter=async n=>{const deadline=Date.now()+15000;while(calls.length<=n&&Date.now()<deadline)await page.waitForTimeout(20);assert.ok(calls.length>n,'the existing poller performs a real API read');await page.waitForFunction(()=>!airSpotify.snapshot().busy);};
 // Do not advance across a new request's real 12s timeout while its mocked
 // network body is still crossing the protocol bridge. Timers remain real;
 // yield after each <=5s step until the one shared reader has completed.
 const advance=async ms=>{await page.waitForFunction(()=>!airSpotify.snapshot().busy);while(ms>0){const step=Math.min(ms,5000);await page.clock.fastForward(step);await page.waitForFunction(()=>!airSpotify.snapshot().busy);ms-=step;}};
 const nextPoll=async()=>{const n=calls.length;await advance(30001);await readAfter(n);};
 const auditSizes=async label=>{
  await page.locator('.air-widget-edit').tap();
  for(const size of ['small','medium','large']){
   await page.locator('[data-widget=music] [data-resize]').tap();await quiet();await page.locator('.air-widget-edit').tap();
   const state=await page.locator('.player-widget').evaluate(n=>{
    const c=n.getBoundingClientRect(),rows=[...n.querySelectorAll('button,a,input')].filter(b=>!b.disabled&&!b.closest('.air-widget-tools')&&b.getClientRects().length).map(b=>{const r=b.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{label:b.getAttribute('aria-label'),x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,hit:hit===b||b.contains(hit)};});
    let overlaps=0;for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)if(Math.min(rows[i].right,rows[j].right)-Math.max(rows[i].x,rows[j].x)>.5&&Math.min(rows[i].bottom,rows[j].bottom)-Math.max(rows[i].y,rows[j].y)>.5)overlaps++;
    return{size:n.dataset.size,width:c.width,height:c.height,rows,overlaps,inside:rows.every(r=>r.x>=c.x-.5&&r.right<=c.right+.5&&r.y>=c.y-.5&&r.bottom<=c.bottom+.5)};
   });
   report.sizes.push({label,...state});check(label+' '+size+': exact dimensions and disjoint reachable 44px actions',state.size===size&&state.width===(size==='small'?96:200)&&state.height===(size==='large'?200:96)&&state.inside&&!state.overlaps&&state.rows.every(r=>r.w>=44&&r.h>=44&&r.hit));
   await page.locator('.air-widget-edit').tap();
  }
  await page.locator('.air-widget-edit').tap();
 };
 try{
  browser=widgetBrowser(pw[engine],{headless:process.env.AIR_WIDGETS_HEADED!=='1',...(engine==='chromium'&&process.env.AIR_PAD_CHROMIUM?{executablePath:process.env.AIR_PAD_CHROMIUM}:{})});
  context=await browser.newContext({viewport:{width:1180,height:820},deviceScaleFactor:2,hasTouch:true,locale:'de-DE',timezoneId:'Europe/Berlin',serviceWorkers:'block'});
  await context.addInitScript(()=>Object.defineProperty(navigator,'getBattery',{value:undefined,configurable:true}));
  page=await context.newPage();await page.bringToFront();page.on('pageerror',e=>report.errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
  await page.clock.install({time:new Date('2026-11-13T09:09:00Z')});
  await context.route('https://i.scdn.co/image/widget22',r=>r.fulfill({headers:{'Access-Control-Allow-Origin':'*'},contentType:'image/jpeg',body:fs.readFileSync('docs/testing/widgets-2-1/media/reference-cover.jpg')}));
  await context.route(/https:\/\/(api|accounts)\.spotify\.com\//,async route=>{
   const req=route.request(),stamp=await page.evaluate(()=>Date.now());calls.push({method:req.method(),url:req.url(),time:stamp});
   const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Expose-Headers':'Retry-After','Content-Type':'application/json'};
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
   if(req.url().includes('/api/token'))return route.fulfill({headers,body:JSON.stringify({token_type:'Bearer',access_token:'SYNTHETIC_WIDGET22_ACCESS',refresh_token:'SYNTHETIC_WIDGET22_REFRESH',expires_in:3600})});
   if(mode==='forbidden')return route.fulfill({status:403,headers,body:'{}'});
   if(mode==='rate')return route.fulfill({status:429,headers:{...headers,'Retry-After':'60'},body:'{}'});
   if(mode==='recent'&&!req.url().includes('recently-played'))return route.fulfill({status:204,headers});
   return route.fulfill({headers,body:JSON.stringify(mode==='recent'?{items:[{played_at:new Date(stamp).toISOString(),track:track()}]}:{timestamp:stamp,is_playing:mode==='playing'||mode==='unsupported',progress_ms:12000,item:mode==='unsupported'?{...track(),type:'episode'}:track()})});
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/');await ready();await unlock();
  check('Spotify is the fresh-profile preference without an implicit network request',!calls.length&&await page.evaluate(()=>airWidgets.snapshot().musicSource==='spotify'&&document.querySelector('.player-widget').dataset.source==='disconnected'));
  const editStyle=await page.locator('.air-widget-edit').evaluate(n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return{background:s.backgroundColor,image:s.backgroundImage,shadow:s.boxShadow,textShadow:s.textShadow,filter:s.backdropFilter||s.webkitBackdropFilter,border:s.borderTopWidth,width:r.width,height:r.height};});
  report.editStyle=editStyle;check('Widgets anpassen is transparent text with a real touch target',editStyle.background==='rgba(0, 0, 0, 0)'&&editStyle.image==='none'&&editStyle.shadow==='none'&&editStyle.textShadow==='none'&&editStyle.filter==='none'&&editStyle.border==='0px'&&editStyle.width>=44&&editStyle.height>=44);
  await page.keyboard.press('Tab');await page.locator('.air-widget-edit').focus();check('keyboard focus retains a visible text indicator without a filled box',await page.locator('.air-widget-edit').evaluate(n=>n===document.activeElement&&getComputedStyle(n).textDecorationLine.includes('underline')&&getComputedStyle(n).backgroundColor==='rgba(0, 0, 0, 0)'));await shot('edit-action-focus','.air-widget-edit');await page.locator('.air-widget-edit').blur();await shot('edit-action','.air-widget-edit');
  await auditSizes('Disconnected Spotify');
  await page.evaluate(()=>airSpotify.configure('a'.repeat(32)));await connect();await page.evaluate(()=>airPlaybackMetadata.flush());
  await page.waitForFunction(()=>document.querySelector('.player-widget strong').textContent==='BLUE HORIZON'&&document.querySelector('.widget-art .air-artwork')?.style.backgroundImage.includes('data:image'));
  check('authorized API supplies real title, artist, cached cover and playing status',await page.evaluate(()=>{const n=document.querySelector('.player-widget');return n.dataset.source==='spotify'&&n.dataset.playing==='true'&&n.querySelector('.widget-track small').textContent==='Air · API-Test'&&!airPlaybackMetadata.snapshot('spotify').canToggle;}));
  await auditSizes('Connected Spotify');
  // User-provided reference photograph is an isolated test import, never a default asset.
  const photoRoot='docs/testing/widgets-2-1/media/';
  await page.evaluate(async files=>{for(const [name,bytes,type]of files)await airStore.fileAction('create',{name,type:'file',blob:new Blob([Uint8Array.from(atob(bytes),c=>c.charCodeAt(0))],{type})});},[['00 Referenzfoto.png',fs.readFileSync(photoRoot+'reference-clock-subject.png').toString('base64'),'image/png'],['00 Referenzfoto-background.jpg',fs.readFileSync(photoRoot+'reference-clock-background.jpg').toString('base64'),'image/jpeg']]);
  await page.waitForFunction(()=>document.querySelector('.clock-widget').dataset.depth==='true');
  check('photo clock is exactly 200 by 200 CSS pixels',await page.locator('.clock-widget').evaluate(n=>{const r=n.getBoundingClientRect();return r.width===200&&r.height===200;}));
  await shot('spotify-music','.player-widget');await shot('clock','.clock-widget');await shot('home-landscape');
  await page.setViewportSize({width:820,height:1180});await quiet();await shot('home-portrait');await page.setViewportSize({width:1180,height:820});await quiet();
  await page.locator('.air-widget-edit').tap();await shot('editor');await page.locator('.air-widget-edit').tap();
  await page.evaluate(()=>airDesktop.open('music'));await page.locator('#import-audio').setInputFiles([{name:'LOCAL ONLY.wav',mimeType:'audio/wav',buffer:require('./test-ipad-parity.cjs').wav(8)}]);await page.waitForFunction(()=>airIPad.music.snapshot().tracks===1);await page.locator('#song-list').getByRole('button',{name:'LOCAL ONLY',exact:true}).tap();await page.waitForFunction(()=>!document.querySelector('#audio').paused&&airIPad.music.snapshot().duration>0&&airPlaybackMetadata.snapshot('air-os')?.title==='LOCAL ONLY');
  check('a newly playing Air Music title cannot replace Spotify in the widget',await page.evaluate(()=>airPlaybackMetadata.snapshot().source==='air-os'&&document.querySelector('.player-widget').dataset.source==='spotify'&&document.querySelector('.player-widget strong').textContent==='BLUE HORIZON'&&airSpotify.snapshot().pending));
  await nextPoll();check('the existing Spotify poller continues while local audio plays',await page.evaluate(()=>!document.querySelector('#audio').paused&&airPlaybackMetadata.snapshot().source==='air-os'&&airSpotify.snapshot().pending&&document.querySelector('.player-widget').dataset.source==='spotify'));await page.evaluate(()=>document.querySelector('#audio').pause());await page.evaluate(()=>airDesktop.close('music'));await quiet();
  await page.locator('.player-widget').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Musikoptionen',exact:true}).tap();await page.getByRole('menuitem',{name:'Air Music anzeigen',exact:true}).tap();
  check('Air Music remains explicitly selectable',await page.evaluate(()=>airWidgets.snapshot().musicSource==='air-os'&&document.querySelector('.player-widget strong').textContent==='LOCAL ONLY'));
  await page.getByRole('button',{name:'Musikoptionen',exact:true}).tap();await page.getByRole('menuitem',{name:'Spotify bevorzugen',exact:true}).tap();
  const count=calls.length;await page.evaluate(()=>Promise.all(Array.from({length:8},()=>airSpotify.refresh())));check('repeated refresh actions share the 15-second read gate',calls.length===count);
  second=true;mode='paused';await nextPoll();await page.evaluate(()=>airPlaybackMetadata.flush());check('paused Spotify keeps real last title without claiming live playback',await page.evaluate(()=>document.querySelector('.player-widget strong').textContent==='NIGHT SWIM'&&document.querySelector('.player-widget').dataset.playing==='false'&&airSpotify.snapshot().pending));
  mode='recent';await nextPoll();check('idle API fallback reads the authorized recent endpoint and keeps polling',calls.some(c=>c.url.endsWith('/recently-played?limit=1'))&&await page.evaluate(()=>!airPlaybackMetadata.snapshot('spotify').playing&&airSpotify.snapshot().pending));
  mode='rate';await nextPoll();const limited=calls.length,rateAt=calls.at(-1).time;await page.evaluate(()=>airSpotify.refresh());await advance(30000);check('Retry-After blocks manual and timer requests before its deadline',calls.length===limited);mode='playing';await advance(31000);await readAfter(limited);check('the shared reader resumes after Retry-After',calls.length>limited&&calls.slice(limited).every(c=>c.time>=rateAt+60000)&&await page.evaluate(()=>airPlaybackMetadata.snapshot('spotify').playing));
  mode='unsupported';await nextPoll();check('an unsupported current payload cannot keep an older song falsely live',await page.evaluate(()=>document.querySelector('.player-widget strong').textContent==='NIGHT SWIM'&&document.querySelector('.player-widget').dataset.playing==='false'));mode='playing';await nextPoll();
  mode='forbidden';await nextPoll();check('API permission errors are visible beside retained data without false live status',await page.evaluate(()=>document.querySelector('.player-widget [role=status]').textContent.includes('API-Zugriff')&&document.querySelector('.player-widget [role=status]').getAttribute('aria-label').includes('keinen Zugriff')&&document.querySelector('.player-widget').dataset.playing==='false'&&!airSpotify.snapshot().pending));const denied=calls.length;await advance(30001);check('a permission failure stops automatic API retries',calls.length===denied);mode='playing';await page.evaluate(()=>airSpotify.refresh());
  await context.setOffline(true);await page.waitForFunction(()=>!navigator.onLine);check('offline retains the known Spotify song and suspends its reader',await page.evaluate(()=>document.querySelector('.player-widget strong').textContent==='NIGHT SWIM'&&document.querySelector('.player-widget [role=status]').textContent.includes('Offline')&&document.querySelector('.player-widget').dataset.playing==='false'&&!airSpotify.snapshot().pending));await context.setOffline(false);await nextPoll();
  check('only supported read endpoints and the PKCE grant were called',calls.every(c=>c.method==='GET'||c.method==='OPTIONS'||c.method==='POST'&&c.url.endsWith('/api/token')));
  await page.evaluate(()=>airPlaybackMetadata.flush());await page.evaluate(()=>airSpotify.disconnect());
  check('disconnect shows retained authorized history with an honest connection state',await page.evaluate(()=>!airSpotify.snapshot().connected&&document.querySelector('.player-widget strong').textContent==='NIGHT SWIM'&&document.querySelector('.player-widget').dataset.playing==='false'&&document.querySelector('.player-widget [role=status]').textContent.includes('nicht verbunden')));
  await auditSizes('Retained disconnected Spotify');await shot('spotify-disconnected-history','.player-widget');
  await page.reload();await ready();await unlock();check('Spotify preference and permitted history survive reload without tokens',await page.evaluate(()=>airWidgets.snapshot().musicSource==='spotify'&&document.querySelector('.player-widget strong').textContent==='NIGHT SWIM'&&!airSpotify.snapshot().connected));
  await connect();await page.evaluate(()=>airPlaybackMetadata.setRemember(false));await nextPoll();await page.evaluate(()=>airPlaybackMetadata.flush());
  check('history opt-out permits current in-memory data and persists no song',await page.evaluate(async()=>{const h=await airStore.setting('last-played-metadata-v1');return !h.remember&&!Object.keys(h.records).length&&airPlaybackMetadata.snapshot('spotify')?.title==='NIGHT SWIM';}));
  check('neither Spotify credential is stored in browser storage',await page.evaluate(async()=>!JSON.stringify([await airStore.setting('last-played-metadata-v1'),await airStore.setting('spotify-public-config'),Object.entries(localStorage),Object.entries(sessionStorage)]).match(/SYNTHETIC_WIDGET22_(ACCESS|REFRESH)/)));
  await page.reload();await ready();await unlock();check('opted-out Spotify history stays absent after reload',await page.evaluate(()=>!airPlaybackMetadata.snapshot('spotify')&&document.querySelector('.player-widget').dataset.source==='disconnected'));
  await context.setOffline(true);await page.waitForFunction(()=>!navigator.onLine);check('an empty offline widget never claims a previous song',await page.locator('.player-widget [role=status]').textContent()==='Spotify offline');await context.setOffline(false);
  // Controlled browser clock, real minute scheduler and actual lifecycle handlers.
  await page.clock.pauseAt(new Date('2026-11-13T09:59:59Z'));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  check('clock reads the actual browser-local timezone',await page.locator('.clock-widget time').textContent()==='10:59');await page.clock.runFor(1100);
  check('minute boundary updates without a manual refresh',await page.locator('.clock-widget time').textContent()==='11:00');await page.clock.resume();
  await page.clock.setSystemTime(new Date('2026-11-13T11:12:00Z'));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));check('focus immediately synchronizes browser-local time',await page.locator('.clock-widget time').textContent()==='12:12');
  await page.clock.setSystemTime(new Date('2026-11-13T12:23:00Z'));await page.evaluate(()=>airDesktop.open('calculator'));check('real app focus immediately synchronizes the clock',await page.locator('.clock-widget time').textContent()==='13:23');await page.clock.setSystemTime(new Date('2026-11-13T12:24:00Z'));await page.evaluate(()=>airDesktop.close('calculator'));check('return from an app immediately synchronizes the clock',await page.locator('.clock-widget time').textContent()==='13:24');
  await page.evaluate(()=>document.querySelector('#lock-again').click());await page.clock.setSystemTime(new Date('2026-11-13T13:34:00Z'));await unlock();check('unlock immediately synchronizes time',await page.locator('.clock-widget time').textContent()==='14:34');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});check('simulated background suspends widget timers',await page.evaluate(()=>!airWidgets.snapshot().timer));await page.clock.setSystemTime(new Date('2026-11-13T14:45:00Z'));await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});check('visibility return synchronizes immediately',await page.locator('.clock-widget time').textContent()==='15:45');
  await page.clock.setSystemTime(new Date('2026-11-13T15:56:00Z'));await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));check('pageshow immediately synchronizes time',await page.locator('.clock-widget time').textContent()==='16:56');
  await page.waitForFunction(()=>document.querySelector('.clock-widget').dataset.depth==='true');check('transparent type and real photo depth survive the lifecycle',await page.locator('.clock-widget').evaluate(n=>getComputedStyle(n.querySelector('time')).fontSize==='112px'&&n.dataset.depth==='true'&&!!n.querySelector('.widget-clock-foreground .air-artwork')));
  await page.clock.setSystemTime(new Date());await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await shot('clock-system-local','.clock-widget');
  check('no uncaught page errors',report.errors.length===0);report.status='passed';
 }catch(e){report.status='failed';report.error=e.stack;try{report.failure=await page.evaluate(()=>({widget:airWidgets.snapshot(),spotify:airSpotify.snapshot(),metadata:airPlaybackMetadata.snapshot(),local:airPlaybackMetadata.snapshot('air-os'),source:document.querySelector('.player-widget').dataset.source,title:document.querySelector('.player-widget strong').textContent,clock:document.querySelector('.clock-widget time').textContent}));await page.screenshot({path:path.join(out,'failure.png')});}catch{}throw e;}
 finally{report.apiRequests=calls;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();server.closeAllConnections?.();await new Promise(r=>server.close(r));}
 console.log(JSON.stringify({engine,status:report.status,checks:report.checks.length}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
