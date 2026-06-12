## 项目描述
当前项目为react无后端单体项目，包含todolist, expense check, health tract三个模块，数据持久化采用localstorage

## 项目结构
.
├── CLAUDE.md
├── app # 入口
├── docs
│   └── references
├── features # 按业务能力拆分
│   ├── expense
│   │   ├── components
│   │   ├── hooks
│   │   ├── index.ts
│   │   └── store.ts
│   ├── health
│   │   ├── components
│   │   ├── hooks
│   │   ├── index.ts
│   │   └── store.ts
│   └── todo
│       ├── components
│       ├── hooks
│       ├── index.ts
│       └── store.ts
├── pages # 页面壳
│   ├── expense
│   ├── health
│   └── todo
├── prototype # 高保真动态原型
│   ├── Todo + Expense App.html
│   ├── add-dialogs.jsx
│   ├── app-data.jsx
│   ├── app-shell.jsx
│   ├── batch-delete.jsx
│   ├── expense-page.jsx
│   ├── health-dialogs.jsx
│   ├── health-page.jsx
│   ├── todo-page.jsx
│   └── tweaks-panel.jsx
└── shared 共享组件
    ├── components
    ├── hooks
    └── utils


依赖方向 app -> pages -> features -> shared
