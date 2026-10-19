// 图片压缩管道：HTML5 Canvas 等比缩放，最大宽度 1000px，JPEG 0.75 质量
const MAX_WIDTH = 1000;
const QUALITY = 0.75;

export async function compressImage(file: File | Blob): Promise<string> {
  const img = await loadAsImage(file);
  try {
    const { canvas } = drawScaled(img);
    return canvas.toDataURL('image/jpeg', QUALITY);
  } finally {
    img.src = '';
  }
}

function loadAsImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function drawScaled(img: HTMLImageElement): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;
  const scale = naturalW > MAX_WIDTH ? MAX_WIDTH / naturalW : 1;
  const w = Math.max(1, Math.round(naturalW * scale));
  const h = Math.max(1, Math.round(naturalH * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas, ctx };
}
