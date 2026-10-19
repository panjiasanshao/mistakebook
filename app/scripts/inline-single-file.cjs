// Build 后脚本：把 dist/index.html + dist/assets/*.js + *.css 合并成单文件
// 用法：node scripts/inline-single-file.cjs
// 不依赖任何 npm 包，纯 Node fs 操作
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const outPath = path.resolve(__dirname, '..', '错题本-学海灯塔.html');

if (!fs.existsSync(distDir)) {
  console.error('dist 目录不存在，请先 npm run build');
  process.exit(1);
}

let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

// inline <script type="module" src="/assets/xxx.js">
html = html.replace(/<script([^>]*)\s+src="(\/?assets\/[^"]+)"([^>]*)><\/script>/g, (m, pre, src, post) => {
  const cleanSrc = src.replace(/^\/+/, '');
  const filePath = path.join(distDir, cleanSrc);
  if (!fs.existsSync(filePath)) { console.warn('missing script:', filePath); return m; }
  const code = fs.readFileSync(filePath, 'utf8');
  return `<script${pre}${post}>${code}</script>`;
});

// inline <link rel="stylesheet" href="/assets/xxx.css">
html = html.replace(/<link[^>]*\shref="(\/?assets\/[^"]+\.css)"[^>]*>/g, (m, src) => {
  const cleanSrc = src.replace(/^\/+/, '');
  const filePath = path.join(distDir, cleanSrc);
  if (!fs.existsSync(filePath)) { console.warn('missing css:', filePath); return m; }
  const code = fs.readFileSync(filePath, 'utf8');
  return `<style>${code}</style>`;
});

fs.writeFileSync(outPath, html, 'utf8');
console.log('已生成单文件 HTML:', outPath);
console.log('大小:', (fs.statSync(outPath).size / 1024).toFixed(1), 'KB');
