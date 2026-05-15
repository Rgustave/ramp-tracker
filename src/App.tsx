import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SETTINGS_ID } from './data/db';
import { ensureSeeded } from './data/seed';
import { computeDayIndex } from './lib/dayIndex';
import { FirstRun } from './components/FirstRun';
import { Nav, type View } from './components/Nav';
import { Today } from './components/Today';
import { PlanView } from './components/PlanView';
import { Stories } from './components/Stories';
import { WeekReview } from './components/WeekReview';

const LOADING = Symbol('loading');

export default function App() {
  const settings = useLiveQuery(() => db.settings.get(SETTINGS_ID), [], LOADING as unknown as undefined);
  const [view, setView] = useState<View>('today');
  const [history, setHistory] = useState<View[]>([]);

  function navigate(v: View) {
    setHistory((h) => [...h, view]);
    setView(v);
  }

  function goBack() {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) setView(prev);
      return h.slice(0, -1);
    });
  }

  // If settings exists but somehow seeded=false, re-seed.
  useEffect(() => {
    if (settings && (settings as unknown) !== LOADING && !settings.seeded) {
      ensureSeeded(settings.startDate);
    }
  }, [settings]);

  if ((settings as unknown) === LOADING) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading…
      </div>
    );
  }

  if (!settings) {
    return <FirstRun onDone={() => setView('today')} />;
  }

  const dayIndex = computeDayIndex(settings.startDate);

  return (
    <div className="min-h-full">
      <Nav current={view} onChange={navigate} dayIndex={dayIndex} canGoBack={history.length > 0} onBack={goBack} />
      <main>
        {view === 'today' && <Today dayIndex={dayIndex} />}
        {view === 'week' && <WeekReview dayIndex={dayIndex} />}
        {view === 'plan' && <PlanView currentDayIndex={dayIndex} />}
        {view === 'stories' && <Stories />}
      </main>
    </div>
  );
}
