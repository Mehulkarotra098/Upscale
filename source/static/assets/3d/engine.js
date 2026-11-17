/* uscale.in hero scenes: one small engine, one scene module per page (assets/3d/scenes/<page>.js).
   Loaded by script.js after the page has painted; the poster image stays until the first frame is drawn, and stays for
   good when WebGL is missing. Studio lighting (room environment + key light with soft shadows), the brand palette, an
   intro where the scene builds itself, idle motion, mouse parallax, drag to turn on touch, pause when off screen,
   automatic quality drop on slow devices, and a calm mode when motion is reduced. */
import * as T from './three-r170.js';

export const C = { violet: 0x251e45, ink: 0x1b1535, deep: 0x2e2558, plum: 0x3b2f70, lav: 0xc9bce8, lavLight: 0xe7e0f7, mist: 0xf3f0fa,
  green: 0x63b849, lime: 0x8ed474, mint: 0xcdeec0, cream: 0xf6f1e6, sand: 0xe9dcc3, white: 0xffffff, gold: 0xf2c14e, coral: 0xf08a6c, sky: 0x8fb8ff, sea: 0x7f8fe0 };

/* ---------- building blocks the scenes share ---------- */
const cache = new Map();
function mat(kind, color, o = {}) {
  const key = kind + color + JSON.stringify(o);
  if (cache.has(key)) return cache.get(key);
  let m;
  if (kind === 'glow') m = new T.MeshBasicMaterial({ color, toneMapped: false, transparent: o.opacity != null, opacity: o.opacity ?? 1 });
  else if (kind === 'glass') m = new T.MeshPhysicalMaterial({ color, roughness: o.rough ?? 0.12, metalness: 0, transparent: true, opacity: o.opacity ?? 0.55, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.2, depthWrite: false });
  else if (kind === 'metal') m = new T.MeshStandardMaterial({ color, roughness: o.rough ?? 0.28, metalness: 0.85, envMapIntensity: 1.1 });
  else m = new T.MeshStandardMaterial({ color, roughness: o.rough ?? 0.62, metalness: o.metal ?? 0, emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1, envMapIntensity: o.env ?? 0.6, flatShading: !!o.flat });
  cache.set(key, m);
  return m;
}
function place(m, p = [0, 0, 0], r = [0, 0, 0], s) {
  m.position.set(p[0], p[1], p[2]); m.rotation.set(r[0], r[1], r[2]);
  if (s != null) Array.isArray(s) ? m.scale.set(s[0], s[1], s[2]) : m.scale.setScalar(s);
  return m;
}
function mesh(geo, material, shadow = true) { const m = new T.Mesh(geo, material); m.castShadow = shadow; m.receiveShadow = true; return m; }

