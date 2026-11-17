"""3D hero scenes (Mehul, 17 Nov 2026: "proper 3D animated graphics, different for all pages, best quality and depth").
A page gets one when source/static/assets/3d/scenes/<page slug>.js exists. After every page is built, apply() swaps the
hero's flat art for a 3D stage: a still poster (assets/3d/posters/<slug>.webp, made by qa-world/h3d_posters.cjs) shown at
once, then the live scene, which script.js loads after the page has painted (engine: assets/3d/engine.js). Without
WebGL, on Save-Data, or for crawlers, the poster stays. The words of the page are untouched.
ALT describes each scene for screen readers (role="img")."""
import pathlib, re
import geo_pages as GP

STATIC = pathlib.Path(__file__).resolve().parent.parent / 'static'
SCENES = STATIC / 'assets' / '3d' / 'scenes'
ALT = {
    'website-design-mumbai': 'A 3D model of the Bandra–Worli Sea Link: car lights crossing between Bandra’s palms and Worli’s lit towers, with a pin on Mumbai',
    'website-design-uk': 'A 3D desk: a cup of tea, a signed quote for £450 fixed coming out of its envelope, a green wax seal, a fountain pen and pound coins',
    'mumbai-areas': 'A 3D map of Mumbai: the city raised out of the sea with Thane and Navi Mumbai across the water, the Western and Central lines with trains running, a pin for each area from Borivali to Fort and Mulund to Chembur, and the studio pin in Ghatkopar',
    'seo-mumbai': 'A 3D map of a neighbourhood: competitor pins on the blocks, a green pin rising to #1 on Maps, a magnifying glass over the streets and a search bar above',
}
_TAG = re.compile(r'<(/?)div\b')


def _split(html):
    """(before art, art, after art) of the page's hero: the art is everything after the copy column up to </section>,
    whatever the hero builder (stats or not, figure or div). Nested divs inside the copy column are counted."""
    s = html.find('<section class="sp-hero fp-hero')
    c = html.find('<div class="fp-hero__copy"', s) if s >= 0 else -1
    if c < 0: return None
    depth = 0
    for m in _TAG.finditer(html, c):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            end = html.index('>', m.start()) + 1; close = html.find('</section>', end)
            return html[:end], html[end:close], html[close:]
    return None


def stage(slug):
    poster = STATIC / 'assets' / '3d' / 'posters' / f'{slug}.webp'
    img = (f'<img class="h3d__poster" src="{GP.vurl(f"/assets/3d/posters/{slug}.webp")}" width="1000" height="820" alt="" '
           f'fetchpriority="high" decoding="async">' if poster.exists() else '')
    return (f'\n      <div class="fp-art h3d" data-scene="{slug}" data-src="{GP.vurl(f"/assets/3d/scenes/{slug}.js")}" '
            f'data-engine="{GP.vurl("/assets/3d/engine.js")}" role="img" aria-label="{GP.ea(ALT.get(slug, ""))}">{img}</div>')


def apply(public):
    """Swap the flat hero art for the 3D stage on every built page that has a scene. Returns the pages changed."""
    done = []
    for js in sorted(SCENES.glob('*.js')):
        slug = js.stem
        for f in list(public.glob(f'**/{slug}.html')) + list(public.glob(f'**/{slug}/index.html')):
            html = f.read_text(encoding='utf-8')
            if 'class="fp-art h3d"' in html: continue
            parts = _split(html)
            if parts:
                f.write_text(parts[0] + stage(slug) + '\n    ' + parts[2], encoding='utf-8', newline='\n'); done.append(str(f.relative_to(public)))
    return done


def section_stage(scene, cls='h3d--sec'):
    """A 3D stage inside a page section (not the hero), with its poster; script.js mounts it like the hero's."""
    poster = STATIC / 'assets' / '3d' / 'posters' / f'{scene}.webp'
    img = (f'<img class="h3d__poster" src="{GP.vurl(f"/assets/3d/posters/{scene}.webp")}" width="1000" height="820" alt="" loading="lazy" decoding="async">' if poster.exists() else '')
    return (f'<div class="h3d {cls}" data-scene="{scene}" data-src="{GP.vurl(f"/assets/3d/scenes/{scene}.js")}" data-engine="{GP.vurl("/assets/3d/engine.js")}" '
            f'role="img" aria-label="{GP.ea(ALT.get(scene, ""))}">{img}</div>')
