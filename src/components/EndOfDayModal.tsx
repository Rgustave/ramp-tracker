import { useState, useEffect } from 'react';
import { db } from '../data/db';
import { todayISO } from '../lib/dayIndex';
import type { DayLog, DayPlan } from '../types';
import { Button, Field, Input, Modal, Textarea } from './ui/primitives';

type Props = {
  open: boolean;
  onClose: () => void;
  dayIndex: number;
  todayPlan?: DayPlan;
  existing?: DayLog;
};

type RatingKey = 'dsa' | 'sd' | 'ai' | 'behavioral' | 'comm';
type RatingState = Partial<Record<RatingKey, number>>;

export function EndOfDayModal({ open, onClose, dayIndex, todayPlan, existing }: Props) {
  const [hoursLogged, setHoursLogged] = useState<number>(existing?.hoursLogged ?? 3);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [ratings, setRatings] = useState<RatingState>(existing?.trackRatings ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setHoursLogged(existing?.hoursLogged ?? 3);
      setNotes(existing?.notes ?? '');
      setRatings(existing?.trackRatings ?? {});
    }
  }, [open, existing]);

  function setRating(k: RatingKey, n: number) {
    setRatings((r) => {
      const next: RatingState = { ...r };
      if (next[k] === n) delete next[k];
      else next[k] = n;
      return next;
    });
  }

  async function save() {
    setSaving(true);
    const entry: DayLog = {
      dayIndex,
      date: todayISO(),
      hoursLogged,
      completed: true,
      trackRatings: ratings,
      notes: notes.trim() || undefined,
    };
    await db.dayLogs.put(entry);
    setSaving(false);
    onClose();
  }

  const trackRows: Array<{ key: RatingKey; label: string; show: boolean }> = [
    { key: 'dsa', label: 'DS&A', show: true },
    {
      key: 'sd',
      label: 'System Design',
      show: !todayPlan || todayPlan.targets.sdOrAi.track === 'sd',
    },
    {
      key: 'ai',
      label: 'AI Infra',
      show: !todayPlan || todayPlan.targets.sdOrAi.track === 'ai_infra',
    },
    { key: 'behavioral', label: 'Behavioral', show: true },
    { key: 'comm', label: 'Communication', show: true },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="End of day"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Mark complete'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Hours logged">
          <Input
            type="number"
            min={0}
            step={0.25}
            value={hoursLogged}
            onChange={(e) => setHoursLogged(Number(e.target.value))}
          />
        </Field>
        <div className="space-y-3">
          {trackRows.filter((r) => r.show).map((row) => (
            <div key={row.key} className="flex items-center justify-between">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{row.label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(row.key, n)}
                    className={`h-8 w-8 rounded-md border text-sm transition-colors ${
                      ratings[row.key] === n
                        ? 'border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Field label="What worked / what didn't (optional)">
          <Textarea
            placeholder="Be honest — this is the only note that matters tomorrow."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
