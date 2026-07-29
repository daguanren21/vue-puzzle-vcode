<script setup lang="ts">
import { ref } from 'vue'
import Vcode, {
  VcodeBoard,
  VcodeCanvasMain,
  VcodeCanvasPuzzle,
  VcodeCanvasSuccess,
  VcodeFlash,
  VcodeLoading,
  VcodeMessage,
  VcodeOverlay,
  VcodePanel,
  VcodePortal,
  VcodeRefresh,
  VcodeRoot,
  VcodeSlider,
  VcodeSliderProgress,
  VcodeSliderThumb,
} from '@vue-puzzle-vcode/ui'

const show1 = ref(false)
const show2 = ref(false)
const log = ref<string[]>([])

function push(msg: string) {
  log.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (log.value.length > 8) log.value.pop()
}

const imgs = [
  'https://picsum.photos/seed/vcode1/310/160',
  'https://picsum.photos/seed/vcode2/310/160',
  'https://picsum.photos/seed/vcode3/310/160',
]
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-800">
    <div class="mx-auto max-w-3xl px-6 py-12">
      <h1 class="text-3xl font-bold tracking-tight">vue-puzzle-vcode</h1>
      <p class="mt-2 text-sm text-slate-500">
        Vue 3 playground · Radix-style composable parts + default composition
      </p>

      <div class="mt-8 flex flex-wrap gap-4">
        <button
          class="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white shadow transition hover:bg-blue-700"
          @click="show1 = true"
        >
          默认组件 &lt;Vcode&gt;
        </button>
        <button
          class="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white shadow transition hover:bg-emerald-700"
          @click="show2 = true"
        >
          组合式 parts + 自定义 slot
        </button>
      </div>

      <div class="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-2 text-sm font-semibold text-slate-400">事件日志</h2>
        <ul class="space-y-1 font-mono text-xs">
          <li v-for="(line, i) in log" :key="i">{{ line }}</li>
          <li v-if="!log.length" class="text-slate-300">— 暂无事件 —</li>
        </ul>
      </div>
    </div>

    <!-- 1. 默认组合组件:与 v1 用法一致 -->
    <Vcode
      v-model:show="show1"
      :imgs="imgs"
      @success="(d: number) => { push(`默认组件 验证成功 diff=${d.toFixed(1)}`); show1 = false }"
      @fail="(d: number) => push(`默认组件 验证失败 diff=${d.toFixed(1)}`)"
      @close="push('默认组件 关闭')"
    />

    <!-- 2. 完全自定义组合:每个 part 可替换/插槽定制 -->
    <VcodeRoot
      v-model:show="show2"
      @success="(d: number) => { push(`组合式 验证成功 diff=${d.toFixed(1)}`); show2 = false }"
      @fail="(d: number) => push(`组合式 验证失败 diff=${d.toFixed(1)}`)"
      @close="push('组合式 关闭')"
    >
      <VcodePortal>
        <VcodeOverlay class="!bg-slate-900/60 backdrop-blur-sm">
          <VcodePanel class="rounded-2xl !p-6 shadow-2xl ring-1 ring-slate-900/10">
            <VcodeBoard class="rounded-xl">
              <VcodeCanvasMain />
              <VcodeCanvasSuccess />
              <VcodeCanvasPuzzle />
              <VcodeLoading>
                <div class="flex items-center gap-2 text-white">
                  <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                  加载中…
                </div>
              </VcodeLoading>
              <VcodeMessage v-slot="{ text, fail }">
                <span :class="fail ? 'font-bold' : ''">{{ fail ? '❌ ' : '✅ ' }}{{ text }}</span>
              </VcodeMessage>
              <VcodeFlash />
              <VcodeRefresh>
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm shadow">↻</span>
              </VcodeRefresh>
            </VcodeBoard>
            <VcodeSlider class="!mt-6">
              <VcodeSliderProgress class="!bg-emerald-500/80">
                <VcodeSliderThumb>
                  <span class="text-emerald-600">⇥</span>
                </VcodeSliderThumb>
              </VcodeSliderProgress>
            </VcodeSlider>
          </VcodePanel>
        </VcodeOverlay>
      </VcodePortal>
    </VcodeRoot>
  </div>
</template>
