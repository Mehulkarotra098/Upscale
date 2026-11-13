/* Free Google review link, QR code + standee maker (/tools/google-review-qr-code).
   Runs in the browser. The only network call is for short Google Maps share links (maps.app.goo.gl/…), which
   /api/blog?view=maplink expands to find the business; nothing is stored. Uses qrcode-generator (MIT, vendored). */
(function () {
  'use strict';
  var root = document.querySelector('[data-rq]');
  if (!root || typeof window.qrcode !== 'function') return;

  var $ = function (sel) { return root.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
  var KEY = 'us-reviewqr-v2';

  var FORMATS = {
    a6: { w: 1240, h: 1748, name: 'standee', cap: 'A6 counter standee (10.5 × 14.8 cm), print-ready at 300 dpi', print: { cols: 2, rows: 2, wmm: 105, hmm: 148 } },
    square: { w: 1200, h: 1200, name: 'sticker', cap: 'Square table sticker (9 × 9 cm), print-ready', print: { cols: 2, rows: 3, wmm: 90, hmm: 90 } },
    story: { w: 1080, h: 1920, name: 'status', cap: 'WhatsApp Status and Instagram Story (1080 × 1920)', print: null },
    a5: { w: 1748, h: 2480, name: 'poster', cap: 'A5 wall poster (14.8 × 21 cm), print-ready at 300 dpi', print: { cols: 1, rows: 1, wmm: 148, hmm: 210 } },
  };
  var THEMES = {
    midnight: { bg: ['#2C2454', '#16102C'], acc: '#7BD35A', dark: true },
    sunset: { bg: ['#FF6B3D', '#C81E63'], acc: '#FFE08A', dark: true },
    ocean: { bg: ['#1652D8', '#0B7F86'], acc: '#FFE066', dark: true },
    forest: { bg: ['#17663A', '#0A3520'], acc: '#B5F05A', dark: true },
    royal: { bg: ['#5B21B6', '#9D1279'], acc: '#FFC857', dark: true },
    charcoal: { bg: ['#262B36', '#0D1016'], acc: '#F5B700', dark: true },
    paper: { bg: ['#FFFFFF', '#F5F0E6'], acc: '#B3123E', dark: false },
    mint: { bg: ['#F4FCF7', '#D9F3E3'], acc: '#157A3B', dark: false },
    blush: { bg: ['#FFF7F9', '#FBDDE6'], acc: '#B4235A', dark: false },
    sky: { bg: ['#F4F8FF', '#D8E6FF'], acc: '#1D4ED8', dark: false },
  };
  var TEMPLATES = ['classic', 'split', 'card', 'festive', 'minimal', 'bold'];

  var COPY = {
    en: {
      heads: ['Loved shopping with us?', 'Enjoyed your visit?', 'Happy with our service?', 'Liked your order?', 'Review us on Google'],
      sub: 'Scan to leave a Google review',
      scan: 'Scan me',
      foot: 'Takes one minute. Thank you!',
      msgs: [
        ['After a visit or purchase', 'Hi! Thank you for choosing {b}. If you have a minute, could you share your honest experience on Google? It really helps a small business like ours: {l}'],
        ['After a service or appointment', 'Hi, thank you for coming to {b} today. We would really value your feedback on Google, good or bad. It takes a minute: {l}'],
        ['One gentle reminder', 'Hi, a gentle reminder from {b}. If you get a moment, we would love your honest review on Google: {l} Thank you!'],
      ],
    },
    hi: {
      heads: ['Hamari service pasand aayi?', 'Shopping achhi lagi?', 'Aapka experience kaisa raha?', 'Order pasand aaya?', 'Google par review dijiye'],
      sub: 'Scan karke Google review dijiye',
      scan: 'Scan kijiye',
      foot: 'Sirf 1 minute. Dhanyavaad!',
      msgs: [
        ['Purchase ke baad', 'Namaste! {b} se shopping karne ke liye dhanyavaad. Agar 1 minute ho, toh Google par apna honest review zaroor dijiye. Isse humein bahut madad milti hai: {l}'],
        ['Service ya appointment ke baad', 'Namaste, aaj {b} aane ke liye shukriya. Google par aapka feedback humare liye bahut important hai, achha ho ya bura: {l}'],
        ['Ek gentle reminder', 'Namaste, {b} se ek chhota sa reminder. Time mile toh Google par apna honest review dijiye: {l} Dhanyavaad!'],
      ],
    },
    dv: {
      heads: ['हमारी सेवा पसंद आई?', 'खरीदारी अच्छी लगी?', 'आपका अनुभव कैसा रहा?', 'ऑर्डर पसंद आया?', 'Google पर रिव्यू दीजिए'],
      sub: 'स्कैन करके Google रिव्यू दीजिए',
      scan: 'स्कैन कीजिए',
      foot: 'सिर्फ़ 1 मिनट। धन्यवाद!',
      msgs: [
        ['खरीदारी के बाद', 'नमस्ते! {b} से खरीदारी करने के लिए धन्यवाद। अगर 1 मिनट हो, तो Google पर अपना ईमानदार रिव्यू ज़रूर दीजिए। इससे हमें बहुत मदद मिलती है: {l}'],
        ['सर्विस या अपॉइंटमेंट के बाद', 'नमस्ते, आज {b} आने के लिए शुक्रिया। Google पर आपकी राय हमारे लिए बहुत ज़रूरी है, अच्छी हो या बुरी: {l}'],
        ['एक छोटा सा रिमाइंडर', 'नमस्ते, {b} की ओर से एक छोटा सा रिमाइंडर। समय मिले तो Google पर अपना ईमानदार रिव्यू दीजिए: {l} धन्यवाद!'],
      ],
    },
    mr: {
      heads: ['आमची सेवा आवडली?', 'खरेदी आवडली?', 'तुमचा अनुभव कसा होता?', 'ऑर्डर आवडली?', 'Google वर रिव्ह्यू द्या'],
      sub: 'स्कॅन करून Google रिव्ह्यू द्या',
      scan: 'स्कॅन करा',
      foot: 'फक्त 1 मिनिट. धन्यवाद!',
      msgs: [
        ['खरेदीनंतर', 'नमस्कार! {b} मधून खरेदी केल्याबद्दल धन्यवाद. एक मिनिट वेळ असेल तर Google वर तुमचा प्रामाणिक रिव्ह्यू नक्की द्या. याची आम्हाला खूप मदत होते: {l}'],
        ['सेवा किंवा अपॉइंटमेंटनंतर', 'नमस्कार, आज {b} ला भेट दिल्याबद्दल धन्यवाद. Google वरील तुमचा अभिप्राय आमच्यासाठी खूप महत्त्वाचा आहे, चांगला असो वा वाईट: {l}'],
        ['एक छोटी आठवण', 'नमस्कार, {b} कडून एक छोटी आठवण. वेळ मिळाल्यास Google वर तुमचा प्रामाणिक रिव्ह्यू द्या: {l} धन्यवाद!'],
      ],
    },
  };
  var DEVA = /[\u0900-\u097F]/;
  var RISKY = /(discount|cash ?back|coupon|gift|prize|reward|lucky draw|\bfree\b|\d+\s?%|\boff\b|5[\s-]?star|five[\s-]?star|only good)/i;

  var state = { link: '', name: '', nameAuto: false, lang: 'en', head: 0, custom: '', template: 'classic', theme: 'midnight', accent: '', format: 'a6', credit: true };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved) for (var k in state) if (k in saved) state[k] = saved[k]; } catch (e) { /* storage unavailable */ }
  if (!THEMES[state.theme]) state.theme = 'midnight';
  if (!COPY[state.lang]) state.lang = 'en';
  if (TEMPLATES.indexOf(state.template) < 0) state.template = 'classic';
  if (!FORMATS[state.format]) state.format = 'a6';
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };
  /* ?link=… (e.g. from the Google profile checker) pre-fills step 1 */
  try { var qlink = new URLSearchParams(location.search).get('link'); if (qlink && qlink.length < 600) { state.link = qlink; history.replaceState(null, '', location.pathname + location.hash); } } catch (e) { /* ignore */ }
  var logo = null; // HTMLImageElement, session only

  /* ---------- review link ---------- */
  var FID = /0x[0-9a-f]{1,16}:0x[0-9a-f]{1,16}/i;
  function placeIdFromFeature(fid) {
    if (typeof BigInt !== 'function') return null;
    var p = fid.toLowerCase().split(':'), b = new Uint8Array(20), dv = new DataView(b.buffer);
    b.set([0x0a, 0x12, 0x09], 0); dv.setBigUint64(3, BigInt(p[0]), true); b[11] = 0x11; dv.setBigUint64(12, BigInt(p[1]), true);
    var s = ''; for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function placeName(url) {
    var m = String(url).match(/\/maps\/place\/([^/@?#]+)/);
    if (!m) return '';
    try { return decodeURIComponent(m[1].replace(/\+/g, ' ')).trim(); } catch (e) { return m[1].replace(/\+/g, ' '); }
  }
  var writeReview = function (pid) { return 'https://search.google.com/local/writereview?placeid=' + encodeURIComponent(pid); };
  var resolved = {}; // short link -> {url,name} | 'fail' | 'busy'

  function parseLink(raw) {
    var s = (raw || '').trim();
    if (!s) return { state: 'empty' };
    if (/^ChIJ[\w-]{10,}$/.test(s)) return { state: 'ok', url: writeReview(s) };
    var dec = s; try { dec = decodeURIComponent(s); } catch (e) { /* keep */ }
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    var u;
    try { u = new URL(s); } catch (e) { return { state: 'bad', msg: 'That doesn’t look like a link. Copy the link from Google Maps (steps below) and paste it here.' }; }
    var host = u.hostname.toLowerCase().replace(/^www\./, '');
    u.protocol = 'https:';
    if (host === 'g.page' && /\/review\/?$/.test(u.pathname)) return { state: 'ok', url: u.toString() };
    if (host === 'search.google.com' && u.pathname.indexOf('/local/writereview') === 0 && u.searchParams.get('placeid')) return { state: 'ok', url: u.toString() };
    var fid = (s.match(FID) || dec.match(FID) || [])[0];
    if (fid && /(^|\.)google\.[a-z.]+$/.test(host)) { var pid = placeIdFromFeature(fid); if (pid) return { state: 'ok', url: writeReview(pid), name: placeName(dec) }; }
    var short = host === 'maps.app.goo.gl' || (host === 'goo.gl' && u.pathname.indexOf('/maps') === 0) || host === 'g.co' || host === 'share.google' || host === 'g.page';
    if (short) {
      var r = resolved[u.toString()];
      if (r && r !== 'busy' && r !== 'fail') return { state: 'ok', url: r.url, name: r.name };
      if (r === 'fail') return { state: 'warn', url: u.toString(), msg: 'We couldn’t find the review box from this link, so the QR will open your Google listing instead. Try copying the link again from Google Maps, or use the owner steps below.' };
      return { state: 'resolve', key: u.toString() };
    }
    if (/(^|\.)google\.[a-z.]+$/.test(host)) return { state: 'warn', url: u.toString(), msg: 'This opens your Google listing, not the review box. Open your business in Google Maps and use Share → Copy link instead (steps below).' };
    return { state: 'bad', msg: 'This isn’t a Google link. Copy your business link from Google Maps (steps below) and paste it here.' };
  }
  function resolveShort(key) {
    if (resolved[key]) return;
    resolved[key] = 'busy';
    fetch('/api/blog?view=maplink&u=' + encodeURIComponent(key))
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (j) { resolved[key] = { url: j.review, name: j.name || '' }; }, function () { resolved[key] = 'fail'; })
      .then(render);
  }

  /* ---------- colour helpers ---------- */
  function hex(c) { c = c.replace('#', ''); if (c.length === 3) c = c.replace(/./g, '$&$&'); var n = parseInt(c, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(c, t, a) { var x = hex(c), y = hex(t); return '#' + x.map(function (v, i) { return ('0' + Math.round(v + (y[i] - v) * a).toString(16)).slice(-2); }).join(''); }
  function lum(c) { var x = hex(c).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * x[0] + 0.7152 * x[1] + 0.0722 * x[2]; }
  function contrast(a, b) { var l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
  /* accent readable on a background: nudge lighter/darker until 3:1 */
  function readable(acc, bg) { var c = acc, i = 0, dark = lum(bg) < 0.3; while (contrast(c, bg) < 3 && i++ < 10) c = mix(c, dark ? '#ffffff' : '#000000', 0.18); return c; }

  /* ---------- drawing ---------- */
  function makeQr(text) { var q = window.qrcode(0, 'Q'); q.addData(text); q.make(); return q; }
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
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function star(ctx, cx, cy, R) { ctx.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? R * 0.45 : R; ctx.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a)); } ctx.closePath(); ctx.fill(); }
  function wrap(ctx, text, maxW) {
    var words = text.split(/\s+/), lines = [], line = '';
    for (var i = 0; i < words.length; i++) { var t = line ? line + ' ' + words[i] : words[i]; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; } else line = t; }
    if (line) lines.push(line);
    return lines;
  }
  /* fit text into ≤maxLines balanced lines, largest size first */
  function fitLines(ctx, text, font, size, min, maxW, maxLines) {
    var lines;
    for (var s = size; s >= min; s -= 2) {
      ctx.font = font.replace('{s}', s); lines = wrap(ctx, text, maxW);
      if (lines.length <= maxLines && lines.every(function (l) { return ctx.measureText(l).width <= maxW; })) break;
    }
    for (var bw = maxW - 8, n = lines.length; n > 1 && bw > maxW * 0.45; bw -= 8) { var t2 = wrap(ctx, text, bw); if (t2.length !== n || t2.some(function (l) { return ctx.measureText(l).width > bw; })) break; lines = t2; }
    return { lines: lines, size: s };
  }
  function spaced(ctx, px, text) { if ('letterSpacing' in ctx) ctx.letterSpacing = (text && DEVA.test(text) ? 0 : px) + 'px'; }
  function headline() { var c = COPY[state.lang]; return (state.head === 'custom' ? state.custom.trim() : c.heads[state.head]) || c.heads[0]; }

  /* vertical stack: blocks are {h:function(k), draw:function(y,k)}; shrinks k until it fits [top,bottom] */
  function stack(blocks, top, bottom) {
    var k = state.format === 'story' ? 1.3 : 1, total = 0;
    for (; k > 0.45; k -= 0.03) { total = blocks.reduce(function (a, b) { return a + b.h(k); }, 0); if (total <= bottom - top) break; }
    var y = top + Math.max(0, (bottom - top - total) / 2);
    blocks.forEach(function (b) { var h = b.h(k); b.draw(y, k); y += h; });
    return k;
  }

  function paint(canvas, q, opt) {
    opt = opt || {};
    var F = FORMATS[state.format], W = F.w, H = F.h, sc = opt.scale || 1;
    var tpl = opt.template || state.template, th = THEMES[opt.theme || state.theme];
    canvas.width = Math.round(W * sc); canvas.height = Math.round(H * sc);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(sc, 0, 0, sc, 0, 0);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    var u = Math.min(W / 1240, H / 1748) * (state.format === 'square' ? 1.18 : 1); // base unit
    var c = COPY[state.lang], head = headline(), name = (state.name || 'Your business name').trim();
    var acc0 = state.accent || th.acc;
    var P = { ctx: ctx, W: W, H: H, u: u, q: q, c: c, head: head, name: name, th: th, acc0: acc0 };
    ({ classic: tClassic, split: tSplit, card: tCard, festive: tFestive, minimal: tMinimal, bold: tBold }[tpl] || tClassic)(P);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  function fillBg(P, c1, c2) { var g = P.ctx.createLinearGradient(0, 0, P.W, P.H); g.addColorStop(0, c1); g.addColorStop(1, c2); P.ctx.fillStyle = g; P.ctx.fillRect(0, 0, P.W, P.H); }
  function credit(P, color, align, x, fromBottom) {
    if (!state.credit) return;
    var ctx = P.ctx; ctx.save(); ctx.fillStyle = color; ctx.font = '500 ' + Math.round(26 * P.u) + 'px Inter,USDeva'; ctx.textAlign = align || 'center';
    ctx.fillText('Made with uscale.in/tools', x == null ? P.W / 2 : x, P.H - (fromBottom || 58) * P.u); ctx.restore();
  }
  /* reusable blocks */
  function bLogo(P, x, align) {
    return { h: function (k) { return logo ? (130 * P.u * k + 34 * P.u * k) : 0; }, draw: function (y, k) {
      if (!logo) return; var ctx = P.ctx, mh = 130 * P.u * k, mw = P.W * 0.36, r = Math.min(mw / logo.width, mh / logo.height), w = logo.width * r, h = logo.height * r, pad = 18 * P.u * k;
      var bx = align === 'left' ? x - 0 : x - w / 2 - pad;
      ctx.save(); ctx.fillStyle = '#fff'; rr(ctx, bx, y - pad + 6 * P.u, w + pad * 2, h + pad * 2 - 12 * P.u, 18 * P.u * k); ctx.fill(); ctx.restore();
      ctx.drawImage(logo, bx + pad, y + 6 * P.u * k, w, h - 12 * P.u * k);
    } };
  }
  function bName(P, color, x, align, scale) {
    var ctx = P.ctx;
    return { h: function (k) { return (46 * (scale || 1)) * P.u * k + 40 * P.u * k; }, draw: function (y, k) {
      var size = 46 * (scale || 1) * P.u * k, txt = P.name.toUpperCase(), maxW = P.W * (align === 'left' ? 0.8 : 0.84);
      ctx.save(); ctx.fillStyle = color; ctx.textAlign = align || 'center'; spaced(ctx, Math.round(size * 0.16), txt);
      for (; size > 20 * P.u; size -= 2) { ctx.font = '700 ' + size + 'px Inter,USDeva'; if (ctx.measureText(txt).width <= maxW) break; }
      ctx.fillText(txt, x, y + size); ctx.restore();
    } };
  }
  function bHead(P, color, x, align, o) {
    o = o || {}; var ctx = P.ctx, cache = {};
    var get = function (k) { if (!cache[k]) cache[k] = fitLines(ctx, (o.upper === false ? P.head : P.head.toUpperCase()), (o.font || '400 {s}px Anton,USDevaHead'), Math.round((o.size || 156) * P.u * k), Math.round((o.min || 84) * P.u * k), o.maxW || P.W * 0.84, o.maxLines || 3); return cache[k]; };
    var deva = DEVA.test(P.head), lh = (o.lh || 1) * (deva ? 1.24 : 1), top = deva ? 1.04 : 0.88;
    return { h: function (k) { var f = get(k); return f.lines.length * f.size * lh + (deva ? f.size * 0.1 : 0) + (o.after || 44) * P.u * k; }, draw: function (y, k) {
      var f = get(k); ctx.save(); ctx.fillStyle = color; ctx.textAlign = align || 'center'; ctx.font = (o.font || '400 {s}px Anton,USDevaHead').replace('{s}', f.size);
      f.lines.forEach(function (l, i) { ctx.fillText(l, x, y + f.size * (top + i * lh)); }); ctx.restore();
    } };
  }
  function bText(P, text, color, size, weight, x, align, after) {
    var ctx = P.ctx;
    return { h: function (k) { return size * P.u * k + (after == null ? 52 : after) * P.u * k; }, draw: function (y, k) {
      var s = size * P.u * k; ctx.save(); ctx.fillStyle = color; ctx.textAlign = align || 'center';
      for (; s > 20 * P.u; s -= 1) { ctx.font = (weight || 600) + ' ' + s + 'px Inter,USDeva'; if (ctx.measureText(text).width <= P.W * 0.86) break; }
      ctx.fillText(text, x, y + s * 0.82); ctx.restore();
    } };
  }
  function qrCard(P, x, y, box, o) {
    o = o || {}; var ctx = P.ctx, pad = box * (o.plain ? 0.03 : 0.075);
    if (!o.plain) {
      ctx.save(); if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,.22)'; ctx.shadowBlur = 40 * P.u; ctx.shadowOffsetY = 14 * P.u; }
      ctx.fillStyle = '#FFFFFF'; rr(ctx, x, y, box, box, box * 0.07); ctx.fill(); ctx.restore();
      if (o.border) { ctx.strokeStyle = o.border; ctx.lineWidth = 3 * P.u; rr(ctx, x, y, box, box, box * 0.07); ctx.stroke(); }
    }
    if (P.q) drawQr(ctx, P.q, x + pad, y + pad, box - pad * 2);
    else {
      ctx.fillStyle = '#EFEDF5'; rr(ctx, x + pad, y + pad, box - pad * 2, box - pad * 2, box * 0.04); ctx.fill();
      ctx.save(); ctx.fillStyle = '#8A84A0'; ctx.textAlign = 'center'; ctx.font = '600 ' + Math.round(box * 0.066) + 'px Inter,USDeva'; ctx.fillText('Your QR code', x + box / 2, y + box / 2 - box * 0.01);
      ctx.font = '500 ' + Math.round(box * 0.052) + 'px Inter,USDeva'; ctx.fillText('appears here', x + box / 2, y + box / 2 + box * 0.075); ctx.restore();
    }
  }
  function bQr(P, box, o) { return { h: function (k) { return box * k + 60 * P.u * k; }, draw: function (y, k) { qrCard(P, (P.W - box * k) / 2, y, box * k, o); } }; }
  function bStars(P, color, x, align, R) {
    R = R || 34;
    return { h: function (k) { return 70 * P.u * k + 40 * P.u * k; }, draw: function (y, k) {
      var ctx = P.ctx, r = R * P.u * k, gap = 92 * P.u * k * (R / 34), x0 = align === 'left' ? x + r : x - 2 * gap;
      ctx.fillStyle = color; for (var i = 0; i < 5; i++) star(ctx, x0 + i * gap, y + 34 * P.u * k, r);
    } };
  }

  /* ---------- templates ---------- */
  function tClassic(P) {
    var th = P.th, dark = th.dark, ctx = P.ctx, acc = readable(P.acc0, th.bg[1]);
    fillBg(P, th.bg[0], th.bg[1]);
    ctx.fillStyle = P.acc0; ctx.fillRect(0, 0, P.W, 34 * P.u); ctx.fillRect(0, P.H - 34 * P.u, P.W, 34 * P.u);
    var ink = dark ? '#FFFFFF' : '#1D1930', soft = dark ? 'rgba(255,255,255,.88)' : '#4A4458';
    stack([bLogo(P, P.W / 2), bName(P, acc, P.W / 2), bHead(P, ink, P.W / 2), bText(P, P.c.sub, soft, 52, 600, P.W / 2), bQr(P, 600 * P.u, { shadow: !dark, border: dark ? null : 'rgba(29,25,48,.12)' }),
      bStars(P, '#FBBC04', P.W / 2), bText(P, P.c.foot, soft, 44, 600, P.W / 2, 'center', 0)], 110 * P.u, P.H - (state.credit ? 130 : 90) * P.u);
    credit(P, dark ? 'rgba(255,255,255,.6)' : 'rgba(29,25,48,.5)');
  }
  function tSplit(P) {
    var th = P.th, ctx = P.ctx, W = P.W, H = P.H, u = P.u;
    var top1 = th.dark ? th.bg[0] : P.acc0, top2 = th.dark ? th.bg[1] : mix(P.acc0, '#000000', 0.35);
    var box = Math.min(W * (H / W > 1.6 ? 0.62 : 0.48), H * 0.36), splitY = H * (H / W > 1.6 ? 0.47 : 0.5);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, 0, W, splitY); g.addColorStop(0, top1); g.addColorStop(1, top2); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, splitY - 40 * u); ctx.quadraticCurveTo(W / 2, splitY + 40 * u, 0, splitY - 40 * u); ctx.closePath(); ctx.fill();
    var acc = th.dark ? readable(P.acc0, top2) : '#FFFFFF';
    var cardTop = splitY - box * 0.42;
    stack([bLogo(P, W / 2), bName(P, acc, W / 2), bHead(P, '#FFFFFF', W / 2, 'center', { size: 140, maxLines: 3, after: 30 }), bText(P, P.c.sub, 'rgba(255,255,255,.9)', 46, 600, W / 2, 'center', 0)], 80 * u, cardTop - 40 * u);
    qrCard(P, (W - box) / 2, cardTop, box, { shadow: true });
    var ink = '#1D1930';
    stack([bStars(P, '#FBBC04', W / 2), bText(P, P.c.foot, ink, 44, 700, W / 2, 'center', 0)], cardTop + box + 30 * u, H - (state.credit ? 110 : 60) * u);
    credit(P, 'rgba(29,25,48,.5)');
  }
  function tCard(P) {
    var th = P.th, ctx = P.ctx, W = P.W, H = P.H, u = P.u, dark = th.dark;
    fillBg(P, th.bg[0], th.bg[1]);
    ctx.save(); ctx.globalAlpha = dark ? 0.08 : 0.06; ctx.fillStyle = dark ? '#FFFFFF' : P.acc0;
    for (var yy = 40 * u; yy < H; yy += 56 * u) for (var xx = 40 * u; xx < W; xx += 56 * u) { ctx.beginPath(); ctx.arc(xx, yy, 4 * u, 0, 7); ctx.fill(); }
    ctx.restore();
    var ink = dark ? '#FFFFFF' : '#1D1930', acc = readable(P.acc0, th.bg[1]);
    var cardW = W * 0.8, box = Math.min(W * 0.5, H * 0.33);
    var card = { h: function (k) { return (box + 290 * u) * k; }, draw: function (y, k) {
      var cw = cardW, ch = (box + 250 * u) * k, cx = (W - cw) / 2;
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 50 * u; ctx.shadowOffsetY = 18 * u; ctx.fillStyle = '#FFFFFF'; rr(ctx, cx, y, cw, ch, 44 * u); ctx.fill(); ctx.restore();
      ctx.fillStyle = P.acc0; rr(ctx, cx, y, cw, 16 * u, 8 * u); ctx.fill();
      ctx.save(); ctx.fillStyle = '#1D1930'; ctx.font = '700 ' + Math.round(42 * u * k) + 'px Inter,USDeva'; ctx.textAlign = 'center'; ctx.fillText(P.c.sub, W / 2, y + 88 * u * k); ctx.restore();
      qrCard(P, (W - box * k) / 2, y + 118 * u * k, box * k, { plain: true });
      var sy = y + 118 * u * k + box * k + 50 * u * k; ctx.fillStyle = '#FBBC04';
      for (var i = 0; i < 5; i++) star(ctx, W / 2 + (i - 2) * 70 * u * k, sy, 26 * u * k);
    } };
    stack([bLogo(P, W / 2), bName(P, acc, W / 2), bHead(P, ink, W / 2, 'center', { size: 140, after: 50 }), card, bText(P, P.c.foot, dark ? 'rgba(255,255,255,.9)' : '#4A4458', 42, 600, W / 2, 'center', 0)], 90 * u, H - (state.credit ? 120 : 70) * u);
    credit(P, dark ? 'rgba(255,255,255,.6)' : 'rgba(29,25,48,.5)');
  }
  function tFestive(P) {
    var th = P.th, ctx = P.ctx, W = P.W, H = P.H, u = P.u, dark = th.dark;
    fillBg(P, th.bg[0], th.bg[1]);
    var acc = P.acc0, m = 46 * u, m2 = 92 * u;
    ctx.save(); ctx.strokeStyle = acc; ctx.lineWidth = 5 * u; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m); ctx.lineWidth = 2 * u; ctx.strokeRect(m2, m2, W - 2 * m2, H - 2 * m2);
    ctx.fillStyle = acc; var mid = (m + m2) / 2, step = 38 * u;
    var dia = function (x, y, s) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y); ctx.closePath(); ctx.fill(); };
    for (var x = m2 + step; x < W - m2 - step / 2; x += step) { dia(x, mid, 7 * u); dia(x, H - mid, 7 * u); }
    for (var y = m2 + step; y < H - m2 - step / 2; y += step) { dia(mid, y, 7 * u); dia(W - mid, y, 7 * u); }
    [[mid, mid], [W - mid, mid], [mid, H - mid], [W - mid, H - mid]].forEach(function (p) {
      ctx.save(); ctx.translate(p[0], p[1]);
      for (var i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.ellipse(0, -22 * u, 9 * u, 20 * u, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = dark ? th.bg[0] : '#FFFFFF'; ctx.beginPath(); ctx.arc(0, 0, 13 * u, 0, 7); ctx.fill(); ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(0, 0, 7 * u, 0, 7); ctx.fill();
      ctx.restore();
    });
    ctx.restore();
    var ink = dark ? '#FFFFFF' : '#1D1930', soft = dark ? 'rgba(255,255,255,.9)' : '#4A4458', nameC = readable(acc, th.bg[1]);
    stack([bLogo(P, W / 2), bName(P, nameC, W / 2, 'center', 0.92), bHead(P, ink, W / 2, 'center', { size: 140, maxW: W * 0.74 }), bText(P, P.c.sub, soft, 48, 600, W / 2), bQr(P, 560 * u, { shadow: !dark, border: dark ? null : 'rgba(29,25,48,.12)' }),
      bStars(P, '#FBBC04', W / 2), bText(P, P.c.foot, soft, 42, 600, W / 2, 'center', 0)], m2 + 60 * u, H - m2 - (state.credit ? 70 : 40) * u);
    if (state.credit) { ctx.save(); ctx.fillStyle = dark ? 'rgba(255,255,255,.6)' : 'rgba(29,25,48,.5)'; ctx.font = '500 ' + Math.round(24 * u) + 'px Inter,USDeva'; ctx.textAlign = 'center'; ctx.fillText('Made with uscale.in/tools', W / 2, H - m2 - 26 * u); ctx.restore(); }
  }
  function tMinimal(P) {
    var ctx = P.ctx, W = P.W, H = P.H, u = P.u, acc = readable(P.acc0, '#FFFFFF');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = acc; ctx.lineWidth = 6 * u; rr(ctx, 54 * u, 54 * u, W - 108 * u, H - 108 * u, 36 * u); ctx.stroke();
    var ink = '#17141F', muted = '#5E5872';
    var rule = { h: function (k) { return 50 * u * k; }, draw: function (y, k) { ctx.fillStyle = acc; ctx.fillRect(W / 2 - 40 * u * k, y + 6 * u * k, 80 * u * k, 6 * u * k); } };
    stack([bLogo(P, W / 2), bName(P, acc, W / 2, 'center', 0.8), bHead(P, ink, W / 2, 'center', { font: '800 {s}px Inter,USDeva', upper: false, size: 104, min: 60, lh: 1.12, maxW: W * 0.76, after: 30 }), rule, bText(P, P.c.sub, muted, 44, 500, W / 2),
      bQr(P, 560 * u, { border: 'rgba(23,20,31,.14)' }), bStars(P, acc, W / 2, 'center', 30), bText(P, P.c.foot, muted, 40, 500, W / 2, 'center', 0)], 130 * u, H - (state.credit ? 170 : 120) * u);
    credit(P, 'rgba(23,20,31,.45)', 'center', null, 92);
  }
  function tBold(P) {
    var th = P.th, ctx = P.ctx, W = P.W, H = P.H, u = P.u;
    var c1 = th.dark ? th.bg[0] : P.acc0, c2 = th.dark ? th.bg[1] : mix(P.acc0, '#000000', 0.45);
    fillBg(P, c1, c2);
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(W * 0.95, H * 0.06, W * 0.42, 0, 7); ctx.fill(); ctx.globalAlpha = 0.07; ctx.beginPath(); ctx.arc(W * 0.05, H * 0.98, W * 0.5, 0, 7); ctx.fill(); ctx.restore();
    var L = W * 0.09, acc = th.dark ? readable(P.acc0, c2) : '#FFFFFF';
    var box = Math.min(W * 0.44, H * 0.34), qy = H - box - (state.credit ? 150 : 110) * u;
    stack([bLogo(P, L, 'left'), bName(P, acc, L, 'left'), bHead(P, '#FFFFFF', L, 'left', { size: 200, min: 90, maxW: W * 0.82, maxLines: 4, after: 34 }), bText(P, P.c.sub, 'rgba(255,255,255,.92)', 48, 600, L, 'left', 0)], 110 * u, qy - 60 * u);
    qrCard(P, L, qy, box, { shadow: true });
    var rx = L + box + 46 * u, ctxs = ctx;
    ctxs.save(); ctxs.textAlign = 'left'; ctxs.fillStyle = acc; ctxs.font = '400 ' + Math.round(84 * u) + 'px Anton,USDevaHead'; ctxs.fillText(P.c.scan.toUpperCase(), rx, qy + box * 0.36);
    ctxs.strokeStyle = acc; ctxs.lineWidth = 7 * u; ctxs.lineCap = 'round'; ctxs.beginPath(); var ay = qy + box * 0.48; ctxs.moveTo(rx + 120 * u, ay); ctxs.lineTo(rx, ay); ctxs.moveTo(rx + 26 * u, ay - 24 * u); ctxs.lineTo(rx, ay); ctxs.lineTo(rx + 26 * u, ay + 24 * u); ctxs.stroke();
    ctxs.fillStyle = '#FBBC04'; for (var i = 0; i < 5; i++) star(ctxs, rx + 26 * u + i * 58 * u, qy + box * 0.68, 22 * u);
    ctxs.fillStyle = 'rgba(255,255,255,.9)'; var fs = 34 * u; ctxs.font = '600 ' + Math.round(fs) + 'px Inter,USDeva';
    var footLines = ctxs.measureText(P.c.foot).width <= W - rx - L * 0.6 ? [P.c.foot] : P.c.foot.replace(/\.\s+/, '.\n').split('\n');
    footLines.forEach(function (l, i) { ctxs.fillText(l, rx, qy + box * 0.86 + i * fs * 1.25); });
    ctxs.restore();
    credit(P, 'rgba(255,255,255,.6)', 'left', L);
  }

  /* ---------- UI ---------- */
  var linkIn = $('#rq-link'), linkMsg = $('#rq-link-msg'), nameIn = $('#rq-name'), headSel = $('#rq-head'), customIn = $('#rq-custom'),
    customWrap = $('[data-rq-custom]'), policy = $('#rq-policy'), canvas = $('#rq-canvas'), msgsBox = $('[data-rq-msgs]'),
    dlBtns = $$('[data-rq-need-link]'), testA = $('#rq-test'), live = $('#rq-live'), cap = $('#rq-cap'), printBtn = $('#rq-print');
  var current = null, qr = null, fontsReady = false, thumbTimer = 0;

  function fillHeads() {
    var c = COPY[state.lang];
    headSel.innerHTML = c.heads.map(function (h, i) { return '<option value="' + i + '">' + h + '</option>'; }).join('') + '<option value="custom">Write my own</option>';
    headSel.value = String(state.head);
  }
  function slug() { return (state.name || 'my-business').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'my-business'; }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  function thumbs() {
    $$('[data-rq-tpl]').forEach(function (b) {
      var t = b.getAttribute('data-rq-tpl'), cv = b.querySelector('canvas');
      if (cv) paint(cv, qr, { template: t, scale: 150 / FORMATS[state.format].w });
      b.setAttribute('aria-pressed', String(t === state.template));
    });
  }

  var devaLoad = null;
  function needDeva() {
    if (devaLoad || !window.FontFace || !document.fonts) return;
    devaLoad = Promise.all([['USDevaHead', 'rozha.ttf', '400'], ['USDeva', 'notosansdeva.ttf', '400 800']].map(function (f) {
      return new FontFace(f[0], 'url(/assets/card/fonts/' + f[1] + ')', { weight: f[2] }).load().then(function (face) { document.fonts.add(face); });
    })).catch(function () { /* the phone's own Devanagari font is used instead */ }).then(function () { render(); });
  }

  function render() {
    if (DEVA.test(headline() + ' ' + state.name + ' ' + COPY[state.lang].sub)) needDeva();
    current = parseLink(state.link);
    if (current.state === 'resolve') { resolveShort(current.key); }
    var ok = current.state === 'ok' || current.state === 'warn';
    var msg = '';
    if (current.state === 'ok') msg = current.name ? '✓ Found: ' + current.name + '. This link opens the Google review box.' : '✓ Looks good. This link opens the Google review box.';
    else if (current.state === 'resolve') msg = 'Finding your business on Google…';
    else if (current.state !== 'empty') msg = current.msg;
    linkMsg.textContent = msg;
    linkMsg.className = 'rq-msg rq-msg--' + (current.state === 'resolve' ? 'busy' : current.state);
    linkIn.setAttribute('aria-invalid', current.state === 'bad' ? 'true' : 'false');
    if (current.name && (!state.name || state.nameAuto)) { state.name = current.name.slice(0, 40); state.nameAuto = true; nameIn.value = state.name; }

    qr = ok ? makeQr(current.url) : null;
    dlBtns.forEach(function (b) { b.disabled = !ok; });
    testA.hidden = !ok; if (ok) testA.href = current.url;

    var F = FORMATS[state.format];
    cap.textContent = F.cap;
    printBtn.hidden = !F.print;
    if (F.print) printBtn.textContent = F.print.cols * F.print.rows === 1 ? 'Print it on A4 paper' : 'Print ' + F.print.cols * F.print.rows + ' on one A4 sheet';
    canvas.style.aspectRatio = F.w + '/' + F.h;

    customWrap.hidden = state.head !== 'custom';
    policy.hidden = !RISKY.test((state.head === 'custom' ? state.custom : '') + ' ' + state.name);
    $$('[data-rq-theme]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-rq-theme') === state.theme && !state.accent)); });
    $$('[data-rq-format]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-rq-format') === state.format)); });
    $('#rq-accent-custom').value = state.accent || THEMES[state.theme].acc;
    $('#rq-accent-reset').hidden = !state.accent;

    if (fontsReady) {
      paint(canvas, qr);
      clearTimeout(thumbTimer); thumbTimer = setTimeout(thumbs, 120);
    }
    canvas.setAttribute('aria-label', 'Preview: ' + (state.name || 'Your business name') + '. ' + headline() + ' ' + COPY[state.lang].sub + '.');

    var b = (state.name || '[your business]').trim(), l = ok ? current.url : '[your review link]';
    msgsBox.innerHTML = COPY[state.lang].msgs.map(function (m, i) {
      var t = m[1].replace('{b}', b).replace('{l}', l);
      return '<div class="rq-wa"><p class="rq-wa__label">' + m[0] + '</p><p class="rq-wa__text" id="rq-wa-' + i + '">' + esc(t) + '</p>' +
        '<div class="rq-wa__btns"><button type="button" class="btn btn--line rq-btn-sm" data-rq-copy="' + i + '">Copy</button>' +
        '<a class="btn btn--go rq-btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(t) + '"' + (ok ? '' : ' aria-disabled="true" tabindex="-1"') + '>Send on WhatsApp</a></div></div>';
    }).join('');
    save();
  }

  /* PNG with 300 dpi (pHYs) so print apps size it correctly */
  var CRC = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(bytes) { var c = 0xffffffff; for (var i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function withDpi(blob, dpi) {
    return blob.arrayBuffer().then(function (buf) {
      var src = new Uint8Array(buf), ppm = Math.round(dpi / 0.0254), chunk = new Uint8Array(21), dv = new DataView(chunk.buffer);
      dv.setUint32(0, 9); chunk.set([112, 72, 89, 115], 4); dv.setUint32(8, ppm); dv.setUint32(12, ppm); chunk[16] = 1; dv.setUint32(17, crc32(chunk.subarray(4, 17)));
      var at = 33, out = new Uint8Array(src.length + 21); out.set(src.subarray(0, at)); out.set(chunk, at); out.set(src.subarray(at), at + 21);
      return new Blob([out], { type: 'image/png' });
    }).catch(function () { return blob; });
  }
  function download(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function say(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }

  /* restore form */
  linkIn.value = state.link; nameIn.value = state.name; customIn.value = state.custom;
  $$('input[name="rq-lang"]').forEach(function (r) { r.checked = r.value === state.lang; });
  $('#rq-credit').checked = state.credit;
  fillHeads();

  var linkTimer = 0;
  linkIn.addEventListener('input', function () { state.link = linkIn.value; clearTimeout(linkTimer); linkTimer = setTimeout(render, 250); });
  linkIn.addEventListener('paste', function () { setTimeout(function () { state.link = linkIn.value; render(); }, 0); });
  nameIn.addEventListener('input', function () { state.name = nameIn.value; state.nameAuto = false; render(); });
  customIn.addEventListener('input', function () { state.custom = customIn.value; render(); });
  headSel.addEventListener('change', function () { state.head = headSel.value === 'custom' ? 'custom' : +headSel.value; render(); if (state.head === 'custom') customIn.focus(); });
  $$('input[name="rq-lang"]').forEach(function (r) { r.addEventListener('change', function () { state.lang = r.value; if (state.head !== 'custom') state.head = 0; fillHeads(); render(); }); });
  $$('[data-rq-tpl]').forEach(function (b) { b.addEventListener('click', function () { state.template = b.getAttribute('data-rq-tpl'); render(); say(b.getAttribute('aria-label') + ' design'); }); });
  $$('[data-rq-theme]').forEach(function (b) { b.addEventListener('click', function () { state.theme = b.getAttribute('data-rq-theme'); state.accent = ''; render(); }); });
  $$('[data-rq-format]').forEach(function (b) { b.addEventListener('click', function () { state.format = b.getAttribute('data-rq-format'); render(); }); });
  $('#rq-accent-custom').addEventListener('input', function (e) { state.accent = e.target.value; render(); });
  $('#rq-accent-reset').addEventListener('click', function () { state.accent = ''; render(); });
  $('#rq-credit').addEventListener('change', function (e) { state.credit = e.target.checked; render(); });
  $('#rq-logo').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(f.type) || f.size > 5e6) { say('Use a PNG, JPG or WebP image under 5 MB'); return; }
    var img = new Image(); img.onload = function () { logo = img; $('#rq-logo-clear').hidden = false; render(); }; img.src = URL.createObjectURL(f);
  });
  $('#rq-logo-clear').addEventListener('click', function () { logo = null; $('#rq-logo').value = ''; this.hidden = true; render(); });

  /* guide tabs */
  $$('[role="tab"][data-rq-tab]').forEach(function (t, i, all) {
    t.addEventListener('click', function () { all.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); });
    t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; var n = all[(i + d + all.length) % all.length]; n.click(); n.focus(); });
  });

  root.addEventListener('click', function (e) {
    var c = e.target.closest('[data-rq-copy]');
    if (c) {
      var t = document.getElementById('rq-wa-' + c.getAttribute('data-rq-copy')).textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { c.textContent = 'Copied'; say('Message copied'); setTimeout(function () { c.textContent = 'Copy'; }, 1600); }, function () { say('Select the message text and copy it'); });
      return;
    }
    var a = e.target.closest('a[aria-disabled="true"]');
    if (a) { e.preventDefault(); linkIn.focus(); say('Paste your link first'); }
  });

  $('#rq-dl-standee').addEventListener('click', function () {
    if (!qr) return;
    var cv = document.createElement('canvas'); paint(cv, qr);
    cv.toBlob(function (b) { withDpi(b, 300).then(function (b2) { download(b2, 'google-review-' + FORMATS[state.format].name + '-' + slug() + '.png'); say('Downloaded'); }); }, 'image/png');
  });
  $('#rq-dl-png').addEventListener('click', function () {
    if (!qr) return;
    var n = qr.getModuleCount() + 8, px = Math.ceil(1200 / n), cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    cv.width = cv.height = n * px; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); drawQr(ctx, qr, 4 * px, 4 * px, (n - 8) * px);
    cv.toBlob(function (b) { download(b, 'google-review-qr-' + slug() + '.png'); say('QR code downloaded'); }, 'image/png');
  });
  $('#rq-dl-svg').addEventListener('click', function () { if (!qr) return; download(new Blob([qrSvg(qr)], { type: 'image/svg+xml' }), 'google-review-qr-' + slug() + '.svg'); say('QR code downloaded'); });
  printBtn.addEventListener('click', function () {
    var F = FORMATS[state.format]; if (!qr || !F.print) return;
    var cv = document.createElement('canvas'); paint(cv, qr);
    var src = cv.toDataURL('image/png'), sheet = document.getElementById('rq-print-sheet'), p = F.print;
    sheet.style.gridTemplateColumns = 'repeat(' + p.cols + ',' + p.wmm + 'mm)'; sheet.style.gridTemplateRows = 'repeat(' + p.rows + ',' + p.hmm + 'mm)';
    sheet.innerHTML = Array.apply(null, Array(p.cols * p.rows)).map(function () { return '<img src="' + src + '" alt="" style="width:' + p.wmm + 'mm;height:' + p.hmm + 'mm">'; }).join('');
    var imgs = sheet.querySelectorAll('img'), left = imgs.length;
    imgs.forEach(function (im) { if (im.complete) left--; else im.onload = function () { if (--left === 0) window.print(); }; });
    if (left === 0) window.print();
  });

  var loads = ['400 100px Anton,USDevaHead', '800 40px Inter,USDeva', '700 40px Inter,USDeva', '600 40px Inter,USDeva', '500 30px Inter,USDeva'].map(function (f) { return document.fonts ? document.fonts.load(f) : Promise.resolve(); });
  Promise.all(loads).catch(function () {}).then(function () { fontsReady = true; render(); });
  render();
})();
