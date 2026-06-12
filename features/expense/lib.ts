export type ExpenseItem = {
  name: string;
  amount: number;
  date: string;
};

export type ExpenseTag = {
  id: string;
  label: string;
  glyph: string;
  hue: number;
  items: ExpenseItem[];
};

export type ExpenseSlice = {
  id: string;
  label: string;
  value: number;
  hue: number;
};

export type DonutSegment = ExpenseSlice & {
  a0: number;
  a1: number;
  mid: number;
  pct: number;
};

export function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(radians), cy + r * Math.sin(radians)];
}

export function arcPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}

export function tagTotal(tag: ExpenseTag): number {
  return tag.items.reduce((sum, item) => sum + item.amount, 0);
}

export function amountPct(value: number, total: number): number {
  return total > 0 ? value / total : 0;
}

export function itemHue(tagHue: number, index: number): number {
  return (tagHue + index * 16) % 360;
}

export function buildDonutSegments(slices: readonly ExpenseSlice[], gap = 1.6): DonutSegment[] {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let acc = 0;

  return slices.map((slice) => {
    const sweep = total > 0 ? (slice.value / total) * 360 : 0;
    const segment = {
      ...slice,
      a0: acc + gap / 2,
      a1: acc + sweep - gap / 2,
      mid: acc + sweep / 2,
      pct: amountPct(slice.value, total),
    };
    acc += sweep;
    return segment;
  });
}

export function formatExpenseDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${Number(month)}.${day}`;
}

export const EXPENSE_SEED_TAGS: ExpenseTag[] = [
  {
    id: 'food',
    label: '饮食',
    glyph: '食',
    hue: 40,
    items: [
      { name: '楼下早餐铺', amount: 86, date: '6.02 – 6.10' },
      { name: '公司午餐', amount: 312, date: '6.01 – 6.10' },
      { name: '周末火锅', amount: 268, date: '6.07' },
      { name: '咖啡 ×6', amount: 132, date: '本月累计' },
      { name: '水果生鲜', amount: 154, date: '6.03 / 6.08' },
    ],
  },
  {
    id: 'transport',
    label: '交通',
    glyph: '行',
    hue: 230,
    items: [
      { name: '地铁通勤', amount: 118, date: '本月累计' },
      { name: '打车 ×3', amount: 97, date: '6.02 / 6.05 / 6.09' },
      { name: '共享单车', amount: 25, date: '月卡' },
    ],
  },
  {
    id: 'home',
    label: '居住',
    glyph: '住',
    hue: 150,
    items: [
      { name: '房租', amount: 2300, date: '6.01' },
      { name: '水电燃', amount: 186, date: '6.05' },
      { name: '宽带', amount: 60, date: '6.01' },
    ],
  },
  {
    id: 'fun',
    label: '娱乐',
    glyph: '娱',
    hue: 320,
    items: [
      { name: '电影 ×2', amount: 98, date: '6.06' },
      { name: '游戏内购', amount: 68, date: '6.04' },
      { name: '视频会员', amount: 30, date: '6.01' },
    ],
  },
  {
    id: 'shopping',
    label: '购物',
    glyph: '购',
    hue: 280,
    items: [
      { name: 'T 恤 ×2', amount: 218, date: '6.03' },
      { name: '蓝牙耳机', amount: 399, date: '6.08' },
      { name: '日用品', amount: 117, date: '6.02 / 6.09' },
    ],
  },
];
