"""Google Tag Manager on every public page (container GTM-MXD5KLR3, Mehul's account).

The tag goes right after <meta charset> in <head>, as Google asks, and the <noscript> fallback right after <body>.
build_site.py runs inject() over every built page except /admin (which has a strict CSP and isn't tracked).
The same tag for the pages built in JavaScript (card editor, blog fallback shell) lives in server/lib/gtm.js:
keep the two in step."""
import re

GTM_ID = 'GTM-MXD5KLR3'
HEAD = (f'<script async src="https://www.googletagmanager.com/gtm.js?id={GTM_ID}"></script>\n'
        '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());</script>')
BODY = (f'<noscript><iframe src="https://www.googletagmanager.com/ns.html?id={GTM_ID}" height="0" width="0" '
        'style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>')

_CHARSET = re.compile(r'<meta charset="[^"]*">', re.I)
_HEAD = re.compile(r'<head[^>]*>', re.I)
_BODY = re.compile(r'<body[^>]*>', re.I)


def inject(html):
    """Adds the tag once; pages that already have it, or have no <head>, are left alone."""
    if GTM_ID in html or not _HEAD.search(html):
        return html
    m = _CHARSET.search(html)
    at = m.end() if m and m.start() < html.lower().find('</head>') else _HEAD.search(html).end()
    html = html[:at] + '\n' + HEAD + html[at:]
    b = _BODY.search(html)
    return html[:b.end()] + BODY + html[b.end():] if b else html
