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
              {heading.startsWith('frontier.day') ? "Today's learning brief" : heading}
            </div>
          ) : null}
          {entry.conceptSummary ? (
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {entry.conceptSummary}
            </p>
          ) : null}
          {entry.learningObjectives?.length ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Learn to</div>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                {entry.learningObjectives.map((objective) => <li key={objective} className="flex gap-2"><span className="text-amber-500">—</span><span>{objective}</span></li>)}
              </ul>
            </div>
          ) : null}
          {entry.exercise ? (
            <div className="rounded-lg bg-zinc-950 p-3 text-white dark:bg-black">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">Do the work</div>
              <p className="mt-1.5 text-xs leading-5 text-zinc-200">{entry.exercise}</p>
              {entry.proofStandard ? <p className="mt-2 border-t border-zinc-800 pt-2 text-[11px] leading-4 text-zinc-400"><strong className="text-zinc-200">Done when:</strong> {entry.proofStandard}</p> : null}
            </div>
          ) : null}
          {entry.resources.length ? <div className="pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Study</div> : null}
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
