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
    'website-design-thane': 'A 3D model of Thane: a lake with a fountain below green hills, towers along Ghodbunder Road, and a Central line train curving past',
    'website-design-navi-mumbai': 'A 3D model of Navi Mumbai: the Vashi bridge over the creek with cars crossing, the planned sector grid, and a plane taking off from the new airport',
    'website-design-pune': 'A 3D model of Pune: the Western Ghats behind the city, a hill fort with its flag on the highest hill, and the metro crossing on its pillars',
    'website-design-delhi-ncr': 'A 3D metro map of Delhi NCR: four coloured lines on pillars meeting at interchanges, trains running, and the glass towers of Gurugram',
    'website-design-bengaluru': 'A 3D model of Bengaluru: glass tech-park towers among wide rain trees, a lake, and a metro train on its viaduct',
    'website-design-hyderabad': 'A 3D model of Hyderabad: a cable bridge across a lake with cars crossing, HITEC City towers behind, and boulders on the shore',
    'website-design-chennai': 'A 3D model of Marina beach in Chennai: a red and white lighthouse sweeping its beam, waves rolling in, a catamaran, palms and the city behind',
    'website-design-kolkata': 'A 3D model of Howrah Bridge over the river in Kolkata: the steel truss, a yellow taxi and a tram crossing, a boat below and old buildings on the banks',
    'website-design-ahmedabad': 'A 3D model of the Sabarmati riverfront in Ahmedabad: stepped promenades, a footbridge with a kite-coloured canopy, kites flying and the city behind',
    'website-design-surat': 'A 3D table in Surat: a cut diamond turning above bolts of silk that unroll, a loupe and loose stones',
    'website-design-jaipur': 'A 3D pink palace facade in Jaipur: rows of small bay windows lighting one by one, shops with awnings in front and a camel cart passing',
    'andheri-east': 'A 3D model of Andheri East: the metro on its viaduct over the highway, traffic below, offices along the road and a plane climbing from the runway',
    'website-design-india': 'A 3D network of Indian cities: pins for Delhi NCR, Jaipur, Ahmedabad, Surat, Pune, Hyderabad, Bengaluru, Chennai and Kolkata, with glowing arcs from Mumbai to each',
    'outsource-web-design-india': 'A 3D dotted globe turning, with glowing arcs from Mumbai to the UK, USA, Australia, Canada, Singapore, UAE, Ireland, New Zealand and the Netherlands',
    'website-design-usa': 'Two 3D city blocks: New York at night under the moon and Mumbai by day under the sun, joined by an arc carrying a card that says Preview updated',
    'website-design-australia': 'A 3D scene on red earth: a tradie ute with a toolbox and a hard hat, gum trees, and a job card ticking itself: quote A$850 fixed, design approved, site live',
    'website-design-canada': 'A 3D card turning between English and French, Fresh bread and Du pain frais, above a snowy scene with pines and a cabin as snow falls',
    'website-design-singapore': 'A 3D row of pastel shophouses in Singapore with arched windows, lanterns and potted plants, towers behind and a street clock turning',
    'website-design-uae': 'A 3D phone standing over golden dunes, its WhatsApp chat flipping between English and Arabic, with the sun low and towers on the horizon',
    'website-design-ireland': 'A 3D Irish landscape with green hills, a stone wall and sheep, a large Tab key with a glowing focus ring, an alt-text tag and a contrast badge',
    'website-design-new-zealand': 'A 3D lake below snow-capped peaks with a jetty and a yellow kayak paddling across, and a message saying Changes are live at 6:40 am',
    'website-design-netherlands': 'A 3D Amsterdam canal with gabled houses, bicycles on a bridge, a boat gliding, and a ring showing 86% speak English',
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
