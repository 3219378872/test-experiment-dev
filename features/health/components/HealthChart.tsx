import { useEffect, useMemo, useRef, useState } from 'react';
import { inkOn, softBg, statusDot, statusInk } from 'shared/utils/color';
import { fmtDayShort, WEEKDAYS_ZH } from 'shared/utils/format';
import { HEALTH_METRICS, idealRange, statusLabel, type DailyNode, type HealthMetricId, type HealthStatus, type Profile, type Range } from '../lib';

export type HealthChartNode = DailyNode & {
  status: HealthStatus;
};

type HealthChartProps = {
  nodes: HealthChartNode[];
  range: Range;
  metricId: HealthMetricId;
  profile: Profile;
  warnFrac?: number;
  onMetricChange: (metric: HealthMetricId) => void;
  dayEnd: number;
};

export function HealthChart({ nodes, range, metricId, profile, warnFrac = 0.2, onMetricChange, dayEnd }: HealthChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const meta = HEALTH_METRICS[metricId];
  const isWeight = metricId === 'weight';
  const width = 360;
  const height = 218;
  const left = 35;
  const right = 12;
  const top = 16;
  const bottom = 24;
  const day = 86_400_000;
  const dayStart = dayEnd - 30 * day;
  const values = nodes.map((node) => node.value);
  const minValue = Math.min(range.lo, ...values);
  const maxValue = Math.max(range.hi, ...values);
  const pad = Math.max((maxValue - minValue) * 0.14, isWeight ? 0.8 : 3);
  const vmin = minValue - pad;
  const vmax = maxValue + pad;
  const xFor = (ts: number) => left + ((ts - dayStart) / (dayEnd - dayStart)) * (width - left - right);
  const yFor = (value: number) => top + (1 - (value - vmin) / (vmax - vmin)) * (height - top - bottom);
  const fmtVal = (value: number) => (isWeight ? value.toFixed(1) : String(Math.round(value)));
  const path = nodes.map((node, index) => `${index ? 'L' : 'M'} ${xFor(node.day).toFixed(1)} ${yFor(node.value).toFixed(1)}`).join(' ');
  const yTicks = [0, 1, 2, 3].map((index) => vmin + ((vmax - vmin) * index) / 3);
  const xTicks = [0, 1, 2, 3, 4].map((index) => dayStart + ((dayEnd - dayStart) * index) / 4);
  const hovered = hover == null ? null : nodes[hover];
  const previous = hover != null && hover > 0 ? nodes[hover - 1] : null;
  const diffText = useMemo(() => {
    if (!hovered || !previous) {
      return '首个记录日';
    }

    const diff = hovered.value - previous.value;
    const pct = (diff / previous.value) * 100;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${isWeight ? diff.toFixed(1) : Math.round(diff)} ${meta.unit} (${sign}${pct.toFixed(1)}%)`;
  }, [hovered, isWeight, meta.unit, previous]);

  const scrub = (clientX: number) => {
    const element = svgRef.current;
    if (!element || nodes.length === 0) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const xSvg = ((clientX - rect.left) / rect.width) * width;
    let best = 0;
    let bestDistance = Infinity;
    nodes.forEach((node, index) => {
      const distance = Math.abs(xFor(node.day) - xSvg);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    setHover(best);
  };

  useEffect(() => {
    const element = svgRef.current;
    if (!element) {
      return undefined;
    }

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        scrub(touch.clientX);
      }
    };
    const onMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      if (touch) {
        scrub(touch.clientX);
      }
    };
    const onEnd = () => setHover(null);

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
  });

  return (
    <div className="hchart-card">
      <div className="hchart-head">
        <div className="hchart-title">
          {meta.label}趋势<small>每日均值</small>
        </div>
        <div className="metric-switch" role="tablist" aria-label="切换跟踪数据">
          {(Object.keys(HEALTH_METRICS) as HealthMetricId[]).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === metricId}
              className={`metric-btn${id === metricId ? ' is-active' : ''}`}
              style={{ '--m-soft': softBg(HEALTH_METRICS[id].hue), '--m-ink': inkOn(HEALTH_METRICS[id].hue) } as React.CSSProperties}
              onClick={() => {
                onMetricChange(id);
                setHover(null);
              }}
            >
              {HEALTH_METRICS[id].label}
            </button>
          ))}
        </div>
      </div>

      <div className="hchart-body" onMouseLeave={() => setHover(null)}>
        <svg ref={svgRef} className="hchart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${meta.label}近一个月折线图`} onMouseMove={(event) => scrub(event.clientX)}>
          {yTicks.map((value) => (
            <g key={value}>
              <line className="hchart-grid" x1={left} y1={yFor(value)} x2={width - right} y2={yFor(value)} />
              <text className="hchart-axis" x={left - 5} y={yFor(value) + 3} textAnchor="end">
                {fmtVal(value)}
              </text>
            </g>
          ))}
          {xTicks.map((tick) => (
            <text key={tick} className="hchart-axis" x={xFor(tick)} y={height - 8} textAnchor="middle">
              {fmtDayShort(tick)}
            </text>
          ))}
          <line className="hchart-band" x1={left} y1={yFor(range.hi)} x2={width - right} y2={yFor(range.hi)} />
          <line className="hchart-band" x1={left} y1={yFor(range.lo)} x2={width - right} y2={yFor(range.lo)} />
          <text className="hchart-band-label" x={width - right} y={yFor(range.hi) - 4} textAnchor="end">
            上限 {range.hi}
          </text>
          <text className="hchart-band-label" x={width - right} y={yFor(range.lo) + 11} textAnchor="end">
            下限 {range.lo}
          </text>
          <path className="hchart-line" d={path} stroke={`oklch(0.72 0.1 ${meta.hue})`} />
          {nodes.map((node, index) => (
            <circle key={node.day} className="hchart-node" cx={xFor(node.day)} cy={yFor(node.value)} r={hover === index ? 6 : 4.4} fill={statusDot(node.status)} />
          ))}
        </svg>

        {hovered ? (
          <div className="chart-tip" style={{ left: `${(xFor(hovered.day) / width) * 100}%`, top: `${(yFor(hovered.value) / height) * 100}%` }}>
            <div className="chart-tip-date">
              {fmtDayShort(hovered.day)} {WEEKDAYS_ZH[new Date(hovered.day).getDay()]} · {hovered.count} 次测量
            </div>
            <div className="chart-tip-main" style={{ color: statusInk(hovered.status) }}>
              {fmtVal(hovered.value)}
              {isWeight ? '' : ` / ${hovered.dia}`} <small>{meta.unit}</small>
            </div>
            <div className="chart-tip-row">
              <span>较前一日</span>
              <b>{diffText}</b>
            </div>
            <div className="chart-tip-row">
              <span>当前状态</span>
              <b style={{ color: statusInk(hovered.status) }}>{statusLabel(hovered.value, metricId === 'bp' ? idealRange('bp', profile) : range, warnFrac)}</b>
            </div>
            <div className="chart-tip-row">
              <span>理想区间</span>
              <b>
                {range.lo} – {range.hi} {meta.unit}
              </b>
            </div>
          </div>
        ) : null}
      </div>
      <div className="hchart-hint">在图表上滑动 / 悬停查看详情 · 虚线为理想区间{isWeight ? '' : ' (收缩压)'}</div>
    </div>
  );
}
