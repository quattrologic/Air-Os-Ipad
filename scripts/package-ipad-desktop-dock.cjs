'use strict';
const path=require('node:path'),{pack}=require('./package-ipad-parity.cjs');
console.log(JSON.stringify(pack(path.resolve(__dirname,'..'),'Air-OS-iPad-Desktop-Dock-Correction')));
