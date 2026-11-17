/* The areas section on /services/website-design-mumbai: a 3D map of Mumbai. The city raised out of the sea, Thane and
   Navi Mumbai across the water, the Western and Central lines as tracks with trains running, a pin for each area that
   rises in turn, and the Ghatkopar studio pin pulsing. Schematic, not to scale (same layout as the flat fallback). */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = []; const faces = [];
  const ls = env.small ? 1.45 : 1; const S = 1 / 40; const X = (x) => (x - 210) * S; const Z = (y) => (y - 285) * S;   // map units (420 x 570) to world

  /* the sea */
  const sea = K.place(K.box(11.2, 0.3, 14.6, K.clay(0x8d86da, { rough: 0.28, env: 0.45 }), 0.5), [0, -0.15, 0]);
  root.add(sea); intro.push({ obj: sea, from: 'rise' });

  /* the city: the outline drawn with curves, pushed up into land */
  const shape = new T.Shape();
  const P = (x, y) => [X(x), -Z(y)];
  shape.moveTo(...P(96, 40)); shape.bezierCurveTo(...P(110, 30), ...P(150, 30), ...P(170, 40)); shape.lineTo(...P(300, 52));
  shape.bezierCurveTo(...P(318, 70), ...P(316, 110), ...P(300, 140)); shape.lineTo(...P(290, 190));
  shape.bezierCurveTo(...P(300, 240), ...P(296, 280), ...P(280, 330)); shape.bezierCurveTo(...P(270, 370), ...P(238, 392), ...P(214, 420));
  shape.lineTo(...P(196, 470)); shape.bezierCurveTo(...P(188, 510), ...P(176, 540), ...P(160, 548)); shape.bezierCurveTo(...P(146, 540), ...P(140, 510), ...P(132, 480));
  shape.bezierCurveTo(...P(116, 450), ...P(98, 420), ...P(92, 380)); shape.bezierCurveTo(...P(84, 330), ...P(90, 290), ...P(96, 250));
  shape.bezierCurveTo(...P(100, 200), ...P(92, 150), ...P(96, 100)); shape.lineTo(...P(96, 40));
  const landG = new T.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4, curveSegments: 24 });
  landG.rotateX(-Math.PI / 2);
  const land = new T.Mesh(landG, K.clay(C.cream, { rough: 0.75 })); land.castShadow = true; land.receiveShadow = true; land.position.y = 0;
  root.add(land); intro.push({ obj: land, from: 'grow-y', delay: 0.2, dur: 0.8 });

  /* Thane and Navi Mumbai, across the water, a little lower */
  const far = (pts, label, lx, lz) => {
    const sh = new T.Shape(); sh.moveTo(...P(...pts[0]));
    for (let i = 1; i < pts.length; i += 3) sh.bezierCurveTo(...P(...pts[i]), ...P(...pts[i + 1]), ...P(...pts[i + 2]));
    const g = new T.ExtrudeGeometry(sh, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3, curveSegments: 18 }); g.rotateX(-Math.PI / 2);
    const m = new T.Mesh(g, K.clay(C.lavLight, { rough: 0.8 })); m.castShadow = true; m.receiveShadow = true; root.add(m); intro.push({ obj: m, from: 'grow-y', delay: 0.35, dur: 0.7 });
    const l = K.place(K.label(label, { px: 60, bg: 'rgba(255,255,255,0.95)', color: '#5B4C9B', height: 0.55 * ls, weight: 800 }), [X(lx), 1.0, Z(lz)]); root.add(l); faces.push(l);
  };
  far([[322, 64], [346, 42], [392, 44], [410, 70], [410, 140], [410, 200], [410, 236], [384, 252], [344, 236], [330, 206], [320, 170], [316, 104], [322, 64]], 'Thane', 366, 150);
  far([[326, 300], [350, 286], [396, 292], [410, 312], [410, 380], [410, 430], [410, 470], [384, 488], [344, 474], [330, 444], [318, 404], [318, 340], [326, 300]], 'Navi Mumbai', 368, 390);

  /* the Western and Central lines as raised tracks, with a train on each */
  const top = 0.7;
  const west = [[118, 70], [122, 108], [126, 146], [130, 184], [134, 226], [133, 262], [132, 300], [150, 362], [160, 430], [168, 498]].map(([x, y]) => new T.Vector3(X(x), top, Z(y)));
  const cent = [[262, 96], [250, 150], [236, 206], [236, 262], [206, 300], [180, 330], [150, 362]].map(([x, y]) => new T.Vector3(X(x), top, Z(y)));
  const track = (pts, color) => { const c = new T.CatmullRomCurve3(pts); const m = new T.Mesh(new T.TubeGeometry(c, 120, 0.06, 8, false), K.clay(color, { rough: 0.4 })); m.castShadow = true; root.add(m); intro.push({ obj: m, delay: 0.7, dur: 0.6 }); return c; };
  const wc = track(west, 0x8f7fd0); const cc = track(cent, C.green);
  const train = (color) => { const g = K.group(K.place(K.capsule(0.09, 0.32, K.clay(color, { rough: 0.35 })), [0, 0.1, 0], [0, 0, Math.PI / 2])); root.add(g); return g; };
  const t1 = train(C.violet); const t2 = train(0x2f7d22);

  /* area pins: violet in the west, dark in the island city, green in the east; the studio is the big one */
  const AREAS = [['Borivali', 118, 70, 'w'], ['Kandivali', 122, 108, 'w'], ['Malad', 126, 146, 'w'], ['Goregaon', 130, 184, 'w'], ['Andheri', 134, 226, 'w'],
    ['Bandra', 132, 300, 'w'], ['Dadar', 150, 362, 'c'], ['Lower Parel', 140, 400, 'c'], ['Worli', 112, 414, 'c'], ['Fort', 168, 498, 'c'],
    ['Mulund', 262, 96, 'e'], ['Powai', 236, 206, 'e'], ['Ghatkopar', 236, 262, 'e'], ['Kurla', 206, 300, 'e'], ['Chembur', 250, 318, 'e']];
  const col = { w: 0x5b4c9b, c: C.violet, e: C.green };
  let home = null; const pins = [];
  AREAS.forEach(([n, x, y, z], i) => {
    const big = n === 'Ghatkopar'; const m = K.clay(col[z], { rough: 0.35 }); const s = big ? 2.6 : 1.7;
    const pin = K.group(K.place(K.cyl(0.035 * s, 0.035 * s, 0.34 * s, K.clay(C.white), 12), [0, 0.17 * s, 0]), K.place(K.ball(0.1 * s, m, 24), [0, 0.38 * s, 0]));
    const left = z === 'w' || n === 'Worli' || n === 'Powai';
    const lab = K.place(K.label(n, { px: big ? 64 : 56, bg: big ? '#63B849' : 'rgba(255,255,255,0.96)', color: '#251E45', height: (big ? 0.58 : 0.42) * ls, weight: big ? 800 : 700 }), [(left ? -0.95 : 0.95) * ls, 0.42 * s, 0]);
    pin.add(lab); faces.push(lab);
    K.place(pin, [X(x), top - 0.02, Z(y)]); root.add(pin); pins.push(pin); intro.push({ obj: pin, from: 'drop', delay: 1.0 + i * 0.08, dur: 0.6 });
    if (big) home = pin;
  });
  /* small building clusters around each area, so the city reads as a city */
  const bl = []; AREAS.forEach(([n, x, y], i) => { for (let k = 0; k < 5; k++) { const a = i * 2.1 + k * 1.3; const r = 0.38 + (k % 3) * 0.16;
    const h = 0.12 + ((i * 7 + k * 3) % 5) * 0.07; bl.push({ p: [X(x) + Math.cos(a) * r, top - 0.06 + h / 2, Z(y) + Math.sin(a) * r * 0.8], s: [0.16, h, 0.16] }); } });
  const blocks = K.many(new T.BoxGeometry(1, 1, 1), K.clay(0xd9d1ee, { rough: 0.7 }), bl); root.add(blocks); intro.push({ obj: blocks, from: 'grow-y', delay: 0.6, dur: 0.8 });
  const ringM = new T.MeshBasicMaterial({ color: C.lime, transparent: true, opacity: 0.6, toneMapped: false, depthWrite: false });
  const ring = new T.Mesh(new T.RingGeometry(0.4, 0.48, 48), ringM); ring.rotation.x = -Math.PI / 2; ring.position.set(X(236), top + 0.01, Z(262)); root.add(ring);

  return {
    root, intro, faces, cam: [1.6, 9.4, 8.8], target: [0.4, 0.3, 1.4], fov: 30, sway: 0.05, fit: env.small ? 0.52 : 0.58,
    update(t, dt, s) {
      t1.position.copy(wc.getPointAt((t * 0.06) % 1)); t2.position.copy(cc.getPointAt((t * 0.08 + 0.4) % 1));
      const k = (t % 2.4) / 2.4; ring.scale.setScalar(1 + k * 3); ringM.opacity = 0.6 * (1 - k);
      if (home) home.position.y = top - 0.02 + Math.abs(Math.sin(t * 2)) * (s.calm ? 0.02 : 0.08);
    },
  };
}
