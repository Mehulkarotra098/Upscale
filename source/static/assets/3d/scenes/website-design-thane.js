/* Thane, the city of lakes: Upvan lake with its fountain, the Yeoor hills behind, the Central line curving past with a
   train running, towers along Ghodbunder Road, trees round the water, and a pin on Thane. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const land = K.place(K.box(9, 0.5, 6.4, K.clay(0xdfeed6, { rough: 0.8 }), 0.35), [0, -0.25, 0]); root.add(land); intro.push({ obj: land, from: 'rise' });

  /* the hills behind */
  const hillM = K.clay(0x7fbf68, { rough: 0.7 }); const hillM2 = K.clay(0x68ab55, { rough: 0.7 });
  [[-2.6, -2.2, 2.0, 1.3, hillM], [-0.4, -2.5, 2.4, 1.7, hillM2], [2.2, -2.3, 2.1, 1.2, hillM]].forEach(([x, z, r, h, m], i) => {
    const hl = K.place(K.ball(1, m, 40), [x, 0, z], [0, 0, 0], [r, h, r * 0.7]); root.add(hl); intro.push({ obj: hl, from: 'grow-y', delay: 0.2 + i * 0.1, dur: 0.9 });
  });

  /* the lake, its fountain and ripples */
  const lake = K.place(K.cyl(1.9, 1.9, 0.08, K.clay(0x4f6bd2, { rough: 0.2, env: 0.4 }), 64), [-1.0, 0.03, 0.9], [0, 0, 0], [1, 1, 0.7]); root.add(lake); intro.push({ obj: lake, delay: 0.3 });
  const bank = K.place(K.torus(1.92, 0.07, K.clay(C.cream)), [-1.0, 0.06, 0.9], [Math.PI / 2, 0, 0], [1, 0.7, 1]); root.add(bank);
  const jetM = new T.MeshBasicMaterial({ color: 0xe8f3ff, transparent: true, opacity: 0.75, toneMapped: false });
  const jet = new T.Mesh(new T.CylinderGeometry(0.03, 0.08, 1, 12), jetM); jet.geometry.translate(0, 0.5, 0); jet.position.set(-1.0, 0.08, 0.9); root.add(jet);
  const spray = new T.Mesh(new T.SphereGeometry(0.16, 16, 12), jetM); root.add(spray);
  const rips = K.ripples([[-1.0, 0.9], [-1.6, 1.4], [-0.3, 0.5]], 0.09); rips.forEach((q) => root.add(q.r));
  [[-3.1, 0.3], [-2.9, 1.8], [-0.2, 2.2], [0.8, 1.6], [-1.9, -0.3]].forEach(([x, z], i) => { const tr = K.place(K.tree(0.9 + (i % 2) * 0.2), [x, 0, z]); root.add(tr); intro.push({ obj: tr, delay: 0.9 + i * 0.06, dur: 0.6 }); });

  /* the Central line, curving past, and its train */
  const pts = [[-4.4, 0.08, 2.9], [-1.5, 0.08, 3.0], [1.0, 0.08, 2.4], [2.4, 0.08, 1.0], [3.0, 0.08, -0.8], [3.2, 0.08, -2.9]].map((p) => new T.Vector3(...p));
  const curve = new T.CatmullRomCurve3(pts);
  const bed = new T.Mesh(new T.TubeGeometry(curve, 120, 0.12, 8, false), K.clay(0xbfb3e2, { rough: 0.6 })); bed.scale.y = 0.4; bed.receiveShadow = true; root.add(bed);
  const rail = new T.Mesh(new T.TubeGeometry(curve, 120, 0.025, 6, false), K.metal(0x9a9aa6)); rail.position.y = 0.06; root.add(rail);
  const train = K.train(3, C.violet, 0.4); root.add(train);

  /* towers along Ghodbunder Road */
  [[1.6, -0.6, 0.55, 2.2], [2.2, 0.1, 0.5, 1.6], [0.9, -1.2, 0.5, 2.8], [1.7, -1.6, 0.6, 3.3], [2.7, -1.0, 0.45, 1.9]].forEach(([x, z, s, h], i) => {
    const t = K.place(K.tower(s, h, s, [C.plum, 0x5b4c9b, C.deep, 0x4a3d86, C.plum][i], { seed: i, side: true }), [x, 0, z]); root.add(t); intro.push({ obj: t, from: 'grow-y', delay: 0.7 + i * 0.08, dur: 0.8 });
  });
  const pin = K.place(K.pin(C.green, 1, 'Thane'), [1.7, 3.9, -1.6]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.8 });
  const c1 = K.place(K.cloud(0.9), [-2.4, 3.2, -2.6]); root.add(c1); intro.push({ obj: c1, delay: 1.5 });

  return {
    root, intro, cam: [6.2, 6.0, 9.0], target: [0, 1.0, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      const u = (t * 0.07) % 1; train.position.copy(curve.getPointAt(u)); train.position.y += 0.05; const tg = curve.getTangentAt(u); train.rotation.y = Math.atan2(-tg.z, tg.x);
      const k = 0.75 + Math.sin(t * 2.2) * 0.25; jet.scale.y = k; spray.position.set(-1.0, 0.08 + k, 0.9); spray.scale.setScalar(0.8 + Math.sin(t * 2.2 + 1) * 0.2);
      K.stepRipples(rips, t); pin.position.y = 3.9 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07); c1.position.x = -2.4 + Math.sin(t * 0.15) * 0.5;
    },
  };
}
