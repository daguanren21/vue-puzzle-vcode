import { defineConfig } from 'vite'

// Library build: `vue`, `vue-demi` and `@vue-puzzle-vcode/core` stay external
// (the consumer's package manager resolves each to a single instance);
// `@vue-puzzle-vcode/shared` is bundled in.
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue', 'vue-demi', '@vue-puzzle-vcode/core'],
      output: { exports: 'named' },
    },
  },
})
