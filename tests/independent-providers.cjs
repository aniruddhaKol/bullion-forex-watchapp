const vm=require('vm'),assert=require('assert')
const {logic,source}=require('./watch-scene.cjs')
async function request(options,fail=[]){
 let service,handler,reply,calls=[]
 const date=new Date(Date.now()+19800000).toISOString().slice(0,10)
 const context={...logic,isFinite,Promise,setTimeout,clearTimeout,MessageBuilder:class{listen(){}on(_,fn){handler=fn}buf2Json(x){return x}},AppSideService:s=>{service=s},
  fetch:async({url})=>{
   calls.push(url)
   const metal=url.includes('/gold/999')?'gold':url.includes('/silver.json')?'silver':url.includes('frankfurter')?'forex':'platinum'
   if(fail.includes(metal))throw new Error('Unavailable')
   const body=metal==='forex'?{date,rates:{INR:100,EUR:.8,GBP:.5}}:metal==='platinum'?{symbol:'XPT',currency:'USD',price:31.1034768,updatedAt:date+'T10:00:00Z'}:{metal,source:'IBJA',purity:'999',unit:'INR per gram',rows:[{date,am:100,pm:110,close:100}]}
   return {status:200,body:JSON.stringify(body)}
  }}
 vm.runInNewContext(source('app-side/index.js'),context);service.onInit()
 await handler({request:{payload:{method:'GET_RATES',...options}},response:({data})=>{reply=data}})
 return {reply,calls}
}
;(async()=>{
 let r=await request({gold:true,silver:true,forex:true,platinum:true})
 assert.equal(r.calls.length,4);assert.equal(r.reply.gold.gold,1100);assert.equal(r.reply.silver.silver,11000);assert(Math.abs(r.reply.platinum.platinum-1000)<1e-8)
 r=await request({gold:true,silver:true,forex:true,platinum:true},['forex','platinum'])
 assert.equal(r.reply.gold.gold,1100);assert.equal(r.reply.silver.silver,11000);assert(r.reply.forexError&&r.reply.platinumError)
 r=await request({gold:true,silver:true},['gold']);assert(r.reply.goldError);assert.equal(r.reply.silver.silver,11000);assert.equal(r.calls.length,2)
 r=await request({gold:true});assert.equal(r.calls.length,1);assert(r.calls[0].includes('trackliveprice'))
 r=await request({platinum:true,inr:90});assert.equal(r.calls.length,1);assert(Math.abs(r.reply.platinum.platinum-900)<1e-8)
 r=await request({platinum:true,forex:true,inr:90},['forex']);assert(Math.abs(r.reply.platinum.platinum-900)<1e-8)
 r=await request({gold:true,silver:true,platinum:true},['forex']);assert(r.reply.platinumError);assert(r.reply.gold&&r.reply.silver,'Indian bullion needs no FX')
 console.log('PASS four independent providers/groups, one FX request, no international XAU/XAG, cached platinum conversion')
})().catch(error=>{console.error(error);process.exitCode=1})
