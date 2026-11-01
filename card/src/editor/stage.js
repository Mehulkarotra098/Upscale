// The live card on screen. Fabric handles selection, handles, rotation and touch. Each design element is one Fabric object
// that draws the same geometry the exports use, so the screen and the download can't drift apart.
import { ActiveSelection, Canvas, FabricObject, util } from 'fabric';
import { paintOps } from '../core/painter.js';
import { cardSize, inkBoxes, resolveSide, SIZE } from '../core/render.js';

const WORKSPACE = '#E7E4EC';
const GUIDE = '#7C5CFF';
const SNAP_PX = 6;

class CardElement extends FabricObject {
  static type = 'CardElement';
  _render(ctx) {
    if (!this.ops) return;
    ctx.save();
    ctx.translate(-this.boxCx, -this.boxCy);
    paintOps(ctx, this.ops, this.images);
    ctx.restore();
  }
}

const UNIFORM = new Set(['logo', 'icon', 'qr', 'image']);
const TEXTISH = new Set(['text', 'list']);

function controlsFor(type) {
  if (TEXTISH.has(type)) return { mt: false, mb: false, ml: true, mr: true, tl: true, tr: true, bl: true, br: true, mtr: true };
  if (UNIFORM.has(type)) return { mt: false, mb: false, ml: false, mr: false, tl: true, tr: true, bl: true, br: true, mtr: true };
  return { mt: true, mb: true, ml: true, mr: true, tl: true, tr: true, bl: true, br: true, mtr: true };
}

export class Stage {
  constructor(el, wrap, { onSelect, onModified, onEditText, onLockedTap, onSelectionBox, engine }) {
    this.wrap = wrap;
    this.engine = engine;
    this.onSelect = onSelect;
    this.onModified = onModified;
    this.onEditText = onEditText;
    this.onLockedTap = onLockedTap;
    this.onSelectionBox = onSelectionBox;
    this.objects = new Map();
    this.images = new Map();
    this.guides = [];
    this.showGuides = true;
    this.touch = 'ontouchstart' in window;
    this.canvas = new Canvas(el, {
      preserveObjectStacking: true,
      selection: !this.touch,
      uniformScaling: true,
      renderOnAddRemove: false,
      backgroundColor: WORKSPACE,
      selectionColor: 'rgba(124,92,255,.12)',
      selectionBorderColor: GUIDE,
      stopContextMenu: true,
      allowTouchScrolling: false,
      targetFindTolerance: this.touch ? 10 : 2,
    });
    Object.assign(FabricObject.ownDefaults, {
      cornerColor: '#FFFFFF',
      cornerStrokeColor: GUIDE,
      borderColor: GUIDE,
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerSize: 11,
      touchCornerSize: 30,
      padding: 0,
      borderScaleFactor: 1.5,
    });
    this.canvas.on('selection:created', () => this.reportSelection());
    this.canvas.on('selection:updated', () => this.reportSelection());
    this.canvas.on('selection:cleared', () => this.reportSelection());
    this.canvas.on('object:moving', (e) => {
      this.dragging = true;
      this.snap(e.target);
    });
    this.canvas.on('object:scaling', () => {
      this.dragging = true;
    });
    this.canvas.on('object:rotating', () => {
      this.dragging = true;
    });
    this.canvas.on('object:modified', (e) => this.modified(e.target));
    this.canvas.on('mouse:dblclick', (e) => {
      if (e.target?.elId) this.onEditText(e.target.elId);
    });
    this.canvas.on('after:render', (e) => {
      this.drawOverlay(e.ctx);
      this.reportBox();
    });
    this.canvas.on('mouse:down', (e) => this.panStart(e));
    this.canvas.on('mouse:move', (e) => this.panMove(e));
    this.canvas.on('mouse:up', () => {
      this.pan = null;
      this.guides = [];
      this.dragging = false;
      this.canvas.requestRenderAll();
    });
    this.bindPinch();
    this.observer = new ResizeObserver(() => this.fit());
    this.observer.observe(wrap);
  }

  dispose() {
    this.observer.disconnect();
    this.canvas.dispose();
  }

  /** Scale so the whole card fits, with room around it for the rotation handle. */
  fit() {
    if (!this.doc) return;
    const cw = this.wrap.clientWidth;
    const ch = this.wrap.clientHeight;
    if (!cw || !ch) return;
    this.canvas.setDimensions({ width: cw, height: ch });
    const { w, h } = cardSize(this.doc);
    const pad = Math.max(28, Math.min(cw, ch) * 0.07);
    const z = Math.min((cw - pad * 2) / w, (ch - pad * 2) / h);
    this.canvas.setViewportTransform([z, 0, 0, z, (cw - w * z) / 2, (ch - h * z) / 2]);
    this.canvas.requestRenderAll();
  }

