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
});
