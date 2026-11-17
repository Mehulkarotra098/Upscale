/* Ireland: ready for the accessibility act. Green hills with dry-stone walls, a giant keyboard key reading Tab with a
   bright focus ring, an alt-text tag that writes itself, and a contrast badge. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = []; const faces = [];
  const base = K.place(K.box(8.6, 0.4, 6.2, K.clay(0x8cc77a, { rough: 0.9 }), 0.35), [0, -0.2, 0]); root.add(base); intro.push({ obj: base, from: 'rise' });
  [[-2.8, -1.8, 2.2, 1.0, 0x6fb35f], [0.2, -2.4, 2.8, 1.4, 0x5ea350], [3.0, -1.6, 2.0, 0.9, 0x79bd68]].forEach(([x, z, r, h, c], i) => { const hl = K.place(K.ball(1, K.clay(c, { rough: 0.85 }), 40), [x, 0, z], [0, 0, 0], [r, h, r * 0.7]); root.add(hl); intro.push({ obj: hl, from: 'grow-y', delay: 0.15 + i * 0.1 }); });
  const stone = K.clay(0xc9c4b8, { rough: 0.95, flat: true });
  for (let i = 0; i < 26; i++) { const x = -4 + i * 0.32; root.add(K.place(K.ball(0.12 + (i % 3) * 0.02, stone, 6), [x, 0.09, 1.9 + Math.sin(i * 0.7) * 0.15])); }
  /* sheep */
  [[-2.6, 0.8], [-1.9, 1.2], [2.8, 1.0]].forEach(([x, z]) => root.add(K.place(K.group(K.place(K.ball(0.2, K.clay(C.white, { rough: 0.95 }), 12), [0, 0.22, 0], [0, 0, 0], [1.3, 1, 1]), K.place(K.ball(0.09, K.clay(0x2b2b35), 10), [0.26, 0.25, 0])), [x, 0, z])));

  /* the Tab key with its focus ring */
  const key = K.group(K.box(2.0, 0.5, 1.3, K.clay(0xf6f4fb, { rough: 0.5 }), 0.18), K.place(K.box(1.8, 0.1, 1.1, K.clay(C.white, { rough: 0.4 }), 0.12), [0, 0.28, 0]));
  key.add(K.place(K.label('Tab ⇥', { px: 90, color: '#251E45', height: 0.4, weight: 800 }), [0, 0.34, 0], [-Math.PI / 2, 0, 0]));
  const ring = K.place(new T.Mesh(new T.TorusGeometry(1.0, 0.04, 8, 4), new T.MeshBasicMaterial({ color: C.lime, toneMapped: false })), [0, 0.1, 0], [Math.PI / 2, 0, Math.PI / 4], [1.35, 0.95, 1]);
  key.add(ring);
  K.place(key, [-0.4, 0.75, 0.6], [0.25, 0.2, 0], 1.5); root.add(key); intro.push({ obj: key, delay: 0.6, dur: 0.9 });
  /* the alt-text tag and the contrast badge */
  const alt = K.label('alt="Double room with a harbour view"', { px: 46, bg: '#1E1838', color: '#8ED474', height: 0.26, weight: 600, radius: 10 });
  K.place(alt, [1.6, 2.4, -0.4]); root.add(alt); faces.push(alt); intro.push({ obj: alt, from: 'drop', delay: 1.3 });
  const badge = K.label('Contrast 15.6 : 1 ✓', { px: 52, bg: '#ffffff', color: '#251E45', height: 0.3 }); K.place(badge, [-2.2, 2.1, -0.6]); root.add(badge); faces.push(badge); intro.push({ obj: badge, from: 'drop', delay: 1.6 });

  return {
    root, intro, faces, cam: [3.0, 4.6, 9.8], target: [0, 1.2, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      const p = 0.5 + Math.sin(t * 3) * 0.5; ring.material.color.setRGB(0.39 + p * 0.2, 0.72 + p * 0.1, 0.29); ring.scale.set(1.35 + p * 0.04, 0.95 + p * 0.04, 1);
      key.position.y = 0.75 - Math.max(0, Math.sin(t * 1.6)) * 0.08; alt.position.y = 2.4 + Math.sin(t * 1.2) * 0.05; badge.position.y = 2.1 + Math.sin(t * 1.3 + 1) * 0.05;
    },
  };
}
