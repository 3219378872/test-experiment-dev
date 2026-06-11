// ---- Health Track 页面 ------------------------------------------------------

const WEEKDAYS_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const fmtDayShort = (ts) => { const d = new Date(ts); return `${d.getMonth() + 1}.${pad2(d.getDate())}`; };
const fmtDateTime = (ts) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS_ZH[d.getDay()]} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

// 折线图:日均值节点 + 理想区间双虚线 + 悬停数据框,右上角卡片式指标切换
function HealthChart({ nodes, range, metricId, setMetricId, warnFrac }) {
  const { useState, useRef, useEffect } = React;
  const [hover, setHover] = useState(null);   // 节点下标
  const svgRef = useRef(null);
  const scrubRef = useRef(() => {});
  const meta = HEALTH_METRICS[metricId];
  const isW = metricId === 'weight';
  const fmtVal = (v) => (isW ? v.toFixed(1) : String(Math.round(v)));

  const W = 360, H = 218, L = 35, R = 12, T = 16, B = 24;
  const t1 = DAY0, t0 = DAY0 - 30 * DAY;
  const vals = nodes.map((n) => n.value);
  let vmin = Math.min(range.lo, ...vals), vmax = Math.max(range.hi, ...vals);
  const pad = Math.max((vmax - vmin) * 0.14, isW ? 0.8 : 3);
  vmin -= pad; vmax += pad;
  const X = (t) => L + ((t - t0) / (t1 - t0)) * (W - L - R);
  const Y = (v) => T + (1 - (v - vmin) / (vmax - vmin)) * (H - T - B);

  const path = nodes.map((n, i) => `${i ? 'L' : 'M'} ${X(n.day).toFixed(1)} ${Y(n.value).toFixed(1)}`).join(' ');
  const yTicks = [0, 1, 2, 3].map((i) => vmin + ((vmax - vmin) * i) / 3);
  const xTicks = [0, 1, 2, 3, 4].map((i) => t0 + ((t1 - t0) * i) / 4);

  const hv = hover != null ? nodes[hover] : null;

  // 根据指针/手指横坐标吸附到最近节点
  scrubRef.current = (clientX) => {
    const el = svgRef.current;
    if (!el || nodes.length === 0) return;
    const rect = el.getBoundingClientRect();
    const xSvg = ((clientX - rect.left) / rect.width) * W;
    let best = 0, bd = Infinity;
    nodes.forEach((n, i) => {
      const d = Math.abs(X(n.day) - xSvg);
      if (d < bd) { bd = d; best = i; }
    });
    setHover(best);
  };

  // 触控:仅拦截"滑动"(touchmove preventDefault)阻止页面滚动并移动聚焦节点;
  // 轻点不阻止默认,保留 click 等手势
  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const onStart = (e) => {
      const pt = e.touches[0];
      if (pt) scrubRef.current(pt.clientX);
    };
    const onMove = (e) => {
      e.preventDefault();
      const pt = e.touches[0];
      if (pt) scrubRef.current(pt.clientX);
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); };
  }, []);

  const prev = hover != null && hover > 0 ? nodes[hover - 1] : null;
  let diffText = '首个记录日';
  if (hv && prev) {
    const diff = hv.value - prev.value;
    const pct = (diff / prev.value) * 100;
    const sign = diff > 0 ? '+' : '';
    diffText = `${sign}${isW ? diff.toFixed(1) : Math.round(diff)} ${meta.unit} (${sign}${pct.toFixed(1)}%)`;
  }

  return (
    <div className="hchart-card">
      <div className="hchart-head">
        <div className="hchart-title">
          {meta.label}趋势<small>每日均值</small>
        </div>
        <div className="metric-switch" role="tablist" aria-label="切换跟踪数据">
          {Object.entries(HEALTH_METRICS).map(([id, m]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === metricId}
              className={'metric-btn' + (id === metricId ? ' is-active' : '')}
              style={{ '--m-soft': softBg(m.hue), '--m-ink': inkOn(m.hue) }}
              onClick={() => { setMetricId(id); setHover(null); }}
            >{m.label}</button>
          ))}
        </div>
      </div>

      <div className="hchart-body" onMouseLeave={() => setHover(null)}>
        <svg
          ref={svgRef}
          className="hchart-svg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={meta.label + '近一个月折线图'}
          onMouseMove={(e) => scrubRef.current(e.clientX)}
        >
          {yTicks.map((v, i) => (
            <g key={i}>
              <line className="hchart-grid" x1={L} y1={Y(v)} x2={W - R} y2={Y(v)}></line>
              <text className="hchart-axis" x={L - 5} y={Y(v) + 3} textAnchor="end">{fmtVal(v)}</text>
            </g>
          ))}
          {xTicks.map((t, i) => (
            <text key={i} className="hchart-axis" x={X(t)} y={H - 8} textAnchor="middle">{fmtDayShort(t)}</text>
          ))}

          {/* 理想区间:两条虚线 */}
          <line className="hchart-band" x1={L} y1={Y(range.hi)} x2={W - R} y2={Y(range.hi)}></line>
          <line className="hchart-band" x1={L} y1={Y(range.lo)} x2={W - R} y2={Y(range.lo)}></line>
          <text className="hchart-band-label" x={W - R} y={Y(range.hi) - 4} textAnchor="end">上限 {range.hi}</text>
          <text className="hchart-band-label" x={W - R} y={Y(range.lo) + 11} textAnchor="end">下限 {range.lo}</text>

          <path className="hchart-line" d={path} stroke={`oklch(0.72 0.1 ${meta.hue})`}></path>

          {nodes.map((n, i) => (
            <circle
              key={n.day}
              className="hchart-node"
              cx={X(n.day)} cy={Y(n.value)}
              r={hover === i ? 6 : 4.4}
              fill={statusDot(n.status)}
            ></circle>
          ))}
        </svg>

        {hv && (
          <div
            className="chart-tip"
            style={{ left: `${(X(hv.day) / W) * 100}%`, top: `${(Y(hv.value) / H) * 100}%` }}
          >
            <div className="chart-tip-date">{fmtDayShort(hv.day)} {WEEKDAYS_ZH[new Date(hv.day).getDay()]} · {hv.count} 次测量</div>
            <div className="chart-tip-main" style={{ color: statusInk(hv.status) }}>
              {fmtVal(hv.value)}{isW ? '' : ` / ${hv.dia}`} <small>{meta.unit}</small>
            </div>
            <div className="chart-tip-row"><span>较前一日</span><b>{diffText}</b></div>
            <div className="chart-tip-row"><span>当前状态</span><b style={{ color: statusInk(hv.status) }}>{statusLabel(hv.value, range, warnFrac)}</b></div>
            <div className="chart-tip-row"><span>理想区间</span><b>{range.lo} – {range.hi} {meta.unit}</b></div>
          </div>
        )}
      </div>
      <div className="hchart-hint">在图表上滑动 / 悬停查看详情 · 虚线为理想区间{isW ? '' : ' (收缩压)'}</div>
    </div>
  );
}

