"""Client quotes, shown beside the claim they support.

Only quotes marked approved in source/src/testimonials.json are shown, word for word, each with a link to where the client
said it (Clutch, LinkedIn, Instagram), so a reader can check it. No review markup is added: Google does not show review
stars for reviews a business publishes about itself.

Use inside a section with the Html block:  GP.Html(*proof.block('spacestudio'))  or  GP.Html(*proof.block('sashe', 'vidhi'))
"""
import html, json

import config

e = lambda t: html.escape(t, quote=False)
ea = lambda t: html.escape(t, quote=True)

_ALL = json.loads((config.REPO / 'source' / 'src' / 'testimonials.json').read_text(encoding='utf-8'))
QUOTES = {q['logo']: q for q in _ALL if q.get('approved') and q.get('logo') and q.get('url')}

# What each client hired us for, in the words of their work card, so the reader knows what the quote is about.
JOB = {'sashe': 'Website for a made-to-order fashion label, Mumbai',
       'spacestudio': 'Website rebuild and SEO for an architecture practice, Chennai',
       'vidhi': 'Portfolio website for an AI visual artist, Mumbai'}
LINK = {'sashe': 'Read it on Clutch', 'spacestudio': 'See the post on LinkedIn', 'vidhi': 'See the comment on Instagram'}


def quote(key):
    """One client quote as a figure: where it was said, the exact words, who said it and a link to the source."""
    q = QUOTES[key]
    if q.get('rating'):
        stars = ''.join(f'<i style="--s:{k}"></i>' for k in range(5))
        top = (f'<p class="rv__stars" aria-label="Rated {q["rating"]}.0 out of 5 on Clutch">{stars}<b>{q["rating"]}.0</b>'
               f'<span>Verified review on Clutch</span></p>')
    else:
        top = f'<p class="rv__src">{e(q["source"])}</p>'
    return (f'<figure class="rv rv--p" data-reveal>{top}<blockquote><p>{e(q["quote"])}</p></blockquote>'
            f'<figcaption><span class="rv__av" aria-hidden="true">{e(q["name"][0])}</span><span><b>{e(q["name"])}</b>'
            f'<small>{e(q["role"])}</small><small class="rv__job">{e(JOB[key])}</small></span>'
            f'<a class="tlink" href="{ea(q["url"])}" target="_blank" rel="noopener">{e(LINK[key])}'
            f'<span class="sr-only"> (opens in a new tab)</span> ↗</a></figcaption></figure>')


def text(key):
    """The same quote as one plain sentence, for llms-full.txt."""
    q = QUOTES[key]
    where = 'Review on Clutch, 5.0' if q.get('rating') else q['source']
    return f'{where}: "{q["quote"]}" ({q["name"]}, {q["role"]}. {JOB[key]}.)'


def block(*keys):
    """(html, text) for one quote, or for two or three side by side on wide screens. Fits the Html block: Html(*proof.block(...))."""
    if len(keys) == 1:
        return quote(keys[0]), text(keys[0])
    cls = 'rv-row rv-row--3' if len(keys) > 2 else 'rv-row'
    return f'<div class="{cls}">' + ''.join(quote(k) for k in keys) + '</div>', ' '.join(text(k) for k in keys)
