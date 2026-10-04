"""Turn raw captures into site assets: stitched page screenshots, phone captures, transparent logos."""
import numpy as np, pathlib
from PIL import Image
C = pathlib.Path('capture'); A = pathlib.Path('site/assets'); (A/'work').mkdir(parents=True, exist_ok=True); (A/'logos').mkdir(parents=True, exist_ok=True)
W = 1152
def load(p): return Image.open(C/p).convert('RGB')
def trim_scrollbar(im, frac=0.0115):  # Chrome scrollbar on the right edge of viewport captures
    w, h = im.size; return im.crop((0, 0, int(w*(1-frac)), h))
def fitw(im, w=W): return im.resize((w, round(im.size[1]*w/im.size[0])), Image.LANCZOS)

PAGES = {  # top image (hero) followed by section frames; (file, top crop px at native) 
 'tis':      [('cover-tis.webp', 0, False), ('tis-1.jpg', 0, True), ('tis-2.jpg', 0, True)],
 'antrah':   [('cover-antrah.webp', 0, False), ('antrah-1.jpg', 0, True)],
 'roar':     [('cover-roar.webp', 0, False), ('roar-1.jpg', 0, True)],
 'mcm':      [('mcm-0.jpg', 0, True), ('mcm-1.jpg', 34, True), ('mcm-2.jpg', 34, True), ('mcm-3.jpg', 34, True)],
 'callmama': [('callmama-0.jpg', 0, True), ('callmama-1.jpg', 0, True), ('callmama-2.jpg', 0, True)],
 'growcred': [('cover-growcred.webp', 0, False), ('growcred-1.jpg', 0, True)],
 'sashe':    [('sashe-0.jpg', 0, True), ('sashe-1.jpg', 0, True), ('sashe-2.jpg', 0, True)],
 'vidhi':    [('vidhi-0.jpg', 0, True), ('vidhi-1.jpg', 0, True)],
 'brandgen': [('brandgen-0.jpg', 0, True), ('brandgen-1.jpg', 0, True)],
}
for slug, parts in PAGES.items():
    ims = []
    for f, top, sb in parts:
        im = load(f)
        if sb: im = trim_scrollbar(im)
        if top: im = im.crop((0, top, im.size[0], im.size[1]))
        ims.append(fitw(im))
    H = sum(i.size[1] for i in ims); page = Image.new('RGB', (W, H), 'white'); y = 0
    for i in ims: page.paste(i, (0, y)); y += i.size[1]
    page.save(A/'work'/f'{slug}-page.webp', quality=74, method=6)
    page.crop((0, 0, W, min(H, 720))).resize((768, round(min(H,720)*768/W)), Image.LANCZOS).save(A/'work'/f'{slug}-peek.webp', quality=72, method=6)
    print(slug, page.size, round((A/'work'/f'{slug}-page.webp').stat().st_size/1024), 'KB')

for slug in ['tis', 'antrah', 'roar', 'growcred', 'sashe', 'vidhi']:
    im = Image.open(C/f'm-{slug}.png').convert('RGB'); w, h = im.size
    im = im.crop((0, 0, w-12, h))  # drop the iframe scrollbar
    im = im.resize((360, round(im.size[1]*360/im.size[0])), Image.LANCZOS)
    im.save(A/'work'/f'{slug}-mobile.webp', quality=78, method=6); print('mobile', slug, im.size)

def matte(white, black=None, sb=True):
    w = np.asarray(trim_scrollbar(load(white)) if sb else load(white), dtype=np.float32)
    if black is None:  # single dark-ink logo on white
        lum = w.mean(axis=2); a = np.clip((255 - lum) / 255 * 1.08, 0, 1); rgb = np.zeros_like(w)
    else:
        b = np.asarray(trim_scrollbar(load(black)) if sb else load(black), dtype=np.float32)
        a = np.clip(1 - (w - b).mean(axis=2) / 255, 0, 1)
        a = np.where(a < .06, 0, a); a = np.clip((a - .06) / .94, 0, 1)
        rgb = np.clip(b / np.maximum(a[..., None], 1e-3), 0, 255)
    out = np.dstack([rgb, a * 255]).astype(np.uint8); img = Image.fromarray(out, 'RGBA')
    ys, xs = np.where(a > .12); box = (max(xs.min()-6, 0), max(ys.min()-6, 0), xs.max()+7, ys.max()+7)
    return img.crop(box)
def save_logo(img, slug, h=140):
    w, hh = img.size
    if hh > h: img = img.resize((round(w*h/hh), h), Image.LANCZOS)
    img.save(A/'logos'/f'{slug}.png', optimize=True); print('logo', slug, img.size, round((A/'logos'/f'{slug}.png').stat().st_size/1024), 'KB')

for slug in ['tis', 'antrah', 'mcm', 'callmama', 'vidhi', 'brandgen']:
    save_logo(matte(f'logo-{slug}-w.jpg', f'logo-{slug}-b.jpg'), slug)
save_logo(matte('logo-sashe-w.jpg'), 'sashe')
for slug, f in [('roar', 'logo-roar-light.png'), ('growcred', 'logo-growcred.png')]:
    img = Image.open(C/f).convert('RGBA'); a = np.asarray(img)[..., 3]; ys, xs = np.where(a > 20)
    save_logo(img.crop((xs.min(), ys.min(), xs.max()+1, ys.max()+1)), slug)
