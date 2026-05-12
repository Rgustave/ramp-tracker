import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { PLAN } from '../data/seed';
import {
  type AllLogs,
  withinDays,
  median,
  pctUnderTarget,
  groupByPattern,
  hoursThisWeek,
  computeTargetHours,
  daysSince,
} from '../lib/metrics';
import { detectDrift } from '../lib/drift';
import type { Severity } from '../types';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Field, Textarea } from './ui/primitives';

const SEVERITY_TONES: Record<Severity, 'info' | 'warn' | 'danger' | 'default'> = {
  low: 'info',
  medium: 'warn',
  high: 'danger',
  critical: 'danger',
};

type Props = { dayIndex: number };

export function WeekReview({ dayIndex }: Props) {
  const todayPlan = PLAN.days.find((d) => d.dayIndex === dayIndex);

  const dsa = useLiveQuery(() => db.dsaEntries.toArray(), []) ?? [];
  const sd = useLiveQuery(() => db.sdEntries.toArray(), []) ?? [];
  const behavioral = useLiveQuery(() => db.behavioralEntries.toArray(), []) ?? [];
  const mocks = useLiveQuery(() => db.mockEntries.toArray(), []) ?? [];
  const comm = useLiveQuery(() => db.commEntries.toArray(), []) ?? [];
  const dayLogs = useLiveQuery(() => db.dayLogs.toArray(), []) ?? [];
  const stories = useLiveQuery(() => db.stories.toArray(), []) ?? [];

  const logs: AllLogs = { dsa, sd, behavioral, mocks, dayLogs, stories };

  const last7Dsa = withinDays(dsa, 7);
  const last7Sd = withinDays(sd, 7);
  const last7Beh = withinDays(behavioral, 7);
  const last7Mocks = withinDays(mocks, 7);
  const last7Comm = withinDays(comm, 7);

  const target = todayPlan?.targets.dsa.targetMinutes ?? 35;
  const med = median(last7Dsa.map((p) => p.timeMinutes));
  const underPct = pctUnderTarget(last7Dsa, target);
  const byPattern = groupByPattern(last7Dsa);

  const hours = hoursThisWeek(dayLogs);
  const targetH = computeTargetHours(7);

  const sdAvgRating =
    last7Sd.length === 0 ? 0 : last7Sd.reduce((a, e) => a + e.selfRating, 0) / last7Sd.length;

  const uniqueStoriesRehearsed = new Set(last7Beh.map((e) => e.storyId)).size;
  const totalReps = last7Beh.length;

  const staleStories = stories.filter((s) => daysSince(s.lastRehearsed) > 10);

  const commAvgRating =
    last7Comm.length === 0 ? 0 : last7Comm.reduce((a, e) => a + e.selfRating, 0) / last7Comm.length;
  const commRecorded = last7Comm.filter((e) => e.recorded).length;
  const commMinutes = last7Comm.reduce((a, e) => a + e.durationMinutes, 0);

  const warnings = todayPlan ? detectDrift(todayPlan, logs) : [];

  const [reflection, setReflection] = useState('');

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Week review</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Rolling 7-day window. Honesty over kindness.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drift warnings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {warnings.length === 0 ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">No drift detected. Keep going.</p>
          ) : (
            warnings.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <Badge tone={SEVERITY_TONES[w.severity]}>{w.severity}</Badge>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{w.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard title="DS&A">
          <Stat label="Problems solved" value={String(last7Dsa.length)} />
          <Stat label="Median time" value={`${Math.round(med)}m`} hint={`target ${target}m`} />
          <Stat label="% under target" value={`${underPct}%`} />
          <div className="mt-2 space-y-1">
            {Object.entries(byPattern).map(([pat, items]) => (
              <div
                key={pat}
                className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400"
              >
                <span>{pat}</span>
                <span>{items.length} · median {Math.round(median(items.map((i) => i.timeMinutes)))}m</span>
              </div>
            ))}
          </div>
        </MetricCard>
        <MetricCard title="Design">
          <Stat label="Designs completed" value={String(last7Sd.length)} />
          <Stat label="Avg self-rating" value={sdAvgRating ? sdAvgRating.toFixed(1) : '—'} />
        </MetricCard>
        <MetricCard title="Behavioral">
          <Stat label="Unique stories rehearsed" value={String(uniqueStoriesRehearsed)} />
          <Stat label="Total reps" value={String(totalReps)} />
          <Stat label="Stale (>10d)" value={String(staleStories.length)} />
        </MetricCard>
        <MetricCard title="Mocks & hours">
          <Stat label="Mocks (7d)" value={String(last7Mocks.length)} />
          <Stat label="Hours logged" value={`${hours.toFixed(1)}h`} hint={`target ${targetH}h`} />
        </MetricCard>
        <MetricCard title="Communication">
          <Stat label="Sessions (7d)" value={String(last7Comm.length)} />
          <Stat label="Recorded + reviewed" value={String(commRecorded)} />
          <Stat label="Avg clarity/pace" value={commAvgRating ? commAvgRating.toFixed(1) : '—'} />
          <Stat label="Minutes practiced" value={`${commMinutes}m`} />
        </MetricCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What worked / what didn't</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Reflection (saved in next day's log)">
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Patterns that clicked. Patterns that didn't. What to do differently."
            />
          </Field>
          <div className="mt-3 flex justify-end">
            <Button
              variant="subtle"
              onClick={async () => {
                if (!reflection.trim()) return;
                const existing = await db.dayLogs.get(dayIndex);
                const merged = (existing?.notes ? existing.notes + '\n\n' : '') + `[week-review] ${reflection.trim()}`;
                await db.dayLogs.put({
                  dayIndex,
                  date: existing?.date ?? new Date().toISOString().slice(0, 10),
                  hoursLogged: existing?.hoursLogged ?? 0,
                  completed: existing?.completed ?? false,
                  trackRatings: existing?.trackRatings ?? {},
                  notes: merged,
                });
                setReflection('');
              }}
            >
              Save reflection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className="text-right">
        <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{value}</span>
        {hint && <span className="ml-2 text-xs text-zinc-500">{hint}</span>}
      </span>
    </div>
  );
}
