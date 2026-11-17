/* Website design across India: a network, not a map (no borders are drawn). City pins stand on a floating tile in their
   rough places, and glowing arcs run from Mumbai to each one, with a packet of light travelling along every arc. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = []; const faces = [];
  const tile = K.place(K.box(8.4, 0.4, 7.8, K.clay(0xeee9f7, { rough: 0.8 }), 0.5), [0, -0.2, 0]); root.add(tile); intro.push({ obj: tile, from: 'rise' });
  const grid = new T.Mesh(new T.PlaneGeometry(8, 7.4, 16, 15), new T.MeshBasicMaterial({ color: 0xd2c8ee, wireframe: true, transparent: true, opacity: 0.5 })); grid.rotation.x = -Math.PI / 2; grid.position.y = 0.01; root.add(grid);

  /* rough positions only (schematic): x east, z south */
  const cities = [['Delhi NCR', 0.2, -2.6], ['Jaipur', -0.8, -1.8], ['Ahmedabad', -2.0, -0.6], ['Surat', -2.1, 0.2], ['Mumbai', -2.0, 0.9], ['Pune', -1.4, 1.3],
    ['Hyderabad', 0.2, 1.4], ['Bengaluru', -0.4, 2.8], ['Chennai', 0.6, 2.9], ['Kolkata', 2.8, -0.2]];
  const pos = {}; const packets = [];
  cities.forEach(([n, x, z], i) => {
    const big = n === 'Mumbai'; pos[n] = new T.Vector3(x, 0, z);
    const p = K.group(K.place(K.cyl(0.04, 0.04, big ? 0.9 : 0.55, K.clay(C.white), 10), [0, big ? 0.45 : 0.27, 0]), K.place(K.ball(big ? 0.2 : 0.13, K.clay(big ? C.green : C.plum, { rough: 0.35 }), 24), [0, big ? 0.95 : 0.6, 0]));
    const lab = K.place(K.label(n, { px: 56, bg: big ? '#63B849' : 'rgba(255,255,255,0.95)', color: '#251E45', height: big ? 0.36 : 0.28, weight: big ? 800 : 700 }), [0, big ? 1.3 : 0.88, 0]);
    p.add(lab); faces.push(lab); K.place(p, [x, 0, z]); root.add(p); intro.push({ obj: p, from: 'drop', delay: 0.6 + i * 0.1, dur: 0.6 });
  });
  const arcM = new T.MeshBasicMaterial({ color: C.lime, transparent: true, opacity: 0.8, toneMapped: false });
  const dotM = new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  cities.forEach(([n], i) => {
    if (n === 'Mumbai') return;
    const a = pos.Mumbai.clone().setY(0.95); const b = pos[n].clone().setY(0.6); const mid = a.clone().lerp(b, 0.5); mid.y = 1.6 + a.distanceTo(b) * 0.35;
    const curve = new T.QuadraticBezierCurve3(a, mid, b);
    const arc = new T.Mesh(new T.TubeGeometry(curve, 48, 0.022, 6, false), arcM); root.add(arc); intro.push({ obj: arc, delay: 1.6 + i * 0.06, dur: 0.5 });
    const d = new T.Mesh(new T.SphereGeometry(0.06, 12, 10), dotM); root.add(d); packets.push({ d, curve, o: i * 0.13 });
  });
  const ring = new T.Mesh(new T.RingGeometry(0.3, 0.36, 48), new T.MeshBasicMaterial({ color: C.lime, transparent: true, opacity: 0.6, toneMapped: false, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(pos.Mumbai.x, 0.02, pos.Mumbai.z); root.add(ring);

  return {
    root, intro, faces, cam: [2.6, 8.0, 8.2], target: [-0.3, 0.6, 0.4], fov: 30, sway: 0.08, fit: 0.58,
    update(t, dt, s) {
      for (const p of packets) { const k = (t * 0.35 + p.o) % 1; p.d.position.copy(p.curve.getPoint(k)); }
      const k = (t % 2.4) / 2.4; ring.scale.setScalar(1 + k * 3); ring.material.opacity = 0.6 * (1 - k);
    },
  };
}
