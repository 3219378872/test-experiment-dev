export const WEEKDAYS_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const;

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function fmtDuration(ms: number): string {
  if (ms <= 0) {
    return '0 分钟';
  }

  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins ? `${hours} 小时 ${mins} 分` : `${hours} 小时`;
  }

  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours ? `${days} 天 ${restHours} 小时` : `${days} 天`;
}

export function fmtYuan(value: number): string {
  return `¥${value.toLocaleString('zh-CN')}`;
}

export function fmtDayShort(ts: number): string {
  const date = new Date(ts);
  return `${date.getMonth() + 1}.${pad2(date.getDate())}`;
}

export function fmtDateTime(ts: number): string {
  const date = new Date(ts);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAYS_ZH[date.getDay()]} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}
