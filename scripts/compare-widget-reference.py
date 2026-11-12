"""Compare unchanged user reference crops against real Playwright captures.
Resizing is only for display normalization; raw application captures remain intact.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageStat
import json, math
root=Path('docs/testing/widgets-2-1');out=root/'comparisons';out.mkdir(exist_ok=True)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',21)
report={'method':'Normalized 650 px panels; geometry from actual DOM; pixel differences include independent typography, resampling and extracted test-photo background. No claim of pixel identity.','iterations':{}}
for iteration in ['iteration-1','final']:
 base=root/iteration
 if not (base/'geometry.json').exists():continue
 g=json.loads((base/'geometry.json').read_text());r={}
 for kind in ['music','clock']:
  ref=Image.open(root/'reference'/f'{kind}.png').convert('RGB').resize((650,650),Image.Resampling.LANCZOS)
  app=Image.open(base/f'{kind}.png').convert('RGB').resize((650,650),Image.Resampling.LANCZOS)
  panel=Image.new('RGB',(1348,716),'#eef1f2');draw=ImageDraw.Draw(panel)
  draw.text((16,12),'Referenz · Display-Ausschnitt',font=font,fill='#263c4b');draw.text((690,12),f'Air-OS · {iteration} · echte PWA',font=font,fill='#263c4b');panel.paste(ref,(16,50));panel.paste(app,(682,50));panel.save(out/f'{kind}-{iteration}.png')
  mask=Image.new('L',(650,650));ImageDraw.Draw(mask).rounded_rectangle((5,5,644,644),radius=95,fill=255)
  diff=ImageChops.difference(ref,app);stat=ImageStat.Stat(diff,mask);r[kind]={'meanAbsoluteRGBDifference':round(sum(stat.mean)/3,3),'rmsRGBDifference':round(math.sqrt(sum(x*x for x in stat.rms)/3),3)}
  if iteration=='final':
   heat=diff.point(lambda n:min(255,n*3));heat.save(out/f'{kind}-difference-diagnostic.png')
 if iteration=='final':
  before=Image.open('docs/testing/widgets-2/01-homescreen-landscape.png').convert('RGB');after=Image.open(base/'home-landscape.png').convert('RGB');canvas=Image.new('RGB',(1348,570),'#eef1f2');d=ImageDraw.Draw(canvas);d.text((16,12),'PR #8 · bisheriger Homescreen',font=font,fill='#263c4b');d.text((690,12),'Widget 2.1 · kompakter Homescreen',font=font,fill='#263c4b');before.thumbnail((650,500));after.thumbnail((650,500));canvas.paste(before,(16,50));canvas.paste(after,(682,50));canvas.save(out/'home-before-after.png')
  clock=Image.open(base/'clock.png').convert('RGB');without=Image.open(base/'clock-without-type-diagnostic.png').convert('RGB');diff=ImageChops.difference(clock,without).convert('L').point(lambda n:255 if n>4 else 0);mask=Image.new('L',clock.size);ImageDraw.Draw(mask).rounded_rectangle((2,2,clock.width-3,clock.height-3),radius=clock.width*.151-1,fill=255);ink=ImageChops.multiply(diff,mask).getbbox();r['clock']['visibleLiveTypeInkBoundsNormalized']=[round(ink[0]/clock.width,4),round(ink[1]/clock.height,4),round((ink[2]-ink[0])/clock.width,4),round((ink[3]-ink[1])/clock.height,4)] if ink else None
  expected={'coverX':(.1846,g['music']['.widget-art']['x']),'coverY':(.1862,g['music']['.widget-art']['y']),'coverWidth':(.6292,g['music']['.widget-art']['width']),'progressX':(.0877,g['music']['.widget-progress-track']['x']),'progressY':(.7446,g['music']['.widget-progress-track']['y']),'progressWidth':(.8216,g['music']['.widget-progress-track']['width']),'titleX':(.0877,g['music']['.widget-track strong']['x']),'artistY':(.6615,g['music']['.widget-track small']['y'])}
  r['geometryErrorAt650Px']={k:round(abs(a-b)*650,3) for k,(a,b) in expected.items()};r['largestGeometryErrorPx']=max(r['geometryErrorAt650Px'].values());r['compactAreaRatioToPr8']=round(g['musicBox']['width']*g['musicBox']['height']/(498*544),3)
 report['iterations'][iteration]=r
(out/'report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
