"""Mehul's ChatGPT images on the pages abroad (image pack: D:\\U-Scale-SEO-Program\\image-pack-abroad; placement and wording
in world_images_map.py). An image appears only once its files exist in static/assets/pages/abroad (made by ingest.py in
the pack folder), so a page never shows an empty slot.
  sample   -> its own section: the mockup with three numbered pins and a matching numbered list
  timeline -> the page's own photo beside the "How it works" timeline (instead of the picture every page shared)
  moment   -> a photo with one line of copy and a chip on it, next to the section it belongs to"""
import pathlib
import geo_pages as GP
from geo_pages import e, icon
from world_images_map import PAGES

DIR = pathlib.Path(__file__).resolve().parent.parent / 'static' / 'assets' / 'pages' / 'abroad'
W, H = 768, 512  # the frame the pin positions are measured in


def _have(slug, n, kind):
    return all((DIR / f'{slug}-{n}-{kind}{s}.{x}').exists() for s in ('', '-640', '-1536') for x in ('webp', 'avif'))


def present(slug):
    """{role: (img key, spec)} for this page's images whose files exist."""
    out = {}
    for role, spec in PAGES.get(slug, {}).items():
        kind = 'site' if role == 'sample' else 'photo'
        if _have(slug, spec['n'], kind):
            key = f'ab-{slug}-{spec["n"]}'
            GP.IMG[key] = dict(file=f'/assets/pages/abroad/{slug}-{spec["n"]}-{kind}', w=1200, h=800, small=640, big=1536,
                               alt=spec['alt'], caption=spec['caption'])
            out[role] = (key, spec)
    return out


def _sample(key, spec, sec):
    img = GP.IMG[key]
    pins = ''.join(f'<span class="sp__pin" data-n="{k}" style="--x:{x / W * 100:.2f}%;--y:{y / H * 100:.2f}%;--i:{k - 1}" aria-hidden="true">{k}</span>'
                   for k, (x, y, _) in enumerate(spec['pins'], 1))
    keys = ''.join(f'<li data-n="{k}" style="--i:{k - 1}"><b aria-hidden="true">{k}</b><span>{e(label)}</span></li>' for k, (_, _, label) in enumerate(spec['pins'], 1))
    html = (f'<div class="sp" data-reveal><figure class="sp__fig"><div class="sp__img"><div class="sp__frame">{GP._pic(img, "(max-width: 1119px) 94vw, 1040px")}{pins}</div></div>'
            f'<figcaption>{e(img["caption"])}</figcaption></figure><ol class="sp__keys" aria-label="What to notice in this sample">{keys}</ol></div>')
    text = f'{img["alt"]}. {img["caption"]} What to notice: ' + '; '.join(lbl for _, _, lbl in spec['pins']) + '.'
    return sec('sample', 'Sample design', spec['h'], '', (html, text))


def _moment(slug, key, spec):
    img = GP.IMG[key]; ic, chip = spec['chip']; sid = f'moment-{spec["n"]}'
    html = (f'\n  <section class="section fp-sec pm-sec" id="{sid}" aria-labelledby="{sid}-title">\n    <div class="wrap">'
            f'<div class="pm pm--{spec["side"]}" data-reveal><figure class="pm__fig"><div class="pm__img">{GP._pic(img, "(max-width: 799px) 94vw, 640px")}</div>'
            f'<span class="pm__chip">{icon(ic)}<span>{e(chip)}</span></span></figure>'
            f'<div class="pm__t"><h2 class="pm__h" id="{sid}-title">{e(spec["h"])}</h2><p>{e(spec["p"])}</p>'
            f'<p class="pm__cap">{e(img["caption"])}</p></div></div></div>\n  </section>')
    return dict(html=html, text=f'{spec["h"]} {spec["p"]} (Photo: {img["alt"]}. {img["caption"]})', h=spec['h'], sid=sid)


def attach(p, sec, process_sec):
    imgs = present(p['slug'])
    if not imgs: return
    sids = lambda: [b.get('sid') if isinstance(b, dict) else None for b in p['blocks']]
    if 'sample' in imgs:
        key, spec = imgs['sample']
        s = sids(); at = s.index(spec['before']) if spec['before'] in s else len(p['blocks'])
        p['blocks'].insert(at, _sample(key, spec, sec))
    if 'timeline' in imgs:
        key, spec = imgs['timeline']
        for j, b in enumerate(p['blocks']):
            if isinstance(b, dict) and b.get('sid') == 'process' and b.get('text', '').startswith('Free audit on day 1'):
                nb = process_sec(b['h'], img=key)
                nb['html'] = nb['html'].replace('class="tlw__img fp-shot"', 'class="tlw__img fp-shot tlw__img--photo"', 1)
                p['blocks'][j] = nb
                break
    if 'moment' in imgs:
        key, spec = imgs['moment']; s = sids(); ref = spec.get('after') or spec.get('before')
        at = (s.index(ref) + (1 if spec.get('after') else 0)) if ref in s else len(p['blocks'])
        p['blocks'].insert(at, _moment(p['slug'], key, spec))


def image_urls(site, slug):
    return [(site + GP.IMG[k]['file'][1:] + '.webp', GP.IMG[k]['caption']) for k, _ in present(slug).values()]
