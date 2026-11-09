/* InfinityOS original excerpts, AGPL-3.0. Pinned source, exact hashes and changes:
 * docs/source-ports/infinityos.json. Modifications Copyright (c) 2026 quattrologic.
 * This combined iPad edition is AGPL-3.0; source and notices ship with it. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airInfinity=api;})(typeof window==='object'?window:null,()=>{
'use strict';
function getExt(file) {
        if (!file) return "";

        const name = typeof file === "object" ? file.name : file;
        const lastDot = name.lastIndexOf(".");

        return lastDot > 0
            ? name.slice(lastDot + 1).toLowerCase()
            : "";
    }

function getColLabel(index) {
    let label = '';
    let i = index;
    while (i >= 0) {
        label = String.fromCharCode((i % 26) + 65) + label;
        i = Math.floor(i / 26) - 1;
    }
    return label;
}

function parseCsv(text) {
    const rows = []; let row = [], f = '', q = false;
    text = text.replace(/^\ufeff/, '');
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (q) {
            if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
            else f += ch;
        } else if (ch === '"') q = true;
        else if (ch === ',') { row.push(f); f = ''; }
        else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(f); rows.push(row); row = []; f = '';
        } else f += ch;
    }
    row.push(f); rows.push(row);
    return rows;
}

function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
    const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

function getObjectSize(value) {
  if (value == null) return 0;
  if (value instanceof Blob || (typeof File !== 'undefined' && value instanceof File)) return value.size;
  if (value instanceof ArrayBuffer) return value.byteLength;
  if (ArrayBuffer.isView(value)) return value.byteLength;
  if (typeof value === 'string') return value.length * 2; // UTF-16 chars = 2 bytes
  
  // Fallback for plain objects/JSON data
  try {
    return new Blob([JSON.stringify(value)]).size;
  } catch {
    return 0; // Handle circular references safely
  }
}
 function csvPreview(text){if(typeof text!=='string'||text.length>262144)throw Error('CSV-Vorschau maximal 256 KiB; vollständige Datei bleibt exportierbar.');const rows=parseCsv(text);if(rows.length>10000||rows.some(r=>r.length>1000))throw Error('CSV hat zu viele Zeilen oder Spalten für eine sichere Vorschau.');return {rows:rows.slice(0,100).map(r=>r.slice(0,40)),total:rows.length,truncated:rows.length>100||rows.some(r=>r.length>40)};}
 function bytes(n){return formatBytes(Math.max(0,Math.min(2**50-1,Number(n)||0)));}
 // Comparators ported from script.js sorting callsite; records are adapted, not a second filesystem.
 function compare(a,b,column='name',direction=1){const fs=[a,b].map(f=>({name:f.name||'',size:f.blob?.size||0,lastModified:f.updatedAt||0,type:f.type==='folder'?'':getExt(f.name)}));if(column==='size')return direction*(fs[0].size-fs[1].size);if(column==='lastModified')return direction*(fs[0].lastModified-fs[1].lastModified);if(column==='type')return direction*fs[0].type.localeCompare(fs[1].type);return direction*fs[0].name.localeCompare(fs[1].name);}
 return Object.freeze({getExt,getColLabel,parseCsv,csvPreview,bytes,getObjectSize,compare});
});
