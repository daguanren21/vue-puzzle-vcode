import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import tailwindcss from '@tailwindcss/vite'

// Inside the monorepo, workspace links resolve `vue-demi` against the
// workspace's Vue 3 instance. Pin this playground to its own Vue 2.7-bound
// instances instead (real consumers get this automatically via vue-demi's
// postinstall switch).
const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    dedupe: ['vue', 'vue-demi'],
    alias: {
      'vue-demi': require.resolve('vue-demi/lib/index.mjs'),
      vue: require.resolve('vue/dist/vue.runtime.esm.js'),
    },
  },
  server: { port: 5182 },
})
