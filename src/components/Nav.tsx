import { cn } from '../lib/utils';
import { useTheme } from '../lib/theme';

export type View = 'today' | 'plan' | 'stories' | 'week';

type Props = {
  current: View;
  onChange: (v: View) => void;
  dayIndex: number;
  canGoBack?: boolean;
  onBack?: () => void;
};

const ITEMS: { id: View; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'plan', label: 'Plan' },
  { id: 'stories', label: 'Stories' },
];

export function Nav({ current, onChange, dayIndex, canGoBack, onBack }: Props) {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
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
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Ramp Tracker
          </span>
          <span className="hidden text-xs text-zinc-500 sm:inline">Day {dayIndex} / 70</span>
        </div>
        <nav className="flex items-center gap-1">
          {ITEMS.map((it) => (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                current === it.id
                  ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
              )}
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
        </nav>
      </div>
    </header>
  );
}
