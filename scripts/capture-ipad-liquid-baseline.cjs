'use strict';
const {testHistory}=require('./lib/test-history.cjs');
// Isolated archive, never checkout/reset the working tree or a private Serve directory.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'air-liquid-before-')),sha='732bb798bfe2bc9ed614610eaeee5d60296ad3e6';
try{const archive=path.join(temp,'baseline.tar');cp.execFileSync('git',['archive','--output',archive,sha,'ipad','scripts','tests','LICENSE','build/ipad-parity-tests','docs/source-ports','docs/reference'],{cwd:testHistory(root)});cp.execFileSync('tar',['-xf',archive,'-C',temp]);fs.unlinkSync(archive);cp.execFileSync(process.execPath,[path.join(temp,'scripts/build-ipad-parity.cjs')],{cwd:temp,stdio:'ignore'});cp.execFileSync(process.execPath,[path.join(root,'scripts/test-ipad-liquid-maclock.cjs')],{cwd:root,stdio:'inherit',env:{...process.env,AIR_LG_ROOT:temp,AIR_LG_BASELINE:'1',AIR_LG_OUTPUT:process.env.AIR_LG_OUTPUT||'dist/parity-evidence/before-liquid-'+(process.env.AIR_PAD_ENGINE||'chromium')}});}finally{fs.rmSync(temp,{recursive:true,force:true});}
