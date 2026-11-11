import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from pathlib import Path
source=(40,40,680,500);target=(750,650)
def edge(p,v,reference):
 q=np.clip(p*1.65-(1-v)*.65,0,1)
 m=q*q*(3-2*q)
 width=source[2]+(20.4-source[2])*m
 cx=source[0]+source[2]/2+(target[0]-source[0]-source[2]/2)*m
 y=source[1]+source[3]*v+(target[1]-source[1]-source[3]*v)*m
 return cx-width/2,cx+width/2,y
fig,axes=plt.subplots(2,5,figsize=(13,7),facecolor='#f5f6f8');v=np.linspace(0,1,400)
for row in range(2):
 for col,p in enumerate([0,.25,.5,.75,.95] if row==0 else [.95,.75,.5,.25,0]):
  ax=axes[row,col]
  for reference,color,label in [(True,'#656c76','Windhawk row geometry'),(False,'#3480df','Air-OS continuous geometry')]:
   l,r,y=edge(p,v,reference);ax.plot(l,y,color=color,lw=1.5,label=label,linestyle='--' if reference else '-');ax.plot(r,y,color=color,lw=1.5,linestyle='--' if reference else '-')
  ax.scatter([target[0]],[target[1]],s=25,color='#3480df');ax.set_xlim(0,840);ax.set_ylim(700,0);ax.set_aspect('equal');ax.axis('off');ax.set_title(f'{p:.0%} collapsed',fontsize=10)
axes[0,0].set_ylabel('Minimize');axes[1,0].set_ylabel('Restore');fig.suptitle('Classic Genie: source-derived geometry vs Air-OS Web adaptation',fontsize=14)
fig.text(.5,.04,'Dashed: Windhawk cubic row wave · Blue: Air-OS row wave · 0.65 row lag · Exact same path in reverse\nGeometry comparison only: neither an Apple reference capture nor pixel parity with the Windows demos.',ha='center',fontsize=9,color='#4b5563')
fig.tight_layout(rect=[0,.1,1,.95]);fig.savefig('docs/testing/genie/geometry-comparison.svg',bbox_inches='tight');plt.close(fig)
max_error=0
for p in np.linspace(0,1,1000):
 a=edge(p,v,True);b=edge(p,v,False)
 max_error=max(max_error,float(np.max(np.hypot(a[0]-b[0],a[2]-b[2]))),float(np.max(np.hypot(a[1]-b[1],a[2]-b[2]))))
print('maximum edge displacement vs reference mathematics, CSS px:',round(max_error,3))

# Matplotlib path data is normalized for clean, reviewable source diffs.
svg=Path('docs/testing/genie/geometry-comparison.svg')
svg.write_text('\n'.join(line.rstrip() for line in svg.read_text().splitlines())+'\n')
