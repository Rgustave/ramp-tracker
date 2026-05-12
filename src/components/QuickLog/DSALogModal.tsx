import { useState } from 'react';
import { db } from '../../data/db';
import { todayISO } from '../../lib/dayIndex';
import { uid } from '../../lib/utils';
import type { DSAEntry, DayPlan } from '../../types';
import { Button, Field, Input, Modal, Select, Textarea } from '../ui/primitives';

type Props = {
  open: boolean;
  onClose: () => void;
  dayIndex: number;
  todayPlan?: DayPlan;
};

const DIFFICULTIES: DSAEntry['difficulty'][] = ['easy', 'medium', 'hard'];

const FALLBACK_PATTERNS = [
  'arrays', 'hashmaps', 'two_pointers', 'sliding_window', 'stack', 'monotonic_stack',
  'linked_lists', 'binary_search', 'trees', 'bfs_dfs', 'recursion', 'heaps',
  'priority_queue', 'intervals', 'graphs', 'dp', 'tries', 'mixed_review',
];

export function DSALogModal({ open, onClose, dayIndex, todayPlan }: Props) {
  const planPatterns = todayPlan?.targets.dsa.patterns ?? [];
  const patternOptions = Array.from(new Set([...planPatterns, ...FALLBACK_PATTERNS]));
  const defaultPattern = planPatterns[0] ?? 'arrays';

  const [problemName, setProblemName] = useState('');
  const [pattern, setPattern] = useState<string>(defaultPattern);
  const [difficulty, setDifficulty] = useState<DSAEntry['difficulty']>('medium');
  const [timeMinutes, setTimeMinutes] = useState<number>(todayPlan?.targets.dsa.targetMinutes ?? 30);
  const [solvedUnaided, setSolvedUnaided] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  function reset() {
    setProblemName('');
    setPattern(defaultPattern);
    setDifficulty('medium');
    setTimeMinutes(todayPlan?.targets.dsa.targetMinutes ?? 30);
    setSolvedUnaided(true);
    setNotes('');
  }

  async function save() {
    if (!problemName.trim()) return;
    setSaving(true);
    const entry: DSAEntry = {
      id: uid('dsa'),
      date: todayISO(),
      dayIndex,
      problemName: problemName.trim(),
      pattern,
      difficulty,
      timeMinutes,
      solvedUnaided,
      notes: notes.trim() || undefined,
    };
    await db.dsaEntries.add(entry);
    setSaving(false);
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a problem"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!problemName.trim() || saving}>{saving ? 'Saving…' : 'Log it'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Problem">
          <Input
            placeholder="Two Sum"
            value={problemName}
            onChange={(e) => setProblemName(e.target.value)}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pattern">
            <Select value={pattern} onChange={(e) => setPattern(e.target.value)}>
              {patternOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <Field label="Difficulty">
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as DSAEntry['difficulty'])}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Time (min)" hint={todayPlan ? `target ${todayPlan.targets.dsa.targetMinutes}m` : undefined}>
            <Input
              type="number"
              min={1}
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(Number(e.target.value))}
            />
          </Field>
          <Field label="Solved unaided?">
            <div className="flex h-9 items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" checked={solvedUnaided} onChange={() => setSolvedUnaided(true)} />
                Yes
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" checked={!solvedUnaided} onChange={() => setSolvedUnaided(false)} />
                No
              </label>
            </div>
          </Field>
        </div>
        <Field label="Notes (optional)">
          <Textarea
            placeholder="Stuck on… / pattern recognized in N min / etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
