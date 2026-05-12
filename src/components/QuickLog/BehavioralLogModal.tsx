import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { todayISO } from '../../lib/dayIndex';
import { uid } from '../../lib/utils';
import type { BehavioralEntry, Story } from '../../types';
import { Button, Field, Input, Modal, Select, Textarea } from '../ui/primitives';

type Props = {
  open: boolean;
  onClose: () => void;
  dayIndex: number;
};

export function BehavioralLogModal({ open, onClose, dayIndex }: Props) {
  const stories = useLiveQuery(() => db.stories.toArray(), []) ?? [];

  const [storyId, setStoryId] = useState<string>('');
  const [recorded, setRecorded] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState<number>(120);
  const [selfRating, setSelfRating] = useState<BehavioralEntry['selfRating']>(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!storyId && stories.length > 0) {
      const oldest = [...stories].sort(
        (a, b) => (a.lastRehearsed ?? '').localeCompare(b.lastRehearsed ?? '')
      )[0];
      setStoryId(oldest.id);
    }
  }, [stories, storyId]);

  const story: Story | undefined = stories.find((s) => s.id === storyId);

  async function save() {
    if (!story) return;
    setSaving(true);
    const entry: BehavioralEntry = {
      id: uid('beh'),
      date: todayISO(),
      dayIndex,
      storyId: story.id,
      category: story.category,
      recorded,
      durationSeconds: recorded ? durationSeconds : undefined,
      selfRating,
      notes: notes.trim() || undefined,
    };
    await db.transaction('rw', [db.behavioralEntries, db.stories], async () => {
      await db.behavioralEntries.add(entry);
      await db.stories.update(story.id, {
        rehearsalCount: (story.rehearsalCount ?? 0) + 1,
        lastRehearsed: entry.date,
        strength: Math.max(story.strength, selfRating) as Story['strength'],
      });
    });
    setSaving(false);
    setNotes('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a story rehearsal"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!story || saving}>{saving ? 'Saving…' : 'Log it'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Story" hint={story ? `Category: ${story.category}` : 'Add stories from the Stories tab first.'}>
          <Select value={storyId} onChange={(e) => setStoryId(e.target.value)}>
            <option value="" disabled>Select a story</option>
            {stories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} {s.lastRehearsed ? `· last ${s.lastRehearsed}` : '· never rehearsed'}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Did you record yourself?">
          <div className="flex items-center gap-3">
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
        {recorded && (
          <Field label="Duration (seconds)" hint="Aim for 90–120s">
            <Input
              type="number"
              min={10}
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
            />
          </Field>
        )}
        <Field label="Self-rating (1–5)">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelfRating(n as BehavioralEntry['selfRating'])}
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
            placeholder="What was rough? What landed?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
