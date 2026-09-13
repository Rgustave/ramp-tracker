import { cn } from '../lib/utils';
import { useTheme } from '../lib/theme';

export type View = 'today' | 'plan' | 'stories' | 'week' | 'library';

type Props = {
  current: View;
  onChange: (v: View) => void;
  dayIndex: number;
  canGoBack?: boolean;
  onBack?: () => void;
  onOpenSettings?: () => void;
};

const ITEMS: { id: View; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'plan', label: 'Plan' },
  { id: 'stories', label: 'Stories' },
  { id: 'library', label: 'Library' },
];

export function Nav({ current, onChange, dayIndex, canGoBack, onBack, onOpenSettings }: Props) {
  const { theme, toggle } = useTheme();
  return (
    <>
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-[#0b0c0e]/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            disabled={!canGoBack}
            aria-label="Go back"
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors',
              canGoBack
                ? 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                : 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
            )}
          >
            ←
          </button>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-950 text-[11px] font-black tracking-tight text-white dark:bg-white dark:text-zinc-950">R70</span>
          <div>
            <div className="text-sm font-semibold leading-none tracking-tight text-zinc-950 dark:text-white">Ramp</div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">Interview OS</div>
          </div>
          <div className="hidden h-1 w-20 overflow-hidden rounded-full bg-zinc-200 lg:block dark:bg-zinc-800">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.round((dayIndex / 70) * 100)}%` }} />
          </div>
          <span className="hidden text-xs font-medium text-zinc-500 lg:inline">Day {dayIndex} of 70</span>
        </div>
        <div className="flex items-center gap-1 sm:hidden">
          <span className="mr-1 text-xs font-medium text-zinc-500">{dayIndex}/70</span>
          <button onClick={toggle} aria-label="Toggle theme" className="grid h-9 w-9 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">{theme === 'dark' ? '☀' : '☾'}</button>
          <button onClick={onOpenSettings} aria-label="Settings" className="grid h-9 w-9 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">⚙</button>
        </div>
        <nav className="hidden items-center gap-0.5 sm:flex">
          {ITEMS.map((it) => (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              className={cn(
                'whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold transition-all sm:px-3 sm:text-sm',
                current === it.id
                  ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
              )}
              aria-current={current === it.id ? 'page' : undefined}
            >
              {it.label}
            </button>
          ))}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings & reset"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ⚙
          </button>
        </nav>
      </div>
    </header>
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-zinc-200 bg-white/95 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,.16)] backdrop-blur-xl sm:hidden dark:border-zinc-700 dark:bg-zinc-900/95" aria-label="Primary navigation">
      {ITEMS.map((it) => <button key={it.id} onClick={() => onChange(it.id)} aria-current={current === it.id ? 'page' : undefined} className={cn('rounded-xl px-1 py-2 text-[11px] font-semibold transition', current === it.id ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'text-zinc-500 dark:text-zinc-400')}>{it.label}</button>)}
    </nav>
    </>
  );
}
