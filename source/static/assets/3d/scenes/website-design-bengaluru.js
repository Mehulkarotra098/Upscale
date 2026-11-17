/* Bengaluru, the garden city: tech-park glass towers standing among round rain trees, a lake, the Namma Metro line on its
   pillars with a train, and a pin on Bengaluru. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const ground = K.place(K.box(9, 0.5, 6.6, K.clay(0xd9ecd0, { rough: 0.8 }), 0.35), [0, -0.25, 0]); root.add(ground); intro.push({ obj: ground, from: 'rise' });
  const lake = K.place(K.cyl(1.3, 1.3, 0.08, K.clay(0x4f6bd2, { rough: 0.2, env: 0.4 }), 56), [-2.6, 0.03, 1.4], [0, 0, 0], [1.3, 1, 0.8]); root.add(lake); intro.push({ obj: lake, delay: 0.25 });
  const rips = K.ripples([[-2.6, 1.4], [-3.2, 1.7]], 0.09); rips.forEach((q) => root.add(q.r));

  /* the tech park: glass towers with green roofs */
  const glass = K.glass(0x8fd0c8, { opacity: 0.62 }); const core = K.clay(0x2f6f6a, { rough: 0.5 });
  [[0.6, -1.4, 0.8, 2.6], [1.7, -1.8, 0.7, 3.2], [2.8, -1.2, 0.8, 2.2], [1.5, -0.4, 0.6, 1.6], [0.0, -2.4, 0.6, 1.9], [3.4, -2.4, 0.6, 2.7]].forEach(([x, z, s, h], i) => {
    const g = K.group(K.up(s * 0.86, h * 0.98, s * 0.86, core, 0.03), K.up(s, h, s, glass, 0.04), K.place(K.box(s * 0.9, 0.06, s * 0.9, K.clay(C.green), 0.02), [0, h + 0.03, 0]));
    for (let y = 0.22; y < h - 0.1; y += 0.22) if (((y * 10) | 0) % 3 !== i % 3) g.add(K.place(K.box(s * 0.6, 0.04, 0.01, K.glow(0xeafff8), 0), [0, y, s * 0.44]));
    K.place(g, [x, 0, z]); root.add(g); intro.push({ obj: g, from: 'grow-y', delay: 0.5 + i * 0.08, dur: 0.8 });
  });
  /* rain trees everywhere: wide, flat-topped crowns */
  const crown = K.clay(0x5aa646, { rough: 0.7 });
  const rain = (s) => K.group(K.place(K.cyl(0.05 * s, 0.07 * s, 0.5 * s, K.clay(0x7b5a3c), 8), [0, 0.25 * s, 0]), K.place(K.ball(0.42 * s, crown, 18), [0, 0.6 * s, 0], [0, 0, 0], [1.3, 0.55, 1.3]));
  [[-1.0, -0.2], [-1.6, 0.6], [-0.4, 0.8], [0.6, 0.9], [1.6, 1.2], [2.6, 0.6], [3.6, 0.2], [-3.6, -0.6], [-2.6, -1.4], [-3.7, -2.3], [-1.6, -2.4], [3.8, 1.8], [-0.6, 2.4], [0.9, 2.5]].forEach(([x, z], i) => {
    const r = K.place(rain(0.8 + (i % 3) * 0.15), [x, 0, z]); root.add(r); intro.push({ obj: r, delay: 0.8 + i * 0.04, dur: 0.5 });
  });

  /* the metro */
  const beamM = K.clay(C.mist, { rough: 0.5 });
  const beam = K.place(K.box(8.6, 0.13, 0.4, beamM, 0.05), [0, 0.95, 0.4]); root.add(beam); intro.push({ obj: beam, delay: 0.7 });
  for (let x = -4; x <= 4.01; x += 1.33) root.add(K.place(K.up(0.15, 0.9, 0.2, beamM, 0.04), [x, 0, 0.4]));
  const train = K.train(3, 0x8a4fc9, 0.5); train.position.set(-4, 1.03, 0.4); root.add(train);
  const pin = K.place(K.pin(C.green, 1, 'Bengaluru'), [1.7, 4.2, -1.8]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.9 });

  return {
    root, intro, cam: [6.0, 6.0, 9.4], target: [0, 1.1, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) { train.position.x = 4.6 - ((t * 0.85) % 10.4); K.stepRipples(rips, t); pin.position.y = 4.2 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07); },
  };
}
