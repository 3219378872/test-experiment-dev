// ---- 健康:个人资料 / 新增测量 对话框 ---------------------------------------

function nowHM() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// 齿轮:个人资料设置(性别 / 年龄 / 身高 / 体重)→ 用于计算理想区间
function ProfileDialog({ open, onClose, profile, onSave }) {
  const { useState, useEffect } = React;
  const [gender, setGender] = useState(profile.gender);
  const [age, setAge] = useState(String(profile.age));
  const [height, setHeight] = useState(String(profile.height));
  const [weight, setWeight] = useState(String(profile.weight));

  useEffect(() => {
    if (open) {
      setGender(profile.gender); setAge(String(profile.age));
      setHeight(String(profile.height)); setWeight(String(profile.weight));
    }
  }, [open]);

  const a = parseInt(age, 10), h = parseFloat(height), w = parseFloat(weight);
  const valid = a >= 1 && a <= 120 && h >= 80 && h <= 250 && w >= 20 && w <= 300;
  const submit = () => {
    if (!valid) return;
    onSave({ gender, age: a, height: h, weight: w });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="个人资料"
      footer={
        <React.Fragment>
          <button type="button" className="btn-ghost" onClick={onClose}>取消</button>
          <button type="button" className="btn-primary" disabled={!valid} onClick={submit}>保存</button>
        </React.Fragment>
      }
    >
      <div className="dialog-fields">
        <div className="field">
          <span>性别</span>
          <div className="seg-row">
            <button type="button" className={'seg-btn' + (gender === 'male' ? ' is-active' : '')} onClick={() => setGender('male')}>男</button>
            <button type="button" className={'seg-btn' + (gender === 'female' ? ' is-active' : '')} onClick={() => setGender('female')}>女</button>
          </div>
        </div>
        <div className="field-grid2">
          <label className="field">
            <span>年龄</span>
            <input type="number" value={age} min="1" max="120" inputMode="numeric" onChange={(e) => setAge(e.target.value)} />
          </label>
          <label className="field">
            <span>身高 (cm)</span>
            <input type="number" value={height} min="80" max="250" inputMode="decimal" onChange={(e) => setHeight(e.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>体重 (kg)</span>
          <input type="number" value={weight} min="20" max="300" step="0.1" inputMode="decimal" onChange={(e) => setWeight(e.target.value)} />
        </label>
        <p className="profile-hint">资料用于计算各项数据的理想区间</p>
      </div>
    </Modal>
  );
}

// + 号:新增测量数据,分类为 体重 / 血压
function HealthAddDialog({ open, onClose, onAdd }) {
  const { useState, useEffect } = React;
  const [metric, setMetric] = useState('weight');
  const [weight, setWeight] = useState('');
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(nowHM());

  useEffect(() => {
    if (open) { setMetric('weight'); setWeight(''); setSys(''); setDia(''); setDate(todayISO()); setTime(nowHM()); }
  }, [open]);

  const wv = parseFloat(weight), sv = parseFloat(sys), dv = parseFloat(dia);
  const valid = date && time && (metric === 'weight' ? wv > 0 : sv > 0 && dv > 0 && sv > dv);
  const submit = () => {
    if (!valid) return;
    const ts = new Date(`${date}T${time}`).getTime();
    if (metric === 'weight') {
      onAdd({ id: 'u' + Date.now(), metric, ts, value: Math.round(wv * 10) / 10 });
    } else {
      onAdd({ id: 'u' + Date.now(), metric, ts, value: Math.round(sv), dia: Math.round(dv) });
    }
    onClose();
  };

  const options = Object.entries(HEALTH_METRICS).map(([id, m]) => ({ id, ...m }));
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="新增数据"
      footer={
        <React.Fragment>
          <button type="button" className="btn-ghost" onClick={onClose}>取消</button>
          <button type="button" className="btn-primary" disabled={!valid} onClick={submit}>添加</button>
        </React.Fragment>
      }
    >
      <TypePicker options={options} value={metric} onChange={setMetric} />
      <div className="dialog-fields">
        {metric === 'weight' ? (
          <label className="field">
            <span>体重 (kg)</span>
            <input type="number" value={weight} placeholder="0.0" min="0" step="0.1" inputMode="decimal" onChange={(e) => setWeight(e.target.value)} />
          </label>
        ) : (
          <div className="field-grid2">
            <label className="field">
              <span>收缩压</span>
              <input type="number" value={sys} placeholder="120" min="0" inputMode="numeric" onChange={(e) => setSys(e.target.value)} />
            </label>
            <label className="field">
              <span>舒张压</span>
              <input type="number" value={dia} placeholder="80" min="0" inputMode="numeric" onChange={(e) => setDia(e.target.value)} />
            </label>
          </div>
        )}
        <label className="field">
          <span>日期</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="field">
          <span>时间</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>
    </Modal>
  );
}

// 浅色齿轮按钮(位于 + 号左侧)
function GearButton({ onClick }) {
  return (
    <button type="button" className="gear-btn" aria-label="设置个人资料" onClick={onClick}>
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  );
}

Object.assign(window, { ProfileDialog, HealthAddDialog, GearButton, nowHM });
