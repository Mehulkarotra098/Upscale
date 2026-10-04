"""Work-card browser mockups and client logo-wall badges for the U Scale site.
Each mockup is art-directed from the live site's own colours and type (measured from the live pages),
so it lives in the client's palette, not U Scale's. Text is aria-hidden: the card's real text says what it is."""

def bw(domain, cls, s1, s2):
    return (f'<div class="bw" aria-hidden="true"><div class="bw__bar"><i></i><i></i><i></i><span class="bw__url">{domain}</span></div>'
            f'<div class="bw__view"><div class="bw__page mk {cls}"><div class="scr">{s1}</div><div class="scr s2">{s2}</div></div></div></div>')

L = lambda n=1, cls='': ''.join(f'<i class="ln {cls}"></i>' for _ in range(n))
LINKS = '<span class="links"><i></i><i></i><i></i><i></i></span>'

MOCKS = {
'tis': bw('tis-school-admissions-2026.vercel.app', 'mk-tis',
  f'<div class="nav"><span class="lg">TIS</span>{LINKS}<span class="pill">Enquire for admission</span></div>'
  '<div class="split"><div class="copy"><span class="kick">Admissions open · 2026–27</span>'
  '<b class="h">Where curiosity grows into confidence.</b><span class="mb">Enquire for admission</span>'
  '<span class="ticks"><i>CISCE-affiliated</i><i>Nursery–Grade 10</i></span></div>'
  '<div class="pic"><span class="sun"></span><span class="shelf"></span><span class="book b1"></span><span class="book b2"></span><span class="book b3"></span><span class="kid"></span><span class="desk"></span></div></div>',
  '<b class="hh">Find the right learning stage.</b><div class="cards"><span>Preschool</span><span>Primary</span><span>Middle</span><span>Secondary</span></div>'),

'antrah': bw('antrah-wellness.vercel.app', 'mk-antrah',
  f'<div class="nav"><span class="lg">Antrah</span><span class="links"><i></i><i></i><i></i></span><span class="pill">Explore</span></div>'
  '<div class="center"><span class="kick">Antrah · A two-day wellness gathering</span><b class="h">Step into a different rhythm.</b>'
  '<span class="mb">Explore the experience</span></div>'
  '<div class="paths"><span style="--k:0">Align</span><span style="--k:1">Challenge</span><span style="--k:2">Unwind</span><span style="--k:3">Indulge</span><span style="--k:4">Breathe</span></div>',
  '<span class="kick">02 · The experience</span><b class="hh">Five energies in motion.</b><div class="rings"><i></i><i></i><i></i><i></i><i></i></div>'),

'roar': bw('roararenaindia.vercel.app', 'mk-roar',
  '<div class="nav"><span class="lg">Roar Arena</span><span class="links"><i></i><i></i><i></i><i></i></span><span class="pill">Join community</span></div>'
  '<div class="split"><div class="copy"><span class="kick">Matchday energy starts here</span><b class="h">Feel the game. Join the roar.</b>'
  '<span class="btns"><span class="mb">Join community</span><span class="mb ghost">Follow Instagram</span></span></div>'
  '<div class="board"><span class="cup">FIFA World Cup · Final</span><span class="score"><b>ESP</b><em>1:0</em><b>ARG</b></span><span class="state">Spain won</span></div></div>'
  '<div class="tick"><span>One game. One crowd. One roar. · Live screenings coming soon · One game. One crowd. One roar. ·</span></div>',
  '<span class="kick">Live match center</span><b class="hh">Matchday command board.</b><div class="rows"><i></i><i></i><i></i></div>'),

'mcm': bw('mycountrymobile.com', 'mk-mcm',
  '<div class="nav"><span class="lg"><i></i>My Country Mobile</span><span class="links"><i></i><i></i><i></i><i></i><i></i></span><span class="pill">Get Started Free Trial</span></div>'
  '<div class="split"><div class="copy"><span class="mchip">AI receptionist is now multilingual</span><b class="h">The AI cloud contact center platform you can activate in minutes.</b>'
  '<span class="btns"><span class="mb">Start Free Trial</span><span class="mb ghost">Book a Demo</span></span></div>'
  '<div class="call"><span class="tile t1"><em>LIVE</em></span><span class="tile t2"><em>LIVE</em></span>'
  '<span class="bub l"></span><span class="bub r"></span><span class="bub l s"></span><span class="ctl"><i></i><i></i><i class="end"></i></span></div></div>',
  '<span class="kick">The platform</span><b class="hh">Cloud phone and AI contact center. One login.</b><div class="duo"><span></span><span class="ai"></span></div>'),

'callmama': bw('callmama.com', 'mk-cm',
  '<div class="nav"><span class="lg">callmama<i></i></span><span class="links"><i></i><i></i><i></i><i></i></span><span class="pill">Contact Us</span></div>'
  '<div class="split"><div class="copy"><b class="h">Be Local,<br>Call Global<br><em>For less.</em></b>'
  '<span class="sub">No SIM. No sky-high bills. No hidden fees.</span><span class="stores"><i>App Store</i><i>Google Play</i></span></div>'
  '<div class="phone"><span class="av"></span><span class="nm">Connected</span><span class="tm">02:19</span>'
  '<span class="keys"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="end"></span></div></div>',
  '<span class="kick">Our products</span><b class="hh">Three ways to stay connected.</b><div class="trio"><span></span><span></span><span></span></div>'),

'growcred': bw('greencred.vercel.app', 'mk-gc',
  '<div class="nav"><span class="lg"><i></i>GrowCred</span><span class="links"><i></i><i></i><i></i><i></i></span><span class="pill">Start Planting</span></div>'
  '<div class="split"><div class="copy"><span class="mchip">Plant. Prove. Protect.</span><b class="h">Grow good. <em>Earn green.</em></b>'
  '<span class="sub">Turn real tree care into real impact.</span><span class="btns"><span class="mb">Start Planting</span><span class="mb ghost">View Dashboard</span></span></div>'
  '<div class="app"><span class="tree"><i></i><i></i><i></i><b></b></span><span class="ver">Verified</span><span class="coin">+10</span>'
  '<span class="row"></span><span class="row s"></span></div></div>',
  '<span class="kick">Proof beats promises</span><b class="hh">A simple loop for real tree care.</b><div class="trio"><span>Plant</span><span>Prove</span><span>Protect</span></div>'),

'sashe': bw('sashebyprachi.vercel.app', 'mk-sashe',
  '<div class="nav"><span class="lg">S</span><span class="caps">Work · Studio · Stories · Prachi · Contact</span><span class="caps">Enquire →</span></div>'
  '<div class="split"><div class="pic"><span class="dform"></span><span class="cloth c1"></span><span class="cloth c2"></span><span class="sketch"></span><span class="sketch k2"></span></div>'
  '<div class="copy"><span class="kick"><i></i>Bespoke fashion · Personal styling</span><b class="h">Made to feel like <em>you.</em></b>'
  '<span class="sub">Bespoke sarees, contemporary wear and personal styling.</span><span class="links2"><u>Explore Selected Work →</u><span>WhatsApp Prachi</span></span></div></div>',
  '<span class="kick"><i></i>Signature looks</span><b class="hh">Three signature <em>looks.</em></b><div class="looks"><span class="e"></span><span class="k"></span><span class="v"></span></div>'),

'vidhi': bw('vidhi-parmar-ai.vercel.app', 'mk-vidhi',
  '<div class="slate"><span>SC. 00 / TAKE 01</span><span>00:00:00</span></div>'
  '<div class="nav"><span class="lg">VIDHI<em>AI</em></span><span class="links"><i></i><i></i><i></i><i></i></span><span class="pill">Let\'s talk</span></div>'
  '<div class="split"><div class="copy"><span class="kick">AI visual artist · Video editor · Mumbai</span>'
  '<b class="h">AI films &amp; visuals that make brands <em>impossible</em> to ignore</b></div>'
  '<div class="reel"><span class="play"></span><span class="tc"><i></i>00:00 / 00:36</span></div></div>',
  '<span class="kick">SC. 01 · Selected work</span><b class="hh">Selected work</b><div class="strip"><span></span><span></span><span></span><span></span></div>'),

'brandgen': bw('getbrandgen.com', 'mk-bg',
  '<div class="nav"><span class="lg"><i></i>BrandGen</span><span class="links"><i></i><i></i><i></i></span><span class="pill">Start free</span></div>'
  '<div class="center"><b class="h">Generate <em>on-brand</em> Visuals from one reference or your guidelines.</b>'
  '<span class="prompt"><i></i><span class="go">Generate</span></span></div>'
  '<div class="gens"><span class="g1"></span><span class="g2"></span><span class="g3"></span><span class="g4"></span></div>',
  '<span class="kick">Brand DNA</span><b class="hh">One reference. Every format.</b><div class="dna"><i></i><i></i><i></i><i></i><i></i></div>'),
}

