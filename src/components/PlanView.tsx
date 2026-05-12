import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { PLAN } from '../data/seed';
import type { DSAEntry, SDEntry, BehavioralEntry, MockEntry, DayLog } from '../types';
import { Badge, Card, CardContent, CardHeader, CardTitle, Modal } from './ui/primitives';
import { ResourceList } from './ResourceList';

const PHASE_TONES: Record<number, 'success' | 'info' | 'warn' | 'danger'> = {
  1: 'info',
  2: 'success',
  3: 'warn',
  4: 'danger',
};

type Props = { currentDayIndex: number };

export function PlanView({ currentDayIndex }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Plan · 70-day timeline</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Read-only. Tap a day for details.</p>
      </div>

      <div className="space-y-4">
        {PLAN.phases.map((phase) => {
          const days = PLAN.days.filter((d) => d.phaseId === phase.id);
          return (
            <Card key={phase.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <div>
                  <CardTitle>
                    Phase {phase.id} · {phase.name}
                  </CardTitle>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Days {phase.startDay}–{phase.endDay}</p>
                </div>
                <Badge tone={PHASE_TONES[phase.id]}>P{phase.id}</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 sm:grid-cols-10 md:grid-cols-14">
                  {days.map((d) => {
                    const isCurrent = d.dayIndex === currentDayIndex;
                    const isPast = d.dayIndex < currentDayIndex;
                    const tone = PHASE_TONES[d.phaseId];
                    return (
                      <button
                        key={d.dayIndex}
                        onClick={() => setSelected(d.dayIndex)}
                        className={`relative aspect-square rounded-md border text-xs font-medium transition-colors ${
                          isCurrent
                            ? 'border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                            : isPast
                              ? 'border-zinc-200 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400 dark:hover:bg-zinc-800'
                              : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'
                        }`}
                        title={`Day ${d.dayIndex} · Phase ${d.phaseId}`}
                      >
                        {d.dayIndex}
                        <span
                          className={`absolute bottom-0.5 right-1 inline-block h-1.5 w-1.5 rounded-full ${
                            tone === 'info'
                              ? 'bg-sky-400'
                              : tone === 'success'
                                ? 'bg-emerald-400'
                                : tone === 'warn'
                                  ? 'bg-amber-400'
                                  : 'bg-red-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-500">
                  Exit criteria: {phase.exitCriteria.join(' · ')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DayDetailModal selectedDayIndex={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function DayDetailModal({ selectedDayIndex, onClose }: { selectedDayIndex: number | null; onClose: () => void }) {
  const day = selectedDayIndex != null ? PLAN.days.find((d) => d.dayIndex === selectedDayIndex) : undefined;
  const phase = day ? PLAN.phases.find((p) => p.id === day.phaseId) : undefined;
  const sdResourceKey = day?.targets.sdOrAi.resourceKey;
  const dsaResourceKeys = day ? day.targets.dsa.patterns.map((p) => `dsa.${p}`) : [];

  const dsaLogs = useLiveQuery<DSAEntry[]>(
    () => (selectedDayIndex ? db.dsaEntries.where('dayIndex').equals(selectedDayIndex).toArray() : []),
    [selectedDayIndex]
  );
  const sdLogs = useLiveQuery<SDEntry[]>(
    () => (selectedDayIndex ? db.sdEntries.where('dayIndex').equals(selectedDayIndex).toArray() : []),
    [selectedDayIndex]
  );
  const behLogs = useLiveQuery<BehavioralEntry[]>(
    () => (selectedDayIndex ? db.behavioralEntries.where('dayIndex').equals(selectedDayIndex).toArray() : []),
    [selectedDayIndex]
  );
  const mockLogs = useLiveQuery<MockEntry[]>(
    () => (selectedDayIndex ? db.mockEntries.where('dayIndex').equals(selectedDayIndex).toArray() : []),
    [selectedDayIndex]
  );
  const dayLog = useLiveQuery<DayLog | undefined>(
    () => (selectedDayIndex ? db.dayLogs.get(selectedDayIndex) : undefined),
    [selectedDayIndex]
  );

  return (
    <Modal
      open={selectedDayIndex != null && !!day}
      onClose={onClose}
      title={day ? `Day ${day.dayIndex} · Phase ${day.phaseId}` : ''}
      widthClass="max-w-lg"
    >
      {day && (
        <div className="space-y-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">Phase</div>
            <div className="text-zinc-800 dark:text-zinc-200">{phase?.name}</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-zinc-500">DS&A</div>
            <div className="text-zinc-800 dark:text-zinc-200">
              {day.targets.dsa.problemCount} problems · {day.targets.dsa.patterns.join(', ')} · target {day.targets.dsa.targetMinutes}m
            </div>
            <ResourceList keys={dsaResourceKeys} variant="compact" />
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              {day.targets.sdOrAi.track === 'ai_infra' ? 'AI Infra' : 'System Design'} ({day.targets.sdOrAi.mode})
            </div>
            <div className="text-zinc-800 dark:text-zinc-200">{day.targets.sdOrAi.topic}</div>
            <ResourceList keys={sdResourceKey ? [sdResourceKey] : []} variant="compact" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">Behavioral</div>
            <div className="text-zinc-800 dark:text-zinc-200">{day.targets.behavioral.task}</div>
          </div>
          {day.targets.mock && (
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500">Mock</div>
              <div className="text-zinc-800 dark:text-zinc-200">{day.targets.mock.type}</div>
            </div>
          )}

          <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Logged that day</div>
            <ul className="mt-2 space-y-1 text-zinc-700 dark:text-zinc-300">
              <li>DS&A: {dsaLogs?.length ?? 0} problem(s)</li>
              <li>Design: {sdLogs?.length ?? 0} session(s)</li>
              <li>Behavioral: {behLogs?.length ?? 0} rehearsal(s)</li>
              <li>Mock: {mockLogs?.length ?? 0}</li>
              <li>Day complete: {dayLog?.completed ? 'yes' : 'no'}{dayLog ? ` · ${dayLog.hoursLogged}h` : ''}</li>
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}
