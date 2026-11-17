/* Delhi NCR: the metro as a 3D map. Coloured lines on pillars crossing at interchanges, trains running on each, the glass
   towers of Gurugram in one corner and Noida's in the other, and a pin on Delhi NCR. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const base = K.place(K.box(9.4, 0.4, 7, K.clay(0xeee9f7, { rough: 0.8 }), 0.35), [0, -0.2, 0]); root.add(base); intro.push({ obj: base, from: 'rise' });
  const river = K.place(K.box(0.6, 0.06, 7, K.clay(0x7f8fe0, { rough: 0.25 }), 0.05), [1.6, 0.03, 0], [0, 0.18, 0]); root.add(river);

  /* four lines on pillars, each with a train */
  const lines = [
    { c: 0xe4473c, pts: [[-4.2, -2.6], [-2.2, -1.2], [-0.4, -0.2], [1.4, 0.6], [3.8, 1.2]] },
    { c: 0xf2c14e, pts: [[-1.0, -3.2], [-0.8, -1.6], [-0.4, -0.2], [-0.3, 1.4], [-0.6, 3.2]] },
    { c: 0x3a7be0, pts: [[-4.2, 1.6], [-2.4, 1.2], [-0.3, 1.4], [1.8, 1.0], [4.2, -0.4]] },
    { c: 0xb04fc9, pts: [[-3.8, 3.0], [-2.2, 1.2], [-1.2, 0.2], [-0.4, -0.2], [0.6, -1.8], [1.6, -3.2]] },
  ];
  const curves = []; const trains = [];
  lines.forEach((L, i) => {
    const y = 0.75 + i * 0.12; const curve = new T.CatmullRomCurve3(L.pts.map(([x, z]) => new T.Vector3(x, y, z)));
    const track = new T.Mesh(new T.TubeGeometry(curve, 140, 0.07, 10, false), K.clay(L.c, { rough: 0.4 })); track.castShadow = true; root.add(track); intro.push({ obj: track, delay: 0.4 + i * 0.12, dur: 0.6 });
    for (let k = 0; k <= 10; k++) { const p = curve.getPointAt(k / 10); const pl = K.place(K.up(0.07, y - 0.05, 0.07, K.clay(C.mist), 0.02), [p.x, 0, p.z]); root.add(pl); }
    const tr = K.train(2, L.c, 0.32); root.add(tr); trains.push(tr); curves.push(curve);
  });
  [[-0.4, -0.2], [-0.3, 1.4], [-2.2, 1.2]].forEach(([x, z], i) => { const st = K.place(K.cyl(0.24, 0.24, 0.08, K.clay(C.white), 28), [x, 1.12, z]); st.add(K.place(K.torus(0.24, 0.035, K.clay(C.violet)), [0, 0.04, 0], [Math.PI / 2, 0, 0])); root.add(st); intro.push({ obj: st, delay: 1.0 + i * 0.1 }); });

  /* Gurugram glass towers and Noida's */
  const glass = K.glass(0x9fb8f0, { opacity: 0.7 });
  [[-3.4, -2.4, 0.5, 2.6], [-2.8, -2.9, 0.45, 2.0], [-3.9, -1.6, 0.42, 1.6], [-2.4, -2.2, 0.38, 1.2]].forEach(([x, z, s, h], i) => {
    const g = K.group(K.up(s, h, s, glass, 0.04), K.place(K.up(s * 0.8, h * 0.98, s * 0.8, K.clay(C.deep), 0.03), [0, 0, 0]));
    for (let y = 0.2; y < h; y += 0.2) if ((y * 10 + i) % 3 > 1) g.add(K.place(K.box(s * 0.6, 0.04, 0.01, K.glow(0xffe6a8), 0), [0, y, s * 0.41]));
    K.place(g, [x, 0, z]); root.add(g); intro.push({ obj: g, from: 'grow-y', delay: 0.7 + i * 0.08, dur: 0.8 });
  });
  [[3.2, 2.3, 0.5, 1.8], [3.8, 1.8, 0.45, 1.4], [2.7, 2.8, 0.42, 1.1]].forEach(([x, z, s, h], i) => { const b = K.place(K.tower(s, h, s, [C.plum, 0x5b4c9b, C.deep][i], { seed: i, step: 0.18 }), [x, 0, z]); root.add(b); intro.push({ obj: b, from: 'grow-y', delay: 0.9 + i * 0.08 }); });
  [[1.0, 2.6], [-1.8, 2.8], [2.6, -1.6], [0.6, -2.8]].forEach(([x, z]) => root.add(K.place(K.tree(0.7), [x, 0, z])));
  const pin = K.place(K.pin(C.green, 1, 'Delhi NCR'), [-0.4, 2.6, -0.2]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.9 });

  return {
    root, intro, cam: [5.6, 7.6, 8.6], target: [0, 0.9, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      trains.forEach((tr, i) => { const u = (t * (0.05 + i * 0.012) + i * 0.25) % 1; const c = curves[i]; tr.position.copy(c.getPointAt(u)); tr.position.y += 0.06; const tg = c.getTangentAt(u); tr.rotation.y = Math.atan2(-tg.z, tg.x); });
      pin.position.y = 2.6 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07);
    },
  };
}