# Client logo wall: typographic mini-logos in each project's own voice (monochrome so the wall keeps one rhythm)
CREST = ('<svg viewBox="0 0 32 38" aria-hidden="true" focusable="false"><path d="M16 2 30 7v12c0 8.5-6 14.5-14 17C8 33.5 2 27.5 2 19V7L16 2Z" '
         'fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M10 16h12M16 11v15" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>')
ARCS = ('<svg viewBox="0 0 30 30" aria-hidden="true" focusable="false"><circle cx="9" cy="21" r="3.2" fill="currentColor"/>'
        '<path d="M9 13a8 8 0 0 1 8 8M9 6a15 15 0 0 1 15 15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>')
LEAF = ('<svg viewBox="0 0 30 30" aria-hidden="true" focusable="false"><path d="M15 27C6 22 5 11 15 3c10 8 9 19 0 24Z" fill="currentColor"/>'
        '<path d="M15 27V12" stroke="var(--space)" stroke-width="2" stroke-linecap="round"/></svg>')
GRID = ('<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false"><rect x="2" y="2" width="11" height="11" rx="3" fill="currentColor"/>'
        '<rect x="15" y="2" width="11" height="11" rx="5.5" fill="none" stroke="currentColor" stroke-width="2.4"/>'
        '<rect x="2" y="15" width="11" height="11" rx="5.5" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="15" y="15" width="11" height="11" rx="3" fill="currentColor"/></svg>')
