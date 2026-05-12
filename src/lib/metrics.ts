import type { DSAEntry, SDEntry, BehavioralEntry, MockEntry, DayLog, Story } from '../types';
import { diffDays, todayISO } from './dayIndex';

export type AllLogs = {
  dsa: DSAEntry[];
  sd: SDEntry[];
  behavioral: BehavioralEntry[];
  mocks: MockEntry[];
  dayLogs: DayLog[];
  stories: Story[];
};

export function median(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

export function withinDays<T extends { date: string }>(items: T[], days: number, ref: string = todayISO()): T[] {
  return items.filter((i) => {
    const d = diffDays(i.date, ref);
    return d >= 0 && d < days;
  });
}

export function daysSince(iso: string | undefined, ref: string = todayISO()): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  return diffDays(iso, ref);
}

export function consecutiveMissedDays(dayLogs: DayLog[], todayDayIndex: number): number {
  const completedSet = new Set(dayLogs.filter((l) => l.completed).map((l) => l.dayIndex));
  let count = 0;
  for (let i = todayDayIndex - 1; i >= 1; i--) {
    if (completedSet.has(i)) break;
    count++;
  }
  return count;
}

export function computeTargetHours(days: number): number {
  // 3h/weekday + 4h/weekend day. Weekend = Sat/Sun for the trailing window.
  // Approximation: in any rolling 7-day window, ~5 weekdays + 2 weekend days.
  // Per spec: "21 weekday + weekend" hours target — use 21 for 7-day rolling.
  if (days === 7) return 21;
  return Math.round((21 / 7) * days);
}

export function hoursThisWeek(dayLogs: DayLog[], ref: string = todayISO()): number {
  return sum(withinDays(dayLogs, 7, ref).map((l) => l.hoursLogged));
}

export function pctUnderTarget(entries: DSAEntry[], targetMinutes: number): number {
  if (!entries.length) return 0;
  const under = entries.filter((e) => e.timeMinutes <= targetMinutes).length;
  return Math.round((under / entries.length) * 100);
}

export function groupByPattern(entries: DSAEntry[]): Record<string, DSAEntry[]> {
  const out: Record<string, DSAEntry[]> = {};
  for (const e of entries) {
    (out[e.pattern] ||= []).push(e);
  }
  return out;
}
