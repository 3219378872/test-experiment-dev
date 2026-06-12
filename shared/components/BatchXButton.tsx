type BatchXButtonProps = {
  selected: boolean;
  onToggle: () => void;
};

export function BatchXButton({ selected, onToggle }: BatchXButtonProps) {
  return (
    <button
      type="button"
      className={`batch-x${selected ? ' is-selected' : ''}`}
      aria-label={selected ? '取消删除标记' : '标记为待删除'}
      aria-pressed={selected}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </button>
  );
}
