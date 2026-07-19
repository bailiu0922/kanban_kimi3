# FocusFlow —— 番茄钟 + 任务看板效率工具

FocusFlow 是一个面向个人效率管理的**纯前端单页应用（SPA）**，把「任务看板」和「番茄工作法」结合起来：在看板上管理任务，用番茄钟专注执行，并查看每日专注统计。无需后端，数据全部保存在浏览器 `localStorage` 中，刷新不丢失。

## 功能特性

- **任务看板**：待办 / 进行中 / 已完成三列；任务 CRUD（标题 ≤50 字校验、预估番茄数校验）、原生 HTML5 拖拽（支持**跨列移动 + 同列重排**，带插入位置指示线）、列任务计数、删除二次确认
- **番茄钟**：SVG 圆形进度环；专注（默认 25min，5–60 可配）/ 短休息 / 长休息（每 4 个番茄触发）；开始 / 暂停 / 重置 / 跳过休息；关联 Doing 列任务或自定义任务名；完成番茄自动 +1 任务进度并写入专注日志；浏览器标题实时提示（如 `🍅 专注中 12:03`）+ WebAudio 提示音
- **专注统计**：今日概览（番茄数 / 专注时长 / 完成任务数）、近 7 日柱状图（echarts）、近 15 周 GitHub 风格热力图、任务状态分布环图
- **设置**：三种时长配置、自动开始下一阶段、提示音开关、数据导出 JSON / 清空重置，全部持久化
- **体验**：浅色 / 深色模式切换、响应式（≤768px 看板单列堆叠）、空状态引导、基础过渡动画、aria 可访问性标注

## 技术选型

| 选择 | 理由 |
| ---- | ---- |
| Vue 3 + TypeScript + Vite | 需求指定方案 B；Composition API + `<script setup>` 获得完整类型推断 |
| Pinia | Vue 官方状态管理；按领域拆成 4 个 store（tasks / timer / stats / settings），状态逻辑与 UI 完全分离 |
| SCSS + CSS 变量 | 满足样式方案要求；设计 tokens（颜色/圆角/间距/阴影）集中在 `_variables.scss`，深浅双主题只切换 CSS 变量 |
| echarts（按需引入） | 需求建议的轻量图表方案；仅注册 Bar/Pie/Grid/Tooltip/Legend，控制包体积 |
| 原生 HTML5 Drag and Drop | 需求优先推荐；零依赖，配合模块级 composable 共享拖拽状态 |
| WebAudio API | 提示音由振荡器合成，无需音频资源文件 |

计时器基于 `endAt` 时间戳 + 250ms tick 计算剩余时间，避免 `setInterval` 漂移与后台标签页节流造成的计时不准。

## 运行方式

```bash
npm install
npm run dev      # 开发服务器（默认 http://localhost:5173）
npm run build    # 类型检查 + 生产构建（输出 dist/）
npm run preview  # 预览生产构建
```

环境要求：Node.js ≥ 18（开发使用 Node 22 验证）。

## 目录结构

```
Kimi3_project/
├── index.html                     # 入口 HTML（含主题防闪烁内联脚本）
├── package.json / vite.config.ts  # 工程配置（手写，未用脚手架生成代码）
├── tsconfig.json / .app / .node   # TS 工程引用配置
├── public/
│   └── favicon.svg
└── src/
    ├── main.ts / App.vue          # 应用入口与视图切换（KeepAlive 缓存四个视图）
    ├── vite-env.d.ts
    ├── types/index.ts             # 全部类型定义（Task / FocusLog / Settings / Phase ...）
    ├── utils/                     # date（日期键）/ id / storage（localStorage 读写、导出、清空）/ audio（WebAudio 提示音）
    ├── stores/                    # Pinia 状态层（与 UI 分离）
    │   ├── tasks.ts               #   看板 CRUD、跨列移动、同列重排、列计数
    │   ├── timer.ts               #   阶段状态机、endAt 时间戳计时、标题提示、日志写入
    │   ├── stats.ts               #   专注日志持久化 + 今日/近7日/热力图数据派生
    │   └── settings.ts            #   设置持久化 + 深浅主题切换
    ├── composables/useKanbanDnd.ts# 看板拖拽共享状态（draggingId + 插入指示器）
    ├── styles/                    # _variables.scss（设计 tokens）+ main.scss（全局规范）
    └── components/
        ├── layout/AppNav.vue      # 顶部导航 + 主题切换
        ├── common/                # BaseModal / ConfirmDialog / EChart（echarts 封装）
        ├── kanban/                # KanbanBoard / KanbanColumn / KanbanCard / TaskFormModal
        ├── timer/                 # TimerView / ProgressRing（SVG 进度环）/ TaskPicker
        ├── stats/                 # StatsView / OverviewCards / WeeklyBarChart / TaskDistribution / Heatmap
        └── settings/SettingsView.vue
```

## 数据说明

localStorage 键（均带 `focusflow:` 前缀）：`tasks`（任务）、`logs`（专注日志）、`settings`（设置）、`cycles`（累计番茄周期数，用于长休息判定）。每完成一个番茄写入一条 `{ date, taskId, taskTitle, minutes, type, endedAt }` 日志，统计页全部图表均由日志派生。

## 验收自查清单

- [x] `npm install && npm run dev` 可启动，`npm run build` 通过（vue-tsc 类型检查 0 错误）
- [x] 看板 CRUD + 三列拖拽 + 同列排序 + 列计数 + 删除二次确认
- [x] 番茄钟：25→5→（×4）→15 分钟阶段流转、开始/暂停/重置/跳过休息、标题提示、提示音
- [x] 番茄完成自动 +1 任务进度并写日志；统计页今日概览 / 近 7 日柱状图 / 热力图 / 状态分布
- [x] 设置持久化；刷新后看板、统计、设置均不丢失
- [x] 深色模式切换；≤768px 看板单列堆叠；空状态引导文案

## 已知限制

- **刷新后运行中的计时器重置**（任务、日志、设置、番茄周期数均持久化）；刷新前已暂停/进行中的计时不做恢复
- **HTML5 拖拽面向桌面端**：移动端触屏不支持拖拽，可在任务编辑弹窗中直接修改「所在列」
- 数据仅存储在当前浏览器 localStorage，跨设备同步请使用「导出 JSON」手动备份