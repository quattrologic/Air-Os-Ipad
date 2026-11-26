'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,"../ipad/vendor/air-arcade-games.js"),'utf8');
test('Arcade registers all seven offline games and the external launcher',()=>{
 const sandbox={window:{}};vm.runInNewContext(code,sandbox);
 const html=sandbox.window.airArcadeGames.body();
 for(const id of ['snake','2048','mines','breakout','blocks','maze','hex','eaglercraft'])assert.ok(html.includes('data-game="'+id+'"'),id);
 assert.match(html,/Sieben Offline-Spiele/);
});
test('Eaglercraft launcher stays isolated and uses fixed HTTPS destinations',()=>{
 const sandbox={window:{},document:{createElement(tag){return {tag,children:[],append(...nodes){this.children.push(...nodes)}}}}};
 // Expose the launcher only in this test VM, leaving the production interface unchanged.
 vm.runInNewContext(code.replace('window.airArcadeGames={body,mount};','window.airArcadeGames={body,mount,eaglercraft};'),sandbox);
 const host={children:[],append(node){this.children.push(node)}},hint={};
 sandbox.window.airArcadeGames.eaglercraft({host,hint});
 const panel=host.children[0],links=panel.children[2].children;
 assert.deepEqual(Array.from(links,x=>x.href),[
 'https://eaglercraft.com/de/play',
 'https://eaglercraft.com/de/play?version=1.8.8-wasm',
 'https://eaglercraft.com/de/play?version=1.12.2-wasm']);
 for(const link of links){assert.equal(link.tag,'a');assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');assert.equal(link.referrerPolicy,'no-referrer');}
 assert.match(hint.textContent,/Externer Dienst/);
 assert.doesNotMatch(code,/createElement\(['"](?:iframe|webview|script)['"]\)/);
});
