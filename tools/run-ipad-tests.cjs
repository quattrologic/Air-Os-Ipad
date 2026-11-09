'use strict';
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const dir=path.resolve(__dirname,'../tests');
const tests=fs.readdirSync(dir).filter(name=>/^ipad-.*\.test\.cjs$/.test(name)).sort().map(name=>path.join(dir,name));
if(!tests.length){console.error('No iPad regression tests found');process.exit(1);}
console.log('Running',tests.length,'iPad-specific model and regression test modules');
const res=cp.spawnSync(process.execPath,['--test',...tests],{stdio:'inherit',env:process.env});
if(res.error){console.error(res.error.message);process.exit(1);}
process.exit(res.status??1);
