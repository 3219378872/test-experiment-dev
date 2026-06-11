// ---- 共享数据与工具 -------------------------------------------------------
const NOW0 = Date.now();
const HOUR = 3600e3;
const DAY = 24 * HOUR;

// 任务分类:单字图标 + 色相(oklch hue)
const TASK_CATS = {
  work:   { label: '工作', glyph: '工', hue: 55  },
  life:   { label: '生活', glyph: '生', hue: 25  },
  study:  { label: '学习', glyph: '学', hue: 260 },
  health: { label: '健康', glyph: '健', hue: 155 },
};

// createdAt / startAt / dueAt 都相对当前时间生成,保证演示状态稳定
const INITIAL_TASKS = [
  { id: 't1', cat: 'work',   text: '整理本周周报并发送给组内', createdAt: NOW0 - 5 * HOUR,  startAt: NOW0 - 1.5 * HOUR, dueAt: NOW0 + 2.5 * HOUR, done: false },
  { id: 't2', cat: 'study',  text: '背 50 个雅思核心词汇',     createdAt: NOW0 - 8 * HOUR,  startAt: NOW0 - 4 * HOUR,   dueAt: NOW0 + 1.2 * HOUR, done: false },
  { id: 't3', cat: 'work',   text: '准备明早产品评审会材料',   createdAt: NOW0 - 2 * HOUR,  startAt: NOW0 + 3 * HOUR,   dueAt: NOW0 + 9 * HOUR,   done: false },
  { id: 't4', cat: 'life',   text: '给爸妈打个电话',           createdAt: NOW0 - 1 * HOUR,  startAt: NOW0 + 7 * HOUR,   dueAt: NOW0 + 12 * HOUR,  done: false },
  { id: 't5', cat: 'life',   text: '转账交本月房租',           createdAt: NOW0 - 2 * DAY,   startAt: NOW0 - 1 * DAY,    dueAt: NOW0 - 5 * HOUR,   done: false },
  { id: 't6', cat: 'study',  text: '提交数据结构课程作业',     createdAt: NOW0 - 3 * DAY,   startAt: NOW0 - 2 * DAY,    dueAt: NOW0 - 1 * DAY,    done: false },
  { id: 't7', cat: 'health', text: '晨跑 5 公里',              createdAt: NOW0 - 10 * HOUR, startAt: NOW0 - 9 * HOUR,   dueAt: NOW0 - 6 * HOUR,   done: true  },
];

// 任务时间状态
function taskStatus(task, now) {
  if (task.done) return 'done';
  if (now < task.startAt) return 'upcoming';   // 绿:尚未开始
  if (now <= task.dueAt) return 'active';      // 黄:正在进行
  return 'overdue';                            // 红:已过期
}

// 当前阶段剩余时间比例 (1 → 0)
// upcoming: createdAt → startAt 的剩余;active: startAt → dueAt 的剩余
function taskRemainRatio(task, now) {
  const st = taskStatus(task, now);
  let a, b;
  if (st === 'upcoming') { a = task.createdAt; b = task.startAt; }
  else if (st === 'active') { a = task.startAt; b = task.dueAt; }
  else return 0;
  const total = Math.max(b - a, 1);
  return Math.min(1, Math.max(0, (b - now) / total));
}

function fmtDuration(ms) {
  if (ms <= 0) return '0 分钟';
  const m = Math.round(ms / 60e3);
  if (m < 60) return `${m} 分钟`;
  const h = Math.floor(m / 60), mm = m % 60;
  if (h < 24) return mm ? `${h} 小时 ${mm} 分` : `${h} 小时`;
  const d = Math.floor(h / 24), hh = h % 24;
  return hh ? `${d} 天 ${hh} 小时` : `${d} 天`;
}

// 任务状态副标题
function taskTimeNote(task, now) {
  const st = taskStatus(task, now);
  if (st === 'done') return '已完成';
  if (st === 'upcoming') return `${fmtDuration(task.startAt - now)}后开始`;
  if (st === 'active') return `剩余 ${fmtDuration(task.dueAt - now)}`;
  return `已逾期 ${fmtDuration(now - task.dueAt)}`;
}

