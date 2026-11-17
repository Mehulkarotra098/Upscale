/* Andheri East: the metro on its viaduct over the Western Express Highway, traffic on the road below, the airport runway
   with a plane taking off over offices, and a pin on Andheri. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const ground = K.place(K.box(9.4, 0.5, 6.6, K.clay(0xeee9f7, { rough: 0.8 }), 0.35), [0, -0.25, 0]); root.add(ground); intro.push({ obj: ground, from: 'rise' });
  const road = K.place(K.box(9.4, 0.04, 1.2, K.clay(0x46405e, { rough: 0.8 }), 0.03), [0, 0.02, 0.6]); root.add(road);
  for (let i = 0; i < 12; i++) road.add(K.place(K.box(0.3, 0.01, 0.04, K.glow(C.white), 0), [-4.2 + i * 0.78, 0.03, 0]));
  const cars = []; const carG = new T.BoxGeometry(0.2, 0.08, 0.12);
  for (let i = 0; i < 12; i++) { const m = new T.Mesh(carG, K.glow(i % 2 ? 0xfff1c9 : 0xff7a6a)); m.position.set(-4.4 + i * 0.75, 0.1, i % 2 ? 0.3 : 0.9); root.add(m); cars.push({ m, d: i % 2 ? -1 : 1, v: 0.7 + (i % 3) * 0.2 }); }

  /* the metro viaduct and train */
  const beamM = K.clay(C.mist, { rough: 0.5 });
  const beam = K.place(K.box(9.0, 0.14, 0.42, beamM, 0.05), [0, 1.3, -0.5]); root.add(beam); intro.push({ obj: beam, delay: 0.6 });
  for (let x = -4.2; x <= 4.21; x += 1.4) { const p = K.place(K.up(0.18, 1.24, 0.24, beamM, 0.04), [x, 0, -0.5]); root.add(p); intro.push({ obj: p, from: 'grow-y', delay: 0.4, dur: 0.6 }); }
  const train = K.train(4, 0x3a7be0, 0.48); train.position.set(-4, 1.38, -0.5); root.add(train);

  /* offices along the road */
  [[-3.6, -1.9, 0.6, 1.8], [-2.5, -2.2, 0.55, 2.4], [-1.4, -1.8, 0.6, 1.6], [0.0, -2.3, 0.7, 2.8], [1.3, -1.9, 0.6, 2.0], [2.5, -2.3, 0.55, 2.5], [3.6, -1.9, 0.6, 1.5]].forEach(([x, z, s, h], i) => {
    const b = K.place(K.tower(s, h, s, [C.plum, 0x5b4c9b, C.deep, 0x4a3d86][i % 4], { seed: i, side: true }), [x, 0, z]); root.add(b); intro.push({ obj: b, from: 'grow-y', delay: 0.7 + i * 0.06 });
  });
  /* the runway, and a plane climbing out */
  const runway = K.place(K.box(4.4, 0.04, 0.6, K.clay(0x3b3552, { rough: 0.8 }), 0.04), [1.8, 0.03, 2.5]); root.add(runway);
  for (let i = 0; i < 8; i++) runway.add(K.place(K.box(0.24, 0.01, 0.05, K.glow(C.white), 0), [-1.9 + i * 0.52, 0.03, 0]));
  const plane = K.group(K.place(K.capsule(0.1, 0.7, K.clay(C.white, { rough: 0.3 })), [0, 0, 0], [0, 0, Math.PI / 2]), K.place(K.box(0.2, 0.02, 0.95, K.clay(C.white), 0.01), [0.02, 0, 0]),
    K.place(K.box(0.14, 0.22, 0.02, K.clay(C.green), 0.01), [-0.4, 0.13, 0]), K.place(K.box(0.1, 0.02, 0.32, K.clay(C.white), 0.01), [-0.4, 0.02, 0]));
  root.add(plane);
  const pin = K.place(K.pin(C.green, 1, 'Andheri East'), [0, 4.0, -2.3]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.9 });

  return {
    root, intro, cam: [5.6, 5.4, 9.8], target: [0, 1.2, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      for (const c of cars) { c.m.position.x += c.d * c.v * dt; if (c.m.position.x > 4.6) c.m.position.x = -4.6; if (c.m.position.x < -4.6) c.m.position.x = 4.6; }
      train.position.x = 4.8 - ((t * 0.9) % 10);
      const k = (t * 0.11) % 1; const run = Math.min(1, k / 0.4); const climb = Math.max(0, (k - 0.4) / 0.6);
      plane.position.set(-0.2 + run * 3.0 + climb * 2.6, 0.16 + climb * climb * 3.2, 2.5 - climb * 1.4); plane.rotation.z = climb * 0.35; plane.visible = k < 0.97;
      pin.position.y = 4.0 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07);
    },
  };
}
