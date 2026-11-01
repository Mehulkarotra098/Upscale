#!/usr/bin/env python3
"""Prepare the card maker's fonts. Run once by hand when the font list changes, then commit the output:

    pip install fonttools brotli
    python card/tools/prepare-fonts.py

Downloads OFL fonts from github.com/google/fonts, keeps the weights we use, trims to the characters we need and drops
hinting (the card maker only reads outlines). Writes TTF, because HarfBuzz can't read woff2. Devanagari fonts keep the
whole Unicode block and every layout feature, or conjuncts and Marathi letter forms would break.
"""
import json
import pathlib
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'source' / 'static' / 'assets' / 'card' / 'fonts'
BASE = 'https://raw.githubusercontent.com/google/fonts/main/ofl/'

LATIN = 'U+0020-007E,U+00A0-017F,U+0192,U+02C6,U+02DC,U+2010-2015,U+2018-201E,U+2020-2022,U+2026,U+2030,U+2039,U+203A,U+20AC,U+20B9,U+2122,U+2190-2193,U+2212'
DEVA = 'U+0900-097F,U+1CD0-1CF6,U+A8E0-A8FF,U+200C,U+200D,U+25CC,' + LATIN

# id, name, source file, script subset, weight range (None = static font), other axes to pin, group, category
FONTS = [
    ('inter', 'Inter', 'inter/Inter[opsz,wght].ttf', LATIN, (400, 800), {'opsz': 18}, 'latin', 'sans'),
    ('manrope', 'Manrope', 'manrope/Manrope[wght].ttf', LATIN, (400, 800), {}, 'latin', 'sans'),
    ('outfit', 'Outfit', 'outfit/Outfit[wght].ttf', LATIN, (300, 800), {}, 'latin', 'sans'),
    ('montserrat', 'Montserrat', 'montserrat/Montserrat[wght].ttf', LATIN, (400, 800), {}, 'latin', 'sans'),
    ('dmsans', 'DM Sans', 'dmsans/DMSans[opsz,wght].ttf', LATIN, (400, 800), {'opsz': 14}, 'latin', 'sans'),
    ('spacegrotesk', 'Space Grotesk', 'spacegrotesk/SpaceGrotesk[wght].ttf', LATIN, (300, 700), {}, 'latin', 'sans'),
    ('bricolage', 'Bricolage Grotesque', 'bricolagegrotesque/BricolageGrotesque[opsz,wdth,wght].ttf', LATIN, (400, 800), {'opsz': 24, 'wdth': 100}, 'latin', 'sans'),
    ('syne', 'Syne', 'syne/Syne[wght].ttf', LATIN, (400, 800), {}, 'latin', 'display'),
    ('anton', 'Anton', 'anton/Anton-Regular.ttf', LATIN, None, {}, 'latin', 'display'),
    ('bebas', 'Bebas Neue', 'bebasneue/BebasNeue-Regular.ttf', LATIN, None, {}, 'latin', 'display'),
    ('playfair', 'Playfair Display', 'playfairdisplay/PlayfairDisplay[wght].ttf', LATIN, (400, 800), {}, 'latin', 'serif'),
    ('fraunces', 'Fraunces', 'fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf', LATIN, (300, 800), {'SOFT': 0, 'WONK': 0, 'opsz': 72}, 'latin', 'serif'),
    ('cormorant', 'Cormorant Garamond', 'cormorantgaramond/CormorantGaramond[wght].ttf', LATIN, (400, 700), {}, 'latin', 'serif'),
    ('lora', 'Lora', 'lora/Lora[wght].ttf', LATIN, (400, 700), {}, 'latin', 'serif'),
    ('dmserif', 'DM Serif Display', 'dmserifdisplay/DMSerifDisplay-Regular.ttf', LATIN, None, {}, 'latin', 'serif'),
    ('marcellus', 'Marcellus', 'marcellus/Marcellus-Regular.ttf', LATIN, None, {}, 'latin', 'serif'),
    ('jetbrains', 'JetBrains Mono', 'jetbrainsmono/JetBrainsMono[wght].ttf', LATIN, (400, 700), {}, 'latin', 'mono'),
    ('caveat', 'Caveat', 'caveat/Caveat[wght].ttf', LATIN, (400, 700), {}, 'latin', 'script'),
    ('notosansdeva', 'Noto Sans Devanagari', 'notosansdevanagari/NotoSansDevanagari[wdth,wght].ttf', DEVA, (400, 800), {'wdth': 100}, 'devanagari', 'sans'),
    ('notoserifdeva', 'Noto Serif Devanagari', 'notoserifdevanagari/NotoSerifDevanagari[wdth,wght].ttf', DEVA, (400, 800), {'wdth': 100}, 'devanagari', 'serif'),
    ('baloo2', 'Baloo 2', 'baloo2/Baloo2[wght].ttf', DEVA, (400, 800), {}, 'devanagari', 'display'),
    ('rozha', 'Rozha One', 'rozhaone/RozhaOne-Regular.ttf', DEVA, None, {}, 'devanagari', 'display'),
    ('tiro', 'Tiro Devanagari Hindi', 'tirodevanagarihindi/TiroDevanagariHindi-Regular.ttf', DEVA, None, {}, 'devanagari', 'serif'),
    ('yatra', 'Yatra One', 'yatraone/YatraOne-Regular.ttf', DEVA, None, {}, 'devanagari', 'display'),
]


