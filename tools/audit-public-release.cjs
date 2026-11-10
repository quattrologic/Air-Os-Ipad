#!/usr/bin/env node
'use strict';
// Public-source preflight: examine currently tracked text AND every historical text blob.
// Never print matched credentials, personal paths or private hostnames.
const cp=require('node:child_process');
const fs=require('node:fs');

const args=['--no-pager'];
function git(...cmd){return cp.execFileSync('git',[...args,...cmd],{encoding:'utf8',maxBuffer:32*1024*1024});}
function isTextPath(path){return /(?:^|\/)(?:LICENSE|NOTICE|README|SECURITY|\.gitignore)$|\.(?:c?js|mjs|json|md|ya?ml|txt|ps1|py|svg|html?|css|webmanifest|frag|qml|glsl)$/i.test(path);}
const checks=[
  ['GitHub access token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/g,'block'],
  ['OpenAI API key',/\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/g,'block'],
  ['Slack access token',/\bxox[baprs]-[A-Za-z0-9-]{24,}\b/g,'block'],
  ['Private key',/-----BEGIN (?:RSA |OPENSSH |EC |DSA |ENCRYPTED )?PRIVATE KEY-----/g,'block'],
  ['Hardcoded OAuth secret',/\b(?:client_secret|clientSecret)\s*[:=]\s*["'][A-Za-z0-9_./+=-]{22,}["']/g,'block'],
  ['Concrete Tailnet hostname',/\b(?:[a-z0-9-]+\.)+[a-z0-9-]+\.ts\.net\b/gi,'review-host'],
  ['Local personal directory',/(?:C:\\Users\\|\/Users\/|\/home\/)[a-z0-9._ -]{3,60}[\\\/]/gi,'review-path']
];
const findings=[],unique=new Set(),counts={current:0,historical:0,objects:0};
function report(file,scope,bytes){
  if(bytes.length>500000||bytes.includes(0))return;
  const content=bytes.toString('utf8');if(content.includes('\uFFFD'))return;
  for(const [kind,pattern,priority] of checks){
    pattern.lastIndex=0;let m;
    while((m=pattern.exec(content))!==null){
      const value=m[0];let actionable=true;
      if(priority==='review-host'&&/\b(?:dein|your|example|demo|placeholder|tailnet)\b/i.test(value))actionable=false;
      if(priority==='review-path'&&/\b(?:runner|workspace|temp|example|username|user|public|default|home|build|tmp)\b/i.test(value))actionable=false;
      if(!actionable)continue;
      const key=[scope,file,kind].join('|');if(unique.has(key))continue;unique.add(key);
      findings.push({scope,file,kind,priority});
    }
  }
}
const current=git('ls-files','-z').split('\0').filter(Boolean);
for(const file of current){if(!isTextPath(file)||!fs.existsSync(file))continue;counts.current++;report(file,'current',fs.readFileSync(file));}
const lines=git('rev-list','--objects','--all').split('\n');
const objects=new Map();
for(const line of lines){const m=/^([a-f0-9]{40})\s+(.+)$/.exec(line);if(!m||!isTextPath(m[2]))continue;objects.set(m[1],m[2]);}
for(const [oid,file] of objects){
  if(git('cat-file','-t',oid).trim()!=='blob')continue;
  const size=Number(git('cat-file','-s',oid).trim());if(size>500000)continue;
  counts.objects++;counts.historical++;report(file,'history:'+oid.slice(0,12),cp.execFileSync('git',['cat-file','blob',oid],{maxBuffer:1024*1024}));
}
console.log('PUBLIC_SOURCE_PREFLIGHT '+JSON.stringify({currentTextFiles:counts.current,historicalTextBlobs:counts.historical,findings}));
if(findings.length){console.error('Public release requires manual review of every redacted finding above. No token or hostname values were printed.');process.exitCode=1;}
else console.log('PUBLIC_SOURCE_PREFLIGHT_PASS: no matching credentials, private keys, or concrete private hostnames detected in tracked files or reachable Git history.');
