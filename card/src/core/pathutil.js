// Small SVG path toolkit: parse any path into absolute M/L/C/Z commands, transform it, and build common shapes.
// Everything the card maker draws ends up as these four commands, so SVG, PNG and PDF all receive the same geometry.

const ARGS = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
const num = (v) => {
  const r = Math.round(v * 1000) / 1000;
  return Object.is(r, -0) ? '0' : String(r);
};

function tokenize(d) {
  const out = [];
  const re = /([a-zA-Z])|([-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?)/g;
  let m;
  while ((m = re.exec(d))) out.push(m[1] || Number(m[2]));
  return out;
}

// Arc flags can be written with no separator ("a1 1 0 01.5.5"), so arcs need their own reader.
function readArcArgs(d, start) {
  const flagRe = /[\s,]*([01])/y;
  const numRe = /[\s,]*([-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?)/y;
  const values = [];
  let i = start;
  for (let n = 0; n < 7; n++) {
    const re = n === 3 || n === 4 ? flagRe : numRe;
    re.lastIndex = i;
    const m = re.exec(d);
    if (!m) return null;
    values.push(Number(m[1]));
    i = re.lastIndex;
  }
  return { values, end: i };
}

function arcToCubics(x1, y1, rx, ry, phiDeg, large, sweep, x2, y2) {
  if (rx === 0 || ry === 0) return [[x1, y1, x2, y2, x2, y2]];
  if (x1 === x2 && y1 === y2) return [];
  const phi = (phiDeg * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const xp = cos * dx + sin * dy;
  const yp = -sin * dx + cos * dy;
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const lam = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lam > 1) {
    rx *= Math.sqrt(lam);
    ry *= Math.sqrt(lam);
  }
  const num2 = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
  const den = rx * rx * yp * yp + ry * ry * xp * xp;
  const co = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num2 / den));
  const cxp = (co * rx * yp) / ry;
  const cyp = (-co * ry * xp) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const a1 = Math.atan2((yp - cyp) / ry, (xp - cxp) / rx);
  let da = Math.atan2((-yp - cyp) / ry, (-xp - cxp) / rx) - a1;
  if (sweep && da < 0) da += 2 * Math.PI;
  if (!sweep && da > 0) da -= 2 * Math.PI;
  const n = Math.max(1, Math.ceil(Math.abs(da) / (Math.PI / 2) - 1e-9));
  const step = da / n;
  const t = (4 / 3) * Math.tan(step / 4);
  const pt = (a) => [cx + cos * rx * Math.cos(a) - sin * ry * Math.sin(a), cy + sin * rx * Math.cos(a) + cos * ry * Math.sin(a)];
  const der = (a) => [-cos * rx * Math.sin(a) - sin * ry * Math.cos(a), -sin * rx * Math.sin(a) + cos * ry * Math.cos(a)];
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = a1 + i * step;
    const b = a + step;
    const [p0x, p0y] = pt(a);
    const [d0x, d0y] = der(a);
    const [p1x, p1y] = i === n - 1 ? [x2, y2] : pt(b);
    const [d1x, d1y] = der(b);
    out.push([p0x + t * d0x, p0y + t * d0y, p1x - t * d1x, p1y - t * d1y, p1x, p1y]);
  }
  return out;
}