def run(*args):
    r = subprocess.run([sys.executable, '-m', *args], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f'{" ".join(args)}\n{r.stderr[-800:]}')


def main():
    from fontTools.ttLib import TTFont

    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        for fid, name, src, subset, wght, pins, group, cat in FONTS:
            raw = tmp / f'{fid}-raw.ttf'
            url = BASE + urllib.parse.quote(src, safe='/')
            with urllib.request.urlopen(url, timeout=60) as r:
                raw.write_bytes(r.read())
            step = raw
            if wght or pins:
                axes = TTFont(raw)['fvar'].axes if 'fvar' in TTFont(raw) else []
                limits = []
                for a in axes:
                    if a.axisTag == 'wght' and wght:
                        limits.append(f'wght={max(wght[0], int(a.minValue))}:{min(wght[1], int(a.maxValue))}')
                    elif a.axisTag in pins:
                        limits.append(f'{a.axisTag}={pins[a.axisTag]}')
                    elif a.axisTag != 'wght':
                        limits.append(f'{a.axisTag}={a.defaultValue}')
                if limits:
                    step = tmp / f'{fid}-inst.ttf'
                    run('fontTools.varLib.instancer', str(raw), *limits, '-o', str(step), '-q')
            out = OUT / f'{fid}.ttf'
            run('fontTools.subset', str(step), f'--unicodes={subset}', "--layout-features=*", '--no-hinting', '--desubroutinize',
                '--notdef-outline', '--name-IDs=*', f'--output-file={out}')
            font = TTFont(out)
            cmap = font.getBestCmap()
            has_wght = 'fvar' in font and any(a.axisTag == 'wght' for a in font['fvar'].axes)
            weights = None
            if has_wght:
                a = next(a for a in font['fvar'].axes if a.axisTag == 'wght')
                weights = [int(a.minValue), int(a.maxValue)]
            manifest.append({'id': fid, 'name': name, 'file': f'{fid}.ttf', 'group': group, 'category': cat, 'weights': weights,
                             'rupee': 0x20B9 in cmap, 'deva': 0x0915 in cmap, 'bytes': out.stat().st_size})
            print(f'{name:26} {out.stat().st_size // 1024:5} KB  rupee={0x20B9 in cmap}  deva={0x0915 in cmap}  weights={weights}')
    (ROOT / 'card' / 'src' / 'core').mkdir(parents=True, exist_ok=True)
    (ROOT / 'card' / 'src' / 'core' / 'fonts.js').write_text("// Generated by card/tools/prepare-fonts.py. Don't edit by hand.\nexport const FONT_LIST = " + json.dumps(manifest, indent=1) + ';\n')
    (OUT / 'LICENSES.txt').write_text(
        'These fonts are from Google Fonts (github.com/google/fonts) under the SIL Open Font License 1.1: https://openfontlicense.org\n\n'
        + '\n'.join(f'{f[1]}: ofl/{f[2]}' for f in FONTS) + '\n')


if __name__ == '__main__':
    main()
