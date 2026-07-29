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

const showDefault = ref(false)
const showImgs = ref(false)
const showSize = ref(false)
const showText = ref(false)
const showParts = ref(false)

const log = ref<string[]>([])
function push(msg: string) {
  log.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (log.value.length > 8) log.value.pop()
}
function onSuccess(name: string) {
  return (d: number) => push(`${name} 验证成功 diff=${d.toFixed(1)}`)
}
function onFail(name: string) {
  return (d: number) => push(`${name} 验证失败 diff=${d.toFixed(1)}`)
}

const imgs = [
  'https://picsum.photos/seed/vcode1/310/160',
  'https://picsum.photos/seed/vcode2/310/160',
  'https://picsum.photos/seed/vcode3/310/160',
]

// 内嵌模式:无 Portal/Overlay,常驻页面,成功后自动重置
const inlineRoot = ref<{ reset: () => void } | null>(null)
function onInlineSuccess(d: number) {
  push(`内嵌模式 验证成功 diff=${d.toFixed(1)},1.5s 后自动重置`)
  setTimeout(() => inlineRoot.value?.reset(), 1500)
}

const card = 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm'
const btn =
  'rounded-lg px-4 py-2 text-sm font-medium text-white shadow transition'
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-800">
    <div class="mx-auto max-w-3xl px-6 py-12">
      <h1 class="text-3xl font-bold tracking-tight">vue-puzzle-vcode</h1>
      <p class="mt-2 text-sm text-slate-500">
        Vue 3 playground · 默认组件 / 变体 props / Radix 式组合 parts / 内嵌模式
      </p>

      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <!-- 1. 默认:不传 imgs,Canvas 本地生成随机图 -->
        <div :class="card">
          <h2 class="font-semibold">默认用法</h2>
          <p class="mt-1 mb-4 text-xs text-slate-500">
            不传 <code>imgs</code>,本地生成随机图,零网络请求
          </p>
          <button :class="btn" class="bg-blue-600 hover:bg-blue-700" @click="showDefault = true">
            开始验证
          </button>
        </div>

        <!-- 2. 自定义图片 -->
        <div :class="card">
          <h2 class="font-semibold">自定义图片</h2>
          <p class="mt-1 mb-4 text-xs text-slate-500">
            <code>:imgs</code> 传入网络图片(注意跨域),随机轮播
          </p>
          <button :class="btn" class="bg-indigo-600 hover:bg-indigo-700" @click="showImgs = true">
            自定义图片验证
          </button>
        </div>

        <!-- 3. 自定义尺寸 -->
        <div :class="card">
          <h2 class="font-semibold">自定义尺寸</h2>
          <p class="mt-1 mb-4 text-xs text-slate-500">
            400×200 画布、1.2 倍拼图块、44px 滑块、8px 容差
          </p>
          <button :class="btn" class="bg-violet-600 hover:bg-violet-700" @click="showSize = true">
            大尺寸验证
          </button>
        </div>

        <!-- 4. 自定义文案 -->
        <div :class="card">
          <h2 class="font-semibold">自定义文案</h2>
          <p class="mt-1 mb-4 text-xs text-slate-500">
            <code>successText</code> / <code>failText</code> / <code>sliderText</code>
          </p>
          <button :class="btn" class="bg-amber-600 hover:bg-amber-700" @click="showText = true">
            自定义文案验证
          </button>
        </div>

        <!-- 5. 组合式 parts + 自定义 slot -->
        <div :class="card">
          <h2 class="font-semibold">组合式 parts</h2>
          <p class="mt-1 mb-4 text-xs text-slate-500">
            每个 part 可替换,slot 可定制(翡翠绿主题)
          </p>
          <button :class="btn" class="bg-emerald-600 hover:bg-emerald-700" @click="showParts = true">
            组合式验证
          </button>
        </div>

        <!-- 6. 事件日志 -->
        <div :class="card">
          <h2 class="mb-2 text-sm font-semibold text-slate-400">事件日志</h2>
          <ul class="space-y-1 font-mono text-xs">
            <li v-for="(line, i) in log" :key="i">{{ line }}</li>
            <li v-if="!log.length" class="text-slate-300">— 暂无事件 —</li>
          </ul>
        </div>

        <!-- 7. 内嵌模式:不弹窗,直接嵌在页面里(v1 做不到) -->
        <div :class="card" class="sm:col-span-2">
          <h2 class="font-semibold">内嵌模式 · 无弹窗</h2>
          <p class="mt-1 mb-4 text-xs text-slate-500">
            <code>&lt;VcodeRoot&gt;</code> 不使用 Portal/Overlay,验证板常驻页面;body 不会滚动锁定
          </p>
          <VcodeRoot
            ref="inlineRoot"
            :show="true"
            @success="onInlineSuccess"
            @fail="onFail('内嵌模式')"
          >
            <VcodePanel
              style="position: static; transform: none; margin: 0 auto; border: 1px solid #e2e8f0"
            >
              <VcodeBoard>
                <VcodeCanvasMain />
                <VcodeCanvasPuzzle />
                <VcodeCanvasSuccess />
                <VcodeFlash />
                <VcodeLoading />
                <VcodeMessage />
                <VcodeRefresh />
              </VcodeBoard>
              <VcodeSlider>
                <VcodeSliderProgress>
                  <VcodeSliderThumb />
                </VcodeSliderProgress>
              </VcodeSlider>
            </VcodePanel>
          </VcodeRoot>
        </div>
      </div>
    </div>

    <!-- 1. 默认组合组件:不传 imgs -->
    <Vcode
      v-model:show="showDefault"
      @success="(d: number) => { onSuccess('默认组件')(d); showDefault = false }"
      @fail="onFail('默认组件')"
      @close="push('默认组件 关闭')"
    />

    <!-- 2. 自定义图片 -->
    <Vcode
      v-model:show="showImgs"
      :imgs="imgs"
      @success="(d: number) => { onSuccess('自定义图片')(d); showImgs = false }"
      @fail="onFail('自定义图片')"
      @close="push('自定义图片 关闭')"
    />

    <!-- 3. 自定义尺寸 -->
    <Vcode
      v-model:show="showSize"
      :canvas-width="400"
      :canvas-height="200"
      :puzzle-scale="1.2"
      :slider-size="44"
      :range="8"
      @success="(d: number) => { onSuccess('自定义尺寸')(d); showSize = false }"
      @fail="onFail('自定义尺寸')"
      @close="push('自定义尺寸 关闭')"
    />

    <!-- 4. 自定义文案 -->
    <Vcode
      v-model:show="showText"
      success-text="🎉 太棒了,验证通过!"
      fail-text="哎呀不对,再试一次"
      slider-text="按住滑块,拖到缺口处 →"
      @success="(d: number) => { onSuccess('自定义文案')(d); showText = false }"
      @fail="onFail('自定义文案')"
      @close="push('自定义文案 关闭')"
    />

    <!-- 5. 完全自定义组合:每个 part 可替换/插槽定制 -->
    <VcodeRoot
      v-model:show="showParts"
      :imgs="imgs"
      @success="(d: number) => { onSuccess('组合式 parts')(d); showParts = false }"
      @fail="onFail('组合式 parts')"
      @close="push('组合式 parts 关闭')"
    >
      <VcodePortal>
        <VcodeOverlay>
          <VcodePanel class="rounded-2xl! p-6! shadow-2xl">
            <VcodeBoard>
              <VcodeCanvasMain />
              <VcodeCanvasPuzzle class="rounded shadow-lg ring-1 ring-black/10" />
              <VcodeCanvasSuccess />
              <VcodeFlash />
              <VcodeLoading>
                <span class="text-xs text-slate-400">拼图加载中…</span>
              </VcodeLoading>
              <VcodeMessage v-slot="{ show, fail, text }">
                <span :class="fail ? 'font-bold' : ''">{{ fail ? '[FAIL] ' : '[OK] ' }}{{ text }}</span>
              </VcodeMessage>
              <VcodeRefresh>
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm shadow">↻</span>
              </VcodeRefresh>
            </VcodeBoard>
            <VcodeSlider class="mt-6!">
              <VcodeSliderProgress class="bg-emerald-500/80!">
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
