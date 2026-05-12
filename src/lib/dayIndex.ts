export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISO(iso: string): Date {
  return new Date(iso + 'T00:00:00');
}

export function diffDays(fromISO: string, toISO: string): number {
  const from = parseISO(fromISO);
  const to = parseISO(toISO);
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeDayIndex(startDateISO: string, today: Date = new Date()): number {
  const todayStr = todayISO(today);
  const delta = diffDays(startDateISO, todayStr);
  return Math.min(70, Math.max(1, delta + 1));
}

export function clampDayIndex(n: number): number {
  return Math.min(70, Math.max(1, n));
}
