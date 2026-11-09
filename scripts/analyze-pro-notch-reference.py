#!/usr/bin/env python3
"""Static user-video analysis only. Requires ffmpeg/ffprobe, Pillow, numpy, scipy.
No native app is executed. Full user-media crops stay in the chosen analysis folder;
only content-free contour masks and geometric measurements belong in the repository.
"""
import argparse, hashlib, json, subprocess
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects, binary_fill_holes

parser=argparse.ArgumentParser();parser.add_argument('video',type=Path);parser.add_argument('output',type=Path);parser.add_argument('--frames',type=Path);args=parser.parse_args()
expected='9f129a886e4781fd4fa17a9f1f45e740e352e71e45ce5e150cc341184c390b74'
if hashlib.sha256(args.video.read_bytes()).hexdigest()!=expected: raise SystemExit('Unexpected reference bytes: do not label another video as the measured source.')
out=args.output.resolve();out.mkdir(parents=True,exist_ok=True);frames=args.frames.resolve() if args.frames else out/'frames';frames.mkdir(parents=True,exist_ok=True)
if not args.frames:subprocess.run(['ffmpeg','-y','-v','error','-i',str(args.video),'-vsync','0',str(frames/'frame-%04d.png')],check=True)
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',str(args.video)]))['frames'];rows=[]
for i,p in enumerate(sorted(frames.glob('frame-*.png'))):
 a=np.asarray(Image.open(p).convert('RGB'));dark=(a.max(2)<85)&((a.max(2)-a.min(2))<45);full=np.flatnonzero(dark[:90].sum(1)>490);anchor=int(full[-1]+1) if len(full) else 50
 dark[:anchor+8]=False;dark[350:]=False;lab,_=label(dark);candidates=[]
 for j,sl in enumerate(find_objects(lab),1):
  if sl is None:continue
  y,x=sl
  if x.stop-x.start>180 and y.stop-y.start>8 and x.start<320 and y.start<anchor+24:candidates.append((int((lab[sl]==j).sum()),j,sl))
 if candidates:
  _,j,sl=max(candidates);y,x=sl;ys,xs=np.where(lab==j);bottom=int(np.percentile(ys,99.8));lower=xs[ys>=anchor+(bottom-anchor)*.55];left=int(lower.min());right=int(lower.max()+1);rows.append({'frame':i,'t':float(meta[i]['best_effort_timestamp_time']),'left':left,'right':right,'rawConnectedLeft':int(x.start),'rawConnectedRight':int(x.stop),'topAnchor':anchor,'width':right-left,'height':bottom-anchor,'bottom':bottom})
(out/'bounds.json').write_text(json.dumps(rows,indent=2)+'\n');by={r['frame']:r for r in rows};refs={};(out/'contours').mkdir(exist_ok=True);(out/'original-crops').mkdir(exist_ok=True)
choices={'closed':7,'music':60,'lyrics':138,'timer':208,'calendar':248,'shelf':300,'files':348}
motion_times={}
for family,start,end in [('open',18,28),('expand',104,113),('close',158,179),('switch',195,206),('calendar',235,247)]:
 for q in [.2,.4,.6,.8]:
  t0=float(meta[start]['best_effort_timestamp_time']);t1=float(meta[end]['best_effort_timestamp_time']);target=t0+q*(t1-t0)
  key=f'motion-{family}-{round(q*100)}';chosen=min(by,key=lambda n:abs(float(meta[n]['best_effort_timestamp_time'])-target));choices[key]=chosen;motion_times[key]=(float(meta[chosen]['best_effort_timestamp_time'])-t0)/(t1-t0)
for name,n in choices.items():
 r=by[n];im=Image.open(frames/f'frame-{n+1:04d}.png').convert('RGB');box=(r['left'],r['topAnchor'],r['right'],r['bottom']+2);crop=im.crop(box);crop.save(out/'original-crops'/f'{name}.png')
 a=np.asarray(crop);black=(a.max(2)<85)&((a.max(2)-a.min(2))<45);filled=binary_fill_holes(black);lab,_=label(filled);counts=np.bincount(lab.ravel());counts[0]=0;mask=lab==counts.argmax();canvas=np.where(mask,0,255).astype('uint8');Image.fromarray(canvas).save(out/'contours'/f'{name}.png')
 refs[name]={'relativeTime':motion_times.get(name),'sourceFrame':n,'timestamp':float(meta[n]['best_effort_timestamp_time']),'box':list(box),'width':crop.width,'height':crop.height,'contour':name+'.png','kind':'Measured dark connected silhouette; interior holes filled to remove source media/text. Not an original UI asset.'}
(out/'keyframes.json').write_text(json.dumps({'sourceSHA256':expected,'uncertainty':'±3px stable; ±6px moving; ±1 recorded frame. Unknown native point/DPR mapping.','keyframes':refs},indent=2)+'\n');print(json.dumps({'frames':len(meta),'measured':len(rows),'keyframes':len(refs),'output':str(out)}))
