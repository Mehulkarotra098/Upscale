/* Clients abroad (hub): a dotted globe turning slowly, a night side, and glowing arcs from Mumbai to the nine countries,
   with a packet of light travelling each arc. No country borders are drawn. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = []; const faces = [];
  const R = 2.3; const globe = K.group();
  const N = 1800; const pts = new Float32Array(N * 3); const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2; const r = Math.sqrt(1 - y * y); const a = g * i; pts.set([Math.cos(a) * r * R, y * R, Math.sin(a) * r * R], i * 3); }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pts, 3));
  globe.add(new T.Points(geo, new T.PointsMaterial({ color: 0xc9bce8, size: 0.05, transparent: true, opacity: 0.9 })));
  globe.add(new T.Mesh(new T.SphereGeometry(R * 0.985, 48, 32), K.clay(0x2e2558, { rough: 0.6 })));
  const night = new T.Mesh(new T.SphereGeometry(R * 1.01, 48, 32, 0, Math.PI), new T.MeshBasicMaterial({ color: 0x0b0820, transparent: true, opacity: 0.35, depthWrite: false })); globe.add(night);
  const ll = (lat, lon, r = R) => { const p = (90 - lat) * Math.PI / 180; const t = (lon + 180) * Math.PI / 180; return new T.Vector3(-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)); };
  const home = ll(19.1, 72.9);
  globe.add(K.place(K.ball(0.09, K.clay(C.green, { rough: 0.3 })), home.toArray()));
  const places = [['UK', 51.5, -0.1], ['USA', 40.7, -74], ['Australia', -33.9, 151.2], ['Canada', 43.7, -79.4], ['Singapore', 1.35, 103.8], ['UAE', 25.2, 55.3], ['Ireland', 53.3, -6.3], ['New Zealand', -36.8, 174.8], ['Netherlands', 52.4, 4.9]];
  const arcM = new T.MeshBasicMaterial({ color: C.lime, transparent: true, opacity: 0.85, toneMapped: false }); const packets = [];
  places.forEach(([n, la, lo], i) => {
    const b = ll(la, lo); const mid = home.clone().add(b).multiplyScalar(0.5); mid.setLength(R + 0.4 + home.distanceTo(b) * 0.28);
    const curve = new T.QuadraticBezierCurve3(home, mid, b);
    const arc = new T.Mesh(new T.TubeGeometry(curve, 48, 0.018, 6, false), arcM); globe.add(arc);
    globe.add(K.place(K.ball(0.06, K.clay(C.white)), b.toArray()));
    const lab = K.place(K.label(n, { px: 52, bg: 'rgba(255,255,255,0.95)', color: '#251E45', height: 0.24, weight: 700 }), b.clone().setLength(R + 0.32).toArray()); globe.add(lab); faces.push(lab);
    const d = new T.Mesh(new T.SphereGeometry(0.05, 10, 8), new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); globe.add(d); packets.push({ d, curve, o: i * 0.11 });
  });
  globe.rotation.set(0.3, 2.75, 0); globe.position.y = 2.4; root.add(globe); intro.push({ obj: globe, delay: 0.1, dur: 1.2 });
  const ringM = new T.MeshBasicMaterial({ color: C.lav, transparent: true, opacity: 0.35, toneMapped: false, depthWrite: false });
  const orbit = new T.Mesh(new T.TorusGeometry(R + 0.75, 0.01, 6, 120), ringM); orbit.rotation.x = Math.PI / 2.3; orbit.position.y = 2.4; root.add(orbit);
  const pod = K.place(K.cyl(1.3, 1.6, 0.3, K.clay(0xe7e0f7), 48), [0, 0.15, 0]); root.add(pod); intro.push({ obj: pod, from: 'rise' });

  return {
    root, intro, faces, cam: [0.6, 3.6, 9.6], target: [0, 2.2, 0], fov: 28, sway: 0.05, fit: 0.78,
    update(t, dt, s) {
      globe.rotation.y = 2.75 + Math.sin(t * 0.12) * 0.3;
      for (const p of packets) { const k = (t * 0.3 + p.o) % 1; p.d.position.copy(p.curve.getPoint(k)); }
      orbit.rotation.z = t * 0.1;
    },
  };
}
