/* Singapore: a row of pastel shophouses with arched windows and shutters, a clock on a post whose hands turn (the same
   hours all year), potted plants and lanterns, and towers rising behind. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const street = K.place(K.box(9, 0.5, 5.8, K.clay(0xeee6d8, { rough: 0.85 }), 0.35), [0, -0.25, 0]); root.add(street); intro.push({ obj: street, from: 'rise' });
  const cols = [0xf3b7b0, 0xa8d8c8, 0xf6dc9b, 0xb9c8f0, 0xf2c4dc, 0xc7e3a8];
  cols.forEach((c, i) => {
    const x = -3.6 + i * 1.44; const h = 1.9 + (i % 2) * 0.25; const m = K.clay(c, { rough: 0.6 });
    const sh = K.group(K.up(1.36, h, 1.2, m, 0.04), K.place(K.box(1.42, 0.1, 1.3, K.clay(C.white), 0.03), [0, h * 0.5, 0.05]));
    sh.add(K.place(K.extrude([[-0.72, 0], [0.72, 0], [0, 0.34]], 1.3, K.clay(0xc8634a, { rough: 0.6 }), { bevel: 0.01 }), [0, h, 0]));
    for (const wx of [-0.3, 0.3]) {
      sh.add(K.place(K.extrude([[-0.16, 0], [0.16, 0], [0.16, 0.34], [0, 0.46], [-0.16, 0.34]], 0.04, K.clay(0x355e57), { bevel: 0.01 }), [wx, h * 0.62, 0.6]));
      sh.add(K.place(K.box(0.07, 0.36, 0.02, K.clay(0x7fb7a8), 0.01), [wx - 0.22, h * 0.62 + 0.18, 0.62]), K.place(K.box(0.07, 0.36, 0.02, K.clay(0x7fb7a8), 0.01), [wx + 0.22, h * 0.62 + 0.18, 0.62]));
    }
    sh.add(K.place(K.box(0.5, 0.62, 0.03, K.clay(0x6b4a33), 0.02), [0, 0.32, 0.61]));
    K.place(sh, [x, 0, -0.9]); root.add(sh); intro.push({ obj: sh, from: 'grow-y', delay: 0.3 + i * 0.08, dur: 0.8 });
  });
  /* towers behind */
  [[-3.0, -2.5, 0.6, 3.6], [-1.6, -2.6, 0.55, 2.8], [0.4, -2.5, 0.65, 4.0], [2.2, -2.6, 0.5, 3.0], [3.5, -2.5, 0.55, 3.4]].forEach(([x, z, s, h], i) => {
    const b = K.place(K.tower(s, h, s, [C.plum, 0x5b4c9b, C.deep][i % 3], { seed: i }), [x, 0, z]); root.add(b); intro.push({ obj: b, from: 'grow-y', delay: 0.7 + i * 0.06 });
  });
  /* the clock */
  const clock = K.group(K.place(K.cyl(0.05, 0.05, 1.6, K.clay(C.ink), 8), [0, 0.8, 0]), K.place(K.cyl(0.45, 0.45, 0.1, K.clay(C.white), 40), [0, 1.9, 0], [Math.PI / 2, 0, 0]),
    K.place(K.torus(0.45, 0.04, K.clay(C.ink)), [0, 1.9, 0]));
  const hourH = K.place(K.box(0.04, 0.24, 0.02, K.clay(C.ink), 0.01), [0, 1.9, 0.07]); hourH.geometry.translate(0, 0.1, 0); const minH = K.place(K.box(0.03, 0.36, 0.02, K.clay(C.green), 0.01), [0, 1.9, 0.08]); minH.geometry.translate(0, 0.16, 0);
  clock.add(hourH, minH); K.place(clock, [3.4, 0, 1.4]); root.add(clock); intro.push({ obj: clock, delay: 1.1 });
  [[-3.0, 1.0], [-1.6, 1.0], [0.0, 1.0], [1.4, 1.0]].forEach(([x, z]) => root.add(K.place(K.group(K.cyl(0.14, 0.11, 0.24, K.clay(0xc8634a), 16), K.place(K.ball(0.2, K.clay(C.green), 14), [0, 0.26, 0])), [x, 0.12, z])));
  const lanterns = [-2.3, -0.8, 0.7, 2.1].map((x) => { const l = K.place(K.ball(0.13, K.clay(0xe4473c, { emissive: 0xa02010, ei: 0.4 }), 16), [x, 1.6, 0.0], [0, 0, 0], [1, 1.3, 1]); root.add(l); return l; });

  return {
    root, intro, cam: [3.0, 3.8, 10.4], target: [0, 1.6, -0.6], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) { minH.rotation.z = -t * 0.8; hourH.rotation.z = -t * 0.067; lanterns.forEach((l, i) => { l.rotation.z = Math.sin(t * 1.4 + i) * 0.12; }); },
  };
}