// ---- 支出数据 --------------------------------------------------------------
// 每个 tag: { id, label, glyph, hue, items: [{ name, amount, date }] }
const EXPENSE_TAGS = [
  {
    id: 'food', label: '饮食', glyph: '食', hue: 40,
    items: [
      { name: '楼下早餐铺', amount: 86,  date: '6.02 – 6.10' },
      { name: '公司午餐',   amount: 312, date: '6.01 – 6.10' },
      { name: '周末火锅',   amount: 268, date: '6.07' },
      { name: '咖啡 ×6',    amount: 132, date: '本月累计' },
      { name: '水果生鲜',   amount: 154, date: '6.03 / 6.08' },
    ],
  },
  {
    id: 'transport', label: '交通', glyph: '行', hue: 230,
    items: [
      { name: '地铁通勤', amount: 118, date: '本月累计' },
      { name: '打车 ×3',  amount: 97,  date: '6.02 / 6.05 / 6.09' },
      { name: '共享单车', amount: 25,  date: '月卡' },
    ],
  },
  {
    id: 'home', label: '居住', glyph: '住', hue: 150,
    items: [
      { name: '房租',   amount: 2300, date: '6.01' },
      { name: '水电燃', amount: 186,  date: '6.05' },
      { name: '宽带',   amount: 60,   date: '6.01' },
    ],
  },
  {
    id: 'fun', label: '娱乐', glyph: '娱', hue: 320,
    items: [
      { name: '电影 ×2',   amount: 98,  date: '6.06' },
      { name: '游戏内购',  amount: 68,  date: '6.04' },
      { name: '视频会员',  amount: 30,  date: '6.01' },
    ],
  },
  {
    id: 'shopping', label: '购物', glyph: '购', hue: 280,
    items: [
      { name: 'T 恤 ×2',  amount: 218, date: '6.03' },
      { name: '蓝牙耳机', amount: 399, date: '6.08' },
      { name: '日用品',   amount: 117, date: '6.02 / 6.09' },
    ],
  },
];

// ---- 健康数据 --------------------------------------------------------------
const DEFAULT_PROFILE = { gender: 'male', age: 28, height: 175, weight: 68 };

const HEALTH_METRICS = {
  weight: { label: '体重', glyph: '重', hue: 200, unit: 'kg' },
  bp:     { label: '血压', glyph: '压', hue: 10,  unit: 'mmHg' },
};

// 根据资料计算理想区间(体重按 BMI 18.5–23.9;血压按年龄分档)
function idealRange(metric, profile) {
  if (metric === 'weight') {
    const h = profile.height / 100;
    return { lo: +(18.5 * h * h).toFixed(1), hi: +(23.9 * h * h).toFixed(1) };
  }
  // bp = 收缩压
  const hi = profile.age < 45 ? 120 : profile.age < 60 ? 130 : 140;
  return { lo: 90, hi };
}
function bpDiaRange(profile) {
  const hi = profile.age < 45 ? 80 : profile.age < 60 ? 85 : 90;
  return { lo: 60, hi };
}

// 三态:bad = 超出区间;warn = 距边界不足 warnFrac(默认 20%)区间宽度;good = 其余
function rangeStatus(v, r, warnFrac = 0.2) {
  if (v < r.lo || v > r.hi) return 'bad';
  const m = (r.hi - r.lo) * warnFrac;
  if (v < r.lo + m || v > r.hi - m) return 'warn';
  return 'good';
}
function statusLabel(v, r, warnFrac = 0.2) {
  const st = rangeStatus(v, r, warnFrac);
  if (st === 'bad') return v > r.hi ? '偏高' : '偏低';
  if (st === 'warn') return v > (r.lo + r.hi) / 2 ? '接近上限' : '接近下限';
  return '理想';
}
const STATUS_RANK = { good: 0, warn: 1, bad: 2 };
const STATUS_HUE = { good: 152, warn: 85, bad: 25 };
const statusDot  = (st) => `oklch(${st === 'warn' ? 0.78 : st === 'good' ? 0.68 : 0.6} ${st === 'warn' ? 0.14 : 0.16} ${STATUS_HUE[st]})`;
const statusInk  = (st) => `oklch(0.45 0.11 ${STATUS_HUE[st]})`;
const statusSoft = (st) => `oklch(0.94 0.05 ${STATUS_HUE[st]})`;

