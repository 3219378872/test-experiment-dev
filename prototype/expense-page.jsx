// ---- Expense Track 页面 ----------------------------------------------------

// 极坐标 → 直角坐标
function polar(cx, cy, r, angle) {
  const a = (angle - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

// 环形扇区 path
function arcPath(cx, cy, r0, r1, a0, a1) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}

// 通用甜甜圈饼图:slices = [{ id, label, value, hue }]
// 点击放大;hover/触摸 摘出扇形 + 浮动 tooltip
function DonutChart({ slices, centerTitle, centerValue }) {
  const { useState, useRef, useEffect } = React;
  const [zoomed, setZoomed] = useState(false);
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);
  const wrapRef = useRef(null);

  const total = slices.reduce((s, x) => s + x.value, 0);
  const SIZE = 300, CX = 150, CY = 150;
  const R1 = 118, R0 = 64, GAP = 1.6, PULL = 10;

  let acc = 0;
  const segs = slices.map((s) => {
    const sweep = total > 0 ? (s.value / total) * 360 : 0;
    const seg = { ...s, a0: acc + GAP / 2, a1: acc + sweep - GAP / 2, mid: acc + sweep / 2, pct: total > 0 ? s.value / total : 0 };
    acc += sweep;
    return seg;
  });

  const hovered = segs.find((s) => s.id === hover) || null;

  const onMove = (e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    setTip({ x: pt.clientX - rect.left, y: pt.clientY - rect.top });
  };

  // 触控:仅拦截"滑动"(touchmove preventDefault),不拦截轻点,
  // 这样点击放大/收回的 click 仍能正常触发;滑动时用 elementFromPoint 追踪扇区
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const track = (e) => {
      const pt = e.touches[0]; if (!pt) return;
      const rect = el.getBoundingClientRect();
      setTip({ x: pt.clientX - rect.left, y: pt.clientY - rect.top });
      const t = document.elementFromPoint(pt.clientX, pt.clientY);
      const id = t && t.getAttribute ? t.getAttribute('data-slice-id') : null;
      if (id) setHover(id);
    };
    const onStart = (e) => { track(e); };                       // 轻点:不阻止默认,保留 click
    const onMove = (e) => { e.preventDefault(); track(e); };    // 滑动:拦截页面滚动
    const onEnd = () => { setHover(null); setTip(null); };      // 离手:恢复无详情的原始状态
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={'donut-wrap' + (zoomed ? ' is-zoomed' : '')}
      onMouseMove={onMove}
      onMouseLeave={() => { setHover(null); setTip(null); }}
    >
      <svg
        className="donut-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="支出占比饼图"
        onClick={() => setZoomed((z) => !z)}
      >
        {segs.map((s) => {
          const isH = hover === s.id;
          const [dx, dy] = isH ? polar(0, 0, PULL, s.mid) : [0, 0];
          return (
            <path
              key={s.id}
              data-slice-id={s.id}
              d={arcPath(CX, CY, R0, R1, s.a0, Math.max(s.a1, s.a0 + 0.5))}
              fill={isH ? sliceFillHover(s.hue) : sliceFill(s.hue)}
              className="donut-slice"
              style={{ transform: `translate(${dx}px, ${dy}px)` }}
              onMouseEnter={() => setHover(s.id)}
            ></path>
          );
        })}
        <text x={CX} y={CY - 8} textAnchor="middle" className="donut-center-title">{centerTitle}</text>
        <text x={CX} y={CY + 22} textAnchor="middle" className="donut-center-value">{centerValue}</text>
      </svg>

      {hovered && tip && (
        <div
          className="donut-tip"
          style={{ left: tip.x, top: tip.y, '--tip-ink': inkOn(hovered.hue), '--tip-chip': sliceFill(hovered.hue) }}
        >
          <div className="donut-tip-tag"><i></i>{hovered.label}</div>
          <div className="donut-tip-pct">{(hovered.pct * 100).toFixed(1)}%</div>
          <div className="donut-tip-amt">{fmtYuan(hovered.value)}</div>
        </div>
      )}
      <div className="donut-hint">{zoomed ? '点击饼图还原' : '点击饼图放大 · 悬停查看明细'}</div>
    </div>
  );
}

