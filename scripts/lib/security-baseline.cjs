'use strict';
const {testHistory}=require('./test-history.cjs');
// Controlled rebuild of the last verified UI for compatibility/rollback tests; never installed.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const BASE='0cc6f31d5f810d72cf695c5579b40eca7ec5e717';
function baseline(root,target){fs.mkdirSync(target,{recursive:true});const tar=cp.execFileSync('git',['archive',BASE,'ipad','scripts','tests','build/ipad-parity-tests','docs/source-ports','LICENSE'],{cwd:testHistory(root),maxBuffer:64*1024*1024});cp.execFileSync('tar',['-xf','-','-C',target],{input:tar});require(path.join(target,'scripts/build-ipad-parity.cjs')).build(target);const dir=path.join(target,'ipad'),inventory={};function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else{const n=path.relative(dir,p).replace(/\\/g,'/');if(!n.endsWith('.ps1')&&!n.endsWith('.md'))inventory[n]=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');}}}walk(dir);fs.writeFileSync(path.join(dir,'BUILD-INFO.json'),JSON.stringify({sourceCommit:BASE,controlledPreviousSourceRebuild:true,notDeployed:true,inventory},null,2)+'\n');return dir;}
module.exports={baseline,BASE};
