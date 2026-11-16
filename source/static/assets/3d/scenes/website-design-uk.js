/* UK: "sorted before you've finished your tea". A desk: a cup of tea with steam, an envelope whose letter (the fixed
   quote, in pounds) slides out, a green wax seal that stamps down, a fountain pen, and a small stack of pound coins. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];

  /* the desk */
  const desk = K.place(K.box(5.8, 0.4, 4.3, K.clay(0xd9c4a6, { rough: 0.7 }), 0.25), [0, -0.2, 0]);
  const mat = K.place(K.box(3.6, 0.04, 2.7, K.clay(C.violet, { rough: 0.85 }), 0.04), [0.45, 0.02, 0.15]);
  root.add(desk, mat); intro.push({ obj: desk, from: 'rise' }, { obj: mat, delay: 0.15 });

  /* envelope and the letter inside it */
  const env3 = K.group();
  const paper = K.clay(C.cream, { rough: 0.8 });
  env3.add(K.place(K.box(2.6, 0.06, 1.7, paper, 0.03), [0, 0.03, 0]));
  const flap = K.extrude([[-1.3, 0], [1.3, 0], [0, -0.85]], 0.02, K.clay(0xeee3cc, { rough: 0.8 }), { bevel: 0.005 });
  flap.rotation.x = -Math.PI / 2; flap.position.set(0, 0.075, -0.85); flap.scale.set(1, -1, 1);
  env3.add(flap);
  const letter = K.group();
  const sheet = K.place(K.box(2.2, 0.03, 1.55, K.clay(C.white, { rough: 0.9 }), 0.02), [0, 0, 0]);
  const head = K.place(K.label('Your quote', { px: 54, color: '#251E45', height: 0.2, weight: 800 }), [-0.45, 0.02, -0.5], [-Math.PI / 2, 0, 0]);
  const price = K.place(K.label('£450 fixed', { px: 80, color: '#251E45', height: 0.34, weight: 800 }), [-0.3, 0.02, -0.08], [-Math.PI / 2, 0, 0]);
  const vat = K.place(K.label('No VAT added · 4.5 h shared each day', { px: 40, color: '#5B5478', height: 0.13, weight: 600 }), [-0.08, 0.02, 0.28], [-Math.PI / 2, 0, 0]);
  const sign = K.place(K.label('Mehul Karotra', { px: 60, color: '#3B2F70', height: 0.18, weight: 500, font: '"Segoe Script", "Brush Script MT", cursive' }), [0.45, 0.02, 0.55], [-Math.PI / 2, 0, 0]);
  letter.add(sheet, head, price, vat, sign);
  K.place(letter, [0, 0.08, 0.05]); env3.add(letter);
  K.place(env3, [0.45, 0.05, 0.2], [0, -0.18, 0], 1.12); root.add(env3); intro.push({ obj: env3, delay: 0.35 });

  /* the wax seal: a soft-edged disc with a pressed ring and a tick */
  const sealM = K.clay(C.green, { rough: 0.38 });
  const seal = K.group(K.place(K.cyl(0.36, 0.4, 0.12, sealM, 36), [0, 0.06, 0]), K.place(K.torus(0.25, 0.025, K.clay(0x4f9a38, { rough: 0.4 })), [0, 0.13, 0], [Math.PI / 2, 0, 0]));
  const tick = K.extrude([[-0.13, 0.0], [-0.04, -0.09], [0.15, 0.1], [0.11, 0.14], [-0.04, -0.02], [-0.09, 0.04]], 0.03, K.clay(0xdff5d3), { bevel: 0.01 });
  tick.rotation.x = -Math.PI / 2; tick.position.set(0, 0.14, 0); seal.add(tick);
  K.place(seal, [1.6, 0.17, 0.95], [0, 0, 0], 1.15); root.add(seal);

  /* tea: a cup on a saucer, steam rising */
  const cupM = K.clay(C.white, { rough: 0.25 });
  const cup = K.group(
    K.place(K.cyl(0.62, 0.5, 0.06, cupM, 48), [0, 0.03, 0]),
    K.lathe([[0, 0.08], [0.3, 0.08], [0.38, 0.2], [0.44, 0.62], [0.42, 0.63], [0.36, 0.25], [0, 0.22]], cupM),
    K.place(K.cyl(0.39, 0.39, 0.02, K.clay(0xa0623a, { rough: 0.2 }), 40), [0, 0.56, 0]),
    K.place(K.torus(0.14, 0.035, cupM, Math.PI * 1.2), [0.48, 0.4, 0], [0, 0, -Math.PI * 0.6]));
  K.place(cup, [-1.75, 0.0, -0.75], [0, 0, 0], 1.2); root.add(cup); intro.push({ obj: cup, delay: 0.55 });
  const steamM = new T.MeshBasicMaterial({ color: C.white, transparent: true, opacity: 0.35, toneMapped: false, depthWrite: false });
  const steam = [0, 1, 2, 3, 4].map((i) => { const s = new T.Mesh(new T.SphereGeometry(0.09, 16, 12), steamM.clone()); root.add(s); return { s, o: i * 0.5 }; });

  /* fountain pen and pound coins */
  const pen = K.group(K.place(K.capsule(0.07, 1.5, K.clay(C.ink, { rough: 0.3 })), [0, 0, 0], [0, 0, Math.PI / 2]),
    K.place(K.cone(0.07, 0.3, K.metal(C.gold)), [-0.92, 0, 0], [0, 0, Math.PI / 2]), K.place(K.cyl(0.075, 0.075, 0.1, K.metal(C.gold)), [0.35, 0, 0], [0, 0, Math.PI / 2]));
  K.place(pen, [0.4, 0.12, 1.6], [0, 0.3, 0], 1.1); root.add(pen); intro.push({ obj: pen, delay: 0.75 });
  const coinM = K.metal(0xe3c26a, { rough: 0.35 }); const coins = K.group();
  for (let i = 0; i < 5; i++) coins.add(K.place(K.cyl(0.3, 0.3, 0.06, coinM, 7), [Math.sin(i) * 0.02, 0.03 + i * 0.065, Math.cos(i) * 0.02], [0, i * 0.3, 0]));
  coins.add(K.place(K.label('£', { px: 90, color: '#7a5a12', height: 0.28, weight: 800 }), [0, 0.37, 0], [-Math.PI / 2, 0, 0]));
  K.place(coins, [-1.9, 0.0, 0.95], [0, 0, 0], 1.2); root.add(coins); intro.push({ obj: coins, from: 'grow-y', delay: 0.9 });

  /* a small tag: "Sorted by 10am" */
  const tag = K.place(K.label('Sorted by 10am', { px: 56, bg: '#8ED474', color: '#251E45', height: 0.3 }), [-1.2, 2.1, -1.0]);
  root.add(tag); intro.push({ obj: tag, from: 'drop', delay: 2.2, dur: 0.8 });

  return {
    root, intro, cam: [4.2, 5.2, 8.0], target: [-0.1, 0.45, 0.15], fov: 28, sway: 0.08, fit: 0.8,
    update(t, dt, s) {
      const k = Math.min(1, Math.max(0, (t - 1.0) / 1.2)); letter.position.z = 0.05 - K.ease.inOut(k) * 0.85; letter.position.y = 0.08 + K.ease.inOut(k) * 0.08;
      const sk = Math.min(1, Math.max(0, (t - 2.0) / 0.45)); seal.position.y = 0.17 + (1 - K.ease.out(sk)) * 1.6; seal.scale.setScalar(sk < 1 ? 1 : 1 + Math.max(0, 0.08 - (t - 2.45) * 0.3));
      for (const st of steam) { const p = ((t * 0.45 + st.o) % 2.5) / 2.5; st.s.position.set(-1.75 + Math.sin(t + st.o * 3) * 0.08, 0.85 + p * 1.5, -0.75 + Math.cos(t * 0.8 + st.o) * 0.05); st.s.scale.setScalar(0.6 + p * 1.8); st.s.material.opacity = 0.35 * (1 - p) * Math.min(1, p * 4); }
      tag.position.y = 2.1 + Math.sin(t * 1.3) * (s.calm ? 0.02 : 0.06);
    },
  };
}
