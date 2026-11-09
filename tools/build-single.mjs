// 단일 HTML 빌드: Phaser는 CDN에서 불러오고, 게임 코드와 CSS는 한 파일에 인라인
// 사용: npm run build:single  →  dist-single/index.html
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const PHASER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js';

const phaserGlobal = {
  name: 'phaser-global',
  setup(b) {
    b.onResolve({ filter: /^phaser$/ }, () => ({ path: 'phaser', namespace: 'phaser-global' }));
    b.onLoad({ filter: /.*/, namespace: 'phaser-global' }, () => ({ contents: 'module.exports = window.Phaser;', loader: 'js' }));
  }
};

const res = await build({
  entryPoints: ['src/main.js'],
  bundle: true, format: 'iife', minify: true, write: false,
  outdir: 'out', plugins: [phaserGlobal], logLevel: 'warning',
  loader: { '.woff2': 'dataurl' }
});
const js = res.outputFiles.find(f => f.path.endsWith('.js')).text;
const css = res.outputFiles.find(f => f.path.endsWith('.css'))?.text || '';

const html = readFileSync('play/index.html', 'utf8');
const title = html.match(/<title>(.*?)<\/title>/)[1];
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>/)[0];
const body = html.match(/<body>([\s\S]*?)<script type="module"/)[1];

const out = `<title>${title}</title>
${fonts}
<style>${css}</style>
${body.trim()}
<script src="${PHASER_CDN}"></script>
<script>${js.replace(/<\/script/g, '<\\/script')}</script>
`;
mkdirSync('dist-single', { recursive: true });
writeFileSync('dist-single/index.html', out);
console.log('dist-single/index.html', (out.length / 1024).toFixed(1) + ' KB');
