/* Australia: "sorted by smoko". A tradie's ute on red earth, a toolbox in the tray, a hard hat on the bonnet, gum trees,
   and a job card floating above whose boxes tick themselves one by one. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = []; const faces = [];
  const earth = K.place(K.box(8.6, 0.5, 6.2, K.clay(0xd98b5f, { rough: 0.9 }), 0.35), [0, -0.25, 0]); root.add(earth); intro.push({ obj: earth, from: 'rise' });
  const road = K.place(K.box(8.6, 0.03, 1.4, K.clay(0xe9c9a6, { rough: 0.9 }), 0.02), [0, 0.01, 0.8]); root.add(road);
  /* the ute */
  const body = K.clay(C.white, { rough: 0.35 }); const dark = K.clay(0x2b2b35, { rough: 0.6 });
  const ute = K.group(K.place(K.box(2.6, 0.36, 1.2, body, 0.1), [0, 0.5, 0]), K.place(K.box(1.0, 0.5, 1.12, body, 0.14), [0.5, 0.9, 0]),
    K.place(K.box(0.92, 0.36, 1.14, K.glass(0x29304d, { opacity: 0.85 }), 0.1), [0.52, 0.94, 0]),
    K.place(K.box(1.3, 0.12, 1.14, dark, 0.03), [-0.62, 0.74, 0]), K.place(K.box(0.6, 0.3, 0.5, K.clay(0xe4473c, { rough: 0.4 }), 0.05), [-0.7, 0.95, 0]),
    K.place(K.box(0.1, 0.12, 1.0, K.glow(0xfff1c9), 0.02), [1.32, 0.52, 0]));
  [[0.8, 0.62], [-0.8, 0.62], [0.8, -0.62], [-0.8, -0.62]].forEach(([x, z]) => ute.add(K.place(K.cyl(0.26, 0.26, 0.2, dark, 24), [x, 0.26, z], [Math.PI / 2, 0, 0])));
  const hat = K.group(K.place(K.ball(0.2, K.clay(0xf2c14e, { rough: 0.4 }), 20), [0, 0, 0], [0, 0, 0], [1, 0.7, 1]), K.place(K.cyl(0.26, 0.26, 0.03, K.clay(0xf2c14e, { rough: 0.4 }), 24), [0, -0.04, 0]));
  K.place(hat, [1.05, 0.78, 0.2]); ute.add(hat);
  K.place(ute, [-0.4, 0, 0.8], [0, -0.35, 0]); root.add(ute); intro.push({ obj: ute, delay: 0.4, dur: 0.9 });
  /* gum trees */
  [[-3.4, -1.8], [-2.4, -2.4], [3.2, -2.0], [3.6, 1.8], [-3.6, 2.2]].forEach(([x, z], i) => { const tr = K.place(K.tree(1.1, 0x8fae7a), [x, 0, z]); root.add(tr); intro.push({ obj: tr, delay: 0.7 + i * 0.06 }); });
  /* the job card, ticking itself */
  const card = K.group(K.box(2.4, 1.7, 0.06, K.clay(C.white, { rough: 0.6 }), 0.08));
  card.add(K.place(K.label('Job #2041 · Bondi', { px: 54, color: '#251E45', height: 0.2, weight: 800 }), [0, 0.6, 0.04]));
  const items = ['Quote A$850, fixed', 'Design approved', 'Site live'].map((txt, i) => {
    card.add(K.place(K.label(txt, { px: 50, color: '#251E45', height: 0.17, weight: 600, align: 'left' }), [0.25, 0.22 - i * 0.36, 0.04]));
    const box = K.place(K.box(0.2, 0.2, 0.03, K.clay(0xeae4f6), 0.04), [-0.85, 0.22 - i * 0.36, 0.04]); const tick = K.place(K.ball(0.09, K.clay(C.green, { rough: 0.35 })), [-0.85, 0.22 - i * 0.36, 0.09]);
    card.add(box, tick); return tick;
  });
  K.place(card, [1.8, 2.7, -1.4], [0, -0.3, 0]); root.add(card); faces.push(card); intro.push({ obj: card, from: 'drop', delay: 1.4, dur: 0.8 });

  return {
    root, intro, cam: [5.6, 5.2, 9.6], target: [0.3, 1.3, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      items.forEach((tk, i) => { const k = Math.min(1, Math.max(0, ((t % 7) - 2 - i * 0.8) / 0.4)); tk.scale.setScalar(Math.max(0.001, K.ease.back(k))); });
      card.position.y = 2.7 + Math.sin(t * 1.2) * (s.calm ? 0.02 : 0.06); ute.position.y = Math.abs(Math.sin(t * 6)) * 0.01;
    },
  };
}
