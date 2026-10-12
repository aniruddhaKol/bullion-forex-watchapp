const fs=require('fs'),assert=require('assert'),vm=require('vm')
const {logic,scene,tick,source}=require('./watch-scene.cjs')
const now=Date.now(),today=new Date(now+19800000).toISOString().slice(0,10)
const payload=metal=>({source:'IBJA',metal,purity:'999',unit:'INR per gram',rows:[{date:today,am:100,pm:null,close:999999}]})
const r={...logic.convertIndianMetal(payload('gold'),'gold'),...logic.convertIndianMetal(payload('silver'),'silver'),
 ...logic.convertPlatinum({symbol:'XPT',currency:'USD',price:31.1034768,updatedAt:today+'T00:00:00Z'},100),...logic.convertForex({date:today,rates:{INR:100,EUR:.8,GBP:.5}})}
const config=JSON.parse(fs.readFileSync('app.json','utf8'))
assert.equal(config.app.appId,1130321);assert.equal(config.app.vender,'Aniruddha DuttaChowdhury');assert.equal(config.app._pikeCompatibled,1)
assert.equal(JSON.parse(fs.readFileSync('package.json')).name,'app.adc.bullionforex')
;(async()=>{
 const s=scene({},now,{width:Number(process.env.TEST_WIDTH)||432,height:Number(process.env.TEST_HEIGHT)||514})
 assert(s.page.busy);assert.equal(s.page.labels.gold.color,0xffdf4f)
 s.pending.resolve({gold:r,silver:r,platinum:r,forex:r});await tick()
 assert.equal(s.page.labels.gold.text,'1,000');assert.equal(s.page.labels.silver.text,'10,000');assert.equal(s.page.labels.platinum.text,'1,000')
 assert.equal(s.page.labels.eur.text,'125.00');assert.equal(s.page.labels.gold.align_h,3);assert.equal(s.page.labels.goldCurrency.color,0xffdf4f)
 assert.equal(s.page.labels.platinumTag.text,'SPOT EST');assert.equal(s.page.labels.goldTag.text,'IBJA 999')
 assert.equal(s.page.labels.gold.color,0xffffff);assert(!s.page.busy)
 const screen={width:Number(process.env.TEST_WIDTH)||432,height:Number(process.env.TEST_HEIGHT)||514}
 for(const item of s.widgets){if(item.w)assert(item.x+item.w<=screen.width-4);if(item.h)assert(item.y+item.h<=screen.height-4)}
 for(const key of ['usd','eur','gbp'])assert.equal(s.page.labels[key].align_h,1)
 s.page.labels.time.events[1]();assert.equal(s.route,'pages/about','Clock tap opens attribution')
 s.page.rates={...r,gold:9999999,silver:9999999,platinum:9999999};s.page.draw()
 for(const key of ['gold','silver','platinum'])assert(s.page.labels[key+'Currency'].x>=4+238*(screen.width-8)/432-1)
 if(fs.existsSync('live-feed-ibja-check.json'))s.page.rates=JSON.parse(fs.readFileSync('live-feed-ibja-check.json'));else s.page.rates=r
 s.page.draw();s.page.status('READY')
 fs.writeFileSync('previews/preview-layout.json',JSON.stringify(s.widgets,null,2))
 s.page.showUpdates();fs.writeFileSync('previews/date-feedback-preview-layout.json',JSON.stringify(s.widgets,null,2))
 let about,aboutWidgets=[]
 vm.runInNewContext(source('pages/about.js'),{getDeviceInfo:()=>screen,setStatusBarVisible(){},widget:{TEXT:'TEXT'},align:{CENTER_H:1,CENTER_V:2},text_style:{WRAP:1},createWidget:(kind,p)=>aboutWidgets.push({kind,...p}),Page:p=>{about=p}})
 about.build()
 const aboutText=aboutWidgets.map(w=>w.text).join('\n')
 assert(aboutText.includes('IBJA via TrackLivePrice')&&aboutText.includes('trackliveprice.com/methodology/')&&aboutText.includes('Aniruddha DuttaChowdhury'))
 for(const item of aboutWidgets){assert(item.x+item.w<=screen.width);assert(item.y+item.h<=screen.height)}
 fs.writeFileSync('previews/about-preview-layout.json',JSON.stringify(aboutWidgets,null,2))
 s.page.onDestroy();assert(!s.page.alive)
 for(const item of s.widgets.filter(w=>w.kind==='IMG'))assert(fs.existsSync('assets/432x514-amazfit-bip-max/'+item.src))
 console.log('PASS Indian units, runtime layout, estimate/IBJA labels, author/identity, attribution route, refresh/cleanup')
})().catch(error=>{console.error(error);process.exitCode=1})
