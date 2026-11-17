/* Pune: the Western Ghats rising behind the city, a hill fort's walls on the highest hill, the metro on its pillars with a
   train crossing, the city's blocks below, and a pin on Pune. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const ground = K.place(K.box(9, 0.5, 6.6, K.clay(0xe8e1cf, { rough: 0.8 }), 0.35), [0, -0.25, 0]); root.add(ground); intro.push({ obj: ground, from: 'rise' });

  /* the Ghats */
  [[-3.0, -2.2, 1.9, 1.6, 0x6fae5a], [-0.6, -2.5, 2.6, 2.4, 0x5d9c4b], [2.4, -2.3, 2.1, 1.5, 0x79b864], [3.6, -1.5, 1.2, 0.9, 0x86c06f]].forEach(([x, z, r, h, c], i) => {
    const hl = K.place(K.ball(1, K.clay(c, { rough: 0.75, flat: true }), 14), [x, 0, z], [0, i, 0], [r, h, r * 0.75]); root.add(hl); intro.push({ obj: hl, from: 'grow-y', delay: 0.15 + i * 0.1, dur: 0.9 });
  });
  /* the fort: a ring of crenellated wall on the top of the highest hill */
  const stone = K.clay(0xc9b28f, { rough: 0.8 }); const fort = K.group();
  for (let a = 0; a < 16; a++) { const ang = (a / 16) * Math.PI * 2; fort.add(K.place(K.box(0.36, 0.22, 0.1, stone, 0.02), [Math.cos(ang) * 0.6, 0.11, Math.sin(ang) * 0.45], [0, -ang + Math.PI / 2, 0]));
    if (a % 2 === 0) fort.add(K.place(K.box(0.1, 0.12, 0.1, stone, 0.01), [Math.cos(ang) * 0.6, 0.28, Math.sin(ang) * 0.45])); }
  [[0.6, 0], [-0.6, 0], [0, 0.45]].forEach(([x, z]) => fort.add(K.place(K.cyl(0.13, 0.15, 0.42, stone, 14), [x, 0.21, z])));
  K.place(fort, [-0.6, 2.3, -2.4]); root.add(fort); intro.push({ obj: fort, delay: 1.0 });
  const flag = K.place(K.box(0.24, 0.14, 0.01, K.clay(0xf08a3c), 0), [-0.45, 2.95, -2.4]); const pole = K.place(K.cyl(0.012, 0.012, 0.5, K.clay(C.ink), 6), [-0.6, 2.8, -2.4]); root.add(pole, flag);

  /* the city */
  const tones = [C.plum, 0x5b4c9b, C.deep, 0x4a3d86];
  [[-3.2, 1.2, 0.5, 1.1], [-2.5, 2.0, 0.45, 0.8], [-1.6, 1.4, 0.55, 1.5], [0.2, 2.1, 0.5, 0.9], [1.1, 1.3, 0.6, 1.8], [2.1, 2.0, 0.45, 1.0], [3.0, 1.1, 0.5, 1.4], [-0.6, 0.6, 0.45, 0.7]].forEach(([x, z, s, h], i) => {
    const b = K.place(K.tower(s, h, s, tones[i % 4], { seed: i, step: 0.18 }), [x, 0, z]); root.add(b); intro.push({ obj: b, from: 'grow-y', delay: 0.6 + i * 0.06, dur: 0.7 });
  });
  [[-2.0, 0.3], [0.8, 0.4], [2.7, 0.3], [-3.6, 2.6], [3.6, 2.6]].forEach(([x, z]) => root.add(K.place(K.tree(0.75), [x, 0, z])));

  /* the metro on pillars, and its train */
  const beamM = K.clay(C.mist, { rough: 0.5 });
  const beam = K.place(K.box(8.4, 0.14, 0.42, beamM, 0.05), [0, 1.0, -0.3]); root.add(beam); intro.push({ obj: beam, delay: 0.8 });
  for (let x = -3.8; x <= 3.81; x += 1.27) { const p = K.place(K.up(0.16, 0.94, 0.2, beamM, 0.04), [x, 0, -0.3]); root.add(p); intro.push({ obj: p, from: 'grow-y', delay: 0.5, dur: 0.6 }); }
  const train = K.train(3, 0x2e8fd8, 0.5); train.position.set(-4, 1.08, -0.3); root.add(train);
  const pin = K.place(K.pin(C.green, 1, 'Pune'), [2.2, 3.1, 1.0]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.9 });
  const c1 = K.place(K.cloud(0.9), [1.6, 3.4, -2.8]); root.add(c1);

  return {
    root, intro, cam: [5.8, 5.4, 9.6], target: [0, 1.2, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      train.position.x = -4.6 + ((t * 0.9) % 10.4); flag.scale.x = 0.85 + Math.sin(t * 6) * 0.15;
      pin.position.y = 3.1 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07); c1.position.x = 1.6 + Math.sin(t * 0.14) * 0.6;
    },
  };
}
