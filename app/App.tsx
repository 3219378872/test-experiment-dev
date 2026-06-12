import { useEffect, useState } from 'react';
import { ExpensePage } from 'pages/expense';
import { HealthPage } from 'pages/health';
import { TodoPage } from 'pages/todo';

type TabId = 'todo' | 'expense' | 'health';

const tabs = [
  {
    id: 'todo',
    label: '待办',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <polyline points="8.5 12.5 11 15 15.5 9.5" />
      </svg>
    ),
  },
  {
    id: 'expense',
    label: '支出',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5V12l6.5-4.5" />
      </svg>
    ),
  },
  {
    id: 'health',
    label: '健康',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    ),
  },
] as const;

const tabStorageKey = 'tdex-tab';
const tabIds = new Set<TabId>(['todo', 'expense', 'health']);

function readInitialTab(): TabId {
  const stored = localStorage.getItem(tabStorageKey);
  return stored && tabIds.has(stored as TabId) ? (stored as TabId) : 'todo';
}

export function App() {
  const [tab, setTab] = useState<TabId>(() => readInitialTab());

  useEffect(() => {
    localStorage.setItem(tabStorageKey, tab);
  }, [tab]);

  return (
    <main className="app" aria-label="清单记账健康应用">
      <section className="phone" aria-label="移动端预览壳">
        <div className="screen" data-screen-label={tab === 'todo' ? '待办页' : tab === 'expense' ? '支出页' : '健康页'}>
          {tab === 'todo' ? <TodoPage /> : null}
          {tab === 'expense' ? <ExpensePage /> : null}
          {tab === 'health' ? <HealthPage /> : null}
          <nav className="tabbar" aria-label="主导航">
            {tabs.map((item) => (
              <button className="tabbar__item" key={item.id} type="button" aria-current={item.id === tab ? 'page' : undefined} onClick={() => setTab(item.id)}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
