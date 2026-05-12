import type { DayPlan, Warning } from '../types';
import {
  type AllLogs,
  median,
  withinDays,
  daysSince,
  consecutiveMissedDays,
  hoursThisWeek,
  computeTargetHours,
} from './metrics';

export function detectDrift(today: DayPlan, logs: AllLogs): Warning[] {
  const warnings: Warning[] = [];

  // 1. DS&A speed: median time over last 7 days vs target.
  const last7Dsa = withinDays(logs.dsa, 7);
  if (last7Dsa.length >= 3) {
    const med = median(last7Dsa.map((p) => p.timeMinutes));
    const target = today.targets.dsa.targetMinutes;
    if (med > target + 5) {
      const slowPatterns = Array.from(
        new Set(last7Dsa.filter((p) => p.timeMinutes > target).map((p) => p.pattern))
      ).slice(0, 3);
      const tail = slowPatterns.length ? `. Slow on: ${slowPatterns.join(', ')}.` : '';
      warnings.push({
        severity: 'medium',
        message: `DS&A median time is ${Math.round(med)}m; target is ${target}m${tail}`,
      });
    }
  }

  // 2. Mock cadence (Day 21+).
  if (today.dayIndex >= 21) {
    const mocksLast14 = withinDays(logs.mocks, 14).length;
    const expected = today.dayIndex >= 43 ? 4 : 2;
    if (mocksLast14 < expected) {
      warnings.push({
        severity: 'high',
        message: `${mocksLast14} mocks logged in 14 days. Plan calls for ${expected}.`,
      });
    }
  }

  // 3. Story rehearsal staleness.
  const staleStories = logs.stories.filter((s) => daysSince(s.lastRehearsed) > 10);
  if (staleStories.length > 3) {
    warnings.push({
      severity: 'medium',
      message: `${staleStories.length} stories not rehearsed in 10+ days.`,
    });
  }

  // 4. Hours drift (rolling 7-day).
  const hours = hoursThisWeek(logs.dayLogs);
  const targetH = computeTargetHours(7);
  if (hours < targetH * 0.7) {
    warnings.push({
      severity: 'high',
      message: `${hours.toFixed(1)}h logged this week, target ${targetH}h. Drift risk: high.`,
    });
  }

  // 5. Streak break.
  const missed = consecutiveMissedDays(logs.dayLogs, today.dayIndex);
  if (missed >= 2) {
    warnings.push({
      severity: 'critical',
      message: `${missed} consecutive days missed. Re-anchor today.`,
    });
  }

  return warnings;
}
