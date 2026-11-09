'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function build(root,approved){
 const dir=path.join(root,'ipad');
 const policy=approved||JSON.parse(fs.readFileSync(path.join(root,'build/ipad-runtime-assets.json'),'utf8')),allowed=new Set(policy.runtime);
 if(!Array.isArray(policy.runtime)||allowed.size!==policy.runtime.length||[...allowed].some(f=>typeof f!=='string'||f.startsWith('/')||f.includes('\\')||f.split('/').some(p=>!p||p==='.'||p==='..')||/(?:^|\/)\.|\.(?:db|sqlite|pem|key|p12|pfx|mp3|m4a|wav|flac|iso|exe|cjs|py)$/i.test(f)))throw Error('Invalid reviewed runtime allowlist.');
 function inspect(folder){for(const e of fs.readdirSync(folder,{withFileTypes:true})){const f=path.join(folder,e.name);if(e.isSymbolicLink())throw Error('Runtime symlinks are not allowed.');if(e.isDirectory())inspect(f);else{const name=path.relative(dir,f).replace(/\\/g,'/');if(!['sw.js','version.json'].includes(name)&&!name.endsWith('.md')&&!name.endsWith('.ps1')&&!allowed.has(name))throw Error('Unreviewed runtime file: '+name);}}}
 inspect(dir);for(const file of allowed)if(!file.startsWith('source/')&&!fs.existsSync(path.join(dir,file)))throw Error('Reviewed runtime file missing: '+file);
 function atomic(file,bytes){const temp=path.join(root,'dist','atomic-'+crypto.randomUUID());fs.mkdirSync(path.dirname(temp),{recursive:true});try{fs.writeFileSync(temp,bytes);fs.renameSync(temp,path.join(dir,file));}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
 // SRI also protects a fresh, not-yet-controlled page against a mixed script/style generation.
 let html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 html=html.replace(/<(script|link)\b[^>]*>/g,tag=>{const script=tag.startsWith('<script');if(!script&&!/\brel="stylesheet"/.test(tag))return tag;const m=tag.match(script?/\bsrc="(\.\/[^"?#]+)"/:/\bhref="(\.\/[^"?#]+)"/);if(!m)throw Error('Only explicit local runtime scripts/styles are allowed.');const full=path.resolve(dir,m[1]);if(!full.startsWith(dir+path.sep)||fs.lstatSync(full).isSymbolicLink())throw Error('Invalid runtime asset.');const digest=crypto.createHash('sha256').update(fs.readFileSync(full)).digest('base64');return tag.replace(/\s+integrity="[^"]*"/g,'').replace(/>$/,' integrity="sha256-'+digest+'">');});
 if(html!==fs.readFileSync(path.join(dir,'index.html'),'utf8'))atomic('index.html',html);
 require('./write-ipad-source.cjs').source(root,policy);
 const files=[];
 function walk(folder){for(const name of fs.readdirSync(folder).sort()){const full=path.join(folder,name);if(fs.lstatSync(full).isSymbolicLink())throw Error('Runtime symlinks are not allowed.');if(fs.statSync(full).isDirectory())walk(full);else{const relative=path.relative(dir,full).replace(/\\/g,'/');if(relative!=='sw.js'&&relative!=='version.json'&&!relative.endsWith('.ps1')&&!relative.endsWith('.md'))files.push(relative);}}}
 walk(dir);const template=fs.readFileSync(path.join(root,'scripts/templates/ipad-service-worker.js'),'utf8'),hash=crypto.createHash('sha256').update(template),integrity={};
 for(const file of files){const bytes=fs.readFileSync(path.join(dir,file));hash.update(file).update(bytes);integrity[file==='index.html'?'./':'./'+file]={sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};}
 const version='air-os-ipad-v5-'+hash.digest('hex').slice(0,20),assets=['./',...files.filter(f=>f!=='index.html').map(f=>'./'+f)];
 atomic('sw.js',template.replace('__VERSION__',version).replace('__SHELL__',JSON.stringify(assets)).replace('__INTEGRITY__',JSON.stringify(integrity)));
 atomic('version.json',JSON.stringify({version,assets:assets.length,privateDeployment:true,integrity:'sha256',subresourceIntegrity:true,atomicInstall:true},null,2)+'\n');return{version,assets};
}
if(require.main===module)console.log(JSON.stringify(build(path.resolve(__dirname,'..'))));module.exports={build};
