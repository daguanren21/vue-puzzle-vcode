# @vue-puzzle-vcode/core

vue-puzzle-vcode 的 headless 核心:滑动拼图验证码的状态机与组合式函数(composables),同时兼容 Vue 2.7 与 Vue 3(基于 vue-demi)。

> 一般不需要直接使用本包 —— 请安装组件包 [`@vue-puzzle-vcode/ui`](https://www.npmjs.com/package/@vue-puzzle-vcode/ui)。只有想完全自绘 UI、只复用校验逻辑时才需要它。

## 安装

```bash
pnpm add @vue-puzzle-vcode/core
# 需已安装 vue@^2.7 || ^3(peer dependency)
```

## 导出

- `useVcode(props, emits)` —— 核心状态机:画布数据、滑块偏移、成功/失败判定、重置
- `provideVcodeContext` / `useVcodeContext` —— 跨部件共享状态的上下文(Radix 风格组合)
- 全部 TypeScript 类型(props / events / context)

## 文档

完整文档与在线 Demo 见主仓库:[github.com/daguanren21/vue-puzzle-vcode](https://github.com/daguanren21/vue-puzzle-vcode#readme)
