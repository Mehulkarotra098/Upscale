"""Licence metadata (EXIF + XMP) for every image in source/static that has none, written without re-encoding.

WebP, PNG and JPEG get their metadata chunks added around the untouched image data, so the pixels stay byte-for-byte the
same. AVIF can't be edited that way here, so the few AVIFs without metadata are re-encoded from the largest version of the
same picture (quality 76, 4:4:4, as the page images) with the metadata included.

Who owns what (the same as https://uscale.in/image-license):
- client website screenshots (assets/work): the screenshot is U Scale's; the website, its name and logo are the client's;
- client logos (assets/logos) and the Apex36 mark: they belong to those businesses, so no U Scale rights are claimed;
- everything else (portrait, share images, tool tiles, card thumbnails, icons): (c) 2026 U Scale by Mehul Karotra.

Run: python source/build/stamp_image_meta.py   (safe to run again: files that already carry a WebStatement are skipped)"""
import io, os, re, struct, sys, zlib
from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'static'
LICENCE = 'https://uscale.in/image-license'
OURS = '© 2026 U Scale by Mehul Karotra. All rights reserved.'
OURS_ASCII = 'Copyright 2026 U Scale by Mehul Karotra. All rights reserved.'
SRC_TYPE = 'http://cv.iptc.org/newscodes/digitalsourcetype/'


def clients():
    """slug -> client name, from the WORK list in build_site.py."""
    t = (Path(__file__).parent / 'build_site.py').read_text(encoding='utf-8')
    return dict(re.findall(r"^ \('([a-z0-9]+)', '([^']+)'", t, flags=re.M))


def describe(rel, names):
    """(title, description, rights text, ascii copyright, creator, credit, source type or '') for one file."""
    stem = Path(rel).stem
    words = re.sub(r'[-_@]+', ' ', re.sub(r'-\d+$|@\dx$', '', stem)).strip()
    words = re.sub(r'^og |og$', '', words).strip()   # 'og-website-design-pune' -> 'website design pune'
    if rel.startswith('assets/work/'):
        slug = stem.split('-')[0]
        name = names.get(slug, slug.title())
        d = f'Screenshot of the {name} website, designed and built by U Scale'
        return (f'{name} website by U Scale', d, f'Screenshot © 2026 U Scale by Mehul Karotra. The {name} website, its name and logo belong to {name}.',
                f'Screenshot copyright 2026 U Scale. Website, name and logo belong to {name}.', 'U Scale', 'U Scale', 'screenCapture')
    if rel.startswith('assets/logos/'):
        name = names.get(stem, stem.title())
        return (f'{name} logo', f'Logo of {name}, a U Scale client', f'Logo © {name}. Shown on uscale.in as a U Scale client.',
                f'Logo copyright {name}. Shown as a U Scale client.', name, name, '')
    if 'apex36' in stem:
        return ('Apex36 Technologies mark', 'Logo of Apex36 Technologies, sister company of U Scale', 'Logo © Apex36 Technologies.',
                'Logo copyright Apex36 Technologies.', 'Apex36 Technologies', 'Apex36 Technologies', '')
    if 'mehul-karotra' in stem:
        d = 'Mehul Karotra, website designer and developer, founder of U Scale, Ghatkopar, Mumbai'
        return ('Mehul Karotra, U Scale', d, OURS, OURS_ASCII, 'U Scale', 'U Scale', 'digitalCapture')
    if rel.startswith('assets/card/thumbs/'):
        return (f'{words.title()} visiting card design', f'{words.title()} visiting card design from the free U Scale card maker',
                OURS, OURS_ASCII, 'U Scale', 'U Scale', 'digitalCreation')
    kind = 'share image' if 'og' in stem.split('-') or stem.startswith('og') else 'graphic'
    if stem.startswith(('icon', 'favicon', 'apple-touch')):
        return ('U Scale icon', 'U Scale logo icon', OURS, OURS_ASCII, 'U Scale', 'U Scale', 'digitalCreation')
    t = words[0].upper() + words[1:]
    return (f'{t} ({kind}), U Scale', f'{t}: a U Scale {kind}', OURS, OURS_ASCII, 'U Scale', 'U Scale',
            '' if 'standee' in stem else 'digitalCreation')


def xmp(title, desc, rights, creator, credit, srctype):
    x = lambda s: escape(s)
    src = f'<Iptc4xmpExt:DigitalSourceType>{SRC_TYPE}{srctype}</Iptc4xmpExt:DigitalSourceType>\n' if srctype else ''
    return f'''<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" xmlns:plus="http://ns.useplus.org/ldf/xmp/1.0/">
<dc:title><rdf:Alt><rdf:li xml:lang="x-default">{x(title)}</rdf:li></rdf:Alt></dc:title>
<dc:description><rdf:Alt><rdf:li xml:lang="x-default">{x(desc)}</rdf:li></rdf:Alt></dc:description>
<dc:creator><rdf:Seq><rdf:li>{x(creator)}</rdf:li></rdf:Seq></dc:creator>
<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">{x(rights)}</rdf:li></rdf:Alt></dc:rights>
<xmpRights:Marked>True</xmpRights:Marked>
<xmpRights:WebStatement>{LICENCE}</xmpRights:WebStatement>
<photoshop:Source>https://uscale.in/</photoshop:Source>
<plus:Licensor><rdf:Seq><rdf:li rdf:parseType="Resource"><plus:LicensorName>U Scale</plus:LicensorName><plus:LicensorURL>{LICENCE}</plus:LicensorURL></rdf:li></rdf:Seq></plus:Licensor>
<photoshop:Credit>{x(credit)}</photoshop:Credit>
<photoshop:City>Mumbai</photoshop:City>
<photoshop:Country>India</photoshop:Country>
<Iptc4xmpCore:AltTextAccessibility><rdf:Alt><rdf:li xml:lang="x-default">{x(desc)}</rdf:li></rdf:Alt></Iptc4xmpCore:AltTextAccessibility>
{src}</rdf:Description></rdf:RDF></x:xmpmeta>
<?xpacket end="w"?>'''.encode('utf-8')


