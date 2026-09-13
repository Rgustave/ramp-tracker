import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { PLAN } from '../data/seed';
import { todayISO } from '../lib/dayIndex';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from './ui/primitives';
import { ResourceList } from './ResourceList';
import { DSALogModal } from './QuickLog/DSALogModal';
import { SDLogModal } from './QuickLog/SDLogModal';
import { BehavioralLogModal } from './QuickLog/BehavioralLogModal';
import { MockLogModal } from './QuickLog/MockLogModal';
import { CommLogModal } from './QuickLog/CommLogModal';
import { EndOfDayModal } from './EndOfDayModal';
import type { DayLog, DayPlan } from '../types';
import { frontierWeekFor } from '../data/frontier';

type Props = { dayIndex: number };

export function Today({ dayIndex }: Props) {
  const todayPlan: DayPlan | undefined = PLAN.days.find((d) => d.dayIndex === dayIndex);
  const phase = PLAN.phases.find((p) => p.id === todayPlan?.phaseId);

  const today = todayISO();
  const dsaToday = useLiveQuery(
    () => db.dsaEntries.where('dayIndex').equals(dayIndex).toArray(),
    [dayIndex]
  );
  const sdToday = useLiveQuery(
    () => db.sdEntries.where('dayIndex').equals(dayIndex).toArray(),
    [dayIndex]
  );
  const behavioralToday = useLiveQuery(
    () => db.behavioralEntries.where('dayIndex').equals(dayIndex).toArray(),
    [dayIndex]
  );
  const mocksToday = useLiveQuery(
    () => db.mockEntries.where('dayIndex').equals(dayIndex).toArray(),
    [dayIndex]
  );
  const commToday = useLiveQuery(
    () => db.commEntries.where('dayIndex').equals(dayIndex).toArray(),
    [dayIndex]
  );
  const dayLog: DayLog | undefined = useLiveQuery(
    () => db.dayLogs.get(dayIndex),
    [dayIndex]
  );

  const [showDSA, setShowDSA] = useState(false);
  const [showSD, setShowSD] = useState(false);
  const [showBeh, setShowBeh] = useState(false);
  const [showMock, setShowMock] = useState(false);
  const [showComm, setShowComm] = useState(false);
  const [showEod, setShowEod] = useState(false);

  if (!todayPlan) {
    return <div className="p-6 text-zinc-500 dark:text-zinc-400">No plan for day {dayIndex}.</div>;
  }

  const dsaCount = dsaToday?.length ?? 0;
  const sdCount = sdToday?.length ?? 0;
  const behCount = behavioralToday?.length ?? 0;
  const mockCount = mocksToday?.length ?? 0;
  const commCount = commToday?.length ?? 0;
  const totalLoggedMinutes =
    (dsaToday ?? []).reduce((a, e) => a + e.timeMinutes, 0) +
    (sdToday ?? []).reduce((a, e) => a + e.durationMinutes, 0) +
    (behavioralToday ?? []).reduce((a, e) => a + Math.round((e.durationSeconds ?? 0) / 60), 0) +
    (commToday ?? []).reduce((a, e) => a + e.durationMinutes, 0);

  const hh = Math.floor(totalLoggedMinutes / 60);
  const mm = totalLoggedMinutes % 60;

  const dsaResourceKeys = todayPlan.targets.dsa.patterns.map((p) => `dsa.${p}`);
  const sdResourceKey = todayPlan.targets.sdOrAi.resourceKey;

  const trackBadge = todayPlan.targets.sdOrAi.track === 'applied_ai' ? 'Applied AI' : todayPlan.targets.sdOrAi.track === 'ai_infra' ? 'AI Infra' : 'System Design';
  const frontier = frontierWeekFor(todayPlan.weekIndex);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:py-8">
      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-sm sm:p-8 dark:border-zinc-700">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{today} / Phase {todayPlan.phaseId}</div>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-[-0.025em] text-white sm:text-[2.5rem]">
            Day {dayIndex}: {phase?.name ?? `Phase ${todayPlan.phaseId}`}
          </h1>
          <div className="mt-1 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold">Week {todayPlan.weekIndex}</span>
            {todayPlan.isWeekend ? <Badge tone="default">Weekend</Badge> : null}
            {todayPlan.targets.mock ? <Badge tone="warn">Mock today: {todayPlan.targets.mock.type}</Badge> : null}
            {dayLog?.completed ? <Badge tone="success">Day complete</Badge> : null}
            {dayLog?.proofPassed ? <Badge tone="warn">Proof verified</Badge> : null}
          </div>
        </div>
        <div className="min-w-32 border-l border-zinc-700 pl-5 text-left sm:text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Logged today</div>
          <div className="mt-1 font-mono text-3xl font-bold text-white">
            {hh}h {String(mm).padStart(2, '0')}m
          </div>
        </div>
      </div>
      <div className="mt-6 h-1 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-amber-400" style={{width: `${Math.round(dayIndex / 70 * 100)}%`}} /></div>
      </section>

      <section className="grid overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-[1.35fr_1fr] dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-5 sm:p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">Week {frontier.week} frontier mission</div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">{frontier.theme}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{frontier.mission}</p>
          <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs leading-5 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300"><strong className="text-zinc-900 dark:text-white">Proof:</strong> {frontier.proof}</div>
        </div>
        <div className="border-t border-zinc-200 bg-zinc-50 p-5 lg:border-l lg:border-t-0 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Exit gate</div>
          <p className="mt-2 text-sm font-medium leading-6 text-zinc-800 dark:text-zinc-200">{frontier.gate}</p>
          <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Job pipeline</div>
          <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{frontier.pipeline}</p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TargetCard
          title="DS&A"
          headerBadge={`${dsaCount}/${todayPlan.targets.dsa.problemCount}`}
          lines={[
            `${todayPlan.targets.dsa.problemCount} problems · ${todayPlan.targets.dsa.patterns.join(', ')}`,
            `Target: ${todayPlan.targets.dsa.targetMinutes} min/problem`,
          ]}
          resourceKeys={dsaResourceKeys}
          actionLabel="+ Problem"
          onAction={() => setShowDSA(true)}
        />
        <TargetCard
          title={trackBadge}
          headerBadge={sdCount > 0 ? `${sdCount} logged` : undefined}
          lines={[
            todayPlan.targets.sdOrAi.topic,
            `Mode: ${todayPlan.targets.sdOrAi.mode}`,
          ]}
          resourceKeys={sdResourceKey ? [sdResourceKey] : []}
          actionLabel="+ Session"
          onAction={() => setShowSD(true)}
        />
        <TargetCard
          title="Behavioral"
          headerBadge={behCount > 0 ? `${behCount} logged` : undefined}
          lines={[todayPlan.targets.behavioral.task]}
          resourceKeys={['behavioral.framework']}
          actionLabel="+ Story"
          onAction={() => setShowBeh(true)}
        />
        <TargetCard
          title="Mock"
          headerBadge={mockCount > 0 ? `${mockCount} logged` : undefined}
          lines={
            todayPlan.targets.mock
              ? [`Type: ${todayPlan.targets.mock.type}`, 'Schedule it. Logging it after the fact is the point.']
              : ['No scheduled mock today.', 'Log one if you did one anyway.']
          }
          actionLabel="+ Mock"
          onAction={() => setShowMock(true)}
        />
        <TargetCard
          title="Communication"
          headerBadge={commCount > 0 ? `${commCount} logged` : undefined}
          lines={[
            'Talk through ≥1 problem aloud. Watch one playback.',
            'Articulation > correctness once you can solve it.',
          ]}
          actionLabel="+ Comm"
          onAction={() => setShowComm(true)}
        />
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {dayLog?.completed
                ? dayLog.proofPassed ? 'Day complete with evidence against the proof standard.' : 'Day complete. Add evidence once the proof standard is met.'
                : 'Done for the day? Record the artifact, test it against the proof standard, and rate honestly.'}
            </div>
            <Button size="lg" onClick={() => setShowEod(true)}>
              {dayLog?.completed ? 'Update day log' : 'Mark day complete'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DSALogModal open={showDSA} onClose={() => setShowDSA(false)} dayIndex={dayIndex} todayPlan={todayPlan} />
      <SDLogModal open={showSD} onClose={() => setShowSD(false)} dayIndex={dayIndex} todayPlan={todayPlan} />
      <BehavioralLogModal open={showBeh} onClose={() => setShowBeh(false)} dayIndex={dayIndex} />
      <MockLogModal open={showMock} onClose={() => setShowMock(false)} dayIndex={dayIndex} />
      <CommLogModal open={showComm} onClose={() => setShowComm(false)} dayIndex={dayIndex} />
      <EndOfDayModal
        open={showEod}
        onClose={() => setShowEod(false)}
        dayIndex={dayIndex}
        todayPlan={todayPlan}
        existing={dayLog}
      />
    </div>
  );
}

function TargetCard({
  title,
  headerBadge,
  lines,
  actionLabel,
  onAction,
  resourceKeys,
}: {
  title: string;
  headerBadge?: string;
  lines: string[];
  actionLabel: string;
  onAction: () => void;
  resourceKeys?: string[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        {headerBadge ? <Badge tone="default">{headerBadge}</Badge> : null}
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <ul className="space-y-1 text-base text-zinc-800 dark:text-zinc-200">
          {lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
        {resourceKeys && resourceKeys.length > 0 ? (
          <ResourceList keys={resourceKeys} variant="compact" />
        ) : null}
        <div className="pt-1">
          <Button onClick={onAction} variant="subtle">{actionLabel}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
