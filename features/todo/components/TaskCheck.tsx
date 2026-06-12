import { useState } from 'react';

type TaskCheckProps = {
  checked: boolean;
  ink: string;
  onToggle: () => void;
};

export function TaskCheck({ checked, ink, onToggle }: TaskCheckProps) {
  const [pulse, setPulse] = useState(false);

  return (
    <button
      type="button"
      className={`task-check${checked ? ' is-checked' : ''}${pulse ? ' is-pulsing' : ''}`}
      style={{ '--check-ink': ink } as React.CSSProperties}
      aria-label={checked ? '标记为未完成' : '标记为完成'}
      onAnimationEnd={() => setPulse(false)}
      onClick={(event) => {
        event.stopPropagation();
        setPulse(false);
        requestAnimationFrame(() => setPulse(true));
        onToggle();
      }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4.5 12.5 9.5 17.5 19.5 6.5" />
      </svg>
    </button>
  );
}
