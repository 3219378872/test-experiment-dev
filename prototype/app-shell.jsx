// ---- App 外壳:底部 Tab + Tweaks ------------------------------------------
const ACCENT_OPTIONS = ['#e8a04c', '#e08560', '#7fb892', '#9a8fd4'];
const ACCENT_HUE = { '#e8a04c': 70, '#e08560': 35, '#7fb892': 150, '#9a8fd4': 285 };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#e8a04c",
  "radius": 18,
  "density": "comfy",
  "warnPct": 20
}/*EDITMODE-END*/;

function AppShell() {
  const { useState, useEffect } = React;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [tab, setTab] = useState(() => localStorage.getItem('tdex-tab') || 'todo');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { localStorage.setItem('tdex-tab', tab); }, [tab]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30e3);
    return () => clearInterval(t);
  }, []);

  const toggleTask = (id) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const updateTask = ({ id, cat, text, startAt, dueAt }) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, cat, text, startAt, dueAt } : t)));

  const addTask = ({ cat, text, startAt, dueAt }) =>
    setTasks((ts) => [...ts, { id: 't' + Date.now(), cat, text, createdAt: Date.now(), startAt, dueAt, done: false }]);

  const deleteTasks = (ids) =>
    setTasks((ts) => ts.filter((t) => !ids.includes(t.id)));

  return (
    <div
      className={'app density-' + tweaks.density}
      style={{ '--accent-hue': ACCENT_HUE[tweaks.accent] || 70, '--radius': tweaks.radius + 'px' }}
    >
      <div className="phone">
        <main className="screen" data-screen-label={tab === 'todo' ? '待办页' : tab === 'expense' ? '支出页' : '健康页'}>
          {tab === 'todo'
            ? <TodoPage tasks={tasks} now={now} onToggle={toggleTask} onAdd={addTask} onUpdate={updateTask} onDelete={deleteTasks} />
            : tab === 'expense'
              ? <ExpensePage />
              : <HealthPage warnFrac={tweaks.warnPct / 100} />}
        </main>
        <nav className="tabbar">
          <button className={'tab' + (tab === 'todo' ? ' is-active' : '')} onClick={() => setTab('todo')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="4"></rect>
              <polyline points="8.5 12.5 11 15 15.5 9.5"></polyline>
            </svg>
            <span>待办</span>
          </button>
          <button className={'tab' + (tab === 'expense' ? ' is-active' : '')} onClick={() => setTab('expense')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8.5"></circle>
              <path d="M12 3.5 V12 L18.5 7.5"></path>
            </svg>
            <span>支出</span>
          </button>
          <button className={'tab' + (tab === 'health' ? ' is-active' : '')} onClick={() => setTab('health')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>健康</span>
          </button>
        </nav>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="风格" />
        <TweakColor label="点缀色" value={tweaks.accent} options={ACCENT_OPTIONS} onChange={(v) => setTweak('accent', v)} />
        <TweakSlider label="卡片圆角" min={8} max={28} step={1} unit="px" value={tweaks.radius} onChange={(v) => setTweak('radius', v)} />
        <TweakRadio label="密度" value={tweaks.density} options={[{ value: 'comfy', label: '舒适' }, { value: 'compact', label: '紧凑' }]} onChange={(v) => setTweak('density', v)} />
        <TweakSection label="健康" />
        <TweakSlider label="黄色预警阈值" min={5} max={40} step={5} unit="%" value={tweaks.warnPct} onChange={(v) => setTweak('warnPct', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppShell />);
