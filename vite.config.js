import { defineConfig } from 'vite';

// 페이지 목록: 소개(/)·게임(/play/)과 사이트 페이지들. 새 페이지를 만들면 여기에 폴더 이름을 더함
const PAGES = ['play', 'download', 'save', 'journal', 'guide', 'guide/beginner', 'guide/combat', 'guide/growth', 'guide/world', 'guide/puzzles', 'news', 'about', 'privacy'];

export default defineConfig({
  base: './',
  build: {
    // Phaser 자체가 커서 경고 기준을 올려둠
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: { main: 'index.html', ...Object.fromEntries(PAGES.map(p => [p.replace('/', '_'), p + '/index.html'])) },
      output: { manualChunks: { phaser: ['phaser'] } }
    }
  }
});
