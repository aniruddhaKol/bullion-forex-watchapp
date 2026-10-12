export const OUNCE_GRAMS = 31.1034768
export function positive(value) {
  if (typeof value !== 'number' || !isFinite(value) || value <= 0) throw new Error('Invalid price')
  return value
}
export function convertRates(fx, metals) {
  const forex = convertForex(fx)
  return {...forex,...convertBullion(metals,forex.usd),fetchedAt:Date.now()}
}
export function convertForex(fx) {
  const inr = positive(fx.rates.INR)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fx.date)) throw new Error('Missing FX date')
  return {usd:inr,eur:inr/positive(fx.rates.EUR),gbp:inr/positive(fx.rates.GBP),fxDate:fx.date}
}
export function convertBullion(metals, inr) {
  positive(inr)
  const out = {bullionInr:inr}
  ;['gold','silver','platinum'].forEach((key,i) => {
    const metal = metals[i]
    if (metal.currency !== 'USD' || metal.symbol !== ['XAU','XAG','XPT'][i] || !isFinite(Date.parse(metal.updatedAt))) throw new Error('Invalid metal response')
    out[key] = positive(metal.price)*inr*([10,100,10][i])/OUNCE_GRAMS
    out[key+'At'] = metal.updatedAt
  })
  return out
}
export function indian(value) {
  const s = String(Math.round(positive(value)))
  return s.length <= 3 ? s : s.slice(0,-3).replace(/\B(?=(\d{2})+(?!\d))/g,',')+','+s.slice(-3)
}

export function indianDate(date, now=Date.now()) {
  if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false
  const parsed=Date.parse(date+'T00:00:00Z')
  if(!isFinite(parsed)||new Date(parsed).toISOString().slice(0,10)!==date)return false
  return date<=new Date(now+19800000).toISOString().slice(0,10)
}
export function indianQuote(payload, metal, now=Date.now()) {
  if(!payload||payload.source!=='IBJA'||payload.metal!==metal||payload.purity!=='999'||payload.unit!=='INR per gram'||!Array.isArray(payload.rows))throw new Error('Invalid IBJA response')
  const rows=payload.rows.filter(row=>row&&indianDate(row.date,now)).sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:0)
  for(const date of rows.map(row=>row.date).filter((date,i,all)=>all.indexOf(date)===i)){
    for(const session of ['pm','am']){
      for(const row of rows.filter(row=>row.date===date)){
        const price=row[session]
        if(typeof price==='number'&&isFinite(price)&&price>0)return {price,date,session:session.toUpperCase()}
      }
    }
  }
  throw new Error('No published IBJA AM/PM price')
}
export function convertIndianMetal(payload, metal, now=Date.now()) {
  const quote=indianQuote(payload,metal,now),amount=quote.price*(metal==='gold'?10:100)
  positive(amount)
  return {[metal]:amount,[metal+'At']:quote.date,[metal+'Session']:quote.session,
    [metal+'Source']:'IBJA via TrackLivePrice',[metal+'Purity']:'999',[metal+'Unit']:'INR per gram'}
}
export function convertPlatinum(metal,inr) {
  if(!metal||metal.currency!=='USD'||metal.symbol!=='XPT'||typeof metal.updatedAt!=='string'||!isFinite(Date.parse(metal.updatedAt)))throw new Error('Invalid platinum response')
  return {platinum:positive(metal.price)*positive(inr)*10/OUNCE_GRAMS,platinumAt:metal.updatedAt,
    platinumInr:inr,platinumSource:'International spot estimate'}
}
