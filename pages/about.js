import { createWidget, widget, align, text_style, setStatusBarVisible } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
Page({
  build(){
    setStatusBarVisible(false)
    const {width,height}=getDeviceInfo(),scale=Math.min(width/432,height/514)
    const text=(value,y,h,size,color=0xffffff)=>createWidget(widget.TEXT,{
      x:Math.round(width*.1),y:Math.round(y*scale),w:Math.round(width*.8),h:Math.round(h*scale),
      text:value,text_size:Math.round(size*scale),color,align_h:align.CENTER_H,align_v:align.CENTER_V,text_style:text_style.WRAP})
    text('Bullion Forex · ADChowdhury',35,42,21,0xffdf4f)
    text('Gold/silver 999\nIBJA via TrackLivePrice\nBenchmark excludes GST\nand making charges.',82,106,18)
    text('trackliveprice.com/methodology/\nThird-party feed; original-source terms apply.',191,72,14,0xffdf4f)
    text('Platinum: international spot estimate\nGold API USD/oz × USD/INR\n× 10 ÷ 31.1034768',265,82,16)
    text('Forex: Frankfurter daily reference\nGold/silver cache: 1 hour\nDate tap: quote date + AM/PM',348,78,16)
    text('Aniruddha DuttaChowdhury\napp.adc.bullionforex\nSwipe back to dashboard',427,54,14,0xffdf4f)
  }
})
