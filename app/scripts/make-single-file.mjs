// 将 dist 构建产物内联为单文件 HTML（不引入新依赖）
import { readFile, writeFile } from 'node:fs/promises';

const dist = '/workspace/dist';
let html = await readFile(`${dist}/index.html`, 'utf8');

// JS 内联前必须转义 </script>，否则会提前终止脚本标签
const escapeInlineJs = (js) => js.replace(/<\/script>/gi, '<\\/script>');

// 内联 CSS（仅本地 /assets/ 资源，CDN 外链保留）
const cssLinks = [...html.matchAll(/<link\s+rel="stylesheet"[^>]*href="(\/assets\/[^"]+)"[^>]*>/g)];
for (const [, href] of cssLinks) {
  const css = await readFile(`${dist}${href}`, 'utf8');
  html = html.replace(new RegExp(`<link\\s+rel="stylesheet"[^>]*href="${href}"[^>]*>`), () => `<style>\n${css}\n</style>`);
}

// 移除 modulepreload（单文件后无意义）
html = html.replace(/<link\s+rel="modulepreload"[^>]*>/g, '');

// 内联 module JS（仅本地 /assets/ 资源），用替换函数避免 $& 等特殊序列被解析
const jsScripts = [...html.matchAll(/<script\s+type="module"[^>]*src="(\/assets\/[^"]+)"[^>]*><\/script>/g)];
for (const [full, src] of jsScripts) {
  const js = escapeInlineJs(await readFile(`${dist}${src}`, 'utf8'));
  html = html.replace(full, () => `<script type="module">\n${js}\n</script>`);
}

const sanity = {
  scriptOpen: (html.match(/<script/g) || []).length,
  scriptClose: (html.match(/<\/script>/g) || []).length,
};

// 写出时带 UTF-8 BOM，避免 Windows 记事本等程序误判编码显示乱码
await writeFile('/workspace/dist-single-file.html', '\uFEFF' + html, 'utf8');
console.log(JSON.stringify({ status: 'ok', cssInlined: cssLinks.length, jsInlined: jsScripts.length, sanity }));
