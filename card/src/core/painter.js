// Draws operations from render.js straight onto a canvas, for the live editor. Geometry is the same data the SVG uses,
// and a test compares the two pixel by pixel, so what's on screen stays what downloads.

// Parsing a path string is the slow part, and most paths don't change between frames.
const pathCache = new Map();
function cachedPath(d) {
  let p = pathCache.get(d);
  if (!p) {
    if (pathCache.size > 800) pathCache.clear();
    p = new Path2D(d);
    pathCache.set(d, p);
  }
  return p;
}

function canvasPaint(ctx, p) {
  if (!p) return null;
  if (typeof p === 'string') return p;
  const g =
    p.type === 'linear' ? ctx.createLinearGradient(p.x1, p.y1, p.x2, p.y2) : ctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, p.r);
  for (const [o, c] of p.stops) g.addColorStop(o, c);
  return g;
}

/** @param {Map<string, CanvasImageSource>} images images already decoded, keyed by their href */
export function paintOps(ctx, ops, images = new Map()) {
  for (const op of ops) {
    if (op.kind === 'path' && !op.d) continue;
    ctx.save();
    if (op.opacity != null && op.opacity !== 1) ctx.globalAlpha *= op.opacity;
    if (op.rot) {
      ctx.translate(op.rot.cx, op.rot.cy);
      ctx.rotate((op.rot.deg * Math.PI) / 180);
      ctx.translate(-op.rot.cx, -op.rot.cy);
    }
    if (op.kind === 'path') {
      const path = cachedPath(op.d);
      const fill = canvasPaint(ctx, op.fill);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill(path, op.evenodd ? 'evenodd' : 'nonzero');
      }
      const stroke = canvasPaint(ctx, op.stroke);
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = op.strokeWidth ?? 0.25;
        if (op.dash) ctx.setLineDash(op.dash);
        if (op.cap) ctx.lineCap = op.cap;
        if (op.join) ctx.lineJoin = op.join;
        ctx.stroke(path);
      }
    } else if (op.kind === 'image') {
      const img = images.get(op.href);
      if (img) {
        if (op.clip) ctx.clip(new Path2D(op.clip));
        ctx.drawImage(img, op.x, op.y, op.w, op.h);
      }
    }
    ctx.restore();
  }
}
