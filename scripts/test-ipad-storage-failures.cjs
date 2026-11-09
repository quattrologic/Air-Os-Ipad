'use strict';
// Separate fresh browser contexts; never deletes or resets a database to pass a migration test.
module.exports=async function({browser,base,check}){
 const context=await browser.newContext(),page=await context.newPage();try{await page.goto(base+'seed.html');await page.evaluate(()=>{localStorage.setItem('air-ipad:calendar-v1','{"damaged":');localStorage.setItem('air-ipad:timer-v1',JSON.stringify({duration:600,remaining:300,endAt:null,done:false}));});await page.goto(base);await page.waitForFunction(()=>window.airDesktop?.snapshot().ready&&window.airMigrationError);check('invalid legacy calendar aborts migration without resetting source or timer',await page.evaluate(async()=>localStorage.getItem('air-ipad:calendar-v1')==='{"damaged":'&&(await airStore.list('event')).length===0&&JSON.parse(localStorage.getItem('air-ipad:timer-v1')).duration===600));
 check('quota error surfaces without claiming save success',await page.evaluate(async()=>{const original=airStore.open,db=await original(),transaction=db.transaction.bind(db);db.transaction=()=>{throw new DOMException('Synthetic storage pressure','QuotaExceededError');};try{await airStore.save('note',{title:'Quota fixture',text:'not committed'});return false;}catch(e){return e.name==='QuotaExceededError'||e.message.includes('Browserspeicher voll');}finally{db.transaction=transaction;}}));
 check('quota fixture did not commit user content',await page.evaluate(async()=>(await airStore.list('note')).length===0));
 }finally{await context.close();}
};
