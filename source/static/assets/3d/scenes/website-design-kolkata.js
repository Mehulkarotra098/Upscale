/* Kolkata: Howrah Bridge's steel cantilever over the Hooghly, a yellow taxi and a tram crossing, a boat on the river,
   old buildings on the bank, and a pin on Kolkata. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const river = K.place(K.water(10, 6.4, 0x5d6cc6), [0, -0.15, 0]); root.add(river); intro.push({ obj: river, from: 'rise' });
  const left = K.place(K.box(2.0, 0.5, 6.4, K.clay(0xe9dcc3), 0.3), [-4.0, 0, 0]); const right = K.place(K.box(2.0, 0.5, 6.4, K.clay(0xe9dcc3), 0.3), [4.0, 0, 0]);
  root.add(left, right); intro.push({ obj: left, from: 'rise', delay: 0.1 }, { obj: right, from: 'rise', delay: 0.12 });

  /* the bridge: deck, two tall towers, a truss outline of rods on each side */
  const steel = K.clay(0x8d8fa6, { rough: 0.45, metal: 0.3 });
  const deck = K.place(K.box(8.2, 0.12, 0.8, K.clay(0x6c6e82), 0.03), [0, 0.6, 0]); root.add(deck); intro.push({ obj: deck, delay: 0.5 });
  const truss = K.group();
  [-0.42, 0.42].forEach((z) => {
    const top = (x) => (Math.abs(x) > 2.2 ? 0.6 + (4.1 - Math.abs(x)) * 0.55 : 1.65 + Math.cos((x / 2.2) * Math.PI / 2) * 0.55);
    for (let x = -4.0; x < 4.0; x += 0.5) {
      const x2 = x + 0.5; truss.add(K.rod([x, top(x), z], [x2, top(x2), z], 0.035, steel), K.rod([x, 0.62, z], [x2, top(x2), z], 0.02, steel), K.rod([x, top(x), z], [x, 0.62, z], 0.02, steel));
    }
    [-2.2, 2.2].forEach((tx) => truss.add(K.rod([tx, 0.1, z], [tx, 2.6, z], 0.07, steel)));
  });
  [-2.2, 2.2].forEach((tx) => truss.add(K.rod([tx, 2.5, -0.42], [tx, 2.5, 0.42], 0.05, steel)));
  root.add(truss); intro.push({ obj: truss, from: 'grow-y', delay: 0.7, dur: 1.1 });

  /* a yellow taxi and a tram */
  const taxi = K.group(K.box(0.4, 0.14, 0.2, K.clay(0xf2c94c, { rough: 0.35 }), 0.05), K.place(K.box(0.24, 0.1, 0.18, K.clay(0xf2c94c, { rough: 0.35 }), 0.04), [-0.02, 0.11, 0]),
    K.place(K.box(0.2, 0.06, 0.19, K.glass(0x222244, { opacity: 0.8 }), 0.02), [-0.02, 0.12, 0]));
  taxi.position.set(-3.8, 0.74, 0.18); root.add(taxi);
  const tram = K.group(K.box(0.7, 0.24, 0.24, K.clay(0x3b8d6a, { rough: 0.4 }), 0.06), K.place(K.box(0.6, 0.07, 0.01, K.glow(0xfff1c9), 0), [0, 0.04, 0.121]),
    K.place(K.rod([0, 0.12, 0], [0.18, 0.5, 0], 0.01, K.clay(C.ink)), [0, 0, 0]));
  tram.position.set(3.8, 0.78, -0.2); root.add(tram);
  const boat = K.group(K.place(K.capsule(0.12, 0.7, K.clay(0x8b5a3c)), [0, 0, 0], [0, 0, Math.PI / 2]), K.place(K.extrude([[-0.3, 0], [0.3, 0], [0.2, 0.28], [-0.2, 0.28]], 0.3, K.clay(0xd9c4a6), { bevel: 0.01 }), [0, 0.08, 0]));
  K.place(boat, [-1.2, 0.05, 2.2]); root.add(boat);

  /* old buildings on the banks: low, warm-coloured, with columns of windows */
  [[-4.4, -2.4, 0.7, 0.9, 0xd98c6e], [-3.6, -1.6, 0.6, 1.2, 0xe2b07a], [-4.2, 1.8, 0.7, 0.8, 0xc9b28f], [4.3, -2.2, 0.7, 1.1, 0xd98c6e], [3.6, 1.6, 0.6, 0.9, 0xe2b07a], [4.4, 2.4, 0.5, 1.3, 0xc97a5a]].forEach(([x, z, s, h, c], i) => {
    const b = K.place(K.tower(s, h, s * 0.8, c, { seed: i, lit: 0xfff1c9, alt: 0xfff1c9, step: 0.22 }), [x, 0.25, z]); root.add(b); intro.push({ obj: b, from: 'grow-y', delay: 0.4 + i * 0.06 });
  });
  const pin = K.place(K.pin(C.green, 1, 'Kolkata'), [2.2, 3.6, 0]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.9 });

  return {
    root, intro, cam: [3.8, 4.6, 10.4], target: [0, 1.2, 0], fov: 28, sway: 0.12, fit: 0.74,
    update(t, dt, s) {
      taxi.position.x = -4.2 + ((t * 0.9) % 8.4); tram.position.x = 4.2 - ((t * 0.45) % 8.4);
      boat.position.x = -1.2 + Math.sin(t * 0.18) * 1.6; boat.rotation.z = Math.sin(t * 1.3) * 0.05;
      pin.position.y = 3.6 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07);
    },
  };
}
