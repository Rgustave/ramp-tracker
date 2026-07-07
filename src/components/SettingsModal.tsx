import { useEffect, useState } from 'react';
import { lastCompletedDayIndex, resetAfterDay, startOver } from '../data/reset';
import { clampDayIndex, dateForDayIndex, diffDays, todayISO } from '../lib/dayIndex';
import { Badge, Button, Field, Input, Modal } from './ui/primitives';

type Props = {
  open: boolean;
  onClose: () => void;
  startDate: string;
  currentDayIndex: number;
  /** Called after a full start-over wipe so the app can return to first run. */
  onStartedOver: () => void;
};

export function SettingsModal({ open, onClose, startDate, currentDayIndex, onStartedOver }: Props) {
  const [lastDone, setLastDone] = useState<number | null>(null);
  const [cutoffDate, setCutoffDate] = useState<string>(todayISO());
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  // Load the last completed day whenever the modal opens, and default the
  // cutoff picker to it (the "keep everything through here" point).
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setConfirmReset(false);
    setConfirmWipe(false);
    lastCompletedDayIndex().then((day) => {
      if (!alive) return;
      setLastDone(day);
      setCutoffDate(dateForDayIndex(startDate, day > 0 ? day : 1));
    });
    return () => {
      alive = false;
    };
  }, [open, startDate]);

  // Map the picked calendar date back onto a clamped 1..70 day index.
  const keepThroughDay = clampDayIndex(diffDays(startDate, cutoffDate) + 1);

  async function doReset() {
    setBusy(true);
    await resetAfterDay(keepThroughDay);
    setBusy(false);
    setConfirmReset(false);
    onClose();
  }

  async function doWipe() {
    setBusy(true);
    await startOver();
    setBusy(false);
    setConfirmWipe(false);
    onClose();
    onStartedOver();
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings" widthClass="max-w-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>Start date: {startDate}</span>
          <Badge tone="info">Day {currentDayIndex} / 70</Badge>
        </div>

        <section className="space-y-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Reset to a day
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Keeps everything up to and including the chosen day, then deletes all logs after it
              so you can redo from the next day. Start date and stories are kept.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCutoffDate(dateForDayIndex(startDate, lastDone && lastDone > 0 ? lastDone : 1))
              }
              className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {lastDone && lastDone > 0
                ? `Last completed day · Day ${lastDone}`
                : 'No completed days yet'}
            </button>
          </div>

          <Field label="Keep through this date">
            <Input
              type="date"
              value={cutoffDate}
              min={startDate}
              onChange={(e) => {
                setCutoffDate(e.target.value);
                setConfirmReset(false);
              }}
            />
          </Field>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            That's <span className="font-medium text-zinc-700 dark:text-zinc-300">Day {keepThroughDay}</span>.
            Logs from Day {clampDayIndex(keepThroughDay + 1)} onward will be deleted.
          </p>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={doReset} disabled={busy}>
                {busy ? 'Resetting…' : `Yes, delete after Day ${keepThroughDay}`}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)} disabled={busy}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)}>
              Delete everything after Day {keepThroughDay}
            </Button>
          )}
        </section>

        <section className="space-y-3 rounded-md border border-red-300 p-4 dark:border-red-900/60">
          <div>
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Start over</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Deletes all logs, day records, and stories, and returns to the first-run setup where
              you pick a new start date. This cannot be undone.
            </p>
          </div>

          {confirmWipe ? (
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={doWipe} disabled={busy}>
                {busy ? 'Wiping…' : 'Yes, delete everything'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmWipe(false)} disabled={busy}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirmWipe(true)}>
              Start over
            </Button>
          )}
        </section>
      </div>
    </Modal>
  );
}
