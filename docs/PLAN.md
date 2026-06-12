# PLAN — SPEC 逐步实现方案

> 对应 [SPEC.md](./SPEC.md),按依赖方向 `shared → features → pages → app` 自底向上分七个阶段推进。
> 每阶段遵循 TDD:先写测试(RED)→ 实现(GREEN)→ 重构;阶段验收全绿后才进入下一阶段。
> 现状:工程基建(ESLint boundaries / husky / TS strict)已就位;尚无 React/Vite/测试依赖;`features/*/store.ts`、`index.ts` 为占位文件。

## 阶段 0 — 工程搭建

**目标**:可运行、可测试的 React 开发环境。

- 引入依赖:`react`、`react-dom`、`vite`、`@vitejs/plugin-react`、`zustand`;测试侧 `vitest`、`@testing-library/react`、`@testing-library/user-event`、`jsdom`、`@vitest/coverage-v8`、`@playwright/test`。
- `vite.config.ts`:配置 `app/pages/features/shared` 路径别名(与 tsconfig paths 同步);Vitest 配置含 coverage 阈值 80%。
- `app/main.tsx` + `app/App.tsx` + `index.html`:可渲染的最小壳。
- `app/styles/`:从原型 HTML `<style>` 移植全局设计 token(SPEC §2.2 固化常量)与基础布局样式(.app/.phone/.screen/.page 等)。
- package.json scripts:`dev` / `build` / `test` / `test:e2e` / `coverage`;确认 lint-staged、boundaries 规则覆盖新增目录。

**验收**:`pnpm dev` 渲染手机壳空页;`pnpm lint`、`pnpm test` 通过;CI 三件套(lint/型检/test)全绿。

## 阶段 1 — shared 基座

**目标**:三模块共用的纯函数、hooks、组件,全部带单测。

| 产出 | 内容(对应原型) | SPEC |
|---|---|---|
| `shared/utils/color.ts` | softBg / softBg2 / inkOn / sliceFill / sliceFillHover、状态色 statusDot/Ink/Soft | §2.2 §5.2 |
| `shared/utils/format.ts` | fmtDuration、fmtYuan、pad2、fmtDayShort、fmtDateTime、WEEKDAYS_ZH | §3.2 §5.5 |
| `shared/utils/date.ts` | todayISO、nextHour、dateISOof、hmOf、mdToISO、nowHM | §3.4 §4.4 |
| `shared/utils/storage.ts` | 安全读写 localStorage(损坏回退)、首启检测 | §7.2 |
| `shared/hooks/useNow.ts` | 30s 周期当前时间 | §3.2 |
| `shared/hooks/useLongPress.ts` | 500ms / 9px 阈值 / 吞 click / 禁右键 | §6.1 |
| `shared/hooks/useBatchDelete.ts` | 进入/多选/清空自动退出 | §6.1 |
| `shared/components/` | Modal、TypePicker、AddButton、TrashButton、GearButton、BatchXButton、ConfirmDeleteDialog、Pager | §6 §5.5 |

**验收**:utils/hooks 单测 100% 覆盖(fmtDuration 边界、mdToISO 区间字符串、长按取消路径、批量删除清空退出等);组件有渲染与交互测试。

## 阶段 2 — 待办模块(先行验证基座)

**目标**:待办全功能,SPEC §3。

1. `features/todo/lib.ts`(纯函数,先测):taskStatus、taskRemainRatio、taskTimeNote、排序比较器、跨夜 +24h 规则。
2. `features/todo/store.ts`:zustand + persist(键 `tdex-todo`),actions:add / update / toggle / deleteMany,首启写入 7 条种子(时间相对首启时刻);全部不可变更新。
3. `features/todo/components/`:TaskCheck(脉冲动画)、TaskCard(进度条/状态配色/长按)、TodoAddDialog(新建/编辑双模式)、TaskList(FLIP 重排动画)。
4. `features/todo/index.ts` 导出公共面;`pages/todo/index.tsx` 页面壳(头部计数文案、图例、批量删除编排)。

**验收**:lib 100% 单测;store 集成测试(persist 往返、种子幂等);组件测试覆盖四状态渲染、编辑回填、跨夜判定;模块可在 dev 壳中独立演示。

## 阶段 3 — 支出模块

