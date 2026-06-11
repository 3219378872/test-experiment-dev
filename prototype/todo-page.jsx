// ---- Todolist 页面 ---------------------------------------------------------
const { useState, useEffect, useRef } = React;

// 状态 → 颜色方案(浅色卡底 + 更深的进度条/文字)
const TODO_STATUS_STYLE = {
  upcoming: { bg: 'oklch(0.95 0.045 150)', bar: 'oklch(0.68 0.13 150)', barTrack: 'oklch(0.89 0.07 150)', ink: 'oklch(0.40 0.09 150)', label: '未开始' },
  active:   { bg: 'oklch(0.96 0.055 95)',  bar: 'oklch(0.75 0.14 90)',  barTrack: 'oklch(0.90 0.08 95)',  ink: 'oklch(0.45 0.10 80)',  label: '进行中' },
  overdue:  { bg: 'oklch(0.94 0.045 25)',  bar: null,                    barTrack: null,                    ink: 'oklch(0.45 0.13 25)',  label: '已过期' },
  done:     { bg: 'oklch(0.965 0.006 80)', bar: null,                    barTrack: null,                    ink: 'oklch(0.62 0.015 80)', label: '已完成' },
};

// 复选框:点击时先缩小再放大
function TaskCheck({ checked, ink, onToggle }) {
  const [pulse, setPulse] = useState(false);
  return (
    <button
      className={'task-check' + (checked ? ' is-checked' : '') + (pulse ? ' is-pulsing' : '')}
      style={{ '--check-ink': ink }}
      aria-label={checked ? '标记为未完成' : '标记为完成'}
      onClick={(e) => { e.stopPropagation(); setPulse(false); requestAnimationFrame(() => setPulse(true)); onToggle(); }}
      onAnimationEnd={() => setPulse(false)}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4.5 12.5 9.5 17.5 19.5 6.5"></polyline>
      </svg>
    </button>
  );
}

function TaskCard({ task, now, onToggle, onEdit }) {
  const st = taskStatus(task, now);
  const sty = TODO_STATUS_STYLE[st];
  const cat = TASK_CATS[task.cat];
  const ratio = taskRemainRatio(task, now);
  const showBar = (st === 'upcoming' || st === 'active');

  return (
    <div
      className={'task-card status-' + st}
      style={{ background: sty.bg }}
      role="button"
      tabIndex={0}
      aria-label={'编辑待办:' + task.text}
      onClick={onEdit}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(); } }}
    >
      {showBar && (
        <div className="task-bar-track" style={{ background: sty.barTrack }}>
          <div className="task-bar-fill" style={{ width: (ratio * 100).toFixed(2) + '%', background: sty.bar }}></div>
        </div>
      )}
      <div className="task-body">
        <div className="task-icon" style={{ background: softBg2(cat.hue), color: inkOn(cat.hue) }}>{cat.glyph}</div>
        <div className="task-text">
          <div className={'task-title' + (st === 'done' ? ' is-done' : '')}>{task.text}</div>
          <div className="task-note" style={{ color: sty.ink }}>
            <span className="task-cat-label">{cat.label}</span>
            <span className="task-note-dot">·</span>
            <span>{taskTimeNote(task, now)}</span>
          </div>
        </div>
        <TaskCheck checked={st === 'done'} ink={sty.ink} onToggle={() => onToggle(task.id)} />
      </div>
    </div>
  );
}

function TodoPage({ tasks, now, onToggle, onAdd, onUpdate }) {
  const { useState, useLayoutEffect } = React;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);   // 被编辑的 task
  const itemRefs = useRef(new Map());
  const prevRects = useRef(new Map());

  // FLIP 重排动画:下移的卡片放大、上移的缩小,同时到达
  useLayoutEffect(() => {
    const rects = new Map();
    itemRefs.current.forEach((el, id) => { if (el && el.isConnected) rects.set(id, el.getBoundingClientRect()); });
    const hadPrev = prevRects.current.size > 0;
    rects.forEach((rect, id) => {
      const el = itemRefs.current.get(id);
      const old = prevRects.current.get(id);
      if (!old) {
        if (hadPrev) {
          el.animate(
            [{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'scale(1)' }],
            { duration: 320, easing: 'cubic-bezier(0.3, 1.3, 0.5, 1)' }
          );
        }
        return;
      }
      const dy = old.top - rect.top;
      if (Math.abs(dy) < 2) return;
      const down = dy < 0;                      // 旧位置在上方 → 向下移动
      const peak = down ? 1.06 : 0.95;
      el.style.zIndex = down ? '5' : '1';
      const anim = el.animate(
        [
          { transform: `translateY(${dy}px) scale(1)` },
          { transform: `translateY(${dy * 0.5}px) scale(${peak})`, offset: 0.5 },
          { transform: 'translateY(0) scale(1)' },
        ],
        { duration: 520, easing: 'cubic-bezier(0.3, 0.75, 0.3, 1)' }
      );
      anim.onfinish = () => { el.style.zIndex = ''; };
    });
    prevRects.current = rects;
  });

  const order = { active: 0, overdue: 1, upcoming: 2, done: 3 };
  const sorted = [...tasks].sort((a, b) => {
    const d = order[taskStatus(a, now)] - order[taskStatus(b, now)];
    return d !== 0 ? d : a.dueAt - b.dueAt;
  });
  const remaining = tasks.filter((t) => taskStatus(t, now) !== 'done').length;

  return (
    <div className="page todo-page">
      <header className="page-head">
        <div>
          <h1>今日待办</h1>
          <p className="page-sub">{remaining > 0 ? `还有 ${remaining} 件事要做` : '全部完成,休息一下吧'}</p>
        </div>
        <AddButton label="新建待办" onClick={() => setDialogOpen(true)} />
      </header>
      <div className="legend">
        <span className="legend-item"><i style={{ background: TODO_STATUS_STYLE.upcoming.bar }}></i>未开始</span>
        <span className="legend-item"><i style={{ background: TODO_STATUS_STYLE.active.bar }}></i>进行中</span>
        <span className="legend-item"><i style={{ background: 'oklch(0.62 0.16 25)' }}></i>已过期</span>
      </div>
      <div className="task-list">
        {sorted.map((t) => (
          <div
            key={t.id}
            className="task-flip"
            ref={(el) => { if (el) itemRefs.current.set(t.id, el); else itemRefs.current.delete(t.id); }}
          >
            <TaskCard task={t} now={now} onToggle={onToggle} onEdit={() => { setEditing(t); setDialogOpen(true); }} />
          </div>
        ))}
      </div>
      <TodoAddDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onAdd={onAdd}
        editTask={editing}
        onSave={onUpdate}
      />
    </div>
  );
}

Object.assign(window, { TodoPage, TODO_STATUS_STYLE });
