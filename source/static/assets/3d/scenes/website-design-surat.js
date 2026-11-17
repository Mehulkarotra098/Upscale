/* Surat, the diamond and silk city: a cut diamond turning and catching the light above bolts of silk that unroll across
   the table, a loupe, a few loose stones, and a pin on Surat. */
export default function (K, env) {
  const { T, C } = K;
  const root = K.group(); const intro = [];
  const table = K.place(K.box(8.4, 0.4, 6.0, K.clay(0x2e2558, { rough: 0.6 }), 0.3), [0, -0.2, 0]); root.add(table); intro.push({ obj: table, from: 'rise' });
  const velvet = K.place(K.box(3.0, 0.06, 2.2, K.clay(0x3f2f7a, { rough: 0.95 }), 0.1), [0.4, 0.03, -0.6]); root.add(velvet);

  /* the diamond: a brilliant cut from a lathe (crown and pavilion), faceted */
  const gem = new T.Mesh(new T.LatheGeometry([[0, -0.95], [0.85, 0], [0.92, 0.08], [0.58, 0.42], [0, 0.42]].map(([x, y]) => new T.Vector2(x, y)), 10),
    new T.MeshPhysicalMaterial({ color: 0xe8f4ff, roughness: 0.05, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.9, envMapIntensity: 2.2, flatShading: true }));
  gem.castShadow = true; const gemG = K.group(gem); gemG.position.set(0.4, 1.9, -0.6); root.add(gemG); intro.push({ obj: gemG, delay: 0.9, dur: 1.0 });
  const glint = new T.Mesh(new T.SphereGeometry(0.06, 8, 8), new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); root.add(glint);

  /* bolts of silk unrolling: a roll and a flat band that grows */
  const silks = [[-2.4, 0.2, 0xd94f7a], [-2.0, 0.9, 0xf2c14e], [-2.7, 1.6, 0x3a9b8a]].map(([x, z, c], i) => {
    const m = K.clay(c, { rough: 0.25, env: 0.9 });
    const roll = K.place(K.cyl(0.26, 0.26, 1.4, m, 32), [x, 0.27, z], [0, 0, Math.PI / 2]); const band = K.place(K.box(1.38, 0.03, 1, m, 0.01), [x, 0.03, z]); band.geometry.translate(0, 0, 0.5);
    root.add(roll, band); intro.push({ obj: roll, delay: 0.3 + i * 0.12 }); return { roll, band, z, o: i };
  });
  /* a loupe and loose stones */
  const loupe = K.group(K.place(K.torus(0.3, 0.06, K.metal(0xc9a85a)), [0, 0, 0], [Math.PI / 2, 0, 0]), K.place(new T.Mesh(new T.CircleGeometry(0.3, 32), K.glass(0xe9f6ff, { opacity: 0.3 })), [0, 0, 0], [-Math.PI / 2, 0, 0]));
  K.place(loupe, [2.4, 0.08, 1.4], [0.3, 0, 0]); root.add(loupe);
  [[1.8, 0.4], [2.1, 0.1], [1.6, -0.2], [2.6, 0.5]].forEach(([x, z], i) => root.add(K.place(new T.Mesh(new T.SphereGeometry(0.09, 6, 4), gem.material), [x, 0.12, z], [0, i, 0])));
  const pin = K.place(K.pin(C.green, 1, 'Surat'), [2.6, 2.6, -1.6]); root.add(pin); intro.push({ obj: pin, from: 'drop', delay: 1.9 });

  return {
    root, intro, cam: [5.0, 5.4, 8.6], target: [0, 1.0, 0.2], fov: 28, sway: 0.08, fit: 0.74,
    update(t, dt, s) {
      gemG.rotation.y = t * (s.calm ? 0.25 : 0.6); gemG.position.y = 1.9 + Math.sin(t * 1.2) * 0.1;
      glint.position.set(0.4 + Math.cos(t * 1.7) * 0.5, 2.1 + Math.sin(t * 2.3) * 0.15, -0.6 + Math.sin(t * 1.7) * 0.3); glint.scale.setScalar(0.6 + Math.abs(Math.sin(t * 3)) * 1.2);
      for (const q of silks) { const k = Math.min(1, Math.max(0, (t - 0.8 - q.o * 0.3) / 2)); const e = K.ease.out(k); q.band.scale.z = Math.max(0.001, e * 1.1); q.roll.position.z = q.z + e * 1.1; q.roll.rotation.x = e * 6; }
      pin.position.y = 2.6 + Math.sin(t * 1.5) * (s.calm ? 0.02 : 0.07);
    },
  };
}
