# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个从 Claude Design (claude.ai/design) 导出的简历展示网站 handoff bundle，目标是将 HTML/CSS/JS 原型实现为生产级页面。项目用于展示 AI Native 前端工程师的个人简历。

## 技术栈

- React 18（通过 CDN，非 npm 项目）
- Babel Standalone（浏览器端 JSX 转译）
- 纯 CSS（无预处理器，无构建工具）
- Google Fonts：Inter、JetBrains Mono、Source Serif 4、Noto Serif/Sans SC

**注意**：这是零构建配置的静态项目，没有 package.json / node_modules / 构建命令。直接用浏览器打开 HTML 文件即可预览。

## 架构

### 入口文件

- `project/Resume Website.html` — 主入口，网站版简历，包含 V1/V2 两个变体的切换器 + 终端风格启动动画
- `project/Resume PDF.html` — PDF 打印版，纯 JS 渲染（不依赖 React/Babel），有独立的数据源和渲染器

### 数据层

简历数据存在两份，结构略有不同：
- `project/resume/components/shared.jsx` — 网站版数据（`window.RESUME_DATA`），技能项是数组格式
- `project/resume/pdf-data.js` — PDF 版数据（同名 `window.RESUME_DATA`），技能项是字符串格式，项目结构用 `groups/bullets` 而非 `sections/items`

**修改简历内容时必须同步更新两个数据源。**

### 网站版双变体

- **V1（现代工程师风）** — `resume/components/v1-app.jsx` + `resume/styles/v1.css`
  - 两栏布局：左侧 sticky 命令行导航 + 基础信息，右侧 README 式内容
  - 打字机 Hero、IntersectionObserver 滚动渐显、`/` 快捷键搜索导航
  - 支持 Tweaks：字体 / 密度 / 章节顺序 / 强调色

- **V2（IDE 风）** — `resume/components/v2-app.jsx` + `resume/styles/v2.css`
  - VSCode 风格：标签栏 / 行号 / 文件树 / 面包屑 / 状态栏
  - Markdown 伪渲染（行号 + 语法高亮 token）
  - 支持 Tweaks：主题（浅/深）/ 强调色 / 密度

### 共享基础设施

- `project/tweaks-panel.jsx` — 可复用的浮动调参面板，提供 `useTweaks` hook 和一套表单控件（Slider/Radio/Toggle/Color 等），通过 `window.parent.postMessage` 与 Claude Design 宿主通信
- `project/design-canvas.jsx` — Claude Design 的画布组件（Figma 风格缩放/拖拽），属于宿主框架代码，一般不需要修改

### PDF 版渲染

- `project/resume/pdf-render.js` — 纯 DOM 操作渲染器，通过 `document.getElementById` + `createElement` 填充页面
- A4 尺寸 (210mm)，`@media print` 样式已内置，支持 `Ctrl+P` 打印为 PDF

## 关键约定

- 所有组件通过 `window.XXX = XXX` 暴露为全局变量（因为使用 Babel Standalone，没有模块系统）
- V2 的 React hooks 使用别名避免冲突：`useState → useStateV2`、`useEffect → useEffectV2` 等
- CSS 类名前缀约定：V1 用 `.v1` 作用域，V2 用 `.v2` 作用域，Tweaks 面板用 `.twk-`，Design Canvas 用 `.dc-`
- 变体切换通过 CSS `.view.active { display: block }` + localStorage 持久化
