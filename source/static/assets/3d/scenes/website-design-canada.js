/* Canada: "Bonjour, hello". A thick card that turns between the English and French versions of the same page, on a snowy
   tile with pines, a warm cabin window, and snow falling. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const snow = K.place(K.box(8, 0.5, 6, K.clay(0xf4f6fb, { rough: 0.9 }), 0.4), [0, -0.25, 0]); root.add(snow); intro.push({ obj: snow, from: 'rise' });
  const pine = (s) => { const m = K.clay(0x2f6b4f, { rough: 0.7 }); const w = K.clay(C.white, { rough: 0.9 }); return K.group(K.place(K.cyl(0.05 * s, 0.07 * s, 0.3 * s, K.clay(0x6b4a33), 8), [0, 0.15 * s, 0]),
    K.place(K.cone(0.42 * s, 0.7 * s, m, 10), [0, 0.6 * s, 0]), K.place(K.cone(0.32 * s, 0.6 * s, m, 10), [0, 0.95 * s, 0]), K.place(K.cone(0.2 * s, 0.45 * s, w, 10), [0, 1.25 * s, 0])); };
  [[-3.2, -1.8, 1.2], [-2.4, -2.4, 0.9], [-3.4, 1.6, 1.0], [3.2, -1.9, 1.3], [2.6, 2.1, 0.9], [3.5, 0.9, 1.0], [-1.8, 2.4, 0.8]].forEach(([x, z, s], i) => { const p = K.place(pine(s), [x, 0, z]); root.add(p); intro.push({ obj: p, delay: 0.4 + i * 0.06 }); });
  const cabin = K.group(K.up(1.2, 0.7, 0.9, K.clay(0x9a5a3c), 0.04), K.place(K.extrude([[-0.75, 0], [0.75, 0], [0, 0.5]], 1.0, K.clay(C.white, { rough: 0.9 }), { bevel: 0.02 }), [0, 0.7, 0]),
    K.place(K.box(0.3, 0.24, 0.02, K.glow(0xffd27a), 0.02), [0.25, 0.4, 0.46]));
  K.place(cabin, [-2.0, 0, -1.6], [0, 0.5, 0]); root.add(cabin); intro.push({ obj: cabin, delay: 0.6 });

  /* the card: English on one face, French on the other */
  const face = (title, sub, btn, lang) => {
    const f = K.group(K.place(K.label(lang, { px: 50, bg: '#F1EDFA', color: '#251E45', height: 0.2, weight: 800 }), [-0.75, 0.62, 0]),
      K.place(K.label(title, { px: 70, color: '#251E45', height: 0.42, weight: 800 }), [0, 0.2, 0]), K.place(K.label(sub, { px: 48, color: '#5B5478', height: 0.18, weight: 500 }), [0, -0.18, 0]),
      K.place(K.label(btn, { px: 56, bg: '#63B849', color: '#251E45', height: 0.28, weight: 800 }), [0, -0.55, 0]));
    return f;
  };
  const card = K.group(K.box(2.6, 1.7, 0.12, K.clay(C.white, { rough: 0.5 }), 0.1));
  card.add(K.place(face('Fresh bread', 'Croissants and sourdough', 'Order', 'EN'), [0, 0, 0.07]));
  card.add(K.place(face('Du pain frais', 'Croissants et levain', 'Commander', 'FR'), [0, 0, -0.07], [0, Math.PI, 0]));
  card.add(K.place(K.box(2.62, 0.08, 0.13, K.clay(0xd9453b), 0.02), [0, 0.86, 0]));
  K.place(card, [0.4, 2.0, 0.2]); root.add(card); intro.push({ obj: card, delay: 0.9, dur: 0.9 });

  /* falling snow */
  const n = 220; const sp = new Float32Array(n * 3); for (let i = 0; i < n; i++) sp.set([(Math.random() - 0.5) * 8, Math.random() * 5, (Math.random() - 0.5) * 6], i * 3);
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3)); const flakes = new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.9 })); root.add(flakes);

  return {
    root, intro, cam: [3.4, 4.0, 10.2], target: [0, 1.5, 0], fov: 28, sway: 0.08, fit: 0.74,
    update(t, dt, s) {
      const k = (t % 6) / 6; const flip = k < 0.42 ? 0 : k < 0.5 ? (k - 0.42) / 0.08 : k < 0.92 ? 1 : 1 - (k - 0.92) / 0.08;
      card.rotation.y = K.ease.inOut(flip) * Math.PI + Math.sin(t * 0.7) * 0.06; card.position.y = 2.0 + Math.sin(t * 1.1) * 0.06;
      const a = sg.attributes.position.array; for (let i = 0; i < n; i++) { a[i * 3 + 1] -= dt * (s.calm ? 0.2 : 0.5); if (a[i * 3 + 1] < 0) a[i * 3 + 1] = 5; } sg.attributes.position.needsUpdate = true;
    },
  };
}
