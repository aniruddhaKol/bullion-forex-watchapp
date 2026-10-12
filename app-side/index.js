import { MessageBuilder } from '../shared/message-side'
import { convertForex, convertIndianMetal, convertPlatinum } from '../shared/rates'
const bridge = new MessageBuilder()
async function json(url) {
  let timer,response
  try {
    response=await Promise.race([
      fetch({url,method:'GET'}),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Provider timeout')),12000)})
    ])
  } finally {if(timer)clearTimeout(timer)}
  if (response.status && (response.status < 200 || response.status >= 300)) throw new Error('HTTP '+response.status)
  return typeof response.body === 'string' ? JSON.parse(response.body) : response.body
}
AppSideService({
  onInit() {
    bridge.listen(() => {})
    bridge.on('request', async ctx => {
      try {
        const req = bridge.buf2Json(ctx.request.payload)
        if (req.method !== 'GET_RATES') {ctx.response({data:{error:'Unknown request'}});return}
        const result={}
        const cachedInr=typeof req.inr==='number' && isFinite(req.inr) && req.inr>0 ? req.inr : null
        const needForex=req.forex===true,needPlatinum=req.platinum===true
        const fx=needForex || (needPlatinum && !cachedInr)
          ? json('https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR,EUR,GBP').then(convertForex)
          : Promise.resolve(null)
        const tasks=[]
        if(needForex)tasks.push(fx.then(rates=>{result.forex=rates}).catch(()=>{result.forexError=true}))
        ;['gold','silver'].forEach(metal=>{
          if(req[metal]===true)tasks.push(json(metal==='gold'?'https://trackliveprice.com/api/gold/999.json':'https://trackliveprice.com/api/silver.json')
            .then(payload=>{result[metal]=convertIndianMetal(payload,metal)})
            .catch(()=>{result[metal+'Error']=true}))
        })
        if(needPlatinum)tasks.push(Promise.all([
          json('https://api.gold-api.com/price/XPT'),
          fx.then(rates=>rates ? rates.usd : cachedInr).catch(()=>cachedInr)
        ]).then(([metal,inr])=>{result.platinum=convertPlatinum(metal,inr)}).catch(()=>{result.platinumError=true}))
        await Promise.all(tasks)
        ctx.response({data:result})
      } catch(e) {ctx.response({data:{error:'Rates unavailable. Try again.'}})}
    })
  },onRun(){},onDestroy(){}
})
