import numpy as np, cv2, potrace
from scipy import ndimage
SRC='/mnt/user-data/uploads/1791143340722_image.png'
im=cv2.imread(SRC)[:,:,::-1].astype(np.float32)  # RGB
S=4
big=cv2.resize(im,None,fx=S,fy=S,interpolation=cv2.INTER_CUBIC)
R,G,B=big[...,0],big[...,1],big[...,2]
lum=0.299*R+0.587*G+0.114*B
green=(G-R>50)&(G-B>50)
violet=(lum<140)&~green
# clean specks
green=ndimage.binary_opening(green,iterations=2)
violet=ndimage.binary_opening(violet,iterations=2)
def comps(mask,minarea):
    lab,n=ndimage.label(mask)
    out=[]
    for i in range(1,n+1):
        m=lab==i
        if m.sum()<minarea: continue
        ys,xs=np.where(m)
        out.append((xs.min(),m))
    out.sort(key=lambda t:t[0])
    return [m for _,m in out]
g=comps(green,5000); v=comps(violet,5000)
print('green comps',len(g),'violet comps',len(v))
def trace(m):
    bmp=potrace.Bitmap(~m)
    p=bmp.trace(turdsize=20,alphamax=1.0,opticurve=True,opttolerance=0.2)
    d=[]
    f=lambda pt:f"{pt.x/S:.2f} {pt.y/S:.2f}"
    for c in p:
        d.append("M"+f(c.start_point))
        for s in c.segments:
            if s.is_corner: d.append("L"+f(s.c)+" L"+f(s.end_point))
            else: d.append("C"+f(s.c1)+" "+f(s.c2)+" "+f(s.end_point))
        d.append("Z")
    return "".join(d)
allm=np.zeros_like(green)
for m in g+v: allm|=m
ys,xs=np.where(allm)
bbox=(xs.min()/S,ys.min()/S,xs.max()/S,ys.max()/S)
print('bbox',bbox)
# baseline: bottom of 'u' / letters
for i,m in enumerate(g+v):
    yy,xx=np.where(m); print(i,'x',xx.min()/S,xx.max()/S,'y',yy.min()/S,yy.max()/S)
import json
json.dump({'bbox':bbox,'u':trace(g[0]) if g else '', 'letters':[trace(m) for m in v]},open('paths.json','w'))
