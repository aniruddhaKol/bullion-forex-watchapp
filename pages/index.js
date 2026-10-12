import { createWidget as nativeWidget, widget, align, prop, event, setStatusBarVisible, getTextLayout } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { push } from '@zos/router'
import { Vibrator, VIBRATOR_SCENE_SHORT_MIDDLE } from '@zos/sensor'
import { localStorage } from '@zos/storage'
import { indian } from '../shared/rates'
import { forexDigits } from '../shared/forex-digits'
import { CACHE_KEY, RATE_GROUPS, freshGroup, validGroup, migrateLegacy } from '../shared/rate-cache'
const { messageBuilder } = getApp()._options.globalData
const gold = 0xffdf4f
let sx=1,sy=1,offsetX=0,offsetY=0
function createWidget(type,p) {
  const mapped={...p}
  if(p.x!==undefined)mapped.x=Math.round(offsetX+p.x*sx)
  if(p.y!==undefined)mapped.y=Math.round(offsetY+p.y*sy)
  if(p.w!==undefined)mapped.w=Math.round(p.w*sx)
  if(p.h!==undefined)mapped.h=Math.round(p.h*sy)
  if(p.text_size!==undefined)mapped.text_size=Math.round(p.text_size*Math.min(sx,sy))
  return nativeWidget(type,mapped)
}
Page({
  build() {
    setStatusBarVisible(false)
    const screen=getDeviceInfo()
    offsetX=4;offsetY=4;sx=(screen.width-8)/432;sy=(screen.height-8)/514
    this.alive = true
    this.busy = false
    this.peeking = false
    this.datePeek = null
    this.labels = {}
    this.vibration=new Vibrator()
    const background=createWidget(widget.IMG,{x:0,y:0,w:432,h:514,auto_scale:true,auto_scale_obj_fit:true,src:'background.png'})
    background.addEventListener(event.CLICK_UP,()=>this.refresh())
    const text = (key,x,y,w,h,size,color=0xffffff,horizontal=align.CENTER_H) => {
      this.labels[key] = createWidget(widget.TEXT,{x,y,w,h,text:'--',text_size:size,color,align_h:horizontal,align_v:align.CENTER_V})
    }
    text('time',92,78,111,43,34,gold)
    text('date',226,88,119,23,14,0xffff83)
    this.labels.date.setProperty(prop.MORE,{font:'fonts/date-bold.ttf'})
    this.labels.time.addEventListener(event.CLICK_UP,()=>push({url:'pages/about'}))
    text('gold',238,160,150,40,30,0xffffff,align.RIGHT)
    text('silver',238,228,150,40,30,0xffffff,align.RIGHT)
    text('platinum',238,297,150,40,30,0xffffff,align.RIGHT)
    text('goldTag',321,154,67,13,9,gold,align.RIGHT);this.set('goldTag','IBJA 999')
    text('silverTag',321,222,67,13,9,gold,align.RIGHT);this.set('silverTag','IBJA 999')
    text('platinumTag',309,291,79,13,9,gold,align.RIGHT);this.set('platinumTag','SPOT EST')
    ;[['gold',163],['silver',231],['platinum',300]].forEach(([key,y])=>{
      this.labels[key+'Currency']=createWidget(widget.TEXT,{x:238,y:y-5,w:30,h:44,text:'',text_size:32,color:gold,align_h:align.RIGHT,align_v:align.CENTER_V})
      this.labels[key+'Currency'].addEventListener(event.CLICK_UP,()=>this.refresh())
    })
    ;[['usd',37,112],['eur',162,108],['gbp',285,112]].forEach(([key,x,w])=>{
      this.labels[key]=forexDigits({key,x,y:390,w,h:42,sx,sy,offsetX,offsetY,createWidget:nativeWidget,widget,prop,align})
    })
    this.labels.date.addEventListener(event.CLICK_UP,()=>this.showUpdates())
    ;['gold','silver','platinum','usd','eur','gbp'].forEach(k=>this.labels[k].addEventListener(event.CLICK_UP,()=>this.refresh()))
    this.clock()
    this.timer = setInterval(()=>this.clock(),1000)
    try {
      const cached=localStorage.getItem(CACHE_KEY)
      if(cached)this.rates=JSON.parse(cached)
      else {
        const legacy=localStorage.getItem('rates-100g-v2')
        if(legacy){this.rates=migrateLegacy(JSON.parse(legacy));localStorage.setItem(CACHE_KEY,JSON.stringify(this.rates))}
      }
      if(this.rates&&RATE_GROUPS.some(group=>validGroup(this.rates,group))){this.draw();this.status('CACHED')}
    } catch(e){}
    this.refresh()
  },
  set(key,value){this.labels[key].setProperty(prop.MORE,{text:String(value)})},
  status(value){if(this.alive){this.stateText=value;if(this.peeking)this.set('date',this.datePeek);else if(value.includes('SYNCING'))this.set('date','REFRESHING');else if(value.includes('FAILED')||value.includes('CONNECT'))this.set('date','OFFLINE · TAP');else this.clock()}},
  acknowledge(){
    if(this.hapticTimer)clearTimeout(this.hapticTimer)
    this.vibration.stop();this.vibration.start({mode:VIBRATOR_SCENE_SHORT_MIDDLE})
    this.hapticTimer=setTimeout(()=>{if(this.alive)this.vibration.stop()},180)
  },
  updateDate(group){
    const r=this.rates||{},label={gold:'AU',silver:'AG',platinum:'PT',forex:'FX'}[group]
    if(!validGroup(r,group))return label+': --'
    const quote=group==='forex'?r.fxDate:r[group+'At']
    const date=typeof quote==='string'?quote.slice(0,10):''
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return label+': --'
    return label+': '+date.slice(8,10)+' '+['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][Number(date.slice(5,7))-1]+(group==='gold'||group==='silver'?' '+r[group+'Session']:group==='platinum'?' EST':'')
  },
  showUpdates(){
    if(!this.alive)return
    if(this.peekTimers)this.peekTimers.forEach(timer=>clearTimeout(timer))
    if(this.restoreTimer)clearTimeout(this.restoreTimer)
    this.acknowledge()
    this.peeking=true
    this.labels.date.setProperty(prop.MORE,{color:0xffffff})
    this.datePeek=this.updateDate('gold');this.set('date',this.datePeek)
    this.peekTimers=[]
    ;['silver','platinum','forex'].forEach((group,i)=>{
      const at=(i+1)*3000
      this.peekTimers.push(setTimeout(()=>{if(this.alive){this.datePeek='';this.set('date','')}},at-250))
      this.peekTimers.push(setTimeout(()=>{if(this.alive){this.datePeek=this.updateDate(group);this.set('date',this.datePeek)}},at))
    })
    this.peekTimers.push(setTimeout(()=>{if(this.alive){this.datePeek='';this.set('date','')}},11750))
    this.restoreTimer=setTimeout(()=>{if(this.alive){this.peeking=false;this.datePeek=null;this.labels.date.setProperty(prop.MORE,{color:0xffff83});this.status(this.stateText||'CACHED')}},12000)
  },
  highlight(color){['gold','silver','platinum','usd','eur','gbp'].forEach(k=>this.labels[k].setProperty(prop.MORE,{color}))},
  clock(){
    const d=new Date(),pad=n=>('0'+n).slice(-2)
    this.set('time',pad(d.getHours())+':'+pad(d.getMinutes()))
    if(this.peeking){this.set('date',this.datePeek);return}
    if(!this.busy && !(this.stateText && (this.stateText.includes('FAILED')||this.stateText.includes('CONNECT'))))this.set('date',['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()]+' · '+pad(d.getDate())+' '+['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()])
  },
  draw(){
    const r=this.rates
    ;['gold','silver','platinum'].forEach(k=>{
      if(!validGroup(r,k)){this.set(k,'--');this.set(k+'Currency','');return}
      const amount=indian(r[k])
      let fontSize=Math.round(30*Math.min(sx,sy))
      const prefixFontSize=Math.round(32*Math.min(sx,sy))
      const prefixWidth=Math.ceil(getTextLayout('₹',{text_size:prefixFontSize,text_width:0,wrapped:0}).width)+2
      let width=getTextLayout(amount,{text_size:fontSize,text_width:0,wrapped:0}).width
      while(width+prefixWidth+4>150*sx && fontSize>16){fontSize--;width=getTextLayout(amount,{text_size:fontSize,text_width:0,wrapped:0}).width}
      this.set(k,amount)
      this.labels[k].setProperty(prop.MORE,{text_size:fontSize})
      this.labels[k+'Currency'].setProperty(prop.MORE,{text:'₹',x:Math.round(offsetX+388*sx-width-prefixWidth-2),w:prefixWidth,color:gold})
    })
    ;['usd','eur','gbp'].forEach(k=>this.set(k,validGroup(r,'forex')?r[k].toFixed(2):'--'))
  },
  refresh(){
    if(this.busy || !this.alive)return
    const needed={}
    RATE_GROUPS.forEach(group=>{needed[group]=!freshGroup(this.rates,group)})
    if(!RATE_GROUPS.some(group=>needed[group])){
      this.draw();this.status('CACHED');return
    }
    this.busy=true;this.status('SYNCING · KEEP Z E P P CONNECTED')
    this.acknowledge()
    this.highlight(gold);let bright=true
    this.pulse=setInterval(()=>{bright=!bright;this.highlight(bright?gold:0xb08a30)},450)
    messageBuilder.request({method:'GET_RATES',...needed,inr:this.rates&&this.rates.usd},{timeout:25000}).then(data=>{
      if(!this.alive)return
      let updated=false,failed=false
      const next={...this.rates}
      RATE_GROUPS.forEach(group=>{
        if(!needed[group])return
        if(validGroup(data&&data[group],group)){
          const keys=group==='forex'?['usd','eur','gbp','fxDate']:group==='platinum'?['platinum','platinumAt','platinumInr','platinumSource']:[group,group+'At',group+'Session',group+'Source',group+'Purity',group+'Unit']
          keys.forEach(key=>{if(data[group][key]!==undefined)next[key]=data[group][key]})
          next[group+'FetchedAt']=Date.now();updated=true
        }else failed=true
      })
      if(!updated)throw new Error('Rates unavailable')
      this.rates=next;this.draw()
      try {localStorage.setItem(CACHE_KEY,JSON.stringify(this.rates))} catch(e){}
      this.status(failed?'CACHED · PARTIAL SYNC FAILED':'CACHED')
    }).catch(()=>this.status(this.rates?'CACHED · SYNC FAILED · TAP TO RETRY':'CONNECT PHONE + Z E P P · TAP TO RETRY')).then(()=>{this.busy=false;if(this.pulse)clearInterval(this.pulse);if(this.alive){this.highlight(0xffffff);this.status(this.stateText)}})
  },
  onDestroy(){this.alive=false;if(this.timer)clearInterval(this.timer);if(this.pulse)clearInterval(this.pulse);if(this.hapticTimer)clearTimeout(this.hapticTimer);if(this.peekTimers)this.peekTimers.forEach(timer=>clearTimeout(timer));if(this.restoreTimer)clearTimeout(this.restoreTimer);if(this.vibration)this.vibration.stop()}
})





