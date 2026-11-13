import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

// 버전은 package.json 한 곳에서: html의 %VITE_APP_VERSION%, PC 앱(tools/exe.mjs), 안드로이드(build.gradle)가 같이 읽음
process.env.VITE_APP_VERSION = JSON.parse(readFileSync('package.json', 'utf8')).version;

// 페이지 목록: 소개(/)·게임(/play/)과 사이트 페이지들. 새 페이지를 만들면 여기에 폴더 이름을 더함
const PAGES = ['play', 'download', 'save', 'journal', 'guide', 'guide/beginner', 'guide/combat', 'guide/growth', 'guide/world', 'guide/puzzles', 'news', 'about', 'privacy'];
// 영어판 페이지 (en/ 아래, 소식(news)은 한국어만)
const EN_PAGES = ['en', ...PAGES.filter(p => p !== 'news').map(p => 'en/' + p)];

/* 영어판: src/i18n/en.tsv (한국어<TAB>영어) 로 src 코드 안의 한국어 글자를 빌드 때 바꿈.
   따옴표째 같은 글자만 바꾸고('나' → 'Me'), ~로 시작하는 줄은 따옴표 없이 그 부분만 바꿈 (페이지 스크립트의 긴 템플릿용).
   빠진 한국어가 있으면 빌드 때 경고로 알려 줌 */
function en() {
  const dict = readFileSync('src/i18n/en.tsv', 'utf8').split(/\r?\n/).filter(l => l.includes('\t')).map(l => {
    const i = l.indexOf('\t'); let k = l.slice(0, i), v = l.slice(i + 1);
    if (k[0] === '~') return [k.slice(1), v, true];
    // 앞뒤 공백은 한국어 쪽 것을 그대로 (붙여 쓰는 조각 글자)
    if (v && !/^\s/.test(v)) v = k.match(/^\s*/)[0] + v;
    if (v && !/\s$/.test(v)) v += k.match(/\s*$/)[0];
    return [k, v, false];
  }).sort((a, b) => b[0].length - a[0].length);
  const HAN = /[가-힣]/;
  return {
    name: 'sr-en', enforce: 'pre',
    transform(code, id) {
      if (!/\/src\/.*\.js$/.test(id.replace(/\\/g, '/').split('?')[0]) || !HAN.test(code)) return;
      for (const [k, v, raw] of dict) {
        if (raw) { code = code.split(k).join(v); continue; }
        for (const q of ["'", '"', '`']) {
          const s = q + k + q; if (!code.includes(s)) continue;
          code = code.split(s).join(q + (q === '`' ? v : v.replace(new RegExp('(?<!\\\\)' + q, 'g'), '\\' + q)) + q);
        }
      }
      const left = code.replace(/\/\*[\s\S]*?\*\//g, '').split(/\r?\n/).map(l => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')).filter(l => HAN.test(l) && !/^[^'"`]*\/.*[가-힣].*\/[gimsuy]*[,);.]/.test(l));
      if (left.length) this.warn('번역 안 된 한국어:\n' + left.map(l => '  ' + l.trim().slice(0, 160)).join('\n'));
      return code;
    }
  };
}

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'en' ? [en()] : [],
  build: {
    // Phaser 자체가 커서 경고 기준을 올려둠
    chunkSizeWarningLimit: 2000,
    // 영어판은 두 번째 빌드로 같은 dist에 en/ 만 더함 (npm run build)
    ...(mode === 'en' ? { emptyOutDir: false, copyPublicDir: false } : {}),
    rollupOptions: {
      input: mode === 'en'
        ? Object.fromEntries(EN_PAGES.map(p => [p.replace(/\//g, '_'), p + '/index.html']))
        : { main: 'index.html', ...Object.fromEntries(PAGES.map(p => [p.replace('/', '_'), p + '/index.html'])) },
      output: { manualChunks: { phaser: ['phaser'] } }
    }
  }
}));