// 记录整体状态:血压取收缩/舒张中较差者
function recStatus(rec, profile, warnFrac = 0.2) {
  if (rec.metric === 'weight') return rangeStatus(rec.value, idealRange('weight', profile), warnFrac);
  const s1 = rangeStatus(rec.value, idealRange('bp', profile), warnFrac);
  const s2 = rangeStatus(rec.dia, bpDiaRange(profile), warnFrac);
  return STATUS_RANK[s2] > STATUS_RANK[s1] ? s2 : s1;
}
function recStatusText(rec, profile, warnFrac = 0.2) {
  if (rec.metric === 'weight') return statusLabel(rec.value, idealRange('weight', profile), warnFrac);
  const sr = idealRange('bp', profile), dr = bpDiaRange(profile);
  const s1 = rangeStatus(rec.value, sr, warnFrac), s2 = rangeStatus(rec.dia, dr, warnFrac);
  if (s1 === 'good' && s2 === 'good') return '理想';
  return STATUS_RANK[s2] > STATUS_RANK[s1]
    ? '舒张压' + statusLabel(rec.dia, dr, warnFrac)
    : '收缩压' + statusLabel(rec.value, sr, warnFrac);
}

// 生成近 30 天演示测量记录(确定性伪随机,保证演示稳定)
const __dayAnchor = new Date(NOW0); __dayAnchor.setHours(0, 0, 0, 0);
const DAY0 = __dayAnchor.getTime();

function genHealthRecords() {
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const recs = [];
  const days = 30;
  for (let d = days; d >= 0; d--) {
    const day0 = DAY0 - d * DAY;
    if (rnd() > 0.15) {
      const n = rnd() > 0.75 ? 2 : 1;
      for (let k = 0; k < n; k++) {
        const v = 68.4 + Math.sin((days - d) / 5) * 3.4 + (rnd() - 0.5) * 2;
        const ts = day0 + (7 + k * 12 + rnd() * 2) * HOUR;
        if (ts > NOW0) continue;
        recs.push({ id: 'w' + d + '-' + k, metric: 'weight', ts, value: +v.toFixed(1) });
      }
    }
    if (rnd() > 0.2) {
      const n = rnd() > 0.7 ? 2 : 1;
      for (let k = 0; k < n; k++) {
        const sys = Math.round(112 + Math.sin((days - d) / 4 + 2) * 11 + (rnd() - 0.5) * 8);
        const dia = Math.round(sys * 0.63 + (rnd() - 0.5) * 7);
        const ts = day0 + (8 + k * 11 + rnd() * 2) * HOUR;
        if (ts > NOW0) continue;
        recs.push({ id: 'b' + d + '-' + k, metric: 'bp', ts, value: sys, dia });
      }
    }
  }
  return recs.sort((a, b) => b.ts - a.ts);
}

// 按天聚合为日均值节点(升序)
function dailyNodes(records, metric) {
  const byDay = new Map();
  records.forEach((r) => {
    if (r.metric !== metric) return;
    const d = new Date(r.ts); d.setHours(0, 0, 0, 0);
    const k = d.getTime();
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(r);
  });
  const avg = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
  return [...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([day, rs]) => ({
    day,
    value: metric === 'weight' ? +avg(rs.map((r) => r.value)).toFixed(1) : Math.round(avg(rs.map((r) => r.value))),
    dia: metric === 'bp' ? Math.round(avg(rs.map((r) => r.dia))) : null,
    count: rs.length,
  }));
}

const tagTotal = (tag) => tag.items.reduce((s, it) => s + it.amount, 0);
const fmtYuan = (n) => '¥' + n.toLocaleString('zh-CN');

// 颜色工具:基于 hue 生成柔和卡底 / 深色文字 / 饼图扇区色
const softBg   = (hue) => `oklch(0.95 0.035 ${hue})`;
const softBg2  = (hue) => `oklch(0.92 0.055 ${hue})`;
const inkOn    = (hue) => `oklch(0.42 0.09 ${hue})`;
const sliceFill = (hue) => `oklch(0.78 0.11 ${hue})`;
const sliceFillHover = (hue) => `oklch(0.72 0.14 ${hue})`;

Object.assign(window, {
  NOW0, HOUR, DAY,
  TASK_CATS, INITIAL_TASKS,
  taskStatus, taskRemainRatio, taskTimeNote, fmtDuration,
  EXPENSE_TAGS, tagTotal, fmtYuan,
  softBg, softBg2, inkOn, sliceFill, sliceFillHover,
  DEFAULT_PROFILE, HEALTH_METRICS, DAY0,
  idealRange, bpDiaRange, rangeStatus, statusLabel,
  STATUS_RANK, STATUS_HUE, statusDot, statusInk, statusSoft,
  recStatus, recStatusText, genHealthRecords, dailyNodes,
});
