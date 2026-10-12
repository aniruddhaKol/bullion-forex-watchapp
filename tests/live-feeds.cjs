const fs=require('fs')
const {logic}=require('./watch-scene.cjs')
async function json(url){const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
;(async()=>{
 const gold=json('https://trackliveprice.com/api/gold/999.json').then(r=>logic.convertIndianMetal(r,'gold'))
 const silver=json('https://trackliveprice.com/api/silver.json').then(r=>logic.convertIndianMetal(r,'silver'))
 const forex=json('https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR,EUR,GBP').then(logic.convertForex)
 const platinum=Promise.all([json('https://api.gold-api.com/price/XPT'),forex]).then(([p,f])=>logic.convertPlatinum(p,f.usd))
 const results=await Promise.allSettled([gold,silver,platinum,forex]),rates={}
 results.forEach((r,i)=>{const group=logic.RATE_GROUPS[i];if(r.status==='fulfilled'){Object.assign(rates,r.value);rates[group+'FetchedAt']=Date.now();console.log(group+': valid '+(r.value[group+'At']||r.value.fxDate)+' '+(r.value[group+'Session']||''))}else{console.log(group+': failed '+r.reason.message);process.exitCode=1}})
 fs.writeFileSync('live-feed-ibja-check.json',JSON.stringify(rates,null,2))
})().catch(error=>{console.error(error);process.exitCode=1})
