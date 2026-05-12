import { useState } from 'react';
import { db } from '../../data/db';
import { todayISO } from '../../lib/dayIndex';
import { uid } from '../../lib/utils';
import type { CommEntry, CommActivity } from '../../types';
import { Button, Field, Input, Modal, Select, Textarea } from '../ui/primitives';

type Props = {
  open: boolean;
  onClose: () => void;
  dayIndex: number;
};

const ACTIVITIES: { value: CommActivity; label: string }[] = [
  { value: 'verbal_walkthrough', label: 'Verbal walkthrough (think aloud)' },
  { value: 'recorded_review', label: 'Recorded + watched playback' },
  { value: 'whiteboard_drill', label: 'Whiteboard / explain on demand' },
  { value: 'self_intro', label: 'Self-intro / pitch practice' },
  { value: 'other', label: 'Other' },
];

export function CommLogModal({ open, onClose, dayIndex }: Props) {
  const [activity, setActivity] = useState<CommActivity>('verbal_walkthrough');
  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [recorded, setRecorded] = useState(false);
  const [selfRating, setSelfRating] = useState<CommEntry['selfRating']>(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!topic.trim()) return;
    setSaving(true);
    const entry: CommEntry = {
      id: uid('comm'),
      date: todayISO(),
      dayIndex,
      activity,
      topic: topic.trim(),
      durationMinutes,
      recorded,
      selfRating,
      notes: notes.trim() || undefined,
    };
    await db.commEntries.add(entry);
    setSaving(false);
    setTopic('');
    setNotes('');
    setDurationMinutes(10);
    setRecorded(false);
    setSelfRating(3);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a comm session"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!topic.trim() || saving}>{saving ? 'Saving…' : 'Log it'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Activity">
          <Select value={activity} onChange={(e) => setActivity(e.target.value as CommActivity)}>
            {ACTIVITIES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Topic / what you talked through" hint="e.g. Two Sum verbal pass · explaining LRU cache">
          <Input
            placeholder="Verbal pass on Two Sum"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration (min)">
            <Input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </Field>
          <Field label="Recorded?">
            <div className="flex h-9 items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" checked={recorded} onChange={() => setRecorded(true)} />
                Yes
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" checked={!recorded} onChange={() => setRecorded(false)} />
                No
              </label>
            </div>
          </Field>
        </div>
        <Field label="Clarity / pace (1–5)">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelfRating(n as CommEntry['selfRating'])}
                className={`h-9 flex-1 rounded-md border text-sm ${
                  selfRating === n
                    ? 'border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Notes (optional)">
          <Textarea
            placeholder="Filler words? Pace? Did you bury the lede?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
