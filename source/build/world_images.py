"""Mehul's ChatGPT images for the pages abroad (image pack: D:\\U-Scale-SEO-Program\\image-pack-abroad). Each image appears only
once its files exist in static/assets/pages/abroad (made by ingest.py there), so pages never show an empty slot.
  site  -> a "Sample design" section
  photo for "How it works" -> replaces the shared remote-review picture in that page's timeline
  other photos -> a photo section before the timeline (one wide, or two side by side)"""
import pathlib
import geo_pages as GP
from geo_pages import e
from world_images_map import IMAGES

DIR = pathlib.Path(__file__).resolve().parent.parent / 'static' / 'assets' / 'pages' / 'abroad'
SAMPLE_H = {'website-design-uk': 'a UK business', 'website-design-usa': 'a US small business', 'website-design-australia': 'an Australian business',
            'website-design-canada': 'a Canadian business', 'website-design-singapore': 'a Singapore business', 'website-design-uae': 'a Dubai business',
            'website-design-ireland': 'an Irish business', 'website-design-new-zealand': 'a New Zealand business', 'website-design-netherlands': 'a Dutch business'}


def present(slug):
    out = []
    for s, n, kind, place, alt, cap in IMAGES:
        if s == slug and (DIR / f'{s}-{n}-{kind}.webp').exists() and (DIR / f'{s}-{n}-{kind}-640.webp').exists():
            key = f'ab-{s}-{n}'
            GP.IMG[key] = dict(file=f'/assets/pages/abroad/{s}-{n}-{kind}', w=1200, h=800, small=640, big=1536, alt=alt, caption=cap)
            out.append((key, kind, place))
    return out


def _fig(key, sizes='(max-width: 899px) 92vw, 1100px'):
    img = GP.IMG[key]
    kind = 'photo' if img['file'].endswith('-photo') else 'site'
    return (f'<figure class="fp-shot ab-fig ab-fig--{kind}" data-reveal><div class="fp-shot__stage">{GP._pic(img, sizes)}</div>'
            f'<figcaption>{e(img["caption"])}</figcaption></figure>')


def attach(p, sec, process_sec):
    imgs = present(p['slug'])
    if not imgs: return
    sids = lambda: [b.get('sid') if isinstance(b, dict) else None for b in p['blocks']]
    for key, kind, place in imgs:
        if place == 'sample':
            who = SAMPLE_H.get(p['slug'], 'a business like yours')
            block = sec('sample', 'Sample design', f'What a site for {who} could look like.', '', (f'<div class="ab-sample">{_fig(key)}</div>', GP.IMG[key]['alt'] + '. ' + GP.IMG[key]['caption']))
            at = next((sids().index(k) for k in ('prices', 'trust', 'process') if k in sids()), len(p['blocks']))
            p['blocks'].insert(at, block)
    proc = [k for k, kind, place in imgs if place == 'process']
    scene = [k for k, kind, place in imgs if place == 'scene']
    for k in proc:
        i = next((j for j, b in enumerate(p['blocks']) if isinstance(b, dict) and b.get('sid') == 'process' and b.get('text', '').startswith('Free audit on day 1')), None)
        if i is None: scene.append(k); continue
        p['blocks'][i] = process_sec(p['blocks'][i]['h'], img=k)
    if scene:
        grid = ''.join(_fig(k, '(max-width: 899px) 92vw, 640px' if len(scene) > 1 else '(max-width: 899px) 92vw, 1100px') for k in scene[:2])
        block = sec('scene', 'In real life', 'Where your customers meet your site.', '', (f'<div class="ab-scene ab-scene--{min(len(scene), 2)}">{grid}</div>',
                    ' '.join(GP.IMG[k]['alt'] + '.' for k in scene[:2])))
        at = sids().index('process') if 'process' in sids() else len(p['blocks']) - 1
        p['blocks'].insert(at, block)


def image_urls(site, slug):
    return [(site + GP.IMG[k]['file'][1:] + '.webp', GP.IMG[k]['caption']) for k, _, _ in present(slug)]
