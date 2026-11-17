/* USA: "You sleep. We build." New York at night on one plinth (moon, lit towers) and Mumbai by day on the other (sun,
   palms), joined by a glowing arc; a packet, your updated preview, travels from Mumbai to New York. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = []; const faces = [];
  /* New York, night */
  const ny = K.group(K.place(K.box(3.6, 0.5, 3.6, K.clay(0x2c2650, { rough: 0.7 }), 0.3), [0, -0.25, 0]));
  [[-1.0, -0.8, 0.6, 2.6], [0.0, -1.1, 0.7, 3.4], [1.0, -0.7, 0.55, 2.2], [-0.6, 0.6, 0.5, 1.5], [0.6, 0.5, 0.6, 1.9], [1.2, 1.1, 0.45, 1.2], [-1.2, 1.2, 0.45, 1.0]].forEach(([x, z, s, h], i) => {
    const b = K.place(K.tower(s, h, s, [0x3b2f70, 0x2e2558, 0x4a3d86][i % 3], { seed: i, side: true, lit: 0xffe08a, alt: 0xfff1c9 }), [x, 0, z]); ny.add(b); intro.push({ obj: b, from: 'grow-y', delay: 0.5 + i * 0.06 });
  });
  const moon = K.place(K.ball(0.35, K.clay(0xf3eedc, { rough: 0.9, emissive: 0x6a6450, ei: 0.6 })), [-1.4, 4.0, -1.0]); ny.add(moon);
  const nyl = K.place(K.label('New York · 11:40 pm', { px: 52, bg: 'rgba(255,255,255,0.95)', color: '#251E45', height: 0.3 }), [0, -0.25, 2.1]); ny.add(nyl);
  K.place(ny, [-2.6, 0, 0]); root.add(ny); intro.push({ obj: ny, from: 'rise', delay: 0 });
  /* Mumbai, day */
  const mu = K.group(K.place(K.box(3.6, 0.5, 3.6, K.clay(0xf3ecdc, { rough: 0.7 }), 0.3), [0, -0.25, 0]));
  [[-1.0, -0.7, 0.55, 1.6], [0.1, -1.0, 0.6, 2.4], [1.0, -0.6, 0.5, 1.4], [-0.4, 0.7, 0.55, 1.1], [0.8, 0.8, 0.5, 1.8]].forEach(([x, z, s, h], i) => {
    const b = K.place(K.tower(s, h, s, [C.lav, 0xb3a6dd, 0xd8cff0][i % 3], { seed: i + 2, lit: 0x8f7fd0, alt: 0x63b849 }), [x, 0, z]); mu.add(b); intro.push({ obj: b, from: 'grow-y', delay: 0.6 + i * 0.06 });
  });
  [[-1.3, 1.3], [1.3, -1.3], [1.4, 1.4]].forEach(([x, z]) => mu.add(K.place(K.palm(0.8), [x, 0, z])));
  const sun = K.place(K.ball(0.42, K.clay(0xf2c14e, { rough: 0.5, emissive: 0xf2a020, ei: 0.5 })), [1.3, 4.1, -1.0]); mu.add(sun);
  const mul = K.place(K.label('Mumbai · 10:10 am', { px: 52, bg: '#63B849', color: '#251E45', height: 0.3 }), [0, -0.25, 2.1]); mu.add(mul);
  K.place(mu, [2.6, 0, 0]); root.add(mu); intro.push({ obj: mu, from: 'rise', delay: 0.1 });
  /* the arc between them, and the preview travelling it */
  const a = new T.Vector3(2.7, 2.6, 0); const b = new T.Vector3(-2.5, 3.6, 0); const curve = new T.QuadraticBezierCurve3(a, new T.Vector3(0, 5.6, 0.4), b);
  const arc = new T.Mesh(new T.TubeGeometry(curve, 60, 0.03, 8, false), new T.MeshBasicMaterial({ color: C.lime, transparent: true, opacity: 0.85, toneMapped: false })); root.add(arc); intro.push({ obj: arc, delay: 1.3 });
  const card = K.label('Preview updated ✓', { px: 52, bg: '#ffffff', color: '#251E45', height: 0.32 }); root.add(card); faces.push(card);

  return {
    root, intro, faces, cam: [0.4, 4.6, 11.4], target: [0, 1.8, 0], fov: 28, sway: 0.08, fit: 0.76,
    update(t, dt, s) {
      const k = (t * 0.18) % 1; card.position.copy(curve.getPoint(k)); card.position.y += 0.25;
      moon.position.y = 4.0 + Math.sin(t * 0.8) * 0.08; sun.rotation.y = t * 0.4; sun.position.y = 4.1 + Math.sin(t * 0.8 + 1) * 0.08;
    },
  };
}
