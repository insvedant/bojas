import { adminFetch } from './adminFetch';

// Browser-only helpers for photo uploads.

// Center-crops the image to the w:h shape and resizes it to w×h (never upscales).
// Returns the JPEG blob plus the original size so the editor can warn about small photos.
export async function cropResize(file, w, h) {
  const bitmap = await createImageBitmap(file);
  const target = w / h;
  let sw = bitmap.width;
  let sh = bitmap.height;
  if (sw / sh > target) sw = Math.round(sh * target);
  else sh = Math.round(sw / target);
  const sx = Math.round((bitmap.width - sw) / 2);
  const sy = Math.round((bitmap.height - sh) / 2);
  const scale = Math.min(1, w / sw);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
  return { blob, width: bitmap.width, height: bitmap.height, small: bitmap.width < w || bitmap.height < h };
}

export async function uploadPhoto(blob) {
  const fd = new FormData();
  fd.append('file', blob, 'photo.jpg');
  const { ok, data, error } = await adminFetch('/api/admin/photos/', { method: 'POST', body: fd });
  if (!ok) throw new Error(error);
  return data; // { id, url }
}
