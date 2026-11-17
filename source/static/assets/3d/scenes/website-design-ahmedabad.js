/* Ahmedabad: the Sabarmati riverfront. Stepped promenades on both banks, the kite-shaped canopy of the footbridge across
   the river, kites in the sky on their strings, the city behind, and a pin on Ahmedabad. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const river = K.place(K.water(10, 6.4, 0x5563cc), [0, -0.15, 0]); root.add(river); intro.push({ obj: river, from: 'rise' });
  /* stepped promenades */
  const step = K.clay(0xeae2d0, { rough: 0.8 }); const banks = K.group();
  [-1, 1].forEach((sd) => { for (let k = 0; k < 3; k++) banks.add(K.place(K.box(10, 0.18 + k * 0.16, 0.5, step, 0.04), [0, (0.18 + k * 0.16) / 2, sd * (1.3 + k * 0.5)])); banks.add(K.place(K.box(10, 0.66, 1.4, K.clay(0xe9e3f5), 0.2), [0, 0.33, sd * 3.0])); });
  root.add(banks); intro.push({ obj: banks, from: 'grow-y', delay: 0.15, dur: 0.8 });

  /* the footbridge: a deck across, with a curving kite-coloured canopy */
  const deck = K.place(K.box(0.7, 0.1, 4.6, K.clay(C.mist), 0.03), [0.6, 0.72, 0]); root.add(deck); intro.push({ obj: deck, delay: 0.5 });
  [-1.4, 0, 1.4].forEach((z) => root.add(K.place(K.up(0.1, 0.68, 0.1, K.clay(C.mist), 0.02), [0.6, 0, z])));
  const canopy = K.group(); const cols = [0xe4473c, 0xf2c14e, 0x63b849, 0x3a7be0, 0xb04fc9, 0xf08a3c];
  for (let i = 0; i < 6; i++) { const z = -2.0 + i * 0.8; const m = K.clay(cols[i], { rough: 0.45 });
    canopy.add(K.place(K.extrude([[-0.5, 0], [0, 0.42], [0.5, 0], [0, -0.1]], 0.7, m, { bevel: 0.02 }), [0.6, 1.3, z], [0, Math.PI / 2, 0]));
    canopy.add(K.rod([0.3, 0.78, z], [0.6, 1.3, z], 0.015, K.clay(C.ink)), K.rod([0.9, 0.78, z], [0.6, 1.3, z], 0.015, K.clay(C.ink))); }
  root.add(canopy); intro.push({ obj: canopy, delay: 0.9, dur: 0.9 });

  /* kites on strings, swaying */
  const kites = [[-2.6, 3.2, -1.0, 0xe4473c], [-0.8, 3.8, -2.0, 0xf2c14e], [2.4, 3.4, -1.4, 0x3a7be0], [3.4, 2.8, 0.6, 0xb04fc9], [-3.6, 2.6, 1.2, 0x63b849]].map(([x, y, z, c], i) => {
    const k = K.group(K.extrude([[0, 0.34], [0.26, 0], [0, -0.34], [-0.26, 0]], 0.01, K.clay(c, { rough: 0.5 }), { bevel: 0 }), K.place(K.box(0.02, 0.5, 0.005, K.clay(C.white), 0), [0, -0.5, 0]));
    K.place(k, [x, y, z], [0, 0.4, 0.3]); root.add(k);
    const str = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(x, y - 0.3, z), new T.Vector3(x * 0.5, 0.7, 3.0)]), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
    root.add(str); intro.push({ obj: k, delay: 1.2 + i * 0.12, dur: 0.7 }); return { k, y, o: i };
  });
  /* the city behind */
  [[-3.6, -3.2, 0.6, 1.4], [-2.4, -3.3, 0.5, 1.0], [-1.2, -3.1, 0.6, 1.8], [0.4, -3.3, 0.5, 1.2], [1.7, -3.1, 0.6, 2.1], [3.0, -3.3, 0.5, 1.3], [3.9, -3.0, 0.45, 0.9]].forEach(([x, z, s, h], i) => {
    const b = K.place(K.tower(s, h, s, [C.plum, 0x5b4c9b, C.deep, 0x4a3d86][i % 4], { seed: i, step: 0.18 }), [x, 0.66, z]); root.add(b); intro.push({ obj: b, from: 'grow-y', delay: 0.6 + i * 0.06 });
  });
  const pin = K.place(K.pin(C.green, 1, 'Ahmedabad'), [-1.2, 4.0, -3.1]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.9 });

  return {
    root, intro, cam: [6.2, 5.0, 9.4], target: [0, 1.4, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      for (const q of kites) { q.k.position.y = q.y + Math.sin(t * 1.1 + q.o) * 0.18; q.k.rotation.z = 0.3 + Math.sin(t * 1.6 + q.o) * 0.25; }
      pin.position.y = 4.0 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07);
    },
  };
}
