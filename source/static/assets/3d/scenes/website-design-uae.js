/* UAE: "WhatsApp first". A phone standing over golden dunes, its chat flipping between English (left to right) and
   Arabic (right to left), the sun low, and slim towers on the horizon. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const base = K.place(K.box(8.6, 0.4, 6.2, K.clay(0xe8c88f, { rough: 0.9 }), 0.35), [0, -0.2, 0]); root.add(base); intro.push({ obj: base, from: 'rise' });
  [[-2.6, -1.0, 2.2, 0.8], [0.6, -2.0, 2.8, 1.0], [2.8, 0.6, 1.8, 0.6], [-1.2, 1.8, 2.0, 0.5]].forEach(([x, z, r, h], i) => {
    const d = K.place(K.ball(1, K.clay(i % 2 ? 0xe2b877 : 0xedcf98, { rough: 0.95 }), 40), [x, 0, z], [0, i, 0], [r, h, r * 0.6]); root.add(d); intro.push({ obj: d, from: 'grow-y', delay: 0.15 + i * 0.1 });
  });
  [[-3.6, -2.6, 0.32, 3.4], [-3.0, -2.7, 0.26, 2.6], [3.4, -2.6, 0.3, 3.0]].forEach(([x, z, s, h], i) => { const tw = K.place(K.tower(s, h, s, [0x7b6fae, 0x8f84c0, 0x6c61a0][i], { seed: i, step: 0.2 }), [x, 0, z]); root.add(tw); intro.push({ obj: tw, from: 'grow-y', delay: 0.5 }); });
  const sun = K.place(K.ball(0.7, K.clay(0xf6a74e, { rough: 0.5, emissive: 0xe0782a, ei: 0.6 })), [1.8, 2.6, -3.2]); root.add(sun);

  /* the phone, with two screens: English and Arabic */
  const phone = K.group(K.box(1.5, 3.0, 0.16, K.clay(0x1d1d24, { rough: 0.3 }), 0.2), K.place(K.box(1.38, 2.86, 0.02, K.clay(0xefeae2, { rough: 0.8 }), 0.16), [0, 0, 0.08]),
    K.place(K.box(0.4, 0.09, 0.02, K.clay(0x000000), 0.04), [0, 1.3, 0.1]));
  const screen = (rtl) => {
    const g = K.group(K.place(K.label(rtl ? 'دار العقارات' : 'Dune Realty', { px: 56, bg: '#F6F6F6', color: '#111111', height: 0.24, weight: 800 }), [0, 1.05, 0.1]));
    const msgs = rtl ? [['in', 'هل الشقة متاحة؟'], ['out', 'نعم، متى تريد الزيارة؟'], ['in', 'غداً الساعة ٥']] : [['in', 'Is the flat available?'], ['out', 'Yes! When can you visit?'], ['in', 'Tomorrow at 5']];
    msgs.forEach(([d, x], i) => { const mine = d === 'out'; const side = (mine ? 1 : -1) * (rtl ? -1 : 1);
      g.add(K.place(K.label(x, { px: 46, bg: mine ? '#D9FDD3' : '#FFFFFF', color: '#111111', height: 0.2, weight: 600, radius: 14 }), [side * 0.2, 0.55 - i * 0.42, 0.1])); });
    return g;
  };
  const en = screen(false); const ar = screen(true); phone.add(en, ar);
  K.place(phone, [-0.4, 2.0, 0.6], [0, 0.25, 0]); root.add(phone); intro.push({ obj: phone, delay: 0.8, dur: 0.9 });
  const tag = K.place(K.label('English ⇄ عربي', { px: 54, bg: '#63B849', color: '#251E45', height: 0.3 }), [1.4, 3.5, 0.6]); root.add(tag); intro.push({ obj: tag, from: 'drop', delay: 1.6 });

  return {
    root, intro, cam: [2.8, 3.8, 10.4], target: [0, 1.8, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      const showAr = Math.floor(t / 3.5) % 2 === 1; en.visible = !showAr; ar.visible = showAr;
      phone.position.y = 2.0 + Math.sin(t * 1.1) * (s.calm ? 0.02 : 0.07); phone.rotation.y = 0.25 + Math.sin(t * 0.5) * 0.06; tag.position.y = 3.5 + Math.sin(t * 1.4) * 0.05;
    },
  };
}
