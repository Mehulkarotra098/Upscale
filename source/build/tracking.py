"""Google Tag Manager on every public page (container GTM-MXD5KLR3, Mehul's account).

The tag goes right after <meta charset> in <head>, as Google asks. Before it loads, an inline script sets Google's consent
state (Consent Mode v2). Ads are off always. Analytics, by region (Mehul, 16 Nov 2026):
- EU/EEA, UK, Switzerland and Quebec (told apart by the device time zone, and by Google's own location check through the
  `region` default as a second net): off until the visitor says yes;
- everywhere else: on, with nothing on screen; "Change cookie choice" in the footer turns it off;
- a saved answer (localStorage 'us-consent', 12 months) always wins, and Global Privacy Control means off.
The script marks <html data-cc="ask|note"> so the question in source/src/script.js shows the right wording. There is no <noscript>
fallback any more: a visitor without JavaScript can't be asked, so nothing loads for them.
build_site.py runs inject() over every built page except /admin (which has a strict CSP and isn't tracked).
The same tag for the pages built in JavaScript (card editor, blog fallback shell) lives in server/lib/gtm.js:
keep the two in step."""
import re

GTM_ID = 'GTM-MXD5KLR3'
CONSENT = "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}(function(){var c='',d='denied',s=1;try{var p=(localStorage.getItem('us-consent')||'').split(':');if(Date.now()-(+p[1]||0)<31536e6)c=p[0];}catch(e){}try{s=/^(Europe\\/|Arctic\\/|Atlantic\\/(Reykjavik|Canary|Madeira|Azores|Faroe)|Asia\\/(Nicosia|Famagusta)|America\\/(Montreal|Toronto|Blanc-Sablon))/.test(Intl.DateTimeFormat().resolvedOptions().timeZone)?1:0;}catch(e){}document.documentElement.setAttribute('data-cc',s?'ask':'note');var on=c==='yes'||(c!=='no'&&!s&&!navigator.globalPrivacyControl);gtag('consent','default',{ad_storage:d,ad_user_data:d,ad_personalization:d,analytics_storage:on?'granted':d});if(!c)gtag('consent','default',{ad_storage:d,ad_user_data:d,ad_personalization:d,analytics_storage:d,region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH','CA-QC']});})();gtag('js',new Date());"
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
