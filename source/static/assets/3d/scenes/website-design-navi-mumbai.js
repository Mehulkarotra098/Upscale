/* Navi Mumbai: the Vashi bridge over Thane Creek, the planned sector grid on the far side, the new airport's runway
   with a plane taking off, and a pin on Navi Mumbai. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const creek = K.place(K.water(10, 6.6, 0x5563cc), [0, -0.15, 0]); root.add(creek); intro.push({ obj: creek, from: 'rise' });
  const west = K.place(K.box(2.4, 0.5, 6.6, K.clay(C.sand), 0.3), [-3.8, 0, 0]); const east = K.place(K.box(4.2, 0.5, 6.6, K.clay(0xe9e3f5), 0.3), [2.9, 0, 0]);
  root.add(west, east); intro.push({ obj: west, from: 'rise', delay: 0.1 }, { obj: east, from: 'rise', delay: 0.15 });

  /* the Vashi bridge: a long low deck on many piers */
  const deckM = K.clay(C.mist, { rough: 0.45 });
  const deck = K.place(K.box(3.4, 0.12, 0.7, deckM, 0.04), [-0.95, 0.62, -0.6]); root.add(deck); intro.push({ obj: deck, delay: 0.5 });
  for (let x = -2.4; x <= 0.55; x += 0.42) { const p = K.place(K.up(0.12, 0.56, 0.5, deckM, 0.03), [x, 0, -0.6]); root.add(p); intro.push({ obj: p, from: 'grow-y', delay: 0.3 + (x + 2.4) * 0.05, dur: 0.5 }); }
  const cars = []; const carG = new T.BoxGeometry(0.14, 0.06, 0.08);
  for (let i = 0; i < 8; i++) { const m = new T.Mesh(carG, K.glow(i % 2 ? 0xfff1c9 : C.lime)); m.position.set(-2.6 + i * 0.42, 0.72, i % 2 ? -0.75 : -0.45); root.add(m); cars.push({ m, d: i % 2 ? -1 : 1 }); }

  /* the planned sectors: a grid of low blocks with green squares between */
  const blockM = [K.clay(C.lav), K.clay(0xb3a6dd), K.clay(0xd8cff0)]; const sectors = K.group();
  for (let gx = 0; gx < 4; gx++) for (let gz = 0; gz < 3; gz++) {
    const x = 1.4 + gx * 0.82; const z = -2.6 + gz * 0.9;
    if ((gx + gz) % 4 === 1) { sectors.add(K.place(K.box(0.62, 0.05, 0.62, K.clay(C.mint), 0.06), [x, 0.27, z])); sectors.add(K.place(K.tree(0.6), [x, 0.27, z])); continue; }
    const h = 0.25 + ((gx * 3 + gz * 5) % 4) * 0.22; sectors.add(K.place(K.tower(0.6, h, 0.6, [C.plum, 0x5b4c9b, C.deep][(gx + gz) % 3], { seed: gx + gz, step: 0.16 }), [x, 0.25, z]));
  }
  root.add(sectors); intro.push({ obj: sectors, from: 'grow-y', delay: 0.7, dur: 0.9 });

  /* the runway and a plane taking off */
  const runway = K.place(K.box(3.6, 0.04, 0.6, K.clay(0x3b3552, { rough: 0.8 }), 0.04), [2.9, 0.27, 1.9]); root.add(runway);
  for (let i = 0; i < 7; i++) runway.add(K.place(K.box(0.24, 0.01, 0.05, K.glow(C.white), 0), [-1.5 + i * 0.5, 0.03, 0]));
  const plane = K.group(K.place(K.capsule(0.09, 0.62, K.clay(C.white, { rough: 0.3 })), [0, 0, 0], [0, 0, Math.PI / 2]),
    K.place(K.box(0.18, 0.02, 0.86, K.clay(C.white, { rough: 0.3 }), 0.01), [0.02, 0, 0]), K.place(K.box(0.12, 0.2, 0.02, K.clay(C.green), 0.01), [-0.36, 0.12, 0]),
    K.place(K.box(0.1, 0.02, 0.3, K.clay(C.white), 0.01), [-0.36, 0.02, 0]));
  root.add(plane);
  const pin = K.place(K.pin(C.green, 1, 'Navi Mumbai'), [2.5, 3.2, -1.8]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.8 });
  const tr = [[-3.6, 1.6], [-4.3, -1.8], [-3.3, -2.6]].map(([x, z]) => { const p = K.place(K.palm(0.9), [x, 0.25, z]); root.add(p); return p; });
  const c1 = K.place(K.cloud(0.8), [0.4, 3.4, -2.6]); root.add(c1);

  return {
    root, intro, cam: [6.4, 6.4, 9.2], target: [0.2, 0.9, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      for (const c of cars) { c.m.position.x += c.d * 0.6 * dt; if (c.m.position.x > 0.7) c.m.position.x = -2.6; if (c.m.position.x < -2.6) c.m.position.x = 0.7; }
      const k = (t * 0.12) % 1; const run = Math.min(1, k / 0.45); const climb = Math.max(0, (k - 0.45) / 0.55);
      plane.position.set(1.2 + run * 2.6 + climb * 2.2, 0.38 + climb * climb * 2.6, 1.9 - climb * 1.2); plane.rotation.z = climb * 0.35; plane.rotation.y = climb * 0.3; plane.visible = k < 0.97;
      pin.position.y = 3.2 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07); c1.position.x = 0.4 + Math.sin(t * 0.14) * 0.6;
    },
  };
}
