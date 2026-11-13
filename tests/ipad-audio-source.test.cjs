'use strict';
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Exercise the existing audio owner, including an asynchronous IDB Blob read.
const playSource=fs.readFileSync(require('node:path').join(__dirname,'../ipad/app.js'),'utf8').split('  async function playTrack(id) {')[1].split('  function next(delta) {')[0];
function fixture({failure=4,rejectRetry=false,size=8,read,eventOnly=false}={}){
 const bytes=Uint8Array.from([82,73,70,70,1,2,3,4]),original=new Blob([bytes],{type:'audio/wav'}),urls=[],revoked=[],notices=[];let reads=0,plays=0,loads=0;const errorListeners=new Set(),pauseListeners=new Set();
 const record={id:'song',blob:{size,type:'audio/wav',slice:()=>original,arrayBuffer:async()=>{reads++;return read?read():bytes.buffer;}}},state={currentId:'',objectUrl:null};
 const audio={src:'',error:null,pause(){for(const fn of [...pauseListeners])fn();},load(){loads++;this.error=null;},async play(){plays++;if(plays===1&&failure||plays===2&&rejectRetry){this.error={code:failure};if(eventOnly&&plays===1){queueMicrotask(()=>{for(const fn of [...errorListeners])fn();});return new Promise(()=>{});}throw Error('Native decoder failure');}},addEventListener(type,fn){if(type==='error')errorListeners.add(fn);if(type==='pause')pauseListeners.add(fn);},removeEventListener(type,fn){if(type==='error')errorListeners.delete(fn);if(type==='pause')pauseListeners.delete(fn);}};
 const env={Blob,URL:{createObjectURL(blob){urls.push(blob);return 'blob:synthetic-'+urls.length;},revokeObjectURL:url=>revoked.push(url)},song:()=>record,state,audio,safeJSON:()=>({}),KEYS:{progress:'progress'},renderLibrary(){},renderMedia(){},toast:s=>notices.push(s)};
 vm.runInNewContext('async function playTrack(id) {'+playSource+'\nglobalThis.play=playTrack;',env);
 return{...env,urls,revoked,notices,record,bytes,errorListeners,pauseListeners,stats:()=>({reads,plays,loads})};
}
test('native error4 retries exactly once from identical independent bytes without rewriting stored media',async()=>{
 const f=fixture(),stored=f.record.blob;await f.play('song');a.deepEqual(f.stats(),{reads:1,plays:2,loads:2});a.equal(f.urls.length,2);a.notEqual(f.urls[0],f.urls[1]);a.deepEqual(new Uint8Array(await f.urls[1].arrayBuffer()),f.bytes);a.equal(f.urls[1].type,'audio/wav');a.equal(f.record.blob,stored);a.deepEqual(f.revoked,['blob:synthetic-1']);a.deepEqual(f.notices,[]);
});
test('successful media, other native failures and files beyond the import bound avoid recovery reads',async()=>{
 for(const options of [{failure:0},{failure:2},{failure:4,size:64*1024*1024+1}]){const f=fixture(options);await f.play('song');a.equal(f.stats().reads,0);a.equal(f.stats().plays,1);a.equal(f.urls.length,1);a.equal(f.notices.length,options.failure?1:0);}
});
test('an actual unsupported format fails normally after one bounded retry',async()=>{
 const f=fixture({rejectRetry:true});await f.play('song');a.deepEqual(f.stats(),{reads:1,plays:2,loads:2});a.equal(f.notices.length,1);a.match(f.notices[0],/Audioformat/);
});
test('a source change during the Blob read cannot restart the obsolete song',async()=>{
 let resolveRead,started;const reading=new Promise(r=>started=r),f=fixture({read:()=>{started();return new Promise(r=>resolveRead=r);}});const pending=f.play('song');await reading;f.state.currentId='next-song';f.state.objectUrl=f.audio.src='blob:next-song';resolveRead(f.bytes.buffer);await pending;a.deepEqual(f.stats(),{reads:1,plays:1,loads:1});a.equal(f.audio.src,'blob:next-song');a.equal(f.urls.length,1);a.deepEqual(f.notices,[]);
});

test('a native error event recovers even if WebKit never settles its original play promise',async()=>{
 const f=fixture({eventOnly:true});await f.play('song');a.deepEqual(f.stats(),{reads:1,plays:2,loads:2});a.equal(f.errorListeners.size,0);a.equal(f.audio.src,'blob:synthetic-2');
});

test('a pause during recovery cancels the byte read result without restarting playback',async()=>{
 let resolveRead,started;const reading=new Promise(r=>started=r),f=fixture({read:()=>{started();return new Promise(r=>resolveRead=r);}});const pending=f.play('song');await reading;f.audio.pause();resolveRead(f.bytes.buffer);await pending;a.equal(f.stats().plays,1);a.equal(f.urls.length,1);a.equal(f.pauseListeners.size,0);a.equal(f.errorListeners.size,0);
});