export const K = {
  T, C,
  clay: (c, o) => mat('clay', c, o), glass: (c, o) => mat('glass', c, o), metal: (c, o) => mat('metal', c, o), glow: (c, o) => mat('glow', c, o),
  group: (...kids) => { const g = new T.Group(); kids.forEach((k) => k && g.add(k)); return g; },
  place,
  box: (w, h, d, m, r = 0.06, seg = 4) => mesh(r > 0 ? new T.RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2)) : new T.BoxGeometry(w, h, d), m),
  cyl: (rt, rb, h, m, seg = 40) => mesh(new T.CylinderGeometry(rt, rb, h, seg), m),
  ball: (r, m, seg = 40) => mesh(new T.SphereGeometry(r, seg, Math.round(seg * 0.75)), m),
  cone: (r, h, m, seg = 32) => mesh(new T.ConeGeometry(r, h, seg), m),
  torus: (r, t, m, arc = Math.PI * 2, seg = 64) => mesh(new T.TorusGeometry(r, t, 16, seg, arc), m),
  capsule: (r, len, m) => mesh(new T.CapsuleGeometry(r, len, 8, 20), m),
  lathe: (pts, m, seg = 48) => mesh(new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), seg), m),
  /* a flat outline pushed into 3D, with a soft bevel: pts are [x, y] pairs, holes are arrays of pairs */
  extrude(pts, depth, m, o = {}) {
    const s = new T.Shape(pts.map(([x, y]) => new T.Vector2(x, y)));
    (o.holes || []).forEach((h) => s.holes.push(new T.Path(h.map(([x, y]) => new T.Vector2(x, y)))));
    const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: o.bevel !== 0, bevelThickness: o.bevel ?? 0.03, bevelSize: o.bevel ?? 0.03, bevelSegments: 3, curveSegments: o.curve ?? 16 });
    g.translate(0, 0, -depth / 2);
    return mesh(g, m);
  },
  /* a thin tube along points (cables, rails, arcs) */
  tube(points, r, m, seg = 48) {
    const curve = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(p[0], p[1], p[2])));
    return mesh(new T.TubeGeometry(curve, seg, r, 8, false), m, false);
  },
  /* many copies of one shape: list of {p, r, s} -> one draw call */
  many(geo, m, list, shadow = true) {
    const im = new T.InstancedMesh(geo, m, list.length); const o = new T.Object3D();
    list.forEach((it, i) => { o.position.set(...it.p); o.rotation.set(...(it.r || [0, 0, 0])); Array.isArray(it.s) ? o.scale.set(...it.s) : o.scale.setScalar(it.s ?? 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    im.castShadow = shadow; im.receiveShadow = true; return im;
  },
  /* text drawn on a canvas, shown on a plane (signs, labels, screens) */
  label(text, o = {}) {
    const lines = String(text).split('\n'); const px = o.px ?? 64; const pad = o.pad ?? px * 0.5;
    const cv = document.createElement('canvas'); const g = cv.getContext('2d');
    const font = `${o.weight ?? 700} ${px}px ${o.font ?? 'Inter, "Segoe UI", system-ui, sans-serif'}`; g.font = font;
    const w = Math.ceil(Math.max(...lines.map((l) => g.measureText(l).width)) + pad * 2); const h = Math.ceil(lines.length * px * 1.2 + pad * 1.6);
    cv.width = w; cv.height = h; g.font = font; g.textBaseline = 'middle'; g.textAlign = o.align ?? 'center';
    if (o.bg != null) { g.fillStyle = o.bg; const r = o.radius ?? h / 2; g.beginPath(); g.roundRect(0, 0, w, h, Math.min(r, h / 2, w / 2)); g.fill(); }
    g.fillStyle = o.color ?? '#251E45';
    lines.forEach((l, i) => g.fillText(l, o.align === 'left' ? pad : w / 2, pad * 0.8 + px * 0.6 + i * px * 1.2));
    const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
    const height = o.height ?? 0.3; const m = new T.Mesh(new T.PlaneGeometry((height * w) / h, height), new T.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: T.DoubleSide }));
    return m;
  },
  /* soft floor shadow under a scene */
  floor(size = 14, opacity = 0.22) { const m = new T.Mesh(new T.PlaneGeometry(size, size), new T.ShadowMaterial({ opacity })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; },
  ease: { out: (x) => 1 - Math.pow(1 - x, 3), back: (x) => { const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }, inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2) },
};

