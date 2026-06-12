import { inkOn, sliceFill, softBg2 } from 'shared/utils/color';

export type TypePickerOption<TId extends string = string> = {
  id: TId;
  label: string;
  glyph: string;
  hue: number;
};

type TypePickerProps<TId extends string> = {
  options: readonly TypePickerOption<TId>[];
  value: TId;
  onChange: (value: TId) => void;
};

export function TypePicker<TId extends string>({ options, value, onChange }: TypePickerProps<TId>) {
  const selected = options.find((option) => option.id === value) ?? options[0];

  if (!selected) {
    return null;
  }

  return (
    <div className="type-picker">
      <div className="type-big" style={{ background: softBg2(selected.hue), color: inkOn(selected.hue) }}>
        <span className="type-big-glyph">{selected.glyph}</span>
        <span className="type-big-label">{selected.label}</span>
      </div>
      <div className="type-dots" role="tablist" aria-label="类型选择">
        {options.map((option) => (
          <button
            aria-label={option.label}
            aria-selected={option.id === selected.id}
            className={`type-dot${option.id === selected.id ? ' is-active' : ''}`}
            key={option.id}
            onClick={() => onChange(option.id)}
            role="tab"
            style={
              {
                background: softBg2(option.hue),
                color: inkOn(option.hue),
                '--dot-ring': sliceFill(option.hue),
              } as React.CSSProperties
            }
            type="button"
          >
            {option.glyph}
          </button>
        ))}
      </div>
    </div>
  );
}
