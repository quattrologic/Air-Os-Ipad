/* Air Arcade: original offline mini-games inspired by classic game mechanics.
   No third-party game code, trademarks, or assets bundled. */
(() => {
'use strict';
const games=[['snake','Snake'],['2048','2048'],['mines','Minesweeper'],['breakout','Breakout'],['blocks','Blockfall'],['maze','Maze Chase'],['hex','Hex Spin']];
const rand=n=>Math.floor(Math.random()*n);
const el=(root,sel)=>root.querySelector(sel);
const colors=['#edf5ff','#a5d8ff','#70baf7','#419fe9','#267ac7','#165ca6','#ffd080','#ff9f70'];
function body(){return '<div class="arcade-library"><div class="arcade-library-header"><h2>Air Arcade</h2><p>Sieben Spiele · offline · direkt in Air-OS</p></div><div class="arcade-library-tabs" role="group" aria-label="Spiel wählen">'+games.map(([id,name])=>'<button type="button" data-game="'+id+'">'+name+'</button>').join('')+'</div><div class="arcade-library-game" id="arcade-library-game"><p>Spiel auswählen.</p></div><div class="arcade-library-controls"><button type="button" id="arcade-restart">↻ Neustart</button><span id="arcade-hint"></span></div><div class="arcade-touch" aria-label="Spielsteuerung"><button data-move="ArrowLeft">←</button><button data-move="ArrowUp">↑</button><button data-move="ArrowDown">↓</button><button data-move="ArrowRight">→</button><button data-move=" ">Aktion</button></div></div>'}
function interval(win,fn,delay){let timer=null,ended=false;const sync=()=>{const visible=!document.hidden&&win.isConnected&&!win.hidden&&win.style.display!=='none'&&win.getClientRects().length>0;if(visible&&timer===null&&!ended)timer=setInterval(fn,delay);else if(!visible&&timer!==null){clearInterval(timer);timer=null;}};const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});observer.observe(win,{attributes:true,attributeFilter:['hidden','style']});const desktop=document.querySelector('#desktop');if(desktop)observer.observe(desktop,{attributes:true,attributeFilter:['hidden','style']});document.addEventListener('visibilitychange',sync);sync();return()=>{ended=true;clearInterval(timer);timer=null;observer.disconnect();document.removeEventListener('visibilitychange',sync);};}
function mount(win){
 const root=el(win,'.arcade-library');if(!root||root.dataset.mounted)return;root.dataset.mounted='yes';
 const host=el(root,'#arcade-library-game'),hint=el(root,'#arcade-hint');let cleanup=()=>{},key=()=>{},restart=()=>{};
 function select(id){
  cleanup();cleanup=()=>{};key=()=>{};host.replaceChildren();
  root.querySelectorAll('[data-game]').forEach(b=>b.classList.toggle('active',b.dataset.game===id));
  const api={host,hint,win,interval:(fn,delay)=>interval(win,fn,delay),listen(fn){key=fn},dispose(fn){cleanup=fn}};
  if(id==='snake')gridSnake(api);
  if(id==='2048')game2048(api);
  if(id==='mines')mines(api);
  if(id==='breakout')breakout(api);
  if(id==='blocks')blocks(api);
  if(id==='maze')maze(api);
  if(id==='hex')hex(api);
  restart=()=>select(id);
 }
 root.addEventListener('click',e=>{const b=e.target.closest('[data-game]');if(b)select(b.dataset.game);const m=e.target.closest('[data-move]');if(m)key(m.dataset.move);});
 el(root,'#arcade-restart').onclick=()=>restart();
 win.addEventListener('keydown',e=>{if(!win.isConnected||!root.isConnected||e.target.matches('input,textarea,select'))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter','a','d','w','s'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();key(({a:'ArrowLeft',d:'ArrowRight',w:'ArrowUp',s:'ArrowDown',Enter:' '})[e.key]||e.key)}},true);
 const observer=new MutationObserver(()=>{if(!win.isConnected){cleanup();observer.disconnect()}});observer.observe(document.querySelector('#windows'),{childList:true});
 select('snake');
}
function canvas(api,w=480,h=360){const c=document.createElement('canvas');c.width=w;c.height=h;c.tabIndex=0;c.className='arcade-game-canvas';api.host.append(c);return [c,c.getContext('2d')]}
function message(api,s){api.hint.textContent=s}
function gridSnake(api){
 const [c,x]=canvas(api,480,360),size=20;let body=[[8,8],[7,8],[6,8]],dir=[1,0],next=dir,food=[15,8],score=0,over=false;
 const spawn=()=>{do{food=[rand(24),rand(18)]}while(body.some(p=>p[0]===food[0]&&p[1]===food[1]))};
 function draw(){x.fillStyle='#e9f3fc';x.fillRect(0,0,480,360);x.fillStyle='#2495db';body.forEach(([a,b])=>x.fillRect(a*20+2,b*20+2,16,16));x.fillStyle='#f18468';x.beginPath();x.arc(food[0]*20+10,food[1]*20+10,8,0,7);x.fill();message(api,over?'Game Over · Punkte: '+score:'Snake · Punkte: '+score+' · Pfeiltasten / WASD')}
 function step(){if(over)return;dir=next;const h=[body[0][0]+dir[0],body[0][1]+dir[1]],eat=h[0]===food[0]&&h[1]===food[1];if(h[0]<0||h[0]>=24||h[1]<0||h[1]>=18||body.slice(0,eat?undefined:-1).some(p=>p[0]===h[0]&&p[1]===h[1])){over=true;draw();return}body.unshift(h);if(eat){score+=10;spawn()}else body.pop();draw()}
 api.listen(k=>{const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[k];if(d&&!(d[0]===-dir[0]&&d[1]===-dir[1]))next=d});
 const t=api.interval(()=>{if(winActive(api.win))step()},135);api.dispose(t);draw()
}
function winActive(w){return w.isConnected&&w.style.display!=='none'}
function game2048(api){
 const highKey='air-os-arcade-2048-highscore-v1';
 let high=0;try{high=Math.max(0,Number(localStorage.getItem(highKey))||0)}catch{}
 let board=Array(16).fill(0),score=0;
 function add(){const e=board.map((v,i)=>v?-1:i).filter(i=>i>=0);if(e.length)board[e[rand(e.length)]]=Math.random()<.9?2:4}
 add();add();
 const wrap=document.createElement('div');wrap.className='arcade-2048-wrap';
 const stats=document.createElement('div');stats.className='arcade-2048-stats';
 function stat(label){const card=document.createElement('div');card.className='arcade-2048-stat';const heading=document.createElement('span');heading.textContent=label;const value=document.createElement('strong');value.textContent='0';card.append(heading,value);stats.append(card);return value}
 const scoreValue=stat('PUNKTE'),highValue=stat('HIGHSCORE');
 const box=document.createElement('div');box.className='arcade-2048';wrap.append(stats,box);api.host.append(wrap);
 function draw(){
  box.replaceChildren();board.forEach(n=>{const b=document.createElement('div');b.className='arcade-tile';b.textContent=n||'';b.style.background=colors[Math.min(7,n?Math.log2(n):0)];box.append(b)});
  if(score>high){high=score;try{localStorage.setItem(highKey,String(high))}catch{}}
  scoreValue.textContent=score.toLocaleString('de-DE');highValue.textContent=high.toLocaleString('de-DE');
  message(api,'2048 · Pfeiltasten zum Spielen · Highscore bleibt gespeichert')
 }
 function move(k){if(!/^Arrow/.test(k))return;const before=board.join(',');for(let a=0;a<4;a++){const ids=Array.from({length:4},(_,b)=>k==='ArrowLeft'?a*4+b:k==='ArrowRight'?a*4+3-b:k==='ArrowUp'?b*4+a:(3-b)*4+a);const vals=ids.map(i=>board[i]).filter(Boolean),out=[];for(let j=0;j<vals.length;j++){if(vals[j]===vals[j+1]){out.push(vals[j]*2);score+=vals[j]*2;j++}else out.push(vals[j])}ids.forEach((i,j)=>board[i]=out[j]||0)}if(board.join(',')!==before)add();draw()}
 api.listen(move);draw()
}
function mines(api){
 const n=10,total=15,board=Array.from({length:n*n},()=>({mine:false,open:false,flag:false,num:0}));let ended=false,flags=0;
 for(let placed=0;placed<total;){let i=rand(100);if(!board[i].mine){board[i].mine=true;placed++}}
 const near=i=>{const r=Math.floor(i/n),c=i%n,out=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){if(!x&&!y)continue;const rr=r+y,cc=c+x;if(rr>=0&&rr<n&&cc>=0&&cc<n)out.push(rr*n+cc)}return out};board.forEach((b,i)=>b.num=near(i).filter(j=>board[j].mine).length);
 const box=document.createElement('div');box.className='arcade-mines';api.host.append(box);
 function reveal(i){const b=board[i];if(ended||b.open||b.flag)return;b.open=true;if(b.mine){ended=true;board.forEach(v=>{if(v.mine)v.open=true});return}if(!b.num)near(i).forEach(reveal);if(board.filter(v=>v.open).length===85)ended=true}
 function draw(){box.replaceChildren();board.forEach((b,i)=>{const bt=document.createElement('button');bt.type='button';bt.className='arcade-mine'+(b.open?' open':'');bt.textContent=b.open?(b.mine?'💣':b.num||''):b.flag?'🚩':'';bt.onclick=()=>{reveal(i);draw()};bt.oncontextmenu=e=>{e.preventDefault();if(!b.open&&!ended){b.flag=!b.flag;flags+=b.flag?1:-1;draw()}};box.append(bt)});message(api,ended?'Minesweeper · Runde beendet · Neustart möglich':'Minesweeper · '+flags+'/'+total+' Flaggen · Rechtsklick zum Markieren')}
 draw()
}
function breakout(api){
 const [c,x]=canvas(api);let px=210,bx=240,by=260,vx=3,vy=-3,score=0,alive=true;const bricks=Array.from({length:5},(_,r)=>Array.from({length:9},(_,col)=>({x:col*51+12,y:r*22+18,live:true}))).flat();
 function tick(){if(!alive||!winActive(api.win))return;bx+=vx;by+=vy;if(bx<8||bx>472)vx*=-1;if(by<8)vy=Math.abs(vy);if(by>330&&by<346&&bx>=px&&bx<=px+80)vy=-Math.abs(vy);if(by>365)alive=false;for(const b of bricks){if(b.live&&bx>b.x&&bx<b.x+45&&by>b.y&&by<b.y+16){b.live=false;vy*=-1;score+=10;break}}if(bricks.every(b=>!b.live))alive=false;draw()}
 function draw(){x.fillStyle='#0e2744';x.fillRect(0,0,480,360);for(const b of bricks)if(b.live){x.fillStyle=colors[2+Math.floor(b.y/22)%5];x.fillRect(b.x,b.y,45,16)}x.fillStyle='#fff';x.fillRect(px,342,80,10);x.beginPath();x.arc(bx,by,7,0,7);x.fill();message(api,'Breakout · '+score+' Punkte'+(!alive?' · Runde beendet':' · ← →'))}
 api.listen(k=>{if(k==='ArrowLeft')px=Math.max(0,px-25);if(k==='ArrowRight')px=Math.min(400,px+25)});const t=api.interval(tick,25);api.dispose(t);draw()
}
function blocks(api){
 const [c,x]=canvas(api,300,400),W=10,H=20,grid=Array.from({length:H},()=>Array(W).fill(0));const shapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0],[1,0],[1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];let piece,px,py,score=0,over=false;
 function spawn(){piece=shapes[rand(shapes.length)].map(a=>a.slice());px=3;py=0;if(hit(0,0,piece))over=true}
 function hit(dx,dy,p){return p.some((row,y)=>row.some((v,x)=>v&&(px+x+dx<0||px+x+dx>=W||py+y+dy>=H||(py+y+dy>=0&&grid[py+y+dy][px+x+dx]))))}
 function lock(){piece.forEach((row,y)=>row.forEach((v,x)=>{if(v&&grid[py+y])grid[py+y][px+x]=1}));for(let y=H-1;y>=0;y--)if(grid[y].every(Boolean)){grid.splice(y,1);grid.unshift(Array(W).fill(0));score+=100;y++}spawn()}
 function drop(){if(over)return;if(!hit(0,1,piece))py++;else lock();draw()}
 function draw(){x.fillStyle='#10253d';x.fillRect(0,0,300,400);grid.forEach((row,y)=>row.forEach((v,a)=>{if(v){x.fillStyle='#52b1f6';x.fillRect(a*20+51,y*20,19,19)}}));if(piece)piece.forEach((row,y)=>row.forEach((v,a)=>{if(v){x.fillStyle='#ffd17e';x.fillRect((px+a)*20+51,(py+y)*20,19,19)}}));message(api,'Blockfall · '+score+' Punkte'+(over?' · Game Over':' · ← → ↓ drehen: ↑'))}
 api.listen(k=>{if(over)return;if(k==='ArrowLeft'&&!hit(-1,0,piece))px--;if(k==='ArrowRight'&&!hit(1,0,piece))px++;if(k==='ArrowDown')drop();if(k==='ArrowUp'){const p=piece[0].map((_,i)=>piece.map(row=>row[i]).reverse());if(!hit(0,0,p))piece=p}draw()});spawn();const t=api.interval(()=>{if(winActive(api.win))drop()},550);api.dispose(t);draw()
}
function maze(api){
 const [c,x]=canvas(api,420,360),W=21,H=18;const walls=new Set(),dots=new Set();for(let y=0;y<H;y++)for(let a=0;a<W;a++){const i=y*W+a;if(!y||!a||y===H-1||a===W-1||(a%4===0&&y%4!==2&&y>2&&y<H-3))walls.add(i);else dots.add(i)}
 let player=[1,1],ghost=[19,16],score=0,ended=false;dots.delete(22);
 function draw(){x.fillStyle='#071a37';x.fillRect(0,0,420,360);for(const i of walls){x.fillStyle='#285fbd';x.fillRect(i%W*20+1,Math.floor(i/W)*20+1,18,18)}for(const i of dots){x.fillStyle='#fff2b6';x.fillRect(i%W*20+9,Math.floor(i/W)*20+9,3,3)}x.fillStyle='#ffd34c';x.beginPath();x.arc(player[0]*20+10,player[1]*20+10,8,0,7);x.fill();x.fillStyle='#f17b93';x.beginPath();x.arc(ghost[0]*20+10,ghost[1]*20+10,8,0,7);x.fill();message(api,'Maze Chase · '+score+' Punkte'+(ended?' · Runde beendet':' · Pfeiltasten'))}
 api.listen(k=>{if(ended)return;const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[k];if(!d)return;const nx=player[0]+d[0],ny=player[1]+d[1],i=ny*W+nx;if(!walls.has(i)&&nx>=0&&ny>=0&&nx<W&&ny<H){player=[nx,ny];if(dots.delete(i))score+=10}if(player.join()===ghost.join()||!dots.size)ended=true;draw()});
 const t=api.interval(()=>{if(ended||!winActive(api.win))return;const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(d=>[ghost[0]+d[0],ghost[1]+d[1]]).filter(p=>!walls.has(p[1]*W+p[0]));if(opts.length){opts.sort((a,b)=>(Math.abs(a[0]-player[0])+Math.abs(a[1]-player[1]))-(Math.abs(b[0]-player[0])+Math.abs(b[1]-player[1])));ghost=opts[Math.random()<.65?0:rand(opts.length)]}if(player.join()===ghost.join())ended=true;draw()},480);api.dispose(t);draw()
}
function hex(api){
 const [c,x]=canvas(api,420,360);let angle=0,items=[],score=0,over=false;
 function draw(){x.fillStyle='#13243c';x.fillRect(0,0,420,360);x.save();x.translate(210,180);for(let i=0;i<6;i++){x.save();x.rotate(i*Math.PI/3);x.strokeStyle='#5a779d';x.strokeRect(-24,-64,48,42);x.restore()}items.forEach(b=>{x.save();x.rotate(b.side*Math.PI/3);x.fillStyle=colors[b.color];x.fillRect(-22,-b.r-18,44,16);x.restore()});x.rotate(angle*Math.PI/3);x.fillStyle='#fff';x.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;x.lineTo(Math.cos(a)*35,Math.sin(a)*35)}x.closePath();x.fill();x.restore();message(api,'Hex Spin · '+score+' Punkte'+(over?' · Runde beendet':' · ← → drehen'))}
 api.listen(k=>{if(k==='ArrowLeft')angle=(angle+5)%6;if(k==='ArrowRight')angle=(angle+1)%6;draw()});
 let ticks=0;const t=api.interval(()=>{if(over||!winActive(api.win))return;ticks++;if(ticks%5===0)items.push({side:rand(6),r:165,color:2+rand(5)});items.forEach(b=>b.r-=5);for(const b of items){if(b.r<53){if(b.side===angle){score+=10;items.splice(items.indexOf(b),1)}else{over=true;break}}}draw()},130);api.dispose(t);draw()
}
window.airArcadeGames={body,mount};
})();