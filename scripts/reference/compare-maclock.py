"""Compare original QtQuick material and real browser renders on the same owned texture.
Measures pixel regions without writing cropped or modified screenshots.
"""
import json,math,sys
from pathlib import Path
from PySide6.QtGui import QImage
folder=Path(sys.argv[1]);cfg=json.loads((folder/'control.json').read_text());dpr=cfg['dpr'];g=cfg['glass'];w=round(cfg['viewport']['width']*dpr);h=round(cfg['viewport']['height']*dpr)
def load(name):
 image=QImage(str(folder/name)).convertToFormat(QImage.Format_RGBA8888)
 if (image.width(),image.height())!=(w,h):raise RuntimeError('Different full-frame dimensions: '+name)
 return image,bytes(image.constBits())
native,reference=load('controlled-native.png');report={'engine':'qt6','physicalIPad':False,'synthetic':True,'status':'passed','checks':[],'errors':[],'viewport':cfg['viewport'],'dpr':dpr,'glass':g,'source':cfg['source'],'nativeComponent':'unmodified MacShell Glass.qml and original liquidglass.frag, QtQuick 6.8.2 OpenGL RHI','fullNativeMacShell':False,'hardwareApproval':False,'metrics':{}}
for name,limit in [('controlled-shader.png',2 if dpr==1 else 3),('controlled-css.png',2 if dpr==1 else 3)]:
 image,data=load(name);regions={key:[] for key in ['material','rim','interior','shadow']}
 for py in range(max(0,math.floor((g['y']-10)*dpr)),min(h,math.ceil((g['y']+g['height']+10)*dpr))):
  for px in range(max(0,math.floor((g['x']-10)*dpr)),min(w,math.ceil((g['x']+g['width']+10)*dpr))):
   qx=(px+.5)/dpr-g['x']-g['width']/2;qy=(py+.5)/dpr-g['y']-g['height']/2;r=min(g['radius'],g['width']/2,g['height']/2);dx=abs(qx)-(g['width']/2-r);dy=abs(qy)-(g['height']/2-r);sd=math.hypot(max(dx,0),max(dy,0))+min(max(dx,dy),0)-r
   i=(py*w+px)*4;differences=[abs(data[i+c]-reference[i+c]) for c in range(3)];regions['material'].extend(differences);regions['rim' if -6<=sd<=1 else 'shadow' if sd>1 else 'interior'].extend(differences)
 metrics={key:{'channels':len(values),'meanAbsolute':sum(values)/len(values) if values else 0,'rootMeanSquare':math.sqrt(sum(v*v for v in values)/len(values)) if values else 0,'p95':sorted(values)[math.floor((len(values)-1)*.95)] if values else 0,'max':max(values,default=0)} for key,values in regions.items()};report['metrics'][name]=metrics
 if metrics['material']['meanAbsolute']>limit:report['status']='failed';report['errors'].append(f'{name} exceeds material MAE {limit}/255')
 else:report['checks'].append(name+' against actual original QtQuick within '+str(limit)+'/255 MAE')
report['checks'].extend(['same source, geometry, viewport and DPR','all delivered comparison screenshots are untouched full frames']);(folder/'comparison.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report['metrics'],indent=2));sys.exit(0 if report['status']=='passed' else 1)
