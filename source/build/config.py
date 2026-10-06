"""Build settings, read from the environment so nothing about the deployment is hardcoded.

SITE_URL      Public origin of the site, e.g. https://uscale.in  (set this in Vercel → Settings → Environment Variables)
              If unset, DEFAULT_SITE_URL below is used. (Vercel's VERCEL_PROJECT_PRODUCTION_URL is deliberately
              not used: with several production aliases it can pick a host you don't want as canonical.)
OUTPUT_DIR    Where the built site is written (default: public/ at the repo root, which Vercel serves).
VERCEL_ENV    Set by Vercel. Anything other than "production" (preview, development) is built as noindex,
              so preview URLs never compete with the real site in Google. Override with SITE_INDEXABLE=1/0.
BUILD_DATE    Optional YYYY-MM-DD for sitemap lastmod / dateModified. Default: last git commit date, else today.
"""
import datetime, os, pathlib, subprocess

DEFAULT_SITE_URL = 'https://uscale.in'

REPO = pathlib.Path(__file__).resolve().parent.parent.parent


def _origin(raw):
    raw = (raw or '').strip()
    if not raw:
        return ''
    if '://' not in raw:
        raw = 'https://' + raw
    return raw.rstrip('/') + '/'


SITE_URL = _origin(os.environ.get('SITE_URL')) or _origin(DEFAULT_SITE_URL)

_env = os.environ.get('VERCEL_ENV', 'production')
_flag = os.environ.get('SITE_INDEXABLE')
INDEXABLE = (_flag not in ('0', 'false', 'no')) if _flag is not None else _env == 'production'
ROBOTS_META = 'index, follow, max-image-preview:large, max-snippet:-1' if INDEXABLE else 'noindex, nofollow'

OUT = pathlib.Path(os.environ.get('OUTPUT_DIR') or REPO / 'public')
if not OUT.is_absolute():
    OUT = REPO / OUT


def _build_date():
    if os.environ.get('BUILD_DATE'):
        return os.environ['BUILD_DATE']
    try:
        d = subprocess.run(['git', '-C', str(REPO), 'log', '-1', '--format=%cs'], capture_output=True, text=True, timeout=10).stdout.strip()
        if len(d) == 10:
            return d
    except Exception:
        pass
    return datetime.date.today().isoformat()


BUILD_DATE = _build_date()
