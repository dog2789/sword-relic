import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    // Phaser 자체가 커서 경고 기준을 올려둠
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      // 소개 페이지(/)와 게임 페이지(/play/)
      input: { main: 'index.html', play: 'play/index.html', download: 'download/index.html', save: 'save/index.html', journal: 'journal/index.html' },
      output: { manualChunks: { phaser: ['phaser'] } }
    }
  }
});
