/* Air-OS shape adapter. Existing 12px inverse corners, no new dock geometry. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.airGlassGeometry=api;})(typeof window==='object'?window:null,()=>{
 function rectDistance(x,y,w,h,radii){const qx=x-w/2,qy=y-h/2,r=Math.min(w/2,h/2,radii[qy<0?(qx<0?0:1):(qx<0?3:2)]||0),dx=Math.abs(qx)-w/2+r,dy=Math.abs(qy)-h/2+r;return Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0)-r;}
 function distance(x,y,w,h,mode=0,radii=[0,0,0,0]){const e=mode?12:0,body=rectDistance(x-e,y,w,h,radii);if(!mode)return body;const cy=mode===1?h-12:12,by=mode===1?h-6:6;
  const foot=cx=>Math.max(rectDistance(x-(cx===0?0:w+12),y-(by-6),12,12,[0,0,0,0]),12.25-Math.hypot(x-cx,y-cy));
  return Math.min(body,foot(0),foot(w+24));
 }
 function cover(iw,ih,w,h,size='cover',position='50% 50%'){
  let dw,dh;if(size==='cover'||size==='contain'){const s=(size==='cover'?Math.max:Math.min)(w/iw,h/ih);dw=iw*s;dh=ih*s;}else{const parts=size.split(/\s+/);const dimension=(v,total,natural)=>v==='auto'?null:v?.endsWith('%')?parseFloat(v)*total/100:Number.isFinite(parseFloat(v))?parseFloat(v):natural;dw=dimension(parts[0],w,iw);dh=dimension(parts[1]||'auto',h,ih);if(dw===null&&dh===null){dw=iw;dh=ih;}else if(dw===null)dw=dh*iw/ih;else if(dh===null)dh=dw*ih/iw;}
  const parts=position.split(/\s+/),offset=(v,space)=>v==='left'||v==='top'?0:v==='right'||v==='bottom'?space:v==='center'?space/2:v?.endsWith('%')?parseFloat(v)*space/100:parseFloat(v)||0;
  return {x:offset(parts[0]||'50%',w-dw),y:offset(parts[1]||'50%',h-dh),width:dw,height:dh};
 }
 function layers(value){const out=[];let level=0,start=0;for(let i=0;i<value.length;i++){if(value[i]==='(')level++;if(value[i]===')')level--;if(value[i]===','&&level===0){out.push(value.slice(start,i).trim());start=i+1;}}out.push(value.slice(start).trim());return out;}
 function gradient(ctx,value,w,h){if(!value.startsWith('linear-gradient('))return false;const parts=layers(value.slice(16,-1));let angle=180;if(parts[0].endsWith('deg'))angle=parseFloat(parts.shift());const theta=angle*Math.PI/180,ux=Math.sin(theta),uy=-Math.cos(theta),length=Math.abs(w*ux)+Math.abs(h*uy),g=ctx.createLinearGradient(w/2-ux*length/2,h/2-uy*length/2,w/2+ux*length/2,h/2+uy*length/2);for(let i=0;i<parts.length;i++){const match=parts[i].match(/^(.*?)\s+(-?\d+(?:\.\d+)?)%$/);g.addColorStop(match?Math.max(0,Math.min(1,Number(match[2])/100)):i/(parts.length-1),match?match[1]:parts[i]);}ctx.fillStyle=g;ctx.fillRect(0,0,w,h);return true;}
 function gpu(renderer){const name=String(renderer||'');if(/swiftshader|llvmpipe|software|softpipe|lavapipe|warp|microsoft basic render/i.test(name))return 'software';if(/nvidia|geforce|radeon|\bAMD\b|intel|apple|adreno|mali|powervr/i.test(name))return 'hardware-candidate';return 'unknown';}
 function resolution(w,h,dpr,budget,limit=4096){const ratio=Math.min(Math.max(1,Number(dpr)||1),3,Math.sqrt(budget/(w*h)),limit/w,limit/h);return {width:Math.max(1,Math.floor(w*ratio)),height:Math.max(1,Math.floor(h*ratio)),ratio};}
 // MacShell1bdb518: actual MacDock/ClockWidget/GlassSlab callsites, not GLSL defaults.
 function material(kind,height){
  const common={saturation:1.25,dark:1,shadowAmt:0,flatInner:1,ringW:0};
  // Actual LockScreen.qml media / notification callsites, not Glass.qml defaults.
  if(kind==='maclock'||kind==='maclock-notice')return {...common,thickness:(kind==='maclock'?26:20)*1.6,dispersion:.06*1.3,blurPx:1.5,tintMix:(kind==='maclock'?.48:.40)*.55,rim:.5,grain:.006,magnify:.05*1.6,shadowAmt:kind==='maclock'?.55:.30,rimTint:0};
  if(kind==='menubar')return {...common,thickness:12*1.6,dispersion:.06,blurPx:1,tintMix:.18*.55,rim:.25,grain:.003,magnify:.03,rimTint:1};
  if(kind==='dock')return {...common,thickness:30,dispersion:.06,blurPx:1.5,tintMix:.42*.55,rim:.45*.20,grain:.03*.3,magnify:.08,rimTint:0,edgeTint:[0,0,0,0]};
  if(kind==='widget')return {...common,thickness:30,dispersion:.06,blurPx:1,tintMix:.32,rim:.45,grain:.03*.15,magnify:.08*Math.min(1,90/Math.max(1,height)),rimTint:1};
  if(kind==='island')return {...common,thickness:16*1.6,dispersion:.06*1.3,blurPx:1.5,tintMix:.42*.55,rim:.1125,grain:.03*.2,magnify:.05*1.6,rimTint:1};
  // GlassSlab is also the original control/menu material; do not replace 8A profiles.
  if(['popover','control','toolbar','switcher','launchpad'].includes(kind))return {...common,dark:kind==='toolbar'?0:1,thickness:16*1.6,dispersion:.06*1.3,blurPx:kind==='control'?0:1.5,tintMix:.42*.55,rim:.1125,grain:.03*.2,magnify:.05*1.6,rimTint:1};
  return null;
 }
 // MacDock: glassBlur + 8; MacWidgets: glassBlur + 11; FeatherBlur: radius9.
 function preblur(kind){if(kind==='maclock'||kind==='maclock-notice')return 32*.35;return kind==='dock'?13:kind==='widget'?16:kind==='toolbar'?9:kind==='control'?0:5;}
 // CornerBorder.qml onPaint: exact stop positions, colour mixing and 0.8px line.
 function border(ctx,w,h,r,tint=[138/255,154/255,181/255],amount=1){
  const lw=.8;if(w<2*lw||h<2*lw||amount<=0)return;
  const c=tint.map(v=>Math.round((v+(1-v)*.42)*255)),a=Math.min(1,.72*amount),cx=w/2,cy=h/2,d=(w+h)/4,g=ctx.createLinearGradient(cx+d,cy-d,cx-d,cy+d);
  for(const [p,m]of [[0,0],[.12,.25],[.32,1],[.68,1],[.88,.25],[1,0]])g.addColorStop(p,'rgba('+c.join(',')+','+a*m+')');
  ctx.beginPath();ctx.roundRect(lw/2,lw/2,w-lw,h-lw,Math.max(0,Math.min(r-lw/2,(w-lw)/2,(h-lw)/2)));ctx.strokeStyle=g;ctx.lineWidth=lw;ctx.stroke();
 }
 // Bounded, cached backdrop preparation for WebKit, where Canvas2D.filter may be absent.
 // Three separable box passes approximate a Gaussian in O(pixels), never per animation frame.
 function prepareLockPixels(data,w,h,sigma=0,saturation=1,brightness=1){
  if(!(data instanceof Uint8ClampedArray)||!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w*h>600000||data.length!==w*h*4||![sigma,saturation,brightness].every(Number.isFinite)||sigma<0||sigma>128||saturation<0||saturation>2||brightness<0||brightness>2)throw Error('invalid-lock-backdrop');
  const radius=Math.round((Math.sqrt(1+4*sigma*sigma)-1)/2);
  if(radius){const tmp=new Uint8ClampedArray(data.length),div=2*radius+1;
   for(let pass=0;pass<3;pass++){
    for(let y=0;y<h;y++)for(let c=0;c<4;c++){const row=y*w*4;let sum=data[row+c]*(radius+1);for(let k=1;k<=radius;k++)sum+=data[row+Math.min(w-1,k)*4+c];for(let x=0;x<w;x++){tmp[row+x*4+c]=Math.round(sum/div);sum+=data[row+Math.min(w-1,x+radius+1)*4+c]-data[row+Math.max(0,x-radius)*4+c];}}
    for(let x=0;x<w;x++)for(let c=0;c<4;c++){let sum=tmp[x*4+c]*(radius+1);for(let k=1;k<=radius;k++)sum+=tmp[(Math.min(h-1,k)*w+x)*4+c];for(let y=0;y<h;y++){data[(y*w+x)*4+c]=Math.round(sum/div);sum+=tmp[(Math.min(h-1,y+radius+1)*w+x)*4+c]-tmp[(Math.max(0,y-radius)*w+x)*4+c];}}
   }
  }
  if(saturation!==1||brightness!==1)for(let i=0;i<data.length;i+=4){const l=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2];for(let c=0;c<3;c++)data[i+c]=brightness*(l+(data[i+c]-l)*saturation);}
  return data;
 }
 // MacShell MacLock/liquidglass.frag 1bdb518, MIT Rickky: same SDF, convex bezel,
 // Snell n=1.5, directional rim, inner absorption and meniscus in the existing fallback.
 // The fallback samples each channel once from the shared preblurred scene; the GLSL path
 // retains the original 24-tap dispersed disk. These cached maps never animate at idle.
 function lockMap(w,h,radius,pixelWidth,pixelHeight,kind='maclock',refraction=true,frame={x:0,y:0,height:h+20,dpr:1}){
  if(![w,h,radius,pixelWidth,pixelHeight].every(Number.isFinite)||w<1||h<1||pixelWidth<1||pixelHeight<1||pixelWidth*pixelHeight>66000)throw Error('invalid-lock-map');
  const mat=material(kind,h),pad=10,iw=frame.rasterWidth||w+2*pad,ih=frame.rasterHeight||h+2*pad,r=Math.min(radius,w/2,h/2),bz=Math.max(Math.min(h*.36,26),1)*1.45,map=new Float32Array(pixelWidth*pixelHeight*10);
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),smooth=(a,b,v)=>{const u=clamp((v-a)/(b-a));return u*u*(3-2*u);},fract=v=>v-Math.floor(v);
  const sdf=(x,y)=>{const dx=Math.abs(x)-(w/2-r),dy=Math.abs(y)-(h/2-r);return Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0)-r;};
  const hash=(x,y)=>{let a=fract(x*.1031),b=fract(y*.1031),c=a;const d=a*(b+33.33)+b*(c+33.33)+c*(a+33.33);a+=d;b+=d;c+=d;return fract((a+b)*c);};
  const length=Math.hypot(.55,.83),eta=1/1.5;
  for(let y=0;y<pixelHeight;y++)for(let x=0;x<pixelWidth;x++){
   const i=(y*pixelWidth+x)*10,px=(x+.5)*iw/pixelWidth-(frame.phaseX||0),py=(y+.5)*ih/pixelHeight-(frame.phaseY||0),qx=px-pad-w/2,qy=py-pad-h/2,sd=sdf(qx,qy),t=Math.max(-sd,0),cov=clamp(.5-sd),shadow=.30*mat.shadowAmt*(1-smooth(-2,9,sdf(qx,qy-3)));
   const ax=Math.abs(qx)-(w/2-r),ay=Math.abs(qy)-(h/2-r),mx=Math.max(ax,0),my=Math.max(ay,0),m=Math.hypot(mx,my),sx=qx>=0?1:-1,sy=qy>=0?1:-1,gx=m>1e-4?mx/m*sx:ax>ay?sx:0,gy=m>1e-4?my/m*sy:ax>ay?0:sy;
   const om=1-clamp(t/bz),slope=Math.min(7,om**3/Math.max(1-om**4,1e-3)**.75),nl=Math.sqrt(1+slope*slope),nx=gx*slope/nl,ny=gy*slope/nl,nz=1/nl,k=eta*nz-Math.sqrt(1-eta*eta*(1-nz*nz)),rz=-eta+k*nz,shift=refraction?mat.thickness*1.35/Math.max(-rz,.2):0;
   const facing=-(gx*.55+gy*.83)/length,spec=Math.max(facing,0)**1.6+.55*Math.max(-facing,0)**2.2,edge=(Math.exp(-t/1.1)*(.18+.78*spec)+Math.exp(-t/5)*.1*(.30+spec))*mat.rim;
   const men=Math.exp(-(((t-bz*.5)/(bz*.2+1))**2))*.07*(.35+spec)*mat.rim;
   map.set([px,(py-pad-h/2)*(1-(refraction?mat.magnify:0)*1.5)+pad+h/2,k*nx*shift,k*ny*shift,sd>1?0:cov,sd>1?shadow:cov+shadow*(1-cov),(1-.12*Math.exp(-t/6)*Math.max(gy,0))*(1-.10*Math.exp(-t/(bz*.45))),.020+(1-clamp((qy+h/2)/h))*.030,edge+men,(hash((px+frame.x)*frame.dpr,(frame.height-py-frame.y)*frame.dpr)+hash((px+frame.x)*frame.dpr*1.7+17,(frame.height-py-frame.y)*frame.dpr*1.7+17)-1)*mat.grain],i);
  }
  return {map,width:pixelWidth,height:pixelHeight,w,h,pad,material:mat,refraction};
 }
 function lockPixels(mesh,source,offsetX,offsetY,viewportWidth,viewportHeight){
  const {map,width,height,material:m,pad}=mesh,out=new Uint8ClampedArray(width*height*4),{data, width:sw,height:sh}=source;
  if(!(data instanceof Uint8ClampedArray)||data.length!==sw*sh*4||!Number.isInteger(sw)||!Number.isInteger(sh)||sw<1||sh<1||sw*sh>600000||viewportWidth<=0||viewportHeight<=0)throw Error('invalid-lock-source');
  const sample=(x,y,c)=>{x=Math.max(0,Math.min(sw-1,Math.max(.001,Math.min(.999,x/viewportWidth))*sw-.5));y=Math.max(0,Math.min(sh-1,Math.max(.001,Math.min(.999,y/viewportHeight))*sh-.5));const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(sw-1,x0+1),y1=Math.min(sh-1,y0+1),fx=x-x0,fy=y-y0;return ((data[(y0*sw+x0)*4+c]*(1-fx)+data[(y0*sw+x1)*4+c]*fx)*(1-fy)+(data[(y1*sw+x0)*4+c]*(1-fx)+data[(y1*sw+x1)*4+c]*fx)*fy)/255;};
  for(let p=0;p<width*height;p++){
   const i=p*10,o=p*4,cov=map[i+4],a=map[i+5];out[o+3]=a*255;if(!cov)continue;
   const x=offsetX-pad+map[i],y=offsetY-pad+map[i+1],dx=map[i+2],dy=map[i+3],d=mesh.refraction?m.dispersion*.6:0;
   const red=sample(x+dx*(1+d),y+dy*(1+d),0),green=sample(x+dx,y+dy,1),blue=sample(x+dx*(1-d),y+dy*(1-d),2),l=.2126*red+.7152*green+.0722*blue;
   for(let c=0;c<3;c++){const colour=l+((c===0?red:c===1?green:blue)-l)*m.saturation,tint=c===2?.10:.09,graded=(colour*(1-m.tintMix)+tint*m.tintMix+map[i+7])*map[i+6]+map[i+8]*(c===0?.96:c===1?.98:1)+map[i+9];out[o+c]=Math.max(0,Math.min(1,graded))*cov/Math.max(a,.001)*255;}
  }
  return out;
 }
 return {distance,rectDistance,cover,layers,gradient,gpu,resolution,material,preblur,border,prepareLockPixels,lockMap,lockPixels};
});
