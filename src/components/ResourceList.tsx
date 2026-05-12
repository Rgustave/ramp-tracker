import type { ResourceEntry, ResourceLink } from '../types';
import { getResource } from '../data/seed';
import { Badge } from './ui/primitives';

type Props = {
  // Either pass one or more keys, or an inline list of pre-resolved entries.
  keys?: Array<string | undefined>;
  entries?: Array<{ heading?: string; entry: ResourceEntry }>;
  variant?: 'inline' | 'compact';
};

export function ResourceList({ keys, entries, variant = 'inline' }: Props) {
  const resolved: Array<{ heading?: string; entry: ResourceEntry }> = [];
  if (entries) resolved.push(...entries);
  if (keys) {
    for (const k of keys) {
      const e = getResource(k);
      if (e) resolved.push({ heading: k, entry: e });
    }
  }
  if (resolved.length === 0) return null;

  return (
    <div className={variant === 'compact' ? 'space-y-3' : 'space-y-4'}>
      {resolved.map(({ heading, entry }, i) => (
        <div key={i} className="space-y-2">
          {heading ? (
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {heading}
            </div>
          ) : null}
          {entry.conceptSummary ? (
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {entry.conceptSummary}
            </p>
          ) : null}
          <ul className="space-y-2">
            {entry.resources.map((r, idx) => (
              <li key={idx}>
                <ResourceRow link={r} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ResourceRow({ link }: { link: ResourceLink }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/60">
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
      >
        → {link.title}
      </a>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <Badge tone="default">{prettyType(link.type)}</Badge>
        {link.cost ? <Badge tone={link.cost === 'free' ? 'success' : 'warn'}>{link.cost}</Badge> : null}
        {link.estimatedMinutes ? (
          <Badge tone="info">~{formatMinutes(link.estimatedMinutes)}</Badge>
        ) : null}
      </div>
      {link.whyThisOne ? (
        <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {link.whyThisOne}
        </p>
      ) : null}
    </div>
  );
}

function prettyType(t: string): string {
  return t.replace(/_/g, ' ');
}

function formatMinutes(m: number): string {
  if (m >= 60) {
    const h = Math.round(m / 60);
    return `${h}h`;
  }
  return `${m}m`;
}
