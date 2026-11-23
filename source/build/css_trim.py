"""Per-page CSS: each page gets only the style rules it can use, inline in its <head>, instead of the whole 450 KB
site stylesheet as a render-blocking file. Standard library only.

How a rule is judged (the same idea as PurgeCSS's default): every word-like token on the page (its whole HTML,
inline scripts included) and in every script the site serves is collected. A selector is kept when each of its
class and id names is among those tokens. Anything uncertain is kept: tag and attribute parts are ignored, the
arguments of :not(), :is(), :where(), :has() and other functional pseudo-classes are ignored, and escaped names
keep the rule. @font-face rules are always kept; @keyframes are kept when their name is used by a kept rule or a
script. At-rules that wrap rules (@media, @supports, @container, @layer) are trimmed inside and dropped when empty.

build_site.py runs this last, page by page. CSS_TRIM=0 in the environment turns it off (full stylesheet link).
"""
import re

_TOKEN = re.compile(r'[A-Za-z0-9_-]+')
_FUNC_PSEUDO = re.compile(r':{1,2}[a-zA-Z-]+\(')
_NAMES = re.compile(r'([.#])(-?[A-Za-z_][A-Za-z0-9_-]*)')


def _strip_comments(css):
    out, i, n = [], 0, len(css)
    while i < n:
        if css.startswith('/*', i):
            j = css.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        c = css[i]
        if c in '"\'':
            j = i + 1
            while j < n and css[j] != c:
                j += 2 if css[j] == '\\' else 1
            out.append(css[i:j + 1]); i = j + 1
            continue
        out.append(c); i += 1
    return ''.join(out)


def _block_end(css, i):
    """Index just after the '}' that closes the block whose '{' is at i. Strings are skipped."""
    depth, n = 0, len(css)
    while i < n:
        c = css[i]
        if c in '"\'':
            j = i + 1
            while j < n and css[j] != c:
                j += 2 if css[j] == '\\' else 1
            i = j + 1
            continue
        if c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: return i + 1
        i += 1
    return n


def parse(css):
    """List of nodes: ('rule', prelude, body) | ('at', prelude, children or None, raw)."""
    nodes, i, n = [], 0, len(css)
    while i < n:
        while i < n and css[i] in ' \t\r\n;': i += 1
        if i >= n: break
        j = i
        while j < n and css[j] not in '{;':
            if css[j] in '"\'':
                q = css[j]; j += 1
                while j < n and css[j] != q: j += 2 if css[j] == '\\' else 1
            j += 1
        prelude = css[i:j].strip()
        if j >= n: break
        if css[j] == ';':  # @import, @charset ...
            nodes.append(('at', prelude, None, css[i:j + 1])); i = j + 1
            continue
        end = _block_end(css, j)
        body = css[j + 1:end - 1]
        if prelude.startswith('@'):
            name = prelude.split()[0].split('(')[0].lower()
            if name in ('@media', '@supports', '@container', '@layer', '@document'):
                nodes.append(('at', prelude, parse(body), None))
            else:
                nodes.append(('at', prelude, None, css[i:end]))
        else:
            nodes.append(('rule', prelude, body))
        i = end
    return nodes


def _split_selectors(prelude):
    parts, depth, cur = [], 0, []
    for c in prelude:
        if c in '([': depth += 1
        elif c in ')]': depth -= 1
        if c == ',' and depth == 0:
            parts.append(''.join(cur)); cur = []
        else:
            cur.append(c)
    parts.append(''.join(cur))
    return [p.strip() for p in parts if p.strip()]


def _without_functional_pseudos(sel):
    out, i = [], 0
    while True:
        m = _FUNC_PSEUDO.search(sel, i)
        if not m:
            out.append(sel[i:]); break
        out.append(sel[i:m.start()])
        depth, j = 1, m.end()
        while j < len(sel) and depth:
            if sel[j] == '(': depth += 1
            elif sel[j] == ')': depth -= 1
            j += 1
        i = j
    return ''.join(out)


def _selector_used(sel, tokens):
    if '\\' in sel: return True
    core = re.sub(r'\[[^\]]*\]', '', _without_functional_pseudos(sel))  # attribute parts ignored
    return all(name in tokens for _, name in _NAMES.findall(core))


def _keep_nodes(nodes, tokens):
    out = []
    for nd in nodes:
        if nd[0] == 'rule':
            sels = _split_selectors(nd[1])
            kept = [s for s in sels if _selector_used(s, tokens)]
            if kept: out.append(('rule', ','.join(kept), nd[2]))
        else:
            _, prelude, children, raw = nd
            if children is None:
                out.append(nd)
            else:
                inner = _keep_nodes(children, tokens)
                if inner: out.append(('at', prelude, inner, None))
    return out


def _render(nodes):
    parts = []
    for nd in nodes:
        if nd[0] == 'rule':
            parts.append(f'{nd[1]}{{{nd[2].strip()}}}')
        elif nd[2] is None:
            parts.append(nd[3].strip())
        else:
            parts.append(f'{nd[1]}{{{_render(nd[2])}}}')
    return '\n'.join(parts)


def _drop_unused_keyframes(nodes, used_text, tokens):
    out = []
    for nd in nodes:
        if nd[0] == 'at' and nd[2] is None and re.match(r'@(-webkit-)?keyframes\b', nd[1]):
            name = nd[1].split(None, 1)[1].strip() if ' ' in nd[1] else ''
            if name and not re.search(r'(?<![\w-])' + re.escape(name) + r'(?![\w-])', used_text) and name not in tokens:
                continue
        elif nd[0] == 'at' and nd[2] is not None:
            inner = _drop_unused_keyframes(nd[2], used_text, tokens)
            if not inner: continue
            nd = ('at', nd[1], inner, None)
        out.append(nd)
    return out


class Trimmer:
    def __init__(self, css, script_texts):
        self.nodes = parse(_strip_comments(css))
        self.js_tokens = set(_TOKEN.findall('\n'.join(script_texts)))

    def for_page(self, html):
        tokens = self.js_tokens | set(_TOKEN.findall(html))
        kept = _keep_nodes(self.nodes, tokens)
        rules_text = _render([nd for nd in kept if not (nd[0] == 'at' and nd[2] is None and 'keyframes' in nd[1])])
        kept = _drop_unused_keyframes(kept, rules_text + '\n' + html, self.js_tokens)
        return _render(kept)