// 支出卡片(tag 级与明细级共用,depth 控制配色微调)
function ExpenseCard({ glyph, hue, title, note, amount, pct, depth, onClick, batch, batchId, shakeDelay }) {
  const inBatch = !!(batch && batch.active);
  const lp = useLongPress(batch ? () => batch.enter(batchId) : null, inBatch);
  const bg = depth === 0 ? softBg(hue) : `oklch(0.97 0.018 ${hue})`;
  const chipBg = depth === 0 ? softBg2(hue) : softBg(hue);
  const Tag = onClick && !inBatch ? 'button' : 'div';
  return (
    <Tag
      className={'expense-card' + (onClick && !inBatch ? ' is-clickable' : '') + (inBatch ? ' is-shaking' : '')}
      style={{ background: bg, '--card-hue': hue, animationDelay: inBatch ? shakeDelay : undefined }}
      onClick={inBatch ? undefined : onClick}
      {...lp}
    >
      <div className="expense-chip" style={{ background: chipBg, color: inkOn(hue) }}>{glyph}</div>
      <div className="expense-text">
        <div className="expense-title">{title}</div>
        <div className="expense-note">{note}</div>
      </div>
      <div className="expense-right">
        <div className="expense-amt">{fmtYuan(amount)}</div>
        <div className="expense-pct" style={{ color: inkOn(hue) }}>{(pct * 100).toFixed(1)}%</div>
      </div>
      {inBatch ? (
        <BatchXButton selected={batch.selected.has(batchId)} onToggle={() => batch.toggle(batchId)} />
      ) : onClick && (
        <svg className="expense-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 5 16 12 9 19"></polyline>
        </svg>
      )}
    </Tag>
  );
}

