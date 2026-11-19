/* U Scale pitch deck controller: scales each slide canvas to the window, moves between slides (keys, wheel, swipe,
   buttons, #slide links), plays the sweep between slides and runs the per-slide pieces (typing, price counters,
   currency switch, client quotes). Reduced motion gets a calm crossfade; ?motion=full overrides it. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, W = window;
  var slides = [].slice.call(d.querySelectorAll('.sl'));
  var N = slides.length;
  if (!N) return;
  var cur = -1, busy = false, queued = null, timers = [];
  var params = new URLSearchParams(location.search);
  var calm = W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && params.get('motion') !== 'full';
  if (calm) html.classList.add('calm');
  if (W.matchMedia && matchMedia('(hover: none)').matches) html.classList.add('touch');

  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var titleN = $('.dk-title__n'), titleT = $('.dk-title__t'), countN = $('.dk-count__n');
  var prog = $$('.dk-prog li'), prev = $('[data-act="prev"]'), next = $('[data-act="next"]');
  var wipeA = $('.dk-wipe__a'), wipeB = $('.dk-wipe__b');
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- fit the canvas to the window ---------- */
  var printing = false;
  function layout() {
    if (printing) return;
    var vw = html.clientWidth || innerWidth, vh = innerHeight;
    var pt = vw / vh < 0.95, s, cw, ch, top, bot, ui = 1;
    if (pt) {
      top = 54; bot = 58;
      // phones scale by width so text keeps its size; a slide taller than the screen scrolls inside itself
      s = clamp(vw / 380, 0.8, 1.3); cw = clamp(vw / s, 340, 460); ch = Math.max(vh / s, 520);
    } else {
      top = vh < 480 ? 44 : vh < 700 ? 58 : 66;
      ui = clamp(Math.min(vw / 1600, vh / 860), 1, 1.6); top = Math.round(top * ui); bot = top;
      s = Math.min(vw / 1280, vh / 720); cw = clamp(vw / s, 1280, 1760); ch = clamp(vh / s, 720, 960);
    }
    var st = html.style;
    st.setProperty('--s', s.toFixed(4)); st.setProperty('--cw', Math.round(cw)); st.setProperty('--ch', Math.round(ch));
    st.setProperty('--top', top + 'px'); st.setProperty('--bot', bot + 'px');
    st.setProperty('--ui', ui.toFixed(3));
    html.classList.toggle('pt', pt);
    html.classList.toggle('pt-chrome', pt || vw < 760 || vh < 480);
    html.classList.toggle('short', !pt && vh < 480);
  }
  var rq = 0;
  W.addEventListener('resize', function () { cancelAnimationFrame(rq); rq = requestAnimationFrame(layout); });
  layout();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(layout);

  /* ---------- moving between slides ---------- */
  function chrome(n) {
    var s = slides[n];
    titleN.textContent = pad(n + 1);
    titleT.textContent = s.getAttribute('data-name');
    countN.textContent = n + 1;
    prog.forEach(function (li, i) { li.classList.toggle('is-cur', i === n); li.classList.toggle('is-done', i < n); });
    var b = prog[n] && prog[n].querySelector('button');
    prog.forEach(function (li) { li.querySelector('button').removeAttribute('aria-current'); });
    if (b) b.setAttribute('aria-current', 'step');
    prev.disabled = n === 0; next.disabled = n === N - 1;
    var id = s.id, h = n === 0 ? location.pathname + location.search : '#' + id;
    try { history.replaceState(null, '', h); } catch (e) { /* file:// or sandboxed */ }
  }
  function tone(n) {
    var c = slides[n].className.match(/sl--(dark|light|tint)/);
    html.setAttribute('data-tone', c ? c[1] : 'dark');
  }
  function show(from, n) {
    if (from >= 0) {
      var o = slides[from];
      o.classList.remove('is-cur', 'on'); o.inert = true; o.setAttribute('aria-hidden', 'true');
      leave(o);
    }
    var s = slides[n];
    s.inert = false; s.removeAttribute('aria-hidden');
    s.classList.add('is-cur');
    var cvi = s.querySelector('.cvi'); if (cvi) cvi.scrollTop = 0;
    void s.offsetWidth;
    s.classList.add('on');
    tone(n);
    enter(s);
    more(); setTimeout(more, 1200);
  }
  var EASE = 'cubic-bezier(.76,0,.24,1)';
  function go(n) {
    n = clamp(n, 0, N - 1);
    if (n === cur) return;
    if (busy) { queued = n; return; }
    var from = cur, dir = n > from ? 1 : -1;
    cur = n; chrome(n);
    if (from < 0) { show(from, n); return; }
    if (calm || !wipeA.animate) {
      show(from, n);
      if (slides[n].animate) slides[n].animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'ease-out' });
      return;
    }
    busy = true;
    var a = 'translateX(' + (dir > 0 ? 102 : -102) + '%)', z = 'translateX(0)', b = 'translateX(' + (dir > 0 ? -102 : 102) + '%)';
    wipeA.animate([{ transform: a }, { transform: z }], { duration: 430, easing: EASE, fill: 'forwards' });
    wipeB.animate([{ transform: a }, { transform: z }], { duration: 430, delay: 80, easing: EASE, fill: 'forwards' }).finished.then(function () {
      show(from, n);
      wipeB.animate([{ transform: z }, { transform: b }], { duration: 560, easing: EASE, fill: 'forwards' });
      return wipeA.animate([{ transform: z }, { transform: b }], { duration: 560, delay: 70, easing: EASE, fill: 'forwards' }).finished;
    }).then(done, done);
    function done() {
      busy = false;
      if (queued !== null) { var q = queued; queued = null; go(q); }
    }
  }
  W.usDeckGo = go;

  /* phones: show the 'more below' cue while the open slide can still scroll down */
  function more() {
    var s = slides[cur], el = s && s.querySelector('.cvi');
    var m = html.classList.contains('pt') && !!el && el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 12;
    slides.forEach(function (x) { x.classList.toggle('has-more', x === s && m); });
    html.classList.toggle('show-more', m);
  }
  $$('.cvi').forEach(function (el) { el.addEventListener('scroll', more, { passive: true }); });
  W.addEventListener('resize', function () { setTimeout(more, 60); });

  /* ---------- per-slide pieces ---------- */
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function enter(s) {
    if (s.id === 'problem') typeIt(s);
    if (s.id === 'price') countUp(s);
    if (s.id === 'work') quotes(s, true);
  }
  function leave(s) {
    timers.forEach(clearTimeout); timers = [];
    $$('[data-type]', s).forEach(function (el) { el.textContent = el.getAttribute('data-type'); });
    if (s.id === 'price') setCur(curCode, true);
    if (s.id === 'work') quotes(s, false);
  }
  function typeIt(s) {
    $$('[data-type]', s).forEach(function (el) {
      var t = el.getAttribute('data-type'), i = 0;
      el.textContent = '';
      var step = function () { el.textContent = t.slice(0, ++i); if (i < t.length) later(step, 55 + Math.random() * 60); };
      later(step, calm ? 100 : 450);
    });
  }
  var fmt = W.Intl ? new Intl.NumberFormat('en-IN') : { format: String };
  function countUp(s) {
    if (curCode !== 'INR' || calm) return;
    $$('.rc-v', s).forEach(function (el, i) {
      var v = +el.getAttribute('data-inr'), t0 = 0, dur = 1000;
      el.textContent = '₹0';
      later(function () {
        var tick = function (t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = '₹' + fmt.format(Math.round(v * e / (k < 1 ? 10 : 1)) * (k < 1 ? 10 : 1));
          if (k < 1 && s.classList.contains('on')) requestAnimationFrame(tick); else el.textContent = '₹' + fmt.format(v);
        };
        requestAnimationFrame(tick);
      }, 1150 + i * 120);
    });
  }

  /* currency: rupees by default; visitors abroad see their own currency first */
  var sel = $('.cur__s'), curCode = 'INR';
  function guessCur() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return 'INR'; }
    if (/^Asia\/(Kolkata|Calcutta)/.test(tz)) return 'INR';
    if (/^Europe\/(London|Belfast|Guernsey|Isle_of_Man|Jersey)/.test(tz)) return 'GBP';
    if (/^Europe\/Dublin/.test(tz)) return 'EUR';
    if (/^America\/(Toronto|Vancouver|Montreal|Edmonton|Winnipeg|Halifax|Regina|St_Johns|Calgary)/.test(tz)) return 'CAD';
    if (/^(America\/|US\/)/.test(tz)) return 'USD';
    if (/^Australia\//.test(tz)) return 'AUD';
    if (/^(Pacific\/Auckland|NZ)/.test(tz)) return 'NZD';
    if (/^Asia\/Singapore/.test(tz)) return 'SGD';
    if (/^Asia\/Dubai/.test(tz)) return 'AED';
    if (/^Europe\/(Amsterdam|Berlin|Paris|Madrid|Rome|Brussels|Vienna|Lisbon|Athens|Helsinki|Luxembourg|Bratislava|Ljubljana|Tallinn|Riga|Vilnius|Malta|Nicosia|Zagreb)/.test(tz)) return 'EUR';
    return 'INR';
  }
  function setCur(code, quiet) {
    curCode = code;
    if (sel) sel.value = code;
    $$('.rc-v').forEach(function (el) {
      var m = JSON.parse(el.getAttribute('data-fx'));
      el.textContent = m[code] || m.INR;
      if (!quiet) { el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip'); }
    });
    var inr = $('.rc-ft--inr'), fx = $('.rc-ft--fx');
    if (inr) inr.hidden = code !== 'INR';
    if (fx) fx.hidden = code === 'INR';
  }
  if (sel) {
    var g = guessCur();
    if (g !== 'INR') setCur(g, true);
    sel.addEventListener('change', function () { setCur(sel.value); });
  }

  /* client quotes: one at a time, moving on every 7 seconds while the slide is open */
  var qTimer = 0, QMS = 7000;
  function quotes(s, on) {
    clearInterval(qTimer);
    var figs = $$('.qt', s), dots = $$('.qd', s);
    if (!figs.length) return;
    var show = function (i) {
      figs.forEach(function (f, k) { var on = k === i; f.classList.toggle('is-on', on); f.inert = !on; if (on) f.removeAttribute('aria-hidden'); else f.setAttribute('aria-hidden', 'true'); });
      dots.forEach(function (b, k) { b.classList.remove('is-on'); b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      var b = dots[i]; if (b) { b.style.setProperty('--qt', QMS + 'ms'); void b.offsetWidth; b.classList.add('is-on'); }
      s._q = i;
    };
    if (!on) { show(0); dots.forEach(function (b) { b.classList.remove('is-on'); }); return; }
    show(s._q || 0);
    var run = function () { clearInterval(qTimer); qTimer = setInterval(function () { show(((s._q || 0) + 1) % figs.length); }, QMS); };
    run();
    if (!s._qBound) {
      s._qBound = true;
      dots.forEach(function (b, i) { b.addEventListener('click', function () { show(i); run(); }); });
    }
  }

  /* ---------- input ---------- */
  d.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') return;
    var k = e.key;
    if ((k === ' ' || k === 'Enter') && (tag === 'BUTTON' || tag === 'A')) return;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') { e.preventDefault(); go(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(N - 1); }
    else if (k === 'f' || k === 'F') { toggleFs(); }
    else if (/^[0-9]$/.test(k)) { go(k === '0' ? 9 : +k - 1); }
  });

  function scroller() { var s = slides[cur]; return s && s.querySelector('.cvi'); }
  function canScroll(el, dir) {
    if (!el || el.scrollHeight <= el.clientHeight + 2) return false;
    return dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2;
  }
  var acc = 0, wheelLock = 0, wheelQuiet = 0;
  W.addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;
    var dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (e.deltaMode === 1) dy *= 32;
    var now = Date.now();
    if (canScroll(scroller(), dy > 0 ? 1 : -1)) { acc = 0; return; }
    clearTimeout(wheelQuiet);
    wheelQuiet = setTimeout(function () { wheelLock = 0; acc = 0; }, 220);
    if (wheelLock && now < wheelLock) return;
    acc += dy;
    if (Math.abs(acc) > 55) { go(cur + (acc > 0 ? 1 : -1)); acc = 0; wheelLock = now + 100000; }
  }, { passive: true });

  var tx = 0, ty = 0, tt = 0, tScroll = null;
  d.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { tt = 0; return; }
    var p = e.touches[0]; tx = p.clientX; ty = p.clientY; tt = Date.now();
    var el = scroller();
    tScroll = el ? { up: canScroll(el, -1), down: canScroll(el, 1) } : null;
  }, { passive: true });
  d.addEventListener('touchend', function (e) {
    if (!tt || e.changedTouches.length !== 1) return;
    var p = e.changedTouches[0], dx = p.clientX - tx, dy = p.clientY - ty;
    tt = 0;
    if (e.target.closest && e.target.closest('select, .dk-top, .dk-bot')) return;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) { go(cur + (dx < 0 ? 1 : -1)); return; }
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      if (dy < 0 && tScroll && tScroll.down) return;
      if (dy > 0 && tScroll && tScroll.up) return;
      go(cur + (dy < 0 ? 1 : -1));
    }
  }, { passive: true });

  prev.addEventListener('click', function () { go(cur - 1); });
  next.addEventListener('click', function () { go(cur + 1); });
  $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-go')); }); });

  function toggleFs() {
    try {
      if (d.fullscreenElement) d.exitFullscreen();
      else if (html.requestFullscreen) html.requestFullscreen();
    } catch (e) { /* not allowed here */ }
  }
  var fs = $('[data-act="fs"]');
  if (fs) {
    if (!html.requestFullscreen) fs.hidden = true;
    fs.addEventListener('click', toggleFs);
  }
  var pdf = $('[data-act="pdf"]');
  if (pdf) pdf.addEventListener('click', function () { W.print(); });

  /* print: every slide as a finished landscape page */
  function beforePrint() {
    printing = true;
    var st = html.style;
    st.setProperty('--s', '1'); st.setProperty('--cw', '1280'); st.setProperty('--ch', '720');
    st.setProperty('--top', '48px'); st.setProperty('--bot', '48px');
    html.classList.remove('pt', 'pt-chrome');
    slides.forEach(function (s) { s.inert = false; });
    $$('[data-type]').forEach(function (el) { el.textContent = el.getAttribute('data-type'); });
  }
  function afterPrint() {
    printing = false; layout();
    slides.forEach(function (s, i) { s.inert = i !== cur; });
  }
  W.addEventListener('beforeprint', beforePrint);
  W.addEventListener('afterprint', afterPrint);

  /* ---------- start ---------- */
  function fromHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    for (var i = 0; i < N; i++) if (slides[i].id === id) return i;
    return 0;
  }
  W.addEventListener('hashchange', function () { go(fromHash()); });
  slides.forEach(function (s) { s.inert = true; s.setAttribute('aria-hidden', 'true'); });
  var started = false;
  function start() { if (started) return; started = true; go(fromHash()); }
  if (d.fonts && d.fonts.ready) { d.fonts.ready.then(start); setTimeout(start, 900); } else start();
})();
