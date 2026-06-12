import { TodoPage } from 'pages/todo';

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
          <TodoPage />
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
