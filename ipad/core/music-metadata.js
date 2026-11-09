'use strict';
// Bounded local ID3v2.3/2.4 and FLAC metadata; never reads paths or fetches URLs.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airMusicMetadata=api;})(typeof window==='object'?window:null,function(){
 const LIMIT=2*1024*1024,ART_LIMIT=512*1024,clean=s=>String(s||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,240);
 const ascii=b=>new TextDecoder('latin1').decode(b),u32=(b,p,le=false)=>new DataView(b.buffer,b.byteOffset,b.byteLength).getUint32(p,le);
 function picture(bytes,mime){if(!['image/png','image/jpeg'].includes(mime)||bytes.length>ART_LIMIT||bytes.length<24)return null;let w=0,h=0;
  if(mime==='image/png'&&bytes.slice(0,8).every((n,i)=>n===[137,80,78,71,13,10,26,10][i])){w=u32(bytes,16);h=u32(bytes,20);for(let p=8,n=0;p+12<=bytes.length&&n++<1024;){const len=u32(bytes,p);if(p+12+len>bytes.length)break;if(ascii(bytes.subarray(p+4,p+8))==='acTL')return null;p+=12+len;}}
  else if(mime==='image/jpeg'&&bytes[0]===255&&bytes[1]===216){let p=2;while(p+9<bytes.length){if(bytes[p++]!==255)break;const mark=bytes[p++];if(mark===217||mark===218)break;const len=(bytes[p]<<8)|bytes[p+1];if(len<2||p+len>bytes.length)break;if([192,193,194].includes(mark)){h=(bytes[p+3]<<8)|bytes[p+4];w=(bytes[p+5]<<8)|bytes[p+6];break;}p+=len;}}
  return w>0&&h>0&&w<=2048&&h<=2048&&w*h<=4194304?{bytes:bytes.slice(),mime,width:w,height:h}:null;
 }
 function text(b){const enc=b[0],name={0:'latin1',1:'utf-16',2:'utf-16be',3:'utf-8'}[enc];return name?clean(new TextDecoder(name).decode(b.subarray(1))):'';}
 function parse(b){const result={};try{
  if(ascii(b.subarray(0,3))==='ID3'&&[3,4].includes(b[3])&&!(b[5]&0xc0)){
   const sync=p=>{if(b.subarray(p,p+4).some(n=>n>127))throw Error('invalid-size');return b[p]*2097152+b[p+1]*16384+b[p+2]*128+b[p+3];};const end=10+sync(6);if(end>b.length||end>LIMIT)return result;
   for(let p=10,n=0;p+10<=end&&n++<256;){const id=ascii(b.subarray(p,p+4)),len=b[3]===4?sync(p+4):u32(b,p+4),flags=b[p+9];p+=10;if(!/^[A-Z0-9]{4}$/.test(id)||!len||p+len>end)break;const frame=b.subarray(p,p+len);p+=len;if(flags)continue;if(id==='TIT2')result.title=text(frame);if(id==='TPE1')result.artist=text(frame);if(id==='TALB')result.album=text(frame);
    if(id==='APIC'&&!result.picture&&[0,3].includes(frame[0])){const stop=frame.indexOf(0,1);if(stop<0)continue;const mime=ascii(frame.subarray(1,stop));if(frame[stop+1]!==3)continue;const desc=frame.indexOf(0,stop+2);if(desc>=0)result.picture=picture(frame.subarray(desc+1),mime);}
   }
  }else if(ascii(b.subarray(0,4))==='fLaC'){
   for(let p=4,n=0;p+4<=b.length&&n++<128;){const kind=b[p]&127,last=!!(b[p]&128),len=b[p+1]*65536+b[p+2]*256+b[p+3];p+=4;if(p+len>b.length)break;const block=b.subarray(p,p+len);p+=len;
    if(kind===4&&len>=8){let q=4+u32(block,0,true);if(q+4>len)continue;const count=Math.min(128,u32(block,q,true));q+=4;for(let i=0;i<count&&q+4<=len;i++){const size=u32(block,q,true);q+=4;if(size>32768||q+size>len)break;const s=new TextDecoder().decode(block.subarray(q,q+size)),at=s.indexOf('='),key=s.slice(0,at).toUpperCase();if(['TITLE','ARTIST','ALBUM'].includes(key))result[key.toLowerCase()]=clean(s.slice(at+1));q+=size;}}
    if(kind===6&&len>32){let q=4;const type=u32(block,0),m=u32(block,q);q+=4;if(m>64||q+m+4>len)continue;const mime=ascii(block.subarray(q,q+m));q+=m;const d=u32(block,q);q+=4+d;if(q+20>len)continue;q+=16;const size=u32(block,q);q+=4;if(type===3&&q+size<=len)result.picture=picture(block.subarray(q,q+size),mime);}
    if(last)break;
   }
  }
 }catch{/* Invalid/unhandled tags leave the filename fallback intact. */}return result;}
 async function read(file){if(!file||typeof file.slice!=='function')return {};try{return parse(new Uint8Array(await file.slice(0,Math.min(file.size,LIMIT)).arrayBuffer()));}catch{return {};}}
 return Object.freeze({read,parse,picture,clean,LIMIT,ART_LIMIT});
});
