const fs=require('fs'),vm=require('vm')
const root=process.cwd()
function source(path){return fs.readFileSync(root+'/'+path,'utf8').replace(/^import .*$/gm,'').replace(/export /g,'')}
const library=source('shared/rates.js')+'\n'+source('shared/rate-cache.js')
const logic=vm.runInNewContext(library+';({indianDate,indianQuote,convertIndianMetal,convertPlatinum,convertForex,indian,validGroup,freshGroup,migrateLegacy,CACHE_KEY,RATE_GROUPS})')
function scene(initial={},now=Date.now(),screen={width:432,height:514}){
 let page,pending,requestArgs,requests=0,stored={...initial},widgets=[],timers=[],cleared=[],haptics=[],route
 class Clock extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
 const context={Date:Clock,Math,JSON,isFinite,console,
  getTextLayout:(s,o)=>({width:s.length*o.text_size*.6}),getDeviceInfo:()=>screen,setStatusBarVisible(){},
  setInterval:()=>1,clearInterval(){},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length},clearTimeout:id=>cleared.push(id),
  Vibrator:class{stop(){haptics.push('stop')}start(options){haptics.push(options.mode)}},VIBRATOR_SCENE_SHORT_MIDDLE:1,push:arg=>{route=arg.url},
  widget:{IMG:'IMG',TEXT:'TEXT',BUTTON:'BUTTON'},align:{CENTER_H:1,CENTER_V:2,RIGHT:3},prop:{MORE:1},event:{CLICK_UP:1},
  nativeWidget:(kind,p)=>{const obj={kind,...p,events:{},addEventListener(event,fn){this.events[event]=fn},setProperty(_,values){Object.assign(this,values)}};widgets.push(obj);return obj},
  localStorage:{getItem:key=>stored[key],setItem:(key,value)=>{stored[key]=value}},
  getApp:()=>({_options:{globalData:{messageBuilder:{request(args){requestArgs=args;requests++;return new Promise((resolve,reject)=>{pending={resolve,reject}})}}}}}),Page:p=>{page=p}}
 vm.createContext(context)
 for(const code of [library,source('shared/forex-digits.js'),source('pages/index.js')])vm.runInContext(code,context)
 page.build()
 return {page,widgets,timers,cleared,haptics,get route(){return route},get requestArgs(){return requestArgs},get requests(){return requests},stored,get pending(){return pending}}
}
const tick=()=>new Promise(resolve=>setImmediate(resolve))
module.exports={logic,scene,tick,source,library}
