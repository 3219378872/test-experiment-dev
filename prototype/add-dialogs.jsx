// ---- 新建条目对话框(待办 / 记账共用骨架) ----------------------------------

// 居中模态:遮罩毛玻璃,点遮罩关闭
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" role="dialog" aria-label={title}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-body">{children}</div>
        <div className="dialog-actions">{footer}</div>
      </div>
    </div>
  );
}

// 左侧圆形类型选择:大圆 = 当前选中,下方小圆点切换
function TypePicker({ options, value, onChange }) {
  const sel = options.find((o) => o.id === value) || options[0];
  return (
    <div className="type-picker">
      <div className="type-big" style={{ background: softBg2(sel.hue), color: inkOn(sel.hue) }}>
        <span className="type-big-glyph">{sel.glyph}</span>
        <span className="type-big-label">{sel.label}</span>
      </div>
      <div className="type-dots">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={'type-dot' + (o.id === sel.id ? ' is-active' : '')}
            style={{ background: softBg2(o.hue), color: inkOn(o.hue), '--dot-ring': sliceFill(o.hue) }}
            aria-label={o.label}
            onClick={() => onChange(o.id)}
          >{o.glyph}</button>
        ))}
      </div>
    </div>
  );
}

const pad2 = (n) => String(n).padStart(2, '0');
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function nextHour(offset) {
  const d = new Date(Date.now() + 3600e3 * (1 + offset));
  return `${pad2(d.getHours())}:00`;
}
const dateISOof = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };
const hmOf = (ts) => { const d = new Date(ts); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
// "6.05" → 今年的 ISO 日期;容忍区间字符串(如 "6.02 – 6.10" 取首个日期)
function mdToISO(md) {
  const m = String(md).match(/(\d+)\.(\d+)/);
  if (!m) return todayISO();
  return `${new Date().getFullYear()}-${pad2(+m[1])}-${pad2(+m[2])}`;
}

// ---- 待办:描述 / 开始日期(到日) / 时间范围(到分钟);传 editTask 则为编辑 ----
function TodoAddDialog({ open, onClose, onAdd, editTask, onSave }) {
  const { useState, useEffect } = React;
  const [cat, setCat] = useState('work');
  const [text, setText] = useState('');
  const [date, setDate] = useState(todayISO());
  const [t0, setT0] = useState(nextHour(0));
  const [t1, setT1] = useState(nextHour(2));

  useEffect(() => {
    if (!open) return;
    if (editTask) {
      setCat(editTask.cat); setText(editTask.text);
      setDate(dateISOof(editTask.startAt)); setT0(hmOf(editTask.startAt)); setT1(hmOf(editTask.dueAt));
    } else {
      setCat('work'); setText(''); setDate(todayISO()); setT0(nextHour(0)); setT1(nextHour(2));
    }
  }, [open, editTask]);

  const valid = text.trim().length > 0 && date && t0 && t1;
  const submit = () => {
    if (!valid) return;
    const startAt = new Date(`${date}T${t0}`).getTime();
    let dueAt = new Date(`${date}T${t1}`).getTime();
    if (dueAt <= startAt) dueAt += 24 * 3600e3;   // 跨夜
    if (editTask) onSave({ id: editTask.id, cat, text: text.trim(), startAt, dueAt });
    else onAdd({ cat, text: text.trim(), startAt, dueAt });
    onClose();
  };

  const catOptions = Object.entries(TASK_CATS).map(([id, c]) => ({ id, ...c }));
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editTask ? '编辑待办' : '新建待办'}
      footer={
        <React.Fragment>
          <button type="button" className="btn-ghost" onClick={onClose}>取消</button>
          <button type="button" className="btn-primary" disabled={!valid} onClick={submit}>{editTask ? '保存' : '添加'}</button>
        </React.Fragment>
      }
    >
      <TypePicker options={catOptions} value={cat} onChange={setCat} />
      <div className="dialog-fields">
        <label className="field">
          <span>描述</span>
          <input type="text" value={text} placeholder="要做什么?" maxLength={40} onChange={(e) => setText(e.target.value)} />
        </label>
        <label className="field">
          <span>开始日期</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="field">
          <span>时间范围</span>
          <div className="time-range">
            <input type="time" value={t0} aria-label="开始时间" onChange={(e) => setT0(e.target.value)} />
            <i>–</i>
            <input type="time" value={t1} aria-label="结束时间" onChange={(e) => setT1(e.target.value)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ---- 记账:描述 / 金额 / 日期,类型对应外部 tag;传 editItem 则为编辑 --------
function ExpenseAddDialog({ open, onClose, onAdd, tags, initialTag, editItem, onSave }) {
  const { useState, useEffect } = React;
  const [tagId, setTagId] = useState(initialTag || tags[0].id);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [dateTouched, setDateTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDateTouched(false);
    if (editItem) {
      setTagId(editItem.tagId); setName(editItem.name);
      setAmount(String(editItem.amount)); setDate(mdToISO(editItem.date));
    } else {
      setTagId(initialTag || tags[0].id); setName(''); setAmount(''); setDate(todayISO());
    }
  }, [open, initialTag, editItem]);

  const amt = parseFloat(amount);
  const valid = name.trim().length > 0 && amt > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const submit = () => {
    if (!valid) return;
    const [, m, d] = date.split('-');
    // 编辑时若未改动日期,保留原始字符串(区间日期不被覆盖)
    const dateStr = editItem && !dateTouched ? editItem.date : `${+m}.${pad2(+d)}`;
    const payload = { tagId, name: name.trim(), amount: Math.round(amt * 100) / 100, date: dateStr };
    if (editItem) onSave({ ...payload, fromTag: editItem.tagId, index: editItem.index });
    else onAdd(payload);
    onClose();
  };

  const tagOptions = tags.map((t) => ({ id: t.id, glyph: t.glyph, label: t.label, hue: t.hue }));
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? '编辑开销' : '记一笔'}
      footer={
        <React.Fragment>
          <button type="button" className="btn-ghost" onClick={onClose}>取消</button>
          <button type="button" className="btn-primary" disabled={!valid} onClick={submit}>{editItem ? '保存' : '添加'}</button>
        </React.Fragment>
      }
    >
      <TypePicker options={tagOptions} value={tagId} onChange={setTagId} />
      <div className="dialog-fields">
        <label className="field">
          <span>描述</span>
          <input type="text" value={name} placeholder="花在哪了?" maxLength={20} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>金额</span>
          <input type="number" value={amount} placeholder="0.00" min="0" step="0.01" inputMode="decimal" onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className="field">
          <span>日期</span>
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setDateTouched(true); }} />
        </label>
      </div>
    </Modal>
  );
}

// 右上角 + 按钮
function AddButton({ onClick, label }) {
  return (
    <button type="button" className="add-btn" aria-label={label || '新建'} onClick={onClick}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  );
}

Object.assign(window, { Modal, TypePicker, TodoAddDialog, ExpenseAddDialog, AddButton });
