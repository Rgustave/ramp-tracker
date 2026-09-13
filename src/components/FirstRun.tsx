import { useState } from 'react';
import { ensureSeeded } from '../data/seed';
import { todayISO } from '../lib/dayIndex';
import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input } from './ui/primitives';

type Props = { onDone: () => void };

export function FirstRun({ onDone }: Props) {
  const [startDate, setStartDate] = useState<string>(todayISO());
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    await ensureSeeded(startDate);
    setBusy(false);
    onDone();
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg items-center p-6">
      <Card className="w-full overflow-hidden">
        <div className="h-1.5 bg-amber-400" />
        <CardHeader>
          <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-xs font-black text-white dark:bg-white dark:text-zinc-950">R70</div>
          <CardTitle className="text-2xl">Your interview ramp starts here.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            One question to set you up. The app's job is not to teach — it's to keep you honest about
            daily execution. Drift warnings are blunt by design.
          </p>
          <Field label="Ramp start date" hint="Day 1 begins here. You can backdate.">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Button size="lg" className="w-full" onClick={start} disabled={busy}>
            {busy ? 'Seeding…' : 'Begin Day 1'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
