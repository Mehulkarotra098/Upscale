/* Pricing: a price ladder. Four raised blocks, a landing page to an online store, each topped with its fixed price (read
   from the price list at build time), a 20 / 20 / 60 payment track in front that fills, and a green Fixed seal above. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = []; const faces = [];
  const rows = (env.args && env.args.rows) || [['Landing page', '₹25,000'], ['Business site', '₹55,000'], ['10–20 pages', '₹85,000'], ['Online store', 'from ₹95,000']];
  const base = K.place(K.box(8.4, 0.4, 5.6, K.clay(0xeee9f7, { rough: 0.8 }), 0.4), [0, -0.2, 0]); root.add(base); intro.push({ obj: base, from: 'rise' });

  /* the ladder: one block per price, taller as the site grows */
  const tones = [0xb9ade0, 0x8f7fd0, 0x5b4c9b, C.violet];
  rows.forEach(([name, price], i) => {
    const h = 0.7 + i * 0.62; const x = -2.7 + i * 1.8;
    const block = K.group(K.up(1.3, h, 1.3, K.clay(tones[i], { rough: 0.45 }), 0.12));
    for (let k = 1; k <= i + 1; k++) block.add(K.place(K.box(0.9, 0.05, 0.02, K.glow(i > 1 ? 0xb6e3a3 : 0xffffff, { opacity: 0.9 }), 0), [0, (h / (i + 2)) * k, 0.66]));
    const tag = K.place(K.label(price, { px: 64, bg: '#ffffff', color: '#251E45', height: 0.38, weight: 800 }), [0, h + 0.38, 0]);
    const nm = K.place(K.label(name, { px: 46, bg: 'rgba(37,30,69,0.9)', color: '#ffffff', height: 0.24, weight: 700 }), [0, 0.28, 0.72]);
    block.add(tag, nm); faces.push(tag);
    K.place(block, [x, 0, -0.6]); root.add(block); intro.push({ obj: block, from: 'grow-y', delay: 0.3 + i * 0.15, dur: 0.9 });
  });

  /* the payment track: 20 / 20 / 60, filling in turn */
  const track = K.place(K.box(6.6, 0.12, 0.5, K.clay(C.white, { rough: 0.6 }), 0.1), [0, 0.06, 1.8]); root.add(track);
  const segs = [[20, 'Start', 0xc9bce8], [20, 'Design OK', 0xb9ade0], [60, 'When it’s live', C.green]].map(([w, l, c], i, a) => {
    const width = (6.3 * w) / 100; const x0 = -3.15 + (6.3 * a.slice(0, i).reduce((s, q) => s + q[0], 0)) / 100;
    const seg = K.box(width - 0.06, 0.12, 0.38, K.clay(c, { rough: 0.4 }), 0.06); seg.geometry.translate(width / 2, 0, 0); K.place(seg, [x0 + 0.03, 0.18, 1.8]); root.add(seg);
    const lab = K.place(K.label(`${w}% · ${l}`, { px: 44, color: '#251E45', height: 0.24, weight: 700 }), [x0 + width / 2, 0.46, 2.3]); root.add(lab); faces.push(lab);
    return { seg, i };
  });

  /* the seal */
  const seal = K.group(K.cyl(0.62, 0.62, 0.14, K.clay(C.green, { rough: 0.35 }), 48), K.place(K.torus(0.5, 0.03, K.clay(0xdff5d3)), [0, 0.08, 0], [Math.PI / 2, 0, 0]));
  seal.add(K.place(K.label('FIXED', { px: 80, color: '#251E45', height: 0.3, weight: 800 }), [0, 0.09, 0], [-Math.PI / 2, 0, 0]));
  K.place(seal, [-2.9, 2.9, -0.7], [1.1, 0, -0.2]); root.add(seal); intro.push({ obj: seal, from: 'drop', delay: 1.4, dur: 0.8 });

  return {
    root, intro, faces, cam: [3.6, 4.6, 10.4], target: [0, 1.4, 0.2], fov: 28, sway: 0.08, fit: 0.72,
    update(t, dt, s) {
      const cyc = t % 6;
      segs.forEach(({ seg, i }) => { const k = Math.min(1, Math.max(0, (cyc - 0.6 - i * 0.7) / 0.6)); seg.scale.x = Math.max(0.001, K.ease.out(k)); });
      seal.rotation.z = -0.2 + Math.sin(t * 0.8) * 0.15; seal.position.y = 2.9 + Math.sin(t * 1.2) * (s.calm ? 0.02 : 0.08);
    },
  };
}