**目标**:支出全功能,SPEC §4。

1. `features/expense/lib.ts`:polar、arcPath、tagTotal、占比计算、明细色相派生 `(hue + i*16) % 360`(先测,含 >180° 大弧、零值扇区边界)。
2. `features/expense/store.ts`:persist 键 `tdex-expense`,actions:addItem / updateItem(跨分类移动)/ deleteTags / deleteItems,种子为原型五分类 17 笔。
3. `features/expense/components/`:DonutChart(放大切换、hover/触摸摘出、tooltip、touch 策略)、ExpenseCard(depth 两档配色)、ExpenseAddDialog(日期未触碰保留原字符串)。
4. `pages/expense/index.tsx`:总览/明细两级视图状态、双批量删除(分类级/明细级)编排。

**验收**:几何与聚合函数 100% 单测;updateItem 跨分类移动、日期保留逻辑有专项测试;饼图交互(点击放大、hover 选中)组件测试。

## 阶段 4 — 健康模块

**目标**:健康全功能,SPEC §5。

1. `features/health/lib.ts`:idealRange、bpDiaRange、rangeStatus(warnFrac 固定 0.2)、statusLabel、recStatus、recStatusText、dailyNodes、seedRecords(确定性生成器);先测:年龄分档边界(44/45/59/60)、warn 边界、血压取较差者、日均值聚合。
2. `features/health/store.ts`:records(persist 键 `tdex-health`,首启跑生成器)+ profile(键 `tdex-profile`,损坏回退默认);actions:addRecord(倒序插入)/ deleteRecords / saveProfile。
3. `features/health/components/`:HealthChart(坐标映射、区间虚线、scrub 吸附、数据框、指标切换)、RecordCard(展开详情、BMI)、ProfileDialog、HealthAddDialog(收缩>舒张校验)。
4. `pages/health/index.tsx`:图表 + 分页记录列表 + 三对话框 + 批量删除编排。

**验收**:lib 100% 单测;改资料后状态重算、新增后切指标/回首页、分页收起展开项均有测试。

## 阶段 5 — 集成(app 壳)

**目标**:三模块拼装为完整应用,SPEC §2。

- `app/App.tsx`:底部 Tab 栏(三 SVG 图标)、Tab 记忆(`tdex-tab`)、页面切换。
- 全局样式收口:手机壳响应式(≥480×920 圆角投影)、滚动行为。
- 跨模块回归:批量删除四处行为一致、对话框层级、useNow 驱动待办状态迁移。

**验收**:刷新后回到上次 Tab;三模块在壳内功能完整;`pnpm build` 产物可本地预览。

## 阶段 6 — 测试补全与验收

**目标**:达成 SPEC §8 质量门槛。

- **E2E(Playwright)**关键流程:
  1. 待办:新建 → 出现在正确分组 → 勾选完成触发重排 → 编辑 → 长按批量删除。
  2. 支出:总览记一笔 → 进入明细 → 编辑跨分类移动 → 批量删除明细/分类。
  3. 健康:改资料后状态变化 → 新增血压(校验收缩>舒张)→ 图表切换与 scrub → 分页。
  4. 持久化:操作后刷新页面数据不丢、Tab 记忆生效;首启种子写入。
- 覆盖率核验 ≥80%(纯函数 100%);补齐缺口。
- 终检:`pnpm lint`、`tsc --noEmit`、全部测试绿;对照 SPEC 逐条走查。

**验收**:全量流水线绿;SPEC 各章节均有对应实现与测试映射。

## 风险与对策

| 风险 | 对策 |
|---|---|
| FLIP / Web Animations API 在 jsdom 不可用 | 动画逻辑薄封装,单测断言调用参数;视觉效果由 E2E + 人工验收 |
| 触摸事件(passive/preventDefault)难以单测 | 策略函数抽纯逻辑测试;真实手势走 Playwright touch 模拟 |
| 种子数据时间相对「首启时刻」导致测试不稳定 | lib 函数注入 `now` 参数;测试固定时钟(`vi.useFakeTimers`) |
| 原型为 JS,迁移 TS strict 暴露隐式 any | 阶段 1–4 先定义模型类型(SPEC §3.1/§4.1/§5.1),组件按类型实现 |
