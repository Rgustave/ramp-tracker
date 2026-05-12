import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { getResource, PLAN } from '../data/seed';
import { todayISO } from '../lib/dayIndex';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from './ui/primitives';
import { DSALogModal } from './QuickLog/DSALogModal';
import { SDLogModal } from './QuickLog/SDLogModal';
import { BehavioralLogModal } from './QuickLog/BehavioralLogModal';
import { MockLogModal } from './QuickLog/MockLogModal';
import { CommLogModal } from './QuickLog/CommLogModal';
import { EndOfDayModal } from './EndOfDayModal';
import type { DayLog, DayPlan } from '../types';

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

  const dsaResource = getResource(`dsa.${todayPlan.targets.dsa.patterns[0]}`);
  const sdResource = getResource(todayPlan.targets.sdOrAi.resourceKey);

  const trackBadge = todayPlan.targets.sdOrAi.track === 'ai_infra' ? 'AI Infra' : 'System Design';

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">{today}</div>
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-100">
            Day {dayIndex} of 70 — {phase?.name ?? `Phase ${todayPlan.phaseId}`}
          </h1>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge tone="info">Week {todayPlan.weekIndex}</Badge>
            {todayPlan.isWeekend ? <Badge tone="default">Weekend</Badge> : null}
            {todayPlan.targets.mock ? <Badge tone="warn">Mock today: {todayPlan.targets.mock.type}</Badge> : null}
            {dayLog?.completed ? <Badge tone="success">Day complete</Badge> : null}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-zinc-500">Logged</div>
          <div className="font-mono text-2xl text-zinc-900 dark:text-zinc-100">
            {hh}h {String(mm).padStart(2, '0')}m
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TargetCard
          title="DS&A"
          headerBadge={`${dsaCount}/${todayPlan.targets.dsa.problemCount}`}
          lines={[
            `${todayPlan.targets.dsa.problemCount} problems · ${todayPlan.targets.dsa.patterns.join(', ')}`,
            `Target: ${todayPlan.targets.dsa.targetMinutes} min/problem`,
          ]}
          resourceTitle={dsaResource?.resources?.[0]?.title}
          resourceUrl={dsaResource?.resources?.[0]?.url}
          conceptSummary={dsaResource?.conceptSummary}
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
          resourceTitle={sdResource?.resources?.[0]?.title}
          resourceUrl={sdResource?.resources?.[0]?.url}
          conceptSummary={sdResource?.conceptSummary}
          actionLabel="+ Design"
          onAction={() => setShowSD(true)}
        />
        <TargetCard
          title="Behavioral"
          headerBadge={behCount > 0 ? `${behCount} logged` : undefined}
          lines={[todayPlan.targets.behavioral.task]}
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
                ? 'Day already marked complete. You can update it.'
                : 'Done for the day? Mark it complete and rate honestly.'}
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
  resourceTitle,
  resourceUrl,
  conceptSummary,
}: {
  title: string;
  headerBadge?: string;
  lines: string[];
  actionLabel: string;
  onAction: () => void;
  resourceTitle?: string;
  resourceUrl?: string;
  conceptSummary?: string;
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
        {conceptSummary ? (
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-500">{conceptSummary}</p>
        ) : null}
        {resourceTitle && resourceUrl ? (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-base font-medium text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
          >
            → {resourceTitle}
          </a>
        ) : null}
        <div className="pt-1">
          <Button onClick={onAction} variant="subtle">{actionLabel}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
