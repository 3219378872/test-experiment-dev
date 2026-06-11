// ---- 批量删除:长按进入,卡片抖动 + 红叉多选,垃圾桶按钮确认 ------------------

// 长按手势:按住 500ms 触发;移动超过阈值或松手取消;触发后吞掉随后的 click
function useLongPress(onLongPress, disabled) {
  const { useRef } = React;
  const timer = useRef(null);
  const fired = useRef(false);
  const origin = useRef(null);
  const clear = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  if (disabled || !onLongPress) return {};
  return {
    onPointerDown: (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      fired.current = false;
      origin.current = { x: e.clientX, y: e.clientY };
      clear();
      timer.current = setTimeout(() => { fired.current = true; onLongPress(); }, 500);
    },
    onPointerMove: (e) => {
      if (!timer.current || !origin.current) return;
      if (Math.hypot(e.clientX - origin.current.x, e.clientY - origin.current.y) > 9) clear();
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onClickCapture: (e) => { if (fired.current) { e.preventDefault(); e.stopPropagation(); fired.current = false; } },
    onContextMenu: (e) => { e.preventDefault(); },
  };
}

// 批量删除状态:null = 未进入;Set = 已标记待删除的 id 集合
// 当最后一个叉号被移除(集合为空)时自动退出模式
function useBatchDelete() {
  const { useState } = React;
  const [sel, setSel] = useState(null);
  return {
    active: sel != null,
    selected: sel || new Set(),
    enter: (id) => setSel(new Set([id])),
    toggle: (id) => setSel((prev) => {
      const s = new Set(prev || []);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s.size === 0 ? null : s;
    }),
    exit: () => setSel(null),
  };
}

// 卡片右侧选择按钮:选中 = 红底白叉;未选中 = 红圈空心(点击加入批量删除)
function BatchXButton({ selected, onToggle }) {
  return (
    <button
      type="button"
      className={'batch-x' + (selected ? ' is-selected' : '')}
      aria-label={selected ? '取消删除标记' : '标记为待删除'}
      aria-pressed={selected}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="6" y1="6" x2="18" y2="18"></line>
        <line x1="18" y1="6" x2="6" y2="18"></line>
      </svg>
    </button>
  );
}

// 批量删除模式下替换右上角 + 号的红色垃圾桶按钮
function TrashButton({ onClick, count }) {
  return (
    <button type="button" className="add-btn is-danger" aria-label="删除选中项" onClick={onClick}>
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
      {count > 0 && <span className="del-count">{count}</span>}
    </button>
  );
}

// 确认删除对话框:选"是"执行删除,选"否"维持批量删除模式
function ConfirmDeleteDialog({ open, count, noun, onYes, onNo }) {
  return (
    <Modal
      open={open}
      onClose={onNo}
      title="确认删除"
      footer={
        <React.Fragment>
          <button type="button" className="btn-ghost" onClick={onNo}>否</button>
          <button type="button" className="btn-primary btn-danger" onClick={onYes}>是,删除</button>
        </React.Fragment>
      }
    >
      <p className="confirm-text">确定要删除选中的 <b>{count}</b> {noun || '项'}吗?删除后无法恢复。</p>
    </Modal>
  );
}

Object.assign(window, { useLongPress, useBatchDelete, BatchXButton, TrashButton, ConfirmDeleteDialog });
