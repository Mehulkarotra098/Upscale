/* Illustrations for the Google Business Profile checker: one scene per question, drawn as inline SVG in the
   U Scale style (violet tiles, floating white UI cards, green highlights). Inline so it uses the page's Inter and
   Anton fonts. Exposes window.UScaleGbpArt(id) → SVG string. */
(function () {
  'use strict';
  var V = '#251E45', V2 = '#2C2454', DEEP = '#120B26', G = '#63B849', G2 = '#86E061', LAV = '#C9BCE8', INK = '#1F1F1F', MUT = '#5F6368', BLUE = '#1A73E8', GOLD = '#F9AB00';
  var SANS = 'Inter,Arial,sans-serif', DISPLAY = 'Anton,Impact,sans-serif';
  var n = 0;

  function t(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + (o.f || SANS) + '" font-size="' + (o.s || 10) + '" font-weight="' + (o.w || 600) + '" fill="' + (o.c || INK) + '"' +
      (o.a ? ' text-anchor="' + o.a + '"' : '') + (o.ls ? ' letter-spacing="' + o.ls + '"' : '') + (o.op ? ' opacity="' + o.op + '"' : '') + (o.deco ? ' text-decoration="' + o.deco + '"' : '') + '>' + s + '</text>';
  }
  function r(x, y, w, h, rx, fill, ex) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + (fill || 'none') + '"' + (ex || '') + '/>'; }
  function c(cx, cy, rr, fill, ex) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="' + fill + '"' + (ex || '') + '/>'; }
  var STAR = 'M0-10l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L0 4.9-5.9 8.2l1.2-6.6L-9.5-3l6.6-.9z';
  function star(x, y, s, fill) { return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="' + STAR + '" fill="' + (fill || GOLD) + '"/>'; }
  function stars(x, y, s, gap, on) { var o = ''; for (var i = 0; i < 5; i++) o += star(x + i * gap, y, s, i < (on == null ? 5 : on) ? GOLD : '#DADCE0'); return o; }
  function sparkle(x, y, s, fill, op) { return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M0-8C.8-2.6 2.6-.8 8 0 2.6.8.8 2.6 0 8-.8 2.6-2.6.8-8 0-2.6-.8-.8-2.6 0-8z" fill="' + (fill || LAV) + '" opacity="' + (op || 0.9) + '"/>'; }
  function tick(cx, cy, rr, fill) { return c(cx, cy, rr, fill || G) + '<path d="M' + (cx - rr * 0.42) + ' ' + cy + 'l' + rr * 0.3 + ' ' + rr * 0.3 + ' ' + rr * 0.55 + '-' + rr * 0.6 + '" stroke="#fff" stroke-width="' + rr * 0.28 + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function cross(cx, cy, rr) { return c(cx, cy, rr, '#E5484D') + '<path d="M' + (cx - rr * 0.35) + ' ' + (cy - rr * 0.35) + 'l' + rr * 0.7 + ' ' + rr * 0.7 + 'm0-' + rr * 0.7 + 'l-' + rr * 0.7 + ' ' + rr * 0.7 + '" stroke="#fff" stroke-width="' + rr * 0.26 + '" stroke-linecap="round"/>'; }

  /* tile: violet gradient, glows, dot grid, card shadow + glow filters */
  function tile(inner) {
    var k = 'ga' + (++n);
    var dots = '';
    for (var y = 14; y < 180; y += 18) for (var x = 14; x < 320; x += 18) dots += '<circle cx="' + x + '" cy="' + y + '" r=".9"/>';
    return '<svg viewBox="0 0 320 180" aria-hidden="true" focusable="false" class="gp-art">' +
      '<defs><linearGradient id="' + k + 'bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + V2 + '"/><stop offset=".55" stop-color="#1B1438"/><stop offset="1" stop-color="' + DEEP + '"/></linearGradient>' +
      '<radialGradient id="' + k + 'g1" cx=".85" cy=".1" r=".55"><stop offset="0" stop-color="' + G + '" stop-opacity=".42"/><stop offset="1" stop-color="' + G + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + k + 'g2" cx=".05" cy="1" r=".6"><stop offset="0" stop-color="' + LAV + '" stop-opacity=".3"/><stop offset="1" stop-color="' + LAV + '" stop-opacity="0"/></radialGradient>' +
      '<filter id="' + k + 'sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".38"/></filter>' +
      '<filter id="' + k + 'gl" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<linearGradient id="' + k + 'cv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9824A"/><stop offset=".5" stop-color="#B3123E"/><stop offset="1" stop-color="#7A1F5C"/></linearGradient>' +
      '<linearGradient id="' + k + 'gn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + G2 + '"/><stop offset="1" stop-color="#3E9A2A"/></linearGradient>' +
      '<linearGradient id="' + k + 'gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD25E"/><stop offset="1" stop-color="#F29900"/></linearGradient>' +
      '<clipPath id="' + k + 'cl"><rect width="320" height="180" rx="14"/></clipPath></defs>' +
      '<g clip-path="url(#' + k + 'cl)">' + r(0, 0, 320, 180, 0, 'url(#' + k + 'bg)') + r(0, 0, 320, 180, 0, 'url(#' + k + 'g1)') + r(0, 0, 320, 180, 0, 'url(#' + k + 'g2)') +
      '<g fill="#fff" opacity=".07">' + dots + '</g>' + inner.replace(/#K/g, '#' + k).replace(/id="K/g, 'id="' + k) + '</g></svg>';
  }
  /* floating white card with shadow */
  function card(x, y, w, h, rx, fill) { return r(x, y, w, h, rx == null ? 12 : rx, fill || '#fff', ' filter="url(#Ksh)"'); }
  /* green glow ring around the spot to look at */
  function ring(x, y, w, h, rx) { return r(x, y, w, h, rx == null ? 8 : rx, 'rgba(99,184,73,.16)', ' stroke="' + G + '" stroke-width="2.4" class="gp-hl"'); }
  function pill(x, y, s, o) {
    o = o || {};
    var w = o.w || s.length * (o.size || 9.5) * 0.6 + (o.icon ? 32 : 22), h = o.h || 24;
    if (x + w > 312) x = 312 - w;
    return r(x, y, w, h, h / 2, o.bg || G, o.shadow === false ? '' : ' filter="url(#Ksh)"') + (o.icon ? c(x + h / 2, y + h / 2, h / 2 - 4, o.ibg || 'rgba(255,255,255,.25)') + o.icon(x + h / 2, y + h / 2) : '') +
      t(x + (o.icon ? h + 4 : w / 2), y + h / 2 + (o.size || 9.5) * 0.36, s, { s: o.size || 9.5, w: 700, c: o.fg || V, a: o.icon ? null : 'middle' });
  }
  function dash(d) { return '<path d="' + d + '" fill="none" stroke="' + G2 + '" stroke-width="1.6" stroke-dasharray="3 4" stroke-linecap="round" opacity=".9"/>'; }
  function bubble(cx, cy, rr, fill, icon) { return c(cx, cy, rr + 6, fill, ' opacity=".18"') + c(cx, cy, rr, fill, ' filter="url(#Ksh)"') + icon; }

  /* icons (centred at cx, cy) */
  var ic = {
    shield: function (cx, cy, s, col) { return '<path transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" d="M0-11 9-7.5v6.2C9 4.6 5.2 9.3 0 11-5.2 9.3-9 4.6-9-1.3v-6.2z" fill="' + (col || '#fff') + '"/><path transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" d="M-4 .2l2.8 2.8L4.5-2.8" stroke="' + G + '" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; },
    phone: function (cx, cy, s, col) { return '<path transform="translate(' + (cx - 9 * s) + ' ' + (cy - 9 * s) + ') scale(' + s * 0.75 + ')" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="' + (col || '#fff') + '"/>'; },
    globe: function (cx, cy, s, col) { return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" fill="none" stroke="' + (col || '#fff') + '" stroke-width="1.7"><circle r="8.5"/><path d="M-8.5 0h17M0-8.5c-3 2.6-3 14.4 0 17M0-8.5c3 2.6 3 14.4 0 17"/></g>'; },
    clock: function (cx, cy, s, col) { return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" fill="none" stroke="' + (col || '#fff') + '" stroke-width="1.8" stroke-linecap="round"><circle r="8"/><path d="M0-4.5V0l3 2"/></g>'; },
    camera: function (cx, cy, s, col) { return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')"><path d="M-10-5h4l2-3h8l2 3h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-20a2 2 0 0 1-2-2V-3a2 2 0 0 1 2-2z" fill="' + (col || '#fff') + '"/><circle r="4.6" fill="' + V + '"/><circle r="2.3" fill="' + LAV + '"/></g>'; },
    mega: function (cx, cy, s, col) { return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" fill="' + (col || '#fff') + '"><path d="M-9-3h4l9-6v18l-9-6h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"/><path d="M-6 3h3.5l1.5 6h-3.4z"/><path d="M7-4a6 6 0 0 1 0 8" stroke="' + (col || '#fff') + '" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>'; },
    pen: function (cx, cy, s, col) { return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')"><path d="M-7 7l1.5-5.2L5-8.7a1.8 1.8 0 0 1 2.6 0l1.1 1.1a1.8 1.8 0 0 1 0 2.6L-1.8 5.5z" fill="' + (col || '#fff') + '"/><path d="M-9 9.5h18" stroke="' + (col || '#fff') + '" stroke-width="1.6" stroke-linecap="round"/></g>'; },
    tag: function (cx, cy, s, col) { return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')"><path d="M-9-9h8.5L9-.5 -.5 9-9 .5z" fill="' + (col || '#fff') + '"/><circle cx="-4.5" cy="-4.5" r="1.8" fill="' + V + '"/></g>'; },
    chat: function (cx, cy, s, col) { return '<path transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" d="M-9-7h18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H-2l-6 5v-5h-1a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" fill="' + (col || '#fff') + '"/>'; },
    cal: function (cx, cy, s, col) { return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')"><rect x="-9" y="-7" width="18" height="16" rx="2.5" fill="' + (col || '#fff') + '"/><rect x="-9" y="-7" width="18" height="5" rx="2" fill="#E5484D"/><path d="M-5-10v5M5-10v5" stroke="' + (col || '#fff') + '" stroke-width="2" stroke-linecap="round"/></g>'; },
    link: function (cx, cy, s, col) { return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" fill="none" stroke="' + (col || '#fff') + '" stroke-width="2.2" stroke-linecap="round"><path d="M-2 2l4-4"/><path d="M-4.5 -.5l-2 2a3.6 3.6 0 0 0 5 5l2-2"/><path d="M4.5 .5l2-2a3.6 3.6 0 0 0-5-5l-2 2"/></g>'; },
    plus: function (cx, cy, s, col) { return '<path transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" d="M0-5v10M-5 0h10" stroke="' + (col || '#fff') + '" stroke-width="2.4" stroke-linecap="round"/>'; },
  };

  /* a compact Google listing header used by several scenes */
  function listingTop(x, y, w) {
    return r(x, y, w, 40, 12, 'url(#Kcv)') + r(x, y + 28, w, 12, 0, 'url(#Kcv)') +
      '<path d="M' + x + ' ' + (y + 34) + 'q' + w / 4 + ' -10 ' + w / 2 + ' 1t' + w / 2 + ' -4v9h-' + w + 'z" fill="#F2B84B" opacity=".9"/>' +
      '<path d="M' + (x + w * 0.62) + ' ' + (y + 4) + 'l7 30M' + (x + w * 0.74) + ' ' + (y + 2) + 'l6 32M' + (x + w * 0.86) + ' ' + (y + 5) + 'l4 30" stroke="#F7D58C" stroke-width="3" opacity=".55"/>' +
      t(x + 12, y + 60, 'Sharma Sarees', { s: 15, w: 700 }) + t(x + 12, y + 77, '4.3', { s: 10, w: 600, c: '#3C4043' }) + stars(x + 37, y + 73, 0.42, 9.6, 4) + t(x + 84, y + 77, '(87)', { s: 10, w: 500, c: MUT });
  }
  function avatar(cx, cy, l, fill) { return c(cx, cy, 9, fill || LAV) + t(cx, cy + 3.5, l, { s: 9.5, w: 700, c: V, a: 'middle' }); }
  function qr(x, y, size) {
    var N = 21, m = size / N, o = r(x - 2, y - 2, size + 4, size + 4, 3, '#fff');
    var finder = function (fx, fy) { return r(x + fx * m, y + fy * m, 7 * m, 7 * m, 1, '#14112A') + r(x + (fx + 1) * m, y + (fy + 1) * m, 5 * m, 5 * m, 0.6, '#fff') + r(x + (fx + 2) * m, y + (fy + 2) * m, 3 * m, 3 * m, 0.4, '#14112A'); };
    var seed = 7;
    for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
      if ((i < 8 && j < 8) || (i < 8 && j > 12) || (i > 12 && j < 8)) continue;
      seed = (seed * 9301 + 49297) % 233280;
      if (seed / 233280 < 0.48) o += r(x + j * m, y + i * m, m, m, 0, '#14112A');
    }
    return o + finder(0, 0) + finder(14, 0) + finder(0, 14);
  }

  var S = {
    verified: function () {
      return card(28, 18, 188, 146) + listingTop(28, 18, 188) + t(40, 112, 'Saree store · ', { s: 10, w: 500, c: MUT }) + t(104, 112, 'Open', { s: 10, w: 600, c: '#188038' }) +
        r(40, 122, 164, 1, 0, '#ECEFF1') + ring(34, 130, 116, 24) + t(42, 146, 'Own this business?', { s: 11, w: 600, c: BLUE, deco: 'underline' }) +
        dash('M152 142 C 200 150, 214 118, 240 102') +
        bubble(262, 82, 25, 'url(#Kgn)', ic.shield(262, 82, 1.45)) + pill(222, 120, 'Claim & verify', { bg: '#fff', fg: V, size: 9.5 }) +
        sparkle(296, 40, 0.8, G2) + sparkle(234, 52, 0.5) + sparkle(300, 150, 0.6);
    },
    category: function () {
      return card(22, 26, 170, 128) + listingTop(22, 26, 170) + ring(28, 109, 66, 21) + t(34, 124, 'Saree store', { s: 11, w: 600, c: '#3C4043' }) + t(98, 124, '· Open', { s: 10, w: 500, c: MUT }) +
        t(206, 46, 'TOO BROAD', { s: 8, w: 700, c: LAV, ls: 1.2 }) + r(206, 52, 96, 28, 14, 'rgba(255,255,255,.08)', ' stroke="rgba(255,255,255,.25)"') + t(222, 70, 'Store', { s: 11, w: 600, c: 'rgba(255,255,255,.55)', deco: 'line-through' }) + cross(288, 66, 8) +
        t(206, 104, 'SPECIFIC', { s: 8, w: 700, c: G2, ls: 1.2 }) + r(206, 110, 104, 30, 15, '#fff', ' filter="url(#Ksh)"') + t(220, 129.5, 'Saree store', { s: 11.5, w: 700, c: V }) + tick(294, 125, 9) +
        dash('M96 118 C 140 132, 170 134, 204 126') + sparkle(300, 30, 0.7, G2) + sparkle(186, 160, 0.5);
    },
    hours: function () {
      var rows = [['Mon–Sat', '10 am – 9 pm'], ['Sunday', '11 am – 7 pm']];
      return card(24, 18, 180, 144) + bubble(46, 42, 12, V, ic.clock(46, 42, 0.95)) + t(66, 46, 'Hours', { s: 13, w: 700 }) + t(150, 46, 'Open', { s: 10, w: 700, c: '#188038' }) +
        rows.map(function (rw, i) { return t(38, 76 + i * 20, rw[0], { s: 10, w: 600, c: '#3C4043' }) + t(190, 76 + i * 20, rw[1], { s: 10, w: 500, c: MUT, a: 'end' }); }).join('') +
        ring(30, 108, 168, 40, 10) + r(30, 108, 168, 40, 10, 'rgba(249,171,0,.12)') + t(38, 124, 'Diwali · 8 Nov', { s: 10, w: 700, c: '#B06000' }) + t(38, 139, 'Special hours', { s: 8.5, w: 600, c: MUT }) + t(190, 131, '10 am – 2 pm', { s: 10, w: 700, c: '#B06000', a: 'end' }) +
        '<g transform="rotate(7 262 86)">' + card(226, 42, 74, 86, 12) + r(226, 42, 74, 24, 12, '#E5484D') + r(226, 56, 74, 10, 0, '#E5484D') + t(263, 59, 'NOV', { s: 11, w: 700, c: '#fff', a: 'middle', ls: 1.5 }) +
        t(263, 106, '8', { s: 38, f: DISPLAY, w: 400, c: V, a: 'middle' }) + '<path d="M255 120q8 6 16 0" stroke="' + GOLD + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + '</g>' +
        '<path d="M282 150c-4-3-4-8 0-14 4 6 4 11 0 14z" fill="' + GOLD + '"/><path d="M272 152h20l-3 6h-14z" fill="#E07A1F"/>' + sparkle(222, 30, 0.6, G2) + sparkle(304, 30, 0.5);
    },
    contact: function () {
      var btn = function (x, w, s, on) { return r(x, 118, w, 24, 12, on === 2 ? BLUE : '#fff', on === 2 ? '' : ' stroke="#C4C7C5"') + t(x + w / 2, 133.5, s, { s: 9.5, w: 600, c: on === 2 ? '#fff' : BLUE, a: 'middle' }); };
      return card(20, 22, 196, 140) + listingTop(20, 22, 196) + t(32, 112, 'Saree store · Open', { s: 10, w: 500, c: MUT }) +
        btn(30, 62, 'Directions', 2) + btn(96, 40, 'Call') + btn(140, 56, 'Website') + ring(93, 115, 46, 30, 15) + ring(137, 115, 62, 30, 15) +
        dash('M118 148 C 150 170, 220 168, 244 122') + dash('M170 112 C 200 80, 240 64, 266 60') +
        bubble(270, 54, 20, 'url(#Kgn)', ic.phone(270, 54, 1.2)) + bubble(256, 118, 18, BLUE, ic.globe(256, 118, 1.1)) +
        '<path d="M296 40a20 20 0 0 1 0 28M302 34a28 28 0 0 1 0 40" stroke="' + G2 + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>' + sparkle(304, 150, 0.6) + sparkle(228, 30, 0.5, G2);
    },
    desc: function () {
      var lines = ['Handwoven silk and cotton sarees', 'in Andheri East since 1998. Bridal,', 'Banarasi, Kanjivaram and daily wear.', 'Free fall & pico on every saree.'];
      return card(22, 22, 206, 136) + t(36, 46, 'From the business', { s: 13, w: 700 }) + ring(30, 54, 190, 78, 10) +
        lines.map(function (l, i) { return t(38, 72 + i * 16, l, { s: 10, w: 500, c: '#3C4043' }); }).join('') +
        r(36, 138, 70, 8, 4, '#ECE7F5') + r(36, 138, 44, 8, 4, G) + t(112, 145.5, '312 / 750 characters', { s: 8.5, w: 600, c: MUT }) +
        bubble(268, 64, 22, LAV, ic.pen(268, 64, 1.2, V)) + pill(236, 108, 'What · who · where', { bg: '#fff', fg: V, size: 9 }) + sparkle(300, 30, 0.7, G2) + sparkle(304, 152, 0.5);
    },
    products: function () {
      var items = [['Silk saree', '₹4,500', ['#B3123E', '#E07A1F']], ['Banarasi', '₹7,800', ['#7A1FA2', '#E9B04D']], ['Cotton', '₹1,200', ['#0F766E', '#86E061']]];
      return card(18, 20, 284, 140) + t(32, 44, 'Products', { s: 13, w: 700 }) + t(290, 44, 'View all', { s: 9.5, w: 600, c: BLUE, a: 'end' }) +
        items.map(function (p, i) {
          var x = 32 + i * 88, id = 'pr' + i;
          return '<defs><linearGradient id="K' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p[2][0] + '"/><stop offset="1" stop-color="' + p[2][1] + '"/></linearGradient></defs>' +
            r(x, 54, 80, 92, 10, '#fff', ' stroke="#E8EAED"') + r(x, 54, 80, 56, 10, 'url(#K' + id + ')') + r(x, 100, 80, 10, 0, 'url(#K' + id + ')') +
            '<path d="M' + (x + 10) + ' 110 l14 -48 M' + (x + 30) + ' 110 l12 -48 M' + (x + 50) + ' 110 l10 -48" stroke="rgba(255,255,255,.35)" stroke-width="3"/>' +
            t(x + 8, 125, p[0], { s: 10, w: 700 }) + t(x + 8, 139, p[1], { s: 10, w: 600, c: '#188038' });
        }).join('') + ring(28, 50, 88, 100, 12) +
        '<g transform="rotate(-14 104 52)">' + '<path d="M88 40h30l10 12-10 12H88a4 4 0 0 1-4-4V44a4 4 0 0 1 4-4z" fill="' + GOLD + '" filter="url(#Ksh)"/><circle cx="118" cy="52" r="2.4" fill="#fff"/>' + t(101, 56, '₹', { s: 12, w: 700, c: V, a: 'middle' }) + '</g>' +
        sparkle(306, 16, 0.6, G2) + sparkle(12, 168, 0.5);
    },
    photos: function () {
      return card(22, 18, 206, 144) + t(36, 42, 'Photos', { s: 13, w: 700 }) +
        r(36, 52, 100, 96, 10, 'url(#Kcv)') + '<path d="M36 128l30-26 20 16 18-12 32 24v10a10 10 0 0 1-10 10H46a10 10 0 0 1-10-10z" fill="#F2B84B" opacity=".9"/>' +
        r(48, 62, 76, 14, 3, '#fff', ' opacity=".9"') + t(86, 72.5, 'SHARMA SAREES', { s: 6.5, w: 700, c: '#B3123E', a: 'middle', ls: 0.8 }) +
        r(142, 52, 38, 46, 8, '#7A1FA2') + r(184, 52, 32, 46, 8, '#0F766E') + r(142, 102, 38, 46, 8, '#E07A1F') + r(184, 102, 32, 46, 8, V) + t(200, 130, '+24', { s: 12, w: 700, c: '#fff', a: 'middle' }) +
        '<path d="M150 90l8-14 6 8 4-5 6 11z" fill="#fff" opacity=".55"/>' + ring(30, 46, 192, 108, 12) +
        bubble(272, 70, 23, V, ic.camera(272, 70, 1.15, '#fff')) + c(288, 54, 9, G) + ic.plus(288, 54, 0.9) +
        pill(234, 128, '2–3 new / month', { bg: '#fff', fg: V, size: 9 }) + sparkle(300, 150, 0.6, G2) + sparkle(238, 30, 0.5);
    },
    posts: function () {
      return card(22, 24, 210, 132) + avatar(42, 46, 'S', '#F2B84B') + t(58, 44, 'Sharma Sarees', { s: 10.5, w: 700 }) + t(58, 56, 'Update · 2 days ago', { s: 8.5, w: 500, c: MUT }) +
        ring(30, 64, 194, 84, 10) +
        r(38, 72, 64, 68, 8, 'url(#Kcv)') + '<path d="M58 124q12-16 24 0z" fill="' + GOLD + '"/><path d="M70 104c-5-4-5-10 0-16 5 6 5 12 0 16z" fill="#FFD25E"/>' +
        t(112, 88, 'Diwali offer', { s: 12, w: 700 }) + t(112, 104, 'New silk collection', { s: 9.5, w: 500, c: '#3C4043' }) + t(112, 117, 'is in store now', { s: 9.5, w: 500, c: '#3C4043' }) +
        r(112, 124, 62, 18, 9, '#E8F0FE') + t(143, 136.5, 'Learn more', { s: 8.5, w: 700, c: BLUE, a: 'middle' }) +
        bubble(272, 60, 22, 'url(#Kgn)', ic.mega(270, 60, 1.05)) + pill(240, 104, '1 post every week', { bg: '#fff', fg: V, size: 9 }) + sparkle(304, 28, 0.7, G2) + sparkle(300, 156, 0.5);
    },
    attrs: function () {
      var chips = [['UPI & cards', 1], ['Wheelchair access', 1], ['Free Wi-Fi', 1], ['Parking', 0], ['Women-owned', 1]];
      var x = 34, y = 58, out = '';
      chips.forEach(function (ch) {
        var w = ch[0].length * 4.7 + 28;
        if (x + w > 232) { x = 34; y += 28; }
        out += r(x, y, w, 22, 11, ch[1] ? '#E6F4EA' : '#F1F3F4') + (ch[1] ? tick(x + 11, y + 11, 6.5, '#188038') : c(x + 11, y + 11, 6.5, '#DADCE0')) + t(x + 21, y + 15, ch[0], { s: 8.5, w: 600, c: ch[1] ? '#137333' : MUT });
        x += w + 6;
      });
      return card(20, 24, 218, 132) + t(34, 48, 'Highlights', { s: 13, w: 700 }) + out + ring(26, 52, 206, 96, 12) +
        bubble(274, 66, 22, LAV, '<text x="274" y="73.5" font-family="' + SANS + '" font-size="20" font-weight="700" fill="' + V + '" text-anchor="middle">₹</text>') +
        pill(236, 112, 'Tick what’s true', { bg: '#fff', fg: V, size: 9 }) + sparkle(302, 30, 0.7, G2) + sparkle(304, 156, 0.5);
    },
    count: function () {
      return card(22, 22, 176, 136) + t(36, 46, 'Reviews', { s: 13, w: 700 }) + t(36, 92, '4.3', { s: 36, f: DISPLAY, w: 400, c: V }) + stars(43, 108, 0.5, 11.5, 4) +
        ring(30, 116, 92, 26, 13) + t(40, 133.5, '87 reviews', { s: 11.5, w: 700, c: V }) +
        [0.72, 0.16, 0.06, 0.03, 0.03].map(function (f, i) { return r(110, 60 + i * 11, 76, 6, 3, '#EEF0F2') + r(110, 60 + i * 11, 76 * f, 6, 3, GOLD); }).join('') +
        [[232, 128, 'A', 0.9], [262, 96, 'R', 1], [242, 62, 'P', 0.95], [290, 54, 'K', 0.8]].map(function (b, i) {
          return '<g opacity="' + b[3] + '">' + c(b[0], b[1], 14, '#fff', ' filter="url(#Ksh)"') + t(b[0], b[1] + 4, b[2], { s: 11, w: 700, c: V, a: 'middle' }) + c(b[0] + 10, b[1] - 10, 7, G) + ic.plus(b[0] + 10, b[1] - 10, 0.6) + '</g>';
        }).join('') + dash('M124 128 C 170 140, 200 140, 220 132') + sparkle(300, 150, 0.7, G2) + sparkle(212, 34, 0.5);
    },
    rating: function () {
      return '<g filter="url(#Kgl)">' + star(84, 92, 4.3, 'url(#Kgd)') + '</g>' + '<path d="M70 70q10-8 20-2" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/>' +
        t(84, 102, '4.3', { s: 26, f: DISPLAY, w: 400, c: V, a: 'middle' }) +
        card(152, 28, 152, 124) + t(166, 52, 'Rating', { s: 12, w: 700 }) +
        [0.72, 0.16, 0.06, 0.03, 0.03].map(function (f, i) { return t(166, 72 + i * 15, String(5 - i), { s: 9, w: 700, c: MUT }) + star(180, 69 + i * 15, 0.38) + r(190, 66 + i * 15, 100, 7, 3.5, '#EEF0F2') + r(190, 66 + i * 15, 100 * f, 7, 3.5, GOLD); }).join('') +
        ring(160, 60, 136, 18, 9) + sparkle(30, 34, 0.8, GOLD) + sparkle(138, 150, 0.6, G2) + sparkle(28, 150, 0.5) + sparkle(140, 30, 0.5, GOLD);
    },
    recent: function () {
      var rev = function (y, l, n, d, col) { return avatar(42, y, l, col) + t(58, y - 2, n, { s: 10, w: 700 }) + stars(61, y + 9, 0.32, 7.4) + t(102, y + 12, d, { s: 9, w: 600, c: MUT }); };
      return card(22, 18, 196, 144) + r(34, 30, 72, 22, 11, '#fff', ' stroke="#C4C7C5"') + t(70, 44.5, 'Most relevant', { s: 8.5, w: 600, c: '#3C4043', a: 'middle' }) +
        r(112, 30, 52, 22, 11, '#E8F0FE') + t(138, 44.5, 'Newest', { s: 9, w: 700, c: BLUE, a: 'middle' }) + ring(109, 27, 58, 28, 14) +
        rev(76, 'P', 'Priya S.', '2 days ago', LAV) + rev(110, 'A', 'Amit K.', '6 days ago', '#B5E4A0') + rev(144, 'N', 'Neha R.', '3 weeks ago', '#FCD9B6') +
        ring(98, 78, 64, 14, 7) + ring(98, 112, 64, 14, 7) +
        '<g transform="rotate(5 268 78)">' + card(232, 40, 74, 76, 12) + bubble(269, 64, 13, V, ic.cal(269, 64, 0.85)) + t(269, 96, '3 new', { s: 13, w: 700, c: V, a: 'middle' }) + t(269, 108, 'last 30 days', { s: 7.5, w: 600, c: MUT, a: 'middle' }) + '</g>' +
        sparkle(302, 150, 0.7, G2) + sparkle(222, 26, 0.5);
    },
    replies: function () {
      return card(20, 18, 214, 144) + avatar(40, 40, 'P') + t(56, 38, 'Priya S.', { s: 10.5, w: 700 }) + stars(59, 50, 0.32, 7.4) + t(100, 53, '2 days ago', { s: 8.5, w: 500, c: MUT }) +
        t(32, 72, 'Beautiful collection, very', { s: 10, w: 500, c: '#3C4043' }) + t(32, 86, 'patient staff. Will come again!', { s: 10, w: 500, c: '#3C4043' }) +
        r(32, 98, 190, 52, 10, '#F1F3F4') + ring(28, 94, 198, 60, 12) + t(42, 116, 'Response from the owner', { s: 9.5, w: 700 }) + t(42, 132, 'Thank you Priya! See you', { s: 9.5, w: 500, c: '#3C4043' }) + t(42, 145, 'this Diwali 🙏', { s: 9.5, w: 500, c: '#3C4043' }) +
        bubble(272, 70, 24, 'url(#Kgn)', ic.chat(272, 68, 1.15)) + pill(238, 112, 'Reply to every review', { bg: '#fff', fg: V, size: 8.5 }) + sparkle(304, 30, 0.7, G2) + sparkle(304, 156, 0.5);
    },
    website: function () {
      return '<g filter="url(#Ksh)">' + r(28, 14, 92, 170, 18, '#0E0A1C') + '</g>' + r(33, 19, 82, 165, 14, '#fff') + r(33, 19, 82, 34, 14, V) + r(33, 40, 82, 13, 0, V) +
        t(74, 40, 'Sharma Sarees', { s: 8.5, w: 700, c: '#fff', a: 'middle' }) + t(40, 68, 'Silk sarees in', { s: 9.5, w: 700 }) + t(40, 80, 'Andheri East', { s: 9.5, w: 700 }) +
        r(40, 88, 26, 16, 8, BLUE) + t(53, 99, 'Call', { s: 7.5, w: 700, c: '#fff', a: 'middle' }) + r(69, 88, 42, 16, 8, '#25D366') + t(90, 99, 'WhatsApp', { s: 7, w: 700, c: '#fff', a: 'middle' }) +
        r(40, 110, 70, 34, 6, '#E8EAED') + '<path d="M75 116c-4 0-7 3-7 6.6 0 5 7 11.4 7 11.4s7-6.4 7-11.4c0-3.6-3-6.6-7-6.6z" fill="#EA4335"/><circle cx="75" cy="122.6" r="2.4" fill="#fff"/>' +
        t(40, 156, 'MG Road, Andheri E', { s: 7.5, w: 600, c: MUT }) + t(40, 166, '098200 12345', { s: 7.5, w: 600, c: MUT }) +
        card(196, 38, 108, 104) + t(206, 58, 'Google', { s: 11, w: 700, c: '#4285F4' }) + t(206, 76, 'Sharma Sarees', { s: 9.5, w: 700 }) + t(206, 92, 'MG Road, Andheri E', { s: 8.5, w: 500, c: '#3C4043' }) + t(206, 106, '098200 12345', { s: 8.5, w: 500, c: '#3C4043' }) + t(206, 124, 'sharmasarees.in', { s: 8.5, w: 600, c: BLUE }) +
        dash('M124 90 H 192') + bubble(158, 90, 15, 'url(#Kgn)', ic.link(158, 90, 1)) + pill(130, 128, 'Same details', { bg: '#fff', fg: V, size: 8.5, h: 20 }) + sparkle(304, 22, 0.6, G2) + sparkle(178, 30, 0.5);
    },
    listings: function () {
      var d = [['Google', '#4285F4'], ['Justdial', '#FF7A00'], ['Bing Places', '#00809D'], ['Apple Maps', '#1F1F1F']];
      return d.map(function (x, i) {
        var y = 16 + i * 38, ox = 24 + i * 14;
        return card(ox, y, 200, 32, 9) + r(ox, y, 5, 32, 2.5, x[1]) + t(ox + 14, y + 14, x[0], { s: 9.5, w: 700, c: x[1] }) + t(ox + 14, y + 26, 'Sharma Sarees · 098200 12345', { s: 8, w: 500, c: '#3C4043' }) + tick(ox + 184, y + 16, 8);
      }).join('') + '<path d="M222 32V146" stroke="' + G2 + '" stroke-width="2" stroke-dasharray="3 4" opacity=".7" transform="translate(42 0)"/>' +
        pill(250, 72, 'All match', { bg: G, fg: V, size: 10 }) + sparkle(296, 24, 0.7, G2) + sparkle(300, 156, 0.5);
    },
    ask: function () {
      return r(0, 132, 320, 48, 0, '#8B5527') + r(0, 132, 320, 6, 0, '#C98A4B') + r(0, 138, 320, 2, 0, '#E0A764') +
        '<g filter="url(#Ksh)">' + r(52, 34, 70, 100, 8, V) + '</g>' + t(87, 50, 'LOVED IT?', { s: 8.5, w: 700, c: '#fff', a: 'middle', ls: 0.6 }) + qr(62, 56, 50) + stars(66, 120, 0.42, 9.8) +
        r(60, 132, 54, 6, 3, 'rgba(255,255,255,.55)') +
        '<g transform="rotate(-8 214 92)">' + '<g filter="url(#Ksh)">' + r(186, 40, 58, 104, 12, '#0E0A1C') + '</g>' + r(190, 44, 50, 96, 9, '#fff') +
        r(198, 56, 34, 34, 4, 'none', ' stroke="' + G + '" stroke-width="2.4"') + '<path d="M198 73h34" stroke="' + G + '" stroke-width="1.6"/>' + stars(198, 104, 0.3, 7.4) + t(215, 124, 'Posted ✓', { s: 7.5, w: 700, c: '#188038', a: 'middle' }) + '</g>' +
        '<path d="M232 128c10 4 20 4 28 0l10 22h-46z" fill="#E8B48A"/>' +
        card(240, 18, 72, 34, 12) + '<path d="M248 52l-6 10 14-10z" fill="#fff"/>' + t(276, 32, 'Please review', { s: 8, w: 700, c: V, a: 'middle' }) + t(276, 44, 'us on Google!', { s: 8, w: 700, c: V, a: 'middle' }) +
        dash('M124 84 C 150 70, 168 70, 186 82') + sparkle(150, 40, 0.7, GOLD) + sparkle(30, 24, 0.6, G2) + star(168, 112, 0.5) + star(160, 30, 0.45);
    },
  };

  window.UScaleGbpArt = function (id) { return S[id] ? tile(S[id]()) : ''; };
})();