// 分页:左右箭头 + 最多同时展示 3 个页码按钮
function Pager({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const start = Math.min(Math.max(0, page - 1), Math.max(0, pages - 3));
  const nums = [];
  for (let i = start; i < Math.min(start + 3, pages); i++) nums.push(i);
  return (
    <div className="pager">
      <button type="button" className="pager-btn" disabled={page === 0} aria-label="上一页" onClick={() => onPage(page - 1)}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="14 6 8 12 14 18"></polyline></svg>
      </button>
      {nums.map((i) => (
        <button key={i} type="button" className={'pager-btn' + (i === page ? ' is-active' : '')} onClick={() => onPage(i)}>{i + 1}</button>
      ))}
      <button type="button" className="pager-btn" disabled={page === pages - 1} aria-label="下一页" onClick={() => onPage(page + 1)}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="10 6 16 12 10 18"></polyline></svg>
      </button>
    </div>
  );
}

// 单条测量记录:类型 + 数值 + 红黄绿状态;点击展开时间与具体数据
function RecordCard({ rec, profile, warnFrac, open, onToggle }) {
  const meta = HEALTH_METRICS[rec.metric];
  const st = recStatus(rec, profile, warnFrac);
  const stText = recStatusText(rec, profile, warnFrac);
  const isW = rec.metric === 'weight';
  const valueText = isW ? `${rec.value.toFixed(1)} kg` : `${rec.value} / ${rec.dia} mmHg`;
  const range = idealRange(rec.metric, profile);
  const bmi = isW ? rec.value / Math.pow(profile.height / 100, 2) : null;

  return (
    <div className={'rec-card' + (open ? ' is-open' : '')}>
      <button type="button" className="rec-head" aria-expanded={open} onClick={onToggle}>
        <div className="rec-chip" style={{ background: softBg(meta.hue), color: inkOn(meta.hue) }}>{meta.glyph}</div>
        <div className="rec-main">
          <div className="rec-title">{meta.label}<small>{valueText}</small></div>
          <div className="rec-note">{fmtDayShort(rec.ts)} {WEEKDAYS_ZH[new Date(rec.ts).getDay()]}</div>
        </div>
        <span className="rec-pill" style={{ background: statusSoft(st), color: statusInk(st) }}>
          <i style={{ background: statusDot(st) }}></i>{stText}
        </span>
        <svg className="rec-caret" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 5 16 12 9 19"></polyline>
        </svg>
      </button>
      {open && (
        <dl className="rec-detail">
          <dt>测量时间</dt><dd>{fmtDateTime(rec.ts)}</dd>
          {isW ? (
            <React.Fragment>
              <dt>体重</dt><dd>{rec.value.toFixed(1)} kg</dd>
              <dt>BMI</dt><dd>{bmi.toFixed(1)}</dd>
              <dt>理想区间</dt><dd>{range.lo} – {range.hi} kg</dd>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <dt>收缩压</dt><dd>{rec.value} mmHg</dd>
              <dt>舒张压</dt><dd>{rec.dia} mmHg</dd>
              <dt>理想区间</dt><dd>{range.lo}–{range.hi} / {bpDiaRange(profile).lo}–{bpDiaRange(profile).hi} mmHg</dd>
            </React.Fragment>
          )}
        </dl>
      )}
    </div>
  );
}

const REC_PAGE_SIZE = 5;

function HealthPage({ warnFrac }) {
  const { useState, useEffect, useMemo } = React;
  const [profile, setProfile] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('tdex-profile'));
      if (s && s.height > 0 && s.age > 0) return s;
    } catch (e) { /* 忽略损坏数据 */ }
    return DEFAULT_PROFILE;
  });
  useEffect(() => { localStorage.setItem('tdex-profile', JSON.stringify(profile)); }, [profile]);

  const [records, setRecords] = useState(genHealthRecords);
  const [metricId, setMetricId] = useState('weight');
  const [addOpen, setAddOpen] = useState(false);
  const [gearOpen, setGearOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [openRec, setOpenRec] = useState(null);

  const range = idealRange(metricId, profile);
  const nodes = useMemo(
    () => dailyNodes(records, metricId).map((n) => ({ ...n, status: rangeStatus(n.value, idealRange(metricId, profile), warnFrac) })),
    [records, metricId, profile, warnFrac]
  );

  const addRecord = (rec) => {
    setRecords((rs) => [...rs, rec].sort((a, b) => b.ts - a.ts));
    setMetricId(rec.metric);
    setPage(0);
  };

  const pages = Math.max(1, Math.ceil(records.length / REC_PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const pageRecs = records.slice(safePage * REC_PAGE_SIZE, safePage * REC_PAGE_SIZE + REC_PAGE_SIZE);

  return (
    <div className="page health-page">
      <header className="page-head">
        <div>
          <h1>健康跟踪</h1>
          <p className="page-sub">近一个月 · {fmtDayShort(DAY0 - 30 * DAY)} – 今天</p>
        </div>
        <div className="head-actions">
          <GearButton onClick={() => setGearOpen(true)} />
          <AddButton label="新增数据" onClick={() => setAddOpen(true)} />
        </div>
      </header>

      <HealthChart nodes={nodes} range={range} metricId={metricId} setMetricId={setMetricId} warnFrac={warnFrac} />

      <div className="rec-section-head">
        <h2>测量记录</h2>
        <span className="rec-count">共 {records.length} 条</span>
      </div>
      <div className="rec-list">
        {pageRecs.map((rec) => (
          <RecordCard
            key={rec.id}
            rec={rec}
            profile={profile}
            warnFrac={warnFrac}
            open={openRec === rec.id}
            onToggle={() => setOpenRec((o) => (o === rec.id ? null : rec.id))}
          />
        ))}
      </div>
      <Pager page={safePage} pages={pages} onPage={(p) => { setPage(p); setOpenRec(null); }} />

      <ProfileDialog open={gearOpen} onClose={() => setGearOpen(false)} profile={profile} onSave={setProfile} />
      <HealthAddDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={addRecord} />
    </div>
  );
}

Object.assign(window, { HealthPage, HealthChart, RecordCard, Pager, fmtDayShort, fmtDateTime, WEEKDAYS_ZH });
