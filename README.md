# vue-puzzle-vcode [![npm](https://img.shields.io/npm/v/vue-puzzle-vcode.svg)](https://www.npmjs.com/package/vue-puzzle-vcode) [![npm downloads](https://img.shields.io/npm/dt/vue-puzzle-vcode.svg)](https://www.npmjs.com/package/vue-puzzle-vcode)

Vue 纯前端的拼图人机验证、右滑拼图验证。不依赖任何第三方 SDK 与后端接口,纯 Canvas 本地生成校验。

**同时支持 Vue 2.7 与 Vue 3**(基于 [vue-demi](https://github.com/vueuse/vue-demi),`vue` 为 peer dependency,不会向你的项目引入第二个 Vue)。

**Demo**:[Vue 3](https://vue-puzzle-vcode-demo.vercel.app) · [Vue 2.7](https://vue-puzzle-vcode-demo-vue2.vercel.app)

![img](public/demo.gif)

## 项目来源

本项目继承自 [**javaLuo/vue-puzzle-vcode**](https://github.com/javaLuo/vue-puzzle-vcode),感谢原作者 **javaLuo(L)** 的开源工作。本仓库是在原项目基础上的升级重构:webpack → Vite、单组件 → Radix 风格组合式部件、仅 Vue 2.6 → 同时支持 Vue 2.7 与 Vue 3、`vue` 移出生产依赖改为 peer dependency。验证交互与 Canvas 绘制逻辑沿袭原作。

## 特性

- 🔀 一套代码同时跑在 Vue 2.7 与 Vue 3 上
- 🧩 Radix 风格的组合式部件:`VcodeRoot` 提供上下文,`VcodeOverlay` / `VcodeSlider` 等部件通过 `inject` 接入,每一层都可替换、可自定义 slot
- 🎛 Headless 状态机 `useVcode`:逻辑与视图完全解耦,可完全自建 UI
- 🖼 无图模式下用 Canvas 随机生成背景图,也可以传入自己的图片数组
- 📦 `vue` 仅作为 peer dependency,杜绝双 Vue 问题

## 安装

```bash
pnpm add vue-puzzle-vcode
# npm i vue-puzzle-vcode / yarn add vue-puzzle-vcode
```

项目需已安装 `vue@^2.7 || ^3`(peer dependency)。`vue-demi` 会在安装时自动切换到与你项目匹配的版本。

## 快速开始(默认组件)

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import Vcode from 'vue-puzzle-vcode'
import 'vue-puzzle-vcode/style.css'

const show = ref(false)
</script>

<template>
  <button @click="show = true">验证</button>
  <Vcode
    v-model:show="show"
    :imgs="['https://picsum.photos/seed/a/310/160']"
    @success="(diff) => console.log('通过', diff)"
    @fail="(diff) => console.log('失败', diff)"
  />
</template>
```

### Vue 2.7

模板写法的唯一区别:用 `.sync` 代替 `v-model:show`。

```vue
<script>
import Vcode from 'vue-puzzle-vcode'
import 'vue-puzzle-vcode/style.css'

export default {
  components: { Vcode },
  data: () => ({ show: false }),
}
</script>

<template>
  <Vcode :show.sync="show" @success="onSuccess" @fail="onFail" />
</template>
```

也可以 `app.use(VcodePlugin)`(Vue 2.7 用 `Vue.use(VcodePlugin)`)全局注册全部部件。

## Props

| Prop          | 类型       | 默认值               | 说明                                  |
| ------------- | ---------- | -------------------- | ------------------------------------- |
| `show`        | `boolean`  | `false`              | 显隐,受控;配合 `v-model:show` / `.sync` |
| `canvasWidth` | `number`   | `310`                | 主画布宽                               |
| `canvasHeight`| `number`   | `160`                | 主画布高                               |
| `puzzleScale` | `number`   | `1`                  | 拼图块缩放,钳制在 `0.2 ~ 2`           |
| `sliderSize`  | `number`   | `50`                 | 滑块尺寸                               |
| `range`       | `number`   | `10`                 | 判定成功的允许像素误差                 |
| `imgs`        | `string[]` | `undefined`          | 自定义背景图;缺省时 Canvas 随机生成   |
| `successText` | `string`   | `验证通过！`          | 成功提示文案                           |
| `failText`    | `string`   | `验证失败，请重试`    | 失败提示文案                           |
| `sliderText`  | `string`   | `拖动滑块完成拼图`    | 滑轨文案                               |

## Events

| 事件          | 参数            | 说明                                   |
| ------------- | --------------- | -------------------------------------- |
| `update:show` | `show: boolean` | 组件请求关闭(点遮罩 / 验证通过后自动关闭) |
| `success`     | `diff: number`  | 验证通过,`diff` 为像素偏差            |
| `fail`        | `diff: number`  | 验证失败(800ms 后自动重置)           |
| `close`       | —               | 请求关闭(与 `update:show(false)` 同步触发) |

## 默认组件的 Slots

`<Vcode>` 内部就是一套默认组合,以下插槽可逐块替换:

| Slot          | 作用域参数            | 说明                 |
| ------------- | --------------------- | -------------------- |
| `loading`     | —                     | 加载动画区域         |
| `message`     | `{ text, fail }`      | 顶部提示条           |
| `refresh`     | —                     | 右上角刷新按钮内容   |
| `thumb`       | —                     | 滑块手柄内容         |
| `slider-text` | —                     | 滑轨文字             |

## 组合式部件(Radix 风格)

想要完全自定义某一层?用部件自行组合。`VcodeRoot` 创建状态机并 `provide` 上下文,其余部件通过 `inject` 接入,任意一层都可以换成你自己的实现:

```vue
<script setup>
import {
  VcodeRoot, VcodePortal, VcodeOverlay, VcodePanel, VcodeBoard,
  VcodeCanvasMain, VcodeCanvasPuzzle, VcodeCanvasSuccess,
  VcodeFlash, VcodeLoading, VcodeMessage, VcodeRefresh,
  VcodeSlider, VcodeSliderProgress, VcodeSliderThumb,
} from 'vue-puzzle-vcode'
</script>

<template>
  <VcodeRoot v-model:show="show" @success="ok" @fail="bad">
    <VcodePortal>
      <!-- 遮罩:随便加自己的 class / 过渡 -->
      <VcodeOverlay class="bg-slate-900/60 backdrop-blur-sm" />
      <VcodePanel>
        <VcodeBoard>
          <VcodeCanvasMain />
          <VcodeCanvasSuccess />
          <VcodeCanvasPuzzle />
          <VcodeLoading />
          <VcodeFlash />
          <VcodeRefresh>
            <button class="my-refresh">↻</button>
          </VcodeRefresh>
          <VcodeMessage v-slot="{ text, fail }">
            <div :class="fail ? 'msg msg--fail' : 'msg'">{{ text }}</div>
          </VcodeMessage>
        </VcodeBoard>
        <VcodeSlider>
          <VcodeSliderProgress />
          <VcodeSliderThumb><span>⇥</span></VcodeSliderThumb>
        </VcodeSlider>
      </VcodePanel>
    </VcodePortal>
  </VcodeRoot>
</template>
```

默认导出 `<Vcode>` 就是以上部件的一套官方组合,二者 API(props / events)完全一致。

## 部件说明

默认组合的嵌套结构(缩进 = 父子关系):

```
Vcode                    默认整体组件 = 下面这棵树的官方封装
└─ VcodeRoot             [必需] 无渲染根:创建状态机、provide 上下文、
   │                     绑定 document 级拖拽监听、show 时锁 body 滚动
   └─ VcodePortal        把子树挂到 document.body(Vue2 安全的 Teleport)
      ├─ VcodeOverlay    全屏遮罩;按下并抬起都在遮罩上 → 请求关闭
      └─ VcodePanel      居中卡片;拦截指针事件,防止冒泡到遮罩误关
         ├─ VcodeBoard   画布区容器(高度跟随 canvasHeight)
         │  ├─ VcodeCanvasMain     主画布:带拼图缺口的背景图
         │  ├─ VcodeCanvasSuccess  完整图,验证成功时淡入
         │  ├─ VcodeCanvasPuzzle   拼图小块,translateX 跟随滑块
         │  ├─ VcodeLoading        图片加载中的遮罩动画
         │  ├─ VcodeFlash          验证成功时的斜向扫光
         │  ├─ VcodeRefresh        右上角刷新按钮(点击重新生成拼图)
         │  └─ VcodeMessage        结果提示条(绿=成功 / 红=失败)
         └─ VcodeSlider            滑轨容器,含提示文案
            ├─ VcodeSliderProgress 已拖动部分的填充条
            └─ VcodeSliderThumb    可拖拽手柄(mousedown/touchstart 起点)
```

**功能核心 vs 可替换装饰**:三个 `VcodeCanvas*`、`VcodeSliderProgress`、`VcodeSliderThumb` 是状态机直接依赖的功能件(画布要被绘制、progress 元素要被测量、thumb 是拖拽起点),替换它们时必须保留注册/事件契约;`Overlay` / `Panel` / `Flash` / `Loading` / `Message` / `Refresh` 是纯表现层,可随意删改。

## Headless:`useVcode` 状态机

连部件都不想用?直接从 `@vue-puzzle-vcode/core` 拿状态机,自己渲染:

```ts
import { useVcode, provideVcodeContext } from 'vue-puzzle-vcode'

// 在根组件 setup 中
const ctx = useVcode(props, {
  onSuccess: (diff) => {},
  onFail: (diff) => {},
  onClose: () => {},
})
provideVcodeContext(ctx) // 之后任意后代组件 useVcodeContext() 取回
```

返回值为全部响应式状态(`pinX` / `pinY` / `styleWidth` / `loading` / `isSuccess` …)、三个 canvas 的 `shallowRef` 句柄,以及 `onThumbDown` / `onPointerMove` / `onPointerUp` / `requestClose` / `reset` 等行为函数。

## 样式

组件样式与框架解耦,按需引入:

```ts
import 'vue-puzzle-vcode/style.css'
```

所有 class 以 `vpv-` 为前缀(如 `.vpv-overlay`、`.vpv-slider-thumb`),方便覆写;组合式用法下也可以完全不管它,全部自己写。

## License

ISC
