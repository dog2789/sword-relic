import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    // Phaser 자체가 커서 경고 기준을 올려둠
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: { manualChunks: { phaser: ['phaser'] } }
    }
  }
});
