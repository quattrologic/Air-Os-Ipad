'use strict';
// Optional, loopback-only static build adapter. Does not invoke or configure Tailscale.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const permissions='accelerometer=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), hid=(), magnetometer=(), microphone=(), payment=(), serial=(), usb=(), clipboard-read=(), clipboard-write=(self), fullscreen=(self), autoplay=(self)';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.otf':'font/otf','.woff2':'font/woff2','.zip':'application/zip'};
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function create({directory,prefix='/',proxyHosts=[]}){
 const root=fs.realpathSync(directory);if(!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(prefix))throw Error('Invalid static scope.');
 const manifest=fs.readFileSync(path.join(root,'BUILD-INFO.json'));if(manifest.length>512000)throw Error('Build inventory too large.');
 const info=JSON.parse(manifest);if(!info.inventory||Object.keys(info.inventory).length>2048)throw Error('Verified build inventory required.');
 const inventory=new Map();for(const [name,hash]of Object.entries(info.inventory)){if(path.isAbsolute(name)||name.includes('\\')||name.split('/').some(p=>!p||p==='.'||p==='..')||!/^[a-f0-9]{64}$/.test(hash))throw Error('Invalid build inventory.');const file=path.resolve(root,name);if(!file.startsWith(root+path.sep)||fs.realpathSync(file)!==file||!fs.statSync(file).isFile()||fs.statSync(file).size>32*1024*1024||digest(fs.readFileSync(file))!==hash)throw Error('Build integrity check failed.');inventory.set(name,hash);}
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),policy=html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/);if(!policy||!inventory.has('index.html'))throw Error('Build security policy required.');
 inventory.set('BUILD-INFO.json',digest(manifest));const hosts=new Set(proxyHosts.map(h=>{if(!/^[a-z0-9.-]+(?::[0-9]{1,5})?$/i.test(h))throw Error('Invalid approved proxy host.');return h.toLowerCase();}));
 const server=http.createServer((req,res)=>{
  res.setHeader('Content-Security-Policy',policy[1]+"; frame-ancestors 'none'");res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy',permissions);res.setHeader('Cross-Origin-Opener-Policy','same-origin');res.setHeader('Cross-Origin-Resource-Policy','same-origin');res.setHeader('Origin-Agent-Cluster','?1');res.setHeader('X-DNS-Prefetch-Control','off');res.setHeader('Cache-Control','no-store');
  const fail=code=>{res.writeHead(code,{'Content-Type':'text/plain; charset=utf-8'});res.end('Request not available.');};
  if(!['GET','HEAD'].includes(req.method))return fail(405);
  const host=String(req.headers.host||'').toLowerCase(),port=server.address()?.port;if(host!=='127.0.0.1:'+port&&!hosts.has(host))return fail(421);
  try{const raw=String(req.url||'').split(/[?#]/,1)[0];if(!raw.startsWith('/')||raw.startsWith('//'))return fail(400);const decoded=decodeURIComponent(raw);if(decoded.includes('\\')||decoded.includes('\0')||decoded.split('/').some(s=>s==='..'||s==='.')||!decoded.startsWith(prefix))return fail(404);const name=decoded.slice(prefix.length)||'index.html',expected=inventory.get(name);if(!expected)return fail(404);const file=path.resolve(root,name);if(!file.startsWith(root+path.sep)||fs.realpathSync(file)!==file)return fail(404);const bytes=fs.readFileSync(file);if(digest(bytes)!==expected)return fail(503);res.writeHead(200,{'Content-Type':mime[path.extname(name)]||'application/octet-stream','Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);}catch{return fail(404);}
 });
 const listen=server.listen.bind(server);server.listen=(port,host,...rest)=>{if(!Number.isInteger(port)||port<0||port>65535||host!=='127.0.0.1')throw Error('Explicit IPv4 loopback binding required.');return listen(port,host,...rest);};
 // No request logging: query strings can contain one-time authorization codes.
 return server;
}
if(require.main===module){try{const port=Number(process.argv[3]||8787);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid loopback port.');const server=create({directory:path.resolve(process.argv[2]||'dist/ipad-parity'),proxyHosts:process.argv[4]?[process.argv[4]]:[]});server.listen(port,'127.0.0.1',()=>console.log('Verified static PWA adapter on loopback port '+port+'; no Tailscale configuration changed.'));}catch{console.error('Verified PWA adapter could not start.');process.exitCode=1;}}
module.exports={create,permissions};
