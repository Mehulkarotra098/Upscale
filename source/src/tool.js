/* Free Google review QR code + standee maker (/tools/google-review-qr-code).
   Everything runs in the browser: nothing typed here is sent anywhere. Uses qrcode-generator (MIT, vendored). */
(function () {
  'use strict';
  var root = document.querySelector('[data-rq]');
  if (!root || typeof window.qrcode !== 'function') return;

  var $ = function (sel) { return root.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
  var KEY = 'us-reviewqr-v1';
  var W = 1240, H = 1748; // A6 portrait at 300 dpi

  var COPY = {
    en: {
      heads: ['Loved shopping with us?', 'Enjoyed your visit?', 'Happy with our service?', 'Liked your order?'],
      sub: 'Scan to leave a Google review',
      foot: 'Takes one minute. Thank you!',
      msgs: [
        ['After a visit or purchase', 'Hi! Thank you for choosing {b}. If you have a minute, could you share your honest experience on Google? It really helps a small business like ours: {l}'],
        ['After a service or appointment', 'Hi, thank you for coming to {b} today. We would really value your feedback on Google, good or bad. It takes a minute: {l}'],
        ['One gentle reminder', 'Hi, a gentle reminder from {b}: if you get a moment, we would love your honest review on Google: {l} Thank you!'],
      ],
    },
    hi: {
      heads: ['Hamari service pasand aayi?', 'Shopping achhi lagi?', 'Aapka experience kaisa raha?', 'Order pasand aaya?'],
      sub: 'Scan karke Google review dijiye',
      foot: 'Sirf 1 minute. Dhanyavaad!',
      msgs: [
        ['Purchase ke baad', 'Namaste! {b} se shopping karne ke liye dhanyavaad. Agar 1 minute ho, toh Google par apna honest review zaroor dijiye. Isse humein bahut madad milti hai: {l}'],
        ['Service ya appointment ke baad', 'Namaste, aaj {b} aane ke liye shukriya. Google par aapka feedback humare liye bahut important hai, achha ho ya bura: {l}'],
        ['Ek gentle reminder', 'Namaste, {b} se ek chhota sa reminder: time mile toh Google par apna honest review dijiye: {l} Dhanyavaad!'],
      ],
    },
  };
  var RISKY = /(discount|cash ?back|coupon|gift|prize|reward|lucky draw|\bfree\b|\d+\s?%|\boff\b|5[\s-]?star|five[\s-]?star|only good)/i;

  var state = { link: '', name: '', lang: 'en', head: 0, custom: '', theme: 'dark', accent: '#63B849', credit: true };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved) for (var k in state) if (k in saved) state[k] = saved[k]; } catch (e) { /* storage unavailable */ }
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };

  /* ---------- review link ---------- */
  function parseLink(raw) {
    var s = (raw || '').trim();
    if (!s) return { state: 'empty' };
    if (/^ChIJ[\w-]{10,}$/.test(s)) return { state: 'ok', url: 'https://search.google.com/local/writereview?placeid=' + s, kind: 'review' };
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    var u;
    try { u = new URL(s); } catch (e) { return { state: 'bad', msg: 'That doesn’t look like a web link. Paste the full link from your Business Profile.' }; }
    var host = u.hostname.toLowerCase().replace(/^www\./, '');
    u.protocol = 'https:';
    var url = u.toString();
    if (host === 'g.page' && /\/review\/?$/.test(u.pathname)) return { state: 'ok', url: url, kind: 'review' };
    if (host === 'search.google.com' && u.pathname.indexOf('/local/writereview') === 0 && u.searchParams.get('placeid')) return { state: 'ok', url: url, kind: 'review' };
    if (host === 'g.page' || host === 'maps.app.goo.gl' || host === 'goo.gl' || host === 'g.co' || /(^|\.)google\.[a-z.]+$/.test(host))
      return { state: 'warn', url: url, kind: 'listing', msg: 'This works, but it opens your Google listing, not the review box. For one-tap reviews, use the “Ask for reviews” link from your Business Profile (steps below).' };
    return { state: 'bad', msg: 'This isn’t a Google link. Use the review link from your Google Business Profile so customers land on the review box.' };
  }

  /* ---------- QR ---------- */
  function makeQr(text) {
    var q = window.qrcode(0, 'Q');
    q.addData(text);
    q.make();
    return q;
  }
  function qrSvg(q) {
    var n = q.getModuleCount(), m = 4, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    var t = n + m * 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges"><rect width="' + t + '" height="' + t + '" fill="#fff"/><path fill="#000" d="' + d + '"/></svg>';
  }
  function drawQr(ctx, q, x, y, size) {
    var n = q.getModuleCount(), cell = size / n;
    ctx.fillStyle = '#000';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) {
      var x0 = Math.round(x + c * cell), y0 = Math.round(y + r * cell);
      ctx.fillRect(x0, y0, Math.round(x + (c + 1) * cell) - x0, Math.round(y + (r + 1) * cell) - y0);
    }
  }

  /* ---------- standee ---------- */
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function star(ctx, cx, cy, R) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? R * 0.45 : R; ctx.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a)); }
    ctx.closePath(); ctx.fill();
  }
  function wrap(ctx, text, maxW) {
    var words = text.split(/\s+/), lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }
  function fitLine(ctx, text, font, size, min, maxW) {
    for (var s = size; s >= min; s -= 2) { ctx.font = font.replace('{s}', s); if (ctx.measureText(text).width <= maxW) return s; }
    return min;
  }
  function headline() {
    var c = COPY[state.lang];
    return (state.head === 'custom' ? state.custom.trim() : c.heads[state.head]) || c.heads[0];
  }

  function drawStandee(canvas, q) {
    var ctx = canvas.getContext('2d'), c = COPY[state.lang], dark = state.theme === 'dark';
    var ink = dark ? '#FFFFFF' : '#1D1930', soft = dark ? '#E9E5F5' : '#4A4458', muted = dark ? 'rgba(233,229,245,.62)' : 'rgba(29,25,48,.55)';
    canvas.width = W; canvas.height = H;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    // background
    if (dark) { var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#2C2454'); g.addColorStop(1, '#16102C'); ctx.fillStyle = g; } else ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = state.accent; ctx.fillRect(0, 0, W, 34); ctx.fillRect(0, H - 34, W, 34);

    var maxW = W - 200;
    // measure blocks
    var name = (state.name || 'Your business name').trim().toUpperCase();
    var nameSize = fitLine(ctx, name, '700 {s}px Inter', 46, 26, maxW);
    var hs = 156, lines;
    for (; hs >= 92; hs -= 4) { ctx.font = '400 ' + hs + 'px Anton'; lines = wrap(ctx, headline().toUpperCase(), maxW); if (lines.length <= 3 && lines.every(function (l) { return ctx.measureText(l).width <= maxW; })) break; }
    // Balance the lines: shrink the wrap width while the line count stays the same, so lines come out even.
    for (var bw = maxW - 10, n = lines.length; n > 1 && bw > maxW * 0.4; bw -= 10) { var t2 = wrap(ctx, headline().toUpperCase(), bw); if (t2.length !== n || t2.some(function (l) { return ctx.measureText(l).width > bw; })) break; lines = t2; }
    var lh = hs * 1.0, subSize = fitLine(ctx, c.sub, '600 {s}px Inter', 52, 30, maxW), qrBox = 600;
    var total = nameSize + 56 + lines.length * lh + 44 + subSize + 56 + qrBox + 64 + 64 + 46 + 44;
    var y = Math.max(110, (H - 34 - (state.credit ? 70 : 20) - total) / 2 + 34);

    ctx.fillStyle = dark ? '#C9BCE8' : state.accent;
    ctx.font = '700 ' + nameSize + 'px Inter';
    if ('letterSpacing' in ctx) ctx.letterSpacing = Math.round(nameSize * 0.16) + 'px';
    y += nameSize; ctx.fillText(name, W / 2, y);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

    ctx.fillStyle = ink; ctx.font = '400 ' + hs + 'px Anton';
    y += 56;
    lines.forEach(function (l) { y += lh * 0.88; ctx.fillText(l, W / 2, y); y += lh * 0.12; });

    ctx.fillStyle = soft; ctx.font = '600 ' + subSize + 'px Inter';
    y += 44 + subSize * 0.8; ctx.fillText(c.sub, W / 2, y);

    y += 56;
    var bx = (W - qrBox) / 2;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = dark ? 0 : 30; ctx.shadowOffsetY = dark ? 0 : 10;
    ctx.fillStyle = '#FFFFFF'; rr(ctx, bx, y, qrBox, qrBox, 40); ctx.fill(); ctx.restore();
    if (!dark) { ctx.strokeStyle = 'rgba(29,25,48,.12)'; ctx.lineWidth = 3; rr(ctx, bx, y, qrBox, qrBox, 40); ctx.stroke(); }
    if (q) drawQr(ctx, q, bx + 44, y + 44, qrBox - 88);
    else {
      ctx.fillStyle = '#F1EFF7'; rr(ctx, bx + 44, y + 44, qrBox - 88, qrBox - 88, 24); ctx.fill();
      ctx.fillStyle = '#8A84A0'; ctx.font = '600 40px Inter'; ctx.fillText('Your QR code', W / 2, y + qrBox / 2 - 6); ctx.font = '500 32px Inter'; ctx.fillText('appears here', W / 2, y + qrBox / 2 + 44);
    }
    y += qrBox + 64;

    ctx.fillStyle = '#FBBC04';
    for (var i = 0; i < 5; i++) star(ctx, W / 2 + (i - 2) * 92, y + 32, 34);
    y += 64 + 46;

    ctx.fillStyle = dark ? '#C9BCE8' : '#4A4458'; ctx.font = '600 44px Inter';
    ctx.fillText(c.foot, W / 2, y + 10);

    if (state.credit) { ctx.fillStyle = muted; ctx.font = '500 26px Inter'; ctx.fillText('Made free at uscale.in/tools', W / 2, H - 70); }
  }

  /* ---------- UI ---------- */
  var linkIn = $('#rq-link'), linkMsg = $('#rq-link-msg'), nameIn = $('#rq-name'), headSel = $('#rq-head'), customIn = $('#rq-custom'),
    customWrap = $('[data-rq-custom]'), policy = $('#rq-policy'), canvas = $('#rq-canvas'), msgsBox = $('[data-rq-msgs]'),
    dlBtns = $$('[data-rq-need-link]'), testA = $('#rq-test'), live = $('#rq-live');
  var current = null, qr = null, fontsReady = false;

  function fillHeads() {
    var c = COPY[state.lang], opts = c.heads.map(function (h, i) { return '<option value="' + i + '">' + h + '</option>'; }).join('');
    headSel.innerHTML = opts + '<option value="custom">Write my own</option>';
    headSel.value = String(state.head);
  }
  function slug() { return (state.name || 'my-business').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'my-business'; }

  function render() {
    current = parseLink(state.link);
    var ok = current.state === 'ok' || current.state === 'warn';
    linkMsg.textContent = current.state === 'empty' ? '' : current.state === 'ok' ? 'Looks good. This link opens the Google review box.' : current.msg;
    linkMsg.className = 'rq-msg rq-msg--' + current.state;
    linkIn.setAttribute('aria-invalid', current.state === 'bad' ? 'true' : 'false');
    qr = ok ? makeQr(current.url) : null;
    dlBtns.forEach(function (b) { b.disabled = !ok; });
    testA.hidden = !ok; if (ok) testA.href = current.url;

    customWrap.hidden = state.head !== 'custom';
    policy.hidden = !RISKY.test((state.head === 'custom' ? state.custom : '') + ' ' + state.name);
    $$('[data-rq-accent]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-rq-accent').toLowerCase() === state.accent.toLowerCase())); });
    $('#rq-accent-custom').value = state.accent;

    if (fontsReady) drawStandee(canvas, qr);
    canvas.setAttribute('aria-label', 'Preview of your review standee: ' + (state.name || 'Your business name') + '. ' + headline() + ' ' + COPY[state.lang].sub + '.');

    var b = (state.name || '[your business]').trim(), l = ok ? current.url : '[your review link]';
    msgsBox.innerHTML = COPY[state.lang].msgs.map(function (m, i) {
      var t = m[1].replace('{b}', b).replace('{l}', l);
      return '<div class="rq-wa"><p class="rq-wa__label">' + m[0] + '</p><p class="rq-wa__text" id="rq-wa-' + i + '">' + t.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>' +
        '<div class="rq-wa__btns"><button type="button" class="btn btn--line rq-btn-sm" data-rq-copy="' + i + '">Copy</button>' +
        '<a class="btn btn--go rq-btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(t) + '"' + (ok ? '' : ' aria-disabled="true" tabindex="-1"') + '>Send on WhatsApp</a></div></div>';
    }).join('');
    save();
  }

  // Canvas PNGs carry no resolution, so print apps assume 72-96 dpi. Insert a pHYs chunk saying 300 dpi (11811 px/m).
  var CRC = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(bytes) { var c = 0xffffffff; for (var i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function withDpi(blob, dpi) {
    return blob.arrayBuffer().then(function (buf) {
      var src = new Uint8Array(buf), ppm = Math.round(dpi / 0.0254), chunk = new Uint8Array(21), dv = new DataView(chunk.buffer);
      dv.setUint32(0, 9); chunk.set([112, 72, 89, 115], 4); dv.setUint32(8, ppm); dv.setUint32(12, ppm); chunk[16] = 1;
      dv.setUint32(17, crc32(chunk.subarray(4, 17)));
      var at = 8 + 25; // PNG signature + IHDR chunk
      var out = new Uint8Array(src.length + 21); out.set(src.subarray(0, at)); out.set(chunk, at); out.set(src.subarray(at), at + 21);
      return new Blob([out], { type: 'image/png' });
    }).catch(function () { return blob; });
  }
  function download(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function say(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }

  linkIn.value = state.link; nameIn.value = state.name; customIn.value = state.custom;
  $$('input[name="rq-lang"]').forEach(function (r) { r.checked = r.value === state.lang; });
  $$('input[name="rq-theme"]').forEach(function (r) { r.checked = r.value === state.theme; });
  $('#rq-credit').checked = state.credit;
  fillHeads();

  linkIn.addEventListener('input', function () { state.link = linkIn.value; render(); });
  nameIn.addEventListener('input', function () { state.name = nameIn.value; render(); });
  customIn.addEventListener('input', function () { state.custom = customIn.value; render(); });
  headSel.addEventListener('change', function () { state.head = headSel.value === 'custom' ? 'custom' : +headSel.value; render(); if (state.head === 'custom') customIn.focus(); });
  $$('input[name="rq-lang"]').forEach(function (r) { r.addEventListener('change', function () { state.lang = r.value; if (state.head !== 'custom') state.head = 0; fillHeads(); render(); }); });
  $$('input[name="rq-theme"]').forEach(function (r) { r.addEventListener('change', function () { state.theme = r.value; render(); }); });
  $$('[data-rq-accent]').forEach(function (b) { b.addEventListener('click', function () { state.accent = b.getAttribute('data-rq-accent'); render(); }); });
  $('#rq-accent-custom').addEventListener('input', function (e) { state.accent = e.target.value; render(); });
  $('#rq-credit').addEventListener('change', function (e) { state.credit = e.target.checked; render(); });

  root.addEventListener('click', function (e) {
    var c = e.target.closest('[data-rq-copy]');
    if (c) {
      var t = document.getElementById('rq-wa-' + c.getAttribute('data-rq-copy')).textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { c.textContent = 'Copied'; say('Message copied'); setTimeout(function () { c.textContent = 'Copy'; }, 1600); }, function () { say('Select the message text and copy it'); });
      return;
    }
    var a = e.target.closest('a[aria-disabled="true"]');
    if (a) { e.preventDefault(); linkIn.focus(); say('Paste your review link first'); }
  });

  $('#rq-dl-standee').addEventListener('click', function () {
    if (!qr) return;
    var cv = document.createElement('canvas'); drawStandee(cv, qr);
    cv.toBlob(function (b) { withDpi(b, 300).then(function (b2) { download(b2, 'google-review-standee-' + slug() + '.png'); say('Standee downloaded'); }); }, 'image/png');
  });
  $('#rq-dl-png').addEventListener('click', function () {
    if (!qr) return;
    var n = qr.getModuleCount() + 8, px = Math.ceil(1200 / n), cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    cv.width = cv.height = n * px; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); drawQr(ctx, qr, 4 * px, 4 * px, (n - 8) * px);
    cv.toBlob(function (b) { download(b, 'google-review-qr-' + slug() + '.png'); say('QR code downloaded'); }, 'image/png');
  });
  $('#rq-dl-svg').addEventListener('click', function () {
    if (!qr) return;
    download(new Blob([qrSvg(qr)], { type: 'image/svg+xml' }), 'google-review-qr-' + slug() + '.svg'); say('QR code downloaded');
  });
  $('#rq-print').addEventListener('click', function () {
    if (!qr) return;
    var cv = document.createElement('canvas'); drawStandee(cv, qr);
    var src = cv.toDataURL('image/png'), sheet = document.getElementById('rq-print-sheet');
    sheet.innerHTML = [0, 1, 2, 3].map(function () { return '<img src="' + src + '" alt="">'; }).join('');
    var imgs = sheet.querySelectorAll('img'), left = imgs.length;
    imgs.forEach(function (im) { if (im.complete) left--; else im.onload = function () { if (--left === 0) window.print(); }; });
    if (left === 0) window.print();
  });

  var loads = ['400 100px Anton', '700 40px Inter', '600 40px Inter', '500 30px Inter'].map(function (f) { return document.fonts ? document.fonts.load(f) : Promise.resolve(); });
  Promise.all(loads).catch(function () {}).then(function () { fontsReady = true; render(); });
  render();
})();
