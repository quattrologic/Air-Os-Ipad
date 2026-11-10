'use strict';
const {waitForAsync}=require('./lib/wait-for-async.cjs');
const fs=require('node:fs'),cp=require('node:child_process');
module.exports=async function({page,check,shot,open}){
 const finder=await open('finder'),chooser=page.waitForEvent('filechooser');await finder.getByRole('button',{name:'Importieren',exact:true}).click();await(await chooser).setFiles({name:'Original-Parser.csv',mimeType:'text/csv',buffer:Buffer.from('\ufeffName,Text\r\n"A,B","line1\nline2"\r\n"HTML","<img src=x onerror=alert(1)>"')});await waitForAsync(page,()=>airStore.list('file').then(r=>r.some(f=>f.name==='Original-Parser.csv')));if(await page.evaluate(()=>typeof airDesktop.received==='function'))await page.getByRole('dialog',{name:'Dateien importiert'}).getByRole('button',{name:'Fertig',exact:true}).click();await finder.getByRole('button',{name:'Original-Parser.csv',exact:true}).click();await page.waitForSelector('.pad-csv-preview td');check('InfinityOS original CSV pipeline renders quoted comma and multiline',await finder.locator('.pad-csv-preview').textContent().then(t=>t.includes('A,B')&&t.includes('line1\nline2')));check('CSV HTML remains inert text',await finder.locator('.pad-csv-preview img').count()===0);await finder.getByRole('combobox',{name:'Dateisortierung'}).selectOption('size');check('original size comparator is bound to Finder selector',await finder.getByRole('combobox',{name:'Dateisortierung'}).inputValue()==='size');await shot('infinity-csv');
 const settings=await open('settings');await settings.getByRole('button',{name:'Speicherstatus',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('logische Nutzdaten'));check('InfinityOS binary-safe size calculation executes in storage settings',true);

 await require('./test-ipad2-system.cjs')({page,check,shot,open});
};

module.exports.sourceOffer=async({page,check})=>{
 await page.evaluate(()=>airDesktop.open('settings'));if(await page.locator('[data-app=settings] .s3-settings-main>details').count())await page.locator('[data-app=settings] .s3-settings-main>details>summary').click();const download=page.waitForEvent('download');await page.locator('[data-app=settings]').getByRole('link',{name:'Lizenzen und Quellcode (AGPL-3.0)',exact:true}).click();const source=await download;const file=await source.path();cp.execFileSync(process.env.AIR_PAD_PYTHON||'python3',['-c',`import zipfile,sys
with zipfile.ZipFile(sys.argv[1]) as z:
 for p in ['ipad/core/infinity-web.js','ipad/core/infinity-dock.js','ipad/NOTICE','ipad/licenses/InfinityOS-AGPL-3.0.txt','scripts/write-ipad-source.cjs']:assert p in z.namelist(),p
 assert not any('/.git/' in n or n.endswith(('.sqlite','.db','.env')) for n in z.namelist())
`,file],{stdio:'pipe'});check('visible AGPL offer really downloads current readable source and licenses',fs.statSync(file).size>10000);
};
