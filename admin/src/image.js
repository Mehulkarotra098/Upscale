// Client-side image processing before upload: fix orientation, resize to max 1600px wide (plus an 800px copy for
// phones/srcset), encode WebP (JPEG fallback for browsers that can't encode WebP). Keeps uploads small and pages fast.
const FULL = 1600, SMALL = 800;

function toBlob(canvas, type, q) {
  return new Promise((res) => canvas.toBlob(res, type, q));
}

async function encode(bitmap, width) {
  const scale = Math.min(1, width / bitmap.width);
  const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, w, h);
  let blob = await toBlob(c, 'image/webp', 0.82);
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(c, 'image/jpeg', 0.85);
  return { blob, w, h };
}

const b64 = (blob) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result).split(',')[1]);
  r.onerror = rej; r.readAsDataURL(blob);
});

export async function prepareImage(file) {
  if (!/^image\/(jpeg|png|webp|gif|avif|heic|heif)$/i.test(file.type) && !/\.(jpe?g|png|webp|gif|avif)$/i.test(file.name)) throw new Error(`${file.name}: not an image`);
  let bitmap;
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { throw new Error(`${file.name}: this image format can't be read. Use JPG, PNG or WebP.`); }
  if (bitmap.width < 300) throw new Error(`${file.name}: too small (${bitmap.width}px wide). Use at least 800px for sharp images.`);
  const full = await encode(bitmap, FULL);
  const small = bitmap.width > SMALL + 100 ? await encode(bitmap, SMALL) : null;
  bitmap.close?.();
  const name = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_]+/g, ' ').trim() || 'image';
  return {
    name, width: full.w, height: full.h, full: await b64(full.blob),
    small: small ? await b64(small.blob) : null, sm_width: small?.w || null,
    bytes: full.blob.size + (small?.blob.size || 0), originalBytes: file.size,
  };
}
