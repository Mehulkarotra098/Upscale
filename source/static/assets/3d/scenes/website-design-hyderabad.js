/* Hyderabad: HITEC City's towers above Durgam Cheruvu lake, the cable bridge across the water with its fanned cables
   lighting up, cars crossing, and a pin on Hyderabad. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const ground = K.place(K.box(9.4, 0.5, 6.8, K.clay(0xe7dcc6, { rough: 0.85 }), 0.35), [0, -0.25, 0]); root.add(ground); intro.push({ obj: ground, from: 'rise' });
  /* rocky outcrops, the Deccan's boulders */
  const rock = K.clay(0xb9a27f, { rough: 0.9, flat: true });
  [[-3.8, 2.4, 0.5], [-3.3, 2.7, 0.35], [3.9, 2.5, 0.45], [-4.0, -2.6, 0.4]].forEach(([x, z, r]) => root.add(K.place(K.ball(r, rock, 7), [x, r * 0.5, z])));
  const lake = K.place(K.box(9.4, 0.08, 2.2, K.clay(0x4f6bd2, { rough: 0.2, env: 0.4 }), 0.04), [0, 0.03, 0.6]); root.add(lake); intro.push({ obj: lake, delay: 0.2 });
  const rips = K.ripples([[-2.4, 0.9], [2.6, 0.4], [0.2, 1.3]], 0.09); rips.forEach((q) => root.add(q.r));

  /* the cable bridge: a deck over the lake, two angled pylons, fans of cables */
  const deckM = K.clay(C.mist, { rough: 0.45 }); const cableM = K.clay(C.white, { rough: 0.3 });
  const deck = K.place(K.box(8.4, 0.12, 0.55, deckM, 0.04), [0, 0.55, 0.6]); root.add(deck); intro.push({ obj: deck, delay: 0.5 });
  [[-1.7, 1], [1.7, -1]].forEach(([px, lean], i) => {
    const g = K.group(K.rod([px, 0.1, 0.6], [px - lean * 0.6, 2.9, 0.6], 0.09, K.clay(C.white, { rough: 0.35 })));
    for (let k = 0; k < 8; k++) { const y = 2.75 - k * 0.15; g.add(K.rod([px - lean * 0.55 * (y / 2.9), y, 0.6], [px + (k + 1) * 0.32 * (i ? -1 : 1), 0.6, 0.85], 0.012, cableM), K.rod([px - lean * 0.55 * (y / 2.9), y, 0.6], [px + (k + 1) * 0.32 * (i ? -1 : 1), 0.6, 0.35], 0.012, cableM)); }
    root.add(g); intro.push({ obj: g, from: 'grow-y', delay: 0.8 + i * 0.15, dur: 1.0 });
  });
  const cars = []; const carG = new T.BoxGeometry(0.14, 0.06, 0.08);
  for (let i = 0; i < 10; i++) { const m = new T.Mesh(carG, K.glow(i % 2 ? 0xfff1c9 : C.lime)); m.position.set(-4 + i * 0.8, 0.65, i % 2 ? 0.48 : 0.72); root.add(m); cars.push({ m, d: i % 2 ? -1 : 1 }); }

  /* HITEC City */
  const glass = K.glass(0xa9b8f2, { opacity: 0.65 });
  [[-2.6, -1.8, 0.7, 2.4], [-1.5, -2.2, 0.6, 3.2], [-0.3, -1.7, 0.75, 2.0], [0.9, -2.3, 0.6, 2.8], [2.1, -1.8, 0.7, 2.2], [3.2, -2.3, 0.55, 3.0]].forEach(([x, z, s, h], i) => {
    const t = i % 2 ? K.tower(s, h, s, [C.plum, 0x5b4c9b, C.deep][i % 3], { seed: i, side: true }) : K.group(K.up(s * 0.86, h * 0.98, s * 0.86, K.clay(C.deep), 0.03), K.up(s, h, s, glass, 0.04));
    K.place(t, [x, 0, z]); root.add(t); intro.push({ obj: t, from: 'grow-y', delay: 0.6 + i * 0.08, dur: 0.8 });
  });
  const pin = K.place(K.pin(C.green, 1, 'Hyderabad'), [-1.5, 4.0, -2.2]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.9 });

  return {
    root, intro, cam: [5.4, 5.6, 9.8], target: [0, 1.2, 0], fov: 28, sway: 0.1, fit: 0.74,
    update(t, dt, s) {
      for (const c of cars) { c.m.position.x += c.d * 0.6 * dt; if (c.m.position.x > 4.1) c.m.position.x = -4.1; if (c.m.position.x < -4.1) c.m.position.x = 4.1; }
      K.stepRipples(rips, t); pin.position.y = 4.0 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07);
    },
  };
}
