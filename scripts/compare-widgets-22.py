"""User reference crops beside real PWA screenshots; no fabricated UI imagery."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageStat
import json

root = Path('docs/testing/widgets-2-2')
old = Path('docs/testing/widgets-2-1')
out = root / 'comparisons'
out.mkdir(exist_ok=True)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20)
geometry = json.loads((root / 'air-music/geometry.json').read_text())
report = {'method': 'Unchanged user crops and actual screenshots, normalized to 650px only for comparison. Raw screenshots remain unchanged.', 'cssSize': [200, 200], 'reductionFrom220Area': round(1 - 200**2 / 220**2, 4)}
for kind in ['music', 'clock']:
    ref = Image.open(old / 'reference' / (kind + '.png')).convert('RGB').resize((650, 650), Image.Resampling.LANCZOS)
    app = Image.open(root / 'air-music' / (kind + '.png')).convert('RGB').resize((650, 650), Image.Resampling.LANCZOS)
    panel = Image.new('RGB', (1348, 716), '#eef1f2')
    draw = ImageDraw.Draw(panel)
    draw.text((16, 12), 'Referenz · Display-Ausschnitt', font=font, fill='#263c4b')
    draw.text((688, 12), 'Air-OS · 200 CSS-Pixel · echte PWA', font=font, fill='#263c4b')
    panel.paste(ref, (16, 50))
    panel.paste(app, (682, 50))
    panel.save(out / (kind + '-reference.png'))
    report[kind] = {'meanAbsoluteRGBDifference': round(sum(ImageStat.Stat(ImageChops.difference(ref, app)).mean) / 3, 3)}

panel = Image.new('RGB', (1348, 530), '#eef1f2')
draw = ImageDraw.Draw(panel)
for x, folder, label in [(16, old / 'compact-220', 'Vorher · 220 × 220 CSS-Pixel'), (682, root / 'air-music', 'Jetzt · 200 × 200 CSS-Pixel')]:
    shot = Image.open(folder / 'home-landscape.png').convert('RGB')
    shot.thumbnail((650, 470))
    draw.text((x, 12), label, font=font, fill='#263c4b')
    panel.paste(shot, (x, 50))
panel.save(out / 'home-220-to-200.png')
report['preservedLandmarksAt650px'] = {name: round(abs(expected - actual) * 650, 3) for name, expected, actual in [
    ('coverX', .1846, geometry['music']['.widget-art']['x']),
    ('coverY', .1862, geometry['music']['.widget-art']['y']),
    ('coverWidth', .6292, geometry['music']['.widget-art']['width']),
    ('titleX', .0877, geometry['music']['.widget-track strong']['x']),
    ('artistY', .6615, geometry['music']['.widget-track small']['y']),
    ('progressY', .7446, geometry['music']['.widget-progress-track']['y']),
]}
report['touchAdaptation'] = 'Three 44px local transport actions. Lyrics/library remain in the existing menu/header. Read-only Spotify has actual link/connect/refresh actions.'
(out / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
