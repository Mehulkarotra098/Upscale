"""Google Tag Manager on every public page (container GTM-MXD5KLR3, Mehul's account).

The tag goes right after <meta charset> in <head>, as Google asks. Before it loads, an inline script sets Google's consent
state (Consent Mode v2): ads off always, analytics off unless this browser holds a "yes" from the cookie question
(localStorage 'us-consent', kept 12 months; the question itself is in source/src/script.js). There is no <noscript>
fallback any more: a visitor without JavaScript can't be asked, so nothing loads for them.
build_site.py runs inject() over every built page except /admin (which has a strict CSP and isn't tracked).
The same tag for the pages built in JavaScript (card editor, blog fallback shell) lives in server/lib/gtm.js:
keep the two in step."""
import re

GTM_ID = 'GTM-MXD5KLR3'
CONSENT = ("window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}(function(){var c='',d='denied';try{var p=(localStorage.getItem('us-consent')||'').split(':');if(Date.now()-(+p[1]||0)<31536e6)c=p[0];}catch(e){}gtag('consent','default',{ad_storage:d,ad_user_data:d,ad_personalization:d,analytics_storage:c==='yes'?'granted':d});})();gtag('js',new Date());")
HEAD = (f'<script>{CONSENT}</script>\n'
        f'<script async src="https://www.googletagmanager.com/gtm.js?id={GTM_ID}"></script>')
BODY = ''

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
    return html[:b.end()] + BODY + html[b.end():] if b and BODY else html