function ExpensePage() {
  const { useState } = React;
  const [tags, setTags] = useState(EXPENSE_TAGS);
  const [openTag, setOpenTag] = useState(null);   // tag id 或 null
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);   // { tagId, index } 或 null
  const batchTags = useBatchDelete();             // 总览:分类卡批量删除
  const batchItems = useBatchDelete();            // 明细:单笔批量删除
  const [confirmTags, setConfirmTags] = useState(false);
  const [confirmItems, setConfirmItems] = useState(false);

  const addItem = ({ tagId, name, amount, date }) =>
    setTags((ts) => ts.map((t) => (t.id === tagId ? { ...t, items: [...t.items, { name, amount, date }] } : t)));

  // 编辑一笔:同 tag 原位替换;换 tag 则从原处移除并追加到新 tag
  const updateItem = ({ fromTag, index, tagId, name, amount, date }) =>
    setTags((ts) => {
      if (fromTag === tagId) {
        return ts.map((t) => (t.id === tagId ? { ...t, items: t.items.map((it, i) => (i === index ? { name, amount, date } : it)) } : t));
      }
      return ts.map((t) => {
        if (t.id === fromTag) return { ...t, items: t.items.filter((_, i) => i !== index) };
        if (t.id === tagId) return { ...t, items: [...t.items, { name, amount, date }] };
        return t;
      });
    });

  const deleteTags = (ids) =>
    setTags((ts) => ts.filter((t) => !ids.includes(t.id)));

  const deleteItems = (tagId, idxs) =>
    setTags((ts) => ts.map((t) => (t.id === tagId ? { ...t, items: t.items.filter((_, i) => !idxs.includes(i)) } : t)));

  const grandTotal = tags.reduce((s, t) => s + tagTotal(t), 0);
  const tag = openTag ? tags.find((t) => t.id === openTag) : null;
  const editTag = editing ? tags.find((t) => t.id === editing.tagId) : null;
  const editItem = editTag && editTag.items[editing.index]
    ? { ...editTag.items[editing.index], tagId: editing.tagId, index: editing.index }
    : null;

  if (!tag) {
    // ---- 总览:大饼 + tag 卡片 ----
    const slices = tags.map((t) => ({ id: t.id, label: t.label, value: tagTotal(t), hue: t.hue }));
    return (
      <div className="page expense-page">
        <header className="page-head">
          <div>
            <h1>本月支出</h1>
            <p className="page-sub">6 月 1 日 – 今天</p>
          </div>
          {batchTags.active ? (
            <TrashButton count={batchTags.selected.size} onClick={() => setConfirmTags(true)} />
          ) : tags.length > 0 ? (
            <AddButton label="记一笔" onClick={() => setDialogOpen(true)} />
          ) : null}
        </header>
        <DonutChart slices={slices} centerTitle="总支出" centerValue={fmtYuan(grandTotal)} />
        <div className="expense-list">
          {tags.map((t, i) => {
            const total = tagTotal(t);
            return (
              <ExpenseCard
                key={t.id}
                glyph={t.glyph}
                hue={t.hue}
                title={t.label}
                note={`${t.items.length} 笔开销`}
                amount={total}
                pct={grandTotal > 0 ? total / grandTotal : 0}
                depth={0}
                onClick={() => setOpenTag(t.id)}
                batch={batchTags}
                batchId={t.id}
                shakeDelay={-(i % 3) * 0.1 + 's'}
              />
            );
          })}
        </div>
        <ExpenseAddDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={addItem} tags={tags} initialTag={null} />
        <ConfirmDeleteDialog
          open={confirmTags}
          count={batchTags.selected.size}
          noun="个分类"
          onNo={() => setConfirmTags(false)}
          onYes={() => { deleteTags([...batchTags.selected]); setConfirmTags(false); batchTags.exit(); }}
        />
      </div>
    );
  }

  // ---- 明细:该 tag 的每笔开销,结构与外层一致,配色微调 ----
  const total = tagTotal(tag);
  const slices = tag.items.map((it, i) => ({
    id: tag.id + '-' + i,
    label: it.name,
    value: it.amount,
    hue: (tag.hue + i * 16) % 360,
  }));
  return (
    <div className="page expense-page expense-detail" style={{ '--detail-hue': tag.hue }}>
      <header className="page-head detail-head">
        <div className="detail-left">
          <button className="back-btn" onClick={() => { setOpenTag(null); batchItems.exit(); }} aria-label="返回支出总览">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 5 8 12 15 19"></polyline>
            </svg>
          </button>
          <div>
            <h1>{tag.label}支出</h1>
            <p className="page-sub">占总支出 {((total / grandTotal) * 100).toFixed(1)}% · 共 {tag.items.length} 笔</p>
          </div>
        </div>
        {batchItems.active ? (
          <TrashButton count={batchItems.selected.size} onClick={() => setConfirmItems(true)} />
        ) : (
          <AddButton label={'记一笔' + tag.label} onClick={() => setDialogOpen(true)} />
        )}
      </header>
      <DonutChart slices={slices} centerTitle={tag.label} centerValue={fmtYuan(total)} />
      <div className="expense-list">
        {tag.items.map((it, i) => (
          <ExpenseCard
            key={i}
            glyph={tag.glyph}
            hue={slices[i].hue}
            title={it.name}
            note={it.date}
            amount={it.amount}
            pct={total > 0 ? it.amount / total : 0}
            depth={1}
            onClick={() => setEditing({ tagId: tag.id, index: i })}
            batch={batchItems}
            batchId={i}
            shakeDelay={-(i % 3) * 0.1 + 's'}
          />
        ))}
      </div>
      <ExpenseAddDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={addItem} tags={tags} initialTag={tag.id} />
      <ExpenseAddDialog open={!!editItem} onClose={() => setEditing(null)} onSave={updateItem} editItem={editItem} tags={tags} initialTag={tag.id} />
      <ConfirmDeleteDialog
        open={confirmItems}
        count={batchItems.selected.size}
        noun="笔开销"
        onNo={() => setConfirmItems(false)}
        onYes={() => { deleteItems(tag.id, [...batchItems.selected]); setConfirmItems(false); batchItems.exit(); }}
      />
    </div>
  );
}

Object.assign(window, { DonutChart, ExpenseCard, ExpensePage, polar, arcPath });