  zoomBy(f, cx = this.canvas.getWidth() / 2, cy = this.canvas.getHeight() / 2) {
    const v = [...this.canvas.viewportTransform];
    const z = Math.min(60, Math.max(1.5, v[0] * f));
    const k = z / v[0];
    v[4] = cx - (cx - v[4]) * k;
    v[5] = cy - (cy - v[5]) * k;
    v[0] = v[3] = z;
    this.canvas.setViewportTransform(v);
    this.canvas.requestRenderAll();
  }

  /** Tell the page where the selection is on screen, so its toolbar can sit beside it. */
  reportBox() {
    if (!this.onSelectionBox) return;
    const active = this.canvas.getActiveObject();
    let box = null;
    if (active && !this.dragging) {
      const r = active.getBoundingRect();
      const v = this.canvas.viewportTransform;
      // Fabric 7 reports this in scene units.
      box = { x: r.left * v[0] + v[4], y: r.top * v[3] + v[5], w: r.width * v[0], h: r.height * v[3] };
    }
    const key = box ? `${Math.round(box.x)},${Math.round(box.y)},${Math.round(box.w)},${Math.round(box.h)}` : '';
    if (key === this.boxKey) return;
    this.boxKey = key;
    this.onSelectionBox(box);
  }

  /** A tap on locked art: say why nothing happened, and offer to unlock it. */
  lockedAt(e) {
    if (e.target && e.target.elId) {
      this.onLockedTap?.(null);
      return;
    }
    const p = e.scenePoint ?? this.canvas.getScenePoint(e.e);
    const hits = [...this.objects.values()].reverse();
    for (const obj of hits) {
      if (!obj.elId || !obj.lockedArt) continue;
      const hw = obj.width / 2;
      const hh = obj.height / 2;
      if (Math.abs(p.x - obj.left) <= hw && Math.abs(p.y - obj.top) <= hh) {
        this.onLockedTap?.(obj.elId);
        return;
      }
    }
    this.onLockedTap?.(null);
  }

  panStart(e) {
    this.lockedAt(e);
    if (!e.target && this.touch && !e.e.shiftKey) {
      const p = e.e.touches ? e.e.touches[0] : e.e;
      this.pan = { x: p.clientX, y: p.clientY };
    }
  }

  panMove(e) {
    if (!this.pan || this.pinching) return;
    const p = e.e.touches ? e.e.touches[0] : e.e;
    if (!p) return;
    const v = [...this.canvas.viewportTransform];
    v[4] += p.clientX - this.pan.x;
    v[5] += p.clientY - this.pan.y;
    this.pan = { x: p.clientX, y: p.clientY };
    this.canvas.setViewportTransform(v);
    this.canvas.requestRenderAll();
  }

