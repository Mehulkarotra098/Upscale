/* Chennai: Marina beach. A striped lighthouse whose beam sweeps the sea, waves rolling in onto the sand, a catamaran
   rocking offshore, the city's low skyline behind, palms on the promenade, and a pin on Chennai. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const sea = K.place(K.water(9.4, 3.4, 0x4f6bd2), [0, -0.15, 1.9]); root.add(sea); intro.push({ obj: sea, from: 'rise' });
  const sand = K.place(K.box(9.4, 0.5, 2.0, K.clay(0xf1dfb8, { rough: 0.9 }), 0.3), [0, 0, -0.6]); const prom = K.place(K.box(9.4, 0.56, 1.6, K.clay(0xe9e3f5, { rough: 0.8 }), 0.3), [0, 0.03, -2.4]);
  root.add(sand, prom); intro.push({ obj: sand, from: 'rise', delay: 0.1 }, { obj: prom, from: 'rise', delay: 0.15 });

  /* waves: soft white bands rolling towards the beach */
  const foam = new T.MeshBasicMaterial({ color: C.white, transparent: true, opacity: 0.6, toneMapped: false, depthWrite: false });
  const waves = [0, 1, 2].map((i) => { const w = new T.Mesh(new T.BoxGeometry(9.0, 0.02, 0.08), foam.clone()); root.add(w); return { w, o: i / 3 }; });

  /* the lighthouse, red and white bands, a turning beam */
  const lh = K.group(); const red = K.clay(0xd9453b, { rough: 0.45 }); const white = K.clay(C.white, { rough: 0.45 });
  for (let i = 0; i < 6; i++) lh.add(K.place(K.cyl(0.36 - i * 0.03, 0.39 - i * 0.03, 0.42, i % 2 ? red : white, 28), [0, 0.21 + i * 0.42, 0]));
  lh.add(K.place(K.cyl(0.3, 0.3, 0.06, K.clay(C.ink), 24), [0, 2.55, 0]), K.place(K.cyl(0.2, 0.2, 0.3, K.glass(0xfff3c4, { opacity: 0.8 }), 20), [0, 2.73, 0]), K.place(K.cone(0.24, 0.28, K.clay(C.ink), 20), [0, 3.02, 0]));
  const beamM = new T.MeshBasicMaterial({ color: 0xfff1b0, transparent: true, opacity: 0.22, toneMapped: false, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending });
  const beam = new T.Mesh(new T.ConeGeometry(0.7, 4.2, 24, 1, true), beamM); beam.geometry.translate(0, -2.1, 0); beam.geometry.rotateZ(Math.PI / 2);
  const pivot = K.group(beam); pivot.position.y = 2.73; lh.add(pivot);
  K.place(lh, [3.2, 0.31, -2.2]); root.add(lh); intro.push({ obj: lh, from: 'grow-y', delay: 0.5, dur: 1.0 });

  /* the catamaran */
  const boat = K.group(K.place(K.capsule(0.07, 0.6, K.clay(0x8b6b4a)), [0, 0, 0.12], [0, 0, Math.PI / 2]), K.place(K.capsule(0.07, 0.6, K.clay(0x8b6b4a)), [0, 0, -0.12], [0, 0, Math.PI / 2]),
    K.place(K.cyl(0.015, 0.015, 0.8, K.clay(C.ink), 6), [0, 0.4, 0]), K.extrude([[0, 0], [0.5, 0], [0, 0.65]], 0.01, K.clay(0xf2c14e, { rough: 0.6 }), { bevel: 0 }));
  boat.children[3].position.set(0.02, 0.1, 0); K.place(boat, [-1.6, 0.06, 2.4]); root.add(boat);

  /* the city behind, palms on the promenade */
  [[-3.8, -2.7, 0.5, 1.3], [-3.0, -2.9, 0.45, 0.9], [-2.1, -2.7, 0.55, 1.6], [-1.1, -2.9, 0.5, 1.1], [0.0, -2.7, 0.6, 1.9], [1.1, -2.9, 0.5, 1.0], [2.0, -2.8, 0.45, 1.4]].forEach(([x, z, s, h], i) => {
    const b = K.place(K.tower(s, h, s, [C.plum, 0x5b4c9b, C.deep, 0x4a3d86][i % 4], { seed: i, step: 0.18 }), [x, 0.31, z]); root.add(b); intro.push({ obj: b, from: 'grow-y', delay: 0.7 + i * 0.06, dur: 0.7 });
  });
  [-3.4, -1.6, 0.4, 1.8].forEach((x, i) => { const p = K.place(K.palm(0.9), [x, 0.31, -1.75]); root.add(p); intro.push({ obj: p, delay: 1.1 + i * 0.06 }); });
  const umb = [[-2.6, -0.4, 0xf08a6c], [-0.6, -0.8, 0x63b849], [1.4, -0.5, 0xf2c14e]].map(([x, z, c]) => K.place(K.group(K.place(K.cyl(0.015, 0.015, 0.5, K.clay(C.ink), 6), [0, 0.25, 0]), K.place(K.cone(0.32, 0.16, K.clay(c), 16), [0, 0.52, 0])), [x, 0.25, z]));
  umb.forEach((u) => root.add(u));
  const pin = K.place(K.pin(C.green, 1, 'Chennai'), [0.0, 3.6, -2.7]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.9 });

  return {
    root, intro, cam: [4.6, 5.0, 10.2], target: [0, 1.0, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      pivot.rotation.y = t * 0.9;
      for (const w of waves) { const k = (t * 0.22 + w.o) % 1; w.w.position.set(0, 0.02, 3.4 - k * 3.0); w.w.material.opacity = 0.6 * Math.sin(k * Math.PI); }
      boat.rotation.z = Math.sin(t * 1.4) * 0.08; boat.position.y = 0.06 + Math.sin(t * 1.4 + 1) * 0.03; boat.position.x = -1.6 + Math.sin(t * 0.2) * 0.6;
      pin.position.y = 3.6 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07);
    },
  };
}
