"""Deterministic reference crops and test media. Never renders an application screenshot.
Original reference crops stay unchanged. Extracted photos exclude baked display text.
"""
import argparse, hashlib, json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
p=argparse.ArgumentParser();p.add_argument('reference_directory');a=p.parse_args()
src=Path(a.reference_directory);out=Path('docs/testing/widgets-2-1');out.mkdir(parents=True,exist_ok=True)
m=Image.open(src/'1-Foto-1.jpg').convert('RGB');c=Image.open(src/'2-Foto-2.jpg').convert('RGB');m.info.clear();c.info.clear()
m.crop((305,260,955,910)).save(out/'reference/music.png')
c.crop((423,28,684,289)).save(out/'reference/clock.png')
# The cover rectangle contains baked reference text in its lower left. Reconstruct
# only these blurred, non-subject pixels from the unlabelled right-hand strip.
art=m.crop((425,382,834,791));original=art.copy();pix=art.load()
# Compute the replacement field beyond every feathered mask edge. A partial
# field would leave a rectangular seam behind the application's real title.
for y in range(230,409):
 for x in range(409):
  if 345<=y<389:
   t=max(0,min(1,(y-350)/35));pix[x,y]=tuple(round(original.getpixel((x,350))[i]*(1-t)+original.getpixel((x,385))[i]*t) for i in range(3))
  else:pix[x,y]=original.getpixel((390,y))
blend=Image.new('L',art.size);bd=ImageDraw.Draw(blend);bd.rectangle((-40,243,222,340),fill=255);bd.rectangle((-40,355,449,379),fill=255);blend=blend.filter(ImageFilter.GaussianBlur(9));art=Image.composite(art,original,blend);art.save(out/'media/reference-cover.jpg',quality=94)
# Manual photo silhouette, kept as transparent PNG: a real importable photo,
# not a clock image. No digits, date, controls or device housing are imported.
photo=c.crop((423,28,684,289)).convert('RGBA');mask=Image.new('L',photo.size);d=ImageDraw.Draw(mask)
outline=[(98,25),(106,17),(124,13),(140,17),(156,24),(170,38),(176,53),(177,72),(184,84),(188,103),(195,121),(204,140),(213,167),(224,193),(230,231),(226,260),(40,260),(43,239),(28,240),(18,229),(14,212),(15,192),(20,173),(32,157),(43,145),(52,130),(62,112),(64,96),(72,86),(84,82),(90,67),(89,49)]
d.polygon(outline,fill=255)
# Green cast identifies the reference background and its translucent baked digits.
# Warm skin, hair, the bubble and clothing remain in the separately imported photo.
for y in range(261):
 for x in range(261):
  red,green,blue,_=photo.getpixel((x,y))
  if green>red:mask.putpixel((x,y),0)
mask=mask.filter(ImageFilter.GaussianBlur(.45));photo.putalpha(mask)
# Extend the final photo row over the thin device rim; the unchanged reference crop retains its original edge.
row=photo.crop((0,247,261,248));photo.paste(row.resize((261,14)),(0,247));photo.save(out/'media/reference-clock-subject.png')
info={'source':'User-provided reference images, not runtime assets','musicContentCrop':[305,260,955,910],'clockContentCrop':[423,28,684,289],'musicLandmarks':{'cover':[.1846,.1862,.6292,.6292],'title':[.0877,.5954],'artist':[.0877,.6615],'progress':[.0877,.7446,.8216,.0108],'playCenter':[.5,.87]},'clockLandmarks':{'timeInkBoundsApprox':[.095,.055,.80,.40]},'mediaPreparation':'Reference text is removed from the cover crop using adjacent unlabelled blurred pixels; clock photo is a manually selected transparent subject silhouette. Comparison reference crops themselves are unmodified. Application captures are generated separately by Playwright.','originalSHA256':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in [src/'1-Foto-1.jpg',src/'2-Foto-2.jpg']}}
# Background companion for the generic paired-PNG depth-photo feature. Remove
# the reference's baked clock by interpolating unlabelled green edge pixels.
plate=c.crop((423,28,684,289)).convert('RGB');original=plate.copy()
# Interpolate actual unlabelled green edge strips for all rows, including the
# lower background. A shared field and blur avoids a seam at the clock boundary.
for y in range(261):
 sy=max(25,min(225,y))
 left=original.getpixel((17,sy));right=original.getpixel((244,sy))
 for x in range(261):
  t=x/260;plate.putpixel((x,y),tuple(round(left[i]*(1-t)+right[i]*t) for i in range(3)))
plate=plate.filter(ImageFilter.GaussianBlur(9));plate.save(out/'media/reference-clock-background.jpg',quality=94)
(out/'reference/measurements.json').write_text(json.dumps(info,indent=2)+'\n')