/** Parse any SVG path into absolute commands: [['M',x,y],['L',x,y],['C',x1,y1,x2,y2,x,y],['Z']]. */
export function parsePath(d) {
  const cmds = [];
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let lastCtrl = null;
  let lastQuad = null;
  const re = /[a-zA-Z]/g;
  const heads = [];
  let h;
  while ((h = re.exec(d))) {
    if (h[0] !== 'e' && h[0] !== 'E') heads.push(h.index);
  }
  for (let hi = 0; hi < heads.length; hi++) {
    const at = heads[hi];
    const letter = d[at];
    const lower = letter.toLowerCase();
    const abs = letter !== lower;
    const end = hi + 1 < heads.length ? heads[hi + 1] : d.length;
    if (!(lower in ARGS)) throw new Error(`Unsupported path command ${letter}`);
    if (lower === 'z') {
      cmds.push(['Z']);
      x = sx;
      y = sy;
      lastCtrl = lastQuad = null;
      continue;
    }
    const groups = [];
    if (lower === 'a') {
      let i = at + 1;
      for (;;) {
        const r = readArcArgs(d, i);
        if (!r || r.end > end) break;
        groups.push(r.values);
        i = r.end;
      }
    } else {
      const nums = tokenize(d.slice(at + 1, end));
      const n = ARGS[lower];
      for (let i = 0; i + n <= nums.length; i += n) groups.push(nums.slice(i, i + n));
    }
    groups.forEach((a, gi) => {
      const ox = abs ? 0 : x;
      const oy = abs ? 0 : y;
      let cmd = lower;
      if (lower === 'm' && gi > 0) cmd = 'l';
      if (cmd === 'm') {
        x = a[0] + ox;
        y = a[1] + oy;
        sx = x;
        sy = y;
        cmds.push(['M', x, y]);
        lastCtrl = lastQuad = null;
      } else if (cmd === 'l' || cmd === 'h' || cmd === 'v') {
        if (cmd === 'l') {
          x = a[0] + ox;
          y = a[1] + oy;
        } else if (cmd === 'h') x = a[0] + ox;
        else y = a[0] + oy;
        cmds.push(['L', x, y]);
        lastCtrl = lastQuad = null;
      } else if (cmd === 'c' || cmd === 's') {
        const [x1, y1] = cmd === 's' ? (lastCtrl ? [2 * x - lastCtrl[0], 2 * y - lastCtrl[1]] : [x, y]) : [a[0] + ox, a[1] + oy];
        const off = cmd === 's' ? 0 : 2;
        const x2 = a[off] + ox;
        const y2 = a[off + 1] + oy;
        const nx = a[off + 2] + ox;
        const ny = a[off + 3] + oy;
        cmds.push(['C', x1, y1, x2, y2, nx, ny]);
        lastCtrl = [x2, y2];
        lastQuad = null;
        x = nx;
        y = ny;
      } else if (cmd === 'q' || cmd === 't') {
        const [qx, qy] = cmd === 't' ? (lastQuad ? [2 * x - lastQuad[0], 2 * y - lastQuad[1]] : [x, y]) : [a[0] + ox, a[1] + oy];
        const off = cmd === 't' ? 0 : 2;
        const nx = a[off] + ox;
        const ny = a[off + 1] + oy;
        cmds.push(['C', x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y), nx + (2 / 3) * (qx - nx), ny + (2 / 3) * (qy - ny), nx, ny]);
        lastQuad = [qx, qy];
        lastCtrl = null;
        x = nx;
        y = ny;
      } else if (cmd === 'a') {
        const nx = a[5] + ox;
        const ny = a[6] + oy;
        for (const c of arcToCubics(x, y, a[0], a[1], a[2], a[3], a[4], nx, ny)) cmds.push(['C', ...c]);
        x = nx;
        y = ny;
        lastCtrl = lastQuad = null;
      }
    });
  }
  return cmds;
}

/** Turn commands back into a compact path string, rounded to 0.001 mm. */
export function pathString(cmds) {
  let s = '';
  for (const c of cmds) {
    s += c[0];
    for (let i = 1; i < c.length; i++) s += (i > 1 ? ' ' : '') + num(c[i]);
  }
  return s;
}

/** Apply scale + translate to commands. */
export function transformCmds(cmds, sx, sy, tx, ty) {
  return cmds.map((c) => {
    const o = [c[0]];
    for (let i = 1; i < c.length; i += 2) o.push(c[i] * sx + tx, c[i + 1] * sy + ty);
    return o;
  });
}

const K = 0.5522847498;

export function rectPath(x, y, w, h, r = 0) {
  r = Math.min(Math.max(0, r), w / 2, h / 2);
  if (!r) return `M${num(x)} ${num(y)}L${num(x + w)} ${num(y)}L${num(x + w)} ${num(y + h)}L${num(x)} ${num(y + h)}Z`;
  const c = r * (1 - K);
  return pathString([
    ['M', x + r, y],
    ['L', x + w - r, y],
    ['C', x + w - c, y, x + w, y + c, x + w, y + r],
    ['L', x + w, y + h - r],
    ['C', x + w, y + h - c, x + w - c, y + h, x + w - r, y + h],
    ['L', x + r, y + h],
    ['C', x + c, y + h, x, y + h - c, x, y + h - r],
    ['L', x, y + r],
    ['C', x, y + c, x + c, y, x + r, y],
    ['Z'],
  ]);
}

export function ellipsePath(cx, cy, rx, ry) {
  const kx = rx * K;
  const ky = ry * K;
  return pathString([
    ['M', cx + rx, cy],
    ['C', cx + rx, cy + ky, cx + kx, cy + ry, cx, cy + ry],
    ['C', cx - kx, cy + ry, cx - rx, cy + ky, cx - rx, cy],
    ['C', cx - rx, cy - ky, cx - kx, cy - ry, cx, cy - ry],
    ['C', cx + kx, cy - ry, cx + rx, cy - ky, cx + rx, cy],
    ['Z'],
  ]);
}
