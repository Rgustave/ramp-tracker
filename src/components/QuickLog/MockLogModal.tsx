import { useState } from 'react';
import { db } from '../../data/db';
import { todayISO } from '../../lib/dayIndex';
import { uid } from '../../lib/utils';
import type { MockEntry, MockType } from '../../types';
import { Button, Field, Modal, Select, Textarea } from '../ui/primitives';

type Props = {
  open: boolean;
  onClose: () => void;
  dayIndex: number;
};

const TYPES: MockType[] = ['coding', 'sd', 'behavioral', 'full_loop'];
const SOURCES: MockEntry['source'][] = ['pramp', 'peer', 'paid', 'self'];
const OUTCOMES: MockEntry['outcome'][] = ['pass', 'borderline', 'fail'];

export function MockLogModal({ open, onClose, dayIndex }: Props) {
  const [type, setType] = useState<MockType>('coding');
  const [source, setSource] = useState<MockEntry['source']>('pramp');
  const [outcome, setOutcome] = useState<MockEntry['outcome']>('borderline');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const entry: MockEntry = {
      id: uid('mock'),
      date: todayISO(),
      dayIndex,
      type,
      source,
      outcome,
      feedback: feedback.trim(),
    };
    await db.mockEntries.add(entry);
    setSaving(false);
    setFeedback('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a mock"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Log it'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value as MockType)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Source">
            <Select value={source} onChange={(e) => setSource(e.target.value as MockEntry['source'])}>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Outcome">
            <Select value={outcome} onChange={(e) => setOutcome(e.target.value as MockEntry['outcome'])}>
              {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Feedback / what to fix">
          <Textarea
            placeholder="Interviewer said… / I bombed on… / next time I will…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            autoFocus
          />
        </Field>
      </div>
    </Modal>
  );
}
