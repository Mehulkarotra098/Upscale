/* New Zealand: early morning on Lake Wakatipu. Snow-capped peaks, mist drifting on the water, a jetty, and a yellow kayak
   paddling across, with a message bubble arriving: "Changes are live". */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = []; const faces = [];
  const lake = K.place(K.water(9.4, 6.4, 0x4c66c4), [0, -0.15, 0]); root.add(lake); intro.push({ obj: lake, from: 'rise' });
  const shore = K.place(K.box(9.4, 0.5, 1.4, K.clay(0x9fbf88, { rough: 0.9 }), 0.3), [0, 0, 2.6]); root.add(shore); intro.push({ obj: shore, from: 'rise', delay: 0.1 });
  /* mountains with snow caps */
  const rockM = K.clay(0x6b6e8f, { rough: 0.9, flat: true }); const snowM = K.clay(C.white, { rough: 0.9, flat: true });
  [[-3.0, -2.6, 1.6, 3.0], [-0.8, -2.8, 2.0, 3.8], [1.8, -2.6, 1.7, 3.2], [3.8, -2.4, 1.3, 2.4]].forEach(([x, z, r, h], i) => {
    const m = K.group(K.cone(r, h, rockM, 7), K.place(K.cone(r * 0.38, h * 0.38, snowM, 7), [0, h * 0.31, 0]));
    m.children.forEach((c) => c.geometry.translate(0, 0, 0)); K.place(m, [x, h / 2 - 0.05, z]); root.add(m); intro.push({ obj: m, from: 'grow-y', delay: 0.2 + i * 0.1, dur: 1.0 });
  });
  /* the jetty */
  const wood = K.clay(0x8b6b4a, { rough: 0.8 });
  const jetty = K.group(K.place(K.box(0.6, 0.06, 2.0, wood, 0.02), [0, 0.18, 0]), ...[[-0.24, -0.8], [0.24, -0.8], [-0.24, 0.2], [0.24, 0.2]].map(([x, z]) => K.place(K.up(0.06, 0.2, 0.06, wood, 0.01), [x, -0.02, z])));
  K.place(jetty, [-2.6, 0, 1.4]); root.add(jetty);
  /* the kayak */
  const kayak = K.group(K.place(K.capsule(0.2, 1.5, K.clay(0xf2c14e, { rough: 0.35 })), [0, 0, 0], [0, 0, Math.PI / 2], [1, 0.6, 1]),
    K.place(K.ball(0.17, K.clay(0xe4473c), 12), [0, 0.26, 0]), K.place(K.rod([-0.8, 0.2, -0.3], [0.8, 0.45, 0.3], 0.025, K.clay(C.ink)), [0, 0, 0]));
  root.add(kayak);
  /* mist */
  const mistM = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false });
  const mists = [];
  const msg = K.label('Changes are live ✓  6:40 am', { px: 50, bg: '#D9FDD3', color: '#111111', height: 0.3, radius: 14 }); K.place(msg, [1.8, 2.6, 0.8]); root.add(msg); faces.push(msg); intro.push({ obj: msg, from: 'drop', delay: 1.6 });

  return {
    root, intro, faces, cam: [2.4, 3.6, 10.6], target: [0, 1.4, 0], fov: 28, sway: 0.08, fit: 0.74,
    update(t, dt, s) {
      const k = (t * 0.06) % 1; kayak.position.set(-3.6 + k * 7.2, 0.04 + Math.sin(t * 2) * 0.02, 0.6 + Math.sin(k * Math.PI * 2) * 0.5); kayak.rotation.y = Math.sin(t * 2.2) * 0.08; kayak.children[2].rotation.x = Math.sin(t * 3) * 0.5;
      mists.forEach((m, i) => { m.position.x = -2 + i * 2 + Math.sin(t * 0.15 + i) * 0.8; m.material.opacity = 0.14 + Math.sin(t * 0.4 + i) * 0.05; m.lookAt(m.position.x, m.position.y, 20); });
      msg.position.y = 2.6 + Math.sin(t * 1.2) * 0.05;
    },
  };
}
