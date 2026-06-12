import { useEffect, useRef, useState } from 'react';
import { inkOn, sliceFill, sliceFillHover } from 'shared/utils/color';
import { fmtYuan } from 'shared/utils/format';
import { arcPath, buildDonutSegments, polar, type ExpenseSlice } from '../lib';

type DonutChartProps = {
  slices: ExpenseSlice[];
  centerTitle: string;
  centerValue: string;
};

type Point = {
  x: number;
  y: number;
};

export function DonutChart({ slices, centerTitle, centerValue }: DonutChartProps) {
  const [zoomed, setZoomed] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [tip, setTip] = useState<Point | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const segments = buildDonutSegments(slices);
  const hovered = segments.find((segment) => segment.id === hover) ?? null;
  const size = 300;
  const cx = 150;
  const cy = 150;
  const r1 = 118;
  const r0 = 64;
  const pull = 10;

  const trackPointer = (clientX: number, clientY: number) => {
    if (!wrapRef.current) {
      return;
    }

    const rect = wrapRef.current.getBoundingClientRect();
    setTip({ x: clientX - rect.left, y: clientY - rect.top });
  };

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) {
      return undefined;
    }

    const track = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      trackPointer(touch.clientX, touch.clientY);
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const id = target instanceof Element ? target.getAttribute('data-slice-id') : null;
      if (id) {
        setHover(id);
      }
    };
    const onStart = (event: TouchEvent) => track(event);
    const onMove = (event: TouchEvent) => {
      event.preventDefault();
      track(event);
    };
    const onEnd = () => {
      setHover(null);
      setTip(null);
    };

    element.addEventListener('touchstart', onStart, { passive: true });
    element.addEventListener('touchmove', onMove, { passive: false });
    element.addEventListener('touchend', onEnd);
    element.addEventListener('touchcancel', onEnd);
    return () => {
      element.removeEventListener('touchstart', onStart);
      element.removeEventListener('touchmove', onMove);
      element.removeEventListener('touchend', onEnd);
      element.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`donut-wrap${zoomed ? ' is-zoomed' : ''}`}
      onMouseMove={(event) => trackPointer(event.clientX, event.clientY)}
      onMouseLeave={() => {
        setHover(null);
        setTip(null);
      }}
    >
      <svg className="donut-svg" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="支出占比饼图" onClick={() => setZoomed((value) => !value)}>
        {segments.map((segment) => {
          const isHovered = hover === segment.id;
          const [dx, dy] = isHovered ? polar(0, 0, pull, segment.mid) : [0, 0];
          return (
            <path
              key={segment.id}
              data-slice-id={segment.id}
              d={arcPath(cx, cy, r0, r1, segment.a0, Math.max(segment.a1, segment.a0 + 0.5))}
              fill={isHovered ? sliceFillHover(segment.hue) : sliceFill(segment.hue)}
              className="donut-slice"
              style={{ transform: `translate(${dx}px, ${dy}px)` }}
              onMouseEnter={() => setHover(segment.id)}
            />
          );
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" className="donut-center-title">
          {centerTitle}
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle" className="donut-center-value">
          {centerValue}
        </text>
      </svg>

      {hovered && tip ? (
        <div className="donut-tip" style={{ left: tip.x, top: tip.y, '--tip-ink': inkOn(hovered.hue), '--tip-chip': sliceFill(hovered.hue) } as React.CSSProperties}>
          <div className="donut-tip-tag">
            <i />
            {hovered.label}
          </div>
          <div className="donut-tip-pct">{(hovered.pct * 100).toFixed(1)}%</div>
          <div className="donut-tip-amt">{fmtYuan(hovered.value)}</div>
        </div>
      ) : null}
      <div className="donut-hint">{zoomed ? '点击饼图还原' : '点击饼图放大 · 悬停查看明细'}</div>
    </div>
  );
}