  bindPinch() {
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    let start = 0;
    this.wrap.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 2) {
          this.pinching = true;
          start = dist(e.touches);
          e.stopPropagation();
        }
      },
      { capture: true, passive: true },
    );
    this.wrap.addEventListener(
      'touchmove',
      (e) => {
        if (this.pinching && e.touches.length === 2) {
          const d = dist(e.touches);
          const r = this.wrap.getBoundingClientRect();
          this.zoomBy(
            d / start,
            (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left,
            (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top,
          );
          start = d;
          e.stopPropagation();
          e.preventDefault();
        }
      },
      { capture: true, passive: false },
    );
    this.wrap.addEventListener('touchend', () => {
      this.pinching = false;
    });
    this.wrap.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const r = this.wrap.getBoundingClientRect();
        this.zoomBy(e.deltaY < 0 ? 1.08 : 0.93, e.clientX - r.left, e.clientY - r.top);
      },
      { passive: false },
    );
  }

  reportSelection() {
    this.onSelect(
      this.canvas
        .getActiveObjects()
        .map((o) => o.elId)
        .filter(Boolean),
    );
  }

  /** Match the canvas to the design: reuse objects by id, so a selected element stays selected through edits. */
  sync(doc, sideName, selection = []) {
    // Objects come and go here, and that must not read as the person clearing their selection.
    this.silent = true;
    const first = !this.doc;
    const orientationChanged = this.doc && cardSize(this.doc).w !== cardSize(doc).w;
    this.doc = doc;
    const { ops, boxes, warnings } = resolveSide(doc, sideName, this.engine);
    this.warnings = warnings;
    const inks = inkBoxes(ops);
    const elements = doc.sides[sideName].elements;
    const byId = new Map();
    for (const op of ops) {
      if (!byId.has(op.id)) byId.set(op.id, []);
      const { rot: _rot, ...flat } = op;
      byId.get(op.id).push(flat);
      if (op.kind === 'image' && !this.images.has(op.href)) {
        const img = new Image();
        img.onload = () => this.canvas.requestRenderAll();
        img.src = op.href;
        this.images.set(op.href, img);
      }
    }
    const b = SIZE.bleed;
    const { w, h } = cardSize(doc);
    const want = [{ id: '_bg', box: { x: -b, y: -b, w: w + 2 * b, h: h + 2 * b }, el: { type: 'bg' } }];
    for (const el of elements) {
      if (el.hidden || !byId.has(el.id)) continue;
      const box = boxes[el.id] ?? { x: el.x, y: el.y, w: el.w || 1, h: el.h || el.w || 1 };
      want.push({ id: el.id, box, el });
    }
    const active = this.canvas.getActiveObject();
    const keepMulti = active?.type?.toLowerCase() === 'activeselection';
    if (keepMulti) this.canvas.discardActiveObject();
    const wanted = new Set(want.map((x) => x.id));
    for (const [id, obj] of this.objects) {
      if (!wanted.has(id)) {
        this.canvas.remove(obj);
        this.objects.delete(id);
      }
    }
    want.forEach(({ id, box, el }, index) => {
      let obj = this.objects.get(id);
      if (!obj) {
        obj = new CardElement({
          originX: 'center',
          originY: 'center',
          strokeWidth: 0,
          objectCaching: false,
          lockScalingFlip: true,
          snapAngle: 45,
          snapThreshold: 4,
        });
        obj.elId = id === '_bg' ? null : id;
        obj.images = this.images;
        this.objects.set(id, obj);
        this.canvas.add(obj);
      }
      const bw = Math.max(box.w, 0.5);
      const bh = Math.max(box.h, 0.5);
      obj.ops = byId.get(id);
      obj.boxCx = box.x + box.w / 2;
      obj.boxCy = box.y + box.h / 2;
      obj.set({ left: obj.boxCx, top: obj.boxCy, width: bw, height: bh, scaleX: 1, scaleY: 1, angle: el.rot || 0 });
      const ink = inks[id];
      // Where the visible text sits inside its box, measured from the box centre.
      obj.inkRel = ink ? { l: ink.x - obj.boxCx, r: ink.x + ink.w - obj.boxCx, t: ink.y - obj.boxCy, b: ink.y + ink.h - obj.boxCy } : null;
      const locked = !!el.locked || id === '_bg';
      obj.lockedArt = !!el.locked;
      obj.set({ selectable: !locked, evented: !locked, hasControls: !locked, hoverCursor: locked ? 'default' : 'move' });
      obj.setControlsVisibility(controlsFor(el.type));
      obj.setCoords();
      this.canvas.moveObjectTo(obj, index);
    });
    if (first || orientationChanged) this.fit();
    this.applySelection(selection);
    this.silent = false;
    this.canvas.requestRenderAll();
    return warnings;
  }

  applySelection(ids) {
    const current = this.canvas.getActiveObjects().map((o) => o.elId);
    if (current.length === ids.length && ids.every((i) => current.includes(i))) return;
    const objs = ids.map((i) => this.objects.get(i)).filter(Boolean);
    this.canvas.discardActiveObject();
    if (objs.length === 1) this.canvas.setActiveObject(objs[0]);
    else if (objs.length > 1) this.canvas.setActiveObject(new ActiveSelection(objs, { canvas: this.canvas }));
  }

  /** Snap to the card's edges, centre and safe lines, and to other elements. */
  snap(target) {
    this.guides = [];
    if (!this.doc || target.angle % 90 !== 0) return;
    const { w, h } = cardSize(this.doc);
    const z = this.canvas.getZoom();
    const near = SNAP_PX / z;
    const xs = [0, w / 2, w, SIZE.safe, w - SIZE.safe];
    const ys = [0, h / 2, h, SIZE.safe, h - SIZE.safe];
    // Edges come from the visible ink. A left-aligned name in a wide box lines up with what's above it, not with its box.
    const edges = (obj) => {
      const r = obj.inkRel;
      if (r && !obj.angle) return { l: r.l, r: r.r, t: r.t, b: r.b };
      const hw = obj.getScaledWidth() / 2;
      const hh = obj.getScaledHeight() / 2;
      return { l: -hw, r: hw, t: -hh, b: hh };
    };
    for (const obj of this.objects.values()) {
      if (obj === target || !obj.elId || !obj.visible || obj.lockedArt) continue;
      if (target.getObjects?.().includes(obj)) continue;
      const e = edges(obj);
      xs.push(obj.left + e.l, obj.left + (e.l + e.r) / 2, obj.left + e.r);
      ys.push(obj.top + e.t, obj.top + (e.t + e.b) / 2, obj.top + e.b);
    }
    const me = edges(target);
    const best = (pos, a, b, lines) => {
      let found = null;
      for (const l of lines) {
        for (const off of [a, (a + b) / 2, b]) {
          const d = l - (pos + off);
          if (Math.abs(d) < near && (!found || Math.abs(d) < Math.abs(found.d))) found = { d, l };
        }
      }
      return found;
    };
    const sx = best(target.left, me.l, me.r, xs);
    const sy = best(target.top, me.t, me.b, ys);
    if (sx) {
      target.left += sx.d;
      this.guides.push({ x: sx.l });
    }
    if (sy) {
      target.top += sy.d;
      this.guides.push({ y: sy.l });
    }
    target.setCoords();
  }

  /** After a drag, resize or rotate: report each element's new centre, scale and angle. */
  modified(target) {
    this.guides = [];
    const out = [];
    const read = (obj) => {
      const m = obj.calcTransformMatrix();
      const d = util.qrDecompose(m);
      out.push({
        id: obj.elId,
        cx: d.translateX,
        cy: d.translateY,
        sx: d.scaleX,
        sy: d.scaleY,
        angle: d.angle,
        baseW: obj.width,
        baseH: obj.height,
      });
    };
    if (target.getObjects && target.type?.toLowerCase() === 'activeselection') target.getObjects().forEach(read);
    else read(target);
    this.onModified(out.filter((o) => o.id));
  }

  drawOverlay(ctx) {
    if (!this.doc) return;
    const v = this.canvas.viewportTransform;
    const { w, h } = cardSize(this.doc);
    const W = this.canvas.getWidth();
    const H = this.canvas.getHeight();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dpr = this.canvas.getRetinaScaling();
    ctx.scale(dpr, dpr);
    const x = v[4];
    const y = v[5];
    const z = v[0];
    // Beyond the bleed nothing prints, so it's hidden. The bleed itself shows faintly, so people can see what gets cut off.
    const b = SIZE.bleed * z;
    ctx.fillStyle = WORKSPACE;
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.rect(x - b, y - b, w * z + 2 * b, h * z + 2 * b);
    ctx.fill('evenodd');
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.rect(x - b, y - b, w * z + 2 * b, h * z + 2 * b);
    ctx.rect(x, y, w * z, h * z);
    ctx.fill('evenodd');
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(37,30,69,.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w * z, h * z);
    if (this.showGuides) {
      const s = SIZE.safe * z;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(124,92,255,.65)';
      ctx.strokeRect(x + s, y + s, w * z - 2 * s, h * z - 2 * s);
      ctx.setLineDash([]);
    }
    ctx.strokeStyle = '#E5337A';
    ctx.lineWidth = 1;
    for (const g of this.guides) {
      ctx.beginPath();
      if (g.x != null) {
        ctx.moveTo(x + g.x * z, 0);
        ctx.lineTo(x + g.x * z, H);
      } else {
        ctx.moveTo(0, y + g.y * z);
        ctx.lineTo(W, y + g.y * z);
      }
      ctx.stroke();
    }
    ctx.restore();
    // Selection handles draw on Fabric's top canvas, so they stay above this overlay.
  }
}

