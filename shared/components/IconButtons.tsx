type IconButtonProps = {
  label: string;
  onClick: () => void;
};

export function AddButton({ label, onClick }: IconButtonProps) {
  return (
    <button type="button" className="add-btn" aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}

export function GearButton({ label, onClick }: IconButtonProps) {
  return (
    <button type="button" className="add-btn" aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.2 2.2 0 0 1-3.11 3.11l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.09 1.65v.12a2.2 2.2 0 0 1-4.4 0v-.06A1.8 1.8 0 0 0 8.1 19.8a1.8 1.8 0 0 0-1.98.36l-.04.04a2.2 2.2 0 0 1-3.11-3.11l.04-.04A1.8 1.8 0 0 0 3.37 15 1.8 1.8 0 0 0 1.72 13.9H1.6a2.2 2.2 0 0 1 0-4.4h.06A1.8 1.8 0 0 0 3.3 8.42a1.8 1.8 0 0 0-.36-1.98l-.04-.04a2.2 2.2 0 0 1 3.11-3.11l.04.04a1.8 1.8 0 0 0 1.98.36h.02A1.8 1.8 0 0 0 9.1 2.04V1.9a2.2 2.2 0 0 1 4.4 0v.06a1.8 1.8 0 0 0 1.08 1.64 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.2 2.2 0 0 1 3.11 3.11l-.04.04a1.8 1.8 0 0 0-.36 1.98v.02A1.8 1.8 0 0 0 20.96 9.4h.14a2.2 2.2 0 0 1 0 4.4h-.06A1.8 1.8 0 0 0 19.4 15Z" />
      </svg>
    </button>
  );
}

type TrashButtonProps = {
  count: number;
  onClick: () => void;
};

export function TrashButton({ count, onClick }: TrashButtonProps) {
  return (
    <button type="button" className="add-btn is-danger" aria-label="删除选中项" onClick={onClick}>
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
      {count > 0 ? <span className="del-count">{count}</span> : null}
    </button>
  );
}