def exif_tiff(desc, artist, copyright_ascii):
    ex = Image.Exif()
    asc = lambda s: s.encode('ascii', 'replace').decode('ascii')
    ex[0x010E] = asc(desc); ex[0x013B] = asc(artist); ex[0x8298] = asc(copyright_ascii)
    b = ex.tobytes()
    return b[6:] if b.startswith(b'Exif\x00\x00') else b   # raw TIFF


# ---------------------------------------------------------------- lossless writers
def webp(data, tiff, x, size, alpha):
    assert data[:4] == b'RIFF' and data[8:12] == b'WEBP'
    chunks, i = [], 12
    while i + 8 <= len(data):
        tag, n = data[i:i + 4], struct.unpack('<I', data[i + 4:i + 8])[0]
        chunks.append([tag, data[i + 8:i + 8 + n]]); i += 8 + n + (n & 1)
    chunks = [c for c in chunks if c[0] not in (b'EXIF', b'XMP ')]
    if chunks[0][0] != b'VP8X':
        w, h = size
        flags = 0x10 if alpha else 0
        chunks.insert(0, [b'VP8X', bytes([flags, 0, 0, 0]) + (w - 1).to_bytes(3, 'little') + (h - 1).to_bytes(3, 'little')])
    v = bytearray(chunks[0][1]); v[0] |= 0x08 | 0x04; chunks[0][1] = bytes(v)   # EXIF and XMP present
    chunks += [[b'EXIF', tiff], [b'XMP ', x]]
    body = b'WEBP' + b''.join(t + struct.pack('<I', len(c)) + c + (b'\x00' if len(c) & 1 else b'') for t, c in chunks)
    return b'RIFF' + struct.pack('<I', len(body)) + body


def png(data, tiff, x):
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    out, i, done = [data[:8]], 8, False
    def chunk(t, c): return struct.pack('>I', len(c)) + t + c + struct.pack('>I', zlib.crc32(t + c) & 0xffffffff)
    while i < len(data):
        n = struct.unpack('>I', data[i:i + 4])[0]; t = data[i + 4:i + 8]; whole = data[i:i + 12 + n]; i += 12 + n
        if t == b'eXIf' or (t == b'iTXt' and whole[8:].startswith(b'XML:com.adobe.xmp')): continue
        if t == b'IDAT' and not done:
            out += [chunk(b'eXIf', tiff), chunk(b'iTXt', b'XML:com.adobe.xmp\x00\x00\x00\x00\x00' + x)]; done = True
        out.append(whole)
    return b''.join(out)


def jpeg(data, tiff, x):
    assert data[:2] == b'\xff\xd8'
    app1 = lambda p: b'\xff\xe1' + struct.pack('>H', len(p) + 2) + p
    segs = app1(b'Exif\x00\x00' + tiff) + app1(b'http://ns.adobe.com/xap/1.0/\x00' + x)
    i = 2
    while data[i] == 0xFF and data[i + 1] in (0xE0,):          # keep JFIF APP0 first
        i += 2 + struct.unpack('>H', data[i + 2:i + 4])[0]
    return data[:i] + segs + data[i:]


def main(check_only=False):
    names = clients()
    done, skipped = [], []
    files = sorted(p for p in ROOT.rglob('*') if p.suffix.lower() in ('.webp', '.png', '.jpg', '.jpeg', '.avif'))
    for p in files:
        data = p.read_bytes()
        if b'WebStatement' in data: continue
        rel = p.relative_to(ROOT).as_posix()
        title, desc, rights, cr_ascii, creator, credit, st = describe(rel, names)
        x, tiff = xmp(title, desc, rights, creator, credit, st), exif_tiff(desc, creator, cr_ascii)
        if check_only: done.append(rel); continue
        ext = p.suffix.lower()
        im = Image.open(io.BytesIO(data)); im.load()
        if ext == '.webp':
            new = webp(data, tiff, x, im.size, im.mode in ('RGBA', 'LA', 'PA'))
        elif ext == '.png':
            new = png(data, tiff, x)
        elif ext in ('.jpg', '.jpeg'):
            new = jpeg(data, tiff, x)
        else:   # AVIF: re-encode from the largest sibling of the same picture
            base = re.sub(r'-\d+$', '', p.stem)
            sibs = sorted(ROOT.joinpath(p.parent.relative_to(ROOT)).glob(base + '*'), key=lambda s: Image.open(s).size[0], reverse=True)
            src = Image.open(sibs[0]).convert('RGB')
            if src.size != im.size: src = src.resize(im.size, Image.LANCZOS)
            buf = io.BytesIO(); src.save(buf, 'AVIF', quality=76, speed=2, subsampling='4:4:4', exif=b'Exif\x00\x00' + tiff, xmp=x)
            new = buf.getvalue()
        # the image must decode to the same pixels (lossless formats) and carry the licence
        chk = Image.open(io.BytesIO(new)); chk.load()
        if ext != '.avif':
            a, b = Image.open(io.BytesIO(data)).convert('RGBA'), chk.convert('RGBA')
            assert a.size == b.size and a.tobytes() == b.tobytes(), f'pixels changed: {rel}'
        assert b'WebStatement' in new
        p.write_bytes(new); done.append(rel)
    print(f'{len(done)} images {"would be " if check_only else ""}stamped')
    for r in done[:400]: print('  ', r)


if __name__ == '__main__':
    main('--check' in sys.argv)
