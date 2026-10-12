// Supersampled digit artwork contains a 0.5px outward black outline.
export function forexDigits({key,x,y,w,h,sx,sy,offsetX,offsetY,createWidget,widget,prop,align}) {
  const images=Array.from({length:8},()=>createWidget(widget.IMG,{x:0,y:0,w:1,h:1,src:'fx-blank.png',auto_scale:true,auto_scale_obj_fit:true}))
  const label={key,x:offsetX+x*sx,y:offsetY+y*sy,w:w*sx,h:h*sy,text:'--',color:0xffffff,align_h:align.CENTER_H}
  let click
  function draw(){
    const value=String(label.text),chars=value.length<=8?value.split(''):['-','-']
    const naturalWidth=chars.reduce((total,c)=>total+(c==='.'?9:19)*sx,0)
    const fit=Math.min(1,(label.w-chars.length)/naturalWidth)
    const sizes=chars.map(c=>Math.round((c==='.'?9:19)*sx*fit))
    let cursor=Math.round(label.x+(label.w-sizes.reduce((a,b)=>a+b,0))/2)
    const tone=label.color===0xffffff?'white':label.color===0xb08a30?'amber':'gold'
    images.forEach((image,i)=>{
      const c=chars[i],name=c==='.'?'dot':c==='-'?'dash':c
      image.setProperty(prop.MORE,c===undefined?{src:'fx-blank.png',w:1,h:1}:{src:`fx-${tone}-${name}.png`,x:cursor,y:Math.round(label.y+(label.h-40*sy*fit)/2),w:sizes[i],h:Math.round(40*sy*fit)})
      if(c!==undefined)cursor+=sizes[i]
    })
  }
  label.setProperty=(_,values)=>{Object.assign(label,values);draw()}
  label.addEventListener=(event,callback)=>{click=callback;images.forEach(image=>image.addEventListener(event,()=>click()))}
  draw()
  return label
}
