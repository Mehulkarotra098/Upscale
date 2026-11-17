/* Website design in Mumbai: the Bandra–Worli Sea Link at dusk. Two inverted-Y towers with fanned cables, car lights
   crossing, Worli's towers with lit windows, Bandra's palms, ripples at the piers, and a pin dropping onto Mumbai. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const rod = (a, b, r, m) => {
    const A = new T.Vector3(...a), B = new T.Vector3(...b); const len = A.distanceTo(B);
    const g = new T.CylinderGeometry(r, r, len, 8); g.translate(0, len / 2, 0);
    const o = new T.Mesh(g, m); o.position.copy(A); o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.clone().sub(A).normalize()); o.castShadow = true; return o;
  };
  const up = (w, h, d, m, r = 0.05) => { const o = K.box(w, h, d, m, r); o.geometry.translate(0, h / 2, 0); return o; };

  /* sea and shores */
  const sea = K.place(K.box(10, 0.5, 5.6, K.clay(0x5f63c9, { rough: 0.32, env: 0.45 }), 0.35), [0, -0.25, 0]);
  const bandra = K.place(K.box(2.1, 0.5, 5.6, K.clay(C.sand), 0.3), [-4.05, 0, 0]);
  const worli = K.place(K.box(2.1, 0.5, 5.6, K.clay(C.cream), 0.3), [4.05, 0, 0]);
  root.add(sea, bandra, worli); intro.push({ obj: sea, from: 'rise', delay: 0 }, { obj: bandra, from: 'rise', delay: 0.1 }, { obj: worli, from: 'rise', delay: 0.15 });

  /* the deck, on piers */
  const deckM = K.clay(C.mist, { rough: 0.45 });
  const deck = K.place(K.box(7.4, 0.14, 0.62, deckM, 0.05), [0, 0.86, 0.2]); root.add(deck); intro.push({ obj: deck, delay: 0.55 });
  const rail = K.place(K.box(7.4, 0.05, 0.03, K.clay(C.lav), 0.01), [0, 0.96, 0.5]); root.add(rail);
  const rail2 = rail.clone(); rail2.position.z = -0.1; root.add(rail2);
  for (let x = -3.3; x <= 3.31; x += 0.66) { const p = K.place(up(0.12, 0.8, 0.34, deckM, 0.04), [x, 0, 0.2]); root.add(p); intro.push({ obj: p, from: 'grow-y', delay: 0.3 + (x + 3.3) * 0.02, dur: 0.6 }); }

  /* two inverted-Y towers and their cables */
  const towerM = K.clay(C.white, { rough: 0.4 }); const cableM = K.clay(C.lavLight, { rough: 0.3 });
  [-1.25, 1.45].forEach((tx, ti) => {
    const tw = K.group();
    tw.add(rod([tx, 0, 0.62], [tx, 2.7, 0.2], 0.07, towerM), rod([tx, 0, -0.22], [tx, 2.7, 0.2], 0.07, towerM), rod([tx, 2.6, 0.2], [tx, 3.75, 0.2], 0.06, towerM));
    for (let i = 0; i < 7; i++) {
      const y = 3.6 - i * 0.13; const dx = 0.45 + i * 0.36;
      [-1, 1].forEach((s) => [0.48, -0.08].forEach((z) => tw.add(rod([tx, y, 0.2], [tx + s * dx, 0.92, z], 0.008, cableM))));
    }
    root.add(tw); intro.push({ obj: tw, from: 'grow-y', delay: 0.7 + ti * 0.15, dur: 1.0 });
  });

  /* Worli towers with lit windows, Bandra's low blocks and palms */
  const tones = [C.plum, C.deep, 0x4a3d86, 0x5b4c9b, C.plum, 0x40357a, C.deep];
  const winM = K.glow(0xffe6a8); const winM2 = K.glow(C.lime);
  [[3.45, -1.9, 0.5, 2.6], [4.05, -1.3, 0.55, 3.4], [4.6, -1.95, 0.45, 2.0], [3.55, 1.3, 0.5, 1.7], [4.25, 1.65, 0.6, 2.9], [4.7, 0.9, 0.4, 1.4], [3.6, -0.55, 0.42, 1.2]].forEach(([x, z, s, h], i) => {
    const b = K.group(K.place(up(s, h, s, K.clay(tones[i]), 0.06), [0, 0, 0]));
    const rows = Math.floor(h / 0.22);
    for (let r = 1; r < rows; r++) if ((r + i) % 3) b.add(K.place(K.box(s * 0.62, 0.05, 0.01, (r * 7 + i) % 5 ? winM : winM2, 0), [0, r * 0.22, s / 2 + 0.006]));
    K.place(b, [x, 0.25, z]); root.add(b); intro.push({ obj: b, from: 'grow-y', delay: 1.0 + i * 0.07, dur: 0.8 });
  });
  [[-3.6, -1.8, 0.7, 0.5], [-4.4, -1.2, 0.6, 0.8], [-3.7, 1.5, 0.8, 0.45], [-4.5, 1.9, 0.5, 0.6]].forEach(([x, z, s, h], i) => {
    const b = K.place(up(s, h, s * 0.8, K.clay(i % 2 ? C.lav : C.lavLight), 0.08), [x, 0.25, z]); root.add(b); intro.push({ obj: b, from: 'grow-y', delay: 1.1 + i * 0.06, dur: 0.6 });
  });
  const trunkM = K.clay(0x8b6b4a); const leafM = K.clay(C.green, { rough: 0.5 });
  [[-3.3, -0.4], [-3.2, 0.7], [-4.7, 0.1], [-4.2, -2.4]].forEach(([x, z], i) => {
    const palm = K.group(K.place(K.cyl(0.03, 0.045, 0.75, trunkM, 8), [0, 0.37, 0], [0, 0, 0.12]));
    for (let k = 0; k < 6; k++) { const leaf = K.place(K.box(0.42, 0.02, 0.1, leafM, 0.01), [Math.cos(k) * 0.16 + 0.05, 0.78, Math.sin(k) * 0.16], [0, -k * 1.05, -0.45]); palm.add(leaf); }
    K.place(palm, [x, 0.25, z]); root.add(palm); intro.push({ obj: palm, delay: 1.3 + i * 0.05, dur: 0.6 });
  });

  /* car lights crossing both ways */
  const cars = []; const carG = new T.BoxGeometry(0.16, 0.06, 0.09);
  for (let i = 0; i < 14; i++) {
    const m = new T.Mesh(carG, K.glow(i % 2 ? 0xfff1c9 : C.lime)); const lane = i % 2 ? 0.05 : 0.33;
    m.position.set(-3.6 + ((i * 0.53) % 7.2), 0.97, lane); root.add(m); cars.push({ m, dir: i % 2 ? -1 : 1, v: 0.55 + (i % 3) * 0.15 });
  }

  /* ripples at the piers */
  const ripM = new T.MeshBasicMaterial({ color: C.white, transparent: true, opacity: 0.4, toneMapped: false, depthWrite: false });
  const rips = [-2.0, 0.0, 2.0].map((x, i) => { const r = new T.Mesh(new T.RingGeometry(0.2, 0.24, 48), ripM.clone()); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.01, 0.2); root.add(r); return { r, o: i * 0.9 }; });

  /* the pin, and two clouds */
  const pin = K.group(K.place(K.ball(0.26, K.clay(C.green, { rough: 0.35 })), [0, 0.42, 0]), K.place(K.cone(0.2, 0.42, K.clay(C.green, { rough: 0.35 })), [0, 0.13, 0], [Math.PI, 0, 0]),
    K.place(K.ball(0.1, K.clay(C.white)), [0, 0.45, 0.2]));
  const tag = K.place(K.label('Mumbai', { px: 56, bg: '#ffffff', color: '#251E45', height: 0.32 }), [0, 0.95, 0]);
  pin.add(tag); K.place(pin, [4.1, 3.7, -1.3]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.8, dur: 0.9 });
  const cloudM = K.clay(C.white, { rough: 0.9 });
  const cloud = (x, y, z, s) => { const c = K.group(K.place(K.ball(0.4, cloudM), [0, 0, 0]), K.place(K.ball(0.3, cloudM), [0.42, -0.06, 0.05]), K.place(K.ball(0.28, cloudM), [-0.4, -0.08, 0]), K.place(K.ball(0.22, cloudM), [0.1, 0.18, 0.1])); c.traverse((m) => { m.castShadow = false; }); return K.place(c, [x, y, z], [0, 0, 0], s); };
  const c1 = cloud(-2.6, 3.4, -1.6, 0.9); const c2 = cloud(1.8, 4.2, -2.4, 0.7); root.add(c1, c2); intro.push({ obj: c1, delay: 1.5 }, { obj: c2, delay: 1.65 });

  return {
    root, intro, cam: [8.2, 5.6, 9.4], target: [0.1, 1.5, 0], fov: 27, sway: 0.1, fit: 0.72,
    update(t, dt, s) {
      for (const c of cars) { c.m.position.x += c.dir * c.v * dt; if (c.m.position.x > 3.6) c.m.position.x = -3.6; if (c.m.position.x < -3.6) c.m.position.x = 3.6; }
      for (const r of rips) { const k = ((t + r.o) % 2.7) / 2.7; r.r.scale.setScalar(1 + k * 2.4); r.r.material.opacity = 0.45 * (1 - k); }
      pin.rotation.y = Math.sin(t * 0.8) * 0.25; pin.position.y = 3.7 + Math.sin(t * 1.6) * (s.calm ? 0.03 : 0.08);
      c1.position.x = -2.6 + Math.sin(t * 0.15) * 0.5; c2.position.x = 1.8 + Math.sin(t * 0.12 + 1) * 0.6;
    },
  };
}
