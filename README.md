# test-experiment-dev

React 无后端单体项目，包含三大业务模块：**TodoList**、**Expense Check**、**Health Track**。数据持久化采用 localStorage。

## 技术栈

- **React 19** + **TypeScript 6**
- **Vite 8**（构建工具）
- **Zustand 5**（状态管理）
- **Vitest 4**（单元/集成测试）
- **Playwright**（E2E 测试）

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

---

## 测试

项目采用双层测试策略：

| 层级 | 框架 | 位置 | 说明 |
|---|---|---|---|
| 单元/集成测试 | Vitest | 与源文件同目录 `*.test.ts(x)` | 纯函数、Zustand store、React 组件、自定义 hooks |
| E2E 测试 | Playwright | `e2e/` | 覆盖三大模块的关键用户流程 |

### 测试运行脚本

| 命令 | 说明 |
|---|---|
| `pnpm test` | 运行全部 Vitest 单元/集成测试（单次运行） |
| `pnpm test:e2e` | 运行 Playwright E2E 测试（自动启动 dev server） |
| `pnpm coverage` | 运行 Vitest 测试并生成覆盖率报告 |

### 覆盖率门槛

`vite.config.ts` 中配置了 80% 的覆盖率阈值：

```ts
thresholds: {
  statements: 80,
  branches: 80,
  functions: 80,
  lines: 80,
}
```

不达标的代码将导致 CI 失败。覆盖率报告支持两种格式：
- **text**：终端输出
- **html**：`coverage/` 目录下生成可视化报告

### Vitest 配置要点

- **环境**：`jsdom`（模拟浏览器 DOM）
- **全局模式**：`describe` / `it` / `expect` / `vi` 无需显式 import
- **排除项**：`e2e/` 目录被排除（E2E 由 Playwright 单独管理）
- **路径别名**：支持 `app/`、`pages/`、`features/`、`shared/` 别名（与源码一致）

### Playwright E2E 配置要点

| 配置项 | 值 | 说明 |
|---|---|---|
| 测试目录 | `./e2e` | E2E 测试文件存放位置 |
| 超时 | 30s | 单用例超时 |
| 基础 URL | `http://127.0.0.1:5173` | 测试目标地址 |
| 视口 | 430×880 | 移动端尺寸（适配 Capacitor 场景） |
| 浏览器 | Chromium | 默认仅运行桌面 Chrome |
| 自动启动 | `pnpm dev --host 127.0.0.1` | 测试前自动启动 Vite dev server |
| Trace | 首次重试时记录 | 便于排查偶发失败 |

### 测试文件结构

```
features/
├── todo/
│   ├── lib.test.ts                    # 纯函数单元测试
│   ├── store.test.ts                  # Zustand store 测试
│   └── components/
│       └── todo-components.test.tsx   # UI 组件测试
├── expense/
│   ├── lib.test.ts
│   ├── store.test.ts
│   └── components/
│       └── expense-components.test.tsx
└── health/
    ├── lib.test.ts
    ├── store.test.ts
    └── components/
        └── health-components.test.tsx

pages/
├── todo/todo-page.test.tsx
├── expense/expense-page.test.tsx
└── health/health-page.test.tsx

shared/
├── utils/
│   ├── color.test.ts
│   ├── date.test.ts
│   ├── format.test.ts
│   ├── platform.test.ts
│   └── storage.test.ts
├── hooks/
│   ├── useBatchDelete.test.tsx
│   ├── useLongPress.test.tsx
│   └── useNow.test.tsx
└── components/
    └── components.test.tsx

app/App.test.tsx                       # 根组件测试
e2e/app.spec.ts                        # E2E 全流程测试
```

### 常用工作流

```bash
# 开发过程中运行单文件测试（支持 watch 模式）
pnpm vitest features/todo/lib.test.ts

# 运行全部测试并查看覆盖率
pnpm coverage

# 仅运行 E2E 测试
pnpm test:e2e

# CI 环境：顺序执行全部测试
pnpm test && pnpm test:e2e
```

---

## 常见问题排查

### `pnpm dev` / `pnpm install` 报错 `ERR_PNPM_IGNORED_BUILDS`

**现象**：执行 `pnpm dev` 时启动失败，输出类似：

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: unrs-resolver@1.12.2
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
[ERROR] Command failed with exit code 1: ... pnpm install
```

**原因**：pnpm 10+ 默认不执行依赖的安装脚本（出于供应链安全考虑）。本项目的 `unrs-resolver`（`eslint-import-resolver-typescript` 的原生解析器）带有 `postinstall` 构建脚本，未经批准时会被忽略；而 `pnpm dev` 启动前会做依赖状态检查，从而以非零码退出。

**解决**：在 `pnpm-workspace.yaml` 中批准该构建脚本，然后重新安装：

```yaml
# pnpm-workspace.yaml
onlyBuiltDependencies:
  - unrs-resolver
```

```bash
pnpm install   # 触发 unrs-resolver 的 postinstall 构建
pnpm dev       # 即可正常启动，默认监听 http://localhost:5173/
```

> 若环境启用了供应链策略包装器，`pnpm-workspace.yaml` 中还可能出现 `allowBuilds: { unrs-resolver: set this to true or false }` 占位项，需将其值显式改为 `true` 后再安装。

---

### `pnpm test:e2e` 报错 `browserType.launch: Executable doesn't exist`

**现象**：执行 `pnpm test:e2e` 时所有用例失败，输出类似：

```
Error: browserType.launch: Executable doesn't exist at
/home/<user>/.cache/ms-playwright/chromium_headless_shell-XXXX/chrome-headless-shell-linux64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║     pnpm exec playwright install                           ║
╚════════════════════════════════════════════════════════════╝
```

**原因**：`pnpm install` 只安装了 Playwright 的 npm 包，并不会自动下载其驱动的浏览器二进制（Chromium 等）。浏览器被缓存在 `~/.cache/ms-playwright/` 下，需要单独执行一次安装命令。首次克隆项目、更换机器，或升级 Playwright 版本（缓存目录带版本号，旧版本不复用）时都会触发此错误。

**解决**：下载本项目所需的浏览器（仅用 Chromium，无需全量安装）：

```bash
pnpm exec playwright install chromium
```

```bash
pnpm test:e2e   # 浏览器就绪后即可正常运行
```

> 如需在全新的 Linux 环境运行，浏览器可能还缺少系统依赖库，可改用 `pnpm exec playwright install --with-deps chromium` 一并安装系统依赖（该命令需要 sudo 权限）。

---

## 项目结构

```
.
├── app/                  # 应用入口
├── pages/                # 页面壳（路由层）
│   ├── todo/
│   ├── expense/
│   └── health/
├── features/             # 按业务能力拆分
│   ├── todo/
│   ├── expense/
│   └── health/
├── shared/               # 共享组件/hooks/utils
├── e2e/                  # Playwright E2E 测试
├── prototype/            # 高保真静态原型
└── docs/references/      # 参考文档
```

依赖方向：`app → pages → features → shared`

## 代码质量

- **ESLint**：`pnpm lint`
- **Husky + lint-staged**：提交前自动 lint 暂存文件
- **测试覆盖率**：80% 门槛，Vitest + Playwright 双层保障
