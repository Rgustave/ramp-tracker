import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { uid } from '../lib/utils';
import { daysSince } from '../lib/metrics';
import { todayISO } from '../lib/dayIndex';
import type { BehavioralCategory, Story } from '../types';
import { BEHAVIORAL_CATEGORIES } from '../types';
import { prettyCategory } from '../data/seed';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
} from './ui/primitives';

export function Stories() {
  const stories = useLiveQuery(() => db.stories.toArray(), []) ?? [];
  const sorted = [...stories].sort((a, b) => {
    const da = daysSince(a.lastRehearsed);
    const dbb = daysSince(b.lastRehearsed);
    return dbb - da;
  });
  const [editing, setEditing] = useState<Story | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Stories</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Sorted by least recently rehearsed.</p>
        </div>
        <Button onClick={() => setCreating(true)}>+ Story</Button>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
              No stories yet. Add one per behavioral category.
            </CardContent>
          </Card>
        )}
        {sorted.map((s) => {
          const stale = daysSince(s.lastRehearsed) > 10;
          return (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{s.title}</span>
                    <Badge tone="default">{prettyCategory(s.category)}</Badge>
                    <Badge tone={stale ? 'warn' : 'success'}>
                      {s.lastRehearsed ? `last ${s.lastRehearsed}` : 'never rehearsed'}
                    </Badge>
                    <Badge tone="info">strength {s.strength}/5</Badge>
                    <Badge tone="default">{s.rehearsalCount} reps</Badge>
                  </div>
                  {s.starOutline.situation && (
                    <p className="line-clamp-2 max-w-xl text-xs text-zinc-600 dark:text-zinc-500">
                      {s.starOutline.situation}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Button variant="subtle" size="sm" onClick={() => setEditing(s)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => quickRehearse(s)}>Mark rehearsed</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <StoryEditor
        open={!!editing || creating}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        story={editing}
      />
    </div>
  );
}

async function quickRehearse(s: Story) {
  await db.stories.update(s.id, {
    rehearsalCount: (s.rehearsalCount ?? 0) + 1,
    lastRehearsed: todayISO(),
  });
}

function StoryEditor({
  open,
  onClose,
  story,
}: {
  open: boolean;
  onClose: () => void;
  story: Story | null;
}) {
  const [title, setTitle] = useState(story?.title ?? '');
  const [category, setCategory] = useState<BehavioralCategory>(story?.category ?? 'ownership');
  const [situation, setSituation] = useState(story?.starOutline.situation ?? '');
  const [task, setTask] = useState(story?.starOutline.task ?? '');
  const [action, setAction] = useState(story?.starOutline.action ?? '');
  const [result, setResult] = useState(story?.starOutline.result ?? '');
  const [strength, setStrength] = useState<Story['strength']>(story?.strength ?? 1);

  // Reset state when the open story changes.
  useResetOnOpen(open, story, {
    setTitle,
    setCategory,
    setSituation,
    setTask,
    setAction,
    setResult,
    setStrength,
  });

  async function save() {
    const payload: Story = {
      id: story?.id ?? uid('story'),
      title: title.trim() || `${prettyCategory(category)} story`,
      category,
      starOutline: { situation, task, action, result },
      rehearsalCount: story?.rehearsalCount ?? 0,
      lastRehearsed: story?.lastRehearsed,
      strength,
    };
    await db.stories.put(payload);
    onClose();
  }

  async function remove() {
    if (!story) return;
    if (!confirm('Delete this story? This cannot be undone.')) return;
    await db.stories.delete(story.id);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={story ? 'Edit story' : 'New story'}
      widthClass="max-w-xl"
      footer={
        <>
          {story ? (
            <Button variant="danger" onClick={remove}>Delete</Button>
          ) : null}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The migration that ate Q3" />
          </Field>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value as BehavioralCategory)}>
              {BEHAVIORAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{prettyCategory(c)}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="S — Situation">
          <Textarea value={situation} onChange={(e) => setSituation(e.target.value)} />
        </Field>
        <Field label="T — Task">
          <Textarea value={task} onChange={(e) => setTask(e.target.value)} />
        </Field>
        <Field label="A — Action">
          <Textarea value={action} onChange={(e) => setAction(e.target.value)} />
        </Field>
        <Field label="R — Result">
          <Textarea value={result} onChange={(e) => setResult(e.target.value)} />
        </Field>
        <Field label="Strength (1–5)">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStrength(n as Story['strength'])}
                className={`h-9 flex-1 rounded-md border text-sm transition-colors ${
                  strength === n
                    ? 'border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

function useResetOnOpen(
  open: boolean,
  story: Story | null,
  setters: {
    setTitle: (s: string) => void;
    setCategory: (c: BehavioralCategory) => void;
    setSituation: (s: string) => void;
    setTask: (s: string) => void;
    setAction: (s: string) => void;
    setResult: (s: string) => void;
    setStrength: (n: Story['strength']) => void;
  }
) {
  useEffect(() => {
    if (!open) return;
    setters.setTitle(story?.title ?? '');
    setters.setCategory(story?.category ?? 'ownership');
    setters.setSituation(story?.starOutline.situation ?? '');
    setters.setTask(story?.starOutline.task ?? '');
    setters.setAction(story?.starOutline.action ?? '');
    setters.setResult(story?.starOutline.result ?? '');
    setters.setStrength(story?.strength ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, story?.id]);
}
