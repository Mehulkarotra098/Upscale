/* Netherlands: an Amsterdam canal with narrow gabled houses, bicycles on the bridge, a boat gliding, and a floating ring
   showing 86%: the share of Dutch people who speak English. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = []; const faces = [];
  const canal = K.place(K.water(9.4, 6.2, 0x4f62c4), [0, -0.15, 0]); root.add(canal); intro.push({ obj: canal, from: 'rise' });
  const quay = K.place(K.box(9.4, 0.5, 1.8, K.clay(0xd8c9b2, { rough: 0.85 }), 0.25), [0, 0, -2.2]); const quay2 = K.place(K.box(9.4, 0.5, 1.2, K.clay(0xd8c9b2, { rough: 0.85 }), 0.25), [0, 0, 2.5]);
  root.add(quay, quay2); intro.push({ obj: quay, from: 'rise', delay: 0.1 }, { obj: quay2, from: 'rise', delay: 0.1 });
  /* canal houses with gables */
  const cols = [0x6b3a2a, 0x2f3e57, 0x7a4b2d, 0x3e4f3a, 0x8c5a3c, 0x4a3b5e, 0x704030];
  cols.forEach((c, i) => {
    const x = -3.9 + i * 1.3; const h = 2.0 + ((i * 37) % 3) * 0.3; const m = K.clay(c, { rough: 0.6 }); const w = 1.18;
    const hs = K.group(K.up(w, h, 1.0, m, 0.03), K.place(K.extrude(i % 2 ? [[-w / 2, 0], [w / 2, 0], [w / 2, 0.2], [0.25, 0.2], [0.25, 0.4], [-0.25, 0.4], [-0.25, 0.2], [-w / 2, 0.2]] : [[-w / 2, 0], [w / 2, 0], [0.3, 0.3], [0.2, 0.55], [-0.2, 0.55], [-0.3, 0.3]], 1.0, m, { bevel: 0.01 }), [0, h, 0]));
    for (let r = 0; r < 3; r++) for (const wx of [-0.3, 0, 0.3]) hs.add(K.place(K.box(0.18, 0.28, 0.02, K.clay(C.white, { rough: 0.4 }), 0.02), [wx, 0.5 + r * 0.55, 0.51]));
    K.place(hs, [x, 0.25, -2.4]); root.add(hs); intro.push({ obj: hs, from: 'grow-y', delay: 0.3 + i * 0.07, dur: 0.8 });
  });
  /* the bridge and bicycles */
  const bridge = K.place(K.box(1.6, 0.16, 4.2, K.clay(0xbfae96, { rough: 0.8 }), 0.06), [2.4, 0.4, 0.15]); root.add(bridge);
  const bike = (c) => { const m = K.clay(c, { rough: 0.4 }); const tyre = K.clay(C.ink); return K.group(K.place(K.torus(0.16, 0.025, tyre), [-0.24, 0.18, 0]), K.place(K.torus(0.16, 0.025, tyre), [0.24, 0.18, 0]),
    K.rod([-0.24, 0.18, 0], [0, 0.34, 0], 0.02, m), K.rod([0, 0.34, 0], [0.24, 0.18, 0], 0.02, m), K.rod([0, 0.34, 0], [0.18, 0.44, 0], 0.02, m), K.rod([-0.24, 0.18, 0], [-0.08, 0.42, 0], 0.02, m)); };
  [[2.1, 0.48, -0.6, 0x3a7be0], [2.7, 0.48, 0.4, 0xe4473c], [2.2, 0.48, 1.2, 0xf2c14e]].forEach(([x, y, z, c], i) => { const b = K.place(bike(c), [x, y, z], [0, Math.PI / 2, 0]); root.add(b); intro.push({ obj: b, delay: 1.0 + i * 0.1 }); });
  const boat = K.group(K.place(K.box(1.4, 0.18, 0.5, K.clay(0x2f3e57), 0.08), [0, 0.06, 0]), K.place(K.box(0.9, 0.18, 0.4, K.glass(0xd8e4ff, { opacity: 0.6 }), 0.06), [0.1, 0.24, 0]));
  root.add(boat);
  /* the 86% ring */
  const ringG = K.group(K.place(K.torus(0.62, 0.12, K.clay(0xe7e0f7)), [0, 0, 0]), K.place(K.torus(0.62, 0.13, K.clay(C.green, { rough: 0.35 }), Math.PI * 2 * 0.86), [0, 0, 0], [0, 0, Math.PI / 2]));
  ringG.add(K.place(K.label('86%', { px: 90, color: '#ffffff', height: 0.42, weight: 800 }), [0, 0.06, 0.02]), K.place(K.label('speak English', { px: 50, bg: '#ffffff', color: '#251E45', height: 0.22 }), [0, -0.98, 0]));
  K.place(ringG, [-1.0, 2.6, 0.6]); root.add(ringG); faces.push(ringG); intro.push({ obj: ringG, delay: 1.4, dur: 0.9 });

  return {
    root, intro, cam: [3.4, 4.2, 10.2], target: [0, 1.5, -0.2], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) { boat.position.set(-4.2 + ((t * 0.5) % 8.4), 0.02, 0.6); ringG.position.y = 2.6 + Math.sin(t * 1.1) * (s.calm ? 0.02 : 0.07); },
  };
}
