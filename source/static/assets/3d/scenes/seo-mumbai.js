/* SEO in Mumbai: a 3D map of a neighbourhood. Blocks and roads, competitor pins popping up, your green pin climbing
   to the top with a #1 badge, a magnifying glass sweeping the streets, and a search bar floating above. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];

  /* the map tile: ground, a park, a curving road, and blocks */
  const ground = K.place(K.box(7, 0.36, 5.4, K.clay(0xb9ade3, { rough: 0.8 }), 0.3), [0, -0.18, 0]);
  root.add(ground); intro.push({ obj: ground, from: 'rise' });
  const park = K.place(K.box(1.6, 0.06, 1.3, K.clay(C.mint), 0.15), [-2.2, 0.03, 1.4]); root.add(park);
  const roadM = K.clay(C.mist, { rough: 0.6 });
  root.add(K.place(K.box(7, 0.03, 0.42, roadM, 0.02), [0, 0.02, -0.4]), K.place(K.box(0.42, 0.03, 5.4, roadM, 0.02), [0.6, 0.02, 0]));
  const blockM = [K.clay(C.plum), K.clay(0x5b4c9b), K.clay(C.deep)]; const winM = K.glow(0xffe6a8);
  const blocks = [];
  [[-2.6, -1.6], [-1.6, -1.7], [-2.5, -1.0], [1.6, -1.6], [2.6, -1.5], [1.7, -1.0], [2.7, 0.6], [1.6, 0.7], [2.5, 1.7], [1.5, 1.8], [-0.6, 1.6], [-0.6, 0.6], [-1.6, 0.4]].forEach(([x, z], i) => {
    const h = 0.3 + ((i * 37) % 7) * 0.12; const b = K.box(0.7, h, 0.7, blockM[i % 3], 0.08); b.geometry.translate(0, h / 2, 0);
    for (let r = 1; r * 0.16 < h - 0.05; r++) if ((r + i) % 2) b.add(K.place(K.box(0.42, 0.04, 0.01, winM, 0), [0, r * 0.16, 0.355]));
    K.place(b, [x, 0, z]); root.add(b); blocks.push(b);
    intro.push({ obj: b, from: 'grow-y', delay: 0.2 + i * 0.04, dur: 0.5 });
  });
  const treeM = K.clay(C.green, { rough: 0.6 });
  [[-2.6, 1.2], [-1.9, 1.7], [-2.0, 1.05]].forEach(([x, z]) => root.add(K.place(K.ball(0.22, treeM, 20), [x, 0.27, z])));

  /* pins: competitors (lavender) and yours (green) */
  const pin = (color, s = 1) => {
    const m = K.clay(color, { rough: 0.35 });
    return K.group(K.place(K.ball(0.22 * s, m), [0, 0.5 * s, 0]), K.place(K.cone(0.17 * s, 0.4 * s, m), [0, 0.2 * s, 0], [Math.PI, 0, 0]), K.place(K.ball(0.085 * s, K.clay(C.white)), [0, 0.53 * s, 0.17 * s]));
  };
  const others = [[-1.6, -1.0], [2.6, -0.9], [1.6, 1.2], [-0.6, 1.0]].map(([x, z], i) => { const p = K.place(pin(0x9b8fd0, 0.85), [x, 0.4, z]); root.add(p); intro.push({ obj: p, from: 'drop', delay: 0.9 + i * 0.15, dur: 0.7 }); return p; });
  const ours = K.place(pin(C.green, 1.35), [0.6, 0.0, 0.5]); root.add(ours);
  const badge = K.place(K.label('#1 on Maps', { px: 60, bg: '#ffffff', color: '#251E45', height: 0.3 }), [0, 1.25, 0]); ours.add(badge);
  const beam = new T.Mesh(new T.CylinderGeometry(0.05, 0.35, 1, 32, 1, true), new T.MeshBasicMaterial({ color: C.lime, transparent: true, opacity: 0.18, toneMapped: false, depthWrite: false, side: T.DoubleSide }));
  beam.position.set(0.6, 0.5, 0.5); root.add(beam);

  /* the magnifying glass */
  const glass = K.group(K.place(K.torus(0.55, 0.08, K.clay(C.violet, { rough: 0.3 })), [0, 0, 0], [Math.PI / 2, 0, 0]),
    K.place(new T.Mesh(new T.CircleGeometry(0.55, 48), K.glass(0xe9f6ff, { opacity: 0.28 })), [0, 0, 0], [-Math.PI / 2, 0, 0]),
    K.place(K.capsule(0.08, 0.8, K.clay(C.violet, { rough: 0.3 })), [0.75, 0, 0.75], [Math.PI / 2, 0, -Math.PI / 4]));
  root.add(glass); intro.push({ obj: glass, delay: 1.6 });

  /* the search bar */
  const bar = K.group(K.box(3.4, 0.42, 0.12, K.clay(C.white, { rough: 0.4 }), 0.2));
  bar.add(K.place(K.label('website designer near me', { px: 54, color: '#251E45', height: 0.2, weight: 600, align: 'left' }), [-0.15, 0, 0.07]));
  bar.add(K.place(K.ball(0.12, K.clay(C.green)), [1.45, 0, 0.06], [0, 0, 0], [1, 1, 0.4]));
  K.place(bar, [0, 2.75, -1.6], [-0.15, 0, 0], 1.25); root.add(bar); intro.push({ obj: bar, from: 'drop', delay: 0.5, dur: 0.8 });

  return {
    root, intro, cam: [5.4, 6.2, 8.4], target: [0.1, 0.9, 0], fov: 28, sway: 0.1, fit: 0.8,
    update(t, dt, s) {
      const k = Math.min(1, Math.max(0, (t - 1.6) / 1.4)); const lift = K.ease.out(k);
      ours.position.y = 0.4 + lift * 0.9 + Math.sin(t * 1.4) * (s.calm ? 0.02 : 0.06); ours.rotation.y = Math.sin(t * 0.7) * 0.3;
      beam.scale.set(1, 0.01 + lift * 1.3, 1); beam.position.y = (0.01 + lift * 1.3) / 2; beam.material.opacity = 0.2 * lift;
      badge.scale.setScalar(Math.max(0.001, K.ease.back(Math.min(1, Math.max(0, (t - 2.6) / 0.6)))));
      const a = t * 0.45; glass.position.set(Math.cos(a) * 1.9, 0.95 + Math.sin(t * 1.1) * 0.08, Math.sin(a) * 1.3); glass.rotation.y = -a;
      others.forEach((o, i) => { o.rotation.y = Math.sin(t * 0.6 + i) * 0.2; });
    },
  };
}
