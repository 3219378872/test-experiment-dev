const tabs = [
  { id: 'todo', label: '待办' },
  { id: 'expense', label: '支出' },
  { id: 'health', label: '健康' },
] as const;

export function App() {
  return (
    <main className="app" aria-label="清单记账健康应用">
      <section className="phone" aria-label="移动端预览壳">
        <div className="screen">
          <section className="page page--empty">
            <p className="eyebrow">Phase 0</p>
            <h1>清单 · 记账 · 健康</h1>
            <p className="muted">基础工程已就绪，功能模块将在后续阶段接入。</p>
          </section>
          <nav className="tabbar" aria-label="主导航">
            {tabs.map((tab) => (
              <button className="tabbar__item" key={tab.id} type="button" aria-current={tab.id === 'todo' ? 'page' : undefined}>
                <span className="tabbar__icon" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