/** Turn a finished drag or resize into changes on the element itself. */
export function applyTransform(el, t, box) {
  const sx = Math.abs(t.sx);
  const sy = Math.abs(t.sy);
  const moved = { cx: t.cx, cy: t.cy };
  const uniform = Math.abs(sx - sy) < 0.001;
  delete el.below;
  delete el.stack;
  el.rot = Math.abs(t.angle) < 0.01 ? 0 : t.angle;
  if (el.type === 'text' || el.type === 'list') {
    if (uniform && Math.abs(sx - 1) > 0.001) {
      el.size = Math.round(el.size * sx * 100) / 100;
      if (el.minSize) el.minSize = Math.min(el.size, el.minSize * sx);
    }
    el.w = Math.max(5, box.w * sx);
    const newH = el.h ? el.h * (uniform ? sy : 1) : box.h * (uniform ? sy : 1);
    if (el.h) el.h = newH;
    el.x = moved.cx - el.w / 2;
    el.y = moved.cy - newH / 2;
    return;
  }
  const w = Math.max(0.2, (el.w || 0) * sx);
  const h = Math.max(0, (el.h ?? el.w ?? 0) * sy);
  el.w = w;
  if (el.h != null) el.h = h;
  if (el.type === 'logo' && el.fallbackSize) el.fallbackSize *= sy;
  el.x = moved.cx - w / 2;
  el.y = moved.cy - (el.h ?? w) / 2;
}
