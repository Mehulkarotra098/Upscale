/* Jaipur, the pink city: a five-storey palace facade of small bay windows in a honeycomb, the windows lighting one by
   one, a street of shops in front, a camel cart passing, and a pin on Jaipur. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const street = K.place(K.box(9, 0.5, 5.6, K.clay(0xf0dcc2, { rough: 0.85 }), 0.35), [0, -0.25, 0]); root.add(street); intro.push({ obj: street, from: 'rise' });

  /* the facade: stepped storeys, each a row of small bay windows with domed tops */
  const pink = K.clay(0xe39a83, { rough: 0.7 }); const pinkD = K.clay(0xcf7f69, { rough: 0.7 }); const facade = K.group(); const wins = [];
  const rows = [9, 8, 7, 5, 3];
  rows.forEach((n, r) => {
    const y = r * 0.62; const w = n * 0.5;
    facade.add(K.place(K.box(w + 0.2, 0.62, 0.9 - r * 0.08, r % 2 ? pinkD : pink, 0.05), [0, y + 0.31, -r * 0.05]));
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + 0.25 + i * 0.5; const bay = K.group(K.box(0.36, 0.42, 0.24, pink, 0.06), K.place(K.ball(0.18, pinkD, 16), [0, 0.22, 0], [0, 0, 0], [1, 0.6, 0.7]));
      const glass = new T.Mesh(new T.PlaneGeometry(0.2, 0.26), new T.MeshBasicMaterial({ color: 0x3b2f70, toneMapped: false })); glass.position.set(0, -0.02, 0.125); bay.add(glass);
      K.place(bay, [x, y + 0.3, 0.45 - r * 0.05]); facade.add(bay); wins.push({ m: glass.material, k: (i * 7 + r * 3) % 11 });
    }
  });
  K.place(facade, [0, 0.0, -1.6]); root.add(facade); intro.push({ obj: facade, from: 'grow-y', delay: 0.3, dur: 1.2 });

  /* shops in front, with awnings */
  [[-3.4, 0xf2c14e], [-2.2, 0x63b849], [2.2, 0x3a7be0], [3.4, 0xe4473c]].forEach(([x, c], i) => {
    const s = K.group(K.up(1.0, 0.7, 0.7, K.clay(0xf4e4cf), 0.05), K.place(K.box(1.06, 0.04, 0.4, K.clay(c), 0.01), [0, 0.62, 0.45], [0.35, 0, 0]));
    K.place(s, [x, 0, 1.4]); root.add(s); intro.push({ obj: s, delay: 0.9 + i * 0.08 });
  });
  /* a camel cart */
  const camelM = K.clay(0xc69a5e, { rough: 0.8 });
  const camel = K.group(K.place(K.capsule(0.16, 0.42, camelM), [0, 0.62, 0], [0, 0, Math.PI / 2]), K.place(K.ball(0.16, camelM), [0, 0.86, 0]),
    K.place(K.rod([0.28, 0.62, 0], [0.45, 1.0, 0], 0.06, camelM), [0, 0, 0]), K.place(K.ball(0.09, camelM), [0.5, 1.02, 0]),
    ...[[-0.15, 0.08], [0.15, 0.08], [-0.15, -0.08], [0.15, -0.08]].map(([x, z]) => K.rod([x, 0, z], [x, 0.5, z], 0.035, camelM)),
    K.place(K.box(0.7, 0.12, 0.5, K.clay(0x8b5a3c), 0.03), [-0.7, 0.4, 0]), K.place(K.cyl(0.18, 0.18, 0.05, K.clay(C.ink), 16), [-0.7, 0.2, 0.28], [Math.PI / 2, 0, 0]));
  camel.position.set(-4, 0, 2.2); root.add(camel);
  const pin = K.place(K.pin(C.green, 1, 'Jaipur'), [0, 4.3, -1.6]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 2.0 });

  return {
    root, intro, cam: [3.2, 4.4, 9.8], target: [0, 1.4, -0.4], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      const on = Math.floor(t * 2.5) % 11;
      for (const w of wins) w.m.color.setHex(w.k === on || w.k === (on + 5) % 11 ? 0xffd27a : 0x3b2f70);
      camel.position.x = -4.4 + ((t * 0.35) % 8.8); camel.position.y = Math.abs(Math.sin(t * 4)) * 0.03;
      pin.position.y = 4.3 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07);
    },
  };
}
