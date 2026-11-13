'use strict';
// Synthetic content imported through the real local stores. No personal accounts or photos.
async function seed(page){
 const wav=require('../test-ipad-parity.cjs').wav(180);
 await page.locator('#import-audio').setInputFiles([{name:'Blue Hour.wav',mimeType:'audio/wav',buffer:wav},{name:'Afterglow.wav',mimeType:'audio/wav',buffer:wav}]);await page.waitForFunction(()=>airIPad.music.snapshot().tracks===2);
 await page.evaluate(async()=>{
  function cover(alternate=false){const c=document.createElement('canvas');c.width=c.height=480;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,480,480);g.addColorStop(0,alternate?'#edbb9d':'#89c9da');g.addColorStop(1,alternate?'#514670':'#164866');x.fillStyle=g;x.fillRect(0,0,480,480);x.fillStyle='#e7edda';x.beginPath();x.arc(325,132,57,0,Math.PI*2);x.fill();for(let i=0;i<6;i++){x.fillStyle=['#bfdce2','#81b8cc','#5b91ac','#3f7492','#2b587a','#204969'][i];x.beginPath();x.moveTo(0,240+i*32);x.bezierCurveTo(180,150+i*50,290,350+i*10,480,230+i*38);x.lineTo(480,480);x.lineTo(0,480);x.fill();}x.fillStyle='#f0fbff';x.font='14px sans-serif';x.fillText('AIR / SYNTHETIC SESSIONS',28,35);x.font='44px sans-serif';x.fillText(alternate?'AFTERGLOW':'BLUE HOUR',28,425);return c.toDataURL('image/jpeg',.85);}
  const db=await airStore.open(),tracks=await new Promise((resolve,reject)=>{const tx=db.transaction('tracks'),req=tx.objectStore('tracks').getAll();tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error||Error('Native fixture import read failed'));});
  // Retain native backing-file handles while the test-only stable IDs replace imports.
  window.__widgetFixtureMedia=tracks.map(t=>t.blob);
  for(const t of tracks){const bytes=await t.blob.arrayBuffer();if(bytes.byteLength!==44+8000*2*180)throw Error('Native fixture audio byte mismatch');}
  await new Promise((resolve,reject)=>{const tx=db.transaction('tracks','readwrite'),store=tx.objectStore('tracks');for(const [i,title]of ['Blue Hour','Afterglow'].entries()){const original=tracks.find(t=>t.title===title);if(!original)throw Error('Native audio import missing: '+title);store.put({...original,id:'widget-track-'+i,title,artist:'Air · Synthetic Sessions',artwork:cover(!!i),addedAt:Date.now()+i});}tx.oncomplete=resolve;tx.onerror=e=>reject(e.target?.error||tx.error||Error('Native fixture aliases failed'));});
  // Keep the imported backing files alive until the alias blobs are committed
  // and readable; deleting the originals in the same transaction races WebKit.
  for(const id of ['widget-track-0','widget-track-1']){const record=await new Promise((resolve,reject)=>{const tx=db.transaction('tracks'),r=tx.objectStore('tracks').get(id);tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);});if((await record.blob.arrayBuffer()).byteLength!==44+8000*2*180)throw Error('Aliased fixture audio byte mismatch');}
  await new Promise((resolve,reject)=>{const tx=db.transaction('tracks','readwrite');for(const original of tracks)tx.objectStore('tracks').delete(original.id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
  await airStore.save('note',{id:'widget-note',title:'Ein guter Tag am Meer',text:'Ideen sammeln. Raum für neue Perspektiven.\nSynthetische Testnotiz für Widget 2.0.'});
  for(const [i,title]of ['Kamera einpacken','Spaziergang am Wasser','Neue Playlist entdecken'].entries())await airStore.save('reminder',{id:'widget-task-'+i,title,completed:false,list:'Aufgaben',priority:'Keine'});
  await airStore.save('event',{id:'widget-event',title:'Designrunde · Testtermin',date:'2026-11-12',time:'14:30'});
  await airStore.save('event',{id:'widget-event-2',title:'Zeit für neue Ideen',date:'2026-11-14',time:'10:00'});
  for(const [name,url]of [['Küstenpfad · Testfoto.jpg','./assets/forest-path.jpg'],['Abendlicht · Testfoto.jpg','./assets/lake-evening.jpg']])await airStore.fileAction('create',{name,type:'file',blob:await fetch(url).then(r=>r.blob())});
  await airIPad.music.refresh();
 });
}
module.exports={seed};