BADGES = [
 ('TIS Admissions', f'<span class="bd bd-tis">{CREST}<span><b>TIS</b><small>Admissions 2026–27</small></span></span>'),
 ('Antrah Wellness', '<span class="bd bd-antrah"><b>Antrah</b><small><i></i><i></i><i></i><i></i><i></i>Wellness</small></span>'),
 ('Roar Arena', '<span class="bd bd-roar"><b>Roar</b><b class="o">Arena</b></span>'),
 ('My Country Mobile', f'<span class="bd bd-mcm">{ARCS}<b>My Country Mobile</b></span>'),
 ('Callmama', '<span class="bd bd-cm"><b>callmama</b><i></i></span>'),
 ('GrowCred', f'<span class="bd bd-gc">{LEAF}<b>Grow<span>Cred</span></b></span>'),
 ('Sashe by Prachi', '<span class="bd bd-sashe"><b>Sashe</b><small>by Prachi</small></span>'),
 ('Vidhi Parmar', '<span class="bd bd-vidhi"><b>Vidhi<em>AI</em></b><small>Vidhi Parmar</small></span>'),
 ('BrandGen', f'<span class="bd bd-bg">{GRID}<b>BrandGen</b></span>'),
]

def logo_wall():
    items = ''.join(f'<li class="lw__cell"><span class="sr-only">{n}</span><span aria-hidden="true">{b}</span></li>' for n, b in BADGES)
    dup = ''.join(f'<li class="lw__cell">{b}</li>' for _, b in BADGES)
    return (f'<div class="lw"><div class="lw__track"><ul class="lw__list">{items}</ul>'
            f'<ul class="lw__list lw__dup" aria-hidden="true">{dup}</ul></div></div>')

def font_text():
    """Every character the mockups and badges draw, for a subset Google Fonts request."""
    import re, html
    txt = ' '.join(MOCKS.values()) + ' '.join(b for _, b in BADGES)
    txt = html.unescape(re.sub(r'<[^>]+>', ' ', txt))
    chars = set(txt) | set(txt.upper()) | set(txt.lower()) | set('0123456789')
    return ''.join(sorted(c for c in chars if c.strip()))
