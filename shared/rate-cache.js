import { indianDate } from './rates'
export const CACHE_KEY='rates-ibja-999-v1'
export const RATE_GROUPS=['gold','silver','platinum','forex']
export function validGroup(rates,group,now=Date.now()) {
  if(!rates)return false
  const keys=group==='forex'?['usd','eur','gbp']:[group]
  if(!keys.every(key=>typeof rates[key]==='number'&&isFinite(rates[key])&&rates[key]>0))return false
  if(group==='gold'||group==='silver')return rates[group+'Source']==='IBJA via TrackLivePrice'&&
    rates[group+'Purity']==='999'&&rates[group+'Unit']==='INR per gram'&&
    indianDate(rates[group+'At'],now)&&['AM','PM'].indexOf(rates[group+'Session'])!==-1
  return true
}
export function freshGroup(rates,group,now=Date.now()) {
  if(!validGroup(rates,group,now))return false
  const stamp=rates[group+'FetchedAt']
  if(typeof stamp!=='number'||!isFinite(stamp)||stamp>now)return false
  const age=now-stamp
  if(group==='gold'||group==='silver')return age<3600000
  const fetched=new Date(stamp),today=new Date(now)
  return age<86400000||(fetched.getFullYear()===today.getFullYear()&&fetched.getMonth()===today.getMonth()&&fetched.getDate()===today.getDate())
}
export function migrateLegacy(rates) {
  const next={}
  if(validGroup(rates,'forex')){
    ;['usd','eur','gbp','fxDate'].forEach(key=>{if(rates[key]!==undefined)next[key]=rates[key]})
    next.forexFetchedAt=rates.forexFetchedAt===undefined?rates.fetchedAt:rates.forexFetchedAt
  }
  if(validGroup(rates,'platinum')){
    next.platinum=rates.platinum;next.platinumAt=rates.platinumAt
    next.platinumSource='International spot estimate'
    next.platinumFetchedAt=rates.bullionFetchedAt===undefined?rates.fetchedAt:rates.bullionFetchedAt
  }
  return next
}