/* ---------- the engine ---------- */
const reduce = () => document.documentElement.classList.contains('rm') || matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function mount(el) {
  if (el.__h3d) return; el.__h3d = true;
  const id = el.dataset.scene;
  let mod;
  try { mod = await import(el.dataset.src || `./scenes/${id}.js`); } catch (e) { el.classList.add('is-fallback'); return; }
  const canvas = document.createElement('canvas'); canvas.className = 'h3d__cv'; canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: el.hasAttribute('data-capture') }); }
  catch (e) { el.classList.add('is-fallback'); return; }
  el.appendChild(canvas);
  const small = Math.min(innerWidth, innerHeight) < 600;
  let dpr = Math.min(devicePixelRatio || 1, small ? 1.75 : 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.96;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;

  const scene = new T.Scene();
  const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(new T.RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.add(new T.HemisphereLight(C.lavLight, C.deep, 0.4));
  const key = new T.DirectionalLight(0xfff6ea, 2.1); key.position.set(5, 9, 6); key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048); key.shadow.radius = 6; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
  scene.add(key);
  const rim = new T.DirectionalLight(C.lime, 0.55); rim.position.set(-6, 3, -5); scene.add(rim);

  const calm = reduce(); const capture = el.hasAttribute('data-capture');  /* capture: fixed steps, so posters show the finished scene */
  const spec = mod.default(K, { calm, small });
  const root = new T.Group(); root.add(spec.root); scene.add(root);
  const cam = new T.PerspectiveCamera(spec.fov ?? 30, 1, 0.1, 200);
  const camPos = new T.Vector3(...(spec.cam ?? [6, 5, 8])); const target = new T.Vector3(...(spec.target ?? [0, 0.6, 0]));
  if (spec.light) { key.position.set(...spec.light); }
  if (spec.fog) scene.fog = new T.Fog(spec.fog[0], spec.fog[1], spec.fog[2]);

  /* intro: every listed piece grows into place, one after another */
  const intro = (spec.intro || []).map((it, i) => { const o = it.obj || it; const s = o.scale.clone(); const p = o.position.clone();
    return { o, s, p, delay: it.delay ?? i * 0.08, dur: it.dur ?? 0.9, from: it.from ?? 'grow' }; });
  const introLen = intro.reduce((m, it) => Math.max(m, it.delay + it.dur), 0);

  /* framing: the camera backs off until the whole scene fits, whatever the box shape (wide laptop or narrow phone) */
  const bounds = new T.Box3().setFromObject(spec.root); const sphere = bounds.getBoundingSphere(new T.Sphere());
  if (!spec.target) target.copy(sphere.center);
  const dir = camPos.clone().sub(new T.Vector3(...(spec.target ?? sphere.center.toArray()))).normalize();
  let w = 0, h = 0;
  function size() {
    const r = el.getBoundingClientRect(); w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false); cam.aspect = w / h;
    const v = T.MathUtils.degToRad(cam.fov) / 2; const hz = Math.atan(Math.tan(v) * cam.aspect);
    const d = (sphere.radius / Math.sin(Math.min(v, hz))) * (spec.fit ?? 0.82);
    cam.position.copy(dir).multiplyScalar(d).add(target); cam.updateProjectionMatrix();
  }
  size(); new ResizeObserver(size).observe(el);

  /* pointer parallax (mouse) and drag to turn (touch) */
  const look = { x: 0, y: 0, tx: 0, ty: 0, drag: 0, dragV: 0, down: false, lastX: 0 };
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect(); look.tx = ((e.clientX - r.left) / r.width - 0.5) * 2; look.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (look.down) { const dx = e.clientX - look.lastX; look.lastX = e.clientX; look.dragV = dx * 0.006; look.drag = Math.max(-0.9, Math.min(0.9, look.drag + look.dragV)); }
  });
  el.addEventListener('pointerleave', () => { look.tx = 0; look.ty = 0; });
  el.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; look.down = true; look.lastX = e.clientX; });
  addEventListener('pointerup', () => { look.down = false; });

  let on = true; let raf = 0; let last = performance.now(); let t = 0; let first = true; let slow = 0; let frames = 0;
  new IntersectionObserver((es) => { on = es[0].isIntersecting; if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }, { rootMargin: '80px' }).observe(el);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && on && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } });

  function loop(now) {
    raf = 0; if (!on || document.hidden) return;
    const dt = capture ? 1 / 30 : Math.min(0.05, (now - last) / 1000); last = now; t += dt; el.__t = t; el.__introLen = introLen;
    /* quality: if frames stay slow, drop resolution and soft shadows once */
    frames++; if (dt > 0.03) slow++; if (frames === 90 && slow > 45 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); key.shadow.mapSize.set(1024, 1024); size(); }
    for (const it of intro) {
      const k = Math.max(0, Math.min(1, (t - it.delay) / it.dur)); const e = it.from === 'drop' ? K.ease.out(k) : K.ease.back(k);
      if (it.from === 'rise') { it.o.position.y = it.p.y - (1 - K.ease.out(k)) * 1.2; it.o.scale.copy(it.s).multiplyScalar(Math.max(0.0001, K.ease.out(k))); }
      else if (it.from === 'grow-y') { it.o.scale.set(it.s.x, Math.max(0.0001, it.s.y * e), it.s.z); }
      else if (it.from === 'drop') { it.o.position.y = it.p.y + (1 - e) * 2.5; it.o.scale.copy(it.s).multiplyScalar(Math.max(0.0001, Math.min(1, k * 3))); }
      else it.o.scale.copy(it.s).multiplyScalar(Math.max(0.0001, e));
    }
    const amp = calm ? 0.35 : 1;
    look.x += (look.tx - look.x) * 0.05; look.y += (look.ty - look.y) * 0.05;
    if (!look.down) { look.drag *= 0.94; }
    root.rotation.y = (spec.sway ?? 0.12) * Math.sin(t * 0.35) * amp + look.x * 0.18 * amp + look.drag;
    root.rotation.x = look.y * 0.05 * amp;
    root.position.y = Math.sin(t * 0.9) * 0.05 * amp;
    cam.lookAt(target);
    if (spec.update) spec.update(t, dt, { calm, intro: Math.min(1, t / Math.max(0.01, introLen)), cam });
    /* labels marked .userData.face always turn to the camera, so they stay readable as the scene sways */
    if (spec.faces) for (const f of spec.faces) { f.quaternion.copy(cam.quaternion); if (f.parent) f.quaternion.premultiply(f.parent.getWorldQuaternion(new T.Quaternion()).invert()); }
    renderer.render(scene, cam);
    if (first) { first = false; el.classList.add('is-live'); }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
}
