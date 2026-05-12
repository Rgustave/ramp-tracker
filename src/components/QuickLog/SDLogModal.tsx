import { useState } from 'react';
import { db } from '../../data/db';
import { todayISO } from '../../lib/dayIndex';
import { uid } from '../../lib/utils';
import type { SDEntry, DayPlan, Track } from '../../types';
import { Button, Field, Input, Modal, Select, Textarea } from '../ui/primitives';

type Props = {
  open: boolean;
  onClose: () => void;
  dayIndex: number;
  todayPlan?: DayPlan;
};

export function SDLogModal({ open, onClose, dayIndex, todayPlan }: Props) {
  const defaultTrack: Track = todayPlan?.targets.sdOrAi.track ?? 'sd';
  const defaultDesignName = todayPlan?.targets.sdOrAi.topic ?? '';

  const [designName, setDesignName] = useState(defaultDesignName);
  const [track, setTrack] = useState<Track>(defaultTrack);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [selfRating, setSelfRating] = useState<SDEntry['selfRating']>(3);
  const [weakAreasInput, setWeakAreasInput] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!designName.trim()) return;
    setSaving(true);
    const entry: SDEntry = {
      id: uid('sd'),
      date: todayISO(),
      dayIndex,
      designName: designName.trim(),
      track,
      durationMinutes,
      selfRating,
      weakAreas: weakAreasInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      notes: notes.trim() || undefined,
    };
    await db.sdEntries.add(entry);
    setSaving(false);
    setDesignName(defaultDesignName);
    setDurationMinutes(45);
    setSelfRating(3);
    setWeakAreasInput('');
    setNotes('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a design"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!designName.trim() || saving}>{saving ? 'Saving…' : 'Log it'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Design / topic">
          <Input
            placeholder="Design URL shortener"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Track">
            <Select value={track} onChange={(e) => setTrack(e.target.value as Track)}>
              <option value="sd">System Design</option>
              <option value="ai_infra">AI Infra</option>
            </Select>
          </Field>
          <Field label="Duration (min)">
            <Input
              type="number"
              min={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Tradeoff fluency (1–5)">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelfRating(n as SDEntry['selfRating'])}
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
        <Field label="Weak areas (comma-separated)" hint="e.g. consistent hashing, backpressure">
          <Input
            placeholder="caching, sharding"
            value={weakAreasInput}
            onChange={(e) => setWeakAreasInput(e.target.value)}
          />
        </Field>
        <Field label="Notes (optional)">
          <Textarea
            placeholder="What did you whiff?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
